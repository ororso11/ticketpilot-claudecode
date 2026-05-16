#!/usr/bin/env node
// TicketPilot — pre-compact-save hook
// Emits a reminder about important state files before Claude Code compacts the context.

import fs from 'fs';
import path from 'path';

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
  if (skip.includes('PreCompact')) process.exit(0);

  const cwd = process.cwd();
  const stateFile = path.join(cwd, '.ticketpilot', 'state', 'current-ticket.json');
  const notepadFile = path.join(cwd, '.ticketpilot', 'notepad.md');

  let ticketKey = null;
  let phase = null;

  if (fs.existsSync(stateFile)) {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      ticketKey = state.ticketKey;
      phase = state.phase;
    } catch { /* ignore */ }
  }

  appendTrace('pre_compact_saved', 'Pre-compact hook fired — state preserved', ticketKey);

  // Emit guidance to stderr so Claude Code sees it before compaction
  if (ticketKey) {
    console.error(`[TicketPilot] ⚡ Context compaction imminent.`);
    console.error(`[TicketPilot] Active workflow: ${ticketKey} (phase: ${phase})`);
    console.error(`[TicketPilot] Important files to preserve in summary:`);
    console.error(`  .ticketpilot/state/current-ticket.json`);
    console.error(`  .ticketpilot/notepad.md`);
    console.error(`  .ticketpilot/artifacts/${ticketKey}/ticket-analysis.md`);
    console.error(`  .ticketpilot/artifacts/${ticketKey}/implementation-plan.md`);
    console.error(`[TicketPilot] After compaction, run /tp:resume to restore context.`);
  } else if (fs.existsSync(notepadFile)) {
    console.error(`[TicketPilot] ⚡ Context compaction imminent. Notepad preserved at .ticketpilot/notepad.md`);
  }

  process.exit(0);

} catch (err) {
  console.error('[TicketPilot] pre-compact-save hook error (non-fatal):', err?.message ?? err);
  process.exit(0);
}
