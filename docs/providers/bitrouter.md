# BitRouter Provider Guide

**Version:** v1.0.0-alpha.27  
**Port:** :4356  
**Config:** /root/.bitrouter/bitrouter.yaml (inside proot-distro Debian)

## Overview

BitRouter is the self-improving LLM router — replaces legacy 9Router.

## Policy Table

```yaml
tiers:
  cheap:    opencode-zen:deepseek-v4-flash-free
  flagship: openai/gpt-5.5
fingerprints:
  opening:          flagship
  after_read_file:  cheap
  after_write_file: cheap
  midstream:        cheap
  after_tool_error: flagship
default_tier:    flagship
tool_use_tier:   flagship
adequacy:
  enabled: true
  escalation_tier: flagship
```

## Model Access

```bash
# List all 53 models
curl http://localhost:4356/v1/models

# Chat completion (no auth needed — skip_auth: true)
curl http://localhost:4356/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"opencode-zen:deepseek-v4-flash-free","messages":[{"role":"user","content":"hello"}]}'
```

## API Keys

Stored in `~/.secure-credentials/master.env`:
- OPENCODE_ZEN_API_KEY — OpenCode Zen free tier
- ANTHROPIC_API_KEY — Claude models
- OPENAI_API_KEY — GPT models
- OPENROUTER_API_KEY — OpenRouter fallback
