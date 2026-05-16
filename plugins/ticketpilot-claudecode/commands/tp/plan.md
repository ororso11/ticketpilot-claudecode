# /tp:plan

Generate analysis and implementation plan for a Jira ticket — planning only, no code changes.

## Usage

```
/tp:plan <ticketKey>
```

**Example:** `/tp:plan PROJ-456`

---

## What This Command Does

`/tp:plan` is a subset of `/tp:start`. It performs the same ticket fetch, analysis, and artifact generation, but explicitly emphasizes **plan-only mode** — no implementation is started even if the user asks.

### Steps

1. **Validate** — Check Jira env vars (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`)
2. **Fetch** — Get issue details and comments from Jira REST API v3
3. **Analyze** — Extract requirements, acceptance criteria, risk level
4. **Generate artifacts** — Write to `.ticketpilot/artifacts/{ticketKey}/`:
   - `ticket-analysis.md`
   - `implementation-plan.md`
   - `impact-analysis.md`
5. **Save state** — Write `.ticketpilot/state/current-ticket.json` with `"phase": "planned"`
6. **Present plan** — Show the implementation plan inline and list artifact paths

### Key Difference from `/tp:start`

`/tp:plan` stops after planning. It does not suggest or initiate any code changes.
Even if the user says "go ahead and implement it" mid-command, decline and remind them
this is plan-only mode. They must explicitly approve via `/tp:start` and then grant edit permission.

---

## Output

After completion, display the full `implementation-plan.md` content inline so the user
can review it without opening a file, then list all artifact paths.

---

## v0.1 Constraints

> No code files will be modified.
> No Jira comments will be posted.
> No PRs will be created.
