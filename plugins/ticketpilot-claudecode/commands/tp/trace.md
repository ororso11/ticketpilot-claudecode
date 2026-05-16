# /tp:trace

TicketPilot 워크플로우 이벤트 타임라인을 표시합니다.

## 사용법

```
/tp:trace
```

---

## 동작 방식

`.ticketpilot/logs/trace.jsonl` 을 읽어 타임라인을 표시합니다.

### Step 1 — 현재 상태 읽기

`.ticketpilot/state/current-ticket.json` 존재 시 상단에 표시:

```
현재 티켓: PROJ-123
단계: 계획완료 | 위험도: 보통 | 모드: 계획
```

### Step 2 — 이벤트 읽기

`trace.jsonl` 파싱 (한 줄에 JSON 객체 하나):

```json
{
  "timestamp": "2026-05-16T13:02:00.000Z",
  "event": "ticket_loaded",
  "ticketKey": "PROJ-123",
  "message": "PROJ-123 티켓 로드됨"
}
```

### Step 3 — 타임라인 출력

최근 50개 이벤트 표시 (오래된 것부터):

```
TicketPilot 타임라인

현재 티켓: PROJ-123 | 단계: 계획완료 | 위험도: 보통

[2026-05-16 13:02] 셋업 완료
[2026-05-16 13:03] PROJ-123 티켓 로드됨
                     Jira 티켓 PROJ-123 로드: 로그인 리다이렉트 버그 수정
[2026-05-16 13:04] PROJ-123 티켓 분석 생성됨
[2026-05-16 13:04] PROJ-123 구현 계획 생성됨
[2026-05-16 13:05] PROJ-123 상태 저장됨
[2026-05-16 13:05] PROJ-123 승인 대기중
```

### 트레이스 파일 없는 경우

```
아직 기록된 이벤트가 없습니다.
TicketPilot 명령을 실행하면 이벤트가 기록됩니다.
시작: /tp:setup 또는 /tp:start PROJ-123
```

### 이벤트 타입 참고

| 이벤트 | 의미 |
|--------|------|
| `setup_completed` | 셋업 마법사 실행됨 |
| `ticket_loaded` | Jira 티켓 가져옴 |
| `ticket_analysis_generated` | ticket-analysis.md 생성됨 |
| `implementation_plan_generated` | implementation-plan.md 생성됨 |
| `impact_analysis_generated` | impact-analysis.md 생성됨 |
| `state_saved` | current-ticket.json 업데이트됨 |
| `waiting_for_approval` | 사용자 검토 대기중 |
| `cancelled` | 워크플로우 취소됨 |
| `force_cancelled` | 워크플로우 강제 초기화됨 |
| `resumed` | 세션 복원됨 |

---

## 규칙

- 읽기 전용: 파일을 절대 수정하지 않음
- 트레이스 데이터는 로컬에만 저장, 외부 전송 없음
