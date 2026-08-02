#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget: Hermes Dashboard — ensure :9119 up, then open (visible terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
if curl -sf -o /dev/null -m 3 http://127.0.0.1:9119/; then
  echo "✓ Hermes Dashboard already up at :9119"
else
  echo "→ starting hermes dashboard…"
  cd "$HOME/hermes-agent" && source venv/bin/activate
  nohup hermes dashboard --port 9119 --host 127.0.0.1 --skip-build --no-open >> "$HOME/logs/hermes/hermes.log" 2>&1 &
  disown 2>/dev/null
  sleep 10
fi
if curl -sf -o /dev/null -m 3 http://127.0.0.1:9119/; then
  termux-open-url "http://127.0.0.1:9119" 2>/dev/null || true
  echo "✓ opened http://127.0.0.1:9119"
else
  echo "✗ hermes dashboard not responding — check: tail ~/logs/hermes/hermes.log"
fi
read -r -p "Press Enter to close…" _ 2>/dev/null || true
