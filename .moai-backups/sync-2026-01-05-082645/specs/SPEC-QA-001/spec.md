---
id: SPEC-QA-001
version: "1.0.0"
status: "draft"
created: "2026-01-04"
updated: "2026-01-04"
author: "Claude Code"
priority: "high"
---

# SPEC-QA-001: 폼 기반 Q&A 시스템

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-04 | Claude Code | 최초 작성 |

## 개요

폼 기반 Q&A 시스템은 디자인 워크플로우 내에서 구조화된 질문-답변 세션을 관리하는 기능입니다. 사용자가 JSON 템플릿에 정의된 질문에 체계적으로 답변하고, 카테고리별로 질문을 관리하며, 답변 결과를 저장하고 활용할 수 있습니다.

## 의존성

- **SPEC-TASK-001**: 태스크 관리 시스템 (Q&A 세션과 태스크 연동)
- **SPEC-TEMPLATE-001**: 템플릿 시스템 (질문 템플릿 정의 및 파싱)

---

## Environment (환경)

### 기술 스택

- **프론트엔드**: React 19, TypeScript 5.9, Zustand (상태 관리)
- **백엔드**: Next.js 16 App Router, Server Actions
- **UI 컴포넌트**: HeroUI (NextUI 기반)
- **데이터 저장**: 로컬 JSON 파일 기반

### 시스템 환경

- Node.js 20.x 이상
- pnpm 패키지 매니저
- 모던 브라우저 (Chrome, Firefox, Safari, Edge 최신 버전)

---

## Assumptions (가정)

### 기술적 가정

- SPEC-TEMPLATE-001의 템플릿 파싱 시스템이 완료되어 있음
- SPEC-TASK-001의 태스크 관리 시스템과 연동 가능함
- 질문 템플릿은 JSON 형식으로 정의됨

### 비즈니스 가정

- 사용자는 한 번에 하나의 Q&A 세션만 진행함
- 질문은 카테고리별로 그룹화됨
- 답변은 세션 종료 전까지 임시 저장됨

---

## Requirements (요구사항)

### Ubiquitous (항상 적용) 요구사항

- **REQ-U-001**: 시스템은 **항상** 모든 사용자 입력에 대해 유효성 검사를 수행해야 한다
- **REQ-U-002**: 시스템은 **항상** Q&A 세션 상태를 로컬 스토리지에 자동 저장해야 한다
- **REQ-U-003**: 시스템은 **항상** 오류 발생 시 사용자에게 명확한 피드백을 제공해야 한다

### Event-Driven (이벤트 기반) 요구사항

- **REQ-E-001**: **WHEN** 사용자가 Q&A 세션 시작 버튼을 클릭 **THEN** 시스템은 QAFormModal을 표시해야 한다
- **REQ-E-002**: **WHEN** 사용자가 질문에 답변을 입력 **THEN** 시스템은 해당 답변을 임시 저장해야 한다
- **REQ-E-003**: **WHEN** 사용자가 카테고리를 선택 **THEN** 시스템은 해당 카테고리의 질문만 필터링하여 표시해야 한다
- **REQ-E-004**: **WHEN** 사용자가 세션 완료 버튼을 클릭 **THEN** 시스템은 모든 답변을 저장하고 세션을 종료해야 한다
- **REQ-E-005**: **WHEN** API 요청 실패 **THEN** 시스템은 재시도 옵션과 함께 오류 메시지를 표시해야 한다

### State-Driven (상태 기반) 요구사항

- **REQ-S-001**: **IF** Q&A 세션이 진행 중 **THEN** 시스템은 진행률 표시기를 표시해야 한다
- **REQ-S-002**: **IF** 필수 질문에 답변이 누락됨 **THEN** 시스템은 세션 완료 버튼을 비활성화해야 한다
- **REQ-S-003**: **IF** 이전 세션 데이터가 존재 **THEN** 시스템은 세션 복구 옵션을 제공해야 한다

### Unwanted (금지) 요구사항

- **REQ-N-001**: 시스템은 사용자 확인 없이 세션 데이터를 **삭제하지 않아야 한다**
- **REQ-N-002**: 시스템은 유효성 검사 실패 시 폼을 **제출하지 않아야 한다**
- **REQ-N-003**: 시스템은 API 호출 중 중복 요청을 **보내지 않아야 한다**

### Optional (선택적) 요구사항

- **REQ-O-001**: **가능하면** 시스템은 키보드 단축키를 통한 빠른 탐색 기능을 제공해야 한다
- **REQ-O-002**: **가능하면** 시스템은 답변 자동 완성 기능을 제공해야 한다
- **REQ-O-003**: **가능하면** 시스템은 답변 히스토리 비교 기능을 제공해야 한다

---

## Specifications (명세)

### 컴포넌트 구조

#### QAFormModal

모달 형태의 Q&A 폼 컨테이너 컴포넌트

- Props: `isOpen`, `onClose`, `templateId`, `sessionId?`
- 기능: 모달 표시/숨김, 세션 관리, 진행률 표시

#### QuestionList

질문 목록을 표시하는 컨테이너 컴포넌트

- Props: `questions`, `answers`, `onAnswerChange`, `selectedCategory?`
- 기능: 질문 목록 렌더링, 카테고리 필터링, 스크롤 관리

#### QuestionItem

개별 질문을 표시하는 컴포넌트

- Props: `question`, `answer`, `onAnswerChange`, `isRequired`
- 기능: 질문 표시, 입력 필드 렌더링, 유효성 검사 표시

#### CategorySelector

카테고리 선택 컴포넌트

- Props: `categories`, `selectedCategory`, `onCategoryChange`
- 기능: 카테고리 탭/드롭다운 표시, 필터링

### 데이터 모델

#### Question 인터페이스

```typescript
interface Question {
  id: string;
  text: string;
  category: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox';
  options?: string[];
  required: boolean;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}
```

#### QASession 인터페이스

```typescript
interface QASession {
  id: string;
  templateId: string;
  status: 'draft' | 'in_progress' | 'completed';
  answers: Record<string, string | string[]>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### API 엔드포인트

#### GET /api/questions

질문 템플릿 목록 조회

- Query Parameters: `templateId`, `category?`
- Response: `Question[]`

#### POST /api/qa-sessions

새 Q&A 세션 생성

- Body: `{ templateId: string }`
- Response: `QASession`

#### PUT /api/qa-sessions/[id]

Q&A 세션 업데이트

- Body: `{ answers: Record<string, any>, status?: string }`
- Response: `QASession`

#### GET /api/qa-sessions/[id]

Q&A 세션 조회

- Response: `QASession`

### 상태 관리 (qaStore)

```typescript
interface QAStore {
  // 상태
  currentSession: QASession | null;
  questions: Question[];
  isLoading: boolean;
  error: string | null;

  // 액션
  startSession: (templateId: string) => Promise<void>;
  updateAnswer: (questionId: string, answer: string | string[]) => void;
  completeSession: () => Promise<void>;
  recoverSession: (sessionId: string) => Promise<void>;
  clearSession: () => void;
}
```

---

## Traceability (추적성)

| 요구사항 ID | 구현 컴포넌트 | 테스트 시나리오 |
|-------------|--------------|-----------------|
| REQ-E-001 | QAFormModal | TC-001 |
| REQ-E-002 | QuestionItem, qaStore | TC-002 |
| REQ-E-003 | CategorySelector, QuestionList | TC-003 |
| REQ-E-004 | QAFormModal, qaStore | TC-004 |
| REQ-S-001 | QAFormModal | TC-005 |
| REQ-S-002 | QAFormModal | TC-006 |
| REQ-U-001 | QuestionItem | TC-007 |
| REQ-U-002 | qaStore | TC-008 |

---

## 관련 문서

- [plan.md](./plan.md) - 구현 계획
- [acceptance.md](./acceptance.md) - 인수 기준
