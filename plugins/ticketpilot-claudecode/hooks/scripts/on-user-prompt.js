#!/usr/bin/env node
// TicketPilot — on-user-prompt hook
// Detects Jira ticket key patterns in user input and suggests /tp:start.

import fs from 'fs';
import path from 'path';

try {
  if (process.env.TP_DISABLE === '1') process.exit(0);

  const skip = (process.env.TP_SKIP_HOOKS ?? '').split(',');
  if (skip.includes('UserPrompt')) process.exit(0);

  // Read prompt from stdin (Claude Code passes it as JSON on stdin)
  let inputData = '';
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    inputData = Buffer.concat(chunks).toString('utf-8').trim();
  }

  if (!inputData) process.exit(0);

  let prompt = '';
  try {
    const parsed = JSON.parse(inputData);
    prompt = parsed.prompt ?? parsed.message ?? parsed.content ?? inputData;
  } catch {
    prompt = inputData;
  }

  // Detect Jira ticket key pattern: [A-Z][A-Z0-9]+-[0-9]+
  const TICKET_PATTERN = /\b([A-Z][A-Z0-9]+-\d+)\b/g;
  const matches = [...prompt.matchAll(TICKET_PATTERN)].map((m) => m[1]);

  if (matches.length === 0) process.exit(0);

  // Check if there's already an active workflow for this ticket
  const cwd = process.cwd();
  const stateFile = path.join(cwd, '.ticketpilot', 'state', 'current-ticket.json');

  let activeTicket = null;
  try {
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      activeTicket = state.ticketKey;
    }
  } catch {
    // ignore
  }

  const autoStart = (() => {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(cwd, '.ticketpilot', 'config.json'), 'utf-8'));
      return cfg?.workflow?.autoStartOnTicketKey === true;
    } catch { return false; }
  })();

  const uniqueTickets = [...new Set(matches)];

  for (const ticketKey of uniqueTickets) {
    if (activeTicket === ticketKey) {
      // Already active — silent
      continue;
    }
    if (autoStart) {
      // autoStartOnTicketKey is opt-in and disabled by default
      console.error(`[TicketPilot] Jira ticket detected: ${ticketKey}. Auto-start is enabled — run /tp:start ${ticketKey} to confirm.`);
    } else {
      console.error(`[TicketPilot] Jira ticket detected: ${ticketKey}. Run /tp:start ${ticketKey} to start TicketPilot workflow.`);
    }
  }

} catch (err) {
  // Hook errors must never crash the Claude Code session
  console.error('[TicketPilot] on-user-prompt hook error (non-fatal):', err?.message ?? err);
  process.exit(0);
}
