#!/usr/bin/env node
// TicketPilot — pre-tool-guard hook
// Warns when high-risk paths or destructive commands are detected.
// In v0.1: warning-only (does not block). Structure supports blocking in v0.2.

import fs from 'fs';
import path from 'path';

const HIGH_RISK_PATHS = [
  /\.env$/,
  /\.pem$/,
  /\.key$/,
  /application-prod\.(yml|yaml|properties)$/,
  /\/(security|auth|payment|privacy)\//,
  /\/(db\/migration|migrations)\//,
];

const HIGH_RISK_KEYWORDS = [
  'password', 'secret', 'apiKey', 'privateKey', 'payment',
  'auth', 'permission', 'personalInfo', 'privacy', 'prod',
];

const DESTRUCTIVE_COMMANDS = [
  /git\s+reset\s+--hard/,
  /git\s+push\s+--force/,
  /rm\s+-rf/,
  /DROP\s+TABLE/i,
  /DELETE\s+FROM.*WHERE.*1\s*=\s*1/i,
  /TRUNCATE\s+TABLE/i,
];

function isHighRiskPath(filePath) {
  return HIGH_RISK_PATHS.some((p) => p.test(filePath.replace(/\\/g, '/')));
}

function containsHighRiskKeyword(text) {
  const lower = text.toLowerCase();
  return HIGH_RISK_KEYWORDS.filter((kw) => lower.includes(kw));
}

function isDestructiveCommand(cmd) {
  return DESTRUCTIVE_COMMANDS.some((p) => p.test(cmd));
}

function appendTrace(event, message, ticketKey) {
  try {
    const logsDir = path.join(process.cwd(), '.ticketpilot', 'logs');
    const traceFile = path.join(logsDir, 'trace.jsonl');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...(ticketKey && { ticketKey }),
      message,
    });
    fs.appendFileSync(traceFile, entry + '\n', 'utf-8');
  } catch { /* never crash */ }
}

try {
  if (process.env.TP_DISABLE === '1') process.exit(0);

  const skip = (process.env.TP_SKIP_HOOKS ?? '').split(',');
  if (skip.includes('PreToolUse')) process.exit(0);

  // Read tool call info from stdin
  let inputData = '';
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    inputData = Buffer.concat(chunks).toString('utf-8').trim();
  }

  if (!inputData) process.exit(0);

  let toolCall = {};
  try { toolCall = JSON.parse(inputData); } catch { process.exit(0); }

  const toolName = toolCall.tool ?? toolCall.name ?? '';
  const toolInput = JSON.stringify(toolCall.input ?? toolCall.params ?? {});

  // Get active ticket for context
  let activeTicket = null;
  try {
    const stateFile = path.join(process.cwd(), '.ticketpilot', 'state', 'current-ticket.json');
    if (fs.existsSync(stateFile)) {
      const s = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      activeTicket = s.ticketKey;
    }
  } catch { /* ignore */ }

  // Check for destructive commands in Bash/shell tool calls
  if (['Bash', 'bash', 'shell', 'run_command'].includes(toolName)) {
    const cmd = toolCall.input?.command ?? toolCall.params?.command ?? toolInput;
    if (isDestructiveCommand(cmd)) {
      appendTrace('tool_guard_triggered', `Destructive command detected: ${toolName}`, activeTicket);
      console.error(`[TicketPilot] ⚠ SAFETY GUARD: Destructive command detected.`);
      console.error(`[TicketPilot] Command: ${cmd.slice(0, 100)}`);
      console.error(`[TicketPilot] This command may cause irreversible changes. Proceed with caution.`);
      // In v0.1: warn only. To block, exit with non-zero in v0.2.
      process.exit(0);
    }
  }

  // Check for high-risk file paths in write tool calls
  if (['Write', 'Edit', 'write_file', 'edit_file', 'str_replace_editor'].includes(toolName)) {
    const filePath = toolCall.input?.file_path ?? toolCall.input?.path ?? toolCall.params?.path ?? '';
    if (filePath && isHighRiskPath(filePath)) {
      appendTrace('tool_guard_triggered', `High-risk path detected: ${filePath}`, activeTicket);
      console.error(`[TicketPilot] ⚠ HIGH-RISK PATH: ${filePath}`);
      console.error(`[TicketPilot] This file is classified as high-risk. Ensure user approval before proceeding.`);
    }
    // Check content keywords
    const content = toolCall.input?.content ?? toolCall.input?.new_string ?? '';
    const matched = containsHighRiskKeyword(content);
    if (matched.length > 0) {
      console.error(`[TicketPilot] ⚠ HIGH-RISK KEYWORDS in content: ${matched.join(', ')}`);
    }
  }

  process.exit(0);

} catch (err) {
  // Hook errors must never crash the Claude Code session
  console.error('[TicketPilot] pre-tool-guard hook error (non-fatal):', err?.message ?? err);
  process.exit(0);
}
