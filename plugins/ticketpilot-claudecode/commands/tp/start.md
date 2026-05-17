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

**보안 규칙:** 환경변수 값(토큰, 이메일 등)은 절대 출력하지 않는다. 설정 여부만 확인.

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
- `fields.description` — 설명 (ADF 형식이면 텍스트만 추출)
- `fields.status.name` — 상태
- `fields.issuetype.name` — 이슈 타입
- `fields.priority.name` — 우선순위
- `fields.assignee.displayName` — 담당자
- `fields.labels` — 레이블
- `fields.components[].name` — 컴포넌트
- 최근 댓글 최대 10개

**보안 규칙:** API 응답에서 인증 정보가 포함된 필드는 로그에 기록하지 않는다.

404 응답 시:
```
✗ 티켓 {ticketKey} 를 찾을 수 없습니다.
  - 티켓 키가 올바른지 확인하세요
  - Jira 접근 권한이 있는지 확인하세요
```

---

### Step 2.5 — 이슈 타입 검증

`fields.issuetype.name` 값을 확인:

- `"개발"`, `"Story"`, `"Task"`, `"Bug"`, `"Sub-task"`, `"Technical Task"` → 계속 진행

- `"Epic"` (에픽) 단독 → 경고 후 계속:
  ```
  ⚠ 에픽 티켓입니다. 하위 스토리/Task 단위로 /tp:start 를 실행하면 더 정확한 분석이 가능합니다.
  계속 진행합니다...
  ```

- 그 외 타입 (디자인, 기획, 인프라 등) → 사용자에게 확인 후 계속:
  ```
  ⚠ 이 티켓의 유형은 "{issuetype}" 입니다.
  /tp:start 는 개발 작업 티켓에 최적화되어 있습니다.
  계속 진행하시겠습니까? (y/N)
  ```
  N이면 중단. Y이면 계속.

---

### Step 3 — 요구사항 분석 & 키워드 추출

티켓 제목, 설명, 댓글을 꼼꼼히 읽고 파악:

1. **비즈니스 요구사항** — 어떤 문제를 해결하는가?
2. **인수 조건(AC)** — 명시적/암묵적 완료 조건
3. **불명확한 사항** — 구현을 막을 수 있는 모호함
4. **기술 범위** — 영향받을 코드베이스 영역

**핵심 키워드 추출 (소스 분석에서 사용):**

티켓 제목과 설명에서 핵심 기술 용어 최대 5개 추출:
- 기능명, API명, 컴포넌트명, 도메인 용어 위주
- 한글 → 영문 추론 포함 (예: "로그인" → "login", "auth")
- 너무 일반적인 단어 제외 (예: "수정", "추가", "개발")

**예시:**
- "사용자 로그인 실패 시 잠금 기능 추가" → `["login", "auth", "lockout", "user", "account"]`
- "결제 금액 합산 오류 수정" → `["payment", "calculate", "amount", "order", "invoice"]`
- "상품 목록 페이지 무한스크롤 적용" → `["product", "list", "scroll", "pagination", "infinite"]`

---

### Step 4 — 스마트 소스코드 분석

**목표:** 전체 파일 스캔 없이, 티켓과 관련된 파일 3~5개만 정밀 분석하여 구체적인 file:line 참조 생성.

#### Step 4-1. 프로젝트 컨텍스트 로드

`.ticketpilot/project-memory.json` 파일이 있으면 읽어서 활용:
- `importantPaths` → 탐색 시작 디렉토리 목록
- `riskAreas` → 고위험 영역 사전 인식
- `techStack` → 언어별 파일 타입 결정 (예: TypeScript → `.ts`, `.tsx`)
- `frameworks` → 프레임워크별 규칙 적용 (예: NestJS → `@Controller`, `@Service`)

없으면 기본 경로 사용: `src/`, `app/`, `lib/`, `api/`, `pages/`

> `/tp:init-project` 를 먼저 실행하면 더 정확한 분석이 가능합니다.

#### Step 4-2. 키워드 기반 파일 탐색

Step 3에서 추출한 키워드로 아래 순서대로 탐색 (Grep 도구 활용):

**탐색 우선순위 (순서대로 실행, 각 단계마다 결과 있으면 다음 단계는 축소):**

1. **파일명 탐색** — 키워드가 파일명에 포함된 파일
   - 예: `*login*`, `*auth*`, `*payment*`, `*order*`
   - 탐색 경로: `importantPaths` 또는 기본 경로

2. **함수/클래스명 탐색** — 코드 내 키워드 등장
   - 패턴: `function {keyword}`, `class {keyword}`, `def {keyword}`, `const {keyword}`, `{keyword}Handler`, `{keyword}Service`, `{keyword}Controller`
   - 파일 타입: 프로젝트 주 언어 확장자 (.ts, .js, .py, .java, .go 등)

3. **API/라우트 탐색** — 엔드포인트 패턴
   - 패턴: `'/api/{keyword}'`, `router.{keyword}`, `@Get('/{keyword}')`, `path: '/{keyword}'`

4. **임포트 체인** — 위에서 찾은 핵심 파일이 임포트하는 파일 중 관련성 높은 것

**보안 제약 (탐색에서 제외):**
- `.env*`, `*.key`, `*.pem`, `*.p12`, `*secret*` 파일
- `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`
- 탐색 결과(파일 경로, 코드 내용)는 외부 서버/로그 파일에 전송하지 않음
- 인증/결제 관련 경로 탐색 결과 → `riskLevel: 높음` 으로 자동 상향

**탐색 개수 제한:** 파일 탐색 최대 10개, 내용 읽기는 3~5개로 제한.

#### Step 4-3. 관련 파일 내용 분석

탐색한 파일 중 가장 관련성 높은 3~5개를 선택하여 분석:
- 어떤 함수/클래스/컴포넌트가 변경될 가능성이 있는가?
- 어떤 인터페이스/타입 정의를 확인해야 하는가?
- 연관된 테스트 파일이 있는가?

분석 결과는 `implementation-plan.md` 에 **구체적인 `파일명:라인번호`** 형태로 기록.

**분석 불가 시 (파일 탐색 결과 없음):**
```
⚠ 소스 분석: 관련 파일을 찾지 못했습니다.
  - /tp:init-project 를 실행하여 프로젝트 컨텍스트를 구성하세요
  - 또는 티켓 설명에 더 구체적인 기술 용어를 추가하세요
구현 계획은 티켓 정보만으로 생성합니다.
```

---

### Step 5 — 위험도 평가

아래 기준으로 `낮음`, `보통`, `높음` 분류:

**높음** 해당 항목 (하나라도 해당되면 `높음`):
- 티켓 키워드: `password`, `secret`, `token`, `payment`, `auth`, `permission`, `personalInfo`, `privacy`, `credential`
- 영향 경로: `.env`, `*.pem`, `*.key`, `src/**/security/**`, `src/**/auth/**`, `src/**/payment/**`, `db/migration/**`
- Step 4 소스 분석에서 인증·결제·보안 관련 파일이 탐색된 경우
- DB 스키마 변경, API 인터페이스 변경

**보통** 해당 항목:
- 기존 기능 변경 (신규 기능 추가가 아닌 수정)
- 외부 API 연동
- 공유 유틸리티/라이브러리 변경

**낮음:** 위 항목에 해당 없는 신규 기능, UI 변경, 설정 추가

이유를 구체적으로 명시.

---

### Step 6 — 아티팩트 생성

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

## 소스코드 분석 결과
| 파일 | 관련 내용 | 예상 변경 |
|------|---------|---------|
| src/auth/login.service.ts:45 | loginUser() 함수 | 잠금 조건 추가 |
| src/auth/auth.controller.ts:23 | POST /auth/login | 응답 코드 수정 |
| ... | ... | ... |

## 영향 범위
{영향받는 모듈, 파일, 레이어}

## 구현 단계
{단계별 작업 목록 — 구체적인 파일명:라인번호 포함}

## 테스트 전략
{테스트 방법 및 체크리스트 — 관련 테스트 파일 경로 포함}

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

### Step 7 — 상태 저장

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
  "sourceAnalysis": {
    "keywords": ["<추출된 키워드 목록>"],
    "analyzedFiles": ["<내용을 읽은 파일 경로>"],
    "skippedFiles": ["<관련성 낮아 제외된 파일>"]
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

### Step 8 — 결과 요약 출력

```
✓ 티켓 로드:       {summary}
✓ 이슈 타입:       {issueType}
✓ 위험도:          {낮음|보통|높음} — {이유}
✓ 소스 분석:       {n}개 파일 분석 완료
  └ 분석 파일: {파일 경로 목록 (경로만, 내용 미출력)}
✓ 티켓 분석:       .ticketpilot/artifacts/{ticketKey}/ticket-analysis.md
✓ 구현 계획:       .ticketpilot/artifacts/{ticketKey}/implementation-plan.md
✓ 영향 분석:       .ticketpilot/artifacts/{ticketKey}/impact-analysis.md
✓ 상태 저장:       .ticketpilot/state/current-ticket.json

다음 단계:
  - 구현 계획 파일을 검토하세요 (파일명:라인 참조 포함)
  - 승인하면 작업을 시작할 수 있습니다
  - /tp:status 로 워크플로우 상태 확인
```

---

## v0.1 보안 보장

> - 코드 파일은 수정되지 않습니다 (읽기 전용)
> - Jira 댓글은 자동으로 등록되지 않습니다
> - PR은 자동으로 생성되지 않습니다
> - 인증 정보(토큰, 패스워드, 이메일)는 로그에 절대 출력되지 않습니다
> - 소스코드 내용은 외부 서버로 전송되지 않습니다
> - 모든 아티팩트는 `.ticketpilot/` 로컬 디렉토리에만 저장됩니다
> - 모든 변경은 명시적인 사용자 승인이 필요합니다
