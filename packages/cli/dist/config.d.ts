export interface JiraConfig {
    baseUrlEnv: string;
    emailEnv: string;
    tokenEnv: string;
    defaultProject: string;
}
export interface GitConfig {
    branchPrefix: string;
    autoCreateBranch: boolean;
    allowPush: boolean;
}
export interface WorkflowConfig {
    requireApprovalBeforeEdit: boolean;
    requireApprovalBeforeJiraComment: boolean;
    requireApprovalBeforePr: boolean;
    maxTestFixAttempts: number;
    autoRunTests: boolean;
}
export interface RiskConfig {
    highRiskPaths: string[];
    highRiskKeywords: string[];
}
export interface TicketPilotConfig {
    jira: JiraConfig;
    git: GitConfig;
    workflow: WorkflowConfig;
    risk: RiskConfig;
}
export declare function getDefaultConfig(): TicketPilotConfig;
export declare function loadConfig(): Promise<TicketPilotConfig>;
export declare function saveConfig(config: TicketPilotConfig): Promise<void>;
export declare function saveConfigExample(): Promise<void>;
export declare function getJiraEnv(): {
    baseUrl: string;
    email: string;
    token: string;
} | null;
//# sourceMappingURL=config.d.ts.map