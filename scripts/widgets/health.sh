#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget: Health Check (visible terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
echo "════════ ZES HEALTH ════════"
echo ""
python3 "$HOME/Zes-System/scripts/zes-audit"
echo ""
echo "── Battery ──"
termux-battery-status 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"  {d['percentage']}% · {d['status']} · {d.get('temperature',0)/10}°C\")" 2>/dev/null || echo "  n/a"
echo ""
echo "── Disk (home) ──"
df -h "$HOME" 2>/dev/null | tail -1 | awk '{print "  used "$3" / "$2" ("$5")"}'
echo ""
echo "── RAM ──"
free -h 2>/dev/null | sed -n '2p' | awk '{print "  used " $3 " / " $2}'
echo ""
read -r -p "Press Enter to close…" _ 2>/dev/null || true
