import { readState } from './state-store.js';
export async function runHud() {
    const state = await readState();
    if (!state) {
        process.stdout.write('TicketPilot | idle | run /tp:start PROJ-123\n');
        return;
    }
    const { ticketKey, phase, riskLevel } = state;
    const mode = state.mode ?? 'plan';
    let nextAction = 'check /tp:status';
    switch (phase) {
        case 'initialized':
            nextAction = 'run /tp:start';
            break;
        case 'analyzed':
        case 'planned':
            nextAction = 'approve plan';
            break;
        case 'approved':
            nextAction = 'implement (v0.2+)';
            break;
        case 'done':
            nextAction = 'done';
            break;
        case 'cancelled':
            nextAction = 'cancelled | start new';
            break;
    }
    process.stdout.write(`TicketPilot [${ticketKey}] | phase: ${phase} | risk: ${riskLevel} | mode: ${mode} | next: ${nextAction}\n`);
}
//# sourceMappingURL=hud.js.map