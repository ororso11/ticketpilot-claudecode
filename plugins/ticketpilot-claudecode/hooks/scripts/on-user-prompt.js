#!/usr/bin/env node
// TicketPilot — on-user-prompt hook
// Detects Jira ticket keys and warns about credential patterns in user input.

import fs from 'fs';
import path from 'path';

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8').trim();
}

// Patterns that look like real credentials pasted into chat
const CREDENTIAL_PATTERNS = [
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
  { pattern: /sk-[A-Za-z0-9]{20,}/, name: 'API Secret Key' },
  { pattern: /ghp_[A-Za-z0-9]{36}/, name: 'GitHub Personal Access Token' },
  { pattern: /xoxb-[0-9]+-[A-Za-z0-9-]+/, name: 'Slack Bot Token' },
  { pattern: /ya29\.[A-Za-z0-9_-]{20,}/, name: 'Google OAuth Token' },
  { pattern: /eyJ[A-Za-z0-9+/]{30,}\.eyJ[A-Za-z0-9+/]{10,}/, name: 'JWT Token' },
  { pattern: /Basic\s+[A-Za-z0-9+/]{40,}={0,2}/, name: 'Basic Auth 토큰' },
  { pattern: /Bearer\s+[A-Za-z0-9+/._-]{30,}/, name: 'Bearer Token' },
  { pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/, name: 'Private Key (PEM)' },
];

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

    // ── 1. Credential paste detection ────────────────────────────────────────
    for (const { pattern, name } of CREDENTIAL_PATTERNS) {
      if (pattern.test(prompt)) {
        appendTrace('credential_in_prompt', `인증정보 패턴 감지 (채팅): ${name}`);
        console.error(`[TicketPilot] ⛔ SECURITY: 채팅에 실제 인증정보처럼 보이는 값이 포함되어 있습니다.`);
        console.error(`[TicketPilot] 감지 유형: ${name}`);
        console.error(`[TicketPilot] 인증정보는 환경변수로 설정하세요. 채팅에 직접 붙여넣지 마세요.`);
        console.error(`[TicketPilot] 채팅 기록에 노출된 인증정보는 즉시 교체하세요.`);
        process.exit(0);
      }
    }

    // ── 2. Jira ticket key detection ─────────────────────────────────────────
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
