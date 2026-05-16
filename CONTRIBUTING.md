# Contributing to TicketPilot Claude Code Plugin

Thank you for your interest in contributing!

## Development Setup

```bash
# Prerequisites: Node.js >= 20, pnpm >= 9
git clone https://github.com/ororso11/ticketpilot-claudecode.git
cd ticketpilot-claudecode
pnpm install
pnpm build
```

## Project Structure

```
ticketpilot-claudecode/
├── .claude-plugin/          # Marketplace registration
├── plugins/ticketpilot-claudecode/  # Claude Code plugin
│   ├── commands/            # /tp:* slash commands
│   ├── agents/              # Specialized agent prompts
│   ├── skills/              # Reusable skill definitions
│   └── hooks/               # Lifecycle hook scripts
├── packages/cli/            # npm CLI (ticketpilot / tp)
├── docs/                    # Documentation
└── templates/               # Artifact templates
```

## Guidelines

- TypeScript strict mode — all code must type-check cleanly.
- No credentials in logs — never `console.log` any env variable values.
- Safety first — v0.1 is read-only. PRs that add write operations must include approval gates.
- Test your changes with `ticketpilot doctor` and `ticketpilot jira test`.

## Commit Convention

```
feat: add /tp:review command
fix: handle Jira 404 gracefully
docs: update installation guide
chore: bump dependencies
```

## Pull Request Process

1. Fork the repo and create a feature branch.
2. Run `pnpm build` — must pass with no errors.
3. Update docs if you add/change commands or config options.
4. Open a PR with a clear description of the change and why.

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.
