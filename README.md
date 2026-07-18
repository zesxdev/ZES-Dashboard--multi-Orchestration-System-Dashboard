# ZES OS — Zero Entropy System

Unified agent orchestration dashboard + Termux backend stack.

**Originally:** M.O.N.K.Y OS  
**Rebranded to:** ZES OS (Zero Entropy System)

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    ZES System                             │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  Codex   │  │  Hermes  │  │ OpenClaude│               │
│  │  CLI     │  │  Agent   │  │  (OC)    │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       │             │             │                      │
│       └─────────┬───┴─────────────┘                      │
│                 ▼                                         │
│       ┌──────────────────┐                               │
│       │  ZES Memory Hub   │  (unified memory)             │
│       └──────────────────┘                               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │
│  │ 9Router  │  │  Bridge  │  │ ZES Dashboard    │       │
│  │ AI GW    │  │  Server  │  │ (Next.js + shadcn)│       │
│  └──────────┘  └──────────┘  └──────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

## Pages (Dashboard)
- `/` — Overview with system stats and health
- `/laboratory` — Active experiments with green/red status cards
- `/communication` — System status & notifications
- `/service` — Guard Bots service control
- `/system` — Hardware & resource monitoring
- `/kanban` — Task board
- `/hermes-chat` — Hermes bridge chat
- `/oc-chat` — OpenClaude bridge chat
- `/9router` — API router interface
- `/claude` — Claude interface
- `/topology` — ZES system architecture topology
- `/workflows` — Workflow manager
- `/codex-web` — Codex web interface
- `/openclaude` — OpenClaude service manager

## Backend Services (Termux)

All services run locally on Android/Termux. See `scripts/start-all.sh` for full startup.

| Service | Port | Description |
|---------|------|-------------|
| 9Router AI Gateway | `:20128` | LLM proxy — routes all API calls |
| Bridge Server | `:5300` | HTTP/SSE bridge for chat interfaces |
| Hermes Dashboard | `:9119` | Hermes AI agent web UI |
| Tor SOCKS5 | `:9050` | Proxy for IP rotation |

### Default Model
All agents use `oc/deepseek-v4-flash-free` via 9Router.

### IP Rotation
Tor-based IP rotation prevents OpenCode Zen rate limits:
- **Auto:** Tor rotates circuits every 30s
- **Daemon:** `tor-ip-rotator.py` triggers country rotation at 68% usage
- **Manual:** `~/iprotate [country]` for immediate rotation
- **Countries:** US, DE, FR, GB, JP, CA, AU, NL, CH, SE, NO, PL, BR, IN

## Stack (Dashboard)
- Next.js 15.5.18
- Tailwind CSS v4
- shadcn/ui components
- Recharts for charts
- Framer Motion for animations

## Ports
- Dashboard: `:7070`
- Flask API (backend): `:5002`
- Bridge: `:5300`
- 9Router: `:20128`

## Docs
- `docs/AGENTS.md` — Full ZES system agent instructions
- `docs/AGENT_ONBOARDING.md` — Quick agent onboarding
