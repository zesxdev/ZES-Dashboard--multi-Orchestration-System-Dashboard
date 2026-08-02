# amux — Agent Teams Panel

[amux](https://github.com/mixpeek/amux) is the ZES agent control plane:
a web dashboard that runs and monitors parallel agent sessions (Codex,
Hermes, Claude) in tmux with self-healing watchdogs.

- Web dashboard: `http://127.0.0.1:8822` (runsv service `amux`)
- Dashboard page: ZES Dashboard `/teams`
- Sessions live in `~/.amux/sessions/<name>.env` (SQLite state in `~/.amux/amux.db`)

## Service

```bash
sv status amux                      # runsv-managed, pid + uptime
sv restart amux                     # restart the server
tail -f ~/logs/amux/current         # server log
```

runsv run script: `amux-server.py 8822 --bind 127.0.0.1 --no-tls`
(loopback + plain HTTP — matches the `/teams` page URL `http://localhost:8822`).

## Registered sessions

| Session | Provider | Command |
|---------|----------|---------|
| `codex`  | codex  | `codex --dangerously-bypass-approvals-and-sandbox --model deepseek/deepseek-v4-flash` (bitrouter provider) |
| `hermes` | hermes (custom) | `HERMES_HOME=~/.hermes/profiles/hermes_zes hermes` — Hermes Agent REPL on the ZES profile |
| `claude` | claude (custom) | `claude` — picks up `~/.claude/settings.json` → proxy :5905 → BitRouter |

## ZES patch: `AMUX_CMD` custom commands

Upstream amux only knows `codex`, `gemini`, or `claude` providers and appends
provider model defaults (`--model gpt-5.5` / `--model sonnet`) that break
non-Claude CLIs like Hermes. ZES adds a per-session `AMUX_CMD` override:

- `amux` CLI (`cmd_start`) — `AMUX_CMD` wins over the provider default and
  skips the `--model` injection.
- `amux-server.py` — reads `AMUX_CMD` from the session env file, and skips
  `--mcp-config` / `--model sonnet` for custom commands (so Hermes never sees
  Claude flags).

Re-apply after an upstream update:

```bash
cd ~/amux
git pull --ff-only origin main
git apply ~/Zes-System/patches/amux-zes-cmd.patch   # may need context refresh
cp amux amux-server.py /data/data/com.termux/files/usr/bin/
sv restart amux
```

## CLI quick reference

```bash
amux ls                     # list sessions + status
amux start <name> --detach  # start without attaching
amux attach <name>          # attach (detach: Ctrl-b d)
amux peek <name>            # view recent output
amux send <name> "text"     # type a message into the session
amux stop <name>            # stop
amux serve                  # manual server start (runsv is preferred)
```

## Notes

- `psutil /proc/stat` and `sysctl` warnings in `~/logs/amux/current` are
  harmless Termux restrictions (uptime stats unavailable).
- Amux state (`~/.amux/`) is device-local; the dashboard `/teams` page links
  to the server — no other integration needed.
