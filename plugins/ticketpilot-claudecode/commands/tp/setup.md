# /tp:setup

TicketPilot 설치 마법사. 플러그인 설치 후 처음 한 번 실행하세요.

## 사용법

```
/tp:setup
```

---

## 실행 순서

### Step 1 — Jira 환경변수 확인

환경변수 값은 절대 출력하지 말고, 설정 여부만 확인:
- `JIRA_BASE_URL` — ✓ 설정됨 / ✗ 없음
- `JIRA_EMAIL` — ✓ 설정됨 / ✗ 없음
- `JIRA_API_TOKEN` — ✓ 설정됨 / ✗ 없음

**하나라도 없으면:**

```
Jira 인증 정보가 없습니다. 터미널에서 아래를 실행하세요:

  # macOS / Linux
  export JIRA_BASE_URL="https://your-company.atlassian.net"
  export JIRA_EMAIL="you@example.com"
  export JIRA_API_TOKEN="your-api-token"

  # Windows PowerShell
  $env:JIRA_BASE_URL="https://your-company.atlassian.net"
  $env:JIRA_EMAIL="you@example.com"
  $env:JIRA_API_TOKEN="your-api-token"

API 토큰 발급: https://id.atlassian.com/manage-profile/security/api-tokens

설정 후 /tp:setup 다시 실행하세요.
```

여기서 중단. 이후 단계 진행하지 말 것.

**모두 설정됨:** 계속 진행.

---

### Step 2 — .ticketpilot 디렉토리 생성

Bash/PowerShell 도구로 아래 디렉토리 생성 (없는 경우에만):
- `.ticketpilot/state/`
- `.ticketpilot/artifacts/`
- `.ticketpilot/logs/`

아래 파일이 없으면 생성:
- `.ticketpilot/config.json` — `{}` 로 초기화
- `.ticketpilot/notepad.md` — `# TicketPilot 노트\n\n## 현재 작업\n\n## 결정 사항\n\n## 다음 할 일\n` 로 초기화
- `.ticketpilot/project-memory.json` — `{"version":"0.1.0","projectType":"unknown","directives":[]}` 로 초기화

완료 시:
```
✓ .ticketpilot/ 준비 완료
```

생성 실패 시 구체적인 오류를 보여주고 중단.

---

### Step 3 — Jira 연결 테스트

아래 API를 직접 호출:
- Endpoint: `GET {JIRA_BASE_URL}/rest/api/3/myself`
- Authorization: `Basic ` + base64(`JIRA_EMAIL:JIRA_API_TOKEN`)
- Content-Type: `application/json`

**성공 (HTTP 200):**
```
✓ Jira 연결 성공 — {displayName} 으로 로그인됨
```

**실패 시:**
```
✗ Jira 연결 실패 ({HTTP 상태코드})

확인사항:
  - JIRA_BASE_URL 형식: https://your-company.atlassian.net (끝에 / 없음)
  - JIRA_API_TOKEN: https://id.atlassian.com/manage-profile/security/api-tokens 에서 재발급
  - JIRA_EMAIL: Atlassian 계정 이메일인지 확인

설정 수정 후 /tp:setup 다시 실행하세요.
```

---

### Step 4 — HUD 상태바 설정 안내 (선택)

이전 단계 모두 성공 시에만 표시:

```
선택사항: Claude Code 상태바에 TicketPilot 상태를 표시할 수 있습니다.

Claude Code settings.json에 추가하세요:

  {
    "statusLine": {
      "type": "command",
      "command": "node ~/.claude/plugins/ticketpilot-claudecode-marketplace/ticketpilot-claudecode/scripts/hud.js"
    }
  }

settings.json 위치: ~/.claude/settings.json
```

---

### Step 5 — 다음 단계 안내

상태에 따라 1개만 표시:

| 상태 | 다음 단계 |
|------|---------|
| Jira 변수 없음 | 환경변수 설정 후 `/tp:setup` 재실행 |
| Jira 연결 실패 | 토큰 재발급 후 `/tp:setup` 재실행 |
| 모두 완료 | `/tp:start PROJ-123` 으로 티켓 워크플로우 시작 |

---

## 규칙

- 환경변수 값 절대 출력 금지 (설정 여부만 표시)
- 문제 하나씩만 표시
- 다음 단계는 정확히 1개만
- 친절하고 짧게
