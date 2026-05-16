# ticketpilot-claudecode

Turn Jira tickets into Claude Code workflows — analysis, planning, and delivery artifacts.

## Install

```
/plugin marketplace add https://github.com/ororso11/ticketpilot-claudecode
/plugin install ticketpilot-claudecode@ticketpilot-claudecode-marketplace
```

## Quick Start

```
/tp:setup
/tp:start PROJ-123
```

That's it. Setup guides you through Jira credentials and runtime installation.

---

## Primary Commands

| Command | Description |
|---------|-------------|
| `/tp:setup` | Setup wizard — run this first |
| `/tp:start PROJ-123` | Fetch ticket, generate analysis + plan |
| `/tp:status` | Show workflow state |
| `/tp:resume` | Restore context after session restart |
| `/tp:doctor` | Full health check |

## Advanced Commands

| Command | Description |
|---------|-------------|
| `/tp:init-project` | Analyze project structure |
| `/tp:plan PROJ-123` | Plan only (no code changes) |
| `/tp:trace` | Event timeline |
| `/tp:cancel [--force]` | Cancel workflow |
| `/tp:config` | Configuration guide |

---

## Runtime CLI (if needed)

If `/tp:setup` asks for the runtime:

```bash
npm i -g ticketpilot-claudecode@latest
```

Then run `/tp:setup` again. See [docs/npm-cli.md](../../docs/npm-cli.md) for the full CLI reference.

---

## Full Documentation

See the [repository README](../../README.md) and [docs/](../../docs/).
