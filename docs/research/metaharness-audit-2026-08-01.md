# MetaHarness Audit — ZES OS (2026-08-01)

Method: manual audit scored against the ruflo MetaHarness rubric (readiness
scoring, MCP surface, genome fingerprint, drift detection). The automated
`ruflo metaharness score` could not run on-device: npm blocks `os: android`
for `@claude-flow/memory`, and inside the Debian proot the npx install
(384-skill package) exceeded a 15-min timeout on this ARM phone. Re-run
later on a desktop/mac if a second opinion is wanted.

## 1. Harness Readiness (0-10)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Agent config (AGENTS.md / CLAUDE.md) | 9 | Zes-System AGENTS.md, per-agent anchors, onboarding doc |
| Skills | 9 | ~100 skills incl. curated plugin skills; local copies for key ZES skills |
| Workflows | 7 | zflow (SQLite checkpointed), zloop daemon, runsv services |
| Memory | 8 | Memory Hub SQLite+FTS5, now +vectors (Gemini/local-hash), relations graph |
| MCP surface | 5 | Limited: no central MCP registry; zeschrome-mcp exists; ruflo ships 314 tools for comparison |
| Hooks | 7 | Claude Code hooks (PreToolUse, SessionStart), runsv daemons |
| Security guardrails | 6 | Safety skills, no-secrets rule, gated approvals; no PII pipeline |
| Testing | 5 | Ad-hoc; no harness-level test suite for agents/skills |
| Observability | 7 | zes-hud, dashboard :5051 health, structured logs (svlogd) |
| Federation | 0 | Single device; not needed |

**Readiness score: 6.3 / 10** — strong single-agent orchestration; weakest
areas are MCP surface, harness-level testing, and (by design) federation.

## 2. MCP Surface Map

| Server | Status | Tools/resources |
|--------|--------|-----------------|
| zeschrome-mcp | exists (skill: ZES-mcp-patterns) | Chrome automation |
| Memory Hub API | dashboard `memory_api.py` CLI (HTTP via :5051 route) | facts/relations/vectors/consolidate |
| BitRouter | OpenAI-compatible HTTP | models, routing (no MCP server) |
| Hermes | plugin toolsets (browser, web, memory…) | internal, not MCP-exposed |

Gap vs ruflo: a single registered MCP server exposing memory (search/store/
vectors) + service controls would lift the dashboard/agent integration.

## 3. Genome Fingerprint

- Language: Python + TypeScript + shell; runtime: Termux/Android aarch64 + Debian proot
- Agents: Codex CLI (primary), Claude Code (review/parallel), Hermes (orchestrator/memory)
- Gateway: BitRouter :4356 (data plane) + 9Router (control plane, keys/providers)
- Persistence: SQLite (memory hub, zflow), flat markdown exports
- Supervision: runsv (10+ services), svlogd structured logs

## 4. Drift Risks

- `~/.local/bin/*` and `~/.codex/skills/*` live outside Zes-System repo (HOME-level git) — reinstall/backup drift
- Docs (AGENTS.md) updated manually; memory hub auto-syncs
- 9Router (control plane) runs in proot; BitRouter binary not in repo (bitrouter.orig)

## 5. Recommendations (from audit)

1. Add an MCP server exposing Memory Hub (search/insert/vector/consolidate) for Codex + Claude Code
2. Track skills + ~/.local/bin scripts in Zes-System repo (install manifest) to kill drift risk
3. Add a harness test script: `zes-audit` — checks services, memory hub health, vector coverage, receipts freshness
4. Keep federation OFF; revisit only if a second device joins ZES

## Appendix: commands tried

```bash
# Host (blocked): npm os=android unsupported for @claude-flow/memory
npx ruflo@latest metaharness score --path ~/Zes-System
# Proot (timeout 900s): install exceeded limit on device
proot-distro login debian -- npx -y ruflo@latest metaharness score --path ...
```
