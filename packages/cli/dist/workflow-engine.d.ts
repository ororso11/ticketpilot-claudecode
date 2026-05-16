import { type WorkflowState, type WorkflowMode } from './state-store.js';
export interface WorkflowResult {
    ticketKey: string;
    state: WorkflowState;
    artifactPaths: {
        ticketAnalysis: string;
        implementationPlan: string;
        impactAnalysis: string;
        ticketPrd: string;
    };
}
export declare function runStart(ticketKey: string, mode?: WorkflowMode): Promise<WorkflowResult>;
export declare function runPlan(ticketKey: string): Promise<void>;
//# sourceMappingURL=workflow-engine.d.ts.map