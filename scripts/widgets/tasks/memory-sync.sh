#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget Task: Memory bridge cron (background)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
out=$(zes-memory-bridge cron 2>&1)
code=$?
termux-notification --id zes-mem --title "ZES Memory Sync" --content "$(echo "$out" | grep -E '✓|✗' | tail -1)" 2>/dev/null || true
exit $code
