#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget: Stop All Services (visible terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
bash "$HOME/stop-all.sh"
echo ""
read -r -p "Press Enter to close…" _ 2>/dev/null || true
