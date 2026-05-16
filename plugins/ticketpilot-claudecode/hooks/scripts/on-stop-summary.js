#!/usr/bin/env node
// TicketPilot — on-stop-summary hook
// Logs a session summary to audit.log when Claude Code stops.

import fs from 'fs';
import path from 'path';

function appendTrace(event, message, ticketKey, phase) {
  try {
    const logsDir = path.join(process.cwd(), '.ticketpilot', 'logs');
    const traceFile = path.join(logsDir, 'trace.jsonl');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      ...(ticketKey && { ticketKey }),
      ...(phase && { phase }),
      message,
    });
    fs.appendFileSync(traceFile, entry + '\n', 'utf-8');
  } catch { /* never crash */ }
}

function appendAudit(message) {
  try {
    const logsDir = path.join(process.cwd(), '.ticketpilot', 'logs');
    const auditFile = path.join(logsDir, 'audit.log');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    fs.appendFileSync(auditFile, `[${new Date().toISOString()}] ${message}\n`, 'utf-8');
  } catch { /* never crash */ }
}

try {
  if (process.env.TP_DISABLE === '1') process.exit(0);

  const skip = (process.env.TP_SKIP_HOOKS ?? '').split(',');
  if (skip.includes('Stop')) process.exit(0);

  const cwd = process.cwd();
  const stateFile = path.join(cwd, '.ticketpilot', 'state', 'current-ticket.json');

  if (!fs.existsSync(stateFile)) {
    appendTrace('session_stopped', 'Claude Code session ended — no active workflow');
    appendAudit('Session ended — no active workflow');
    process.exit(0);
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  } catch {
    appendAudit('Session ended — state file corrupted');
    process.exit(0);
  }

  const summary = [
    `Session ended`,
    `ticket: ${state.ticketKey}`,
    `phase: ${state.phase}`,
    `risk: ${state.riskLevel}`,
    `mode: ${state.mode ?? 'plan'}`,
    `changedFiles: ${state.changedFiles?.length ?? 0}`,
    `artifacts: ${Object.values(state.artifacts ?? {}).filter(Boolean).length}`,
  ].join(' | ');

  appendAudit(summary);
  appendTrace('session_stopped', summary, state.ticketKey, state.phase);

  process.exit(0);

} catch (err) {
  console.error('[TicketPilot] on-stop-summary hook error (non-fatal):', err?.message ?? err);
  process.exit(0);
}
