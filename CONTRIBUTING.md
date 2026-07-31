# Contributing to ZES OS

Thank you for your interest in ZES OS! Here's how you can contribute.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building something cool together.

## How to Contribute

### 1. Issues
- Search existing issues before opening new ones
- Use descriptive titles and include system info
- Tag appropriately: `bug`, `enhancement`, `documentation`, `question`

### 2. Pull Requests

```bash
# Fork & clone
git clone https://github.com/zesxdev/zes-os.git
cd zes-os

# Create a feature branch
git checkout -b feat/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push and open a PR
git push origin feat/your-feature-name
```

### 3. Development Setup

```bash
# Dashboard development
cd ~/zes-os-dashboard
npm install
npm run dev     # :5051

# Memory hub development
cd ~/hermes-agent
pip install -e .
```

### 4. Documentation
- All docs live in `docs/` as Markdown
- AGENTS.md is the entry point for agent instructions
- Keep docs current with code changes

### 5. Testing
- Run `npm run lint` before submitting dashboard PRs
- Test memory changes with `zes-memory-bridge status`
- Verify all dashboard pages load at `:5051`

## Project Structure

```
~/Zes-System/
  ├── AGENTS.md        Agent instructions (entry point)
  ├── docs/            All documentation
  ├── scripts/         Utility scripts
  └── config/          Service configs

~/zes-os-dashboard/
  ├── app/             Next.js pages
  ├── components/      UI components
  └── lib/             Utilities
```

## Need Help?

Open an issue or check the [Roadmap](ROADMAP.md) for planned features.
