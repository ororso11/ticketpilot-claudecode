# Roadmap

## v0.1 — Plugin-first MVP (Current)

Simple plugin-first setup: install → `/tp:setup` → `/tp:start`. Read-only analysis and planning.

### Claude Code Plugin
- [x] Marketplace installation
- [x] `/tp:setup` — setup wizard (plugin-first flow)
- [x] `/tp:init-project` — project analysis
- [x] `/tp:start <key>` — full ticket workflow
- [x] `/tp:plan <key>` — plan-only mode
- [x] `/tp:status` — workflow state
- [x] `/tp:resume` — session restore
- [x] `/tp:trace` — event timeline
- [x] `/tp:cancel [--force]` — workflow cancellation
- [x] `/tp:config` — configuration reference
- [x] `/tp:doctor` — health check

### CLI Runtime
- [x] `ticketpilot setup / init / init-project`
- [x] `ticketpilot doctor / hud / trace / cancel`
- [x] `ticketpilot jira test / get`
- [x] `ticketpilot mcp jira` (stub)

### Artifacts
- [x] `ticket-analysis.md`
- [x] `ticket-prd.json` (AC extraction)
- [x] `implementation-plan.md`
- [x] `impact-analysis.md`
- [x] `project-analysis.md`
- [x] Trace logging (`trace.jsonl`, `audit.log`)

### Safety
- [x] Read-only by default
- [x] Risk classification (low/medium/high)
- [x] Approval gates
- [x] Hook-based safety guard

---

## v0.2 — Implementation Loop

- [ ] Approval-gated code editing via Claude
- [ ] Automatic test execution after edits
- [ ] Test failure → fix loop (up to `maxTestFixAttempts`)
- [ ] `ralph` mode: repeat until all AC pass
- [ ] `/tp:implement` command
- [ ] `/tp:test` command
- [ ] `ticketpilot mcp jira` — full MCP server
- [ ] Optional runtime auto-detection (improved setup wizard)

---

## v0.3 — Review & Delivery

- [ ] Code review artifact (`review-report.md`)
- [ ] Jira comment posting (approval-gated)
- [ ] GitHub PR creation (approval-gated)
- [ ] GitLab MR creation (approval-gated)
- [ ] `TP_NOTIFY` — Slack/Discord/Telegram notifications
- [ ] `/tp:review` and `/tp:deliver` commands

---

## v1.0 — Pro / Enterprise

- [ ] Team policy management
- [ ] Audit dashboard
- [ ] On-premises installation
- [ ] Jira Data Center support
- [ ] GitHub Enterprise / GitLab Enterprise
- [ ] `autopilot` full mode: end-to-end with approval gates
- [ ] Multi-ticket queue management

---

## Mode Roadmap

| Mode | v0.1 | v0.2 | v0.3 | v1.0 |
|------|------|------|------|------|
| `plan` | Full | Full | Full | Full |
| `eco` | Full | Full | Full | Full |
| `autopilot` | Structure only | Implementation | Full pipeline | Team-aware |
| `ralph` | Structure only | AC loop | With review | With notifications |
