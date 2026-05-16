# Basic Example

This example shows a minimal TicketPilot workflow.

## Prerequisites

```bash
npm i -g ticketpilot-claudecode@latest
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="your-api-token"
```

## Workflow

```bash
# 1. Initialize in your project directory
cd /path/to/your/project
ticketpilot setup

# 2. Test Jira connection
ticketpilot jira test

# 3. Analyze your project
ticketpilot init-project

# 4. Fetch a ticket to review it
ticketpilot jira get PROJ-123

# 5. Check health
ticketpilot doctor

# 6. Start a full workflow in Claude Code
# /tp:start PROJ-123

# 7. Check status
ticketpilot status
# or in Claude Code: /tp:status

# 8. View event timeline
ticketpilot trace
```

## Generated Artifacts

After `/tp:start PROJ-123`:

```
.ticketpilot/
├── state/current-ticket.json       ← workflow state
├── artifacts/PROJ-123/
│   ├── ticket-analysis.md          ← requirements analysis
│   ├── ticket-prd.json             ← structured acceptance criteria
│   ├── implementation-plan.md      ← proposed changes
│   └── impact-analysis.md          ← risk and rollback plan
└── logs/
    ├── audit.log                   ← human-readable log
    └── trace.jsonl                 ← event timeline
```

## statusLine Integration

Add to Claude Code `settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "ticketpilot hud"
  }
}
```
