#!/data/data/com.termux/files/usr/bin/bash
# ZES IP Rotation Daemon — rotates Tor IP every 15 minutes
# Part of start-all.sh; logs to ~/logs/tor-proxy/ip-rotator.log
# Usage: bash ~/start-ip-rotator.sh [start|stop]

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
PID_DIR="$HOME/logs/tor-proxy"
PID_FILE="$PID_DIR/ip-rotator.pid"
LOG_FILE="$PID_DIR/ip-rotator.log"
INTERVAL=900  # 15 minutes

start() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
    echo -e "  ${YELLOW}IP rotator already running${NC}"
    return
  fi
  nohup bash -c "
    while true; do
      sleep $INTERVAL
      echo \"[\$(date)] Rotating Tor IP...\" >> \"$LOG_FILE\"
      kill -HUP \$(cat \"$PID_DIR/tor.pid\") 2>/dev/null
      sleep 3
      ip=\$(curl -sf --socks5 127.0.0.1:9050 http://httpbin.org/ip 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
      echo \"[\$(date)] New IP: \$ip\" >> \"$LOG_FILE\"
    done
  " >> "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  disown $! 2>/dev/null
  echo -e "  ${GREEN}✓ IP rotator started (PID $(cat $PID_FILE), interval=${INTERVAL}s)${NC}"
}

stop() {
  if [ -f "$PID_FILE" ]; then
    kill "$(cat $PID_FILE)" 2>/dev/null
    rm -f "$PID_FILE"
    echo -e "  ${GREEN}✓ IP rotator stopped${NC}"
  fi
}

case "${1:-status}" in
  start) start ;;
  stop)  stop ;;
  status)
    if [ -f "$PID_FILE" ] && kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
      echo -e "${GREEN}✓ IP rotator running${NC}"
    else
      echo -e "${YELLOW}— IP rotator not running${NC}"
    fi
    ;;
esac
