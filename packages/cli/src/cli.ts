#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import pc from 'picocolors';
import { runInit } from './init.js';
import { runSetup } from './setup.js';
import { runInitProject } from './init-project.js';
import { runDoctor } from './doctor.js';
import { runTrace } from './trace.js';
import { runCancel } from './cancel.js';
import { runHud } from './hud.js';
import { runStart, runPlan } from './workflow-engine.js';
import { readState } from './state-store.js';
import { createJiraClientFromEnv, formatDescription } from './jira-client.js';
import { startMcpServer } from './mcp-server.js';
import { getJiraEnv } from './config.js';

const program = new Command();

program
  .name('ticketpilot')
  .description('TicketPilot — Jira ticket-driven development automation for Claude Code')
  .version('0.1.0');

// ── init ────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Initialize TicketPilot directories and config in the current project')
  .action(async () => { await runInit(); });

// ── setup ───────────────────────────────────────────────────────────────────
program
  .command('setup')
  .description('Interactive setup wizard — run this first')
  .action(async () => { await runSetup(); });

// ── init-project ─────────────────────────────────────────────────────────────
program
  .command('init-project')
  .description('Analyze current project and generate project-memory.json + AGENTS.md')
  .action(async () => { await runInitProject(); });

// ── doctor ──────────────────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Check system health and configuration')
  .action(async () => { await runDoctor(); });

// ── trace ───────────────────────────────────────────────────────────────────
program
  .command('trace')
  .description('Show workflow event timeline from trace.jsonl')
  .option('-n, --limit <n>', 'Number of events to show', '50')
  .action(async (opts: { limit: string }) => {
    await runTrace(parseInt(opts.limit, 10));
  });

// ── cancel ──────────────────────────────────────────────────────────────────
program
  .command('cancel')
  .description('Cancel the current TicketPilot workflow')
  .option('--force', 'Force-reset state (backup and remove current-ticket.json)')
  .action(async (opts: { force?: boolean }) => {
    await runCancel(opts.force ?? false);
  });

// ── hud ─────────────────────────────────────────────────────────────────────
program
  .command('hud')
  .description('Print one-line status for Claude Code statusLine integration')
  .action(async () => { await runHud(); });

// ── config ──────────────────────────────────────────────────────────────────
const configCmd = program.command('config').description('Configuration commands');

configCmd
  .command('jira')
  .description('Show Jira configuration status and guidance')
  .action(() => {
    console.log(pc.bold('\nJira Configuration\n'));

    const vars: Array<{ name: string; set: boolean }> = [
      { name: 'JIRA_BASE_URL', set: Boolean(process.env['JIRA_BASE_URL']) },
      { name: 'JIRA_EMAIL', set: Boolean(process.env['JIRA_EMAIL']) },
      { name: 'JIRA_API_TOKEN', set: Boolean(process.env['JIRA_API_TOKEN']) },
    ];

    for (const v of vars) {
      const icon = v.set ? pc.green('✓') : pc.red('✗');
      console.log(`  ${icon} ${v.name}`);
    }

    const env = getJiraEnv();
    if (!env) {
      console.log(pc.yellow('\nSet the following environment variables:'));
      console.log('');
      console.log('  export JIRA_BASE_URL="https://your-company.atlassian.net"');
      console.log('  export JIRA_EMAIL="you@example.com"');
      console.log('  export JIRA_API_TOKEN="your-api-token"');
      console.log('');
      console.log('  API tokens: https://id.atlassian.com/manage-profile/security/api-tokens');
      console.log('  Add to shell profile for persistence (~/.bashrc, ~/.zshrc)');
    } else {
      console.log(pc.green('\nAll Jira credentials are set.'));
      console.log('  Run `ticketpilot jira test` to verify the connection.');
    }
    console.log('');
  });

// ── jira ────────────────────────────────────────────────────────────────────
const jiraCmd = program.command('jira').description('Jira commands');

jiraCmd
  .command('test')
  .description('Test Jira authentication and connectivity')
  .action(async () => {
    console.log(pc.bold('\nTesting Jira connection...\n'));
    const client = createJiraClientFromEnv();
    if (!client) {
      console.error(pc.red('Jira credentials not set. Run: ticketpilot config jira'));
      process.exit(1);
    }
    const result = await client.testConnection();
    if (result.ok) {
      console.log(pc.green(`✓ Connected to Jira as: ${result.displayName}`));
      console.log(pc.green(`  Base URL: ${process.env['JIRA_BASE_URL']}`));
    } else {
      console.error(pc.red(`✗ Connection failed: ${result.error}`));
      console.log('\nTroubleshooting:');
      console.log('  1. Check JIRA_BASE_URL format: https://company.atlassian.net');
      console.log('  2. Regenerate API token: https://id.atlassian.com/manage-profile/security/api-tokens');
      console.log('  3. Verify JIRA_EMAIL matches your Atlassian account');
      process.exit(1);
    }
    console.log('');
  });

jiraCmd
  .command('get <ticketKey>')
  .description('Fetch and display a Jira ticket')
  .action(async (ticketKey: string) => {
    console.log(pc.bold(`\nFetching ticket: ${ticketKey}\n`));
    const client = createJiraClientFromEnv();
    if (!client) {
      console.error(pc.red('Jira credentials not set. Run: ticketpilot config jira'));
      process.exit(1);
    }
    const [issue, comments] = await Promise.all([
      client.getIssue(ticketKey),
      client.getComments(ticketKey),
    ]);
    const f = issue.fields;
    console.log(pc.bold(`${issue.key}: ${f.summary}`));
    console.log(`Type: ${f.issuetype.name} | Status: ${pc.cyan(f.status.name)} | Priority: ${f.priority?.name ?? 'None'}`);
    console.log(`Assignee: ${f.assignee?.displayName ?? 'Unassigned'} | Reporter: ${f.reporter?.displayName ?? 'Unknown'}`);
    if (f.labels && f.labels.length > 0) console.log(`Labels: ${f.labels.join(', ')}`);
    console.log('');
    console.log(pc.bold('Description:'));
    console.log(formatDescription(f.description));
    console.log('');
    if (comments.length > 0) {
      console.log(pc.bold(`Comments (${comments.length}):`));
      for (const c of comments.slice(0, 5)) {
        console.log(pc.dim(`\n  ${c.author.displayName} — ${new Date(c.created).toLocaleDateString()}`));
        const body = typeof c.body === 'string' ? c.body : JSON.stringify(c.body);
        console.log(`  ${body.split('\n')[0]}`);
      }
      if (comments.length > 5) console.log(pc.dim(`\n  ... and ${comments.length - 5} more`));
    }
    console.log('');
  });

// ── status ──────────────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show current ticket workflow state')
  .action(async () => {
    const state = await readState();
    if (!state) {
      console.log(pc.yellow('\nNo active ticket. Run `/tp:start PROJ-123` in Claude Code.\n'));
      return;
    }
    console.log(pc.bold('\nCurrent Ticket Workflow\n'));
    console.log(`  Ticket:     ${pc.cyan(state.ticketKey)}`);
    console.log(`  Phase:      ${pc.bold(state.phase)}`);
    console.log(`  Mode:       ${state.mode}`);
    const riskColor = state.riskLevel === 'high' ? pc.red : state.riskLevel === 'medium' ? pc.yellow : pc.green;
    console.log(`  Risk Level: ${riskColor(state.riskLevel)}`);
    console.log(`  Updated:    ${new Date(state.updatedAt).toLocaleString()}`);
    console.log('');
    console.log('  Artifacts:');
    for (const [name, p] of Object.entries(state.artifacts)) {
      const icon = p ? pc.green('✓') : pc.dim('–');
      console.log(`    ${icon} ${name}: ${p ?? 'not generated'}`);
    }
    console.log('');
    if (state.changedFiles.length > 0) {
      console.log('  Changed files:');
      state.changedFiles.forEach((f) => console.log(`    - ${f}`));
      console.log('');
    }
  });

// ── mcp ─────────────────────────────────────────────────────────────────────
const mcpCmd = program.command('mcp').description('MCP server commands');

mcpCmd
  .command('jira')
  .description('Start the Jira MCP server (JSON-RPC on stdin/stdout)')
  .action(async () => { await startMcpServer(); });

// ── start / plan (convenience wrappers) ─────────────────────────────────────
program
  .command('start <ticketKey>')
  .description('Fetch ticket and generate full analysis + plan artifacts')
  .option('--mode <mode>', 'Workflow mode: plan|autopilot|ralph|eco', 'plan')
  .action(async (ticketKey: string, opts: { mode: string }) => {
    const mode = (opts.mode as 'plan' | 'autopilot' | 'ralph' | 'eco') ?? 'plan';
    await runStart(ticketKey, mode);
  });

program
  .command('plan <ticketKey>')
  .description('Fetch ticket and generate plan artifacts only')
  .action(async (ticketKey: string) => { await runPlan(ticketKey); });

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(pc.red(`\nError: ${msg}\n`));
  process.exit(1);
});
