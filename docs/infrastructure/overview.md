# Infrastructure Overview (v4.1)

**Updated:** 2026-07-26

## OS
- **Host:** Android aarch64 (Termux)
- **Container:** Debian via proot-distro (for glibc binaries: BitRouter, Claude Code)
- **Init:** runit (runsv) for service supervision

## Networking
- All services on localhost (127.0.0.1)
- Tor SOCKS5 on :9050 for anonymized routing
- Headless Chromium on :9222 for browser automation

## Primary AI Gateway
- **BitRouter** v1.0.0-alpha.27 — Rust self-improving LLM router
- 53 models across 12 providers
- Policy-based routing: cheap tier (opencode-zen:deepseek-v4-flash), flagship (openai/gpt-5.5)
- Auto-escalation on failure (adequacy engine)
- 32.8% cost reduction on Terminal-Bench 2.1

## Agents
| Agent | Runtime | Provider |
|-------|---------|----------|
| Codex CLI | Native Termux | OpenCode Zen → BitRouter |
| Hermes | Python (venv) | BitRouter |
| Claude Code | proot-distro Debian | BitRouter (via proxy) |

## Dashboards

### ZES Cyber Dashboard (:7070)
- **Stack:** Next.js 16 + shadcn/ui + Tailwind CSS v4
- **Pages:** 45 page routes, 21 API routes
- **Design:** Frost Glassmorphic Design System (4 color variants)
- **Location:** `~/Documents/Codex/2026-07-16/zes-cyber-dashboard/`
- **Source:** [ZESCODE/Zes-Dashboard](https://github.com/ZESCODE/Zes-Dashboard)
- **Start:** `cd ~/Documents/Codex/2026-07-16/zes-cyber-dashboard && npm run dev`

### ZES System Dashboard (:5173)
- **Stack:** Vite + React 19 + shadcn/ui
- **Location:** `~/Documents/Codex/2026-07-12/system-status/`
- **Start:** `cd ~/Documents/Codex/2026-07-12/system-status && bash start-dashboard.sh`

### Hermes Dashboard (:9119)
- **Stack:** Python FastAPI webui
- **Managed by:** runsv (hermes-dashboard)

## Skill System
- **96 total skills** at `~/.codex/skills/`
- **38 ZES skills** (agentic-core, frost-design, dashboard, memory-ops, etc.)
- **8 plugin-contributed skill bundles**
- **5 system-level skills** (.system/imagegen, openai-docs, etc.)

## Storage
| Resource | Path |
|----------|------|
| Memory Hub | `~/.zes/memory_hub.sqlite` |
| Shared Memory | `~/.zes/shared-memory.md` |
| Codex Memories | `~/.codex/memories/raw_memories.md` |
| Credentials | `~/.secure-credentials/master.env` |
