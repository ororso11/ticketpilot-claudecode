import type { JiraIssue, JiraComment } from './jira-client.js';
export interface TicketContext {
    ticketKey: string;
    summary: string;
    description: string;
    status: string;
    issueType: string;
    priority: string;
    assignee: string;
    reporter: string;
    labels: string[];
    components: string[];
    comments: CommentContext[];
    createdAt: string;
    updatedAt: string;
}
export interface CommentContext {
    author: string;
    body: string;
    createdAt: string;
}
export declare function buildTicketContext(issue: JiraIssue, comments: JiraComment[]): TicketContext;
export declare function formatContextAsMarkdown(ctx: TicketContext): string;
//# sourceMappingURL=context-builder.d.ts.map