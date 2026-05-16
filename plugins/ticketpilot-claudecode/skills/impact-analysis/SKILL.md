# Skill: impact-analysis

## Purpose

Identify all downstream effects of implementing a Jira ticket — data, API, UI, security, and rollback implications.

## Input

| Field | Source | Required |
|-------|--------|----------|
| `ticket-analysis.md` | `.ticketpilot/artifacts/{ticketKey}/` | Yes |
| `implementation-plan.md` | `.ticketpilot/artifacts/{ticketKey}/` | Yes |
| `project-memory.json` | `.ticketpilot/project-memory.json` | Recommended |
| Codebase (read-only) | Current directory | Recommended |

## Procedure

1. **Read implementation plan** — Understand each proposed change.
2. **Trace module dependencies** — For each changed file, identify importers/callers.
3. **Assess data impact** — Determine if DB schema, models, or migrations are involved.
4. **Assess API impact** — Identify if any public API contracts change (REST, GraphQL, events).
5. **Assess UI impact** — Determine if any user-facing screens or flows change.
6. **Assess security/privacy impact** — Flag any changes to authentication, authorization, or PII handling.
7. **Design rollback plan** — Specify how to revert the change safely.

## Output

### `impact-analysis.md`
Path: `.ticketpilot/artifacts/{ticketKey}/impact-analysis.md`
Template: `templates/impact-analysis.md`

Sections:
- **Impacted Modules** — table (module, impact type, severity)
- **Data Impact** — schema changes, migrations, backward compat
- **API/UI Impact** — contract changes, breaking changes
- **Security/Privacy Impact** — auth/authz changes, PII risk
- **Rollback Notes** — step-by-step rollback procedure

## Quality Criteria

- Every impacted module is listed, not just directly changed files
- Security/privacy section is never left blank (must say "none identified" explicitly if clear)
- Rollback notes are actionable (not "revert the PR")
- Breaking API changes are flagged as HIGH severity

## v0.1 Constraint

Impact analysis is read-only. No files are modified.
