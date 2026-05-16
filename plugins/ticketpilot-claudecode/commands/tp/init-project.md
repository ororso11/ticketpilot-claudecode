# /tp:init-project

현재 프로젝트를 분석하고 TicketPilot 프로젝트 컨텍스트 파일을 생성합니다.

## 사용법

```
/tp:init-project
```

---

## 동작 방식

프로젝트 루트를 스캔하여 Jira 티켓 분석 시 사용할 구조화된 컨텍스트를 생성합니다.

### Step 1 — 프로젝트 구조 분석

프로젝트 루트를 스캔하여 감지:

| 항목 | 감지 방법 |
|------|---------|
| 기술 스택 | `package.json`, `pom.xml`, `build.gradle`, `go.mod`, `requirements.txt`, `Cargo.toml` |
| 프레임워크 | `package.json` 의존성 (Next.js, React, NestJS 등) |
| 패키지 매니저 | `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `bun.lockb` |
| 빌드 명령 | `package.json` scripts.build |
| 테스트 명령 | `vitest.config.*`, `jest.config.*`, `package.json` scripts.test |
| 주요 디렉토리 | `src/`, `app/`, `lib/`, `packages/`, `services/`, `api/`, `domain/` |
| 위험 영역 | `auth`, `security`, `payment`, `privacy`, `migration` 포함 디렉토리 |

### Step 2 — 코딩 컨벤션 감지

아래 파일 확인:
- `.eslintrc.*`, `.prettierrc.*` → JavaScript/TypeScript 컨벤션
- `checkstyle.xml`, `pmd.xml` → Java 컨벤션
- `pyproject.toml` → Python 컨벤션
- `CONTRIBUTING.md`, `STYLE.md` → 문서화된 컨벤션

### Step 3 — 파일 생성

#### `.ticketpilot/project-memory.json`
```json
{
  "techStack": "<감지된 스택>",
  "frameworks": ["<감지된 프레임워크>"],
  "packageManager": "<감지된 패키지 매니저>",
  "buildCommand": "<감지된 빌드 명령>",
  "testCommand": "<감지된 테스트 명령>",
  "conventions": "<컨벤션 요약>",
  "importantPaths": ["src/", "..."],
  "riskAreas": ["auth", "security", "payment", "privacy", "db migration"],
  "directives": [
    { "directive": "운영 DB 관련 SQL은 실행 전 반드시 사용자 승인", "priority": "high" },
    { "directive": "개인정보/인증/결제 관련 변경은 high risk로 분류", "priority": "high" }
  ],
  "updatedAt": "<ISO 타임스탬프>"
}
```

#### `.ticketpilot/artifacts/project/project-analysis.md`
사람이 읽기 좋은 프로젝트 개요 (기술 스택, 프레임워크, 빌드/테스트 명령, 주요 디렉토리, 위험 영역, 컨벤션).

### Step 4 — 결과 요약

```
프로젝트 초기화 완료.

  스택:        Next.js / TypeScript
  프레임워크:   React, Next.js
  패키지 매니저: pnpm
  빌드:        pnpm build
  테스트:      pnpm test
  위험 영역:   auth, security, payment, db migration

생성된 파일:
  .ticketpilot/project-memory.json
  .ticketpilot/artifacts/project/project-analysis.md

다음: /tp:start PROJ-123
```

---

## 규칙

- **읽기 전용**: 소스 코드는 수정하지 않습니다. 문서 파일만 생성.
- **멱등성**: 여러 번 실행해도 안전합니다.
- **Jira 호출 없음**: Jira API를 호출하지 않습니다.
- **인증 정보 출력 금지**: 환경변수 값은 절대 출력하지 않습니다.
