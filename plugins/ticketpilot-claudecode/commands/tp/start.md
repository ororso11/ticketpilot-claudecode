# /tp:start

Jira 티켓을 기반으로 TicketPilot 워크플로우를 시작합니다.

## 사용법

```
/tp:start <티켓키>
```

**예시:** `/tp:start PROJ-123`

---

## 실행 순서

### Step 1 — 환경변수 확인

아래 환경변수가 모두 설정되어 있는지 확인:
- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`

없으면 중단하고 안내:
```
Jira 인증 정보가 없습니다. /tp:setup 을 먼저 실행하세요.
```

---

### Step 2 — Jira 티켓 가져오기

아래 API를 직접 호출:

**티켓 정보:**
- `GET {JIRA_BASE_URL}/rest/api/3/issue/{ticketKey}`
- Authorization: `Basic ` + base64(`JIRA_EMAIL:JIRA_API_TOKEN`)

**댓글:**
- `GET {JIRA_BASE_URL}/rest/api/3/issue/{ticketKey}/comment`

추출할 필드:
- `fields.summary` — 제목
- `fields.description` — 설명 (ADF 형식이면 텍스트 추출)
- `fields.status.name` — 상태
- `fields.issuetype.name` — 이슈 타입
- `fields.priority.name` — 우선순위
- `fields.assignee.displayName` — 담당자
- `fields.labels` — 레이블
- `fields.components[].name` — 컴포넌트
- 최근 댓글 최대 10개

404 응답 시:
```
✗ 티켓 {ticketKey} 를 찾을 수 없습니다.
  - 티켓 키가 올바른지 확인하세요
  - Jira 접근 권한이 있는지 확인하세요
```

---

### Step 3 — 요구사항 분석

티켓 제목, 설명, 댓글을 꼼꼼히 읽고 파악:

1. **비즈니스 요구사항** — 어떤 문제를 해결하는가?
2. **인수 조건(AC)** — 명시적/암묵적 완료 조건
3. **불명확한 사항** — 구현을 막을 수 있는 모호함
4. **기술 범위** — 영향받을 코드베이스 영역

---

### Step 4 — 위험도 평가

아래 기준으로 `낮음`, `보통`, `높음` 분류:

**높음** 해당 항목:
- 키워드: `password`, `secret`, `token`, `payment`, `auth`, `permission`, `personalInfo`, `privacy`
- 경로: `.env`, `*.pem`, `*.key`, `src/**/security/**`, `src/**/auth/**`, `src/**/payment/**`, `db/migration/**`

하나라도 해당되면 `높음`으로 설정하고 이유 명시.

---

### Step 5 — 아티팩트 생성

`.ticketpilot/artifacts/{ticketKey}/` 아래에 파일 생성:

#### `ticket-analysis.md`
```markdown
# 티켓 분석: {ticketKey}

## 티켓 요약
| 항목 | 내용 |
|------|------|
| 키 | {ticketKey} |
| 제목 | {summary} |
| 상태 | {status} |
| 타입 | {issueType} |
| 우선순위 | {priority} |
| 담당자 | {assignee} |
| 위험도 | {riskLevel} |

## 비즈니스 요구사항
{요구사항 분석 내용}

## 인수 조건
{추출 또는 추론된 AC 목록}

## 불명확한 사항
{질문이 필요한 항목 목록}

## 위험도 분석
**위험도:** {낮음/보통/높음}
**이유:** {위험 판단 근거}

## 예상 범위
{영향받을 모듈/레이어}
```

#### `implementation-plan.md`
```markdown
# 구현 계획: {ticketKey}

## 목표
{구현 목표 한 줄 요약}

## 영향 범위
{영향받는 모듈, 파일, 레이어}

## 구현 단계
{단계별 작업 목록}

## 검토 필요 파일
{살펴봐야 할 파일 목록}

## 테스트 전략
{테스트 방법 및 체크리스트}

## 승인 필요 항목
- [ ] 구현 계획 검토
- [ ] 코드 변경 승인 (v0.2+)
```

#### `impact-analysis.md`
```markdown
# 영향 분석: {ticketKey}

## 영향받는 모듈
{모듈 목록}

## 데이터 영향
{DB/스키마 변경 여부}

## API/UI 영향
{외부 인터페이스 변경 여부}

## 보안/개인정보 영향
{보안 관련 고려사항}

## 롤백 방법
{문제 발생 시 되돌리는 방법}
```

---

### Step 6 — 상태 저장

`.ticketpilot/state/current-ticket.json` 작성:

```json
{
  "ticketKey": "<ticketKey>",
  "phase": "planned",
  "riskLevel": "<낮음|보통|높음>",
  "branch": null,
  "approval": {
    "planApproved": false,
    "editApproved": false,
    "jiraCommentApproved": false,
    "prApproved": false
  },
  "artifacts": {
    "ticketAnalysis": ".ticketpilot/artifacts/<ticketKey>/ticket-analysis.md",
    "implementationPlan": ".ticketpilot/artifacts/<ticketKey>/implementation-plan.md",
    "impactAnalysis": ".ticketpilot/artifacts/<ticketKey>/impact-analysis.md"
  },
  "changedFiles": [],
  "createdAt": "<ISO 타임스탬프>",
  "updatedAt": "<ISO 타임스탬프>"
}
```

---

### Step 7 — 결과 요약 출력

```
✓ 티켓 로드:       {summary}
✓ 위험도:          {낮음|보통|높음} — {이유}
✓ 티켓 분석:       .ticketpilot/artifacts/{ticketKey}/ticket-analysis.md
✓ 구현 계획:       .ticketpilot/artifacts/{ticketKey}/implementation-plan.md
✓ 영향 분석:       .ticketpilot/artifacts/{ticketKey}/impact-analysis.md
✓ 상태 저장:       .ticketpilot/state/current-ticket.json

다음 단계:
  - 티켓 분석 파일을 검토하세요
  - 구현 계획을 승인하면 작업을 시작할 수 있습니다
  - /tp:status 로 워크플로우 상태 확인
```

---

## v0.1 제약사항

> **읽기 전용 모드**: 이 명령은 분석과 계획만 수행합니다.
> 코드 파일은 수정되지 않습니다.
> Jira 댓글은 자동으로 등록되지 않습니다.
> PR은 자동으로 생성되지 않습니다.
> 모든 변경은 명시적인 사용자 승인이 필요합니다.
