# ZES OS — Roadmap

> **Version:** 4.2.0 · **Last Updated:** 2026-07-30

---

## Current State (v4.2.0)

- ✅ Agent Trinity: Codex + Hermes + Claude Code
- ✅ BitRouter AI Gateway with 53+ models, 12 providers
- ✅ ZES Memory Hub (57+ shared facts across agents)
- ✅ Frost Design System (4-color glassmorphic UI)
- ✅ 31-page unified dashboard on Next.js 15
- ✅ 96 skills across all agents
- ✅ Tor network integration for privacy

---

## Short-Term (Q3 2026)

### 1. Dashboard Unification
- **Goal:** Single dashboard instance serving all agents
- **Actions:**
  - [x] Merged cyber dashboard into main dashboard (`:5051`)
  - ✅ Port `:7070` deprecated, cyber dashboard archived
  - Unified authentication across all dashboard pages

### 2. Memory Hub v2
- [x] **Goal:** Real-time cross-agent memory sync
- **Actions:**
  - [x] Inline memory editing from dashboard
  - [x] Memory API fixed and working
  - [x] Inline memory editing from dashboard
  - Memory search with vector embeddings

### 3. Mobile Optimization
- [x] **Goal:** Fully functional on phone screens
- **Actions:**
  - [x] Bottom navigation bar for mobile
  - [x] Touch targets optimized (24px minimum)
  - [x] Mobile-responsive topology diagrams
  - [x] Safe-area-inset support for notched phones

### 4. Zero-Downtime Service Management
- [x] **Goal:** Start/stop/restart services from dashboard
- **Actions:**
  - Service control panel with run/sv commands
  - [x] Health check endpoint with auto-refresh
  - One-click log viewer
  - Service dependency graph

---

## Medium-Term (Q4 2026)

### 5. Plugin Marketplace
- **Goal:** Install third-party agent skills from catalog
- **Actions:**
  - Skill registry with versioning
  - One-command install from GitHub
  - Skill dependency management
  - Community skill submissions

### 6. CI/CD Pipeline
- **Goal:** Automated testing & deployment
- **Actions:**
  - GitHub Actions for dashboard builds
  - Preview deployments on Vercel
  - Automated accessibility audits
  - Visual regression testing

### 7. Cross-Agent Eval Framework
- **Goal:** Benchmark agent performance
- **Actions:**
  - Task completion scoring
  - Response time tracking
  - Cost-per-task analytics
  - Agent comparison dashboard

### 8. Telemetry & Monitoring
- **Goal:** System health observability
- **Actions:**
  - LLM request/response logging
  - Token usage tracking per agent
  - Service uptime monitoring
  - Alert system for failures

---

## Long-Term (2027)

### 9. Web-Based Agent Orchestration UI
- **Goal:** Manage all agents from a browser
- **Actions:**
  - Agent lifecycle management UI
  - Task assignment & scheduling
  - Visual workflow builder
  - Multi-session management

### 10. ZES Cloud Sync
- **Goal:** Cross-device agent state sync
- **Actions:**
  - Encrypted cloud memory backup
  - Multi-device agent mesh
  - Sync conflict resolution
  - Offline-first architecture

### 11. Multi-Device Mesh
- **Goal:** Distribute agents across devices
- **Actions:**
  - Hermes on server, Codex on phone
  - Shared task queue across devices
  - Device capability discovery
  - Load-balanced LLM routing

### 12. Advanced Security
- **Goal:** Production-grade security
- **Actions:**
  - End-to-end encryption for agent comms
  - Role-based access control
  - Audit logging
  - Secrets rotation automation

---

## How to Contribute

1. Pick any item from the roadmap
2. Open an issue to discuss approach
3. Fork the repo and implement
4. Submit a PR with tests and docs

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

*This roadmap is a living document — priorities may shift based on community feedback and emerging needs.*
