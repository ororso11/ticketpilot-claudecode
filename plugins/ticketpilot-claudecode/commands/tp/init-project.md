# /tp:init-project

Analyze the current project and generate TicketPilot project context files.

## Usage

```
/tp:init-project
```

---

## What This Command Does

Scans the project root and generates structured context that TicketPilot uses when analyzing Jira tickets. Similar to OMC's `deepinit`, but focused on what TicketPilot needs for ticket-driven development.

### Step 1 — Analyze Project Structure

Scan the project root and detect:

| Item | How to detect |
|------|--------------|
| Tech stack | `package.json`, `pom.xml`, `build.gradle`, `go.mod`, `requirements.txt`, `Cargo.toml` |
| Frameworks | `package.json` dependencies (Next.js, React, NestJS, etc.) |
| Package manager | `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `bun.lockb` |
| Build command | `package.json` scripts.build, `pom.xml`, `build.gradle` |
| Test command | `vitest.config.*`, `jest.config.*`, `package.json` scripts.test, `pytest.ini` |
| Important directories | `src/`, `app/`, `lib/`, `packages/`, `services/`, `api/`, `domain/` |
| Risk areas | directories named `auth`, `security`, `payment`, `privacy`, `migration` |

### Step 2 — Detect Coding Conventions

Look for:
- `.eslintrc.*`, `.prettierrc.*` → JavaScript/TypeScript conventions
- `checkstyle.xml`, `pmd.xml` → Java conventions
- `pyproject.toml` → Python conventions
- `CONTRIBUTING.md`, `STYLE.md` → documented conventions

Note the detected conventions briefly.

### Step 3 — Generate Files

Create or update the following files:

#### `.ticketpilot/project-memory.json`
```json
{
  "techStack": "<detected>",
  "frameworks": ["<detected>"],
  "packageManager": "<detected>",
  "buildCommand": "<detected>",
  "testCommand": "<detected>",
  "conventions": "<brief summary>",
  "jiraProject": "<from JIRA_BASE_URL or empty>",
  "importantPaths": ["src/", "..."],
  "riskAreas": ["auth", "security", "payment", "privacy", "db migration", "production config"],
  "directives": [
    { "directive": "운영 DB 관련 SQL은 실행 전 반드시 사용자 승인", "priority": "high" },
    { "directive": "개인정보/인증/결제 관련 변경은 high risk로 분류", "priority": "high" }
  ],
  "updatedAt": "<ISO timestamp>"
}
```

#### `.ticketpilot/artifacts/project/project-analysis.md`
A human-readable project overview with:
- Tech stack table
- Framework list
- Build/test commands
- Important directories
- Risk areas
- Coding conventions summary
- Directives

#### `docs/ticketpilot-project-map.md`
Same content as project-analysis.md — serves as a reference document for developers.

#### `AGENTS.md` (create only if it doesn't exist)
A concise AGENTS.md describing the project for Claude Code agents, including:
- Tech stack
- Directory structure
- Risk classifications
- TicketPilot workflow directives

### Step 4 — Show Summary

```
Project initialization complete.

  Stack:         Next.js / TypeScript
  Frameworks:    React, Next.js
  Pkg manager:   pnpm
  Build:         pnpm build
  Test:          pnpm test
  Risk areas:    auth, security, payment, db migration

Files written:
  .ticketpilot/project-memory.json
  .ticketpilot/artifacts/project/project-analysis.md
  docs/ticketpilot-project-map.md
  AGENTS.md

Next: /tp:start PROJ-123
```

---

## Rules

- **Read-only**: This command creates documentation files only. It does NOT modify any source code.
- **Idempotent**: Safe to run multiple times. Existing `AGENTS.md` is never overwritten (skipped with a warning).
- **No Jira calls**: Does not call the Jira API.
- **Credentials never logged**: Never print environment variable values.
