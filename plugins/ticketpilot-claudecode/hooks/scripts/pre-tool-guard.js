#!/usr/bin/env node
// TicketPilot — pre-tool-guard hook
// Multi-layer safety guard: destructive commands, high-risk paths,
// network pipe attacks, package publish, env exposure, and more.

import fs from 'fs';
import path from 'path';

// ── HIGH-RISK FILE PATHS ─────────────────────────────────────────────────────
const HIGH_RISK_PATHS = [
  /\.env($|\.)/,                                    // .env, .env.local, .env.production
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
  /\.cert$/,
  /\.cer$/,
  /\.npmrc$/,                                       // npm credentials
  /\.pypirc$/,                                      // PyPI credentials
  /\.netrc$/,                                       // netrc credentials
  /application-prod\.(yml|yaml|properties)$/,
  /\/(security|auth|payment|privacy)\//,
  /\/(db\/migration|migrations)\//,
  /\/(secrets?|credentials?)\//,                    // secrets/, credentials/
  /\/\.ssh\//,                                      // SSH keys
  /\/config\/(prod|production|staging)\//,          // prod/staging config
  /\/(keystore|truststore)\.(jks|p12|pfx)$/,        // Java keystores
  /terraform.*\.(tfvars|tfstate)$/,                 // Terraform secrets
];

// ── HIGH-RISK KEYWORDS (in file content) ────────────────────────────────────
const HIGH_RISK_KEYWORDS = [
  'password', 'secret', 'apiKey', 'api_key',
  'privateKey', 'private_key', 'clientSecret', 'client_secret',
  'accessToken', 'access_token', 'refreshToken', 'refresh_token',
  'sessionToken', 'session_token', 'bearerToken', 'bearer_token',
  'payment', 'auth', 'permission', 'personalInfo', 'privacy', 'prod',
  'connectionString', 'connection_string', 'databaseUrl', 'database_url',
  'BEGIN RSA PRIVATE', 'BEGIN PRIVATE KEY', 'BEGIN CERTIFICATE',         // PEM headers
];

// Patterns that look like real credentials (base64 tokens, API keys)
const CREDENTIAL_PATTERNS = [
  /[A-Za-z0-9+/]{40,}={0,2}/,          // Long base64 string (likely token)
  /sk-[A-Za-z0-9]{20,}/,               // OpenAI / Anthropic style keys
  /ghp_[A-Za-z0-9]{36}/,               // GitHub personal access token
  /xoxb-[0-9]+-[A-Za-z0-9-]+/,         // Slack bot token
  /AKIA[0-9A-Z]{16}/,                  // AWS access key
  /ya29\.[A-Za-z0-9_-]{10,}/,          // Google OAuth token
];

// ── DESTRUCTIVE COMMANDS ─────────────────────────────────────────────────────
const DESTRUCTIVE_COMMANDS = [
  { pattern: /git\s+reset\s+--hard/, reason: 'git reset --hard — 모든 로컬 변경 삭제' },
  { pattern: /git\s+push\s+--force(-with-lease)?/, reason: 'force push — 원격 기록 덮어쓰기' },
  { pattern: /git\s+clean\s+-[a-z]*f/, reason: 'git clean -f — 추적되지 않은 파일 삭제' },
  { pattern: /git\s+branch\s+-[dD]\s/, reason: 'git branch -D — 브랜치 삭제' },
  { pattern: /git\s+stash\s+(drop|clear)/, reason: 'git stash drop/clear — stash 삭제' },
  { pattern: /rm\s+-[a-z]*r[a-z]*f|rm\s+-[a-z]*f[a-z]*r/, reason: 'rm -rf — 파일/디렉토리 강제 삭제' },
  { pattern: /DROP\s+TABLE/i, reason: 'DROP TABLE — 테이블 영구 삭제' },
  { pattern: /TRUNCATE\s+TABLE/i, reason: 'TRUNCATE TABLE — 테이블 데이터 전체 삭제' },
  { pattern: /DELETE\s+FROM\s+\S+\s*(WHERE\s+1\s*=\s*1|;|$)/i, reason: 'DELETE 전체 삭제 패턴' },
  { pattern: /UPDATE\s+\S+\s+SET\s+.+WHERE\s+1\s*=\s*1/i, reason: 'UPDATE 전체 수정 패턴' },
  { pattern: /ALTER\s+TABLE\s+\S+\s+DROP\s+COLUMN/i, reason: 'ALTER TABLE DROP COLUMN — 컬럼 삭제' },
  { pattern: /chmod\s+-?R?\s*7{3}/, reason: 'chmod 777 — 모든 권한 부여 (보안 취약점)' },
  { pattern: /pkill\s+-9|kill\s+-9\s+[0-9]+/, reason: 'kill -9 — 프로세스 강제 종료' },
  { pattern: /format\s+(c:|d:)/i, reason: 'format — 디스크 포맷' },
  { pattern: /del\s+\/[fqs].*\/s/i, reason: 'del /s — Windows 파일 재귀 삭제' },
];

// ── BITBUCKET / CI RISK COMMANDS ─────────────────────────────────────────────
const BITBUCKET_RISK_COMMANDS = [
  { pattern: /git\s+push\s+.*\b(main|master|develop|release)\b/, level: 'CRITICAL', reason: '보호 브랜치 직접 푸시 — Bamboo CI 트리거됩니다' },
  { pattern: /git\s+push\b(?!\s+--dry-run)/, level: 'HIGH', reason: 'git push — Bamboo CI 빌드가 트리거될 수 있습니다' },
  { pattern: /\bbb\s+(pr|repo|pipeline)/, level: 'HIGH', reason: 'Bitbucket CLI 작업 감지됨' },
];

// ── NETWORK PIPE ATTACKS (RCE risk) ─────────────────────────────────────────
const NETWORK_PIPE_COMMANDS = [
  { pattern: /curl\s+.*\|\s*(bash|sh|zsh|fish|node|python|perl|ruby)/i, level: 'CRITICAL', reason: '외부 URL → 쉘 직접 실행 (공급망 공격 위험)' },
  { pattern: /wget\s+.*\|\s*(bash|sh|zsh|fish|node|python)/i, level: 'CRITICAL', reason: '외부 URL → 쉘 직접 실행 (공급망 공격 위험)' },
  { pattern: /curl\s+-s[iL]*\s+http[s]?:\/\/(?!localhost|127\.0\.0\.1|::1)/, level: 'HIGH', reason: '외부 서버로 HTTP 요청 — 데이터 유출 가능성 확인' },
];

// ── PACKAGE PUBLISH (irreversible) ───────────────────────────────────────────
const PUBLISH_COMMANDS = [
  { pattern: /npm\s+publish(?!\s+--dry-run)/, level: 'CRITICAL', reason: 'npm 패키지 공개 배포 — 되돌리기 매우 어려움' },
  { pattern: /pip\s+(upload|publish)/, level: 'CRITICAL', reason: 'PyPI 패키지 배포' },
  { pattern: /cargo\s+publish/, level: 'CRITICAL', reason: 'crates.io 패키지 배포' },
  { pattern: /gem\s+push/, level: 'CRITICAL', reason: 'RubyGems 패키지 배포' },
  { pattern: /docker\s+push/, level: 'HIGH', reason: 'Docker 이미지 레지스트리 푸시' },
  { pattern: /helm\s+push|helm\s+repo\s+add/, level: 'HIGH', reason: 'Helm 차트 배포' },
];

// ── ENV VARIABLE EXPOSURE ────────────────────────────────────────────────────
const ENV_EXPOSURE_COMMANDS = [
  /^printenv(\s|$)/,
  /\benv\b\s*\|?\s*(grep|awk|sed)/,
  /echo\s+\$[A-Z_]*(TOKEN|KEY|SECRET|PASSWORD|API|CREDENTIAL|AUTH)[A-Z_]*/i,
  /cat\s+.*\.env(\.|$)/,
  /type\s+.*\.env(\.|$)/i,                          // Windows
  /Get-Content\s+.*\.env(\.|$)/i,                   // PowerShell
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function isHighRiskPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return HIGH_RISK_PATHS.some((p) => p.test(normalized));
}

function containsHighRiskKeyword(text) {
  const lower = text.toLowerCase();
  return HIGH_RISK_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
}

function containsCredentialPattern(text) {
  return CREDENTIAL_PATTERNS.filter((p) => p.test(text));
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

// Guard trigger counter (in-process, resets per hook invocation — used for severity)
function recordGuardTrigger(type) {
  try {
    const counterFile = path.join(process.cwd(), '.ticketpilot', 'state', 'guard-counters.json');
    let counters = {};
    if (fs.existsSync(counterFile)) {
      counters = JSON.parse(fs.readFileSync(counterFile, 'utf-8'));
    }
    const today = new Date().toISOString().slice(0, 10);
    if (!counters[today]) counters[today] = {};
    counters[today][type] = (counters[today][type] ?? 0) + 1;
    fs.writeFileSync(counterFile, JSON.stringify(counters, null, 2), 'utf-8');
    return counters[today][type];
  } catch { return 0; }
}

async function readStdin() {
  if (process.stdin.isTTY) return '';
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8').trim();
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
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

    // ── SHELL COMMAND CHECKS ─────────────────────────────────────────────────
    if (['Bash', 'bash', 'shell', 'run_command', 'PowerShell'].includes(toolName)) {
      const cmd = toolCall.input?.command ?? toolCall.params?.command ?? toolInput;

      // 1. Destructive commands
      for (const rule of DESTRUCTIVE_COMMANDS) {
        if (rule.pattern.test(cmd)) {
          const count = recordGuardTrigger('destructive');
          appendTrace('tool_guard_triggered', `위험 명령 감지: ${rule.reason}`, activeTicket);
          console.error(`[TicketPilot] ⚠ SAFETY GUARD: 위험한 명령 감지됨`);
          console.error(`[TicketPilot] 이유: ${rule.reason}`);
          console.error(`[TicketPilot] 명령: ${cmd.slice(0, 120)}`);
          if (count >= 3) {
            console.error(`[TicketPilot] ⛔ 오늘 ${count}번째 위험 명령입니다. 각별히 주의하세요.`);
          }
          process.exit(0);
        }
      }

      // 2. Bitbucket / CI push guards
      for (const rule of BITBUCKET_RISK_COMMANDS) {
        if (rule.pattern.test(cmd)) {
          appendTrace('bitbucket_guard_triggered', `Bitbucket 위험: ${rule.reason}`, activeTicket);
          console.error(`[TicketPilot] ⚠ BITBUCKET 안전 가드 (${rule.level}): ${rule.reason}`);
          console.error(`[TicketPilot] 명령: ${cmd.slice(0, 120)}`);
          console.error(`[TicketPilot] 로컬 검증(테스트 통과, 코드 리뷰) 완료 후 명시적으로 승인하세요.`);
          process.exit(0);
        }
      }

      // 3. Network pipe / RCE risk
      for (const rule of NETWORK_PIPE_COMMANDS) {
        if (rule.pattern.test(cmd)) {
          appendTrace('network_guard_triggered', `네트워크 위험: ${rule.reason}`, activeTicket);
          console.error(`[TicketPilot] ⚠ NETWORK GUARD (${rule.level}): ${rule.reason}`);
          console.error(`[TicketPilot] 명령: ${cmd.slice(0, 120)}`);
          console.error(`[TicketPilot] 외부 소스에서 코드를 실행하기 전 내용을 직접 확인하세요.`);
          process.exit(0);
        }
      }

      // 4. Package publish
      for (const rule of PUBLISH_COMMANDS) {
        if (rule.pattern.test(cmd)) {
          appendTrace('publish_guard_triggered', `패키지 배포 감지: ${rule.reason}`, activeTicket);
          console.error(`[TicketPilot] ⚠ PUBLISH GUARD (${rule.level}): ${rule.reason}`);
          console.error(`[TicketPilot] 명령: ${cmd.slice(0, 120)}`);
          console.error(`[TicketPilot] 배포 전 버전, 변경사항, 접근 권한을 명시적으로 확인하세요.`);
          process.exit(0);
        }
      }

      // 5. Environment variable exposure
      for (const pattern of ENV_EXPOSURE_COMMANDS) {
        if (pattern.test(cmd)) {
          appendTrace('env_exposure_guard', `환경변수 노출 명령 감지`, activeTicket);
          console.error(`[TicketPilot] ⚠ ENV GUARD: 환경변수 노출 명령 감지됨`);
          console.error(`[TicketPilot] 명령: ${cmd.slice(0, 80)}`);
          console.error(`[TicketPilot] API 토큰, 비밀번호 등이 로그에 출력될 수 있습니다.`);
          process.exit(0);
        }
      }
    }

    // ── FILE WRITE/EDIT CHECKS ───────────────────────────────────────────────
    if (['Write', 'Edit', 'write_file', 'edit_file', 'str_replace_editor'].includes(toolName)) {
      const filePath = toolCall.input?.file_path ?? toolCall.input?.path ?? toolCall.params?.path ?? '';

      // 1. High-risk path check
      if (filePath && isHighRiskPath(filePath)) {
        const count = recordGuardTrigger('high_risk_path');
        appendTrace('tool_guard_triggered', `고위험 경로 감지: ${filePath}`, activeTicket);
        console.error(`[TicketPilot] ⚠ 고위험 경로: ${filePath}`);
        console.error(`[TicketPilot] 이 파일은 보안상 민감한 경로에 있습니다. 진행 전 내용을 검토하세요.`);
        if (count >= 3) {
          console.error(`[TicketPilot] ⛔ 오늘 ${count}번째 고위험 경로 수정입니다.`);
        }
      }

      // 2. High-risk keyword in content
      const content = toolCall.input?.content ?? toolCall.input?.new_string ?? '';
      const matchedKeywords = containsHighRiskKeyword(content);
      if (matchedKeywords.length > 0) {
        appendTrace('keyword_guard_triggered', `고위험 키워드: ${matchedKeywords.slice(0, 3).join(', ')}`, activeTicket);
        console.error(`[TicketPilot] ⚠ 고위험 키워드 감지: ${matchedKeywords.slice(0, 5).join(', ')}`);
        console.error(`[TicketPilot] 인증정보, 비밀번호, 토큰이 코드에 하드코딩되지 않는지 확인하세요.`);
      }

      // 3. Credential pattern in content (looks like real token)
      const matchedCredentials = containsCredentialPattern(content);
      if (matchedCredentials.length > 0) {
        appendTrace('credential_pattern_guard', `실제 인증정보 패턴 감지 (파일: ${filePath})`, activeTicket);
        console.error(`[TicketPilot] ⛔ CREDENTIAL GUARD: 실제 인증정보처럼 보이는 값이 감지됩니다.`);
        console.error(`[TicketPilot] API 키, 토큰, 시크릿은 코드에 직접 작성하지 마세요.`);
        console.error(`[TicketPilot] 환경변수(.env) 또는 시크릿 매니저를 사용하세요.`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('[TicketPilot] pre-tool-guard 오류 (non-fatal):', err?.message ?? err);
    process.exit(0);
  }
})();
