# ZES OS — Service Management

**Last Updated:** 2026-07-30

---

## Starting Services

```bash
# Codex Web UI
npx codexapp                          # :5900

# Hermes 
hermes                                # CLI
hermes dashboard                      # Dashboard (:9119)

# ZES Dashboard
cd ~/zes-os-dashboard
export NEXT_SWC_USE_WASM=1
npm run dev                           # :5051 (dev)
node node_modules/.bin/next start -p 5051 -H 127.0.0.1  # :5051 (prod)

# BitRouter
bitrouter-start                       # :4356
```

## Stopping Services

```bash
# Find PID by port
fuser <port>/tcp

# Kill
fuser -k <port>/tcp

# Or use runsv
sv stop <service-name>
```

## Logs

```bash
# Dashboard logs
tail -f ~/zes-os-dashboard/dashboard.log

# System logs (runsv services pipe stdout/stderr into svlogd)
ls ~/logs/
tail -f ~/logs/bitrouter/current        # BitRouter (structured, incl. policy routing)
tail -f ~/logs/claude-proxy/current     # Claude proxy (per-request status lines)
tail -f ~/logs/zes-memory-sync/current  # ZES memory sync
```

## Health Check

```bash
# Check if services are running
curl http://127.0.0.1:4356/v1/models         # BitRouter
curl http://127.0.0.1:5051                    # Dashboard
curl http://127.0.0.1:5900                    # Codex
curl http://127.0.0.1:5905                    # Claude Proxy
curl http://127.0.0.1:9119                    # Hermes
```
