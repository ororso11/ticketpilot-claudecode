# Skill: implementation-planning

## Purpose

Design a concrete, file-level implementation plan from a ticket analysis and acceptance criteria.

## Input

| Field | Source | Required |
|-------|--------|----------|
| `ticket-analysis.md` | `.ticketpilot/artifacts/{ticketKey}/ticket-analysis.md` | Yes |
| `ticket-prd.json` | `.ticketpilot/artifacts/{ticketKey}/ticket-prd.json` | Yes |
| `project-memory.json` | `.ticketpilot/project-memory.json` | Recommended |
| `AGENTS.md` | Project root | Recommended |
| Codebase (read-only) | Current directory | Recommended |

## Procedure

1. **Read all inputs** — Do not start planning without reading `ticket-analysis.md` and `ticket-prd.json`.
2. **Explore codebase** — Identify relevant files using `importantPaths` from `project-memory.json` as a starting map.
3. **Map AC to files** — For each acceptance criterion, identify which file(s) need to change.
4. **Propose minimal changes** — Design the smallest change set that satisfies all AC.
5. **Identify secondary impacts** — Check for downstream effects on other modules or consumers.
6. **Write test strategy** — Align with `testCommand` from `project-memory.json`. Specify what to test and how.
7. **Set approval gates** — Mark all changes requiring `requireApprovalBeforeEdit: true`.

## Output

### `implementation-plan.md`
Path: `.ticketpilot/artifacts/{ticketKey}/implementation-plan.md`
Template: `templates/implementation-plan.md`

Sections:
- **Goal** — one sentence
- **Affected Areas** — table (module, change type, severity)
- **Proposed Changes** — numbered steps with file paths
- **Files to Inspect** — list of files to read before coding
- **Test Strategy** — unit, integration, manual steps
- **Approval Required** — checklist

## Quality Criteria

- Every AC item maps to at least one proposed change
- File paths are specific (not `src/...`)
- No step says "update as needed" — all changes are explicit
- Test strategy covers regression risk
- Approval gates are set for all high-risk changes

## v0.1 Constraint

This skill produces plans only. No files are modified during planning.
