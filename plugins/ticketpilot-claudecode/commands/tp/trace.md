# /tp:trace

Show the TicketPilot workflow event timeline.

## Usage

```
/tp:trace
```

---

## What This Command Does

Read `.ticketpilot/logs/trace.jsonl` and display the workflow timeline in a human-readable format.

### Step 1 — Read Current State

If `.ticketpilot/state/current-ticket.json` exists, show the current context at the top:

```
Current ticket: PROJ-123
Phase: planned | Risk: medium | Mode: plan
```

### Step 2 — Read Trace Events

Parse `.ticketpilot/logs/trace.jsonl` (one JSON object per line).

Each line has the shape:
```json
{
  "timestamp": "2026-05-16T13:02:00.000Z",
  "event": "ticket_loaded",
  "ticketKey": "PROJ-123",
  "phase": "ticket_loaded",
  "message": "Loaded Jira ticket PROJ-123"
}
```

### Step 3 — Display Timeline

Format and display the last 50 events (most recent last):

```
TicketPilot Trace

Current ticket: PROJ-123
Phase: planned | Risk: medium | Mode: plan

[2026-05-16 13:02] setup completed
[2026-05-16 13:03] PROJ-123 ticket loaded
                     Loaded Jira ticket PROJ-123: Fix login redirect bug
[2026-05-16 13:04] PROJ-123 ticket analysis generated
[2026-05-16 13:04] PROJ-123 implementation plan generated
[2026-05-16 13:05] PROJ-123 state saved
[2026-05-16 13:05] PROJ-123 waiting for approval
```

### If No Trace File Exists

```
No trace events recorded yet.
Events are recorded as you run TicketPilot commands.
Start with: /tp:setup or /tp:start PROJ-123
```

### Event Type Reference

| Event | Meaning |
|-------|---------|
| `setup_completed` | Setup wizard ran |
| `project_initialized` | /tp:init-project ran |
| `ticket_loaded` | Jira ticket fetched |
| `ticket_analysis_generated` | ticket-analysis.md created |
| `ticket_prd_generated` | ticket-prd.json created |
| `implementation_plan_generated` | implementation-plan.md created |
| `impact_analysis_generated` | impact-analysis.md created |
| `state_saved` | current-ticket.json updated |
| `waiting_for_approval` | Waiting for user review |
| `cancelled` | Workflow cancelled |
| `force_cancelled` | Workflow force-reset |
| `resumed` | Session resumed |
| `doctor_completed` | Doctor check ran |
| `pre_compact_saved` | Pre-compact hook fired |
| `session_started` | Claude Code session began |
| `session_stopped` | Claude Code session ended |

---

## Notes

- Read-only: this command never writes files.
- The trace log is append-only and grows over time. Use `--limit` (CLI) to cap display length.
- Trace data stays local and is never transmitted externally.
