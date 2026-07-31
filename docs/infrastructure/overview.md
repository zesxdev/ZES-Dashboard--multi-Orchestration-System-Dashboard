# ZES OS — Infrastructure Overview

**Last Updated:** 2026-07-30

---

## Network Topology

```
Internet
    │
    ├── Tor Network (optional, for privacy)
    │
    ▼
Termux on Android aarch64
    │
    ├── 9Router (:20128) ──→ provider & key management (control plane)
    ├── BitRouter (:4356) ──→ LLM routing (data plane)
    ├── Codex CLI (:5900) ──→ Web UI
    ├── Hermes (:9119) ──→ Dashboard
    ├── Claude Proxy (:5905) ──→ API
    └── ZES Dashboard (:5051) ──→ 31 pages
```

## Service Layout

All services run locally on the device. No cloud dependencies required.

| Service | Type | Port | Dependencies |
|---------|------|------|-------------|
| BitRouter | LLM Router (data plane) | 4356 | proot/Rust |
| 9Router | Provider & Key Mgmt (control plane) | 20128 | runsv (r9) |
| ZES Dashboard | Next.js | 5051 | Node.js, .next build |
| Codex Web UI | Agent UI | 5900 | Codex CLI |
| Claude Proxy | API Proxy | 5905 | runsv |
| Hermes Dashboard | Agent UI | 9119 | Hermes Agent |

## Storage

| Resource | Path | Purpose |
|----------|------|---------|
| Memory Hub | `~/.zes/memory_hub.sqlite` | Cross-agent shared memory |
| Codex Memories | `~/.codex/memories/` | Codex-specific memory |
| Shared Memory | `~/.zes/shared-memory.md` | Flat memory export |
| Agent Configs | `~/.codex/config.toml` | Codex configuration |
| Dashboard Build | `.next/` | Next.js production build |
| Logs | `~/logs/` | Service logs |

## Secrets Management

All secrets stored in `~/.secure-credentials/master.env`:
- API keys for LLM providers
- GitHub tokens
- Bot tokens (Telegram)
- Database credentials

Load with:
```bash
set -a; source ~/.secure-credentials/master.env; set +a
```

## Privacy

- Tor routing available for all agent traffic
- No telemetry or external logging
- Local-first architecture
- Secrets never committed to git
