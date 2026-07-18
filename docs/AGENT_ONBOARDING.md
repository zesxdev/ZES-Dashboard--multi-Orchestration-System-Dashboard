# ZES System — New Agent Onboarding

> Give this to any new Codex/Hermes/OpenClaude agent to bootstrap 
> their understanding of the ZES stack in under 60 seconds.

---

## Who You Are

You are operating inside **ZES System v2** — a unified AI orchestration 
platform running on Termux/Android. Four agents share this environment:

| Agent | Role | Port | Config |
|-------|------|------|--------|
| **Codex** (you) | Coding, file editing, repo mgmt | 5900 | `~/.codex/config.toml` |
| **Hermes** | Memory curation, chat UI, plugins | 9119 | `~/.hermes/config.yaml` |
| **OpenClaude** | Terminal UI, slash commands | 50051 | `~/openclaude/` |
| **9Router** | AI gateway, proxy, key mgmt | 20128 | `~/.9router/` |

## Where Things Live

```
~/Documents/Codex/2026-07-12/system-status/   ← Current project (dashboard, scripts, docs)
  ├── src/                                      ← React dashboard (Vite + shadcn)
  ├── scripts/                                  ← start-all.sh, stop-all.sh, cleanup.sh
  ├── hermes-agent/                             ← Hermes agent code (vendor mirror)
  │   └── plugins/memory/zes_memory/            ← ZES Memory Hub plugin
  ├── docs/                                     ← Documentation
  ├── start-all.sh                              ← Admin launcher (delegates to scripts/)
  ├── stop-all.sh                               ← Admin stopper
  └── .env                                      ← Points to: ~/.secure-credentials/master.env
```

## Critical Paths

- **Memory Hub DB:** `~/.zes/memory_hub.sqlite` (31 memories stored)
- **Secrets:** `~/.secure-credentials/master.env` (75+ auth vars)
- **Logs:** `~/logs/<service>/<service>.log` (symlinked at `./logs/`)
- **PIDs:** `~/logs/<service>/<service>.pid`
- **9Router DB:** `~/.9router/db/data.sqlite`
- **Git Remote:** `git@github.com:zesxdev/ZES-Systemv2.git`

## Quick Commands

```bash
# Start everything
bash start-all.sh                    # or: ENABLE_TOR=1 bash start-all.sh
bash start-all.sh --with-tor        # with Tor SOCKS5 proxy

# Stop everything
bash stop-all.sh

# Load secrets (for manual use)
set -a; source ~/.secure-credentials/master.env; set +a

# Check service health
curl http://127.0.0.1:20128/api/health   # 9Router
curl http://127.0.0.1:9119/              # Hermes
curl http://127.0.0.1:5173/              # Dashboard
curl http://127.0.0.1:5900/              # Codex

# Log rotation
bash scripts/rotate-logs.sh --days=7

# Cleanup loose files
bash scripts/cleanup.sh --dry-run
```

## Memory Hub — How to Read/Write

The ZES Memory Hub stores cross-agent memories in SQLite with FTS5 search.

```python
from plugins.memory.zes_memory.store import MemoryStore

store = MemoryStore()
store.initialize()

# Read all memories
store.search("")  # returns list of entries

# Search with FTS5
store.search("deployment config", limit=5)

# Write a memory
store.insert({
    "content": "Your memory content here",
    "type": "decision",       # preference | decision | pattern | fact | feedback
    "scope": "project",       # project | personal | global
    "priority": "high",       # high | medium | low
    "source": "codex",
    "tags": "deployment,config"
})
```

## Architecture TL;DR

```
Codex ──→ Hermes ←── OpenClaude
            │
            ▼
    ZES Memory Hub (SQLite + FTS5)
            │
            ▼
      9Router AI Gateway ←── Tor SOCKS5 proxy
            │
            ▼
   LLM Providers (OpenAI, Anthropic, Gemini, OpenCode Zen, etc.)
```

## Important Notes for Agents

1. **Always source secrets first** — `source ~/.secure-credentials/master.env`
2. **Memory is shared** — What you write is visible to Hermes and OpenClaude
3. **Don't create loose files** — Use `scripts/cleanup.sh` to tidy up
4. **Log everything** — Service logs go to `~/logs/<svc>/<svc>.log`
5. **Git push** — Remote is `zesxdev/ZES-Systemv2` on GitHub
6. **Tor proxy** — Available at `socks5://127.0.0.1:9050`, linked to OpenCode Free
7. **9Router restart needed** after config changes: `sv restart 9router`
