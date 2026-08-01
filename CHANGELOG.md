# Changelog

All notable changes to ZES OS will be documented in this file.

## [4.2.2] — 2026-08-01

### Fixed
- New Company dialog now renders as full-screen mobile overlay via `createPortal` (escapes sidebar stacking context); no longer stuck in "Creating…" state
- Mobile bottom nav no longer covers page content: layout padding + full-viewport pages (Mindwalk, Topology 3D, Wireflow) subtract `--bottom-nav-h` safe-area offset

## [4.2.1] — 2026-07-31

### Added
- OpenHuman-style d3-force Memory Graph at `/memory-graph` on ZES Dashboard (:5051)
- Holographic `entities` endpoint in `scripts/memory_api.py` (entity facts + badges)
- Option B: relation triples — `relations` table, verb + co-occurrence extraction at insert, `relations` / `insert_relation` / `seed_relations` commands

### Changed
- Left drawer: `Showcase` → `Design Hub`

### Fixed
- Memory API contract mismatch (dashboard expected holographic schema, API served raw arrays)

## [4.2.0] — 2026-07-30

### Changed
- Rebranded to "ZES OS" (Zes Orchestration System)
- Updated all documentation and git remotes
- Migrated from 9Router to BitRouter (:4356)
- Professional README with badges and service matrix

### Fixed
- React hydration error #418 (NumberFlow SSR mismatch)
- Invalid `optimizeFonts` config key in next.config.ts
- Removed broken font preloads (Rebels-Fett)

## [4.1.0] — 2026-07-26

### Added
- Memory Hub v1 with cross-agent sync
- Frost Design System (4-color glassmorphic cards)
- 31 dashboard pages

### Changed
- OpenClaude → Claude Code CLI migration
- ZES Dashboard moved to port 5051

## [4.0.0] — 2026-07-16

### Added
- Initial ZES System with Agent Trinity
- 9Router AI Gateway
- Termux deployment scripts
- Shared memory between agents

### Security
- Tor network integration
- Secrets management via master.env

---

*Older versions not tracked in this changelog.*

## [4.3.0] — 2026-07-30

### Added
- Q3.1: Dashboard Unification — cyber dashboard archived, port 7070 deprecated, all routes through :5051
- Q3.2: Memory Hub v2 — inline memory editing (create/edit/delete), auto-refresh toggle, FTS5 search API
- Q3.3: Mobile Optimization — bottom navigation bar, safe-area-inset support, touch targets 24px min
- Q3.4: Service Management — start/stop/restart API for all core services (codex, hermes, bitrouter, etc.)

## [4.3.1] — 2026-07-31

### Changed
- BitRouter now runs as a persistent runsv service (`sv start bitrouter`) — survives restarts
- 9Router re-purposed as the **control plane**: provider connections, API keys, proxy pools & usage tracking (:20128, runsv r9)
- BitRouter is the **data plane**: LLM routing across 54 models (:4356, runsv bitrouter)
- Codex config.toml: `[model_providers.bitrouter]` added (base_url :4356/v1)
- `claude-9router-proxy.js` renamed → `claude-bitrouter-proxy.js` (routes to BitRouter :4356)
- Dashboard /9router page describes provider & key management; sidebar shows both BitRouter + 9Router

## [4.3.2] — 2026-08-01

### Added
- **Mindwalk** — 3D agent-session replay at `/mindwalk` on ZES Dashboard (:5051), under the System group
  - Native Next.js port of `cosmtrek/mindwalk` (no Go binary): squarified-treemap citymap over `~/.codex/sessions` + `~/.claude/projects` JSONL traces (22 Codex + 62 Claude sessions detected)
  - Frost-themed 3D city (InstancedMesh + Three.js): attention-height touch colors (moss/read/edited), LOC-height terrain mode, walker glow, dir labels, click-to-inspect, scrub playback with histogram + speed, 12-chip HUD (fovea/parafovea/error-rate/churn…)
  - New APIs: `/api/mindwalk/sessions`, `/api/mindwalk/trace`, `/api/mindwalk/map` (Node runtime, path-traversal guarded)
  - Graceful WebGL fallback — orange frost card instead of a page crash when a browser can't create a WebGL context

### Dependencies
- Dashboard: `three@0.185.1` + `@types/three`
