# Service Management (v4.1)

## Overview

Services run under **runit** supervision via `runsv` at `/data/data/com.termux/files/usr/var/service/`.

## Active Services

| Service | Port | Purpose |
|---------|------|---------|
| claude-proxy | 5905 | Routes Claude Code → BitRouter |
| zes-dashboard | 5173 | Vite React dashboard |
| zes-memory-sync | — | Exports Memory Hub every 15min |
| tor | 9050 | SOCKS5 proxy for anonymized routing |
| cloudflared | — | External tunnel access |

## Manual Services

These services are started manually (not under runsv):

| Service | Port | Start Command |
|---------|------|---------------|
| Codex Web UI | 5900 | `npx codexapp --port 5900` |
| BitRouter | 4356 | `bitrouter-start` (inside proot) |
| ZES Cyber Dashboard | 7070 | `cd ~/Documents/Codex/2026-07-16/zes-cyber-dashboard && npm run dev` |
| ZES System Dashboard | 5173 | `cd ~/Documents/Codex/2026-07-12/system-status && bash start-dashboard.sh` |

## Service Commands

```bash
# Check all services
sv status /data/data/com.termux/files/usr/var/service/*

# Individual
sv start <name>
sv stop <name>
sv restart <name>
sv status <name>
```

## Startup

```bash
~/start-all.sh    # Starts all services
```
