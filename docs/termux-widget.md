# Termux:Widget — Home-Screen Controls

ZES ships home-screen shortcuts via the **Termux:Widget** Android app.
Scripts live in the repo under `scripts/widgets/` and are symlinked into
`~/.shortcuts/` (visible, opens a terminal) and `~/.shortcuts/tasks/`
(silent, sends a notification).

## Install

1. Install **Termux:Widget** from F-Droid.
2. Long-press the home screen → **Widgets** → **Termux Widget**.
3. Tap the widget, then long-press it → **Reconfigure** to refresh the list.

## Visible shortcuts (`~/.shortcuts/`)

| Widget | What it does |
|--------|--------------|
| `ZES Start All` | Runs `~/start-all.sh` (full service launcher, colored output) |
| `ZES Stop All` | Runs `~/stop-all.sh` (graceful stop → force → scrub) |
| `ZES Health` | `zes-audit` harness health + battery + disk + RAM |
| `ZES Status` | runsv service states + port probes (BitRouter, Codex, Claude, ZES Dash, Hermes, Collector, 9Router) |
| `ZES Memory Sync` | `zes-memory-bridge cron` — import Codex/claude-mem → export to all agents |
| `ZES Dashboard` | Ensure `:5051` up, then open `http://127.0.0.1:5051` |
| `ZES Hermes` | Ensure Hermes Dashboard `:9119` up, then open it |
| `ZES BitRouter` | Status probe + optional restart (y/N) |
| `ZES Battery` | Battery, WiFi, uptime, disk, RAM |

## Background tasks (`~/.shortcuts/tasks/`)

| Task | What it does |
|------|--------------|
| `start-all` | Runs `~/start-all.sh` in background; notification with result |
| `health-alert` | Runs `zes-audit`; notification with health % + down count |
| `memory-sync` | Runs `zes-memory-bridge cron`; notification with result |
| `open-dashboard` | Ensures `:5051` up and opens it in the browser |

## Notes

- Every widget exports `HERMES_HOME=~/.hermes/profiles/hermes_zes` so Hermes
  subprocesses never fall back to the default profile.
- Logs: visible runs print to the terminal; the background `start-all` task
  logs to `~/logs/widget-start-all.log`.
- All scripts are executable and self-contained — safe to copy to any device
  with the ZES repo checked out at `~/Zes-System`.
