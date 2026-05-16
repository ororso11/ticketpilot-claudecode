# /tp:config

TicketPilot 설정 옵션을 확인합니다.

> 초기 설정은 `/tp:setup` 을 사용하세요.
> `/tp:config` 는 설정 참고용이지 마법사가 아닙니다.

## 사용법

```
/tp:config
```

---

## 표시 내용

### 1. Jira 인증 정보 상태

값을 출력하지 않고 설정 여부만 확인:
- `JIRA_BASE_URL` — ✓ 설정됨 / ✗ 없음
- `JIRA_EMAIL` — ✓ 설정됨 / ✗ 없음
- `JIRA_API_TOKEN` — ✓ 설정됨 / ✗ 없음

모두 설정됐으면 `/tp:setup` 으로 연결 테스트를 권장.

### 2. 설정 파일 위치 및 주요 옵션

```
설정 파일: .ticketpilot/config.json

주요 옵션:
  workflow.requireApprovalBeforeEdit        true
  workflow.requireApprovalBeforeJiraComment true
  workflow.defaultMode                      plan
  risk.highRiskPaths                        [.env, *.pem, ...]
```

### 3. 워크플로우 옵션 참조

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `requireApprovalBeforeEdit` | `true` | 코드 변경 전 승인 필요 |
| `requireApprovalBeforeJiraComment` | `true` | Jira 댓글 등록 전 승인 필요 |
| `requireApprovalBeforePr` | `true` | PR 생성 전 승인 필요 |
| `autoRunTests` | `false` | 테스트 자동 실행 (v0.2+) |
| `defaultMode` | `"plan"` | 기본 워크플로우 모드 |
| `autoSuggestOnTicketKey` | `true` | Jira 키 감지 시 /tp:start 제안 |

### 4. 위험도 설정

높음으로 분류되는 경로 (승인 게이트 발동):
```
.env, *.pem, *.key
application-prod.yml / .properties
src/**/security/**, src/**/auth/**
src/**/payment/**
db/migration/**, migrations/**
```

높음으로 분류되는 키워드:
```
password, secret, token, privateKey,
payment, auth, permission, personalInfo, privacy
```

`.ticketpilot/config.json` 의 `risk.highRiskPaths`, `risk.highRiskKeywords` 에서 커스터마이징 가능.

### 5. HUD / 상태바 설정

Claude Code `settings.json` 에 추가:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/plugins/ticketpilot-claudecode-marketplace/ticketpilot-claudecode/scripts/hud.js"
  }
}
```

출력 예시:
```
TP | PROJ-123 | 계획완료 | 위험:보통 | 다음:계획승인
```

### 6. 문제 해결

| 문제 | 해결 방법 |
|------|---------|
| Jira 연결 안 됨 | `/tp:setup` 으로 재설정 |
| Jira 인증 실패 | Atlassian에서 API 토큰 재발급 |
| 디렉토리 없음 | `/tp:setup` 실행 |
| 플러그인 문제 | `/tp:doctor` 실행 |

---

## 관련 명령

- 초기 설정: `/tp:setup`
- 상태 진단: `/tp:doctor`
- 설정 전체 참조: `docs/configuration.md`
