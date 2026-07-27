# Agent Trinity (v4.0)

**Updated:** 2026-07-25

## Codex CLI — The Coder
- **Role:** Primary coding agent
- **Port:** :5900 (Web UI) / CLI
- **Model:** big-pickle via OpenCode Zen
- **Skills:** 95 skill directories
- **Memory:** Reads from raw_memories.md (synced via Memory Hub)
- **Config:** ~/.codex/config.toml

## Claude Code — The Reviewer
- **Role:** Secondary coder, reviewer, parallel worker
- **Port:** :5905 (proxy)
- **Runtime:** Node.js via claude-9router-proxy.js → BitRouter
- **Binary:** proot-distro Debian (261MB, glibc)
- **Config:** ~/.claude/settings.json

## Hermes — The Memory Curator
- **Role:** Orchestrator, memory curator, Telegram bot
- **Port:** :9119 (dashboard)
- **Model:** opencode-zen:deepseek-v4-flash-free via BitRouter
- **Memory:** holographic → ~/.zes/memory_hub.sqlite
- **Config:** ~/.hermes/profiles/hermes_zes/config.yaml
- **Cron:** health watchdog (15min), memory bridge sync (30min)
