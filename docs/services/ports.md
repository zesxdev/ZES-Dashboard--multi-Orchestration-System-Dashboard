# Service Port Reference (v4.1)

| Service | Port | URL | Managed By |
|---------|------|-----|------------|
| **Codex Web UI** | 5900 | http://127.0.0.1:5900 | npx codexapp |
| **BitRouter** | 4356 | http://127.0.0.1:4356/v1 | bitrouter-start (proot) |
| **Claude Code Proxy** | 5905 | — | runsv (claude-proxy) |
| **Hermes Dashboard** | 9119 | http://127.0.0.1:9119 | runsv (hermes-dashboard) |
| **ZES Dashboard** | 5173 | http://127.0.0.1:5173 | Vite |
| **ZES User Dashboard** | 4000 | http://127.0.0.1:4000 | Vite |
| **ZES Cyber Dashboard** | 7070 | http://127.0.0.1:7070 | Next.js (45 pages, 21 API routes) |
| **Bridge Server** | 5300 | — | Node.js |
| **Tor SOCKS5** | 9050 | — | runsv (tor) |
| **Tor Control** | 9051 | — | runsv (tor) |

## Dashboard Page Routes

| Route | Page Description |
|-------|-----------------|
| `/` | Overview — system stats, health, ranking |
| `/9router` | Legacy 9Router status (read-only) |
| `/activity` | Real-time activity feed |
| `/agents/[id]` | Agent detail view |
| `/amux` | AMUX → redirects to Teams |
| `/claude` | Claude agent status |
| `/claude-chat` | Claude Code bridge (:5905) |
| `/claude-code` | Claude Code terminal |
| `/cloud` | Cloud sync configuration |
| `/codex-web` | Codex Web UI status |
| `/communication` | Agent communication hub |
| `/company` | Board Room — company overview |
| `/company/[id]` | Company detail |
| `/company/budget` | Budget management |
| `/company/compare` | Company comparison |
| `/company/hire` | Hire agent interface |
| `/company/org-chart` | Organization chart |
| `/company/pipeline` | Pipeline view |
| `/company/strategy` | Strategic planning |
| `/dashboard-config` | Dashboard settings |
| `/hermes` | Hermes dashboard bridge |
| `/hermes-chat` | Hermes chat interface |
| `/kanban` | Task kanban board |
| `/laboratory` | Experiments playground |
| `/memory` | Memory Hub viewer |
| `/memory-graph` | Memory graph visualization |
| `/network` | Network topology |
| `/openclaude` | Legacy OpenClaude status |
| `/orchestrator` | Agent orchestrator |
| `/org-chart` | System org chart |
| `/processes` | Running processes |
| `/reports` | System reports |
| `/scheduler` | Scheduled tasks |
| `/service` | Service status |
| `/showcase` | Frost design system showcase |
| `/skills` | ZES skills directory |
| `/system` | System information |
| `/tasks` | Task management |
| `/teams` | Teams control plane |
| `/templates` | Task templates |
| `/terminal` | Web terminal |
| `/topology` | System topology |
| `/webhooks` | Webhook management |
| `/wireflow` | Wiring diagram visualization |
| `/workflows` | Workflow automation |

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/activity` | Activity feed data |
| `/api/agents/[id]` | Agent details |
| `/api/cloud` | Cloud sync status |
| `/api/company` | Company roster |
| `/api/company/[id]` | Company detail |
| `/api/company/budget` | Budget data |
| `/api/company/pipeline` | Pipeline data |
| `/api/company/roster` | Employee roster |
| `/api/company/tracker` | Budget tracker |
| `/api/memory` | Memory hub data |
| `/api/memory-hub` | Memory search |
| `/api/proxy-status` | Claude proxy health |
| `/api/reports` | Report generation |
| `/api/roadmap` | Roadmap data |
| `/api/scheduler` | Scheduler CRUD |
| `/api/service-check` | Service health check |
| `/api/task-templates` | Task templates |
| `/api/tasks` | Task CRUD |
| `/api/teams-proxy` | Teams proxy |
| `/api/webhooks` | Webhook CRUD |

## Retired Services

| Service | Port | Replaced By |
|---------|------|-------------|
| 9Router | 20128 | BitRouter (:4356) |
| Flask API | 5002 | Next.js dashboard |
| OpenClaude gRPC | 50051 | Claude Proxy (:5905) |
