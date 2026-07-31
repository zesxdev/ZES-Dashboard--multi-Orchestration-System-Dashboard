# ZES OS — Agent Trinity

**Last Updated:** 2026-07-30

---

## Overview

ZES OS operates three AI agents in concert, each with a specialized role:

| Agent | Primary Role | Interface | Port |
|-------|-------------|-----------|------|
| **Codex CLI** | Primary developer | Web UI + CLI | `:5900` |
| **Hermes Agent** | Orchestrator & memory curator | CLI + Dashboard | `:9119` |
| **Claude Code** | Reviewer & parallel tasks | CLI via proxy | `:5905` |

## Agent Roles

### Codex CLI

The primary coding agent. Builds, tests, and deploys the ZES OS dashboard and infrastructure.

- **Start:** `npx codexapp`
- **Model:** `big-pickle` via OpenCode Zen (BitRouter)
- **Skills:** 96 skills in `~/.codex/skills/`

### Hermes Agent

Orchestrator and memory curator. Manages cross-agent memory, runs scheduled tasks, and provides the agent management dashboard.

- **Start:** `hermes` (CLI) or `hermes dashboard` (UI)
- **Model:** `opencode-zen:deepseek-v4-flash-free` (BitRouter)
- **Dashboard:** `:9119`

### Claude Code

Secondary agent for code review, parallel task execution, and UI work.

- **Start:** runsv-managed at `:5905`
- **Model:** Via BitRouter → opencode-zen `deepseek-v4-flash-free` (settings.json env: `ANTHROPIC_BASE_URL=http://127.0.0.1:5905`)
- **Scope:** Review, UI polish, parallel builds

## Communication Flow

```
Agent wants to share information
    │
    ▼
Writes to Memory Hub (SQLite FTS5)
    │
    ▼
zes-memory-bridge export → updates all agent memory files
    │
    ▼
All agents can read via ~/.codex/memories/ or ~/.zes/shared-memory.md
```

## Best Practices

1. **Use Memory Hub for persistent facts** — Don't rely on conversation context alone
2. **Tag memories appropriately** — Use `scope: global`, `priority: medium|high|low`, `type: fact|decision|pattern`
3. **Sync regularly** — Run `zes-memory-bridge export` after adding important memories
4. **Delegate by strength** — Codex for code, Hermes for orchestration, Claude for review
