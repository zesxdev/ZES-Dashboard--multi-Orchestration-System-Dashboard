# Hermes — Model Routing & Config

Hermes Agent runs on the active **hermes_zes** profile
(`~/.hermes/profiles/hermes_zes/`). The model routing was changed so Hermes
stops depending on direct `opencode.ai/zen` connectivity (which was dropping
`APIConnectionError`s) and instead flows through ZES' routers with a local
fallback.

## Routing (before → after)

- **Primary:** BitRouter `http://127.0.0.1:4356/v1` · `deepseek/deepseek-v4-flash-free`
  (provider `bitrouter`) — BitRouter-first, picks up usage telemetry, no auth needed.
- **Fallback 1:** 9Router gateway `http://127.0.0.1:20128/v1` → `groq/llama-3.3-70b-versatile`
  (independent upstream, so it survives opencode outages).
- **Fallback 2:** same 9Router gateway → `oc/deepseek-v4-flash-free` (free tier).

Config on the `hermes_zes` profile:

```yaml
model:
  base_url: http://127.0.0.1:4356/v1
  default: deepseek/deepseek-v4-flash-free
  provider: bitrouter
providers:
  bitrouter: { base_url: http://127.0.0.1:4356/v1, api_key: ${OPENCODE_ZEN_API_KEY} }
  zes-gateway:
    base_url: http://127.0.0.1:20128/v1
    api_mode: chat_completions
    key_env: ZES_ROUTER_KEY
fallback_providers:
  - provider: zes-gateway
    model: groq/llama-3.3-70b-versatile
    base_url: http://127.0.0.1:20128/v1
    key_env: ZES_ROUTER_KEY
fallback_model:            # legacy key, second fallback tier
  provider: zes-gateway
  model: oc/deepseek-v4-flash-free
  base_url: http://127.0.0.1:20128/v1
  key_env: ZES_ROUTER_KEY
```

The 9Router key is stored in `~/.hermes/profiles/hermes_zes/.env` as
`ZES_ROUTER_KEY` and referenced via `key_env` (never inline where possible).

## Verify

```bash
# Resolve primary + fallback chain
cd ~/hermes-agent && PYTHONPATH=. HERMES_HOME=~/.hermes/profiles/hermes_zes \
  python3 -c "import yaml,os; from hermes_cli.fallback_config import get_fallback_chain; c=yaml.safe_load(open(os.environ['HERMES_HOME']+'/config.yaml')); print([(e['provider'],e['model']) for e in get_fallback_chain(c)])"
```

In-session, the header line shows `provider: bitrouter` — that confirms the
new config is active. A failed upstream now falls back to 9Router automatically
(the pasted `APIConnectionError` spiral is gone).

## Notes

- Backup of the pre-change config: `~/.hermes/profiles/hermes_zes/config.yaml.bak-hermes-routing`.
- The default `~/.hermes/config.yaml` is NOT edited — the running agent uses the
  hermes_zes profile. Edit that one only if you run Hermes without `HERMES_HOME`.
- Related: amux now boots Hermes in a tmux team session with `HERMES_HOME` pinned (see `docs/amux.md`).
