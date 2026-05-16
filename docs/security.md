# Security Guide

## Design Principles

TicketPilot is built with a **read-only, approval-gated** model:

1. **No automatic code modification** in v0.1
2. **No automatic Jira comment posting** in v0.1
3. **No automatic PR creation** in v0.1
4. **No external data transmission** — ticket content stays local
5. **Credentials never logged** — env var values are never printed, stored, or included in artifacts

## Credential Handling

- `/tp:setup` does **not** collect or store your API token — it only checks whether the environment variable is set
- The npm runtime reads `JIRA_API_TOKEN` from the environment at runtime and passes it as an HTTP header only
- Tokens never appear in `trace.jsonl`, `audit.log`, `config.json`, or any artifact file
- **Do not commit `.env` files** — add `.env` to `.gitignore` (TicketPilot adds `.ticketpilot/` directories to `.gitignore` automatically on init)

## High-Risk Path Classification

Files matching these patterns trigger a `risk: high` classification and require explicit user approval:

```
.env
*.pem / *.key
application-prod.yml / application-prod.properties
src/**/security/**
src/**/auth/**
src/**/payment/**
db/migration/**
migrations/**
```

Customize in `.ticketpilot/config.json` under `risk.highRiskPaths`.

## High-Risk Keywords

Content or filenames containing these keywords trigger high-risk warnings:

```
password, secret, token, privateKey, payment,
auth, permission, personalInfo, privacy
```

Customize under `risk.highRiskKeywords`.

## Hook Control

| Variable | Effect |
|----------|--------|
| `TP_DISABLE=1` | Disable all TicketPilot lifecycle hooks |
| `TP_SKIP_HOOKS=PreToolUse` | Skip the pre-tool safety guard |
| `TP_SKIP_HOOKS=PreToolUse,PostToolUse` | Skip multiple hooks |

## Data Storage

All data is local — nothing is sent to TicketPilot servers:

- `.ticketpilot/state/` — workflow state
- `.ticketpilot/artifacts/` — generated markdown and JSON
- `.ticketpilot/logs/` — trace and audit logs (no credentials)

## Reporting Vulnerabilities

Open a private GitHub Security Advisory:
`https://github.com/ororso135055/ticketpilot-claudecode/security/advisories/new`

We aim to respond within 72 hours and patch within 14 days.
