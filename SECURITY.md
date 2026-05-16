# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Security Design

TicketPilot is designed with a **read-only, approval-gated** security model in MVP v0.1:

- **No automatic code modification** — Claude only analyzes and plans; all edits require explicit user action.
- **No automatic Jira comments** — comment drafts are created locally; posting requires user approval.
- **No automatic PR creation** — PR descriptions are generated as artifacts only.
- **No external data transmission** — ticket content and code context never leave your machine to third-party servers.
- **Credentials are never logged** — `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` are read from environment variables and never printed.

## High-Risk Path Classification

The following paths are classified as **high-risk** and trigger an approval gate:

- `.env`, `*.pem`, `*.key`
- `application-prod.yml`, `application-prod.properties`
- `src/**/security/**`, `src/**/auth/**`
- `src/**/payment/**`
- `db/migration/**`, `migrations/**`

## Reporting a Vulnerability

Please report security vulnerabilities by opening a **private** GitHub Security Advisory at:

`https://github.com/ororso11/ticketpilot-claudecode/security/advisories/new`

Do **not** open public issues for security vulnerabilities.

We aim to respond within 72 hours and provide a patch within 14 days for confirmed issues.
