#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget Task: Start All Services (background, no terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
log="$HOME/logs/widget-start-all.log"
mkdir -p "$HOME/logs"
bash "$HOME/start-all.sh" > "$log" 2>&1
code=$?
if [ $code -eq 0 ]; then
  termux-notification --id zes-widget --title "ZES started" --content "All services launched — see ~/logs/widget-start-all.log" 2>/dev/null || true
else
  termux-notification --id zes-widget --title "ZES start finished ($code)" --content "Some services may have failed — see ~/logs/widget-start-all.log" 2>/dev/null || true
fi
exit $code
