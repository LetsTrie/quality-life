#!/usr/bin/env bash
# Run the Flutter app on the best available Android device (USB or wireless).
#
# Usage:
#   ./run.sh                 # auto-detect device + LAN API URL
#   ./run.sh --release       # pass extra args to flutter run
#   QLIFE_API_BASE_URL=http://192.168.0.104:5012 ./run.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log() { printf '▸ %s\n' "$*" >&2; }
die() { printf '✖ %s\n' "$*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' not found in PATH."
}

# --- API base URL (phone must reach this host:port) ----------------------------

detect_lan_ip() {
  local iface ip
  for iface in en0 en1 en2; do
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [[ -n "$ip" ]]; then
      echo "$ip"
      return 0
    fi
  done
  return 1
}

resolve_api_base_url() {
  if [[ -n "${QLIFE_API_BASE_URL:-}" ]]; then
    echo "$QLIFE_API_BASE_URL"
    return
  fi

  local lan_ip
  if lan_ip="$(detect_lan_ip)"; then
    echo "http://${lan_ip}:5012"
    return
  fi

  echo "http://127.0.0.1:5012"
}

# --- ADB device discovery ----------------------------------------------------

adb_serials() {
  adb devices 2>/dev/null | awk 'NR>1 && $2=="device" { print $1 }'
}

device_responds() {
  local serial="$1"
  adb -s "$serial" shell getprop ro.build.version.sdk >/dev/null 2>&1
}

device_label() {
  local serial="$1"
  local model sdk
  model="$(adb -s "$serial" shell getprop ro.product.model 2>/dev/null | tr -d '\r')"
  sdk="$(adb -s "$serial" shell getprop ro.build.version.sdk 2>/dev/null | tr -d '\r')"
  printf '%s (Android API %s)' "${model:-unknown}" "${sdk:-?}"
}

# Prefer IP:port wireless serials — Flutter/ADB handle them reliably.
device_score() {
  local serial="$1"
  if [[ "$serial" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+$ ]]; then
    echo 100
  elif [[ "$serial" != *" "* && "$serial" != *"("* && "$serial" != *"_adb-tls-connect"* ]]; then
    echo 80
  elif [[ "$serial" == *"_adb-tls-connect"* ]]; then
    echo 20
  else
    echo 10
  fi
}

connect_mdns_devices() {
  # adb mdns services lines look like:
  #   adb-XXXX (2)  _adb-tls-connect._tcp  192.168.0.106:39057
  local line ipport
  while read -r line; do
    ipport="$(echo "$line" | awk '{print $NF}')"
    if [[ "$ipport" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+$ ]]; then
      log "Trying wireless device at $ipport …"
      adb connect "$ipport" >/dev/null 2>&1 || true
    fi
  done <<EOF
$(adb mdns services 2>/dev/null | grep '_adb-tls-connect._tcp' || true)
EOF
}

collect_serials() {
  # Writes one serial per line to stdout.
  adb_serials
}

pick_best_from_serials() {
  local serial score best="" best_score=-1
  while IFS= read -r serial; do
    [[ -z "$serial" ]] && continue
    if ! device_responds "$serial"; then
      log "Skipping unresponsive device: $serial"
      continue
    fi
    score="$(device_score "$serial")"
    if [[ "$score" -gt "$best_score" ]]; then
      best="$serial"
      best_score="$score"
    fi
  done
  echo "$best"
}

ensure_adb_ready() {
  require_cmd adb
  adb start-server >/dev/null 2>&1 || true
}

pick_device() {
  local best=""

  best="$(collect_serials | pick_best_from_serials)"

  if [[ -z "$best" ]]; then
    log "No ADB devices connected — scanning for wireless debugging …"
    connect_mdns_devices
    sleep 2
    best="$(collect_serials | pick_best_from_serials)"
  fi

  if [[ -z "$best" ]]; then
    log "Retrying after disconnecting stale wireless sessions …"
    adb disconnect >/dev/null 2>&1 || true
    connect_mdns_devices
    sleep 2
    best="$(collect_serials | pick_best_from_serials)"
  fi

  if [[ -z "$best" ]]; then
    die "$(cat <<EOF
No Android device found.

On your phone:
  1. Enable Developer options + USB/wireless debugging
  2. Pair/connect wireless debugging, or plug in USB
  3. Accept the RSA fingerprint prompt if shown

Then re-run: ./run.sh
EOF
)"
  fi

  echo "$best"
}

# --- Main --------------------------------------------------------------------

require_cmd flutter
ensure_adb_ready

API_BASE_URL="$(resolve_api_base_url)"
DEVICE_ID="$(pick_device)"
DEVICE_NAME="$(device_label "$DEVICE_ID")"

log "Device:  $DEVICE_NAME"
log "Serial:  $DEVICE_ID"
log "API URL: $API_BASE_URL"

if [[ "${DRY_RUN:-}" == "1" ]]; then
  log "Dry run — skipping flutter run."
  exit 0
fi

log "Running: flutter run -d $DEVICE_ID …"
echo

exec flutter run \
  --device-timeout 120 \
  -d "$DEVICE_ID" \
  --dart-define="API_BASE_URL=${API_BASE_URL}" \
  "$@"
