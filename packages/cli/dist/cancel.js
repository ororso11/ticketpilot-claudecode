import pc from 'picocolors';
import fse from 'fs-extra';
import path from 'path';
import { readState, writeState } from './state-store.js';
import { appendTrace, appendAudit } from './logger.js';
const STATE_FILE = path.join(process.cwd(), '.ticketpilot', 'state', 'current-ticket.json');
const STATE_BACKUP = path.join(process.cwd(), '.ticketpilot', 'state', 'current-ticket.backup.json');
export async function runCancel(force = false) {
    const state = await readState();
    if (!state) {
        console.log(pc.yellow('\nNo active TicketPilot workflow to cancel.\n'));
        return;
    }
    const { ticketKey, phase } = state;
    if (force) {
        console.log(pc.bold(`\nForce-cancelling TicketPilot workflow: ${ticketKey}\n`));
        // Backup current state before removing
        if (await fse.pathExists(STATE_FILE)) {
            await fse.copy(STATE_FILE, STATE_BACKUP);
            console.log(`  ${pc.dim('Backup saved:')} .ticketpilot/state/current-ticket.backup.json`);
        }
        // Reset state to a clean slate (keep artifacts)
        await fse.remove(STATE_FILE);
        console.log(`  ${pc.green('✓')} State cleared`);
        await appendTrace('force_cancelled', {
            ticketKey,
            phase: 'force_cancelled',
            message: `Workflow for ${ticketKey} was force-cancelled from phase: ${phase}`,
        });
        await appendAudit(`Force-cancelled workflow for ${ticketKey} (was in phase: ${phase})`);
        console.log(pc.yellow('\nWorkflow force-cancelled.'));
        console.log('  Artifacts are preserved in .ticketpilot/artifacts/');
        console.log('  Notepad is preserved at .ticketpilot/notepad.md');
        console.log(pc.dim('  Note: Code changes (if any) were NOT reverted. Check git status manually.'));
    }
    else {
        console.log(pc.bold(`\nCancelling TicketPilot workflow: ${ticketKey}\n`));
        // Mark as cancelled rather than deleting
        state.phase = 'cancelled';
        state.updatedAt = new Date().toISOString();
        await writeState(state);
        await appendTrace('cancelled', {
            ticketKey,
            phase: 'cancelled',
            message: `Workflow for ${ticketKey} cancelled from phase: ${phase}`,
        });
        await appendAudit(`Cancelled workflow for ${ticketKey} (was in phase: ${phase})`);
        console.log(`  ${pc.green('✓')} Phase set to "cancelled"`);
        console.log('  Artifacts preserved in .ticketpilot/artifacts/');
        console.log('');
        console.log('To fully reset the workflow state:');
        console.log('  ticketpilot cancel --force');
        console.log('');
        console.log('To start a new ticket:');
        console.log('  /tp:start PROJ-456  (in Claude Code)');
    }
    if (state.changedFiles && state.changedFiles.length > 0) {
        console.log(pc.yellow(`\nNote: ${state.changedFiles.length} file(s) were tracked as changed.`));
        console.log('  Review git status to ensure your working tree is as expected:');
        console.log('  git status');
        console.log('  git diff');
    }
    console.log('');
}
//# sourceMappingURL=cancel.js.map