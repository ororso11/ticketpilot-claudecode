import fse from 'fs-extra';
import path from 'path';

export type Phase =
  | 'initialized'
  | 'analyzed'
  | 'planned'
  | 'approved'
  | 'implementing'
  | 'testing'
  | 'reviewing'
  | 'done'
  | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high';
export type TestStatus = 'skipped' | 'pending' | 'running' | 'passed' | 'failed';
export type WorkflowMode = 'plan' | 'autopilot' | 'ralph' | 'eco';
export type ModeStrength = 'low' | 'medium' | 'high';

export interface ApprovalState {
  planApproved: boolean;
  editApproved: boolean;
  jiraCommentApproved: boolean;
  prApproved: boolean;
}

export interface ArtifactPaths {
  ticketAnalysis: string | null;
  implementationPlan: string | null;
  impactAnalysis: string | null;
  ticketPrd: string | null;
  testReport: string | null;
  reviewReport: string | null;
  jiraComment: string | null;
  prDescription: string | null;
}

export interface TestResults {
  command: string | null;
  status: TestStatus;
  attempts: number;
}

export interface WorkflowState {
  ticketKey: string;
  phase: Phase;
  riskLevel: RiskLevel;
  mode: WorkflowMode;
  modeStrength: ModeStrength;
  maxIterations: number;
  currentIteration: number;
  branch: string | null;
  approval: ApprovalState;
  artifacts: ArtifactPaths;
  changedFiles: string[];
  testResults: TestResults;
  createdAt: string;
  updatedAt: string;
}

const STATE_DIR = path.join(process.cwd(), '.ticketpilot', 'state');
const STATE_FILE = path.join(STATE_DIR, 'current-ticket.json');

export function createInitialState(ticketKey: string, mode: WorkflowMode = 'plan'): WorkflowState {
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

export async function readState(): Promise<WorkflowState | null> {
  try {
    if (!(await fse.pathExists(STATE_FILE))) return null;
    const raw = await fse.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(raw) as WorkflowState;
  } catch {
    console.error('[ticketpilot] State file is corrupted. Run `ticketpilot setup` to reset.');
    return null;
  }
}

export async function writeState(state: WorkflowState): Promise<void> {
  await fse.ensureDir(STATE_DIR);
  state.updatedAt = new Date().toISOString();
  await fse.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function updateState(patch: Partial<WorkflowState>): Promise<WorkflowState | null> {
  const current = await readState();
  if (!current) return null;
  const updated = { ...current, ...patch };
  await writeState(updated);
  return updated;
}

export async function clearState(): Promise<void> {
  if (await fse.pathExists(STATE_FILE)) {
    await fse.remove(STATE_FILE);
  }
}
