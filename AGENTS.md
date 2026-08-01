# ZES OS — Zes Orchestration System

**Version:** 4.3.2  
**Last Updated:** 2026-08-01  
**Repo:** [github.com/zesxdev/zes-os](https://github.com/zesxdev/zes-os)

---

## 1. System Overview

ZES OS orchestrates three AI agents — **Codex CLI**, **Hermes Agent**, and **Claude Code** — on Termux (Android aarch64) with BitRouter as the primary AI gateway.

```
┌──────────────────────────────────────────────────────────────────┐
│                    ZES OS v4.3.2                                  │
│              Zes Orchestration System                             │
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                     │
│  │  Codex   │   │  Hermes  │   │ Claude   │                     │
│  │  CLI     │   │  Agent   │   │  Code    │                     │
│  │ (coder)  │   │(memory)  │   │ (review) │                     │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                     │
│       │              │              │                            │
│       └─────────┬────┴──────────────┘                            │
│                 ▼                                                 │
│       ┌──────────────────┐                                       │
│       │  BitRouter :4356  │  (primary LLM router)                │
│       │  53 models / 12   │                                       │
│       │  providers        │                                       │
│       └────────┬─────────┘                                       │
│                ▼                                                  │
│       ┌──────────────────┐                                       │
│       │  OpenCode Zen     │  (free deepseek-v4-flash)            │
│       │  + other providers│                                       │
│       └──────────────────┘                                       │
│                                                                  │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────────┐         │
│  │ ZES OS   │   │ ZES Memory   │   │ ZES CLI Toolkit  │         │
│  │ Dashboard │   │ Hub :memory  │   │ research|batch   │         │
│  │ :5051     │   │ 200+ facts   │   │ status|debug     │         │
│  │ 49 pages  │   │              │   │                  │         │
│  └──────────┘   └──────────────┘   └──────────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

## 2. Agent Trinity

| Agent | Role | Access | Port | Model |
|-------|------|--------|------|-------|
| **Codex CLI** | Primary coder | `:5900` Web UI | `deepseek-v4-flash` (OpenCode Zen) |
| **Hermes** | Orchestrator/memory | `:9119` Dashboard | `deepseek-v4-flash-free` (OpenCode Zen) |
| **Claude Code** | Reviewer/parallel | `:5905` Proxy | deepseek-v4-flash-free (via BitRouter) |

## 3. Provider Chain (BitRouter First)

```
                        ┌────────────────────────────────────────────┐
                        │ 9Router :20128 (control plane)             │
                        │ Provider connections · API keys · proxy     │
                        │ pools · usage tracking (15 providers, 3     │
                        │ proxy pools, key mgmt)                      │
                        └──────────────────┬─────────────────────────┘
                                           │ supplies providers/keys
                                           ▼
                        ┌────────────────────────────────────────────┐
                        │ BitRouter :4356 (data plane / LLM router)   │
                        │ 54 models · routing · failover              │
                        └──────────────────┬─────────────────────────┘
                                           ▼
Codex ──→ codexapp zen-proxy (:5900) ──→ OpenCode Zen (direct)
Claude ──→ Claude Proxy (:5905) ──→ BitRouter (:4356) ──→ opencode-zen deepseek-v4-flash-free
Hermes ──→ opencode-zen (direct) ──→ deepseek-v4-flash-free
```

**9Router** is the provider & key management layer (control plane) — it stores provider
connections, API keys, proxy pools, and usage history. **BitRouter** is the LLM routing
layer (data plane) — it routes requests across the models 9router configures.

## 4. Services

| Service | Port | Status |
|---------|------|--------|
| Codex Web UI | `:5900` | `npx codexapp` |
| BitRouter AI Gateway | `:4356` | Primary LLM router |
| Hermes Dashboard | `:9119` | `hermes dashboard` |
| Claude Code Proxy | `:5905` | runsv-managed |
| ZES Dashboard | `:5051` | Next.js · 49 pages · Mindwalk at `/mindwalk` |
| Memory Hub | SQLite + FTS5 | Cross-agent shared |

**Dashboard notes (2026-08-01):** New Company dialog is portaled to `document.body` (full-screen mobile overlay); mobile bottom nav offsets content via `--bottom-nav-h` (layout padding + full-viewport pages Mindwalk / Topology 3D / Wireflow).

## 5. Shared Memory

ZES agents share memory through the ZES Memory Hub. 200+ memories across Codex, Hermes, and Claude Code.

**Read:** `~/.codex/memories/raw_memories.md` | `~/.zes/shared-memory.md`
**Write:** `zes-memory-bridge export` after inserting via hub API

## 6. Quick Reference

```bash
# Start services
npx codexapp           # Codex Web UI (:5900)
hermes                 # Hermes Agent CLI
hermes dashboard       # Hermes Dashboard (:9119)
cd ~/Documents/Codex/2026-07-27/zes-dashboard-frost && npm run dev  # ZES Dashboard (:5051, runsv: zes-dashboard)

# Memory
zes-memory-bridge status   # Check state
zes-memory-bridge export   # Push to all agents
```

## 7. Security

Secrets stored at `~/.secure-credentials/master.env`:
```bash
set -a; source ~/.secure-credentials/master.env; set +a
```

## 8. Documentation

| Doc | Path |
|-----|------|
| Architecture | `docs/architecture.md` |
| Agent Trinity | `docs/agents/trinity.md` |
| Infrastructure | `docs/infrastructure/overview.md` |
| Providers | `docs/providers/bitrouter.md` |
| Service Ports | `docs/services/ports.md` |
| Roadmap | `ROADMAP.md` |
| Changelog | `CHANGELOG.md` |
