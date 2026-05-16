import { z } from 'zod';
declare const JiraIssueSchema: z.ZodObject<{
    key: z.ZodString;
    fields: z.ZodObject<{
        summary: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
        status: z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>>>;
        assignee: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            displayName: z.ZodString;
            emailAddress: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            displayName: string;
            emailAddress?: string | undefined;
        }, {
            displayName: string;
            emailAddress?: string | undefined;
        }>>>;
        reporter: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            displayName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            displayName: string;
        }, {
            displayName: string;
        }>>>;
        labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>, "many">>;
        issuetype: z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>;
        created: z.ZodString;
        updated: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: {
            name: string;
        };
        summary: string;
        issuetype: {
            name: string;
        };
        created: string;
        updated: string;
        description?: unknown;
        priority?: {
            name: string;
        } | null | undefined;
        assignee?: {
            displayName: string;
            emailAddress?: string | undefined;
        } | null | undefined;
        reporter?: {
            displayName: string;
        } | null | undefined;
        labels?: string[] | undefined;
        components?: {
            name: string;
        }[] | undefined;
    }, {
        status: {
            name: string;
        };
        summary: string;
        issuetype: {
            name: string;
        };
        created: string;
        updated: string;
        description?: unknown;
        priority?: {
            name: string;
        } | null | undefined;
        assignee?: {
            displayName: string;
            emailAddress?: string | undefined;
        } | null | undefined;
        reporter?: {
            displayName: string;
        } | null | undefined;
        labels?: string[] | undefined;
        components?: {
            name: string;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    key: string;
    fields: {
        status: {
            name: string;
        };
        summary: string;
        issuetype: {
            name: string;
        };
        created: string;
        updated: string;
        description?: unknown;
        priority?: {
            name: string;
        } | null | undefined;
        assignee?: {
            displayName: string;
            emailAddress?: string | undefined;
        } | null | undefined;
        reporter?: {
            displayName: string;
        } | null | undefined;
        labels?: string[] | undefined;
        components?: {
            name: string;
        }[] | undefined;
    };
}, {
    key: string;
    fields: {
        status: {
            name: string;
        };
        summary: string;
        issuetype: {
            name: string;
        };
        created: string;
        updated: string;
        description?: unknown;
        priority?: {
            name: string;
        } | null | undefined;
        assignee?: {
            displayName: string;
            emailAddress?: string | undefined;
        } | null | undefined;
        reporter?: {
            displayName: string;
        } | null | undefined;
        labels?: string[] | undefined;
        components?: {
            name: string;
        }[] | undefined;
    };
}>;
declare const JiraCommentSchema: z.ZodObject<{
    id: z.ZodString;
    author: z.ZodObject<{
        displayName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        displayName: string;
    }, {
        displayName: string;
    }>;
    body: z.ZodUnknown;
    created: z.ZodString;
    updated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    created: string;
    updated: string;
    id: string;
    author: {
        displayName: string;
    };
    body?: unknown;
}, {
    created: string;
    updated: string;
    id: string;
    author: {
        displayName: string;
    };
    body?: unknown;
}>;
export type JiraIssue = z.infer<typeof JiraIssueSchema>;
export type JiraComment = z.infer<typeof JiraCommentSchema>;
export declare function formatDescription(description: unknown): string;
export declare class JiraClient {
    private baseUrl;
    private authHeader;
    constructor(baseUrl: string, email: string, token: string);
    private request;
    getIssue(issueKey: string): Promise<JiraIssue>;
    getComments(issueKey: string): Promise<JiraComment[]>;
    testConnection(): Promise<{
        ok: boolean;
        displayName?: string;
        error?: string;
    }>;
}
export declare function createJiraClientFromEnv(): JiraClient | null;
export {};
//# sourceMappingURL=jira-client.d.ts.map