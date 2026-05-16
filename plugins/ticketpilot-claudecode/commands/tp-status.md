# /tp:status

Show the current TicketPilot workflow state.

## Usage

```
/tp:status
```

---

## What This Command Does

Read `.ticketpilot/state/current-ticket.json` and display a human-readable summary.

### If no state file exists

Show:
```
No active TicketPilot workflow found.
Run /tp:start <ticketKey> to begin working on a Jira ticket.
```

### If state file exists

Display all of the following:

```
Current Ticket Workflow
───────────────────────
Ticket:      <ticketKey>
Phase:       <phase>
Risk Level:  <riskLevel>
Branch:      <branch or "none">
Updated:     <updatedAt>

Artifacts:
  ✓ ticketAnalysis:       <path>
  ✓ implementationPlan:   <path>
  ✓ impactAnalysis:       <path>
  – testReport:           not generated
  – reviewReport:         not generated

Approval:
  planApproved:           <true/false>
  editApproved:           <false — v0.1 read-only>

Changed Files:
  <list or "none">

Test Results:
  Status: <skipped/pending/passed/failed>
  Attempts: <n>
```

### Phase descriptions

| Phase | Meaning |
|-------|---------|
| `initialized` | Ticket loaded, no analysis yet |
| `analyzed` | Ticket analysis complete |
| `planned` | Implementation plan generated |
| `approved` | User approved the plan |
| `implementing` | Code changes in progress (v0.2+) |
| `testing` | Tests running (v0.2+) |
| `reviewing` | Review in progress (v0.2+) |
| `done` | Workflow complete |

### Next action suggestion

Based on the current phase, suggest the appropriate next step:
- `initialized` → Run `/tp:start <ticketKey>` to generate artifacts
- `planned` → Review artifacts and approve the plan
- `approved` → (v0.2+) Proceed with implementation
- `done` → Workflow complete
