#!/usr/bin/env node
// TicketPilot — on-session-start hook
// Checks .ticketpilot state and emits a reminder if a workflow is active.

import fs from 'fs';
import path from 'path';

try {
  if (process.env.TP_DISABLE === '1') process.exit(0);

  const skip = (process.env.TP_SKIP_HOOKS ?? '').split(',');
  if (skip.includes('SessionStart')) process.exit(0);

  const cwd = process.cwd();
  const stateFile = path.join(cwd, '.ticketpilot', 'state', 'current-ticket.json');
  const traceFile = path.join(cwd, '.ticketpilot', 'logs', 'trace.jsonl');
  const logsDir = path.join(cwd, '.ticketpilot', 'logs');

  // Append trace event
  function appendTrace(event, message, ticketKey, phase) {
    try {
      if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
      const entry = JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...(ticketKey && { ticketKey }),
        ...(phase && { phase }),
        message,
      });
      fs.appendFileSync(traceFile, entry + '\n', 'utf-8');
    } catch {
      // Logging must never crash the session
    }
  }

  if (!fs.existsSync(stateFile)) {
    // No active workflow — silent start
    appendTrace('session_started', 'Claude Code session started — no active TicketPilot workflow');
    process.exit(0);
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
  } catch {
    console.error('[TicketPilot] Warning: current-ticket.json is corrupted. Run /tp:cancel --force to reset.');
    process.exit(0);
  }

  appendTrace('session_started', `Session resumed with active workflow: ${state.ticketKey}`, state.ticketKey, state.phase);

  // Emit context reminder to stderr (visible in Claude Code output)
  const risk = state.riskLevel === 'high' ? '🔴 HIGH' : state.riskLevel === 'medium' ? '🟡 MEDIUM' : '🟢 LOW';
  console.error(`[TicketPilot] Active workflow: ${state.ticketKey} | phase: ${state.phase} | risk: ${risk} | mode: ${state.mode ?? 'plan'}`);
  console.error(`[TicketPilot] Run /tp:resume to restore full context, or /tp:status for details.`);

} catch (err) {
  // Hook errors must never crash the Claude Code session
  console.error('[TicketPilot] on-session-start hook error (non-fatal):', err?.message ?? err);
  process.exit(0);
}
