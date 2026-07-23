# ZES System — Unified Agent Instructions

**Version:** 3.4.0  
**Scope:** This file governs all agents operating within the ZES (ZES Enterprise System) environment. It supersedes individual AGENTS.md files where conflicts exist.

---

## 1. System Overview

ZES is a unified personal AI system running on Termux (Android). It orchestrates three primary agents — **Codex CLI**, **Hermes Agent**, and **OpenClaude** — plus supporting services (BitRouter AI Gateway, 9Router Legacy, Kanban, Dashboard).

```
┌────────────────────────────────────────────────────────────┐
│                    ZES System                               │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Codex   │  │  Hermes  │  │ OpenClaude│                 │
│  │  CLI     │  │  Agent   │  │  (OC)    │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │             │             │                        │
│       └─────────┬───┴─────────────┘                        │
│                 ▼                                           │
│       ┌─────────────────────┐                              │
│       │  BitRouter (:4356)  │  ← primary gateway            │
│       │  53 models, 4 prov  │                              │
│       └─────────┬───────────┘                              │
│                 ▼                                           │
│       ┌─────────────────────┐  ┌──────────────────┐       │
│       │  9Router (:20128)   │  │ ZES Dashboard    │       │
│       │  Legacy (deprecated)│  │ (:5051, :9119)   │       │
│       └─────────────────────┘  └──────────────────┘       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐         │
│  │ Memory   │  │ Kanban   │  │ Companies/OrgChrt│         │
│  │ Hub      │  │ Board    │  │ Budget/Strategy  │         │
│  └──────────┘  └──────────┘  └──────────────────┘         │
└────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Hermes is the memory hub** — All memories flow through ZESMemoryProvider
2. **Codex is the coding agent** — Primary for code generation, edits, repo work
3. **OpenClaude is the chat/UI agent** — Terminal UI, slash commands, tool use
4. **BitRouter is the AI gateway (primary)** — Routes LLM requests to opencode-zen, openai, anthropic, openrouter. 53 models across 4 providers. :4356
5. **9Router is legacy (fallback)** — Still at :20128 for gh/* models until BitRouter full migration
6. **Skills are shared** — Codex skills available to Hermes and vice versa
7. **Services communicate via HTTP** — REST APIs, WebSocket, file-based bridges

---

## 2. Component Roles

### Codex CLI (`~/.codex/`)
- **Primary role:** Coding agent — file editing, repo management, planning
- **Runtime:** Python, Node.js
- **Config:** `~/.codex/config.toml`
- **Memories:** `~/.codex/memories_1.sqlite` (stage1_outputs table), `~/.codex/memories/raw_memories.md`
- **Ports:** None (CLI-only, no web server)
- **Entry point:** `codex` command
- **Skills:** 44 ECC skills in `~/.codex/skills/`

### Hermes Agent (`~/Documents/Codex/2026-07-12/system-status/hermes-agent/`)
- **Primary role:** Persistent AI agent — gateway, cron, self-improvement loop
- **Runtime:** Python 3
- **Config:** `~/.hermes/config.yaml`
- **Memories:** `~/.hermes/MEMORY.md`, `~/.hermes/USER.md`, `~/.hermes/skills/`
- **Ports:** Dashboard :9119, Kanban :9119/k
- **Entry point:** `cd hermes-agent && python3 run_agent.py`
- **Plugins:** Memory providers (zes_memory, honcho, mem0, etc.), browser, context engines
- **Self-improvement:** `background_review.py` evaluates every turn, injects ZES curation prompt

### OpenClaude (`~/openclaude/`)
- **Primary role:** Terminal chat UI — multi-provider chat, slash commands, MCP tools
- **Runtime:** Node.js, Bun
- **Config:** `~/.config/openclaude/` env-based
- **Memories:** `~/openclaude/memdir/` (user/*.md, feedback/*.md, project/*.md, reference/*.md)
- **Ports:** None (CLI + terminal UI)
- **Entry point:** `bun run start` from `~/openclaude/`
- **Stack:** TypeScript strict, React + Ink, ESM

### BitRouter AI Gateway (`proot-distro debian -> /root/.bitrouter/`)
- **Primary role:** LLM request router — routes to opencode-zen, openai, anthropic, openrouter
- **Runtime:** Rust binary in proot-distro debian
- **Port:** :4356 (OpenAI-compatible endpoint)
- **Config:** `~/.bitrouter/bitrouter.yaml` (host-side copy), `/root/.bitrouter/bitrouter.yaml` (proot)
- **Keys:** `~/.secure-credentials/master.env` — 4 keys sourced by `bitrouter-start`
- **Models:** 53 live models across 4 providers
- **Policy Engine:** fingerprints (opening→flagship, after_read_file→cheap), adequacy auto-escalation
- **Entry point:** `bitrouter-start` (wraps binary with env injection)
- **Binary:** `~/.local/bin/bitrouter.orig`
- **OAuth tokens:** `/root/.local/share/bitrouter/oauth-tokens.json` (GitHub Copilot)

### 9Router AI Gateway `[LEGACY]` (`~/9router/`)
- **Primary role:** Former LLM request router — now fallback only
- **Runtime:** Node.js
- **Port:** :20128 (OpenAI-compatible endpoint) — fallback from BitRouter
- **Config:** `~/9router/.env`, `~/9router/data/`
- **Status:** Legacy — BitRouter is primary. 9Router remains as fallback for gh/* models until GitHub Copilot OAuth cleanup.

### System Dashboard (`system-status/`)
- **Primary role:** Web UI for system control, service status, memory viewer
- **Stack:** React 19 + shadcn/ui + Vite 8 + Tailwind CSS v4
- **Port:** :5173 (dev), :4173 (preview)
- **Pages:** Home, Services, Memory, Kanban, Design Studio, Settings

---

## 3. ZES Memory Hub

The ZES Memory Hub is a Hermes MemoryProvider plugin that unifies memory across all three agents.

### Architecture

**Design doc:** `docs/superpowers/specs/2026-07-14-zes-memory-hub-design.md`
**Implementation plan:** `docs/superpowers/plans/2026-07-14-zes-memory-hub-implementation.md`

```
self-improvement loop (Hermes)
  └─ spawn_background_review_thread()
      └─ Injects ZES curation prompt
          └─ Writes typed memories via memory tool
              └─ ZESMemoryProvider syncs to all stores
                  ├─ ZES SQLite (~/.zes/memory_hub.sqlite + FTS5)
                  ├─ OpenClaude memdir (typed .md files)
                  └─ HermesNative (MEMORY.md + USER.md)
                      └─ Codex raw_memories.md (background sync)
```

### Memory Types
**Key files:** `hermes-agent/plugins/memory/zes_memory/provider.py` · `hermes-agent/plugins/memory/zes_memory/store.py` · `hermes-agent/plugins/memory/zes_memory/oc_adapter.py` · `hermes-agent/plugins/memory/zes_memory/hermes_adapter.py` · `hermes-agent/plugins/memory/zes_memory/codex_sync.py`

| Type | Definition | Example |
|------|------------|---------|
| `preference` | User's explicit stylistic/config choice | "Prefers tabs over spaces" |
| `decision` | Architectural trade-off or agreed rule | "Use PostgreSQL for ACID" |
| `pattern` | Recurring bug fix or workflow shortcut | "If EADDRINUSE, kill port 3000" |
| `fact` | Immutable project truth | "Stripe webhook in .env" |
| `feedback` | Critique about agent behavior | "User hated verbose logs" |

### Priority (Conflict Resolution)
- `high` > `medium` > `low`
- Same priority → newest timestamp wins
- Source trust: HermesNative > ZES SQLite > OpenClaude

**Curated prompt:** `hermes-agent/plugins/memory/zes_memory/prompt.py`
**Background review:** `hermes-agent/agent/background_review.py`

### Sync Flow
1. **Hermes turn** → `background_review.py` evaluates → writes typed memory
2. **ZESMemoryProvider** → broadcasts to all 3 stores
3. **CodexSync background loop** (5min) → imports Codex stage1_outputs → exports ZES memories to raw_memories.md
4. **OCAdapter** → writes to OpenClaude memdir/ in parallel

---

## 4. Service Map

| Service | Port | Type | Status Check |
|---------|------|------|-------------|
| BitRouter AI Gateway | [http://localhost:4356](http://localhost:4356) | LLM proxy (primary) | `curl http://localhost:4356/v1/models` |
| 9Router AI Gateway | [http://localhost:20128](http://localhost:20128) | LLM proxy (legacy/fallback) | `curl http://localhost:20128/v1/models` |
| Hermes Dashboard | [http://localhost:9119](http://localhost:9119) | Hermes web UI | `curl http://localhost:9119/` |
| Hermes Kanban | [http://localhost:9119/kanban](http://localhost:9119/kanban) | Board UI | `curl http://localhost:9119/kanban` |
| ZES Dashboard (Next.js) | [http://localhost:5051](http://localhost:5051) | Companies, System, Topology, Services | `curl http://localhost:5051/` |
| ZES Dashboard (old) | [http://localhost:5173](http://localhost:5173) | Ancient dev dashboard | `curl http://localhost:5173/` |
| ZES Cyber Dashboard | [http://localhost:7070](http://localhost:7070) | Cyber/system status | — |
| Bridge | [http://localhost:5300](http://localhost:5300) | Service bridge | `curl http://localhost:5300/` |
| Memory Hub | SQLite `~/.zes/memory_hub.sqlite` | Unified memory store (FTS5) | `python3 -c "from plugins.memory.zes_memory.store import MemoryStore; s=MemoryStore(); s.initialize(); print(len(s.search('')))"` |
| ZES HUD | `hud` or `zes-hud` | Terminal system status overlay | `hud --once` |

---

## 5. Workflow Patterns

### Pattern A: Memory Curation (Default)
1. User chats with any agent (Codex, Hermes, OC)
2. Hermes `background_review.py` fires after turn
3. ZES curation prompt guides the fork to evaluate memory-worthiness
4. If signal found → writes typed memory → ZES syncs to all stores

### Pattern B: Cross-Agent Memory Query
1. Ask any agent: "What do you know about X?"
2. Agent calls `memory_read` tool
3. ZESMemoryProvider searches all 3 stores (FTS5 + memdir + MEMORY.md)
4. Returns deduplicated, priority-sorted results

### Pattern C: Service Orchestration
1. Dashboard shows all service statuses
2. Start/stop/restart any service from Dashboard or CLI
3. Bridged via `bridge/` directory and API calls

---

## 6. Development Conventions

### Shared Conventions (apply to ALL agents)
- **No hardcoded secrets** — use env vars or `~/.env`
- **Test before commit** — run the affected agent's test suite
- **Update AGENTS.md** when changing workflow or adding new patterns
- **Skill-first** — prefer adding a skill over modifying core agent code
- **Memory-aware** — write typed, prioritized memories with clear tags

### Code-Specific
- Follow ECC principles: Agent-First, Test-Driven (80%+), Security-First
- Use `skill-scout` before building new capabilities
- Skills live in `~/.codex/skills/` with AGENTS.md scope

### Hermes-Specific
- Never invalidate prompt cache mid-conversation
- Use `scripts/run_tests.sh` for testing
- New capability → CLI+skill → plugin → MCP → core tool (last)
- `skip_memory=True` in background review forks (avoids side effects)

### OpenClaude-Specific
- TypeScript strict, ESM, React+Ink
- `bun run build && bun run smoke && bun run check`
- No Python code without maintainer approval
- Provider changes need `docs/integrations/` updates

---

## 6.5 ZES Skill Taxonomy (29 total)

### ZES Core Skills (16 skills)

| Skill | Purpose |
|-------|---------|
| `ZES-skill-orchestrator` | Master skill discovery & routing |
| `ZES-service-orchestrator` | Service lifecycle management |
| `ZES-integration` | Cross-agent orchestration |
| `ZES-memory-ops` | Unified memory hub operations |
| `ZES-agentic-core` | Core agent behavior patterns |
| `ZES-skill-manager` | Skill lifecycle management |
| `ZES-provider-manager` | LLM provider discovery & config |
| `ZES-cost-tracker` | API cost tracking |
| `ZES-context-manager` | Context window budget management |
| `ZES-dashboard` | Dashboard building (React+shadcn) |
| `ZES-design` | Design system (DESIGN.md / Polybot theme) |
| `ZES-quality-gate` | Quality enforcement |
| `ZES-safety` | Safety checks for production |
| `ZES-benchmark` | Performance benchmarking |
| `ZES-9router` | 9Router AI Gateway management |
| `ZES-github-research` | Deep GitHub research — repos, alternatives, health eval |

### ZES Superpowers Skills (13 skills) — Rebranded from Superpowers plugin — Rebranded from Superpowers plugin

| Skill | Purpose |
|-------|---------|
| `ZES-brainstorming` | Collaborative design before implementation |
| `ZES-dispatching-parallel-agents` | Multi-agent parallel execution |
| `ZES-executing-plans` | Execute implementation plans |
| `ZES-finishing-a-development-branch` | Merge/PR/cleanup workflows |
| `ZES-receiving-code-review` | Technical review reception |
| `ZES-requesting-code-review` | Dispatch code review agents |
| `ZES-subagent-driven-development` | Plan execution via subagents |
| `ZES-systematic-debugging` | Structured bug investigation |
| `ZES-test-driven-development` | TDD workflow enforcement |
| `ZES-using-git-worktrees` | Git workspace isolation |
| `ZES-verification-before-completion` | Verification gate before claiming done |
| `ZES-writing-plans` | Plan creation for multi-step tasks |
| `ZES-writing-skills` | Skill authoring and validation |

### ECC Workflow Skills (31 skills)

| Category | Skills |
|----------|--------|
| **Core Workflow** | tdd-workflow, verification-loop, coding-standards, error-handling, strategic-compact, search-first, git-workflow |
| **Testing & QA** | browser-qa, python-testing, e2e-testing |
| **Frontend** | frontend-patterns, react-patterns, react-performance, vite-patterns, frontend-a11y |
| **Backend** | backend-patterns, api-design, fastapi-patterns, postgres-patterns, python-patterns, database-migrations, redis-patterns, docker-patterns |
| **Security** | security-review, security-scan |
| **Research** | deep-research, documentation-lookup, exa-search |
| **Project Workflow** | plan-orchestrate, repo-scan |
| **Discovery** | skill-stocktake |

### Plugin Skills (5 plugins active)
Cloudflare (9), Build Web Apps (6), Build Web Data Viz (15), CodeRabbit (1).

Use `ZES-skill-orchestrator` to discover. Use `ZES-skill-manager` to audit.

---



## 7. Quick Reference

### Service Management (runit — persists across sessions)
```bash
# Start/stop/restart/check ZES services
sv start/stop/restart/status zes-flask-api    # Flask API (:5002)
sv start/stop/restart/status zes-dashboard     # Vite Dashboard (:5173)

# Start ALL ZES services (one command)
cd ~/Documents/Codex/2026-07-12/system-status && bash start-all.sh

# External services (started separately)
cd ~/9router && node server.js                 # 9Router (:20128)
cd ~/Documents/Codex/2026-07-12/system-status/hermes-agent && python3 run_agent.py  # Hermes (:9119)
cd ~/openclaude && bun run start               # OpenClaude (:50051)
```

### Common Commands
```bash
# Start all ZES services
cd system-status && bash start-all.sh

# Check service status
sv status zes-flask-api zes-dashboard

# Check PACTs
curl http://127.0.0.1:5002/api/pacts

# Check system health
curl http://127.0.0.1:5002/api/health

# Check ZES Memory status
cd hermes-agent && python3 -c "from plugins.memory.zes_memory.cli import _cmd_status; import argparse; _cmd_status(argparse.Namespace())"

# Test ZES Memory
cd hermes-agent && PYTHONPATH=. python3 plugins/memory/zes_memory/test_store.py
```

### Key Paths
| Resource | Path |
|----------|------|
| Codex AGENTS.md | `~/.codex/AGENTS.md` |
| ZES Memory Hub | `hermes-agent/plugins/memory/zes_memory/` |
| ZES SQLite DB | `~/.zes/memory_hub.sqlite` |
| ZES PACT Data | `~/.zes/pacts/pacts.json` |
| Codex Memories DB | `~/.codex/memories_1.sqlite` |
| Codex Raw Memories | `~/.codex/memories/raw_memories.md` |
| OC Memdir | `~/openclaude/memdir/` |
| Hermes MEMORY.md | `~/.hermes/MEMORY.md` |
| Hermes Config | `~/.hermes/config.yaml` |
| 9Router Data | `~/9router/data/` |
| ZES Dashboard Source | `system-status/src/` |
| Design System | `system-status/DESIGN.md` |
| Old ZES Core (dev ref) | `~/zes-core/` |

---

## Session 2026-07-15 — LLM7 & 9Router Proxy Fix

### LLM7 Provider Config
- **Endpoint:** https://api.llm7.io/v1
- **API Key:** Stored in 9Router DB (also in master.env placeholder)
- **Models:** 15 models including gemma3:27b, codestral-latest
- **Quota:** 1M tokens/day (466 used)
- **Model prefix in 9Router:** `openai-compatible-chat-7449da40-7698-41fb-8ee2-2f4e4c95f953/<model>`
- **Auth URL:** https://token.llm7.io
- **Status:** ✅ Working after removing broken proxy link

### 9Router Proxy Pool Fix
- Free HTTP proxies (free-proxy-1, free-proxy-2) are broken/timed out
- Removed proxyPoolId from: OpenCode, OpenRouter, Mistral2, LLM7
- Cleared all model locks that were caused by proxy failures
- Clear global `providerStrategies` in settings if proxy issues persist

### Tor SOCKS5 for IP Rotation
- Tor installed but not running by default
- Enable with: `bash scripts/start-tor-proxy.sh start`
- Add to 9Router: `python3 scripts/bin/9router-add-tor-proxy.py --link-opencode`
- Auto-rotate: `bash scripts/start-ip-rotator.sh start`
- Or pass `--with-tor` / `ENABLE_TOR=1` to start-all.sh

### Gemini Key
- Old key (AIza... from arfaxtrade) replaced with new key (AQ.Ab8RN6... from arfaxredmi)
- Working with gemini-2.5-flash model
- 37 models available including gemini-3.5-flash, gemini-2.5-pro, deep-research

### Service Scripts Location
- Main scripts: `~/start-all.sh`, `~/stop-all.sh`, `~/cleanup.sh`
- Repo copies: `scripts/` directory
- Python helpers: `scripts/bin/` directory
