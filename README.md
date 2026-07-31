<h1 align="center">ZES OS</h1>
<h3 align="center">Zes Orchestration System</h3>
<p align="center">
  <em>Unified AI Agent Orchestration for Termux Android</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-4.2.0-blue?style=flat-square" alt="Version 4.2.0" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" alt="Active" />
  <img src="https://img.shields.io/badge/agents-3-orange?style=flat-square" alt="3 Agents" />
  <img src="https://img.shields.io/badge/models-53+-purple?style=flat-square" alt="53+ Models" />
</p>

---

## Overview

ZES OS orchestrates **three AI agents** — Codex CLI, Hermes Agent, and Claude Code — on a single Termux Android device, connected through **BitRouter** (53+ models, 12 providers) with a **shared memory hub** and **unified dashboard**.

```
┌─────────────────────────────────────────────────────────────┐
│  Codex CLI ──┐                                              │
│  Hermes    ──┼── BitRouter (:4356) ──→ 12 LLM Providers     │
│  Claude    ──┘                      53+ Models              │
│                                                             │
│  Memory Hub ── 57+ shared facts across all agents           │
│  Dashboard  ── 31 pages · Next.js 15 · Frost Design         │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# 1. Start Codex Web UI
npx codexapp

# 2. Launch Hermes
hermes

# 3. Open the dashboard
cd ~/zes-os-dashboard && npm run dev
```

## Features

| Capability | Description |
|-----------|-------------|
| **🤖 Agent Trinity** | Codex (coder) · Hermes (orchestrator) · Claude (reviewer) |
| **🧠 Shared Memory** | SQLite FTS5 hub — cross-agent persistent memory |
| **🔀 BitRouter Gateway** | 53 models · 12 providers · automatic failover |
| **📊 Unified Dashboard** | 31 pages · glassmorphic UI · mobile-optimized |
| **🔒 Tor Network** | Privacy-first routing for all agent traffic |
| **🎨 Frost Design** | 4-color glassmorphic design system |
| **🧩 96 Skills** | Plug-and-play agent capabilities |

## Service Matrix

| Service | Port | How to Start |
|---------|------|-------------|
| Codex Web UI | `:5900` | `npx codexapp` |
| BitRouter | `:4356` | `bitrouter-start` |
| Hermes Dashboard | `:9119` | `hermes dashboard` |
| Claude Proxy | `:5905` | runsv-managed |
| ZES Dashboard | `:5051` | `npm run dev` / `next start` |
| Memory Sync | — | runsv (zes-memory-sync) |

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | Full system instructions & agent onboarding |
| [Architecture](docs/architecture.md) | System architecture & design decisions |
| [Agent Trinity](docs/agents/trinity.md) | Agent roles, workflows & communication |
| [Infrastructure](docs/infrastructure/overview.md) | Network topology & service layout |
| [Providers](docs/providers/bitrouter.md) | LLM provider configuration & routing |
| [Roadmap](ROADMAP.md) | Future development plans |
| [Changelog](CHANGELOG.md) | Version history |

## Project Structure

```
~/Zes-System/              # System configs, docs, scripts
  ├── AGENTS.md            # Agent instructions (entry point)
  ├── README.md            # This file
  ├── ROADMAP.md           # Future plans
  ├── CHANGELOG.md         # Version history
  ├── docs/                # Documentation
  │   ├── architecture.md
  │   ├── agents/
  │   ├── infrastructure/
  │   └── providers/
  ├── scripts/             # Utility scripts
  └── config/              # Service configurations

~/zes-os-dashboard/        # Dashboard application
  ├── app/                 # Next.js app router pages
  ├── components/          # UI components
  └── lib/                 # Utilities & API clients
```

## Requirements

- **Device:** Android aarch64 (Termux)
- **Storage:** 4GB+ free
- **RAM:** 6GB+ recommended
- **Network:** Wi-Fi or mobile data (Tor optional)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © 2026 ZES OS Contributors
