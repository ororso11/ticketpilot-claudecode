import { formatDescription } from './jira-client.js';
function extractCommentBody(body) {
    if (!body)
        return '';
    if (typeof body === 'string')
        return body;
    if (typeof body === 'object') {
        const b = body;
        if (Array.isArray(b['content'])) {
            return b['content']
                .map((node) => extractNodeText(node))
                .join('\n')
                .trim();
        }
    }
    return String(body);
}
function extractNodeText(node) {
    if (!node || typeof node !== 'object')
        return '';
    const n = node;
    if (n['type'] === 'text' && typeof n['text'] === 'string')
        return n['text'];
    if (Array.isArray(n['content'])) {
        return n['content'].map(extractNodeText).join(' ');
    }
    return '';
}
export function buildTicketContext(issue, comments) {
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
export function formatContextAsMarkdown(ctx) {
    const lines = [
        `# Ticket: ${ctx.ticketKey}`,
        '',
        `**Summary:** ${ctx.summary}`,
        `**Type:** ${ctx.issueType} | **Status:** ${ctx.status} | **Priority:** ${ctx.priority}`,
        `**Assignee:** ${ctx.assignee} | **Reporter:** ${ctx.reporter}`,
    ];
    if (ctx.labels.length > 0)
        lines.push(`**Labels:** ${ctx.labels.join(', ')}`);
    if (ctx.components.length > 0)
        lines.push(`**Components:** ${ctx.components.join(', ')}`);
    lines.push('', '## Description', '', ctx.description);
    if (ctx.comments.length > 0) {
        lines.push('', '## Comments', '');
        for (const c of ctx.comments) {
            lines.push(`### ${c.author} (${new Date(c.createdAt).toLocaleDateString()})`, '', c.body, '');
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=context-builder.js.map