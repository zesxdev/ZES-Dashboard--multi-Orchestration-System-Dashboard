# codex — 46 memories

### 🔴 [pattern] Claude Code can be routed through 9Router (:20128) via ANTHROPIC_BASE_URL to run non-Claude models. 9Router translates A
- **Created:** 2026-07-26 21:11
- **Tags:**      

### 🔴 [decision] Legacy z8s namespace fully migrated to ZES. ~/.z8s/learnings/ → ~/.zes/learnings/, ~/.z8s/contexts/ → ~/.zes/contexts/. 
- **Created:** 2026-07-26 11:22
- **Tags:**    

### 🟡 [pattern] Codex CLI has no automated self-improvement loop. Hermes has zes-self-improvement orchestrator with feedback loop. Codex
- **Created:** 2026-07-26 11:11
- **Tags:**    

### 🔴 [decision] OpenClaude fully replaced by official Claude Code CLI. Old gRPC server at :50051 decommissioned. Claude Code now runs vi
- **Created:** 2026-07-26 11:11
- **Tags:**   

### 🟡 [fact] ZES Agent Trinity: Codex CLI (primary coder), Claude Code (secondary coder/reviewer), Hermes (orchestrator/memory). Thre
- **Created:** 2026-07-26 11:11
- **Tags:**   

### 🟡 [fact] Canonical ZES repo at github.com/ZESCODE/Zes-Orchestration-System contains updated AGENTS.md, soul files (codex-soul.md,
- **Created:** 2026-07-26 11:11
- **Tags:**   

### 🟡 [pattern] Manual start commands: Codex = `npx codexapp`, Hermes CLI = `hermes`, Hermes Dashboard = `hermes dashboard`. These bypas
- **Created:** 2026-07-26 11:11
- **Tags:**   

### 🟡 [fact] Manual start commands: Codex Web UI = `npx codexapp`, Hermes CLI = `hermes`, Hermes Dashboard = `hermes dashboard`
- **Created:** 2026-07-26 10:25
- **Tags:**    

### 🟡 [fact] Codex CLI uses model 'opencode-zen:deepseek-v4-flash-free' via BitRouter provider at http://localhost:4356/v1
- **Created:** 2026-07-26 10:25
- **Tags:**   

### 🟡 [fact] Hermes uses BitRouter at http://localhost:4356/v1 with model deepseek-v4-flash-free, fallback OpenRouter at http://local
- **Created:** 2026-07-26 10:25
- **Tags:**  

### 🟡 [fact] ZES Dashboard sidebar synced with deployed version — 5 groups: Tools, Company, Orchestration, System, Agents — 38 items,
- **Created:** 2026-07-26 10:25
- **Tags:**   

### 🟡 [fact] start-all.sh Codex start fixed — removed unsupported CLI flags, now: npx codexapp -p 5900 --no-tunnel --no-open
- **Created:** 2026-07-26 10:25
- **Tags:**   

### 🔴 [decision] GitHub access established for zesxdev/ZES-Systemv2 using GITHUB_PAT_ZESXDEV. Pushed 5 commits (AGENT_ONBOARDING.md, NVID
- **Created:** 2026-07-16 13:33
- **Tags:**      

### 🔴 [decision] Extended AGENTS.md anchor coverage: added 3 intermediate anchors at ~/Documents/Codex/, ~/Documents/Codex/2026-07-16/, a
- **Created:** 2026-07-16 13:25
- **Tags:**      

### 🔴 [decision] Created ~/AGENTS.md as the top-level anchor file. Every new Codex session starting from ~ or any subdirectory now auto-l
- **Created:** 2026-07-16 13:24
- **Tags:**      

### 🔴 [rule] PREVENTIVE: Codex MUST NOT create standalone fix-*.md, TODO-*.md, or temp scripts in home directory. All logs go to ~/lo
- **Created:** 2026-07-15 12:46
- **Tags:**    

### 🔴 [fact] Hermes v0.18.2 full audit: 15 sessions (Jul 12-15), gateway running, profile hermes_zes active, HERMES_HOME set correctl
- **Created:** 2026-07-15 12:35
- **Tags:**     

### 🔴 [fact] Hermes memory plugins: 9 registered (byterover, hindsight, holographic, honcho, mem0, openviking, retaindb, supermemory,
- **Created:** 2026-07-15 12:35
- **Tags:**    

### 🔴 [decision] Phase 1 - Weave Tracing: Implemented NVIDIA Blueprint traceability pattern. Created tracing.py with init_tracing(), trac
- **Created:** 2026-07-15 12:25
- **Tags:**      

### 🔴 [decision] Phase 2 - Enhanced RAG-style Search: Inspired by NVIDIA RAG Blueprint. Created enhanced_search.py with: query decomposit
- **Created:** 2026-07-15 12:25
- **Tags:**      

### 🔴 [decision] Phase 3 - MLRun-style Orchestrator: Inspired by NVIDIA AI Orchestration for Data Flywheel blueprint. Created orchestrato
- **Created:** 2026-07-15 12:25
- **Tags:**      

### 🟡 [fact] NVIDIA Blueprints research via NGC API (25 found). Top 3 relevant to ZES: (1) Traceability for Agentic AI by wandb - add
- **Created:** 2026-07-15 12:15
- **Tags:**     

### 🔴 [decision] ZES repo pushed to GitHub: https://github.com/zesxdev/ZES-Systemv2 (public). Owner: zesxdev. Remote origin set to HTTPS.
- **Created:** 2026-07-15 10:52
- **Tags:**     

### 🟡 [decision] ZES repo initialized at ~/Documents/Codex/2026-07-12/system-status/ (git, main branch, 145 files). MIT license, NOTICE f
- **Created:** 2026-07-15 10:36
- **Tags:**     

### 🟡 [decision] Main Gmail for ZES stack changed from arfaxtrade@gmail.com to arfaxredmi@gmail.com in master.env. Old GMAIL_APP_PASSWORD
- **Created:** 2026-07-15 10:36
- **Tags:**   

### 🟡 [decision] All credentials consolidated into ~/.secure-credentials/master.env (60 keys). Duplicate .env files removed (~/.hermes/.e
- **Created:** 2026-07-15 10:27
- **Tags:**    

### 🔴 [decision] Hermes profile fix: active_profile=hermes_zes but HERMES_HOME was unset, causing fallback to DEFAULT profile. Fixed by e
- **Created:** 2026-07-15 10:05
- **Tags:**     

### 🔴 [pattern] PROFILE VERIFICATION RULE: When a service has an active_profile setting, always check that the corresponding env var (e.
- **Created:** 2026-07-15 10:05
- **Tags:**     

### 🔴 [pattern] VERIFY REAL PATHS RULE: Before claiming any task is done, always verify the change is in the REAL running path, not a co
- **Created:** 2026-07-15 10:03
- **Tags:**     

### 🔴 [decision] ZES Memory Hub configuration: config.yaml at ~/.hermes/config.yaml has memory.provider=zes_memory. The ZES store DB is a
- **Created:** 2026-07-15 10:03
- **Tags:**    

### 🔴 [pattern] SERVICE VERIFICATION RULE: Before modifying any service, run: (1) which <service> to find the real binary. (2) ps aux | 
- **Created:** 2026-07-15 10:03
- **Tags:**    

### 🔴 [pattern] Clickable link protocol: use http://localhost:5900/codex-local-browse/<absolute_path> for file links. .md files render a
- **Created:** 2026-07-15 02:32
- **Tags:**     

### 🔴 [pattern] CORRECT clickable link protocol for files: always use http://localhost:5900/codex-local-browse/<absolute_path>. Example:
- **Created:** 2026-07-15 02:26
- **Tags:**    

### 🔴 [pattern] ZES unified service management: ~/start-all.sh starts all services (Codex :5900, 9Router :20128, Hermes :9119, Flask :50
- **Created:** 2026-07-15 02:08
- **Tags:**    

### 🟡 [decision] All ZES service logs are centralized to ~/logs/<service>/<service>.log with PID files at ~/logs/<service>/<service>.pid.
- **Created:** 2026-07-15 02:08
- **Tags:**   

### 🟡 [pattern] ZES Memory Sync Daemon runs as a background process (started by start-all.sh), syncing between Codex memories_1.sqlite, 
- **Created:** 2026-07-15 02:08
- **Tags:**    

### 🔴 [pattern] Codex must follow the 4-phase QC workflow for every task: Phase 0 CLARIFY (ask questions, write DoD), Phase 1 PLAN (blue
- **Created:** 2026-07-15 01:53
- **Tags:**    

### 🔴 [pattern] Raw JS/CSS copy-paste protocol: Step 1 Deconstruct dependencies & check imports. Step 2 Micro-lint (JSX closure, key pro
- **Created:** 2026-07-15 01:53
- **Tags:**     

### 🔴 [fact] ZES (ZES Ecosystem System) is a unified personal AI orchestration system running on Termux (Android). Components: Codex 
- **Created:** 2026-07-15 01:53
- **Tags:**    

### 🔴 [decision] Hermes is the central memory authority for ZES. Memory architecture: ZESMemoryProvider (Hermes ABC) wraps ZES SQLite+FTS
- **Created:** 2026-07-15 01:53
- **Tags:**     

### 🟡 [fact] ZES Dashboard ports: :5173 (main ZES dashboard, React+shadcn), :9119 (Hermes chat UI), :20128 (9Router AI gateway), :808
- **Created:** 2026-07-15 01:53
- **Tags:**    

### 🔴 [pattern] Always provide clickable links: file paths (relative or absolute), web URLs (http/https), and thread links (codex://thre
- **Created:** 2026-07-15 01:53
- **Tags:**    

### 🟡 [fact] ZES has 28 branded skills in .agents/skills/ directory and 46 ECC skills. Core ZES skills include: orchestrator, service
- **Created:** 2026-07-15 01:53
- **Tags:**    

### 🟡 [pattern] When showing web pages or dashboards, always provide clickable http links. Example: http://localhost:5173 for ZES dashbo
- **Created:** 2026-07-15 01:53
- **Tags:**    

### 🔴 [fact] Memory pipeline: Codex's native memories_1.sqlite has stage1_outputs table (per-thread memory). ZES hub uses its own SQL
- **Created:** 2026-07-15 01:53
- **Tags:**    

### 🔴 [decision] ZES Design System: Deep blue glowing futuristic UI. Base bg #0A1628, surface gradient #0B1E3A->#0D2B4D, glow #4A9EFF. Mo
- **Created:** 2026-07-15 01:53
- **Tags:**     

