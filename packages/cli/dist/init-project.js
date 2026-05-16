import pc from 'picocolors';
import fse from 'fs-extra';
import path from 'path';
import { appendTrace, appendAudit } from './logger.js';
async function detectPackageManager(root) {
    if (await fse.pathExists(path.join(root, 'pnpm-lock.yaml')))
        return 'pnpm';
    if (await fse.pathExists(path.join(root, 'yarn.lock')))
        return 'yarn';
    if (await fse.pathExists(path.join(root, 'package-lock.json')))
        return 'npm';
    if (await fse.pathExists(path.join(root, 'bun.lockb')))
        return 'bun';
    if (await fse.pathExists(path.join(root, 'Pipfile')))
        return 'pipenv';
    if (await fse.pathExists(path.join(root, 'poetry.lock')))
        return 'poetry';
    if (await fse.pathExists(path.join(root, 'pom.xml')))
        return 'maven';
    if (await fse.pathExists(path.join(root, 'build.gradle')))
        return 'gradle';
    return 'unknown';
}
async function detectTechStack(root) {
    const frameworks = [];
    let stack = 'unknown';
    if (await fse.pathExists(path.join(root, 'package.json'))) {
        stack = 'Node.js';
        try {
            const pkg = await fse.readJson(path.join(root, 'package.json'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps['next'])
                frameworks.push('Next.js');
            if (deps['react'])
                frameworks.push('React');
            if (deps['vue'])
                frameworks.push('Vue');
            if (deps['@angular/core'])
                frameworks.push('Angular');
            if (deps['express'])
                frameworks.push('Express');
            if (deps['fastify'])
                frameworks.push('Fastify');
            if (deps['nestjs'] || deps['@nestjs/core'])
                frameworks.push('NestJS');
            if (deps['typescript'])
                frameworks.push('TypeScript');
        }
        catch {
            // ignore
        }
    }
    else if (await fse.pathExists(path.join(root, 'pom.xml'))) {
        stack = 'Java';
        frameworks.push('Maven');
        const content = await fse.readFile(path.join(root, 'pom.xml'), 'utf-8').catch(() => '');
        if (content.includes('spring-boot'))
            frameworks.push('Spring Boot');
        if (content.includes('quarkus'))
            frameworks.push('Quarkus');
    }
    else if (await fse.pathExists(path.join(root, 'build.gradle'))) {
        stack = 'Java/Kotlin';
        frameworks.push('Gradle');
        const content = await fse.readFile(path.join(root, 'build.gradle'), 'utf-8').catch(() => '');
        if (content.includes('spring'))
            frameworks.push('Spring Boot');
    }
    else if (await fse.pathExists(path.join(root, 'go.mod'))) {
        stack = 'Go';
    }
    else if (await fse.pathExists(path.join(root, 'requirements.txt')) || await fse.pathExists(path.join(root, 'Pipfile'))) {
        stack = 'Python';
        const req = await fse.readFile(path.join(root, 'requirements.txt'), 'utf-8').catch(() => '');
        if (req.includes('django'))
            frameworks.push('Django');
        if (req.includes('flask'))
            frameworks.push('Flask');
        if (req.includes('fastapi'))
            frameworks.push('FastAPI');
    }
    else if (await fse.pathExists(path.join(root, 'Cargo.toml'))) {
        stack = 'Rust';
    }
    return { stack, frameworks };
}
async function detectBuildCommand(root, packageManager) {
    if (packageManager === 'pnpm' || packageManager === 'npm' || packageManager === 'yarn' || packageManager === 'bun') {
        try {
            const pkg = await fse.readJson(path.join(root, 'package.json'));
            if (pkg.scripts?.build)
                return `${packageManager} run build`;
        }
        catch { /* ignore */ }
    }
    if (packageManager === 'maven')
        return 'mvn package';
    if (packageManager === 'gradle')
        return './gradlew build';
    return 'unknown';
}
async function detectTestCommand(root, packageManager) {
    if (['pnpm', 'npm', 'yarn', 'bun'].includes(packageManager)) {
        try {
            const pkg = await fse.readJson(path.join(root, 'package.json'));
            if (pkg.scripts?.test && !String(pkg.scripts.test).includes('no test')) {
                return `${packageManager} test`;
            }
        }
        catch { /* ignore */ }
        if (await fse.pathExists(path.join(root, 'vitest.config.ts')))
            return 'npx vitest run';
        if (await fse.pathExists(path.join(root, 'jest.config.ts')) || await fse.pathExists(path.join(root, 'jest.config.js')))
            return 'npx jest';
    }
    if (packageManager === 'maven')
        return 'mvn test';
    if (packageManager === 'gradle')
        return './gradlew test';
    if (packageManager === 'pipenv' || packageManager === 'poetry')
        return 'pytest';
    return 'unknown';
}
async function detectImportantPaths(root) {
    const candidates = ['src', 'app', 'lib', 'packages', 'services', 'api', 'server', 'client', 'frontend', 'backend', 'core', 'domain'];
    const found = [];
    for (const c of candidates) {
        if (await fse.pathExists(path.join(root, c)))
            found.push(c);
    }
    return found;
}
async function detectRiskAreas(root) {
    const found = [];
    const riskDirs = ['auth', 'security', 'payment', 'privacy', 'migration', 'migrations', 'db'];
    const entries = await fse.readdir(root).catch(() => []);
    for (const entry of entries) {
        for (const r of riskDirs) {
            if (entry.toLowerCase().includes(r))
                found.push(entry);
        }
    }
    return [...new Set(['auth', 'security', 'payment', 'privacy', 'db migration', 'production config', ...found])];
}
function buildProjectAnalysisDoc(memory, ticketpilotJiraProject) {
    const now = new Date().toISOString();
    return `# Project Analysis

> Generated by TicketPilot /tp:init-project on ${now}

## Tech Stack

- **Stack:** ${memory.techStack}
- **Frameworks:** ${memory.frameworks.join(', ') || 'none detected'}
- **Package Manager:** ${memory.packageManager}
- **Build Command:** \`${memory.buildCommand}\`
- **Test Command:** \`${memory.testCommand}\`
- **Jira Project:** ${ticketpilotJiraProject || 'not set'}

## Important Directories

${memory.importantPaths.map((p) => `- \`${p}/\``).join('\n') || '- (none detected)'}

## Risk Areas

${memory.riskAreas.map((r) => `- ${r}`).join('\n')}

## Coding Conventions

${memory.conventions || '(not yet documented — update manually in .ticketpilot/project-memory.json)'}

## Directives

${memory.directives.map((d) => `- [${d.priority.toUpperCase()}] ${d.directive}`).join('\n')}

---
_This file is read by TicketPilot when analyzing Jira tickets to provide better context._
_Run \`/tp:init-project\` again to refresh after major project changes._
`;
}
function buildAgentsMd(memory) {
    return `# AGENTS.md — TicketPilot Project Configuration

> Auto-generated by TicketPilot /tp:init-project. Keep this file updated.

## Project Overview

- **Tech Stack:** ${memory.techStack}
- **Frameworks:** ${memory.frameworks.join(', ') || 'N/A'}
- **Package Manager:** ${memory.packageManager}
- **Build:** \`${memory.buildCommand}\`
- **Test:** \`${memory.testCommand}\`

## Directory Structure

${memory.importantPaths.map((p) => `- \`${p}/\``).join('\n') || '- (update manually)'}

## Risk Classification

The following areas are classified as HIGH RISK and require explicit user approval:
${memory.riskAreas.map((r) => `- ${r}`).join('\n')}

## Agent Directives

${memory.directives.map((d) => `- [${d.priority.toUpperCase()}] ${d.directive}`).join('\n')}

## TicketPilot Workflow

This project uses TicketPilot for Jira-driven development.
Slash commands: \`/tp:start\`, \`/tp:plan\`, \`/tp:status\`, \`/tp:resume\`, \`/tp:trace\`, \`/tp:cancel\`
`;
}
export async function runInitProject() {
    const root = process.cwd();
    console.log(pc.bold('\nTicketPilot Project Initialization\n'));
    console.log('Analyzing project structure...\n');
    const packageManager = await detectPackageManager(root);
    const { stack, frameworks } = await detectTechStack(root);
    const buildCommand = await detectBuildCommand(root, packageManager);
    const testCommand = await detectTestCommand(root, packageManager);
    const importantPaths = await detectImportantPaths(root);
    const riskAreas = await detectRiskAreas(root);
    console.log(`  ${pc.green('✓')} Tech stack:    ${stack}`);
    console.log(`  ${pc.green('✓')} Frameworks:    ${frameworks.join(', ') || 'none'}`);
    console.log(`  ${pc.green('✓')} Pkg manager:   ${packageManager}`);
    console.log(`  ${pc.green('✓')} Build:         ${buildCommand}`);
    console.log(`  ${pc.green('✓')} Test:          ${testCommand}`);
    console.log(`  ${pc.green('✓')} Key paths:     ${importantPaths.join(', ') || 'none'}`);
    const memPath = path.join(root, '.ticketpilot', 'project-memory.json');
    let existing = null;
    if (await fse.pathExists(memPath)) {
        try {
            existing = await fse.readJson(memPath);
        }
        catch { /* ignore */ }
    }
    const jiraProject = existing?.jiraProject ?? process.env['JIRA_BASE_URL']?.match(/https:\/\/([^.]+)/)?.[1] ?? '';
    const memory = {
        techStack: stack,
        frameworks,
        packageManager,
        buildCommand,
        testCommand,
        conventions: existing?.conventions ?? '',
        jiraProject,
        importantPaths,
        riskAreas,
        directives: existing?.directives ?? [
            { directive: '운영 DB 관련 SQL은 실행 전 반드시 사용자 승인', priority: 'high' },
            { directive: '개인정보/인증/결제 관련 변경은 high risk로 분류', priority: 'high' },
        ],
        updatedAt: new Date().toISOString(),
    };
    // Write project-memory.json
    await fse.ensureDir(path.dirname(memPath));
    await fse.writeJson(memPath, memory, { spaces: 2 });
    console.log(`  ${pc.green('✓')} .ticketpilot/project-memory.json updated`);
    // Write project-analysis.md
    const analysisPath = path.join(root, '.ticketpilot', 'artifacts', 'project', 'project-analysis.md');
    await fse.ensureDir(path.dirname(analysisPath));
    await fse.writeFile(analysisPath, buildProjectAnalysisDoc(memory, jiraProject), 'utf-8');
    console.log(`  ${pc.green('✓')} .ticketpilot/artifacts/project/project-analysis.md written`);
    // Write docs/ticketpilot-project-map.md
    const mapPath = path.join(root, 'docs', 'ticketpilot-project-map.md');
    await fse.ensureDir(path.dirname(mapPath));
    await fse.writeFile(mapPath, buildProjectAnalysisDoc(memory, jiraProject), 'utf-8');
    console.log(`  ${pc.green('✓')} docs/ticketpilot-project-map.md written`);
    // Write AGENTS.md
    const agentsPath = path.join(root, 'AGENTS.md');
    const agentsExists = await fse.pathExists(agentsPath);
    if (agentsExists) {
        console.log(`  ${pc.dim('–')} AGENTS.md already exists — skipping (update manually)`);
    }
    else {
        await fse.writeFile(agentsPath, buildAgentsMd(memory), 'utf-8');
        console.log(`  ${pc.green('✓')} AGENTS.md created`);
    }
    await appendTrace('project_initialized', {
        message: `Project initialized: ${stack} / ${frameworks.join(', ')}`,
    });
    await appendAudit(`Project initialized: ${stack}, pkg=${packageManager}, build=${buildCommand}`);
    console.log(pc.bold('\nProject initialization complete.\n'));
    console.log('Next: run /tp:start PROJ-123 in Claude Code to start a ticket workflow.');
    console.log('');
}
//# sourceMappingURL=init-project.js.map