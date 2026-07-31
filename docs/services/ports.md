# ZES OS — Service Ports

**Last Updated:** 2026-07-30

---

## Port Allocation

| Port | Service | Protocol | Started By |
|------|---------|----------|-----------|
| 4356 | BitRouter AI Gateway | HTTP/REST | runsv (bitrouter) — formerly `bitrouter-start` |
| 5051 | ZES Dashboard | HTTP/Next.js | `npm run dev` / `next start` |
| 5900 | Codex Web UI | HTTP/WS | `npx codexapp` |
| 5905 | Claude Code Proxy | HTTP | runsv (claude-proxy) |
| 9119 | Hermes Dashboard | HTTP | `hermes dashboard` |
| 9222 | Chromium Headless | DevTools | runsv |

## Port Conflicts

If a port is in use:
```bash
# Find what's using it
fuser <port>/tcp

# Kill the process
fuser -k <port>/tcp
```
