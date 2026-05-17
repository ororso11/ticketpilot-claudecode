#!/usr/bin/env node
// TicketPilot — on-user-prompt hook
// 사용자 입력에서 Jira 티켓 키를 감지하고 /tp:start 를 제안합니다.

import fs from 'fs';
import path from 'path';

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
    if (skip.includes('UserPromptSubmit')) process.exit(0);

    const inputData = await readStdin();
    if (!inputData) process.exit(0);

    let prompt = '';
    try {
      const parsed = JSON.parse(inputData);
      prompt = parsed.prompt ?? parsed.message ?? parsed.content ?? inputData;
    } catch {
      prompt = inputData;
    }

    const TICKET_PATTERN = /\b([A-Z][A-Z0-9]+-\d+)\b/g;
    const matches = [...prompt.matchAll(TICKET_PATTERN)].map((m) => m[1]);
    if (matches.length === 0) process.exit(0);

    const cwd = process.cwd();
    const stateFile = path.join(cwd, '.ticketpilot', 'state', 'current-ticket.json');

    let activeTicket = null;
    try {
      if (fs.existsSync(stateFile)) {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
        activeTicket = state.ticketKey;
      }
    } catch { /* ignore */ }

    const autoStart = (() => {
      try {
        const cfg = JSON.parse(fs.readFileSync(path.join(cwd, '.ticketpilot', 'config.json'), 'utf-8'));
        return cfg?.workflow?.autoStartOnTicketKey === true;
      } catch { return false; }
    })();

    const uniqueTickets = [...new Set(matches)];

    for (const ticketKey of uniqueTickets) {
      if (activeTicket === ticketKey) continue;
      if (autoStart) {
        console.error(`[TicketPilot] Jira 티켓 감지: ${ticketKey}. /tp:start ${ticketKey} 로 시작하세요.`);
      } else {
        console.error(`[TicketPilot] Jira 티켓 감지: ${ticketKey}. /tp:start ${ticketKey} 로 TicketPilot 워크플로우를 시작할 수 있습니다.`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('[TicketPilot] on-user-prompt 오류 (non-fatal):', err?.message ?? err);
    process.exit(0);
  }
})();
