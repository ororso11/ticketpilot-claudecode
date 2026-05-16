export type Phase = 'initialized' | 'analyzed' | 'planned' | 'approved' | 'implementing' | 'testing' | 'reviewing' | 'done' | 'cancelled';
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
export declare function createInitialState(ticketKey: string, mode?: WorkflowMode): WorkflowState;
export declare function readState(): Promise<WorkflowState | null>;
export declare function writeState(state: WorkflowState): Promise<void>;
export declare function updateState(patch: Partial<WorkflowState>): Promise<WorkflowState | null>;
export declare function clearState(): Promise<void>;
//# sourceMappingURL=state-store.d.ts.map