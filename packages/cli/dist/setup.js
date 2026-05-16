import pc from 'picocolors';
import fse from 'fs-extra';
import path from 'path';
import { saveConfig, saveConfigExample, getDefaultConfig } from './config.js';
import { getJiraEnv } from './config.js';
import { appendTrace, appendAudit } from './logger.js';
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
const DIRS = [
    '.ticketpilot/state',
    '.ticketpilot/artifacts',
    '.ticketpilot/artifacts/project',
    '.ticketpilot/logs',
];
function icon(ok, warn = false) {
    if (ok)
        return pc.green('✓');
    if (warn)
        return pc.yellow('⚠');
    return pc.red('✗');
}
export async function runSetup() {
    console.log(pc.bold('\nTicketPilot Setup Wizard\n'));
    console.log('Checking and initializing your TicketPilot environment...\n');
    // Directories
    for (const dir of DIRS) {
        const fullPath = path.join(process.cwd(), dir);
        const existed = await fse.pathExists(fullPath);
        await fse.ensureDir(fullPath);
        console.log(`  ${icon(true)} ${dir}${existed ? '' : ' (created)'}`);
    }
    // config.json
    const configPath = path.join(process.cwd(), '.ticketpilot', 'config.json');
    if (!(await fse.pathExists(configPath))) {
        await saveConfig(getDefaultConfig());
        console.log(`  ${icon(true)} .ticketpilot/config.json (created)`);
    }
    else {
        console.log(`  ${icon(true)} .ticketpilot/config.json`);
    }
    await saveConfigExample();
    // notepad.md
    const notepadPath = path.join(process.cwd(), '.ticketpilot', 'notepad.md');
    if (!(await fse.pathExists(notepadPath))) {
        await fse.writeFile(notepadPath, NOTEPAD_INITIAL, 'utf-8');
        console.log(`  ${icon(true)} .ticketpilot/notepad.md (created)`);
    }
    else {
        console.log(`  ${icon(true)} .ticketpilot/notepad.md`);
    }
    // project-memory.json
    const memPath = path.join(process.cwd(), '.ticketpilot', 'project-memory.json');
    if (!(await fse.pathExists(memPath))) {
        await fse.writeJson(memPath, PROJECT_MEMORY_INITIAL, { spaces: 2 });
        console.log(`  ${icon(true)} .ticketpilot/project-memory.json (created)`);
    }
    else {
        console.log(`  ${icon(true)} .ticketpilot/project-memory.json`);
    }
    // Jira env vars
    console.log('');
    const env = getJiraEnv();
    const jiraVars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
    const missing = [];
    for (const v of jiraVars) {
        const set = Boolean(process.env[v]);
        console.log(`  ${icon(set, false)} ${v}${set ? '' : ' (not set)'}`);
        if (!set)
            missing.push(v);
    }
    if (missing.length > 0) {
        console.log(pc.yellow(`\n  Missing Jira credentials. Set:`));
        console.log('    export JIRA_BASE_URL="https://your-company.atlassian.net"');
        console.log('    export JIRA_EMAIL="you@example.com"');
        console.log('    export JIRA_API_TOKEN="your-api-token"');
        console.log('  API tokens: https://id.atlassian.com/manage-profile/security/api-tokens');
    }
    // Claude Code statusLine guidance
    console.log(pc.bold('\nClaude Code statusLine (optional):'));
    console.log('  Add to your Claude Code settings.json:');
    console.log('  {');
    console.log('    "statusLine": {');
    console.log('      "type": "command",');
    console.log('      "command": "ticketpilot hud"');
    console.log('    }');
    console.log('  }');
    // Hooks guidance
    console.log(pc.bold('\nHooks:'));
    console.log('  Hooks are installed via the Claude Code plugin.');
    console.log('  Plugin install: /plugin install ticketpilot-claudecode@ticketpilot-claudecode-marketplace');
    console.log('  Or set TP_DISABLE=1 to disable all hooks.');
    await appendTrace('setup_completed', { message: 'TicketPilot setup wizard completed' });
    await appendAudit('Setup wizard completed');
    console.log(pc.bold('\nSetup complete. Next steps:\n'));
    console.log('  ticketpilot doctor       — run full health check');
    console.log('  ticketpilot jira test    — test Jira connection');
    console.log('  /tp:init-project         — analyze current project (in Claude Code)');
    console.log('  /tp:start PROJ-123       — start working on a ticket (in Claude Code)');
    console.log('');
}
//# sourceMappingURL=setup.js.map