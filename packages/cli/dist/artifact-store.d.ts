export type ArtifactName = 'ticket-analysis' | 'implementation-plan' | 'impact-analysis' | 'test-report' | 'review-report' | 'jira-comment' | 'pr-description';
export declare function getArtifactPath(ticketKey: string, name: ArtifactName): string;
export declare function saveArtifact(ticketKey: string, name: ArtifactName, content: string): Promise<string>;
export declare function readArtifact(ticketKey: string, name: ArtifactName): Promise<string | null>;
export declare function listArtifacts(ticketKey: string): Promise<string[]>;
export declare function ensureArtifactDir(ticketKey: string): Promise<string>;
//# sourceMappingURL=artifact-store.d.ts.map