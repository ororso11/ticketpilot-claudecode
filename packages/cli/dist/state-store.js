import fse from 'fs-extra';
import path from 'path';
const STATE_DIR = path.join(process.cwd(), '.ticketpilot', 'state');
const STATE_FILE = path.join(STATE_DIR, 'current-ticket.json');
export function createInitialState(ticketKey, mode = 'plan') {
    const now = new Date().toISOString();
    return {
        ticketKey,
        phase: 'initialized',
        riskLevel: 'medium',
        mode,
        modeStrength: 'low',
        maxIterations: 0,
        currentIteration: 0,
        branch: null,
        approval: {
            planApproved: false,
            editApproved: false,
            jiraCommentApproved: false,
            prApproved: false,
        },
        artifacts: {
            ticketAnalysis: null,
            implementationPlan: null,
            impactAnalysis: null,
            ticketPrd: null,
            testReport: null,
            reviewReport: null,
            jiraComment: null,
            prDescription: null,
        },
        changedFiles: [],
        testResults: {
            command: null,
            status: 'skipped',
            attempts: 0,
        },
        createdAt: now,
        updatedAt: now,
    };
}
export async function readState() {
    try {
        if (!(await fse.pathExists(STATE_FILE)))
            return null;
        const raw = await fse.readFile(STATE_FILE, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        console.error('[ticketpilot] State file is corrupted. Run `ticketpilot setup` to reset.');
        return null;
    }
}
export async function writeState(state) {
    await fse.ensureDir(STATE_DIR);
    state.updatedAt = new Date().toISOString();
    await fse.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}
export async function updateState(patch) {
    const current = await readState();
    if (!current)
        return null;
    const updated = { ...current, ...patch };
    await writeState(updated);
    return updated;
}
export async function clearState() {
    if (await fse.pathExists(STATE_FILE)) {
        await fse.remove(STATE_FILE);
    }
}
//# sourceMappingURL=state-store.js.map