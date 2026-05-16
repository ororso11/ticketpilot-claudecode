# npm CLI Reference

The npm package is the local runtime for TicketPilot. Most users should install the Claude Code plugin first and run `/tp:setup`.

> **Start here only if** you are an advanced user, setting up automation, or the plugin explicitly directed you here.

---

## Installation

```bash
npm i -g ticketpilot-claudecode@latest
```

Both `ticketpilot` and `tp` are available as binary aliases.

---

## Commands

### Setup & Initialization

```bash
ticketpilot setup          # Interactive setup wizard
ticketpilot init           # Initialize .ticketpilot/ directories
ticketpilot init-project   # Analyze project, generate project-memory.json + AGENTS.md
```

### Health & Diagnostics

```bash
ticketpilot doctor         # Full health check
ticketpilot hud            # One-line status (for statusLine integration)
```

### Jira

```bash
ticketpilot config jira           # Show Jira credential status
ticketpilot jira test             # Test Jira connection
ticketpilot jira get PROJ-123     # Fetch and display a ticket
```

### Workflow

```bash
ticketpilot start PROJ-123        # Start full ticket workflow
ticketpilot plan PROJ-123         # Plan-only mode
ticketpilot status                # Show current workflow state
ticketpilot trace                 # Show event timeline
ticketpilot cancel                # Soft-cancel current workflow
ticketpilot cancel --force        # Hard-reset workflow state
```

### MCP Server

```bash
ticketpilot mcp jira              # Start Jira MCP server (stdin/stdout)
```

---

## Environment variables

```bash
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="your-api-token"

# Hook controls
export TP_DISABLE=1                     # Disable all hooks
export TP_SKIP_HOOKS=PreToolUse         # Skip specific hooks
```

---

## statusLine integration

```json
{
  "statusLine": {
    "type": "command",
    "command": "ticketpilot hud"
  }
}
```

Output:
```
TicketPilot [PROJ-123] | phase: planned | risk: medium | mode: plan | next: approve plan
```

---

## Local development

```bash
git clone https://github.com/ororso11/ticketpilot-claudecode
cd ticketpilot-claudecode
pnpm install
pnpm build
node packages/cli/dist/cli.js --version
```
