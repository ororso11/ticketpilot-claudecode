# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-16

### Added

- Claude Code marketplace plugin (`ticketpilot-claudecode`)
- npm CLI (`ticketpilot` / `tp` binary)
- `/tp:start <ticketKey>` — full ticket analysis + implementation plan + impact analysis
- `/tp:plan <ticketKey>` — analysis and planning only (no code changes)
- `/tp:status` — view current ticket workflow state
- `/tp:resume` — resume a previous ticket workflow from saved state
- `/tp:config` — environment setup guide and validation
- Jira REST API v3 integration (read-only: issue + comments)
- State persistence in `.ticketpilot/state/current-ticket.json`
- Artifact generation: `ticket-analysis.md`, `implementation-plan.md`, `impact-analysis.md`
- Risk detector for high-risk paths and keywords
- Lifecycle hooks: session-start, user-prompt, pre-tool-guard, post-tool-state-save, pre-compact-save, stop-summary
- `ticketpilot init` — project initialization
- `ticketpilot config jira` — Jira credential guidance
- `ticketpilot jira test` — Jira authentication test
- `ticketpilot jira get <ticketKey>` — fetch and display a ticket
- `ticketpilot status` — show current workflow state
- `ticketpilot doctor` — system health check
- `ticketpilot mcp jira` — MCP server for Jira (stub)
- Specialized agents: ticket-analyst, solution-architect, safety-guard, jira-reporter
- Skills: jira-ticket-analysis, implementation-planning, impact-analysis, artifact-generation
- Artifact templates for all output types
- Full documentation in `docs/`

### Security

- Read-only by default — no automatic code modification in v0.1
- Credentials never logged
- High-risk path/keyword classification with approval gates
