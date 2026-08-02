#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget: Memory Bridge sync (import → export) (visible terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
echo "── ZES Memory Sync ──"
zes-memory-bridge cron
echo ""
read -r -p "Press Enter to close…" _ 2>/dev/null || true
