# TicketPilot for Claude Code

TicketPilot ClaudeCode lets Claude Code turn a Jira ticket into a structured development workflow.

Install the plugin, run `/tp:setup`, then start with `/tp:start PROJ-123`.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/ticketpilot-claudecode)](https://www.npmjs.com/package/ticketpilot-claudecode)

---

## Quick Start

### 1. Install the plugin

```
/plugin marketplace add https://github.com/ororso11/ticketpilot-claudecode
/plugin install ticketpilot-claudecode@ticketpilot-claudecode-marketplace
```

### 2. Run setup

```
/tp:setup
```

### 3. Start from a Jira ticket

```
/tp:start PROJ-123
```

That's it.

---

## If setup asks for the runtime CLI

TicketPilot uses a small local runtime for Jira access, state management, diagnostics, HUD, and automation helpers.

Most users should start with the Claude Code plugin flow above. If `/tp:setup` says the runtime is missing, install it once:

```bash
npm i -g ticketpilot-claudecode@latest
```

Then run `/tp:setup` again.

---

## What /tp:setup does

- Checks whether the local runtime (`ticketpilot` CLI) is available
- Creates `.ticketpilot/` directories if needed
- Checks Jira environment variables (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`)
- Guides Jira connection testing
- Explains optional HUD/statusLine setup
- Suggests the next command

---

## Recommended flow

1. Install the Claude Code plugin
2. Run `/tp:setup`
3. Run `/tp:start PROJ-123`
4. Use `/tp:status` or `/tp:resume` when needed

---

## Jira credentials

`/tp:setup` will guide you through Jira configuration.

For manual setup:

```bash
# macOS / Linux
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="your-token"
```

```powershell
# Windows PowerShell
$env:JIRA_BASE_URL="https://your-company.atlassian.net"
$env:JIRA_EMAIL="you@example.com"
$env:JIRA_API_TOKEN="your-token"
```

Get your API token at: https://id.atlassian.com/manage-profile/security/api-tokens

---

## Primary commands

| Command | Description |
|---------|-------------|
| `/tp:setup` | Setup wizard — run this first |
| `/tp:start PROJ-123` | Fetch ticket, generate analysis + plan |
| `/tp:status` | Show current workflow state |
| `/tp:resume` | Restore context after session restart |
| `/tp:doctor` | Full health check |

## Advanced commands

| Command | Description |
|---------|-------------|
| `/tp:init-project` | Analyze project, generate project-memory.json |
| `/tp:plan PROJ-123` | Generate plan only (no code changes) |
| `/tp:trace` | Show workflow event timeline |
| `/tp:cancel [--force]` | Cancel current workflow |
| `/tp:config` | View configuration options |

---

## What gets generated

After `/tp:start PROJ-123`, TicketPilot creates:

```
.ticketpilot/
├── state/current-ticket.json       ← workflow state
└── artifacts/PROJ-123/
    ├── ticket-analysis.md          ← requirements + AC
    ├── ticket-prd.json             ← structured acceptance criteria
    ├── implementation-plan.md      ← proposed changes
    └── impact-analysis.md          ← risk + rollback
```

---

## Advanced CLI

The CLI is the local runtime used by the plugin. Most users do not need to run these commands directly.

Common advanced commands:

```bash
ticketpilot setup       # setup wizard
ticketpilot doctor      # health check
ticketpilot jira test   # test Jira connection
ticketpilot hud         # one-line status output
ticketpilot trace       # event timeline
ticketpilot cancel      # cancel workflow
```

For the full CLI reference, see [docs/npm-cli.md](docs/npm-cli.md).

---

## statusLine / HUD (optional)

Add to Claude Code `settings.json` for a live status bar:

```json
{
  "statusLine": {
    "type": "command",
    "command": "ticketpilot hud"
  }
}
```

---

## MVP scope (v0.1)

Read-only analysis and planning — no automatic code changes.

**Included:** Jira fetch · requirements analysis · AC extraction · `ticket-prd.json` · implementation plan · impact analysis · risk classification · state persistence · session resume · project memory

**Not in v0.1:** automatic code edits · test execution · Jira comment posting · PR creation

---

## Roadmap

| Version | Focus |
|---------|-------|
| v0.1 | Plugin-first setup, read-only analysis and planning |
| v0.2 | Approval-gated code editing, test loops |
| v0.3 | Jira comments, GitHub/GitLab PRs, notifications |
| v1.0 | Pro/Enterprise: team policies, audit dashboard |

See [docs/roadmap.md](docs/roadmap.md) for details.

---

## Security

- Read-only by default in v0.1
- Credentials never logged or stored — env vars only
- All data stays local
- See [SECURITY.md](SECURITY.md)

---

## License

Apache-2.0 · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)
