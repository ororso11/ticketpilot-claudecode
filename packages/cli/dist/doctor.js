import pc from 'picocolors';
import fse from 'fs-extra';
import path from 'path';
import { createJiraClientFromEnv } from './jira-client.js';
async function checkNodeVersion() {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0] ?? '0', 10);
    const ok = major >= 20;
    return {
        name: 'Node.js version',
        ok,
        message: ok ? `${version} (>= 20 required)` : `${version} — upgrade to Node.js 20+`,
    };
}
async function checkEnvVars() {
    const vars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
    const missing = vars.filter((v) => !process.env[v]);
    const ok = missing.length === 0;
    return {
        name: 'Jira env vars',
        ok,
        message: ok
            ? 'JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN are set'
            : `Missing: ${missing.join(', ')}`,
    };
}
async function checkConfig() {
    const configPath = path.join(process.cwd(), '.ticketpilot', 'config.json');
    const exists = await fse.pathExists(configPath);
    return {
        name: 'TicketPilot config',
        ok: exists,
        message: exists ? configPath : 'Not found — run `ticketpilot init`',
    };
}
async function checkTicketpilotDirs() {
    const dirs = ['.ticketpilot/state', '.ticketpilot/artifacts', '.ticketpilot/logs'];
    const missing = await Promise.all(dirs.map(async (d) => {
        const exists = await fse.pathExists(path.join(process.cwd(), d));
        return exists ? null : d;
    }));
    const missingDirs = missing.filter(Boolean);
    const ok = missingDirs.length === 0;
    return {
        name: 'TicketPilot directories',
        ok,
        message: ok ? 'All directories exist' : `Missing: ${missingDirs.join(', ')} — run ticketpilot init`,
    };
}
async function checkJiraConnection() {
    const client = createJiraClientFromEnv();
    if (!client) {
        return {
            name: 'Jira connection',
            ok: false,
            message: 'Skipped — Jira env vars not set',
        };
    }
    const result = await client.testConnection();
    return {
        name: 'Jira connection',
        ok: result.ok,
        message: result.ok
            ? `Connected as ${result.displayName}`
            : `Failed: ${result.error}`,
    };
}
function printCheck(check) {
    const icon = check.ok ? pc.green('✓') : pc.red('✗');
    const label = pc.bold(check.name.padEnd(28));
    console.log(`  ${icon} ${label} ${check.message}`);
}
export async function runDoctor() {
    console.log(pc.bold('\nTicketPilot Doctor\n'));
    const checks = await Promise.all([
        checkNodeVersion(),
        checkEnvVars(),
        checkConfig(),
        checkTicketpilotDirs(),
        checkJiraConnection(),
    ]);
    for (const check of checks) {
        printCheck(check);
    }
    const failures = checks.filter((c) => !c.ok);
    console.log('');
    if (failures.length === 0) {
        console.log(pc.green('All checks passed. TicketPilot is ready to use.'));
    }
    else {
        console.log(pc.yellow(`${failures.length} check(s) need attention. See above for details.`));
        console.log('\nQuick fixes:');
        console.log('  ticketpilot init          — initialize project directories');
        console.log('  ticketpilot config jira   — set up Jira credentials');
        console.log('  ticketpilot jira test     — test Jira connection');
    }
    console.log('');
}
//# sourceMappingURL=doctor.js.map