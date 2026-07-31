# ZES OS — BitRouter Provider

**Last Updated:** 2026-07-30

---

## Overview

BitRouter is the primary LLM gateway for ZES OS, routing requests across 53+ models from 12 providers with automatic failover and load balancing.

**Port:** `:4356`

## Provider Chain

```
Primary:   opencode-zen:deepseek-v4-flash-free
Fallback:  openai/gpt-5.4-mini (via OpenRouter)
Custom:    Anthropic (via Claude Proxy :5905)
```

## Configuration

The live config is `/root/.bitrouter/bitrouter.yaml` (inside the Debian proot;
host path `.../proot-distro/installed-rootfs/debian/root/.bitrouter/bitrouter.yaml`).
Providers auto-enable from env keys sourced in the runsv `run` script
(`~/.secure-credentials/master.env`).

Current routing (2026-07-31):

```yaml
providers:
  opencode-zen: { enabled: true }   # free deepseek-v4-flash-free
  openai:       { enabled: true }
  anthropic:    { enabled: true }
  openrouter:   { enabled: true }
  github-copilot: { enabled: true }

models:   # explicit virtual models (Strategy 2.2)
  anthropic/claude-sonnet-5:    -> opencode-zen/deepseek-v4-flash-free
  deepseek/deepseek-v4-flash:   -> opencode-zen/deepseek-v4-flash-free
  deepseek/deepseek-v4-flash-free: -> opencode-zen/deepseek-v4-flash-free

policy_table:
  tiers: { cheap: deepseek/deepseek-v4-flash-free, flagship: anthropic/claude-sonnet-5 }
  tool_use_tier: flagship
  tool_safe_tiers: [flagship]
```

Why: the old flagship `openai/gpt-5.5` over chat-completions rejects
tools + `reasoning_effort` (400), which broke Claude Code. Routing all three
agents to opencode-zen `deepseek-v4-flash-free` (free, tools-capable) fixes it.

Restart note: `sv restart bitrouter` does NOT kill the daemon (the proot wrapper
absorbs TERM). Use `kill -9 <bitrouter.orig serve pid>`; runsv respawns it.

Logging: the runsv service has a `log/` subdir running `svlogd -tt $HOME/logs/bitrouter`
— daemon + request logs land in `~/logs/bitrouter/current` (structured, includes
policy routing decisions).

## Usage

```bash
# List available models
curl http://127.0.0.1:4356/v1/models

# Test routing
curl http://127.0.0.1:4356/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-v4-flash-free", "messages": [{"role": "user", "content": "hello"}]}'
```

## Model Selection

Each agent in ZES OS uses a specific model:

| Agent | Default Model | Provider | 
|-------|--------------|----------|
| Codex CLI | big-pickle | OpenCode Zen |
| Hermes | deepseek-v4-flash-free | OpenCode Zen |
| Claude Code | claude-sonnet-4 | Anthropic (via :5905) |
