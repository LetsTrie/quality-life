#!/usr/bin/env bash
# Deploy QLife server (Railway) + admin (Vercel) from each app's .env.production.
# Optionally build a release APK for qlife-client (also reads .env.production).
#
# Usage:
#   ./deploy-production.sh                 # server + admin
#   ./deploy-production.sh --server-only
#   ./deploy-production.sh --admin-only
#   ./deploy-production.sh --client        # release APK only
#   ./deploy-production.sh --all           # server + admin + client APK
#   ./deploy-production.sh --skip-env      # deploy only, don't sync env vars to cloud
#   ./deploy-production.sh --skip-tests    # deploy without running local tests first
#
# Local tests run before any deploy starts; if they fail, nothing is deployed.
#
# Prerequisites:
#   - railway CLI logged in, qlife-server linked (cd qlife-server && railway link)
#   - vercel CLI logged in, qlife-admin linked (cd qlife-admin && vercel link)
#   - qlife-server/.env.production, qlife-admin/.env.production present
#   - qlife-client/.env.production for --client / --all
#
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/qlife-server"
ADMIN_DIR="$ROOT_DIR/qlife-admin"
CLIENT_DIR="$ROOT_DIR/qlife-client"

DEPLOY_SERVER=1
DEPLOY_ADMIN=1
DEPLOY_CLIENT=0
SKIP_ENV_SYNC=0
SKIP_TESTS=0

log() { printf "%s %s\n" "$(date '+%H:%M:%S')" "$*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --server-only) DEPLOY_SERVER=1; DEPLOY_ADMIN=0; DEPLOY_CLIENT=0; shift ;;
    --admin-only)  DEPLOY_SERVER=0; DEPLOY_ADMIN=1; DEPLOY_CLIENT=0; shift ;;
    --client)      DEPLOY_SERVER=0; DEPLOY_ADMIN=0; DEPLOY_CLIENT=1; shift ;;
    --all)         DEPLOY_SERVER=1; DEPLOY_ADMIN=1; DEPLOY_CLIENT=1; shift ;;
    --skip-env)    SKIP_ENV_SYNC=1; shift ;;
    --skip-tests)  SKIP_TESTS=1; shift ;;
    -h|--help)     usage; exit 0 ;;
    *) die "Unknown option: $1 (run with --help)";;
  esac
done

require_env_file() {
  local path="$1"
  [[ -f "$path" ]] || die "Missing $path — copy from .env.production.example and fill in values."
}

# --- Local test gate ----------------------------------------------------------
# Run each component's local tests before deploying. Any failure aborts the
# whole deploy (nothing has been pushed yet at this point).

test_server() {
  log "Running server tests (qlife-server: npm test) …"
  need_cmd npm
  ( cd "$SERVER_DIR" && npm test ) || die "Server tests failed — aborting deploy."
  log "Server tests passed."
}

test_admin() {
  # qlife-admin has no test suite; typecheck is the available local gate.
  log "Running admin checks (qlife-admin: npm run typecheck) …"
  need_cmd npm
  ( cd "$ADMIN_DIR" && npm run typecheck ) || die "Admin typecheck failed — aborting deploy."
  log "Admin checks passed."
}

test_client() {
  log "Running client tests (qlife-client: flutter test) …"
  need_cmd flutter
  ( cd "$CLIENT_DIR" && flutter test ) || die "Client tests failed — aborting deploy."
  log "Client tests passed."
}

run_tests() {
  log "Running local tests before deploy …"
  [[ "$DEPLOY_SERVER" -eq 1 ]] && test_server
  [[ "$DEPLOY_ADMIN"  -eq 1 ]] && test_admin
  [[ "$DEPLOY_CLIENT" -eq 1 ]] && test_client
  log "All local tests passed."
}

# Load KEY=VALUE pairs from a dotenv file (no export of comments/blanks).
load_env_file() {
  local file="$1"
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      export "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}"
    fi
  done < "$file"
}

# Retry flaky Railway GraphQL calls (timeouts are common on slow networks).
railway_retry() {
  local attempt=1 max=3 delay=5
  while true; do
    if "$@"; then
      return 0
    fi
    if (( attempt >= max )); then
      log "Railway command failed after $max attempts: $*"
      return 1
    fi
    log "Railway request failed (attempt $attempt/$max), retrying in ${delay}s …"
    sleep "$delay"
    attempt=$((attempt + 1))
    delay=$((delay * 2))
  done
}

sync_railway_env() {
  local env_file="$1"
  local val
  local -a pairs=()
  # Collect all non-empty KEY=VALUE pairs and set them in ONE request.
  # (One-at-a-time is slow: CLI startup + GraphQL round trip per key.)
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      val="${BASH_REMATCH[2]}"
      [[ -z "$val" ]] && continue
      pairs+=("$line")
    fi
  done < "$env_file"

  if ((${#pairs[@]} == 0)); then
    log "No Railway env vars to set."
    return 0
  fi

  if railway_retry railway variable set "${pairs[@]}" --skip-deploys; then
    log "Railway env vars updated (${#pairs[@]} keys)."
  else
    die "Failed to set Railway env vars. Set them in the Railway dashboard, then re-run with --skip-env."
  fi
}

deploy_server() {
  log "Deploying server (Railway) from qlife-server/.env.production …"
  require_env_file "$SERVER_DIR/.env.production"
  need_cmd railway

  (
    cd "$SERVER_DIR"

    if [[ "$SKIP_ENV_SYNC" -eq 0 ]]; then
      sync_railway_env ".env.production"
    else
      log "Skipping Railway env sync (--skip-env)."
    fi

    railway_retry railway up -y -d
  )

  log "Server deploy started (detached). Check Railway dashboard for build status."
}

sync_vercel_env() {
  local env_file="$1"
  local tmp
  tmp="$(mktemp)"
  # vercel env add reads values from stdin; one key at a time.
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local val="${BASH_REMATCH[2]}"
      [[ -z "$val" ]] && continue
      printf '%s' "$val" > "$tmp"
      vercel env rm "$key" production --yes 2>/dev/null || true
      vercel env add "$key" production < "$tmp" >/dev/null
      log "  Vercel env: $key"
    fi
  done < "$env_file"
  rm -f "$tmp"
}

deploy_admin() {
  log "Deploying admin (Vercel) from qlife-admin/.env.production …"
  require_env_file "$ADMIN_DIR/.env.production"
  need_cmd vercel

  (
    cd "$ADMIN_DIR"
    if [[ "$SKIP_ENV_SYNC" -eq 0 ]]; then
      sync_vercel_env ".env.production"
    else
      log "Skipping Vercel env sync (--skip-env)."
    fi
    vercel deploy --prod --yes
  )

  log "Admin deploy finished."
}

deploy_client() {
  log "Building client release APK from qlife-client/.env.production …"
  require_env_file "$CLIENT_DIR/.env.production"
  need_cmd flutter

  load_env_file "$CLIENT_DIR/.env.production"
  : "${API_BASE_URL:?API_BASE_URL missing in qlife-client/.env.production}"
  : "${COGNITO_USER_POOL_ID:?COGNITO_USER_POOL_ID missing in qlife-client/.env.production}"
  : "${COGNITO_CLIENT_ID:?COGNITO_CLIENT_ID missing in qlife-client/.env.production}"

  (
    cd "$CLIENT_DIR"
    flutter pub get
    flutter build apk --release \
      --dart-define="API_BASE_URL=${API_BASE_URL}" \
      --dart-define="COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}" \
      --dart-define="COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}"

    local apk="build/app/outputs/flutter-apk/app-release.apk"
    [[ -f "$apk" ]] || die "APK not found at $apk"
    log "Release APK: $CLIENT_DIR/$apk"
    log "Share this file for testers to install (enable 'Install unknown apps' on Android)."
  )
}

[[ "$DEPLOY_SERVER" -eq 1 || "$DEPLOY_ADMIN" -eq 1 || "$DEPLOY_CLIENT" -eq 1 ]] \
  || die "Nothing to deploy (use --help)"

if [[ "$SKIP_TESTS" -eq 0 ]]; then
  run_tests
else
  log "Skipping local tests (--skip-tests)."
fi

if [[ "$DEPLOY_SERVER" -eq 1 ]]; then deploy_server; fi
if [[ "$DEPLOY_ADMIN" -eq 1 ]]; then deploy_admin; fi
if [[ "$DEPLOY_CLIENT" -eq 1 ]]; then deploy_client; fi

log "Done."
