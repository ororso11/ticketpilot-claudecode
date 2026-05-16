# /tp:plan

Jira 티켓의 분석과 구현 계획을 생성합니다 — 계획만, 코드 변경 없음.

## 사용법

```
/tp:plan <티켓키>
```

**예시:** `/tp:plan PROJ-456`

---

## 동작 방식

`/tp:start` 와 동일하게 티켓 가져오기, 분석, 아티팩트 생성을 수행하지만
**계획 전용 모드**를 명확히 강조합니다 — 사용자가 요청하더라도 구현은 시작하지 않습니다.

### 실행 단계

1. **확인** — Jira 환경변수 확인 (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`)
2. **가져오기** — Jira REST API v3 로 티켓 정보 및 댓글 직접 호출
3. **분석** — 요구사항, 인수 조건, 위험도 추출
4. **아티팩트 생성** — `.ticketpilot/artifacts/{ticketKey}/` 에 파일 작성:
   - `ticket-analysis.md`
   - `implementation-plan.md`
   - `impact-analysis.md`
5. **상태 저장** — `.ticketpilot/state/current-ticket.json` 에 `"phase": "planned"` 로 저장
6. **계획 출력** — `implementation-plan.md` 내용을 인라인으로 표시하고 아티팩트 경로 안내

### `/tp:start` 와의 차이

`/tp:plan` 은 계획 후 중단합니다. 코드 변경을 제안하거나 시작하지 않습니다.
명령 실행 중 사용자가 "구현해줘"라고 해도 거절하고 이것이 계획 전용 모드임을 안내하세요.
구현을 진행하려면 `/tp:start` 를 실행하고 명시적으로 승인해야 합니다.

---

## 출력

완료 후 `implementation-plan.md` 전체 내용을 인라인으로 표시하여
파일을 열지 않고도 검토할 수 있게 합니다. 그 다음 아티팩트 경로 목록 표시.

---

## v0.1 제약사항

> 코드 파일은 수정되지 않습니다.
> Jira 댓글은 등록되지 않습니다.
> PR은 생성되지 않습니다.
