# 🔴 High Priority — 37 entries

- [2026-07-27 12:29] [architecture] [claude-code] TIER 2 implementation complete: zflow (checkpointed workflow runner with SQLite-based resume), zroute (intelligent model router for 53 BitRouter models), zloop (subconscious goal-advancing background 
  tags: tier2,zflow,zroute,zloop,openhuman,workflows,router,subloop
- [2026-07-27 12:23] [architecture] [claude-code] TIER 1 implementation complete: zjuice (TokenJuice compressor - 98% reduction via BitRouter), zcontext (SuperContext pre-read - memory hub sweep), zautofetch (auto-fetch daemon - GitHub + file polling
  tags: tier1,openhuman,zjuice,zcontext,zautofetch,tooling
- [2026-07-27 12:18] [architecture] [claude-code] Created zjuice (TokenJuice compressor), zcontext (SuperContext pre-read), zautofetch (20min memory auto-fetch pipeline) inspired by OpenHuman's architecture. zjuice achieves 98% compression via BitRou
  tags: tool,zjuice,zcontext,zautofetch,openhuman,tier1
- [2026-07-26 21:11] [pattern] [codex] Claude Code can be routed through 9Router (:20128) via ANTHROPIC_BASE_URL to run non-Claude models. 9Router translates Anthropic Messages API format to OpenAI format for providers like OpenCode. Worki
  tags: claude-code,9router,deepseek,zes,gateway,translation
- [2026-07-26 11:22] [decision] [codex] Legacy z8s namespace fully migrated to ZES. ~/.z8s/learnings/ → ~/.zes/learnings/, ~/.z8s/contexts/ → ~/.zes/contexts/. All skill references (ZES-learn, ZES-plan, ZES-spec, ZES-context, ZES-self-impro
  tags: migration,z8s,zes,rebranding
- [2026-07-26 11:19] [decision] [codex-self-improve] Codex and Claude Code upgraded with automated self-improvement. ZES-self-improvement skill created with Python pipeline (mirrors Hermes orchestrator) and Claude Code reflection script. Both run as run
  tags: self-improvement,codex,claude,upgrade,pipeline
- [2026-07-26 11:11] [decision] [codex] OpenClaude fully replaced by official Claude Code CLI. Old gRPC server at :50051 decommissioned. Claude Code now runs via proxy at :5905 inside Debian proot. All AGENTS.md and docs updated.
  tags: architecture,migration,claude
- [2026-07-19 00:03] [decision] [hermes] Bridge server.cjs patched with profile-aware model selection: reads ~/.hermes/profiles/<profile>/config.yaml for model.default and model.provider, maps provider to 9Router prefix (opencode-zen -> oc/)
  tags: ["zes", "recent"]
- [2026-07-19 00:03] [decision] [hermes] Tor IP rotator at ~/.hermes/profiles/hermes_zes/scripts/tor-ip-rotator.py. PySocks + Tor ControlPort for SIGNAL NEWNYM + country rotation via SETCONF ExitNodes. Daemon checks 68% threshold, auto-rotat
  tags: ["zes", "recent"]
- [2026-07-19 00:03] [fact] [hermes] ZES default model: oc/deepseek-v4-flash-free via 9Router (:20128). All agents (Codex, Hermes, OpenClaude) use this default through 9Router. 9Router runs under torsocks for Tor IP rotation.
  tags: ["zes", "recent"]
- [2026-07-19 00:03] [decision] [hermes] Bridge server.cjs patched with profile-aware model selection: reads ~/.hermes/profiles/<profile>/config.yaml for model.default and model.provider.
  tags: ["zes", "recent"]
- [2026-07-16 13:33] [decision] [codex] GitHub access established for zesxdev/ZES-Systemv2 using GITHUB_PAT_ZESXDEV. Pushed 5 commits (AGENT_ONBOARDING.md, NVIDIA blueprints, Tor comment). Remote URL set with embedded token for frictionless
  tags: github,zesxdev,ZES-Systemv2,token,push,git
- [2026-07-16 13:25] [decision] [codex] Extended AGENTS.md anchor coverage: added 3 intermediate anchors at ~/Documents/Codex/, ~/Documents/Codex/2026-07-16/, and the current project directory. Full parent chain now has 4 AGENTS.md files fr
  tags: onboarding,agents,AGENTS.md,anchor,discovery,parent-chain
- [2026-07-16 13:24] [decision] [codex] Created ~/AGENTS.md as the top-level anchor file. Every new Codex session starting from ~ or any subdirectory now auto-loads pointers to the ZES AGENTS.md (system-status/AGENTS.md) and AGENT_ONBOARDIN
  tags: onboarding,agents,AGENTS.md,anchor,discovery,ZES
- [2026-07-16 12:37] [fact] [agent:check-start-all-sh-line-25] Android/Termux Environment Facts for Agents

CRITICAL: /tmp does NOT exist on Android/Termux. Never write to /tmp. Use $HOME/logs/ or $HOME/.cache/ instead.
No systemd — use runsv, nohup+disown, or Te
  tags: android,termux,environment,rules,fact,no-tmp,no-systemd
- [2026-07-15 12:46] [rule] [codex] PREVENTIVE: Codex MUST NOT create standalone fix-*.md, TODO-*.md, or temp scripts in home directory. All logs go to ~/logs/<service>/<service>.log. All scripts must be integrated into start-all.sh/sto
  tags: workflow,cleanup,loose-files,codex-behavior
- [2026-07-15 12:35] [fact] [codex] Hermes v0.18.2 full audit: 15 sessions (Jul 12-15), gateway running, profile hermes_zes active, HERMES_HOME set correctly. Dashboard at :9119 with session token auth. 9Router at :20128 routes all mode
  tags: hermes,audit,health,sessions,api
- [2026-07-15 12:35] [fact] [codex] Hermes memory plugins: 9 registered (byterover, hindsight, holographic, honcho, mem0, openviking, retaindb, supermemory, zes_memory). zes_memory is the active provider via memory.provider config. Plug
  tags: hermes,plugins,memory,zes_memory
- [2026-07-15 12:25] [decision] [codex] Phase 1 - Weave Tracing: Implemented NVIDIA Blueprint traceability pattern. Created tracing.py with init_tracing(), traced decorator. Added @traced to provider.py (prefetch, sync_turn, handle_tool_cal
  tags: nvidia,blueprints,weave,tracing,observability,phase1
- [2026-07-15 12:25] [decision] [codex] Phase 2 - Enhanced RAG-style Search: Inspired by NVIDIA RAG Blueprint. Created enhanced_search.py with: query decomposition (complex queries split into sub-queries), query expansion with ZES-specific 
  tags: nvidia,blueprints,rag,search,hybrid,phase2
- [2026-07-15 12:25] [decision] [codex] Phase 3 - MLRun-style Orchestrator: Inspired by NVIDIA AI Orchestration for Data Flywheel blueprint. Created orchestrator.py with PipelineOrchestrator class (6-step pipeline: collect, evaluate, extrac
  tags: nvidia,blueprints,mlrun,orchestration,pipeline,phase3
- [2026-07-15 10:52] [decision] [codex] ZES repo pushed to GitHub: https://github.com/zesxdev/ZES-Systemv2 (public). Owner: zesxdev. Remote origin set to HTTPS. Local path: ~/Documents/Codex/2026-07-12/system-status/. 238 files on remote.
  tags: repo,github,remote,push,zesxdev
- [2026-07-15 10:05] [decision] [codex] Hermes profile fix: active_profile=hermes_zes but HERMES_HOME was unset, causing fallback to DEFAULT profile. Fixed by exporting HERMES_HOME=~/.hermes/profiles/hermes_zes in start-all.sh before starti
  tags: zes,hermes,profile,hermes_home,config
- [2026-07-15 10:05] [pattern] [codex] PROFILE VERIFICATION RULE: When a service has an active_profile setting, always check that the corresponding env var (e.g. HERMES_HOME) is set before starting the service. Check: (1) cat ~/.config/<se
  tags: workflow,qc,verification,profiles,env-vars
- [2026-07-15 10:03] [pattern] [codex] VERIFY REAL PATHS RULE: Before claiming any task is done, always verify the change is in the REAL running path, not a copy. Check: (1) Find the actual service location (which hermes, which node, ps au
  tags: workflow,qc,verification,paths,anti-pattern
- [2026-07-15 10:03] [decision] [codex] ZES Memory Hub configuration: config.yaml at ~/.hermes/config.yaml has memory.provider=zes_memory. The ZES store DB is at ~/.zes/memory_hub.sqlite. The plugin code is at ~/hermes-agent/plugins/memory/
  tags: zes,memory,hermes,config
- [2026-07-15 10:03] [pattern] [codex] SERVICE VERIFICATION RULE: Before modifying any service, run: (1) which <service> to find the real binary. (2) ps aux | grep <service> to find the real running process and its arguments. (3) cat ~/.co
  tags: workflow,qc,services,running-processes
- [2026-07-15 02:32] [pattern] [codex] Clickable link protocol: use http://localhost:5900/codex-local-browse/<absolute_path> for file links. .md files render as text in browser. .sh and other executable files will download instead of displ
  tags: communication,links,protocol,codex-browse,sh-files
- [2026-07-15 02:26] [pattern] [codex] CORRECT clickable link protocol for files: always use http://localhost:5900/codex-local-browse/<absolute_path>. Example: http://localhost:5900/codex-local-browse/data/data/com.termux/files/home/.codex
  tags: communication,links,protocol,codex-browse
- [2026-07-15 02:08] [pattern] [codex] ZES unified service management: ~/start-all.sh starts all services (Codex :5900, 9Router :20128, Hermes :9119, Flask :5002, Bridge :5300, Dashboard :5173, OC gRPC, Memory Sync). ~/stop-all.sh graceful
  tags: zes,logging,services,startup
- [2026-07-15 01:53] [pattern] [codex] Codex must follow the 4-phase QC workflow for every task: Phase 0 CLARIFY (ask questions, write DoD), Phase 1 PLAN (blueprint with file list, get approval), Phase 2 IMPLEMENT (atomic edits, git add -p
  tags: workflow,qc,4-phase,agents
- [2026-07-15 01:53] [pattern] [codex] Raw JS/CSS copy-paste protocol: Step 1 Deconstruct dependencies & check imports. Step 2 Micro-lint (JSX closure, key prop, hook rules, null safety, event names, semicolons). Step 3 Tailwind/CSS valida
  tags: workflow,raw-code,css,javascript,copy-paste
- [2026-07-15 01:53] [fact] [codex] ZES (ZES Ecosystem System) is a unified personal AI orchestration system running on Termux (Android). Components: Codex CLI (coding agent), Hermes Agent (memory hub with self-improvement), OpenClaude 
  tags: zes,architecture,overview,components
- [2026-07-15 01:53] [decision] [codex] Hermes is the central memory authority for ZES. Memory architecture: ZESMemoryProvider (Hermes ABC) wraps ZES SQLite+FTS5 store, OC memdir adapter, and HermesNative adapter. Async write queue prevents
  tags: zes,memory,decision,architecture,hermes
- [2026-07-15 01:53] [pattern] [codex] Always provide clickable links: file paths (relative or absolute), web URLs (http/https), and thread links (codex://threads/<id>). Never use URIs like file:// or vscode://. Example: docs/superpowers/s
  tags: communication,links,formatting,ux
- [2026-07-15 01:53] [fact] [codex] Memory pipeline: Codex's native memories_1.sqlite has stage1_outputs table (per-thread memory). ZES hub uses its own SQLite+FTS5 store at hermes-agent/plugins/memory/zes_memory/zes_memory.db. codex_sy
  tags: memory,pipeline,architecture,sync
- [2026-07-15 01:53] [decision] [codex] ZES Design System: Deep blue glowing futuristic UI. Base bg #0A1628, surface gradient #0B1E3A->#0D2B4D, glow #4A9EFF. Mobile-optimized with hidden drawer. Used across all dashboard pages.
  tags: zes,design,ui,theme,mobile
