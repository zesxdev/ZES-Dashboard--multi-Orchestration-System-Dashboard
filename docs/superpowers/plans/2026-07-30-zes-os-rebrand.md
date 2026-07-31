# ZES OS Rebrand — From Dashboard-Repo to ZES Orchestration System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename and rebrand the main repo from `ZES-Dashboard--multi-Orchestration-System-Dashboard` to **ZES OS (Zes Orchestration System)** with professional documentation and future roadmap

**Architecture:** Update all local references, git remotes, docs, and branding across `~/Zes-System/`, `~/zes-dashboard/`, and `~/Documents/Codex/2026-07-27/zes-dashboard-frost/`. The name "ZES OS" replaces "ZES System", "ZES Dashboard", etc. as the canonical product name.

**Tech Stack:** Markdown docs, Next.js dashboard, Git, shell scripts

---

### Task 1: Update Git Remote & Core Identity Files

**Files:**
- Modify: `~/Zes-System/.git/config`
- Modify: `~/zes-dashboard/.git/config`
- Modify: `~/Zes-System/AGENTS.md`
- Modify: `~/Zes-System/README.md`

- [ ] **Update git remotes to new repo name**

```bash
# In ~/Zes-System
cd ~/Zes-System
git remote set-url origin https://github.com/zesxdev/zes-os.git

# In ~/zes-dashboard
cd ~/zes-dashboard
git remote set-url origin https://github.com/zesxdev/zes-os.git
```

- [ ] **Rewrite AGENTS.md header with new branding**

Replace the top section:
```markdown
# ZES OS — Zes Orchestration System

**Version:** 4.2.0
**Last Updated:** 2026-07-30
**Repo:** github.com/zesxdev/zes-os
```

- [ ] **Rewrite README.md with professional branding**

Full rewrite with logo ASCII, tagline, badges, architecture diagram, quick start, and docs links.

### Task 2: Update All Documentation Files

**Files:**
- Modify: `~/Zes-System/docs/architecture.md`
- Modify: `~/Zes-System/docs/agents/trinity.md`
- Modify: `~/Zes-System/docs/infrastructure/overview.md`
- Modify: `~/Zes-System/docs/providers/bitrouter.md`
- Modify: `~/Zes-System/docs/services/ports.md`
- Modify: `~/Zes-System/docs/services/management.md`

- [ ] **Update architecture.md** — Replace "ZES System" with "ZES OS", update repo URLs

- [ ] **Update trinity.md** — Consistent branding, add ZES OS header

- [ ] **Update infrastructure/overview.md** — Fix repo references from ZESCODE/Zes-Dashboard to zesxdev/zes-os

- [ ] **Update provider/service docs** — Branding consistency pass

### Task 3: Update Dashboard Config & Start Scripts

**Files:**
- Modify: `~/start-all.sh` (header)
- Modify: `~/Documents/Codex/2026-07-27/zes-dashboard-frost/package.json` (name, description)
- Create: `~/Zes-System/CONTRIBUTING.md`
- Create: `~/Zes-System/CHANGELOG.md`

- [ ] **Update start-all.sh header** — Change branding to ZES OS

- [ ] **Update dashboard package.json** — Set name to "zes-os-dashboard", update description

- [ ] **Create CONTRIBUTING.md** — Professional contributing guidelines

- [ ] **Create CHANGELOG.md** — Version history from git log

### Task 4: Professional README Overhaul

**Files:**
- Rewrite: `~/Zes-System/README.md`

- [ ] **Create professional README**

Include:
- ZES OS logo/ASCII art header
- Tagline: "Unified AI Agent Orchestration for Termux"
- Badges: version, license, status
- Architecture diagram (ASCII)
- Feature highlights
- Quick start (3 commands)
- Service matrix
- Documentation index
- Contribution guide link
- License

### Task 5: Write Future Development Suggestions

**Files:**
- Create: `~/Zes-System/ROADMAP.md`

- [ ] **Create professional ROADMAP.md**

Sections:
- Current State (v4.2.0)
- Short-term (Q3 2026): Dashboard unification, memory hub v2, mobile-optimized topology
- Medium-term (Q4 2026): Plugin marketplace, CI/CD pipeline, cross-agent eval framework
- Long-term (2027): Web-based agent orchestration UI, ZES Cloud sync, multi-device mesh
- How to contribute
