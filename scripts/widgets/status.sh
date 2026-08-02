#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget: Service Status (visible terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
SVDIR=/data/data/com.termux/files/usr/var/service
echo "════════ ZES STATUS ════════"
echo ""
echo "── runsv services ──"
for d in "$SVDIR"/*/; do
  name=$(basename "$d")
  st=$(sv status "$d" 2>/dev/null | awk -F': ' '{print $1}')
  printf "  %-20s %s\n" "$name" "${st:-unknown}"
done
echo ""
echo "── port probes ──"
# spec = name:port:path
for spec in "BitRouter:4356:/v1/models" "Codex UI:5900:/" "Claude Proxy:5905:/v1/me" "ZES Dash:5051:/" "Hermes Dash:9119:/" "Collector:4319:/metrics" "9Router:20128:/"; do
  name="${spec%%:*}"; rest="${spec#*:}"; port="${rest%%:*}"; path="${rest#*:}"
  if curl -sf -o /dev/null -m 2 "http://127.0.0.1:$port$path"; then
    printf "  %-14s :%-6s ✓ up\n" "$name" "$port"
  else
    printf "  %-14s :%-6s ✗ down\n" "$name" "$port"
  fi
done
echo ""
read -r -p "Press Enter to close…" _ 2>/dev/null || true
