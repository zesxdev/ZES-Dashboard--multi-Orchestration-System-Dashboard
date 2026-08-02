# ZES OS — Architecture

**Last Updated:** 2026-08-01

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ZES OS v4.3                             │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ Codex   │  │ Hermes   │  │ Claude   │                    │
│  │ CLI     │  │ Agent    │  │ Code     │                    │
│  │ :5900   │  │ :9119    │  │ :5905    │                    │
│  └────┬────┘  └────┬─────┘  └────┬─────┘                    │
│       │            │              │                          │
│       └───────┬────┴──────────────┘                          │
│               ▼                                               │
│     ┌─────────────────────────┐                               │
│     │  BitRouter :4356         │  Data plane — LLM routing    │
│     │  53 models · 12 prov.    │  Usage tracking: tokens,     │
│     │                         │  latency, routing decisions   │
│     └────────────┬────────────┘                               │
│                  ▼                                             │
│     ┌────────────────────────────────────┐                   │
│     │  12 LLM Providers                   │                   │
│     │  opencode-zen · openai · anthropic   │                   │
│     │  groq · openrouter · google          │                   │
│     │  deepseek · mistral · cohere · ...   │                   │
│     └────────────────────────────────────┘                   │
│                                                             │
│     ┌────────────────────────────────────┐                   │
│     │  9Router :20128 — Control plane    │                   │
│     │  Provider conns · API keys ·       │                   │
│     │  proxy pools (no usage tracking)   │                   │
│     └────────────────────────────────────┘                   │
│                                                             │
│  ┌─────────────────────────────────────────────────┐        │
│  │         ZES OS Shared Layer                       │        │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │        │
│  │  │ Memory   │  │ Skills   │  │ Dashboard     │ │        │
│  │  │ Hub      │  │ Engine   │  │ :5051 · 49pg  │ │        │
│  │  │ SQLite   │  │ 96 sk.   │  │ Frost UI     │ │        │
│  │  └──────────┘  └──────────┘  └───────────────┘ │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

1. **BitRouter First** — All LLM traffic routes through BitRouter for unified usage tracking, metrics, failover, and cost control
2. **Shared Memory** — All agents read/write to a single SQLite FTS5 hub for persistent cross-agent context
3. **Mobile-First** — Dashboard optimized for phone screens (Termux runs on Android)
4. **Privacy by Default** — Tor network integration, secrets isolation, no telemetry

## Data Flow

```
User Request
    │
    ▼
Codex CLI / Hermes / Claude Code
    │
    ▼
BitRouter (:4356)
    ├── Request routing
    ├── Model selection
    ├── Load balancing
    ├── Fallback chain
    └── Usage tracking (model, tokens, latency, routing → telemetry/OTel)
    │
    ▼
LLM Provider → Response → Agent → Memory Hub → Dashboard
```

9Router (:20128) is the **control plane**: it manages provider connections, API keys, and
proxy pools — it is *not* involved in request routing or usage accounting. Usage tracking
is owned entirely by BitRouter (data plane).

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22, Python 3.12 |
| Web UI | Codex CLI (:5900), Hermes Dashboard (:9119) |
| LLM Router | BitRouter (:4356) |
| Dashboard | Next.js 15 + Tailwind CSS v4 |
| UI Components | shadcn/ui + Frost Design System |
| Database | SQLite + FTS5 (Memory Hub) |
| Privacy | Tor (optional) |
| Deployment | Termux on Android aarch64 |

## Dashboard Pages

- **49 pages** on Next.js 15.5 + Frost Design (blue/green/orange/red glass cards)
- **Mindwalk** (`/mindwalk`) — 3D city replay of Codex + Claude session traces (squarified
  treemap over `~/.codex/sessions` + `~/.claude/projects` JSONL, scrub playback, 12-chip HUD,
  WebGL fallback). Native port of `cosmtrek/mindwalk` — no Go binary required.
- APIs: `/api/mindwalk/sessions`, `/api/mindwalk/trace`, `/api/mindwalk/map`

## Port Map

| Port | Service | Protocol |
|------|---------|----------|
| 4356 | BitRouter | HTTP/REST |
| 20128 | 9Router | HTTP (control plane) |
| 4318 | OTLP dispatcher | HTTP (traces+metrics → collector) |
| 4319 | OTel Collector (Prometheus) | HTTP (metrics scrape) |
| 4319+ | usage-snapshot daemon | JSONL history → `~/.zes/usage-history.jsonl` |
| 5051 | ZES Dashboard | HTTP/Next.js |
| 5900 | Codex Web UI | HTTP/WebSocket |
| 5905 | Claude Proxy | HTTP/Anthropic |
| 9119 | Hermes Dashboard | HTTP |

## Agent Communication

Agents communicate through:
1. **Memory Hub** — SQLite database with FTS5 full-text search
2. **Shared filesystem** — `~/.codex/memories/`, `~/.zes/shared-memory.md`
3. **BitRouter** — Unified LLM provider interface
4. **Dashboard API** — REST endpoints at `:5051/api/*`
