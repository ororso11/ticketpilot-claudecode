# Skill: jira-ticket-analysis

## Purpose

Extract structured, actionable information from a Jira ticket for use in development planning.

## Input

| Field | Source | Required |
|-------|--------|----------|
| `ticketKey` | User argument (e.g. `PROJ-123`) | Yes |
| Jira issue data | Jira REST API v3 `/rest/api/3/issue/{key}` | Yes |
| Jira comments | Jira REST API v3 `/rest/api/3/issue/{key}/comment` | No |
| `project-memory.json` | `.ticketpilot/project-memory.json` | No |

## Procedure

1. **Fetch ticket** — Call Jira API with Basic Auth (`JIRA_EMAIL:JIRA_API_TOKEN`).
2. **Extract fields** — summary, description (parse ADF to plain text), status, type, priority, labels, components, assignee, reporter.
3. **Extract comments** — author, body (parse ADF), timestamp. Limit to latest 10.
4. **Extract acceptance criteria** — Search description and comments for:
   - "Given/When/Then" patterns
   - Checkbox items (`- [ ] ...`)
   - Numbered lists under headings containing "acceptance", "criteria", or "AC"
   - If none found: mark as `"Missing acceptance criteria — clarification required"`
5. **Identify missing information** — List specific questions for ambiguous requirements.
6. **Classify risk** — Compare labels, components, summary keywords against `highRiskPaths` and `highRiskKeywords` from config.
7. **Define scope** — Summarize what is in-scope and out-of-scope.

## Output

### `ticket-analysis.md`
Path: `.ticketpilot/artifacts/{ticketKey}/ticket-analysis.md`
Template: `templates/ticket-analysis.md`

### `ticket-prd.json`
Path: `.ticketpilot/artifacts/{ticketKey}/ticket-prd.json`
Structure:
```json
{
  "ticketKey": "PROJ-123",
  "title": "Fix login redirect after OAuth",
  "acceptanceCriteria": [
    { "id": "AC-1", "text": "...", "status": "pending" }
  ],
  "verification": { "status": "not_started", "lastCheckedAt": null }
}
```

## Quality Criteria

- All AC items are testable (not vague like "improve performance")
- Missing information list is specific (not generic)
- Risk level is justified with a concrete reason
- Output is complete before any planning begins
