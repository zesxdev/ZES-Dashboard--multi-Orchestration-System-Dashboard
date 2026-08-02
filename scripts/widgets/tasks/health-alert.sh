#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget Task: Health check → notification with score
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
out=$(python3 "$HOME/Zes-System/scripts/zes-audit" 2>/dev/null)
score=$(echo "$out" | sed -n 's/^Harness health: \([0-9]*\)%$/\1/p')
down=$(echo "$out" | grep -c '^✗')
content="Harness health ${score:-?}% · ${down:-?} service(s) down"
[ "${down:-0}" = "0" ] && content="Harness health ${score:-?}% · all checks green"
termux-notification --id zes-health --title "ZES Health" --content "$content" 2>/dev/null || termux-toast "ZES health ${score:-?}%"
exit 0
