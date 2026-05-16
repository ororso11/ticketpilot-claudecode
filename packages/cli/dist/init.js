import pc from 'picocolors';
import fse from 'fs-extra';
import path from 'path';
import { saveConfig, saveConfigExample, getDefaultConfig } from './config.js';
import { appendTrace, appendAudit } from './logger.js';
const DIRS = [
    '.ticketpilot/state',
    '.ticketpilot/artifacts',
    '.ticketpilot/artifacts/project',
    '.ticketpilot/logs',
];
const NOTEPAD_INITIAL = `# TicketPilot Notepad

This file stores durable notes for the current project and active ticket workflows.

## Current Focus

## Approved Decisions

## Important Files

## Risks

## Next Actions
`;
const PROJECT_MEMORY_INITIAL = {
    techStack: '',
    frameworks: [],
    packageManager: '',
    buildCommand: '',
    testCommand: '',
    conventions: '',
    jiraProject: '',
    importantPaths: [],
    riskAreas: ['auth', 'security', 'payment', 'privacy', 'db migration', 'production config'],
    directives: [
        { directive: '운영 DB 관련 SQL은 실행 전 반드시 사용자 승인', priority: 'high' },
        { directive: '개인정보/인증/결제 관련 변경은 high risk로 분류', priority: 'high' },
    ],
    updatedAt: null,
};
const GITIGNORE_ENTRIES = [
    '.ticketpilot/state/',
    '.ticketpilot/artifacts/',
    '.ticketpilot/logs/',
];
async function ensureGitignore() {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    let content = '';
    if (await fse.pathExists(gitignorePath)) {
        content = await fse.readFile(gitignorePath, 'utf-8');
    }
    const missing = GITIGNORE_ENTRIES.filter((e) => !content.includes(e));
    if (missing.length > 0) {
        const addition = '\n# TicketPilot generated files\n' + missing.join('\n') + '\n';
        await fse.appendFile(gitignorePath, addition, 'utf-8');
        console.log(pc.dim('  + .gitignore updated'));
    }
}
export async function runInit() {
    console.log(pc.bold('\nInitializing TicketPilot...\n'));
    for (const dir of DIRS) {
        const fullPath = path.join(process.cwd(), dir);
        await fse.ensureDir(fullPath);
        console.log(`  ${pc.green('✓')} Created ${dir}`);
    }
    const configPath = path.join(process.cwd(), '.ticketpilot', 'config.json');
    if (!(await fse.pathExists(configPath))) {
        await saveConfig(getDefaultConfig());
        console.log(`  ${pc.green('✓')} Created .ticketpilot/config.json`);
    }
    else {
        console.log(`  ${pc.dim('–')} .ticketpilot/config.json already exists`);
    }
    await saveConfigExample();
    const notepadPath = path.join(process.cwd(), '.ticketpilot', 'notepad.md');
    if (!(await fse.pathExists(notepadPath))) {
        await fse.writeFile(notepadPath, NOTEPAD_INITIAL, 'utf-8');
        console.log(`  ${pc.green('✓')} Created .ticketpilot/notepad.md`);
    }
    else {
        console.log(`  ${pc.dim('–')} .ticketpilot/notepad.md already exists`);
    }
    const memPath = path.join(process.cwd(), '.ticketpilot', 'project-memory.json');
    if (!(await fse.pathExists(memPath))) {
        await fse.writeJson(memPath, PROJECT_MEMORY_INITIAL, { spaces: 2 });
        console.log(`  ${pc.green('✓')} Created .ticketpilot/project-memory.json`);
    }
    else {
        console.log(`  ${pc.dim('–')} .ticketpilot/project-memory.json already exists`);
    }
    await ensureGitignore();
    await appendTrace('setup_completed', { message: 'TicketPilot init completed' });
    await appendAudit('ticketpilot init completed');
    console.log(pc.bold('\nTicketPilot initialized successfully.\n'));
    console.log('Next steps:');
    console.log('  1. Set environment variables:');
    console.log('       export JIRA_BASE_URL="https://your-company.atlassian.net"');
    console.log('       export JIRA_EMAIL="you@example.com"');
    console.log('       export JIRA_API_TOKEN="your-api-token"');
    console.log('');
    console.log('  2. Test your Jira connection:');
    console.log('       ticketpilot jira test');
    console.log('');
    console.log('  3. Analyze your project:');
    console.log('       /tp:init-project  (in Claude Code)');
    console.log('');
    console.log('  4. Start working on a ticket:');
    console.log('       /tp:start PROJ-123  (in Claude Code)');
    console.log('');
}
//# sourceMappingURL=init.js.map