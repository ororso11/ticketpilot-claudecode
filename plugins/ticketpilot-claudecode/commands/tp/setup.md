# /tp:setup

TicketPilot setup wizard. Run this once after installing the plugin.

## Usage

```
/tp:setup
```

---

## What This Command Does

Work through these steps in order, pausing to guide the user at each gap.

### Step 1 — Check runtime availability

Run `ticketpilot --version` (or check if the binary exists).

**If missing:**

```
TicketPilot needs a small local runtime for Jira access and state management.

Install it with:
  npm i -g ticketpilot-claudecode@latest

Then run /tp:setup again.
```

Stop here until the runtime is installed. Do not continue to later steps.

**If available:** show the version and continue.

```
✓ Runtime: ticketpilot 0.1.0
```

### Step 2 — Create .ticketpilot directories

Check and create if missing (silently):
- `.ticketpilot/state/`
- `.ticketpilot/artifacts/`
- `.ticketpilot/logs/`
- `.ticketpilot/config.json`
- `.ticketpilot/notepad.md`
- `.ticketpilot/project-memory.json`

Show a single line:
```
✓ .ticketpilot/ ready
```

If creation fails, show the specific error and stop.

### Step 3 — Check Jira environment variables

Check (never display values):
- `JIRA_BASE_URL` — ✓ set / ✗ missing
- `JIRA_EMAIL` — ✓ set / ✗ missing
- `JIRA_API_TOKEN` — ✓ set / ✗ missing

**If all set:**
```
✓ Jira credentials found
  Run: ticketpilot jira test
```

**If any are missing**, show only this:
```
Jira credentials are not set. Add these to your shell profile:

  export JIRA_BASE_URL="https://your-company.atlassian.net"
  export JIRA_EMAIL="you@example.com"
  export JIRA_API_TOKEN="your-api-token"

  # Windows PowerShell:
  $env:JIRA_BASE_URL="https://your-company.atlassian.net"
  $env:JIRA_EMAIL="you@example.com"
  $env:JIRA_API_TOKEN="your-api-token"

Get your API token at: https://id.atlassian.com/manage-profile/security/api-tokens

After setting the variables, run /tp:setup again.
```

### Step 4 — Optional: statusLine / HUD

Show only if previous steps all passed:

```
Optional: add TicketPilot status to Claude Code's status bar.

Add to settings.json:
  {
    "statusLine": {
      "type": "command",
      "command": "ticketpilot hud"
    }
  }
```

### Step 5 — Suggest next action

Show only 1–2 next steps based on what's ready:

| State | Suggestion |
|-------|-----------|
| Runtime missing | Install runtime, then `/tp:setup` |
| Jira vars missing | Set env vars, then `/tp:setup` |
| All ready | `ticketpilot jira test` then `/tp:start PROJ-123` |

---

## Tone

- Friendly and short — like an install wizard, not a manual
- Show one problem at a time
- Never dump all CLI commands at once
- End with exactly one clear next action
