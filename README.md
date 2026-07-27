# ZES System — Unified Personal AI v4.1

ZES orchestrates three AI agents (Codex CLI, Claude Code, Hermes) with an AI gateway (BitRouter) on Termux Android.

## Quick Start

```bash
# Start all services
~/start-all.sh

# Check memory health
python3 ~/.local/bin/zes-memory-bridge status

# List available models
curl http://127.0.0.1:4356/v1/models
```

## Architecture

```
Codex ──┐
Claude ──┤── BitRouter (:4356) ──→ LLM providers (12)
Hermes ─┘
   │
   └── ZES Memory Hub (52 shared facts)
   └── ZES Dashboards (:5173, :7070, :4000, :9119)
```

## Dashboard

The **ZES Cyber Dashboard** at `:7070` has **45 pages** and **21 API routes**, built with Next.js 16 + shadcn/ui + Frost Design System (glassmorphic UI).

```bash
cd ~/Documents/Codex/2026-07-16/zes-cyber-dashboard
npm run dev  # Start developing
```

## Skills

**96 skills** at `~/.codex/skills/` — 38 ZES skills including `ZES-frost-design` (glassmorphic design system).

## Docs

See [AGENTS.md](AGENTS.md) for full system documentation.

## Active Services

| Service | Port | Managed By |
|---------|------|------------|
| Codex Web UI | 5900 | npx codexapp |
| BitRouter | 4356 | bitrouter-start (proot) |
| Claude Proxy | 5905 | runsv (claude-proxy) |
| Hermes Dashboard | 9119 | runsv |
| ZES Dashboard | 5173 | Vite |
| ZES Cyber Dashboard | 7070 | Next.js |
| Memory Sync | — | runsv (zes-memory-sync) |

## License

MIT
