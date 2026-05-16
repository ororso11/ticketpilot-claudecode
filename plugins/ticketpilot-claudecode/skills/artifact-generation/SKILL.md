# Skill: artifact-generation

## Purpose

Generate, save, and manage all TicketPilot workflow artifacts (markdown documents and JSON files) in the correct directory structure.

## Artifact Directory Structure

```
.ticketpilot/
├── state/
│   └── current-ticket.json
├── artifacts/
│   ├── project/
│   │   └── project-analysis.md
│   └── {ticketKey}/
│       ├── ticket-analysis.md
│       ├── ticket-prd.json
│       ├── implementation-plan.md
│       ├── impact-analysis.md
│       ├── test-report.md        (v0.2+)
│       ├── review-report.md      (v0.2+)
│       ├── jira-comment.md       (draft only in v0.1)
│       └── pr-description.md     (draft only in v0.1)
└── logs/
    ├── audit.log
    └── trace.jsonl
```

## Procedure

### For each artifact:

1. **Ensure directory** — Create `.ticketpilot/artifacts/{ticketKey}/` if it doesn't exist.
2. **Apply template** — Fill the appropriate template from `templates/`.
3. **Write file** — Save with UTF-8 encoding.
4. **Log** — Append to `trace.jsonl` and `audit.log`.
5. **Update state** — Set the artifact path in `current-ticket.json`.
6. **Report** — Confirm the path to the user.

### Overwrite behavior

If a file already exists:
- Log: `[ticketpilot] Overwriting existing artifact: <path>`
- Overwrite without prompting (artifacts are regeneratable)

### Error handling

- If the directory cannot be created: show a clear error and stop.
- If a file cannot be written: show the OS error and the full path.
- Never silently fail.

## Trace Events to Record

| Artifact | Event |
|----------|-------|
| ticket-analysis.md | `ticket_analysis_generated` |
| ticket-prd.json | `ticket_prd_generated` |
| implementation-plan.md | `implementation_plan_generated` |
| impact-analysis.md | `impact_analysis_generated` |
| jira-comment.md | `jira_comment_drafted` |
| pr-description.md | `pr_description_drafted` |

## State Fields to Update

After saving each artifact, update `current-ticket.json`:
```json
{
  "artifacts": {
    "ticketAnalysis": ".ticketpilot/artifacts/PROJ-123/ticket-analysis.md",
    "implementationPlan": ".ticketpilot/artifacts/PROJ-123/implementation-plan.md",
    "impactAnalysis": ".ticketpilot/artifacts/PROJ-123/impact-analysis.md",
    "ticketPrd": ".ticketpilot/artifacts/PROJ-123/ticket-prd.json"
  }
}
```

## Quality Criteria

- All artifact paths in state are absolute or relative to project root
- All artifacts use the correct template
- Trace events are recorded for every artifact
- State is updated atomically (write state after all artifacts succeed)
