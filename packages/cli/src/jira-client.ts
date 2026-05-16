import { z } from 'zod';

const JiraIssueSchema = z.object({
  key: z.string(),
  fields: z.object({
    summary: z.string(),
    description: z.unknown().nullable().optional(),
    status: z.object({
      name: z.string(),
    }),
    priority: z
      .object({
        name: z.string(),
      })
      .nullable()
      .optional(),
    assignee: z
      .object({
        displayName: z.string(),
        emailAddress: z.string().optional(),
      })
      .nullable()
      .optional(),
    reporter: z
      .object({
        displayName: z.string(),
      })
      .nullable()
      .optional(),
    labels: z.array(z.string()).optional(),
    components: z
      .array(
        z.object({
          name: z.string(),
        }),
      )
      .optional(),
    issuetype: z.object({
      name: z.string(),
    }),
    created: z.string(),
    updated: z.string(),
  }),
});

const JiraCommentSchema = z.object({
  id: z.string(),
  author: z.object({
    displayName: z.string(),
  }),
  body: z.unknown(),
  created: z.string(),
  updated: z.string(),
});

const JiraCommentsResponseSchema = z.object({
  comments: z.array(JiraCommentSchema),
  total: z.number(),
});

export type JiraIssue = z.infer<typeof JiraIssueSchema>;
export type JiraComment = z.infer<typeof JiraCommentSchema>;

function extractTextFromAdf(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (n['type'] === 'text' && typeof n['text'] === 'string') return n['text'];
  if (Array.isArray(n['content'])) {
    return (n['content'] as unknown[]).map(extractTextFromAdf).join(' ');
  }
  return '';
}

export function formatDescription(description: unknown): string {
  if (!description) return '(no description)';
  if (typeof description === 'string') return description;
  if (typeof description === 'object') {
    const text = extractTextFromAdf(description).trim();
    return text || '(no description)';
  }
  return '(no description)';
}

export class JiraClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(baseUrl: string, email: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Network error connecting to Jira: ${msg}`);
    }

    if (!response.ok) {
      const status = response.status;
      if (status === 401) throw new Error('Jira authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN.');
      if (status === 403) throw new Error('Jira access denied. Your account may lack permission for this resource.');
      if (status === 404) throw new Error(`Jira resource not found at: ${path}`);
      if (status === 429) throw new Error('Jira rate limit exceeded. Please wait and try again.');
      throw new Error(`Jira API error ${status}: ${response.statusText}`);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new Error('Failed to parse Jira API response as JSON.');
    }
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    const raw = await this.request<unknown>(`/rest/api/3/issue/${issueKey}`);
    const result = JiraIssueSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(`Unexpected Jira issue format for ${issueKey}: ${result.error.message}`);
    }
    return result.data;
  }

  async getComments(issueKey: string): Promise<JiraComment[]> {
    const raw = await this.request<unknown>(`/rest/api/3/issue/${issueKey}/comment`);
    const result = JiraCommentsResponseSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(`Unexpected Jira comments format for ${issueKey}: ${result.error.message}`);
    }
    return result.data.comments;
  }

  async testConnection(): Promise<{ ok: boolean; displayName?: string; error?: string }> {
    try {
      const raw = await this.request<{ displayName?: string }>('/rest/api/3/myself');
      return { ok: true, displayName: raw.displayName };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

export function createJiraClientFromEnv(): JiraClient | null {
  const baseUrl = process.env['JIRA_BASE_URL'];
  const email = process.env['JIRA_EMAIL'];
  const token = process.env['JIRA_API_TOKEN'];
  if (!baseUrl || !email || !token) return null;
  return new JiraClient(baseUrl, email, token);
}
