#!/data/data/com.termux/files/usr/bin/bash
# ═══════════════════════════════════════════════════════════
#  ZES System v2 — Unified Service Launcher
#  All logs → ~/logs/<service>/<service>.log
#  PIDs     → ~/logs/<service>/<service>.pid
# ═══════════════════════════════════════════════════════════
set -e

# ── Colors ──
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok_msg()  { echo -e "  ${GREEN}✓${NC} $1"; }
fail_msg(){ echo -e "  ${RED}✗${NC} $1"; echo "$1" >> /tmp/zes-start-failures.log; }
info_msg(){ echo -e "  ${CYAN}→${NC} $1"; }

# ── Paths ──

PID_DIR="$HOME/logs"
PROJECT_DIR="$HOME/Documents/Codex/2026-07-12/system-status"

# ── 9Router env (per 9Router skill)
export NINEROUTER_URL="http://localhost:20128"
export NINEROUTER_KEY=""
ZES_HOME="$HOME/.hermes/profiles/hermes_zes"
FAIL_LOG="/tmp/zes-start-failures.log"
> "$FAIL_LOG"

# ── Source unified credentials ──

if [ -f "$HOME/.secure-credentials/master.env" ]; then
  set -a
  source "$HOME/.secure-credentials/master.env"
  set +a
  info_msg "Loaded credentials from master.env"
fi

echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${CYAN}   ZES System v2 — Starting All Services ${NC}"
echo -e "${CYAN}   $(date)${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo ""

# ── Helper: start a service ──
start_svc() {
  local name="$1" pid_file="$2" log_file="$3" health_url="$4" wait="$5" cmd="$6"
  mkdir -p "$(dirname "$pid_file")" "$(dirname "$log_file")"
  if [ -f "$pid_file" ]; then
    old_pid=$(cat "$pid_file")
    kill "$old_pid" 2>/dev/null && sleep 1 || true
  fi
  eval "$cmd" >> "$log_file" 2>&1 &
  local pid=$!
  echo $pid > "$pid_file"
  disown "$pid" 2>/dev/null
  sleep "${wait:-3}"
  if [ -n "$health_url" ]; then
    if curl -sf -o /dev/null "$health_url" 2>/dev/null; then
      ok_msg "$name (PID $pid)"
    else
      fail_msg "$name (PID $pid) — not responding at $health_url"
    fi
  else
    # No health check, just confirm process is alive
    if kill -0 "$pid" 2>/dev/null; then
      ok_msg "$name (PID $pid)"
    else
      fail_msg "$name (PID $pid) — process died immediately"
    fi
  fi
}

# ══════════════════════════════════════════
# 1. Core AI Services
# ══════════════════════════════════════════
echo -e "${CYAN}── Core AI Services ──${NC}"

# ── Codex app-server (:5900) ──
CODEX_PID_FILE="$PID_DIR/codex/codex.pid"
CODEX_LOG="$PID_DIR/codex/codex.log"
if curl -sf -o /dev/null http://127.0.0.1:5900/ 2>/dev/null; then
  ok_msg "Codex app-server (:5900) — already running"
else
  info_msg "Starting Codex app-server..."
  nohup codex app-server \
    -c approval_policy="never" \
    -c sandbox_mode="danger-full-access" \
    -c features.memories=true \
    -c model="big-pickle" \
    -c model_provider="opencode_zen" \
    -c model_providers.opencode_zen.name="OpenCode Zen" \
    -c model_providers.opencode_zen.base_url="http://127.0.0.1:5900/codex-api/zen-proxy/v1" \
    -c model_providers.opencode_zen.wire_api="responses" \
    -c model_providers.opencode_zen.experimental_bearer_token="zen-proxy-token" \
    >> "$CODEX_LOG" 2>&1 &
  echo $! > "$CODEX_PID_FILE"
  disown $! 2>/dev/null
  sleep 8
  if curl -sf -o /dev/null http://127.0.0.1:5900/ 2>/dev/null; then
    ok_msg "Codex app-server (:5900)"
  else
    fail_msg "Codex app-server (:5900) — check $CODEX_LOG for details"
  fi
fi

# ── 9Router (:20128) — through Tor SOCKS5 for IP rotation ──
start_svc "9Router (:20128)" \
  "$PID_DIR/9router/9router.pid" \
  "$PID_DIR/9router/9router.log" \
  "http://127.0.0.1:20128/api/health" 6 \
  "PORT=20128 HOSTNAME=127.0.0.1 torsocks node /data/data/com.termux/files/usr/lib/node_modules/9router/app/server.js"

# ── Hermes Agent — using ZES profile ──
start_svc "Hermes Dashboard (:9119)" \
  "$PID_DIR/hermes/hermes.pid" \
  "$PID_DIR/hermes/hermes.log" \
  "http://127.0.0.1:9119/" 5 \
  "export HERMES_HOME=$ZES_HOME && cd $HOME/hermes-agent && source venv/bin/activate && python3 -m hermes_cli.main dashboard --port 9119"

# ══════════════════════════════════════════
# 2. ZES Dashboard Stack
# ══════════════════════════════════════════
echo -e "${CYAN}── Dashboard Stack ──${NC}"

start_svc "Flask API (:5002)" \
  "$PID_DIR/flask/flask.pid" \
  "$PID_DIR/flask/flask.log" \
  "http://127.0.0.1:5002/api/health" 3 \
  "cd $PROJECT_DIR && python3 api/server.py"

start_svc "Bridge Server (:5300)" \
  "$PID_DIR/bridge/bridge.pid" \
  "$PID_DIR/bridge/bridge.log" \
  "http://127.0.0.1:5300/api/health" 3 \
  "cd $PROJECT_DIR && node bridge/server.cjs"

start_svc "ZES Dashboard (:5173)" \
  "$PID_DIR/dashboard/dashboard.pid" \
  "$PID_DIR/dashboard/dashboard.log" \
  "http://127.0.0.1:5173/" 5 \
  "cd $PROJECT_DIR && npx vite --port 5173 --host 127.0.0.1"

# ══════════════════════════════════════════
# 3. Agent Services
# ══════════════════════════════════════════
echo -e "${CYAN}── Agent Services ──${NC}"

# ── OpenClaude (gRPC) ──
OC_PID_FILE="$PID_DIR/openclaude/openclaude.pid"
OC_LOG="$PID_DIR/openclaude/openclaude.log"
if [ -f "$OC_PID_FILE" ] && kill -0 "$(cat "$OC_PID_FILE")" 2>/dev/null; then
  ok_msg "OpenClaude (gRPC) — already running"
else
  info_msg "Starting OpenClaude (gRPC)..."
  export CLAUDE_CODE_USE_OPENAI=1
  export OPENAI_API_KEY="noop-9router-proxy-key"
  export OPENAI_BASE_URL="http://localhost:20128/v1"
  export OPENAI_MODEL="oc/deepseek-v4-flash-free"
  cd "$HOME/openclaude"
  setsid proot-distro login debian -- bash -c "
    export BUN_INSTALL=\"\$HOME/.bun\"
    export PATH=\"\$BUN_INSTALL/bin:\$PATH\"
    export CLAUDE_CODE_USE_OPENAI=1
    export OPENAI_API_KEY=\"noop-9router-proxy-key\"
    export OPENAI_BASE_URL=\"http://localhost:20128/v1\"
    export OPENAI_MODEL=\"oc/deepseek-v4-flash-free\"
    cd /data/data/com.termux/files/home/openclaude
    bun run dev:grpc
  " >> "$OC_LOG" 2>&1 &
  echo $! > "$OC_PID_FILE"
  disown $! 2>/dev/null
  sleep 8
  if pgrep -f "bun.*dev:grpc" > /dev/null 2>&1; then
    ok_msg "OpenClaude (gRPC)"
  else
    fail_msg "OpenClaude (gRPC)"
  fi
fi

# ── ZES User Dashboard (:4000) ──
ZES_USER_PID_FILE="$PID_DIR/zes-user/zes-user.pid"
ZES_USER_LOG="$PID_DIR/zes-user/zes-user.log"
if curl -sf -o /dev/null http://127.0.0.1:4000/ 2>/dev/null; then
  ok_msg "ZES User Dashboard (:4000) — already running"
else
  info_msg "Starting ZES User Dashboard..."
  cd "$HOME/zes-user"
  nohup npx vite --port 4000 --host 0.0.0.0 >> "$ZES_USER_LOG" 2>&1 &
  echo $! > "$ZES_USER_PID_FILE"
  disown $! 2>/dev/null
  sleep 5
  if curl -sf -o /dev/null http://127.0.0.1:4000/ 2>/dev/null; then
    ok_msg "ZES User Dashboard (:4000)"
  else
    fail_msg "ZES User Dashboard (:4000)"
  fi
fi

# ══════════════════════════════════════════
# 4. Memory & Sync
# ══════════════════════════════════════════
echo -e "${CYAN}── Memory & Sync ──${NC}"

MEMSYNC_PID_FILE="$PID_DIR/memory-sync/memory-sync.pid"
MEMSYNC_LOG="$PID_DIR/memory-sync/memory-sync.log"
if [ -f "$MEMSYNC_PID_FILE" ] && kill -0 "$(cat "$MEMSYNC_PID_FILE")" 2>/dev/null; then
  ok_msg "ZES Memory Sync Daemon — already running"
else
  info_msg "Starting Memory Sync Daemon..."
  nohup python3 -c "
import sys, os, time
os.environ['HERMES_HOME'] = '$ZES_HOME'
sys.path.insert(0, '$HOME/hermes-agent/plugins/memory')
from zes_memory.store import MemoryStore
from zes_memory.codex_sync import CodexSync

db_path = os.path.expanduser('$HOME/.zes/memory_hub.sqlite')
store = MemoryStore(db_path)
if not store.is_healthy():
    store.initialize()

sync = CodexSync(
    store=store,
    codex_db_path=os.path.expanduser('~/.codex/memories_1.sqlite'),
    codex_raw_path=os.path.expanduser('~/.codex/memories/raw_memories.md'),
    sync_interval=120
)
sync.start()
print('ZES Memory Sync Daemon started (interval=120s)')
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    sync.shutdown()
    store.shutdown()
" >> "$MEMSYNC_LOG" 2>&1 &
  echo $! > "$MEMSYNC_PID_FILE"
  disown $! 2>/dev/null
  sleep 2
  if kill -0 "$(cat "$MEMSYNC_PID_FILE")" 2>/dev/null; then
    ok_msg "Memory Sync Daemon"
  else
    fail_msg "Memory Sync Daemon — check $MEMSYNC_LOG"
  fi
fi

# ══════════════════════════════════════════
# 5. Optional: Hermes Monitor (syncs conversations)
# ══════════════════════════════════════════
HMN_PID_FILE="$PID_DIR/hermes-monitor/hermes-monitor.pid"
HMN_LOG="$PID_DIR/hermes-monitor/hermes-monitor.log"
if [ -f "$HMN_PID_FILE" ] && kill -0 "$(cat "$HMN_PID_FILE")" 2>/dev/null; then
  ok_msg "Hermes Monitor — already running"
else
  info_msg "Starting Hermes Monitor..."
  nohup python3 -c "
import sys, os, time
os.environ['HERMES_HOME'] = '$ZES_HOME'
sys.path.insert(0, '$HOME/hermes-agent/plugins/memory')
from zes_memory.hermes_monitor import HermesMonitor
from zes_memory.store import MemoryStore

store = MemoryStore(os.path.expanduser('$HOME/.zes/memory_hub.sqlite'))
monitor = HermesMonitor(store=store)
monitor.start()
print('Hermes Monitor started')
try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    monitor.stop()
    store.shutdown()
" >> "$HMN_LOG" 2>&1 &
  echo $! > "$HMN_PID_FILE"
  disown $! 2>/dev/null
  sleep 2
  if kill -0 "$(cat "$HMN_PID_FILE")" 2>/dev/null; then
    ok_msg "Hermes Monitor"
  else
    fail_msg "Hermes Monitor — check $HMN_LOG"
  fi
fi

# ══════════════════════════════════════════
# ══════════════════════════════════════════
# 6. Tor IP Rotator (for OpenCode Zen rate limit avoidance)
# ══════════════════════════════════════════
echo -e "${CYAN}── Tor IP Rotator ──${NC}"
ROTATOR_PID_FILE="$PID_DIR/tor-rotator/tor-rotator.pid"
if [ -f "$ROTATOR_PID_FILE" ] && kill -0 "$(cat "$ROTATOR_PID_FILE")" 2>/dev/null; then
  ok_msg "Tor IP Rotator — already running"
elif [ -f "$HOME/start-ip-rotator.sh" ]; then
  info_msg "Starting Tor IP Rotator..."
  bash "$HOME/start-ip-rotator.sh" start 2>&1 | sed 's/^/  /'
else
  echo -e "  ${YELLOW}start-ip-rotator.sh not found — install: cp ~/.hermes/profiles/hermes_zes/scripts/tor-ip-rotator.py && create startup wrapper${NC}"
fi


# Summary
# ══════════════════════════════════════════
echo ""
echo -e "${CYAN}════════════════════════════════════════${NC}"
echo -e "${CYAN}   Service Status Summary${NC}"
echo -e "${CYAN}════════════════════════════════════════${NC}"
for svc in "Codex:5900" "9Router:20128" "Hermes:9119" "Flask:5002" "Bridge:5300" "Dashboard:5173" "OC:50051"; do
  name="${svc%%:*}"
  port="${svc##*:}"
  echo -n "  $name (:$port) ... "
  curl -sf -o /dev/null "http://127.0.0.1:$port/" 2>/dev/null && ok_msg "online" || fail_msg "offline"
done

if [ -s "$FAIL_LOG" ]; then
  echo ""
  echo -e "${YELLOW}Services with issues:${NC}"
  cat "$FAIL_LOG"
fi

echo ""
echo -e "${GREEN}  🔗 Quick Links:${NC}"
echo -e "${GREEN}    Main    → http://127.0.0.1:5173${NC}"
echo -e "${GREEN}    Hermes  → http://127.0.0.1:9119${NC}"
echo -e "${GREEN}    9Router → http://127.0.0.1:20128${NC}"
echo -e "${GREEN}    Codex   → http://127.0.0.1:5900${NC}"
echo -e "${GREEN}    API     → http://127.0.0.1:5002${NC}"
echo ""
echo -e "${GREEN}  ℹ️  HERMES_HOME=$ZES_HOME${NC}"
echo -e "${GREEN}  ℹ️  Logs: ~/logs/<service>/<service>.log${NC}"
echo -e "${GREEN}  ℹ️  Run ~/cleanup.sh --dry-run to preview cleanup${NC}"
