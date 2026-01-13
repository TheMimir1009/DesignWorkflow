---
id: SPEC-QA-001
<<<<<<< HEAD
version: "1.0.0"
status: "completed"
created: "2026-01-04"
updated: "2026-01-05"
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
=======
version: "1.1.0"
status: "completed"
created: "2026-01-05"
updated: "2026-01-05"
author: "MoAI-ADK"
priority: "high"
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-05 | MoAI-ADK | Initial SPEC creation |
| 1.1.0 | 2026-01-05 | MoAI-ADK | Implementation completed, status updated to completed |

---

# SPEC-QA-001: Form-based Q&A System (폼 기반 Q&A 시스템)

## 1. 개요 (Overview)

### 1.1 설명

설계 문서 생성 전 구조화된 질문을 통해 기획 의도를 수집하는 시스템입니다. 사용자가 카테고리별 핵심 질문에 답변하면 AI가 해당 응답을 기반으로 설계 문서 초안을 자동 생성합니다.

### 1.2 사용자 스토리

"기획자로서, 3개의 핵심 질문에 답변하면 AI가 설계 문서 초안을 생성해주길 원합니다. 이를 통해 기획 의도가 명확하게 전달되고, 일관된 형식의 설계 문서를 빠르게 얻을 수 있습니다."

### 1.3 기능 요구사항 요약

- 기본 카테고리: Game Mechanic (3개 질문)
- 선택 카테고리: Economy, Growth (변경 가능)
- 질문 목록 JSON으로 관리
- 답변 완료 시 AI 설계 문서 생성 트리거

### 1.4 의존성

| SPEC ID | 제목 | 상태 |
|---------|------|------|
| SPEC-TASK-001 | Task Management UI | Completed |
| SPEC-SYSTEM-001 | System Document Management | Completed |

---

## 2. 환경 (Environment)

### 2.1 기술 스택

**프론트엔드**:
- React 18.x
- TypeScript 5.x
- Tailwind CSS 3.x
- Zustand (상태 관리)

**백엔드**:
- Node.js 20.x LTS
- Express 4.x
- TypeScript 5.x

**AI 엔진**:
- Claude Code (Headless Mode)

### 2.2 디렉토리 구조

```
src/
  components/document/
    QAFormModal.tsx          # Q&A 폼 모달
    CategorySelector.tsx     # 카테고리 선택 컴포넌트
    QuestionStep.tsx         # 질문 단계 컴포넌트
    ProgressIndicator.tsx    # 진행 상태 표시
  store/
    qaStore.ts               # Q&A 상태 관리
  services/
    qaService.ts             # Q&A API 서비스
  types/
    qa.ts                    # Q&A 관련 타입

server/
  routes/
    qa.ts                    # Q&A API 라우트
  utils/
    questionLoader.ts        # 질문 템플릿 로더

workspace/
  templates/questions/
    game_mechanic.json       # 게임 메카닉 질문
    economy.json             # 경제 질문
    growth.json              # 성장 질문
```

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [HIGH] SPEC-TASK-001의 태스크 관리 시스템이 완전히 구현되어 있음
  - 신뢰도: High
  - 근거: SPEC-TASK-001 상태가 Completed
  - 검증 방법: Task 타입의 qaAnswers 필드 존재 확인

- [HIGH] 칸반 카드에서 Q&A 폼을 트리거할 수 있는 진입점이 존재함
  - 신뢰도: High
  - 근거: 태스크가 Feature List 단계에서 Design 단계로 이동 시 트리거
  - 검증 방법: KanbanCard 컴포넌트에서 상태 변경 이벤트 확인

- [MEDIUM] 질문 템플릿 JSON 파일이 workspace/templates/questions/에 위치함
  - 신뢰도: Medium
  - 근거: structure.md에 정의됨
  - 오류 시 대응: 기본 질문 템플릿 하드코딩 폴백

### 3.2 비즈니스 가정

- [HIGH] 기본 카테고리는 Game Mechanic이며 3개 질문으로 구성됨
  - 신뢰도: High
  - 근거: product.md Feature 6 요구사항

- [MEDIUM] 카테고리 변경 시 기존 응답이 초기화됨
  - 신뢰도: Medium
  - 근거: 카테고리별 질문이 다르므로 논리적 귀결
  - 오류 시 영향: 사용자 혼란 가능, 확인 다이얼로그 필요

- [HIGH] Q&A 완료 시 자동으로 AI 설계 문서 생성이 트리거됨
  - 신뢰도: High
  - 근거: product.md "AI design document generation trigger on answer completion"

---

## 4. 요구사항 (Requirements)

### 4.1 보편적 요구사항 (Ubiquitous Requirements)

시스템은 **항상** 다음을 수행해야 한다:

- 시스템은 **항상** 모달 상단에 카테고리 선택 영역을 표시해야 한다
- 시스템은 **항상** 현재 진행 단계를 시각적으로 표시해야 한다 (예: 1/3, 2/3, 3/3)
- 시스템은 **항상** 이전/다음 버튼과 완료 버튼을 표시해야 한다
- 시스템은 **항상** 질문 텍스트와 입력 필드를 명확히 구분해야 한다
- 시스템은 **항상** 3개 카테고리 옵션을 표시해야 한다 (Game Mechanic, Economy, Growth)
- 시스템은 **항상** 선택된 카테고리를 시각적으로 강조해야 한다
- 시스템은 **항상** 기본값으로 Game Mechanic을 선택해야 한다

### 4.2 이벤트 기반 요구사항 (Event-Driven Requirements)

**WHEN** 태스크가 Feature List에서 Design 컬럼으로 드래그되면 **THEN** Q&A 폼 모달이 열린다

**WHEN** 사용자가 카테고리를 변경하면 **THEN** 해당 카테고리의 질문 목록이 로드된다

**WHEN** 사용자가 응답을 입력하면 **THEN** 로컬 상태에 즉시 반영된다

**WHEN** 사용자가 "다음" 버튼을 클릭하면 **THEN** 다음 질문으로 이동한다

**WHEN** 사용자가 "이전" 버튼을 클릭하면 **THEN** 이전 질문으로 돌아간다

**WHEN** 마지막 질문에서 "완료" 버튼을 클릭하면 **THEN** 모든 응답이 저장되고 AI 생성이 트리거된다

**WHEN** 사용자가 모달을 닫으려 하면 **THEN** "작성 중인 내용이 사라집니다" 확인을 요청한다

**WHEN** 카테고리를 변경하려 하면 **THEN** "기존 응답이 초기화됩니다" 확인을 요청한다

**WHEN** 모든 필수 질문에 응답하고 "완료" 버튼을 클릭하면 **THEN** 응답이 서버에 저장된다

**WHEN** 응답 저장이 성공하면 **THEN** AI 설계 문서 생성이 트리거된다

**WHEN** AI 생성이 시작되면 **THEN** 모달이 닫히고 로딩 상태가 카드에 표시된다

**WHEN** AI 생성이 완료되면 **THEN** 태스크 상태가 Design으로 변경되고 문서가 저장된다

**WHEN** AI 생성이 실패하면 **THEN** 에러 토스트가 표시되고 재시도 옵션이 제공된다

### 4.3 원치 않는 동작 요구사항 (Unwanted Behavior Requirements)

시스템은 필수 질문 응답 없이 Q&A를 완료**하지 않아야 한다**

시스템은 사용자 확인 없이 작성 중인 응답을 삭제**하지 않아야 한다**

시스템은 네트워크 오류 시 응답 데이터를 손실**하지 않아야 한다** (로컬 임시 저장 필수)

### 4.4 상태 기반 요구사항 (State-Driven Requirements)

**IF** 필수 질문에 응답이 없으면 **THEN** "다음" 또는 "완료" 버튼을 비활성화한다

**IF** 첫 번째 질문이면 **THEN** "이전" 버튼을 비활성화한다

**IF** 마지막 질문이면 **THEN** "다음" 버튼 대신 "완료" 버튼을 표시한다

**IF** AI 생성이 진행 중이면 **THEN** 로딩 상태와 진행 메시지를 표시한다

**IF** 질문 템플릿 로드에 실패하면 **THEN** 기본 질문 세트를 사용한다

**IF** 이미 응답이 작성된 상태에서 카테고리를 변경하려 하면 **THEN** 확인 다이얼로그를 표시한다

**IF** 입력 타입이 textarea이면 **THEN** 멀티라인 입력 필드를 표시한다

**IF** 입력 타입이 select이면 **THEN** 드롭다운 옵션을 표시한다

**IF** maxLength가 설정되면 **THEN** 현재/최대 글자 수를 표시한다

**IF** 네트워크 오류가 발생하면 **THEN** 로컬에 응답을 임시 저장하고 재시도 안내를 표시한다

### 4.5 선택적 기능 요구사항 (Optional Feature Requirements)

**가능하면** 이전 세션의 임시 저장 기능을 제공한다

**가능하면** 질문에 대한 도움말 툴팁을 제공한다

**가능하면** 질문 단계 클릭 시 해당 단계로 직접 이동 기능을 제공한다

---

## 5. 명세 (Specifications)

### 5.1 타입 정의

```typescript
// Q&A 카테고리 타입
export type QACategory = 'game_mechanic' | 'economy' | 'growth';

// 질문 템플릿 구조
export interface QuestionTemplate {
  id: string;
  category: QACategory;
  version: string;
  questions: Question[];
}

export interface Question {
  id: string;
  order: number;
  text: string;
  description?: string;
  inputType: 'text' | 'textarea' | 'select';
  options?: string[];
  required: boolean;
  placeholder?: string;
  maxLength?: number;
}

// Q&A 세션 상태
export interface QASession {
  taskId: string;
  category: QACategory;
  currentStep: number;
  answers: QAAnswer[];
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

// Q&A 응답
export interface QAAnswer {
  questionId: string;
  question: string;
  answer: string;
  answeredAt: string;
}

// Q&A 완료 응답
export interface QACompletionResult {
  taskId: string;
  answers: QAAnswer[];
  documentGenerationTriggered: boolean;
}
```

### 5.2 컴포넌트 명세

#### QAFormModal.tsx

```typescript
interface QAFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onComplete: (result: QACompletionResult) => void;
  initialCategory?: QACategory;
}
```

#### CategorySelector.tsx

```typescript
interface CategorySelectorProps {
  selected: QACategory;
  onChange: (category: QACategory) => void;
  disabled?: boolean;
}
```

#### QuestionStep.tsx

```typescript
interface QuestionStepProps {
  question: Question;
  answer: string;
  onChange: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  isValid: boolean;
}
```

#### ProgressIndicator.tsx

```typescript
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}
```

### 5.3 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/questions/:category | 카테고리별 질문 조회 | - | ApiResponse<QuestionTemplate> |
| POST | /api/tasks/:taskId/qa | Q&A 응답 저장 | SaveQADto | ApiResponse<QASession> |
| POST | /api/tasks/:taskId/generate-design | AI 설계 문서 생성 트리거 | GenerateDesignDto | ApiResponse<GenerationStatus> |
| GET | /api/tasks/:taskId/qa | 기존 Q&A 응답 조회 | - | ApiResponse<QASession> |

### 5.4 비기능 요구사항

#### NFR-001: 성능

- 모달 오픈: 200ms 이내
- 질문 템플릿 로드: 500ms 이내
- 단계 전환 애니메이션: 300ms 이내
- 응답 저장 API: 2초 이내 응답 (AI 생성 트리거 제외)

#### NFR-002: 사용성

- 모달은 화면 중앙에 표시 (최소 너비 500px, 최대 너비 640px)
- 진행 상태가 명확하게 표시됨
- 키보드 네비게이션 지원 (Tab, Enter, Escape)
- 모바일 반응형 지원

#### NFR-003: 접근성

- ARIA 레이블 적용 (role="dialog", aria-modal="true")
- 포커스 트랩 구현
- 스크린 리더 호환성 확보
- 색상 대비 WCAG AA 준수

#### NFR-004: 안정성

- 질문 템플릿 로드 실패 시 폴백 질문 제공
- 네트워크 오류 시 로컬 임시 저장
- AI 생성 타임아웃 120초

---

## 6. 추적성 (Traceability)

### 6.1 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| QAFormModal | src/components/document/QAFormModal.tsx | expert-frontend |
| CategorySelector | src/components/document/CategorySelector.tsx | expert-frontend |
| QuestionStep | src/components/document/QuestionStep.tsx | expert-frontend |
| ProgressIndicator | src/components/document/ProgressIndicator.tsx | expert-frontend |
| qaStore | src/store/qaStore.ts | expert-frontend |
| qaService | src/services/qaService.ts | expert-frontend |
| qa route | server/routes/qa.ts | expert-backend |
| questionLoader | server/utils/questionLoader.ts | expert-backend |
| game_mechanic.json | workspace/templates/questions/game_mechanic.json | expert-backend |
| economy.json | workspace/templates/questions/economy.json | expert-backend |
| growth.json | workspace/templates/questions/growth.json | expert-backend |

### 6.2 관련 SPEC

| SPEC ID | 관계 | 상태 |
|---------|------|------|
| SPEC-TASK-001 | 의존성 | Completed |
| SPEC-SYSTEM-001 | 의존성 | Completed |
| SPEC-DOCUMENT-001 | 후속 | Planned |
| SPEC-ARCHIVE-001 | 후속 | Planned |

---

## 7. 제약사항 (Constraints)

### 7.1 기술적 제약

- 기존 taskStore.ts의 Task 타입 확장하여 사용
- Zustand 상태 관리 패턴 준수
- Tailwind CSS 유틸리티 클래스 사용
- Express 서버를 통한 API 통신

### 7.2 데이터 제약

- 질문 템플릿은 JSON 파일로 관리
- 카테고리당 최대 5개 질문
- 응답 텍스트 최대 길이: 2000자
- 질문 템플릿 버전 관리 필수

### 7.3 UI 제약

- 모달 최소 너비: 500px
- 질문 텍스트 최대 200자
- 진행 표시는 단계 또는 프로그레스 바 중 선택
>>>>>>> main
