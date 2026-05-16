# Installation

## Recommended: Claude Code Plugin

### 1. Add marketplace

```
/plugin marketplace add https://github.com/ororso135055/ticketpilot-claudecode
```

### 2. Install plugin

```
/plugin install ticketpilot-claudecode@ticketpilot-claudecode-marketplace
```

### 3. Run setup

```
/tp:setup
```

Setup checks your environment, creates `.ticketpilot/`, guides Jira credential configuration, and tells you exactly what to do next.

### 4. Start a ticket

```
/tp:start PROJ-123
```

---

## Runtime CLI

During `/tp:setup`, TicketPilot checks whether the local runtime is available. The runtime handles Jira API calls, state management, diagnostics, and the HUD status line.

If setup says the runtime is missing:

```bash
npm i -g ticketpilot-claudecode@latest
```

Then run `/tp:setup` again.

> **Most users should not start here.** Start with the plugin flow above and let setup guide you.

---

## Manual Jira credentials

`/tp:setup` will guide you through this. If you prefer manual setup:

```bash
# macOS / Linux
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="your-api-token"
```

```powershell
# Windows PowerShell
$env:JIRA_BASE_URL="https://your-company.atlassian.net"
$env:JIRA_EMAIL="you@example.com"
$env:JIRA_API_TOKEN="your-api-token"
```

Get your API token at: https://id.atlassian.com/manage-profile/security/api-tokens

Add to your shell profile (`~/.bashrc`, `~/.zshrc`) for persistence.

---

## Verify

In Claude Code:
```
/tp:doctor
```

Or with the CLI (advanced):
```bash
ticketpilot doctor
ticketpilot jira test
```

---

## Updating

```
/plugin update ticketpilot-claudecode
```

CLI runtime:
```bash
npm i -g ticketpilot-claudecode@latest
```

## Uninstalling

```
/plugin uninstall ticketpilot-claudecode
```
