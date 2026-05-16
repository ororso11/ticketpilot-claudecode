# Marketplace Installation

## Installing from Claude Code

```
/plugin marketplace add https://github.com/ororso135055/ticketpilot-claudecode
/plugin install ticketpilot-claudecode@ticketpilot-claudecode-marketplace
```

## What Gets Installed

The marketplace plugin installs:
- All `/tp:*` slash commands
- Specialized agents (ticket-analyst, solution-architect, safety-guard, jira-reporter)
- Skills (jira-ticket-analysis, implementation-planning, impact-analysis, artifact-generation)
- Lifecycle hooks (session-start, pre-tool-guard, post-tool-state-save, pre-compact-save, stop-summary)

## Marketplace Manifest

The marketplace is defined in `.claude-plugin/marketplace.json` at the repository root.

The plugin source is at `./plugins/ticketpilot-claudecode`.

## Plugin Manifest

The plugin manifest is at `plugins/ticketpilot-claudecode/.claude-plugin/plugin.json`.

Key fields:
```json
{
  "name": "ticketpilot-claudecode",
  "version": "0.1.0",
  "license": "Apache-2.0"
}
```

## Updating the Plugin

```
/plugin update ticketpilot-claudecode
```

## Uninstalling

```
/plugin uninstall ticketpilot-claudecode
```

## For Plugin Publishers

To publish your own fork:

1. Fork the repository
2. Update `marketplace.json` with your GitHub URL
3. Tag a release: `git tag v0.1.0 && git push --tags`
4. Users can install from your fork:
   ```
   /plugin marketplace add https://github.com/YOUR_FORK/ticketpilot-claudecode
   ```
