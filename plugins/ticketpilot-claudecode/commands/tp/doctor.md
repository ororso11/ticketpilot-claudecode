# /tp:doctor

TicketPilot 설치, 설정, 연결 상태를 진단합니다.

## 사용법

```
/tp:doctor
```

---

## 실행 순서

아래 항목을 순서대로 점검하고 `✓ 정상` / `⚠ 경고` / `✗ 실패` 로 표시:

| 점검 항목 | 방법 | 기대값 |
|---------|------|--------|
| Node.js 버전 | `node --version` | >= 20 |
| `.ticketpilot/` 디렉토리 | 존재 여부 확인 | 있음 |
| `.ticketpilot/state/` | 읽기/쓰기 가능 | 있음 |
| `.ticketpilot/artifacts/` | 읽기/쓰기 가능 | 있음 |
| `.ticketpilot/logs/` | 읽기/쓰기 가능 | 있음 |
| `JIRA_BASE_URL` | 환경변수 설정 여부 | 설정됨 |
| `JIRA_EMAIL` | 환경변수 설정 여부 | 설정됨 |
| `JIRA_API_TOKEN` | 환경변수 설정 여부 | 설정됨 |
| Jira 연결 | `GET /rest/api/3/myself` | HTTP 200 |
| 현재 워크플로우 | state/current-ticket.json | 유효하거나 없음 |

### 출력 형식

```
TicketPilot 진단 결과
─────────────────────────────────
  ✓ Node.js 버전           v22.3.0 (>= 20 필요)
  ✓ .ticketpilot/          존재
  ✓ .ticketpilot/state/    읽기/쓰기 가능
  ✓ .ticketpilot/artifacts/ 읽기/쓰기 가능
  ✓ .ticketpilot/logs/     읽기/쓰기 가능
  ✓ JIRA_BASE_URL          설정됨
  ✓ JIRA_EMAIL             설정됨
  ✓ JIRA_API_TOKEN         설정됨
  ✓ Jira 연결              성공 — 홍길동 으로 로그인됨
  ✓ 현재 워크플로우         PROJ-123 (단계: 계획완료)

모두 정상입니다.
```

### 실패/경고 항목별 해결방법

| 문제 | 해결 방법 |
|------|---------|
| Node.js < 20 | `nvm install 20 && nvm use 20` |
| 디렉토리 없음 | `/tp:setup` 실행 |
| 환경변수 없음 | `/tp:setup` 실행 후 안내 따르기 |
| Jira 인증 실패 | Atlassian에서 API 토큰 재발급 |
| 상태 파일 손상 | `.ticketpilot/state/current-ticket.json` 삭제 후 `/tp:start` 재실행 |

### 환경변수 값은 절대 출력하지 말 것 (설정 여부만 표시)

### 점검 후 안내

```
─────────────────────────────────
HUD: settings.json 에 아래 추가 시 상태바 활성화:
  {"statusLine": {"type": "command", "command": "node ~/.claude/plugins/ticketpilot-claudecode-marketplace/ticketpilot-claudecode/scripts/hud.js"}}

다음 추천 명령:
  /tp:setup        — 초기 설정
  /tp:start PROJ-123 — 티켓 워크플로우 시작
```

---

## 규칙

- 파일을 수정하지 않음
- Jira에 아무것도 전송하지 않음
- 환경변수 값 출력 금지
