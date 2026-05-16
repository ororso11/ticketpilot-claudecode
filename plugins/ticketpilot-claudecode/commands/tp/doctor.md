# /tp:doctor

Diagnose TicketPilot installation, configuration, and connectivity.

## Usage

```
/tp:doctor
```

---

## What This Command Does

Run a comprehensive health check and display results as `OK` / `WARN` / `FAIL`.

### Checks to Perform

| Check | Method | Expected |
|-------|--------|----------|
| Node.js version | `node --version` | >= 20 |
| ticketpilot CLI | `ticketpilot --version` | installed and executable |
| `.ticketpilot/config.json` | File exists | present |
| `.ticketpilot/state/` | Directory readable/writable | exists |
| `.ticketpilot/artifacts/` | Directory readable/writable | exists |
| `.ticketpilot/logs/` | Directory readable/writable | exists |
| `JIRA_BASE_URL` | env var | set |
| `JIRA_EMAIL` | env var | set |
| `JIRA_API_TOKEN` | env var | set |
| Jira connection | `GET /rest/api/3/myself` | 200 OK |
| `current-ticket.json` | JSON parseable | valid or absent |
| Claude Code plugin | Plugin installed | present |

### Output Format

```
TicketPilot Doctor

  ✓ Node.js version          v22.3.0 (>= 20 required)
  ✓ ticketpilot CLI          0.1.0
  ✓ .ticketpilot/config.json present
  ✓ .ticketpilot/state/      readable/writable
  ✓ .ticketpilot/artifacts/  readable/writable
  ✓ .ticketpilot/logs/       readable/writable
  ✓ JIRA_BASE_URL            set
  ✓ JIRA_EMAIL               set
  ✓ JIRA_API_TOKEN           set
  ✓ Jira connection          Connected as Jane Doe
  ✓ current-ticket.json      valid (PROJ-123, phase: planned)
  ⚠ Claude Code plugin       not detected (install via /plugin install ...)

1 warning. Run the suggested fixes above.
```

### For Each FAIL or WARN Item

Show a one-line fix:

| Issue | Fix |
|-------|-----|
| Node.js < 20 | `nvm install 20 && nvm use 20` |
| CLI not found | `npm i -g ticketpilot-claudecode@latest` |
| Config missing | `ticketpilot init` |
| Dir missing | `ticketpilot init` |
| Env var missing | `export JIRA_BASE_URL=...` |
| Jira auth failed | Regenerate token at Atlassian |
| State corrupted | `ticketpilot cancel --force` |
| Plugin missing | `/plugin install ticketpilot-claudecode@ticketpilot-claudecode-marketplace` |

### Hooks and HUD Guidance

After checks, always show:

```
Hooks: Set TP_DISABLE=1 to disable all hooks. TP_SKIP_HOOKS=PreToolUse,PostToolUse to skip specific hooks.
HUD:   Add {"statusLine": {"type": "command", "command": "ticketpilot hud"}} to Claude Code settings.json
```

### Next Steps

```
Recommended next commands:
  ticketpilot jira test     — verify Jira connection
  /tp:init-project          — analyze your project
  /tp:start PROJ-123        — start a ticket workflow
```

---

## Notes

- Does NOT modify any files.
- Does NOT post to Jira.
- Credential values are never displayed.
