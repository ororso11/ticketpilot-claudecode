#!/usr/bin/env node
// TicketPilot — pre-tool-guard hook
// Warns when high-risk paths, destructive commands, or Bitbucket push are detected.

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

const BITBUCKET_RISK_COMMANDS = [
  { pattern: /git\s+push\s+.*\b(main|master|develop|release)\b/, level: 'CRITICAL', reason: '보호 브랜치 직접 푸시 — Bamboo CI 트리거됩니다' },
  { pattern: /git\s+push\b(?!\s+--dry-run)/, level: 'HIGH', reason: 'git push — Bamboo CI 빌드가 트리거될 수 있습니다' },
  { pattern: /\bbb\s+(pr|repo|pipeline)/, level: 'HIGH', reason: 'Bitbucket CLI 작업 감지됨' },
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
    if (skip.includes('PreToolUse')) process.exit(0);

    const inputData = await readStdin();
    if (!inputData) process.exit(0);

    let toolCall = {};
    try { toolCall = JSON.parse(inputData); } catch { process.exit(0); }

    const toolName = toolCall.tool ?? toolCall.name ?? '';
    const toolInput = JSON.stringify(toolCall.input ?? toolCall.params ?? {});

    let activeTicket = null;
    try {
      const stateFile = path.join(process.cwd(), '.ticketpilot', 'state', 'current-ticket.json');
      if (fs.existsSync(stateFile)) {
        const s = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
        activeTicket = s.ticketKey;
      }
    } catch { /* ignore */ }

    if (['Bash', 'bash', 'shell', 'run_command', 'PowerShell'].includes(toolName)) {
      const cmd = toolCall.input?.command ?? toolCall.params?.command ?? toolInput;

      if (isDestructiveCommand(cmd)) {
        appendTrace('tool_guard_triggered', `위험 명령 감지: ${toolName}`, activeTicket);
        console.error(`[TicketPilot] ⚠ SAFETY GUARD: 위험한 명령 감지됨.`);
        console.error(`[TicketPilot] 명령: ${cmd.slice(0, 100)}`);
        console.error(`[TicketPilot] 되돌릴 수 없는 변경이 발생할 수 있습니다. 신중하게 진행하세요.`);
        process.exit(0);
      }

      for (const rule of BITBUCKET_RISK_COMMANDS) {
        if (rule.pattern.test(cmd)) {
          appendTrace('bitbucket_guard_triggered', `Bitbucket 위험: ${rule.reason}`, activeTicket);
          console.error(`[TicketPilot] ⚠ BITBUCKET 안전 가드 (${rule.level}): ${rule.reason}`);
          console.error(`[TicketPilot] 명령: ${cmd.slice(0, 120)}`);
          console.error(`[TicketPilot] 로컬 검증(테스트 통과, 코드 리뷰) 완료 후 명시적으로 승인하세요.`);
          process.exit(0);
        }
      }
    }

    if (['Write', 'Edit', 'write_file', 'edit_file', 'str_replace_editor'].includes(toolName)) {
      const filePath = toolCall.input?.file_path ?? toolCall.input?.path ?? toolCall.params?.path ?? '';
      if (filePath && isHighRiskPath(filePath)) {
        appendTrace('tool_guard_triggered', `고위험 경로 감지: ${filePath}`, activeTicket);
        console.error(`[TicketPilot] ⚠ 고위험 경로: ${filePath}`);
        console.error(`[TicketPilot] 이 파일은 고위험으로 분류됩니다. 진행 전 사용자 승인을 확인하세요.`);
      }
      const content = toolCall.input?.content ?? toolCall.input?.new_string ?? '';
      const matched = containsHighRiskKeyword(content);
      if (matched.length > 0) {
        console.error(`[TicketPilot] ⚠ 고위험 키워드 감지: ${matched.join(', ')}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('[TicketPilot] pre-tool-guard 오류 (non-fatal):', err?.message ?? err);
    process.exit(0);
  }
})();
