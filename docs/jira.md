# Jira Integration Guide

## Authentication

TicketPilot uses Jira REST API v3 with HTTP Basic Authentication:

```
Authorization: Basic base64(JIRA_EMAIL:JIRA_API_TOKEN)
```

### Getting an API Token

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Name it (e.g. "TicketPilot")
4. Copy the token immediately — it won't be shown again

### Setting Credentials

```bash
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="your-api-token"
```

Test the connection:
```bash
ticketpilot jira test
```

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /rest/api/3/myself` | Authentication test |
| `GET /rest/api/3/issue/{key}` | Fetch ticket details |
| `GET /rest/api/3/issue/{key}/comment` | Fetch ticket comments |

All endpoints are **read-only** in v0.1.

## Atlassian Document Format (ADF)

Jira descriptions and comments use ADF (Atlassian Document Format) — a nested JSON structure.

TicketPilot automatically converts ADF to plain text for analysis. If conversion produces unexpected output, please report it as a bug.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Authentication failed` | Wrong credentials | Regenerate API token |
| `Access denied (403)` | Insufficient permissions | Ask Jira admin for read access |
| `Not found (404)` | Wrong ticket key or base URL | Check `JIRA_BASE_URL` and ticket key |
| `Rate limit (429)` | Too many requests | Wait 60s and retry |
| `Network error` | No internet / wrong URL | Verify `JIRA_BASE_URL` format |

## Security Notes

- API tokens are passed via HTTP header only
- Tokens are never written to disk or logs
- All Jira data stays local — nothing is sent to TicketPilot servers
- v0.1 is strictly read-only: no writes to Jira
