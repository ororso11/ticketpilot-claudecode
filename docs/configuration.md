# Configuration

## Default path: /tp:setup

The easiest way to configure TicketPilot is to run `/tp:setup` after installing the plugin. It checks your environment and guides you step by step.

For viewing and understanding configuration options, run `/tp:config`.

---

## Config file

TicketPilot stores project-level configuration at `.ticketpilot/config.json`.

Generated automatically by `/tp:setup` or `ticketpilot init`.

### Full config reference

```json
{
  "jira": {
    "baseUrlEnv": "JIRA_BASE_URL",
    "emailEnv": "JIRA_EMAIL",
    "tokenEnv": "JIRA_API_TOKEN",
    "defaultProject": "PROJ"
  },
  "git": {
    "branchPrefix": "feature/",
    "autoCreateBranch": false,
    "allowPush": false
  },
  "workflow": {
    "requireApprovalBeforeEdit": true,
    "requireApprovalBeforeJiraComment": true,
    "requireApprovalBeforePr": true,
    "maxTestFixAttempts": 3,
    "autoRunTests": false,
    "autoSuggestOnTicketKey": true,
    "autoStartOnTicketKey": false,
    "defaultMode": "plan"
  },
  "risk": {
    "highRiskPaths": [
      ".env", "*.pem", "*.key",
      "application-prod.yml", "application-prod.properties",
      "src/**/security/**", "src/**/auth/**",
      "src/**/payment/**", "db/migration/**", "migrations/**"
    ],
    "highRiskKeywords": [
      "password", "secret", "token", "privateKey",
      "payment", "auth", "permission", "personalInfo", "privacy"
    ]
  }
}
```

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `JIRA_BASE_URL` | Jira Cloud base URL |
| `JIRA_EMAIL` | Atlassian account email |
| `JIRA_API_TOKEN` | Jira API token |
| `TP_DISABLE` | Set to `1` to disable all hooks |
| `TP_SKIP_HOOKS` | Comma-separated hook names to skip |
| `TP_NOTIFY` | Notification toggle (v0.3+, default `0`) |

---

## Workflow modes

| Mode | Description |
|------|-------------|
| `plan` | Analysis and planning only — default |
| `eco` | Lightweight analysis, minimal output |
| `autopilot` | Full pipeline with approval gates (v0.2+) |
| `ralph` | Repeat until all AC pass (v0.2+) |

---

## statusLine / HUD (optional)

Add to Claude Code `settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "ticketpilot hud"
  }
}
```

Output example:
```
TicketPilot [PROJ-123] | phase: planned | risk: medium | mode: plan | next: approve plan
```

---

## Project memory

`.ticketpilot/project-memory.json` — project-level context used across all ticket workflows.

Run `/tp:init-project` to auto-populate. Key fields:

```json
{
  "techStack": "Node.js",
  "frameworks": ["Next.js", "TypeScript"],
  "packageManager": "pnpm",
  "buildCommand": "pnpm build",
  "testCommand": "pnpm test",
  "importantPaths": ["src/", "app/"],
  "riskAreas": ["auth", "security", "payment"]
}
```

## Notepad

`.ticketpilot/notepad.md` — persistent scratchpad preserved across sessions and context compaction.

---

## Advanced: manual CLI configuration

For environments without the plugin, see [docs/npm-cli.md](npm-cli.md).
