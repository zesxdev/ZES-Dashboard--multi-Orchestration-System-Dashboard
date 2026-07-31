# Changelog

All notable changes to ZES OS will be documented in this file.

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
- 9Router (:20128) retired: service stopped + disabled, references removed from start-all.sh, zes CLI, dashboard
- Codex config.toml: `[model_providers.bitrouter]` added (base_url :4356/v1), 9router provider removed
- `claude-9router-proxy.js` renamed → `claude-bitrouter-proxy.js` (routes to BitRouter :4356)
- Dashboard /9router page now points to BitRouter :4356
