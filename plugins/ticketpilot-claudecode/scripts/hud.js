#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const statePath = join(process.cwd(), '.ticketpilot', 'state', 'current-ticket.json');

const phaseKo = {
  initialized: '초기화',
  analyzed: '분석완료',
  planned: '계획완료',
  approved: '승인됨',
  implementing: '구현중',
  testing: '테스트중',
  reviewing: '검토중',
  done: '완료',
  cancelled: '취소됨',
};

const riskKo = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  낮음: '낮음',
  보통: '보통',
  높음: '높음',
};

const nextKo = {
  initialized: '분석시작',
  analyzed: '계획생성',
  planned: '계획승인',
  approved: '구현시작',
  implementing: '구현중',
  testing: '테스트중',
  reviewing: '검토중',
  done: '완료',
  cancelled: '재시작필요',
};

if (!existsSync(statePath)) {
  process.stdout.write('TP | 대기중 | /tp:start <티켓키>');
  process.exit(0);
}

try {
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const phase = phaseKo[state.phase] ?? state.phase;
  const risk = riskKo[state.riskLevel] ?? state.riskLevel ?? '?';
  const next = nextKo[state.phase] ?? '';
  process.stdout.write(`TP | ${state.ticketKey} | ${phase} | 위험:${risk} | 다음:${next}`);
} catch {
  process.stdout.write('TP | 상태오류');
}
