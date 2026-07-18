#!/data/data/com.termux/files/usr/bin/bash
# ZES Tor Proxy — SOCKS5 proxy for OpenCode Zen IP rotation
# Usage: bash ~/start-tor-proxy.sh [start|stop|status|renew-ip]
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
PID_DIR="$HOME/logs/tor-proxy"
PID_FILE="$PID_DIR/tor.pid"
LOG_FILE="$PID_DIR/tor-proxy.log"
TORRC="/data/data/com.termux/files/usr/etc/tor/torrc"
mkdir -p "$PID_DIR"

case "${1:-status}" in
  start)
    echo -e "${CYAN}Starting Tor SOCKS5 proxy...${NC}"
    if [ -f "$PID_FILE" ] && kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
      echo -e "  ${YELLOW}Tor already running (PID $(cat $PID_FILE))${NC}"
      exit 0
    fi
    if ! grep -q "^SOCKS5Port" "$TORRC" 2>/dev/null; then
      echo "SOCKS5Port 9050" >> "$TORRC"
      echo "  Added SOCKS5Port 9050 to torrc"
    fi
    tor >> "$LOG_FILE" 2>&1 &
    pid=$!
    echo $pid > "$PID_FILE"
    disown $pid 2>/dev/null
    for i in $(seq 1 10); do
      sleep 2
      ip=$(curl -sf --socks5 127.0.0.1:9050 http://httpbin.org/ip 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
      if [ -n "$ip" ]; then
        echo -e "  ${GREEN}✓ Tor proxy running (PID $pid, IP: $ip)${NC}"
        exit 0
      fi
    done
    echo -e "  ${RED}✗ Tor failed to start — check $LOG_FILE${NC}"
    ;;
  stop)
    echo -e "${CYAN}Stopping Tor proxy...${NC}"
    if [ -f "$PID_FILE" ]; then
      kill "$(cat $PID_FILE)" 2>/dev/null; sleep 2
      kill -0 "$(cat $PID_FILE)" 2>/dev/null && kill -9 "$(cat $PID_FILE)" 2>/dev/null || true
      rm -f "$PID_FILE"
      echo -e "  ${GREEN}✓ Tor stopped${NC}"
    else
      pkill tor 2>/dev/null || echo -e "  ${YELLOW}Tor not running${NC}"
    fi
    ;;
  renew-ip)
    echo -e "${CYAN}Renewing Tor IP...${NC}"
    old=$(curl -sf --socks5 127.0.0.1:9050 http://httpbin.org/ip 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    if [ -f "$PID_FILE" ]; then
      kill -HUP "$(cat $PID_FILE)" 2>/dev/null; sleep 5
      new=$(curl -sf --socks5 127.0.0.1:9050 http://httpbin.org/ip 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
      echo -e "  ${GREEN}✓ IP rotated: ${YELLOW}$old${NC} → ${GREEN}$new${NC}"
    else
      echo -e "  ${RED}✗ Tor not running${NC}"
    fi
    ;;
  status)
    if [ -f "$PID_FILE" ] && kill -0 "$(cat $PID_FILE)" 2>/dev/null; then
      ip=$(curl -sf --socks5 127.0.0.1:9050 http://httpbin.org/ip 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)
      echo -e "${GREEN}✓ Tor running (PID $(cat $PID_FILE), IP: $ip)${NC}"
    else
      echo -e "${YELLOW}— Tor not running${NC}"
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop|status|renew-ip}"
    ;;
esac
