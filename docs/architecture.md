# ZES System Architecture (v4.1)

**Updated:** 2026-07-26

## Overview

- **3 agents** (Codex CLI, Hermes, Claude Code)
- **1 AI gateway** (BitRouter on :4356) — replaced legacy 9Router
- **4 active dashboards** — Cyber (:7070), System (:5173), User (:4000), Hermes (:9119)
- **53 models** across 12 providers via BitRouter
- **96 skills** across 14 categories (38 ZES skills)
- **52 shared memories** — Memory Hub with FTS5 + Vector + Hybrid search

## Service Topology

```
Codex Web UI (:5900)
  └── OpenCode Zen proxy (big-pickle model)
  └── BitRouter (:4356) for CLI sessions

Hermes Agent (:9119 dashboard)
  └── BitRouter (:4356) — opencode-zen:deepseek-v4-flash-free
  └── Fallback: OpenRouter → gh/gpt-5-mini
  └── Memory Hub (~/.zes/memory_hub.sqlite)
  └── Telegram Bot (@zes_hbot)

Claude Code Proxy (:5905)
  └── BitRouter (:4356) — routes Anthropic API calls

BitRouter (:4356) [proot-distro Debian, Rust v1.0.0-alpha.27]
  ├── opencode-zen (free: deepseek-v4-flash, big-pickle, mimo-v2.5)
  ├── openai (paid: gpt-5.5, gpt-5.4-mini)
  ├── anthropic (paid: claude-sonnet-5, opus-4.8)
  ├── openrouter (free: qwen-coder, nemotron)
  ├── deepseek (paid: deepseek-v4-pro/flash)
  ├── google (gemini models)
  ├── groq (free: llama, qwen)
  ├── cloudflare (free: llama, kimi, glm)
  ├── mistral (paid)
  └── 4 more providers

ZES Dashboards
  ├── Cyber Dashboard (:7070) — Next.js 16, 45 pages, 21 API routes
  ├── System Status (:5173) — Vite + React
  ├── User Dashboard (:4000) — Vite
  └── Hermes Dashboard (:9119) — Python webui

Infrastructure
  ├── Termux (Android aarch64)
  ├── Debian proot-distro (for glibc binaries: BitRouter, Claude)
  ├── runsv (service supervision)
  └── Tor SOCKS5 (:9050)
```

## Dashboard Page Inventory

| Section | Pages |
|---------|-------|
| **Core** | Overview (/), Laboratory, Showcase, Dashboard Config |
| **Company** | Board Room, Org Chart (2x routes), Strategy, Budget, Hire Agent, Company Compare |
| **Orchestration** | Orchestrator, Kanban, Tasks, Reports, Skills, Memory Graph |
| **System** | Services, System, Webhooks, Cloud Sync, Activity, Scheduler, Templates, Terminal, Memory Hub, Topology, Processes, Network, Workflows |
| **Agents** | Claude, Claude Chat, Claude Code, Codex Web, Hermes, Hermes Chat, OpenClaude, Communication |
| **Infrastructure** | 9Router, AMUX, Teams, Wireflow |

## Build Platform Notes

**Android/Termux specific:**
- Next.js 16 uses WASM SWC (native SWC unavailable on arm64)
- Build with `--webpack` flag (Turbopack requires native bindings)
- Config: `next.config.mjs` with `experimental.useWasmBinary: true`
- Dev: `npx next dev --webpack -p 7070`
- Hydration fixes applied: locale-aware dates, stable SSR, deterministic skeleton widths

## Frost Design System

The Cyber Dashboard uses a glassmorphic design language:

- **4 color variants:** Blue (default), Green (active/success), Orange (warning), Red (error)
- **CSS utilities:** `.glass`, `.glass-card`, `.glass-btn*`, `.glass-badge`, `.glass-input`, `.glass-divider`
- **Tailwind v4 tokens:** `--color-success`, `--color-warning`, `--color-primary`, `--color-destructive`
- **Components:** `GlassCard`, `GlassStatCard`, `DashboardCard`, `DashboardStat`, `Bullet`, `ServiceCard`
- **Skill:** `ZES-frost-design` at `~/.codex/skills/ZES-frost-design/`

## Memory Data Flow

```
Hermes writes ──→ Memory Hub SQLite ←── Codex reads (via raw_memories.md)
                       │
                       └── zes-memory-bridge (runsv, 15min sync)
                              │
                              └── shared-memory.md (flat file)
                                     │
                                     └── Codex raw_memories.md
```

## Recent Migrations

| Migration | Status | Date |
|-----------|--------|------|
| OpenClaude → Claude Code | ✅ | Jul 2026 |
| 9Router → BitRouter | ✅ | Jul 2026 |
| z8s skills → ZES rebrand | ✅ | Jul 2026 |
| ZESCODE skills sync | ✅ | Jul 2026 |
| Memory Hub v3.5 vector search | ✅ | Jul 2026 |
| Flask API → Next.js | ✅ | Jul 2026 |
| Dashboard pages (19→45) | ✅ | Jul 2026 |
| Frost design system skill | ✅ | Jul 2026 |
