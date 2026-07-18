#!/data/data/com.termux/files/usr/bin/bash
# ═══════════════════════════════════════════════════════════
#  ZES System v2 — Unified Service Stopper
#  Graceful stop → force kill → stale process scrub
# ═══════════════════════════════════════════════════════════
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok_msg()  { echo -e "  ${GREEN}✓ STOPPED${NC} $1"; }
fail_msg(){ echo -e "  ${YELLOW}— NOT RUNNING${NC} $1"; }

PID_DIR="$HOME/logs"

echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${CYAN}   ZES System v2 — Stopping All Services ${NC}"
echo -e "${CYAN}   $(date)${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo ""

# ── Helper: stop a service by PID file ──
stop_svc() {
  local name="$1" pid_file="$2" graceful_wait="${3:-2}"
  if [ ! -f "$pid_file" ]; then
    fail_msg "$name (no PID file)"
    return
  fi
  local pid
  pid=$(cat "$pid_file")
  if ! kill -0 "$pid" 2>/dev/null; then
    fail_msg "$name (PID $pid not found)"
    rm -f "$pid_file"
    return
  fi
  kill "$pid" 2>/dev/null
  sleep "$graceful_wait"
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
    ok_msg "$name (was PID $pid — force killed)"
  else
    ok_msg "$name (was PID $pid — graceful stop)"
  fi
  rm -f "$pid_file"
}

# ── Stop in reverse dependency order ──

echo -e "${CYAN}── Memory & Sync ──${NC}"
stop_svc "Hermes Monitor"       "$PID_DIR/hermes-monitor/hermes-monitor.pid"
stop_svc "Memory Sync Daemon"   "$PID_DIR/memory-sync/memory-sync.pid"

echo -e "${CYAN}── Agent Services ──${NC}"
stop_svc "OpenClaude (gRPC)"    "$PID_DIR/openclaude/openclaude.pid" 5
pkill -f "bun.*dev:grpc" 2>/dev/null || true

stop_svc "ZES User Dashboard"   "$PID_DIR/zes-user/zes-user.pid"
stop_svc "Hermes Dashboard"     "$PID_DIR/hermes/hermes.pid"

echo -e "${CYAN}── Dashboard Stack ──${NC}"
stop_svc "Vite Dashboard (:5173)" "$PID_DIR/dashboard/dashboard.pid"
stop_svc "Bridge Server (:5300)"  "$PID_DIR/bridge/bridge.pid"
stop_svc "Flask API (:5002)"      "$PID_DIR/flask/flask.pid"

echo -e "${CYAN}── Core AI Services ──${NC}"
stop_svc "9Router (:20128)"        "$PID_DIR/9router/9router.pid"
pkill -f "node.*9router.*server" 2>/dev/null || true

stop_svc "Codex app-server"      "$PID_DIR/codex/codex.pid"
pkill -f "codex app-server" 2>/dev/null || true

# ── Aggressive stale process cleanup ──
echo ""
echo -e "${CYAN}── Stale Process Scrub ──${NC}"
STALE_PATTERNS=(
  "node.*vite"
  "python3.*api/server"
  "node.*bridge"
  "python3.*codex_sync"
  "python3.*hermes_monitor"
  "python3.*memory_sync"
)
cleaned=0
for pattern in "${STALE_PATTERNS[@]}"; do
  for pid in $(pgrep -f "$pattern" 2>/dev/null); do
    kill "$pid" 2>/dev/null
    sleep 0.5
    kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true
    ((cleaned++))
  done
done
[ "$cleaned" -gt 0 ] && echo "  Cleaned $cleaned stale processes" || echo "  No stale processes found"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ All ZES services stopped${NC}"
echo -e "${GREEN}  📁 Logs preserved in ~/logs/<service>/<service>.log${NC}"
echo -e "${GREEN}  🧹 Run ~/cleanup.sh to tidy loose files${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
