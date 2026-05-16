# /tp:resume

Resume a TicketPilot workflow from a previous session.

## Usage

```
/tp:resume
```

---

## What This Command Does

Restore context from a previous session and continue from where you left off.

### Step 1 — Read State

Load `.ticketpilot/state/current-ticket.json`.

If not found, say:
```
No saved TicketPilot workflow found.
Run /tp:start <ticketKey> to begin a new workflow.
```

### Step 2 — Read Artifacts

For each artifact path recorded in the state, read and summarize the file:
- `ticket-analysis.md` — Show the ticket summary and acceptance criteria
- `implementation-plan.md` — Show the proposed changes and current status
- `impact-analysis.md` — Show risk level and impacted areas

If an artifact file is missing (path is recorded but file does not exist), warn the user:
```
⚠ Artifact missing: <path>
  This may have been deleted or moved. Run /tp:start <ticketKey> to regenerate.
```

### Step 3 — Summarize Context

Display:
```
Resuming workflow for: <ticketKey>
Phase: <phase>
Risk Level: <riskLevel>

Previous session summary:
- Ticket: <summary>
- Acceptance Criteria: <n> items identified
- Implementation Plan: <proposed changes summary>
- Changed Files: <n> files (or none in v0.1)
```

### Step 4 — Suggest Next Steps

Based on `phase` and `approval` status, suggest what to do next:

| Condition | Suggestion |
|-----------|------------|
| `phase = planned`, no approval | "Review the implementation plan and confirm you want to proceed" |
| `phase = planned`, plan approved | "(v0.2+) Implementation is approved — ready to begin code changes" |
| `phase = done` | "This ticket workflow is complete" |
| Missing Jira credentials | "Set Jira env vars and run `/tp:start` again to refresh the ticket data" |

---

## Notes

- This command is safe to run at any time — it only reads files, never writes.
- It is especially useful after a Claude Code session compaction or restart.
- If you need fresh data from Jira, run `/tp:start <ticketKey>` instead.
