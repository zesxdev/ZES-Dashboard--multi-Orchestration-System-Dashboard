#!/data/data/com.termux/files/usr/bin/bash
# ZES Widget: BitRouter status + restart (visible terminal)
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes/profiles/hermes_zes}"
echo "── BitRouter :4356 ──"
if curl -sf -o /dev/null -m 3 http://127.0.0.1:4356/v1/models; then
  echo "✓ running"
else
  echo "✗ down"
fi
echo ""
echo -n "Restart BitRouter? [y/N] "
read -r ans
case "$ans" in
  y|Y)
    echo "→ restarting…"
    sv down /data/data/com.termux/files/usr/var/service/bitrouter 2>/dev/null
    pkill -9 -f '[b]itrouter.orig serve' 2>/dev/null || true
    sv up /data/data/com.termux/files/usr/var/service/bitrouter 2>/dev/null
    sleep 12
    if curl -sf -o /dev/null -m 3 http://127.0.0.1:4356/v1/models; then
      echo "✓ BitRouter restarted"
    else
      echo "✗ still down — check: tail ~/logs/bitrouter/bitrouter.log"
    fi
    ;;
esac
read -r -p "Press Enter to close…" _ 2>/dev/null || true
