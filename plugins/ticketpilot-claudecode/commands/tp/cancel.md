# /tp:cancel

현재 TicketPilot 워크플로우를 취소합니다.

## 사용법

```
/tp:cancel
/tp:cancel --force
```

---

## 동작 방식

### 기본: `/tp:cancel` (소프트 취소)

데이터를 보존하며 워크플로우를 취소합니다.

1. `.ticketpilot/state/current-ticket.json` 읽기
2. 상태 파일 없으면: `취소할 활성 워크플로우가 없습니다.`
3. `"phase": "cancelled"` 로 업데이트하고 `"updatedAt"` 갱신
4. 파일 저장
5. `.ticketpilot/logs/trace.jsonl` 에 이벤트 추가:
   ```json
   { "event": "cancelled", "ticketKey": "PROJ-123", "message": "계획완료 단계에서 워크플로우 취소됨" }
   ```
6. 출력:
   ```
   ✓ PROJ-123 워크플로우 취소됨 (이전 단계: 계획완료)
   아티팩트는 .ticketpilot/artifacts/ 에 보존됩니다.
   새 티켓 시작: /tp:start PROJ-456
   완전 초기화: /tp:cancel --force
   ```

---

### 강제: `/tp:cancel --force` (하드 리셋)

워크플로우 상태를 완전히 초기화합니다.

1. `.ticketpilot/state/current-ticket.json` 읽기
2. `.ticketpilot/state/current-ticket.backup.json` 으로 백업
3. `current-ticket.json` 삭제
4. trace.jsonl 에 `"force_cancelled"` 이벤트 추가
5. 출력:
   ```
   ✓ 상태 초기화 완료 (백업: .ticketpilot/state/current-ticket.backup.json)
   아티팩트는 .ticketpilot/artifacts/ 에 보존됩니다.
   노트패드는 .ticketpilot/notepad.md 에 보존됩니다.
   주의: 코드 변경사항은 되돌리지 않습니다. git status 로 확인하세요.
   ```

---

## 절대 하지 않는 것

- **코드 변경 되돌리기 금지** — `git reset`, `git checkout` 절대 실행하지 않음
- **아티팩트 삭제 금지** — `.ticketpilot/artifacts/` 유지
- **노트패드 삭제 금지** — `.ticketpilot/notepad.md` 유지
- **Jira 댓글 등록 금지**
- **PR 닫기 금지**

---

## 사용 시점

| 상황 | 명령 |
|------|------|
| 다른 티켓으로 전환 | `/tp:cancel` 후 `/tp:start NEW-456` |
| 워크플로우 꼬였을 때 | `/tp:cancel --force` |
| 티켓이 닫히거나 취소됨 | `/tp:cancel` |
| 완전히 처음부터 시작 | `/tp:cancel --force` |
