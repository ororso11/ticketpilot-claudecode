import pc from 'picocolors';
import { createJiraClientFromEnv, formatDescription } from './jira-client.js';

export async function startMcpServer(): Promise<void> {
  console.log(pc.bold('\nTicketPilot MCP Jira Server\n'));

  const client = createJiraClientFromEnv();
  if (!client) {
    console.error(pc.red('Jira credentials not set. Run: ticketpilot config jira'));
    process.exit(1);
  }

  console.log(pc.yellow('MCP server mode: reading from stdin (JSON-RPC 2.0)'));
  console.log(pc.dim('This is a minimal MCP stub for v0.1. Full MCP integration coming in v0.2.\n'));

  const tools = [
    {
      name: 'jira_get_issue',
      description: 'Fetch a Jira issue by key',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: { type: 'string', description: 'Jira issue key (e.g. PROJ-123)' },
        },
        required: ['issueKey'],
      },
    },
    {
      name: 'jira_get_comments',
      description: 'Get comments for a Jira issue',
      inputSchema: {
        type: 'object',
        properties: {
          issueKey: { type: 'string', description: 'Jira issue key' },
        },
        required: ['issueKey'],
      },
    },
  ];

  process.stdin.setEncoding('utf-8');
  let buffer = '';

  process.stdin.on('data', async (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const request = JSON.parse(line) as {
          jsonrpc: string;
          id: number | string;
          method: string;
          params?: Record<string, unknown>;
        };

        let response: unknown;

        if (request.method === 'initialize') {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              serverInfo: { name: 'ticketpilot-jira', version: '0.1.0' },
              capabilities: { tools: {} },
            },
          };
        } else if (request.method === 'tools/list') {
          response = { jsonrpc: '2.0', id: request.id, result: { tools } };
        } else if (request.method === 'tools/call') {
          const toolName = (request.params?.['name'] as string) ?? '';
          const args = (request.params?.['arguments'] as Record<string, unknown>) ?? {};

          if (toolName === 'jira_get_issue') {
            const issueKey = args['issueKey'] as string;
            const issue = await client.getIssue(issueKey);
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        key: issue.key,
                        summary: issue.fields.summary,
                        description: formatDescription(issue.fields.description),
                        status: issue.fields.status.name,
                        type: issue.fields.issuetype.name,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              },
            };
          } else if (toolName === 'jira_get_comments') {
            const issueKey = args['issueKey'] as string;
            const comments = await client.getComments(issueKey);
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      comments.map((c) => ({
                        author: c.author.displayName,
                        created: c.created,
                      })),
                      null,
                      2,
                    ),
                  },
                ],
              },
            };
          } else {
            response = {
              jsonrpc: '2.0',
              id: request.id,
              error: { code: -32601, message: `Unknown tool: ${toolName}` },
            };
          }
        } else {
          response = {
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: `Method not found: ${request.method}` },
          };
        }

        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stdout.write(
          JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: msg } }) + '\n',
        );
      }
    }
  });

  process.stdin.on('end', () => process.exit(0));
}
