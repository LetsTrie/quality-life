#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$ROOT_DIR/qlife-infra/terraform"
SERVER_DIR="$ROOT_DIR/qlife-server"
ADMIN_DIR="$ROOT_DIR/qlife-admin"

log() { printf "%s %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

AWS_CLI=""
if [[ -x "$HOME/.local/bin/aws2" ]]; then
  AWS_CLI="$HOME/.local/bin/aws2"
elif command -v aws >/dev/null 2>&1; then
  AWS_CLI="aws"
else
  die "AWS CLI not found. Install AWS CLI (or ensure $HOME/.local/bin/aws2 exists)."
fi

DEPLOY_INFRA=0
AUTO_APPROVE=0
DEPLOY_SERVER=1
DEPLOY_ADMIN=1
WRITE_ADMIN_ENV=1

usage() {
  cat <<'EOF'
Usage: ./deploy.sh [options]

Deploy QLife server (Elastic Beanstalk) + admin (Next.js) in one go.

Options:
  --infra           Run `terraform apply` before deploying apps
  --auto-approve    Pass -auto-approve to terraform apply (only with --infra)
  --server-only     Deploy only the server
  --admin-only      Deploy only the admin
  --no-admin-env    Don't write qlife-admin/.env.production.local
  -h, --help        Show help

Required env vars:
  AWS_PROFILE             AWS CLI/Terraform profile (e.g. sakib-personal)

Optional env vars:
  AWS_DEFAULT_REGION      Defaults to ap-south-1 if not set
  QLIFE_API_BASE_URL      If set, used for admin NEXT_PUBLIC_API_BASE_URL
  QLIFE_DB_PASSWORD_PARAM Override SSM param name for DB password (SecureString)
  QLIFE_DB_PASSWORD_VALUE If param doesn't exist, create it with this value (otherwise you'll be prompted)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --infra) DEPLOY_INFRA=1; shift ;;
    --auto-approve) AUTO_APPROVE=1; shift ;;
    --server-only) DEPLOY_SERVER=1; DEPLOY_ADMIN=0; shift ;;
    --admin-only) DEPLOY_SERVER=0; DEPLOY_ADMIN=1; shift ;;
    --no-admin-env) WRITE_ADMIN_ENV=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1 (run with --help)";;
  esac
done

[[ -n "${AWS_PROFILE:-}" ]] || die "AWS_PROFILE is required (e.g. export AWS_PROFILE=sakib-personal)"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-ap-south-1}"

need_cmd terraform
need_cmd zip
need_cmd npm
need_cmd python3

tfvars_get() {
  local key="$1"
  python3 - "$key" "$INFRA_DIR/terraform.tfvars" <<'PY'
import re
import sys
from pathlib import Path

key = sys.argv[1]
path = Path(sys.argv[2])
text = path.read_text(encoding="utf-8")

# Match: key = "value"  (simple tfvars string values)
pattern = re.compile(r'^\s*' + re.escape(key) + r'\s*=\s*"([^"]*)"\s*$', re.M)
m = pattern.search(text)
print(m.group(1) if m else "")
PY
}

validate_rds_password() {
  local pw="$1"
  [[ -n "$pw" ]] || die "DB password cannot be empty"
  if [[ "$pw" == *"@"* || "$pw" == *"/"* || "$pw" == *"\""* || "$pw" == *" "* ]]; then
    die "DB password contains a forbidden character. RDS forbids: @ / \" and space."
  fi
}

ensure_db_password_param() {
  local name_prefix param pw
  name_prefix="$(tfvars_get name_prefix)"
  if [[ -z "${QLIFE_DB_PASSWORD_PARAM:-}" ]]; then
    [[ -n "$name_prefix" ]] || die "Couldn't read name_prefix from terraform.tfvars; set QLIFE_DB_PASSWORD_PARAM explicitly."
    param="/qlife/${name_prefix}/db_password"
  else
    param="$QLIFE_DB_PASSWORD_PARAM"
  fi

  log "Ensuring SSM parameter exists: $param"

  if "$AWS_CLI" ssm get-parameter --name "$param" --with-decryption >/dev/null 2>&1; then
    export TF_VAR_db_password_ssm_parameter_name="$param"
    return 0
  fi

  pw="${QLIFE_DB_PASSWORD_VALUE:-}"
  if [[ -z "$pw" ]]; then
    echo "SSM parameter $param not found. Enter a new DB password (input hidden)."
    read -r -s -p "DB password: " pw
    echo
  fi
  validate_rds_password "$pw"

  "$AWS_CLI" ssm put-parameter \
    --name "$param" \
    --type SecureString \
    --value "$pw" \
    --overwrite >/dev/null

  export TF_VAR_db_password_ssm_parameter_name="$param"
}

tf_out_raw() {
  (cd "$INFRA_DIR" && terraform output -raw "$1")
}

tf_out_optional() {
  # Prints output value if present and non-null, else prints empty string.
  (cd "$INFRA_DIR" && terraform output -json 2>/dev/null) | python3 - "$1" <<'PY'
import json
import sys

key = sys.argv[1]
try:
    j = json.load(sys.stdin)
    v = j.get(key, {}).get("value", None)
    if v is None:
        print("")
    elif isinstance(v, bool):
        print("true" if v else "false")
    else:
        print(v)
except Exception:
    print("")
PY
}

current_lock_who() {
  # Match Terraform "Who:" field format used in lock info.
  local user host
  user="$(whoami)"
  host="$(scutil --get LocalHostName 2>/dev/null || hostname)"
  printf "%s@%s" "$user" "$host"
}

lock_owned_by_me() {
  local lock_who="$1"
  local me="$2"

  # Terraform on macOS often records hosts as "<LocalHostName>.local".
  # Treat "<me>" and "<me>.local" (or other fqdn suffix) as equivalent.
  [[ "$lock_who" == "$me" ]] && return 0
  [[ "$lock_who" == "$me".local ]] && return 0
  [[ "$me" == "$lock_who".local ]] && return 0
  [[ "$lock_who" == "$me".* ]] && return 0
  [[ "$me" == "$lock_who".* ]] && return 0

  # Fallback: compare after stripping a single trailing ".local"
  if [[ "${lock_who%.local}" == "${me%.local}" ]]; then
    return 0
  fi

  return 1
}

terraform_apply_with_lock_repair() {
  local approve_args=()
  local out tmp lock_id lock_who me
  me="$(current_lock_who)"

  if [[ "$AUTO_APPROVE" -eq 1 ]]; then
    approve_args+=("-auto-approve")
  fi

  tmp="$(mktemp)"
  trap 'rm -f "$tmp"' RETURN

  set +e
  (cd "$INFRA_DIR" && terraform apply -input=false -lock-timeout=60s "${approve_args[@]}") 2>&1 | tee "$tmp"
  out="${PIPESTATUS[0]}"
  set -e

  if [[ "$out" -eq 0 ]]; then
    return 0
  fi

  if rg -q "Your account must be verified before you can add new CloudFront resources" "$tmp"; then
    log "CloudFront is blocked for this AWS account. Retrying Terraform apply with enable_cloudfront=false."
    (cd "$INFRA_DIR" && terraform apply -input=false -lock-timeout=60s "${approve_args[@]}" -var="enable_cloudfront=false")
    return $?
  fi

  if ! rg -q "Error acquiring the state lock" "$tmp"; then
    return "$out"
  fi

  # Extract Lock Info fields (best effort).
  lock_id="$(rg -o "ID:\\s+([a-f0-9-]{8,})" -r '$1' "$tmp" | head -1 || true)"
  lock_who="$(rg -o "Who:\\s+(.+)$" -r '$1' "$tmp" | head -1 || true)"

  if [[ -z "$lock_id" ]]; then
    die "Terraform state lock error, but couldn't parse lock ID. See output above."
  fi

  if [[ -n "$lock_who" ]] && ! lock_owned_by_me "$lock_who" "$me"; then
    die "Terraform state is locked by '$lock_who' (not this session '$me'). Refusing to force-unlock automatically. If you're sure it's stale, run: (cd qlife-infra/terraform && terraform force-unlock -force $lock_id)"
  fi

  # No terraform process should be running locally; if it is, don't force unlock.
  if ps -ax | rg -q "terraform (apply|plan)"; then
    die "A terraform process is still running locally; not force-unlocking. Stop it, then retry."
  fi

  log "Detected stale Terraform lock ($lock_id). Force-unlocking and retrying once."
  (cd "$INFRA_DIR" && terraform force-unlock -force "$lock_id")

  (cd "$INFRA_DIR" && terraform apply -input=false -lock-timeout=60s "${approve_args[@]}")
}

deploy_infra() {
  ensure_db_password_param
  log "Applying Terraform (infra)."
  (cd "$INFRA_DIR" && terraform init -input=false >/dev/null)
  terraform_apply_with_lock_repair
}

write_admin_env() {
  local api_base user_pool client_id
  api_base="${QLIFE_API_BASE_URL:-}"
  if [[ -z "$api_base" ]]; then
    # Prefer API CloudFront (HTTPS). If CloudFront is disabled, fall back to EB (HTTP).
    local api_cf
    api_cf="$(tf_out_optional api_cloudfront_domain)"
    if [[ -n "$api_cf" ]]; then
      api_base="https://$api_cf"
    else
      api_base="http://$(tf_out_raw eb_cname)"
    fi
  fi
  log "Writing admin env to qlife-admin/.env.production.local"
  cat >"$ADMIN_DIR/.env.production.local" <<EOF
NEXT_PUBLIC_API_BASE_URL=$api_base
EOF
}

deploy_server() {
  local app env bucket key label bundle
  app="$(tf_out_raw eb_application_name)"
  env="$(tf_out_raw eb_environment_name)"
  bucket="$(tf_out_raw assets_bucket_name)"

  label="server-$(date +%Y%m%d-%H%M%S)"
  if command -v git >/dev/null 2>&1 && git -C "$ROOT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
    label="server-$(git -C "$ROOT_DIR" rev-parse --short HEAD)-$(date +%Y%m%d-%H%M%S)"
  fi

  log "Building server (npm ci + npm run build)."
  (cd "$SERVER_DIR" && npm ci)
  (cd "$SERVER_DIR" && npm run build)

  bundle="/tmp/${label}.zip"
  key="deployments/server/${label}.zip"

  log "Creating EB bundle: $bundle"
  rm -f "$bundle"
  (
    cd "$SERVER_DIR"
    # Keep bundle small: no node_modules, but include dist + prisma + EB config files.
    zip -qr "$bundle" \
      dist prisma package.json package-lock.json Procfile .ebextensions \
      -x "node_modules/*" "dist/**/*.map"
  )

  log "Uploading bundle to s3://$bucket/$key"
  "$AWS_CLI" s3 cp "$bundle" "s3://$bucket/$key" --only-show-errors

  log "Creating EB application version: $label"
  "$AWS_CLI" elasticbeanstalk create-application-version \
    --application-name "$app" \
    --version-label "$label" \
    --source-bundle "S3Bucket=$bucket,S3Key=$key" \
    --process >/dev/null

  log "Updating EB environment to version: $label"
  "$AWS_CLI" elasticbeanstalk update-environment \
    --environment-name "$env" \
    --version-label "$label" >/dev/null

  # Best-effort wait (not all CLIs include the waiter)
  if "$AWS_CLI" elasticbeanstalk wait environment-updated --environment-name "$env" >/dev/null 2>&1; then
    log "EB environment updated."
  else
    log "EB update started (no waiter available). Check status in AWS Console if needed."
  fi

  log "Server deploy complete. EB CNAME: $(tf_out_raw eb_cname)"
}

deploy_admin() {
  local bucket dist_id domain website_url
  bucket="$(tf_out_raw admin_bucket_name)"
  dist_id="$(tf_out_optional admin_cloudfront_distribution_id)"
  domain="$(tf_out_optional admin_cloudfront_domain)"
  website_url="$(tf_out_optional admin_website_url)"

  log "Building admin (npm ci + npm run build)."
  (cd "$ADMIN_DIR" && npm ci)
  (cd "$ADMIN_DIR" && npm run build)

  log "Syncing admin static files to s3://$bucket/"
  "$AWS_CLI" s3 sync "$ADMIN_DIR/out" "s3://$bucket/" --delete --only-show-errors

  if [[ -n "$dist_id" ]]; then
    log "Invalidating CloudFront cache (admin): $dist_id"
    "$AWS_CLI" cloudfront create-invalidation --distribution-id "$dist_id" --paths "/*" >/dev/null
    log "Admin deploy complete. URL: https://$domain"
  else
    log "Admin deploy complete (no CloudFront). URL: $website_url"
  fi
}

main() {
  if [[ "$DEPLOY_INFRA" -eq 1 ]]; then
    deploy_infra
  fi

  # Validate we can read required outputs (ensures terraform init has happened)
  tf_out_raw assets_bucket_name >/dev/null

  if [[ "$WRITE_ADMIN_ENV" -eq 1 ]]; then
    write_admin_env
  fi

  if [[ "$DEPLOY_SERVER" -eq 1 ]]; then
    deploy_server
  fi

  if [[ "$DEPLOY_ADMIN" -eq 1 ]]; then
    deploy_admin
  fi

  log "All done."
}

main

