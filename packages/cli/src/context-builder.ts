import type { JiraIssue, JiraComment } from './jira-client.js';
import { formatDescription } from './jira-client.js';

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

function extractCommentBody(body: unknown): string {
  if (!body) return '';
  if (typeof body === 'string') return body;
  if (typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (Array.isArray(b['content'])) {
      return (b['content'] as unknown[])
        .map((node) => extractNodeText(node))
        .join('\n')
        .trim();
    }
  }
  return String(body);
}

function extractNodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (n['type'] === 'text' && typeof n['text'] === 'string') return n['text'];
  if (Array.isArray(n['content'])) {
    return (n['content'] as unknown[]).map(extractNodeText).join(' ');
  }
  return '';
}

export function buildTicketContext(issue: JiraIssue, comments: JiraComment[]): TicketContext {
  const f = issue.fields;
  return {
    ticketKey: issue.key,
    summary: f.summary,
    description: formatDescription(f.description),
    status: f.status.name,
    issueType: f.issuetype.name,
    priority: f.priority?.name ?? 'None',
    assignee: f.assignee?.displayName ?? 'Unassigned',
    reporter: f.reporter?.displayName ?? 'Unknown',
    labels: f.labels ?? [],
    components: (f.components ?? []).map((c) => c.name),
    comments: comments.map((c) => ({
      author: c.author.displayName,
      body: extractCommentBody(c.body),
      createdAt: c.created,
    })),
    createdAt: f.created,
    updatedAt: f.updated,
  };
}

export function formatContextAsMarkdown(ctx: TicketContext): string {
  const lines: string[] = [
    `# Ticket: ${ctx.ticketKey}`,
    '',
    `**Summary:** ${ctx.summary}`,
    `**Type:** ${ctx.issueType} | **Status:** ${ctx.status} | **Priority:** ${ctx.priority}`,
    `**Assignee:** ${ctx.assignee} | **Reporter:** ${ctx.reporter}`,
  ];

  if (ctx.labels.length > 0) lines.push(`**Labels:** ${ctx.labels.join(', ')}`);
  if (ctx.components.length > 0) lines.push(`**Components:** ${ctx.components.join(', ')}`);

  lines.push('', '## Description', '', ctx.description);

  if (ctx.comments.length > 0) {
    lines.push('', '## Comments', '');
    for (const c of ctx.comments) {
      lines.push(`### ${c.author} (${new Date(c.createdAt).toLocaleDateString()})`, '', c.body, '');
    }
  }

  return lines.join('\n');
}
