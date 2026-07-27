# ZES Orchestration System — Unified Agent Instructions

**Version:** 4.1.0  
**Last Updated:** 2026-07-26  

---

## 1. System Overview

ZES orchestrates three AI agents — **Codex CLI**, **Hermes Agent**, and **Claude Code** — on Termux (Android aarch64) with BitRouter as the primary AI gateway.

```
┌──────────────────────────────────────────────────────────────┐
│                     ZES System v4.1                           │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                 │
│  │  Codex   │   │  Hermes  │   │ Claude   │                 │
│  │  CLI     │   │  Agent   │   │  Code    │                 │
│  │ (coder)  │   │(memory)  │   │ (review) │                 │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                 │
│       │              │              │                        │
│       └─────────┬────┴──────────────┘                        │
│                 ▼                                             │
│       ┌──────────────────┐                                   │
│       │  BitRouter :4356  │  (primary LLM router)            │
│       │  53 models / 12   │                                   │
│       │  providers        │                                   │
│       └────────┬─────────┘                                   │
│                ▼                                              │
│       ┌──────────────────┐                                   │
│       │  OpenCode Zen     │  (free deepseek-v4-flash)        │
│       │  + other providers│                                   │
│       └──────────────────┘                                   │
│                                                              │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐     │
│  │ ZES      │   │ ZES Memory   │   │ ZES CLI Toolkit  │     │
│  │ Dashboards│   │ Hub :memory  │   │ research|batch   │     │
│  │ :5173    │   │ 52 facts     │   │ status|debug     │     │
│  │ :7070    │   │              │   │                  │     │
│  │ :4000    │   │              │   │                  │     │
│  └──────────┘   └──────────────┘   └──────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## 2. Agent Roles

| Agent | Role | Access | Port | Model |
|-------|------|--------|------|-------|
| **Codex CLI** | Primary coder | `:5900` | Web UI | `big-pickle` (OpenCode Zen) |
| **Hermes** | Orchestrator/memory | `:9119` | Dashboard | `opencode-zen:deepseek-v4-flash-free` |
| **Claude Code** | Reviewer/parallel | `:5905` | Proxy | Via BitRouter |

## 3. Provider Chain (BitRouter First)

```
Codex ──→ BitRouter (:4356) ──→ opencode-zen:deepseek-v4-flash-free (cheap)
Claude ──→ Claude Proxy (:5905) ──→ BitRouter (:4356) ──→ anthropic models
Hermes ──→ BitRouter (:4356) ──→ opencode-zen:deepseek-v4-flash-free (default)
                               └──→ openai/gpt-5.4-mini (fallback via OpenRouter)
```

## 4. Memory Architecture

```
Hermes (holographic) ──→ ZES Memory Hub (~/.zes/memory_hub.sqlite) ←── Codex (raw_memories.md)
                              │
                              └── shared-memory.md (flat file, all agents read)
                                       │
                                       └── zes-memory-bridge (sync daemon, runsv)
```

- **52 shared facts** across 8 types
- **3 search modes:** FTS5, Vector (TF-IDF), Hybrid (RRF)
- **Sync:** runsv `zes-memory-sync` exports every 15 min

## 5. Skills

**96 skills** at `~/.codex/skills/`:

| Category | Count | Key Skills |
|----------|-------|------------|
| ZES | 38 | agentic-core, brainstorming, dashboard, frost-design, memory-ops, provider-manager, design, context, learn, plan, spec |
| Core Workflow | 8 | tdd-workflow, verification-loop, coding-standards, error-handling |
| Backend | 8 | backend-patterns, api-design, fastapi-patterns, python-patterns |
| Frontend | 6 | frontend-patterns, react-patterns, dashboard-builder |
| Integration | 6 | composio-cli, telegram-bridge, 9router-integration |
| Testing & QA | 4 | browser-qa, python-testing, e2e-testing, benchmark |
| Security | 4 | security-review, security-scan, gateguard, safety-guard |
| Project | 5 | plan-orchestrate, delivery-gate, context-budget, cost-tracking, repo-scan |
| Research | 3 | deep-research, documentation-lookup, exa-search |
| System | 2 | imagegen, system-orchestrator |
| Agent | 2 | agentic-engineering, knowledge-ops |
| Discovery | 2 | skill-scout, skill-stocktake |

## 6. ZES Dashboards

### ZES Cyber Dashboard (:7070) — Next.js 16

**45 pages** (synced with ZESCODE/Zes-Dashboard) + **21 API routes**

#### Build Notes (Android/Termux)
Next.js 16 requires WASM SWC on Android arm64. Build with:
```bash
cd ~/Documents/Codex/2026-07-16/zes-cyber-dashboard
npx next build --webpack     # Production build
npx next dev --webpack -p 7070  # Dev server
```

Known issues:
- **Hydration fixes applied:** `toLocaleDateString` uses `en-US` locale, `typeof window` removed from render path, `Math.random()` replaced in sidebar skeleton
- **SWC:** WASM binary via `experimental.useWasmBinary: true` + `next.config.mjs` (JS config avoids SWC chicken-egg)
- **Turbopack:** Disabled on Android (requires native bindings) — uses webpack fallback
- **Production server:** May crash under memory pressure on Android — prefer `next dev`

#### Page Inventory

| Section | Pages |
|---------|-------|
| **Core** | Overview (/), Laboratory, Showcase, Dashboard Config |
| **Company** | Board Room, Org Chart, Strategy, Budget, Hire Agent, Compare, Pipeline |
| **Orchestration** | Orchestrator, Kanban, Tasks, Reports, Skills, Memory Graph |
| **System** | Services, System, Webhooks, Cloud Sync, Activity, Scheduler, Templates, Terminal, Memory Hub, Topology, Processes, Network, Workflows |
| **Agents** | Claude, Claude Chat, Claude Code, Codex Web, Hermes, Hermes Chat, Communication |
| **Infrastructure** | 9Router, AMUX, Teams, Wireflow |

### ZES Cyber Dashboard (:7070) — Next.js

**45 pages** (synced with ZESCODE/Zes-Dashboard) + **21 API routes**

| Section | Pages |
|---------|-------|
| **Core** | Overview (/), Laboratory, Showcase, Dashboard Config |
| **Company** | Board Room, Org Chart, Strategy, Budget, Hire Agent, Compare |
| **Orchestration** | Orchestrator, Kanban, Tasks, Reports, Skills, Memory Graph |
| **System** | Services, System, Webhooks, Cloud Sync, Activity, Scheduler, Templates, Terminal, Memory Hub, Topology, Processes, Network, Workflows |
| **Agents** | Claude, Claude Chat, Claude Code, Codex Web, Hermes, Hermes Chat, Communication |
| **Infrastructure** | 9Router, AMUX, Teams, Org Chart, Wireflow |

### Frost Design System
- **Glassmorphic UI** — 4 color variants: Blue (default), Green (active/success), Orange (warning), Red (error)
- **CSS classes:** `.glass`, `.glass-card`, `.glass-btn*`, `.glass-badge`, `.glass-input`, `.glass-divider`, `.glass-frost-{color}`
- **Tailwind v4 tokens:** `--color-success`, `--color-warning`, `--color-primary`, `--color-destructive`
- **Components:** `GlassCard`, `GlassStatCard`, `DashboardCard`, `DashboardStat`, `Bullet`, `ServiceCard`
- **Source:** `~/Documents/Codex/2026-07-16/zes-cyber-dashboard/`

### Dashboard Locations
| Dashboard | Port | Stack | Location |
|-----------|------|-------|----------|
| Cyber Dashboard | :7070 | Next.js 16 + shadcn/ui | `~/Documents/Codex/2026-07-16/zes-cyber-dashboard/` |
| System Status | :5173 | Vite + React | `~/Documents/Codex/2026-07-12/system-status/` |
| Hermes Dashboard | :9119 | Python webui | Hermes built-in |

## 7. Service Management (runit)

```
sv start/stop/restart/status claude-proxy     # Claude Code proxy (:5905)
sv start/stop/restart/status zes-dashboard     # ZES Dashboard (:5173)
sv start/stop/restart/status zes-memory-sync   # Memory hub sync (15min)
sv start/stop/restart/status tor              # Tor SOCKS5 proxy
sv start/stop/restart/status cloudflared      # Cloudflare tunnel
```

## 8. Key Paths

| Resource | Path |
|----------|------|
| Repo | `~/Zes-System/` |
| Codex Config | `~/.codex/config.toml` |
| Codex Skills | `~/.codex/skills/` (96 skills) |
| Hermes Config | `~/.hermes/profiles/hermes_zes/config.yaml` |
| ZES Memory Hub | `~/.zes/memory_hub.sqlite` |
| Shared Memory | `~/.zes/shared-memory.md` |
| Claude Proxy | `~/Zes-System/scripts/claude-9router-proxy.js` |
| BitRouter Config | `/root/.bitrouter/bitrouter.yaml` (proot) |
| Credentials | `~/.secure-credentials/master.env` |
| Startup Script | `~/start-all.sh` |
| Cyber Dashboard | `~/Documents/Codex/2026-07-16/zes-cyber-dashboard/` |

## 9. CLI Commands

```bash
# Startup
~/start-all.sh           # Start all services

# Memory
python3 ~/.local/bin/zes-memory-bridge status   # Check memory sync
python3 ~/.local/bin/zes-memory-bridge export   # Force sync

# Service management
sv status /data/data/com.termux/files/usr/var/service/*

# Dashboard development
cd ~/Documents/Codex/2026-07-16/zes-cyber-dashboard
npm run dev              # Start Cyber Dashboard on :7070

# Claude Code access (via proxy)
ANTHROPIC_BASE_URL=http://127.0.0.1:5905 claude -p "task"

# BitRouter
curl http://localhost:4356/v1/models  # List 53 models
```

## 10. Cross-Agent Memory Access

| Agent | Shared Memory Path | Config |
|-------|-------------------|--------|
| **Codex** | `~/.codex/memories/raw_memories.md` | Auto-synced via runsv |
| **Hermes** | `~/.zes/memory_hub.sqlite` (native) | holographic provider |
| **Claude Code** | `/root/zes-shared-memory.md` (symlink inside proot) | `/root/.claude/CLAUDE.md` |

### Refresh Memory
```bash
# Force sync all agents
python3 ~/.local/bin/zes-memory-bridge export

# Claude (inside proot)
cat /root/zes-shared-memory.md
```

## 11. ZES Frost Design System

The dashboard uses a glassmorphic design language with 4 semantic color variants:

| Color | Intent | CSS Class | Tailwind Token |
|-------|--------|-----------|----------------|
| Blue | Default / Primary | `.glass-frost-blue` | `bg-primary/5` |
| Green | Active / Success | `.glass-frost-green` | `bg-success/5` |
| Orange | Warning | `.glass-frost-orange` | `bg-warning/5` |
| Red | Error / Destructive | `.glass-frost-red` | `bg-destructive/5` |

All classes defined in `app/globals.css` with light/dark mode overrides. See the **ZES-frost-design** skill for full documentation.
