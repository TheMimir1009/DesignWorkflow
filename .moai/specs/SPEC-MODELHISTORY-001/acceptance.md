# SPEC-MODELHISTORY-001: 인수 기준

## 개요

AI 모델 히스토리 기록 시스템의 인수 테스트 시나리오입니다.

---

## 테스트 시나리오

### AC-MH-001: 설계문서 생성 시 히스토리 기록

**Given** 프로젝트에 Task가 존재하고 Q&A 답변이 완료된 상태

**When** 사용자가 설계문서 생성을 요청하면

**Then**
- Task의 `generationHistory`에 새 항목이 추가됨
- 해당 항목에는 다음 정보가 포함됨:
  - `documentType`: 'design'
  - `action`: 'create'
  - `provider`: 사용된 LLM 제공자 (예: 'openai', 'claude-code')
  - `model`: 사용된 모델 이름 (예: 'gpt-4o', 'claude-3.5-sonnet')
  - `createdAt`: ISO 8601 형식 타임스탬프
  - `id`: 고유 UUID

---

### AC-MH-002: PRD 생성 시 히스토리 기록

**Given** Task에 설계문서가 있는 상태

**When** 사용자가 PRD 생성을 트리거하면

**Then**
- Task의 `generationHistory`에 새 항목이 추가됨
- 해당 항목의 `documentType`은 'prd'
- 기존 히스토리 항목은 보존됨

---

### AC-MH-003: 프로토타입 생성 시 히스토리 기록

**Given** Task에 PRD가 있는 상태

**When** 사용자가 프로토타입 생성을 트리거하면

**Then**
- Task의 `generationHistory`에 새 항목이 추가됨
- 해당 항목의 `documentType`은 'prototype'
- 전체 히스토리에 3개 항목이 존재함 (design, prd, prototype)

---

### AC-MH-004: 문서 수정 시 히스토리 기록

**Given** Task에 기존 문서가 있는 상태

**When** 사용자가 AI 수정 요청을 제출하면 (예: "문장을 더 간결하게 수정해주세요")

**Then**
- Task의 `generationHistory`에 새 항목이 추가됨
- 해당 항목에는 다음 정보가 포함됨:
  - `action`: 'modify'
  - `feedback`: "문장을 더 간결하게 수정해주세요"
  - 해당 `documentType` (수정 대상 문서 유형)

---

### AC-MH-005: 모달에서 히스토리 표시

**Given** Task에 generationHistory가 2개 이상 존재하는 상태

**When** 사용자가 Task 상세 모달을 열면

**Then**
- 모달에 "AI 생성 히스토리" 섹션이 표시됨
- 히스토리 목록이 시간 역순으로 정렬됨 (최신 먼저)
- 각 항목에 다음 정보가 표시됨:
  - 생성 날짜/시간
  - Provider 이름 (또는 아이콘)
  - Model 이름
  - 문서 유형 (Design/PRD/Prototype)
  - 액션 유형 (생성/수정)

---

### AC-MH-006: 빈 히스토리 처리

**Given** Task의 generationHistory가 비어있는 상태

**When** 사용자가 Task 상세 모달을 열면

**Then**
- "AI 생성 히스토리" 섹션이 표시됨
- "생성 이력이 없습니다" 또는 유사한 빈 상태 메시지가 표시됨
- 오류가 발생하지 않음

---

### AC-MH-007: 기존 Task 마이그레이션 (하위 호환성)

**Given** 기존에 생성된 Task (generationHistory 필드가 없음)

**When** Task를 로드하면

**Then**
- 시스템이 정상적으로 Task를 로드함
- `generationHistory`가 빈 배열로 처리됨
- 오류가 발생하지 않음
- 해당 Task에 새 문서를 생성하면 히스토리가 정상적으로 기록됨

---

### AC-MH-008: 토큰 정보 기록 (Optional)

**Given** 토큰 정보를 제공하는 LLM Provider (예: OpenAI)를 사용 중인 상태

**When** 문서 생성이 완료되면

**Then**
- `generationHistory` 항목에 `tokens` 필드가 포함됨
- `tokens.input`: 입력 토큰 수
- `tokens.output`: 출력 토큰 수

**Given** 토큰 정보를 제공하지 않는 Provider (예: Claude Code Headless)를 사용 중인 상태

**When** 문서 생성이 완료되면

**Then**
- `generationHistory` 항목에 `tokens` 필드가 없거나 undefined임
- 히스토리 기록은 정상적으로 완료됨

---

### AC-MH-009: 히스토리 정렬

**Given** Task에 여러 generationHistory 항목이 있는 상태

**When** Task 상세 모달에서 히스토리를 확인하면

**Then**
- 가장 최근 항목이 맨 위에 표시됨
- 시간순으로 정렬됨 (최신 → 오래된 순)

---

### AC-MH-010: 다른 Provider 사용 기록

**Given** 프로젝트에서 Design Doc은 OpenAI, PRD는 Gemini를 사용하도록 설정된 상태

**When** 각각 Design Doc과 PRD를 생성하면

**Then**
- Design Doc 히스토리 항목: `provider: 'openai'`
- PRD 히스토리 항목: `provider: 'gemini'`
- 각각 올바른 model 이름이 기록됨

---

## Edge Cases

### EC-MH-001: 히스토리 저장 실패

**Given** 문서 생성은 성공했지만 히스토리 저장에 실패한 경우

**Expected Behavior**:
- 문서 생성 자체는 성공으로 응답됨
- 사용자에게 오류 메시지가 표시되지 않음
- 서버 로그에만 에러가 기록됨
- 히스토리가 누락될 수 있음 (허용 가능한 부작용)

### EC-MH-002: 동시 생성 요청

**Given** 같은 Task에 대해 동시에 여러 생성 요청이 들어온 경우

**Expected Behavior**:
- 각 생성 요청이 독립적으로 히스토리에 기록됨
- 데이터 충돌이 발생하지 않음 (파일 잠금 또는 순차 처리)

### EC-MH-003: 매우 긴 피드백

**Given** 사용자가 1000자 이상의 수정 피드백을 입력한 경우

**Expected Behavior**:
- 피드백이 완전히 저장됨 (truncate 하지 않음)
- UI에서는 적절히 truncate하여 표시

---

## 성능 기준

| 항목 | 기준 |
|------|------|
| 히스토리 기록 추가 시간 | < 100ms |
| 히스토리 100개 로드 시간 | < 500ms |
| 모달 렌더링 시간 | < 200ms |

---

## 검증 체크리스트

### Backend 검증

- [ ] `GenerationHistoryEntry` 타입이 정의됨
- [ ] `Task` 인터페이스에 `generationHistory` 필드가 추가됨
- [ ] `addGenerationHistoryEntry()` 함수가 구현됨
- [ ] `/api/generate/design-document`에서 히스토리 기록됨
- [ ] `/api/generate/prd`에서 히스토리 기록됨
- [ ] `/api/generate/prototype`에서 히스토리 기록됨
- [ ] 수정 엔드포인트에서 히스토리 기록됨
- [ ] `/api/tasks/:id/trigger-ai`에서 히스토리 기록됨

### Frontend 검증

- [ ] `ModelHistoryList` 컴포넌트가 생성됨
- [ ] `TaskEditModal`에 히스토리 섹션이 추가됨
- [ ] 빈 상태가 올바르게 표시됨
- [ ] 히스토리 목록이 시간역순으로 정렬됨
- [ ] Provider/Model 정보가 올바르게 표시됨

### 호환성 검증

- [ ] 기존 Task 로드 시 오류 없음
- [ ] 기존 Task에 새 히스토리 추가 가능
- [ ] 모든 LLM Provider에서 동작 확인
