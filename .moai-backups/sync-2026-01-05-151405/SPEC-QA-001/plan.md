---
id: SPEC-QA-001
version: "1.0.0"
status: "draft"
created: "2026-01-05"
updated: "2026-01-05"
author: "MoAI-ADK"
priority: "high"
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-05 | MoAI-ADK | Initial plan creation |

---

# SPEC-QA-001: 구현 계획 (Implementation Plan)

## 1. 구현 개요

### 1.1 목표

Form-based Q&A 시스템을 구현하여 사용자가 구조화된 질문에 답변하면 AI가 설계 문서 초안을 생성하는 워크플로우를 완성합니다.

### 1.2 성공 기준

- Q&A 폼 모달이 정상 동작
- 3개 카테고리별 질문 전환 가능
- 응답 완료 시 AI 설계 문서 생성 트리거
- 진행 상태 저장 및 복원

---

## 2. 마일스톤

### Phase 1: Backend Foundation (Primary Goal)

**목표**: 질문 템플릿 JSON 구조 설계 및 API 구현

**작업 항목**:

1. 질문 템플릿 JSON 파일 생성
   - workspace/templates/questions/game_mechanic.json
   - workspace/templates/questions/economy.json
   - workspace/templates/questions/growth.json

2. 질문 로더 유틸리티 구현
   - server/utils/questionLoader.ts

3. Q&A API 라우트 구현
   - GET /api/questions/:category
   - POST /api/tasks/:taskId/qa
   - GET /api/tasks/:taskId/qa

**산출물**:
- 질문 템플릿 JSON 파일 3개
- questionLoader.ts
- server/routes/qa.ts

**검증 방법**:
- API 엔드포인트 테스트 (Postman 또는 curl)
- 질문 로드 확인

---

### Phase 2: Frontend Foundation (Primary Goal)

**목표**: 프론트엔드 상태 관리 및 API 서비스 구현

**작업 항목**:

1. Q&A 타입 정의
   - src/types/qa.ts

2. Q&A 서비스 구현
   - src/services/qaService.ts

3. Q&A Zustand Store 구현
   - src/store/qaStore.ts

**산출물**:
- src/types/qa.ts
- src/services/qaService.ts
- src/store/qaStore.ts

**검증 방법**:
- 단위 테스트
- Store 액션 동작 확인

---

### Phase 3: UI Components (Primary Goal)

**목표**: Q&A 폼 모달 및 관련 컴포넌트 구현

**작업 항목**:

1. CategorySelector 컴포넌트
   - src/components/document/CategorySelector.tsx

2. QuestionStep 컴포넌트
   - src/components/document/QuestionStep.tsx

3. ProgressIndicator 컴포넌트
   - src/components/document/ProgressIndicator.tsx

4. QAFormModal 메인 컴포넌트
   - src/components/document/QAFormModal.tsx

**산출물**:
- CategorySelector.tsx
- QuestionStep.tsx
- ProgressIndicator.tsx
- QAFormModal.tsx

**검증 방법**:
- 컴포넌트 렌더링 테스트
- 사용자 인터랙션 테스트

---

### Phase 4: Integration (Secondary Goal)

**목표**: 칸반 보드 드래그 이벤트와 Q&A 폼 연동

**작업 항목**:

1. KanbanBoard에서 드래그 이벤트 핸들링 수정
   - Feature List -> Design 이동 시 Q&A 모달 트리거

2. AI 설계 문서 생성 트리거 연동
   - POST /api/tasks/:taskId/generate-design 연동
   - claudeCodeService.ts 활용

3. 생성 상태 UI 표시
   - 카드에 로딩 상태 표시
   - 완료/실패 토스트 알림

**산출물**:
- KanbanBoard.tsx 수정
- generate.ts 라우트 확장

**검증 방법**:
- 드래그 앤 드롭 테스트
- AI 생성 트리거 테스트

---

### Phase 5: Polish (Optional Goal)

**목표**: 안정성 향상 및 사용자 경험 개선

**작업 항목**:

1. 에러 핸들링 강화
   - 네트워크 오류 시 로컬 저장
   - 재시도 메커니즘

2. 임시 저장 기능
   - 브라우저 로컬 스토리지 활용

3. 애니메이션 및 전환 효과
   - 단계 전환 애니메이션
   - 모달 오픈/클로즈 애니메이션

4. 접근성 개선
   - ARIA 레이블 적용
   - 키보드 네비게이션

**산출물**:
- 개선된 컴포넌트들

**검증 방법**:
- 오프라인 시나리오 테스트
- 접근성 테스트

---

## 3. 기술적 접근

### 3.1 아키텍처 설계

```
Frontend (React)
├── QAFormModal (메인 컨테이너)
│   ├── CategorySelector (카테고리 선택)
│   ├── ProgressIndicator (진행 상태)
│   └── QuestionStep (질문 단계)
│
├── qaStore (Zustand)
│   └── 세션 상태, 응답 관리
│
└── qaService (API 호출)
    └── REST API 통신

Backend (Express)
├── /api/questions/:category
│   └── questionLoader.ts (JSON 로드)
│
├── /api/tasks/:taskId/qa
│   └── Q&A 응답 CRUD
│
└── /api/tasks/:taskId/generate-design
    └── claudeCodeRunner.ts (AI 트리거)

Storage
├── workspace/templates/questions/
│   └── JSON 질문 템플릿
│
└── workspace/projects/{projectId}/tasks/{taskId}/
    └── qa.json (응답 저장)
```

### 3.2 데이터 흐름

1. **Q&A 시작**
   - 사용자가 태스크를 Design 컬럼으로 드래그
   - QAFormModal 오픈
   - 기본 카테고리(game_mechanic) 질문 로드

2. **질문 응답**
   - 사용자가 질문에 답변
   - 로컬 상태 업데이트 (qaStore)
   - 단계 진행

3. **Q&A 완료**
   - 모든 필수 질문 응답 완료
   - 서버에 응답 저장 (POST /api/tasks/:taskId/qa)
   - AI 설계 문서 생성 트리거

4. **AI 생성**
   - Claude Code Headless 모드 실행
   - 설계 문서 생성 및 저장
   - 태스크 상태 업데이트

### 3.3 상태 관리 전략

```typescript
// qaStore 상태 구조
{
  currentSession: {
    taskId: string,
    category: QACategory,
    currentStep: number,
    answers: QAAnswer[],
    isCompleted: boolean
  },
  questions: Question[],
  isLoading: boolean,
  error: string | null
}

// 주요 액션
- startSession(): 새 세션 시작
- loadQuestions(): 카테고리별 질문 로드
- setAnswer(): 응답 저장
- nextStep() / prevStep(): 단계 이동
- completeSession(): 완료 및 AI 트리거
- resetSession(): 세션 초기화
```

---

## 4. 컴포넌트 목록 및 역할

| 컴포넌트 | 역할 | 의존성 |
|----------|------|--------|
| QAFormModal | Q&A 폼 메인 컨테이너, 모달 관리 | CategorySelector, QuestionStep, ProgressIndicator, qaStore |
| CategorySelector | 카테고리 선택 UI, 탭 또는 버튼 그룹 | - |
| QuestionStep | 개별 질문 표시 및 응답 입력 | - |
| ProgressIndicator | 진행 상태 시각화 | - |
| qaStore | Q&A 세션 상태 관리 | qaService |
| qaService | API 통신 레이어 | - |

---

## 5. 테스트 전략

### 5.1 단위 테스트

- qaStore 액션 테스트
- qaService API 호출 테스트
- 컴포넌트 렌더링 테스트

### 5.2 통합 테스트

- Q&A 전체 플로우 테스트 (시작 -> 응답 -> 완료)
- 카테고리 전환 테스트
- AI 생성 트리거 테스트

### 5.3 E2E 테스트

- 칸반 드래그 -> Q&A 모달 -> AI 생성 -> 문서 확인

---

## 6. 위험 요소 및 대응 방안

### 6.1 기술적 위험

| 위험 | 확률 | 영향도 | 대응 방안 |
|------|------|--------|-----------|
| 질문 템플릿 로드 실패 | Low | High | 하드코딩된 폴백 질문 제공 |
| AI 생성 타임아웃 | Medium | High | 120초 타임아웃, 재시도 버튼 제공 |
| 네트워크 오류로 응답 손실 | Medium | High | 로컬 스토리지 임시 저장 |
| 카테고리 변경 시 데이터 손실 | Low | Medium | 확인 다이얼로그로 사용자 경고 |

### 6.2 비즈니스 위험

| 위험 | 확률 | 영향도 | 대응 방안 |
|------|------|--------|-----------|
| 질문이 기획 의도 파악에 부적합 | Medium | High | 질문 템플릿 반복 개선, 피드백 수집 |
| AI 생성 품질 불만족 | Medium | Medium | 수정 요청 기능 (SPEC-DOCUMENT-001) |

---

## 7. 작업 순서

```
[Phase 1: Backend Foundation]
├── 1.1 질문 템플릿 JSON 생성
├── 1.2 questionLoader.ts 구현
└── 1.3 /api/questions 라우트 구현

[Phase 2: Frontend Foundation]
├── 2.1 Q&A 타입 정의
├── 2.2 qaService.ts 구현
└── 2.3 qaStore.ts 구현

[Phase 3: UI Components]
├── 3.1 CategorySelector 구현
├── 3.2 ProgressIndicator 구현
├── 3.3 QuestionStep 구현
└── 3.4 QAFormModal 통합

[Phase 4: Integration]
├── 4.1 칸반 드래그 이벤트 연동
├── 4.2 AI 생성 트리거 연동
└── 4.3 생성 상태 UI 구현

[Phase 5: Polish]
├── 5.1 에러 핸들링
├── 5.2 임시 저장 기능
└── 5.3 접근성 및 애니메이션
```

---

## 8. 추적성

| 항목 | 참조 |
|------|------|
| SPEC 참조 | SPEC-QA-001 |
| 의존 SPEC | SPEC-TASK-001, SPEC-SYSTEM-001 |
| 후속 SPEC | SPEC-DOCUMENT-001 |
| acceptance.md | /Users/mimir/Apps/DesignWorkflow/.moai/specs/SPEC-QA-001/acceptance.md |
