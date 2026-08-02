# Changelog

All notable changes to ZES OS will be documented in this file.

## [4.2.9] — 2026-08-02

### Added
- **Usage history persistence** — new runsv daemon `usage-snapshot` (`~/bin/usage-snapshot.py`): scrapes collector Prometheus
  metrics every 5 min, computes interval deltas, appends to `~/.zes/usage-history.jsonl` (max 500 entries). Preserves history
  beyond the collector's 15-min metric retention
- Dashboard `/usage` now includes a **latency distribution chart** (histogram of duration buckets) and **usage history chart**
  (requests + input/output tokens over time, last 12h at 5-min snapshots) plus latency stats (avg/p50/p95/samples)
- API `/api/usage` extended with `latencyDist` (per-bucket counts from cumulative duration buckets) and `history`
  (last 144 JSONL snapshots)

## [4.2.8] — 2026-08-01

### Added
- BitRouter OTLP exporter wired to a **local OTel Collector** (runsv `otelcol`, core v0.121.0, proot Debian):
  `plugins.bitrouter-observe.otel` (metrics enabled, metadata-only capture, no content) + `OTEL_EXPORTER_OTLP_ENDPOINT` env
  (proot strips env — injected via the runsv run script's inner `bash -c`, same trick as the API keys)
- `otlp-dispatcher` (runsv, `bin/otlp-dispatcher.py`) on `:4318` — BitRouter posts both signals to one endpoint (path `/`,
  opentelemetry-otlp 0.32 `with_endpoint` does not append signal paths), so the dispatcher sniffs the protobuf payload
  (trace_id = 16 binary bytes vs metric name = ASCII) and forwards to the collector's `/v1/traces` / `/v1/metrics` (`:4320`)
- Collector exposes **Prometheus metrics at `:4319/metrics`**: `zes_bitrouter_requests_total`,
  `zes_gen_ai_client_token_usage_*` (input/output tokens), `zes_gen_ai_client_operation_duration_seconds_*` (latency histogram),
  labeled by provider/model/outcome/user; traces land in the debug exporter
- Dashboard **`/usage`** page (sidebar System → Usage): frost stat cards (requests, input/output tokens, avg latency + p95),
  per-model breakdown table, pipeline status; API route `/api/usage` scrapes `:4319`

### Notes
- First-party BitRouter cloud telemetry (`telemetry.bitrouter.ai`) is OFF — the `telemetry:` opt-in block was removed so the
  local `otel:` block wins; all telemetry stays on-device

## [4.2.7] — 2026-08-01

### Changed
- Usage tracking moved **fully** to BitRouter (`:4356`) — 9Router is now a pure provider control plane (provider connections, API keys, proxy pools only)
- BitRouter telemetry enabled via `plugins.bitrouter-observe.telemetry` (`level: metadata`) — per-request model, input/output tokens, latency, finish reason, and routing decisions; OTLP GenAI metrics available via `plugins.bitrouter-observe.otel` (`/metrics`)
- Dashboard `/9router` re-roled as control plane; `/bitrouter` now advertises usage tracking (data plane)

## [4.2.6] — 2026-08-01

### Added
- Memory Hub MCP server (`scripts/zes-memory-mcp.py`, stdio, FastMCP):
  tools `memory_search`, `memory_vector_search`, `memory_get`, `memory_insert`,
  `memory_recent`, `memory_stats`, `memory_relations`, `memory_consolidate`;
  resource `memory://stats` — registered with Codex CLI (`config.toml`) and Claude Code (`~/.claude.json`)
- Dashboard `/memory`: SEMANTIC toggle — vector search with score badges
  (API route `/api/memory?path=vector-search`)

### Fixed
- `consolidate()` purges orphan vectors; vector coverage stats capped at 100%

## [4.2.5] — 2026-08-01

### Added
- Memory Hub vector search (ruflo research adoptions):
  - `memory_vectors` table (schema v2), Gemini `gemini-embedding-2` (3072-dim) primary embedder with deterministic local-hash fallback (512-dim)
  - `MemoryStore.semantic_search()` — cosine ranking RRF-fused with FTS5; retry-once when query falls back while Gemini vectors exist
  - `MemoryStore.embed_all()` — backfill; auto-upgrades `local-hash` rows to Gemini once quota recovers
  - CLI: `zes-memory-bridge embed [--force]`, `zes-memory-bridge search <query>`
  - API: `memory_api.py vector_search <query> [limit]`, `embed_all [force]`
- `MemoryStore.consolidate()` — dedup metric telemetry, prune stale low-usage metrics, optimize FTS (removed 993 duplicates on first run: 1644 → 658 memories)
- `zes-memory-sync` runsv cycle now: export → consolidate → embed (every 15 min)
- Loop receipts: codex/claude self-improvement pipelines append `type: receipt` (outcome, duration, counts) to `~/.zes/learnings/`

## [4.2.4] — 2026-08-01

### Fixed
- Claude Code tool calls failing with DeepSeek 400 ("assistant message with tool_calls must be followed by tool messages") — Claude Proxy v3 now converts Anthropic ↔ OpenAI itself (tool messages ordering, `reasoning_content` echo-back, SSE reconstruction) instead of relying on BitRouter's Anthropic adapter; verified with real Bash tool round-trip via `claude-deepseek`

## [4.2.3] — 2026-08-01

### Fixed
- `claude-deepseek` runner was still pointed at retired 9Router (`:20128`, `oc/` model, stale key) — rewired to Claude Proxy :5905 → BitRouter :4356 → `deepseek/deepseek-v4-flash-free`; managed copy added at `scripts/claude-deepseek`

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
- 9Router re-purposed as the **control plane**: provider connections, API keys, proxy pools (:20128, runsv r9) — usage tracking later moved fully to BitRouter (v4.2.7)
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
