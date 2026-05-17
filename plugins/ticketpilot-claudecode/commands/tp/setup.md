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

### Step 4 — HUD 상태바 자동 등록

이전 단계 모두 성공 시에만 실행.

**4-1. 플러그인 루트 경로 확인**

Bash 또는 PowerShell 도구로 `CLAUDE_PLUGIN_ROOT` 환경변수 값을 읽어온다:

```bash
# macOS/Linux
echo "$CLAUDE_PLUGIN_ROOT"

# Windows PowerShell
echo $env:CLAUDE_PLUGIN_ROOT
```

값이 없으면 아래 경로를 순서대로 탐색해 `hud.js`가 존재하는 경로를 찾는다:
- `~/.claude/plugins/ticketpilot-claudecode-marketplace/ticketpilot-claudecode/scripts/hud.js`
- `~/.claude/plugins/ticketpilot-claudecode/scripts/hud.js`

**4-2. ~/.claude/settings.json 업데이트**

`~/.claude/settings.json` 파일을 읽는다 (없으면 `{}` 로 간주).

`statusLine` 필드를 아래 값으로 추가 또는 덮어쓴다:

```json
"statusLine": "node \"<HUD_JS_절대경로>\""
```

`<HUD_JS_절대경로>` 는 4-1에서 확인한 실제 경로로 치환. 경로에 공백이 있으면 따옴표로 감싼다.

수정된 settings.json을 저장.

**4-3. 결과 출력**

성공:
```
✓ HUD 상태바 등록 완료
  [TP#0.1.0] | PROJ-123 | 구현중→테스트시작 | 위험:보통 | 변경:0
  Claude Code를 재시작하면 상태바에 TicketPilot이 표시됩니다.
```

hud.js 경로를 찾지 못한 경우:
```
⚠ HUD 경로를 자동으로 찾지 못했습니다.
  수동으로 ~/.claude/settings.json 에 추가하세요:
  "statusLine": "node \"<플러그인경로>/scripts/hud.js\""
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
