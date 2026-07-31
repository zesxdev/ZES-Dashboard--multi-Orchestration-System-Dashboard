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

BitRouter is configured via `~/.bitrouter/config.yaml`. Key settings:

```yaml
providers:
  opencode-zen:
    base_url: http://127.0.0.1:5900/codex-api/zen-proxy/v1
    models:
      - deepseek-v4-flash-free
  openai:
    api_key: ${OPENAI_API_KEY}
  anthropic:
    api_key: ${ANTHROPIC_API_KEY}
```

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
