#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget: Dashboard — ensure :5051 up, then open (visible terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
if curl -sf -o /dev/null -m 3 http://127.0.0.1:5051/; then
  echo "✓ ZES Dashboard already up at :5051"
else
  echo "→ starting zes-dashboard…"
  sv start /data/data/com.termux/files/usr/var/service/zes-dashboard 2>/dev/null || true
  sleep 6
fi
if curl -sf -o /dev/null -m 3 http://127.0.0.1:5051/; then
  termux-open-url "http://127.0.0.1:5051" 2>/dev/null || true
  echo "✓ opened http://127.0.0.1:5051"
else
  echo "✗ dashboard not responding — check logs: tail ~/logs/zes-dashboard.log"
fi
read -r -p "Press Enter to close…" _ 2>/dev/null || true
