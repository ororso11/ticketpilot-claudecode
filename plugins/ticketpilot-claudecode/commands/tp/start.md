# /tp:start

Start a full TicketPilot workflow for a Jira ticket.

## Usage

```
/tp:start <ticketKey>
```

**Example:** `/tp:start PROJ-123`

---

## What This Command Does

When you run `/tp:start PROJ-123`, perform the following steps in order:

### Step 1 — Validate Prerequisites

Check that the following environment variables are set:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

If any are missing, stop and tell the user to run `ticketpilot config jira`.

### Step 2 — Fetch the Jira Ticket

Use the `ticketpilot jira get <ticketKey>` CLI command (if available), or call the Jira REST API directly:

- `GET {JIRA_BASE_URL}/rest/api/3/issue/{ticketKey}`
- `GET {JIRA_BASE_URL}/rest/api/3/issue/{ticketKey}/comment`

Use Basic Auth: `Authorization: Basic base64(JIRA_EMAIL:JIRA_API_TOKEN)`

Extract from the response:
- `fields.summary`
- `fields.description` (may be Atlassian Document Format — extract plain text)
- `fields.status.name`
- `fields.issuetype.name`
- `fields.priority.name`
- `fields.assignee.displayName`
- `fields.labels`
- `fields.components[].name`
- Latest comments (up to 10)

### Step 3 — Analyze Requirements

Read the ticket summary, description, and comments thoroughly. Identify:

1. **Business requirement** — What problem is being solved?
2. **Acceptance criteria** — Explicit or implied success conditions
3. **Missing information** — Ambiguities that would block implementation
4. **Technical scope** — Which parts of the codebase are likely affected

### Step 4 — Assess Risk Level

Evaluate the risk level as `low`, `medium`, or `high` based on:
- Does the ticket mention: password, secret, token, payment, auth, permission, personalInfo, privacy?
- Are any of these paths involved: `.env`, `*.pem`, `*.key`, `src/**/security/**`, `src/**/auth/**`, `src/**/payment/**`, `db/migration/**`?

If high-risk indicators are present, set risk level to `high` and note the specific reason.

### Step 5 — Generate Artifacts

Create the following files under `.ticketpilot/artifacts/{ticketKey}/`:

#### 1. `ticket-analysis.md`
Use the template from `templates/ticket-analysis.md`:
- Ticket Summary table
- Business Requirement
- Acceptance Criteria (extracted or inferred)
- Missing Information (questions to ask)
- Risk Level with reason
- Suggested Scope

#### 2. `implementation-plan.md`
Use the template from `templates/implementation-plan.md`:
- Goal
- Affected Areas (modules/files/layers)
- Proposed Changes (step-by-step)
- Files to Inspect
- Test Strategy
- Approval Required checklist

#### 3. `impact-analysis.md`
Use the template from `templates/impact-analysis.md`:
- Impacted Modules
- Data Impact
- API/UI Impact
- Security/Privacy Impact
- Rollback Notes

### Step 6 — Save Workflow State

Write `.ticketpilot/state/current-ticket.json` with:
```json
{
  "ticketKey": "<ticketKey>",
  "phase": "planned",
  "riskLevel": "<detected level>",
  "branch": null,
  "approval": {
    "planApproved": false,
    "editApproved": false,
    "jiraCommentApproved": false,
    "prApproved": false
  },
  "artifacts": {
    "ticketAnalysis": ".ticketpilot/artifacts/<ticketKey>/ticket-analysis.md",
    "implementationPlan": ".ticketpilot/artifacts/<ticketKey>/implementation-plan.md",
    "impactAnalysis": ".ticketpilot/artifacts/<ticketKey>/impact-analysis.md",
    "testReport": null,
    "reviewReport": null,
    "jiraComment": null,
    "prDescription": null
  },
  "changedFiles": [],
  "testResults": { "command": null, "status": "skipped", "attempts": 0 },
  "createdAt": "<ISO timestamp>",
  "updatedAt": "<ISO timestamp>"
}
```

### Step 7 — Present Summary to User

Display a summary:

```
✓ Ticket loaded:       <summary>
✓ Risk level:          <level> — <reason>
✓ Ticket Analysis:     .ticketpilot/artifacts/<ticketKey>/ticket-analysis.md
✓ Implementation Plan: .ticketpilot/artifacts/<ticketKey>/implementation-plan.md
✓ Impact Analysis:     .ticketpilot/artifacts/<ticketKey>/impact-analysis.md
✓ State saved:         .ticketpilot/state/current-ticket.json
```

Then suggest next actions:
- "Review the ticket analysis: `.ticketpilot/artifacts/<ticketKey>/ticket-analysis.md`"
- "Review the implementation plan and approve before any code changes"
- "Run `/tp:status` to check workflow state"
- "Run `/tp:resume` to continue in a new session"

---

## v0.1 Constraints

> **READ-ONLY MODE**: This command analyzes and plans only.
> No code files will be modified in v0.1.
> No Jira comments will be posted automatically.
> No pull requests will be created automatically.
> All changes require explicit user approval.
