# /tp:cancel

Cancel the current TicketPilot workflow.

## Usage

```
/tp:cancel
/tp:cancel --force
```

---

## What This Command Does

### Default: `/tp:cancel`

Soft-cancel the current workflow without destroying any data.

1. Read `.ticketpilot/state/current-ticket.json`
2. If no state exists, say: `No active TicketPilot workflow to cancel.`
3. Set `"phase": "cancelled"` and update `"updatedAt"`
4. Write the updated state back to `current-ticket.json`
5. Append to `.ticketpilot/logs/trace.jsonl`:
   ```json
   { "event": "cancelled", "ticketKey": "PROJ-123", "message": "Workflow cancelled from phase: planned" }
   ```
6. Show:
   ```
   ✓ Workflow for PROJ-123 cancelled (was: planned)
   Artifacts preserved in .ticketpilot/artifacts/
   To start fresh: /tp:start PROJ-456
   To force-reset: /tp:cancel --force
   ```

### With `--force`: `/tp:cancel --force`

Hard-reset the workflow state.

1. Read `.ticketpilot/state/current-ticket.json`
2. Back up the file to `.ticketpilot/state/current-ticket.backup.json`
3. Remove `current-ticket.json` (or write a blank/reset state)
4. Append `"force_cancelled"` event to trace.jsonl
5. Show:
   ```
   ✓ State cleared (backup: .ticketpilot/state/current-ticket.backup.json)
   Artifacts preserved in .ticketpilot/artifacts/
   Notepad preserved at .ticketpilot/notepad.md
   Note: Code changes (if any) were NOT reverted. Run `git status` to check.
   ```

---

## What is NOT Done

- **Code changes are NOT reverted** — TicketPilot never runs `git reset` or `git checkout`.
- **Artifacts are preserved** — `.ticketpilot/artifacts/` is kept intact.
- **Notepad is preserved** — `.ticketpilot/notepad.md` is never deleted.
- **No Jira comments are posted.**
- **No PRs are closed.**

If you have uncommitted code changes, review them with `git status` and `git diff` independently.

---

## When to Use

| Situation | Command |
|-----------|---------|
| Starting a different ticket | `/tp:cancel` then `/tp:start NEW-456` |
| Workflow is stuck / corrupted | `/tp:cancel --force` |
| Ticket was closed or won't be implemented | `/tp:cancel` |
| Want a completely clean slate | `/tp:cancel --force` |
