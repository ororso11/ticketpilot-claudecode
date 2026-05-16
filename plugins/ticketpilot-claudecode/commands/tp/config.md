# /tp:config

View and understand TicketPilot configuration options.

> For initial setup, use `/tp:setup` instead.
> `/tp:config` is a reference guide, not a wizard.

## Usage

```
/tp:config
```

---

## What This Command Shows

### 1. Jira credentials status

Check (without displaying values) whether these are set:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

If missing, show how to set them. If set, show ✓ and suggest `ticketpilot jira test`.

### 2. Config file location and key options

```
Config: .ticketpilot/config.json

Key options:
  workflow.requireApprovalBeforeEdit       true
  workflow.requireApprovalBeforeJiraComment true
  workflow.defaultMode                     plan
  risk.highRiskPaths                       [.env, *.pem, ...]
```

### 3. Workflow options reference

| Option | Default | Description |
|--------|---------|-------------|
| `requireApprovalBeforeEdit` | `true` | Require approval before code changes |
| `requireApprovalBeforeJiraComment` | `true` | Require approval before posting Jira comment |
| `requireApprovalBeforePr` | `true` | Require approval before creating PR |
| `autoRunTests` | `false` | Run tests automatically (v0.2+) |
| `defaultMode` | `"plan"` | Default workflow mode |
| `autoSuggestOnTicketKey` | `true` | Suggest /tp:start when Jira key detected |

### 4. Risk configuration

High-risk paths (trigger approval gate):
```
.env, *.pem, *.key
application-prod.yml / .properties
src/**/security/**, src/**/auth/**
src/**/payment/**
db/migration/**, migrations/**
```

High-risk keywords:
```
password, secret, token, privateKey,
payment, auth, permission, personalInfo, privacy
```

Customize both in `.ticketpilot/config.json` under `risk.highRiskPaths` and `risk.highRiskKeywords`.

### 5. HUD / statusLine

```json
{
  "statusLine": {
    "type": "command",
    "command": "ticketpilot hud"
  }
}
```

Add to Claude Code `settings.json`. Output example:
```
TicketPilot [PROJ-123] | phase: planned | risk: medium | mode: plan | next: approve plan
```

### 6. Troubleshooting links

| Problem | Fix |
|---------|-----|
| Runtime missing | `npm i -g ticketpilot-claudecode@latest` |
| Config missing | `ticketpilot init` |
| Jira auth failed | Regenerate token at Atlassian |
| Plugin issues | `/tp:doctor` |

---

## Related

- Setup: `/tp:setup`
- Health check: `/tp:doctor`
- Full config reference: `docs/configuration.md`
- Jira guide: `docs/jira.md`
