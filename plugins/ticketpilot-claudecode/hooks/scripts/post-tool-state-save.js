#!/usr/bin/env node
// TicketPilot — post-tool-state-save hook
// Records tool use events and tracks changed files when a workflow is active.

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

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8').trim();
}

(async () => {
  try {
    if (process.env.TP_DISABLE === '1') process.exit(0);
    const skip = (process.env.TP_SKIP_HOOKS ?? '').split(',');
    if (skip.includes('PostToolUse')) process.exit(0);

    const stateFile = path.join(process.cwd(), '.ticketpilot', 'state', 'current-ticket.json');
    if (!fs.existsSync(stateFile)) process.exit(0);

    let state;
    try {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    } catch {
      process.exit(0);
    }

    const inputData = await readStdin();
    let toolResult = {};
    try { toolResult = JSON.parse(inputData); } catch { /* ignore */ }

    const toolName = toolResult.tool ?? toolResult.name ?? 'unknown';

    if (['Write', 'Edit', 'write_file', 'edit_file'].includes(toolName)) {
      const filePath = toolResult.input?.file_path ?? toolResult.input?.path ?? '';
      if (filePath && state.changedFiles) {
        if (!state.changedFiles.includes(filePath)) {
          state.changedFiles.push(filePath);
          state.updatedAt = new Date().toISOString();
          try {
            fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf-8');
          } catch { /* ignore */ }
          appendTrace('state_auto_saved', `변경 파일 추가: +${filePath}`, state.ticketKey, state.phase);
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('[TicketPilot] post-tool-state-save 오류 (non-fatal):', err?.message ?? err);
    process.exit(0);
  }
})();
