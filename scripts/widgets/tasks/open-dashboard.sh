#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget Task: ensure :5051 up, then open dashboard in browser (background)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
if ! curl -sf -o /dev/null -m 3 http://127.0.0.1:5051/; then
  sv start /data/data/com.termux/files/usr/var/service/zes-dashboard 2>/dev/null || true
  sleep 6
fi
if curl -sf -o /dev/null -m 3 http://127.0.0.1:5051/; then
  termux-open-url "http://127.0.0.1:5051" 2>/dev/null || true
  exit 0
fi
termux-notification --id zes-widget --title "ZES Dashboard" --content "Dashboard not responding on :5051" 2>/dev/null || true
exit 1
