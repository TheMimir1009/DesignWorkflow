# SPEC-QA-001: Q&A 시스템 (Q&A System)

---
id: SPEC-QA-001
version: 1.0.0
status: Planned
created: 2026-01-15
updated: 2026-01-15
author: workflow-spec
priority: HIGH
---

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2026-01-15 | workflow-spec | 초기 SPEC 작성 |

---

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-QA-001 |
| **제목** | Q&A 시스템 (Q&A System) |
| **상태** | Planned |
| **우선순위** | HIGH |
| **복잡도** | MODERATE-HIGH |
| **생성일** | 2026-01-15 |
| **작성자** | workflow-spec |
| **의존성** | SPEC-INIT-001 (프로젝트 초기화), SPEC-KANBAN-001 (칸반 보드) |
| **관련 문서** | PRD-DesignWorkflow-Implementation-Guide-v2.md Section 4.5 |

---

## 1. Environment (환경)

### 1.1 개발 환경

| 항목 | 요구사항 |
|------|----------|
| **운영체제** | macOS, Linux, Windows (WSL2 권장) |
| **Node.js** | v22.x 이상 |
| **npm** | v10.x 이상 |
| **브라우저** | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |

### 1.2 기술 스택 (Constitution)

| 영역 | 기술 | 버전 | 비고 |
|------|------|------|------|
| **프론트엔드** | React | 19.x | Server Components, use hook 지원 |
| **언어** | TypeScript | 5.9.x | strict 모드 활성화 |
| **빌드 도구** | Vite | 7.x | HMR, ESM 기반 |
| **상태 관리** | Zustand | 5.x | TypeScript 친화적, 경량 |
| **스타일링** | Tailwind CSS | 4.x | JIT 컴파일, 유틸리티 기반 |
| **백엔드** | Express | 5.x | ESM 모드, async 라우터 |
| **LLM** | OpenAI, Gemini, Claude, LM Studio | - | 다중 프로바이더 지원 |

### 1.3 컴포넌트 구조 (목표 상태)

```
src/
├── qa/                        # Q&A 시스템 컴포넌트
│   ├── QAModal.tsx            # Q&A 모달 컨테이너
│   ├── QAQuestion.tsx         # 개별 질문 컴포넌트
│   ├── QAProgressBar.tsx      # 진행 상태 표시
│   └── hooks/
│       └── useQASession.ts    # Q&A 세션 관리 훅
│
├── services/
│   └── qaService.ts           # Q&A API 클라이언트
│
├── store/
│   └── qaStore.ts             # Q&A 상태 관리 (Zustand)
│
└── types/
    └── qa.ts                  # Q&A 관련 타입 정의

server/
├── routes/
│   ├── qa-sessions.ts         # Q&A 세션 API
│   └── questions.ts           # 질문 생성 API
│
├── utils/
│   └── qaStorage.ts           # Q&A 데이터 저장소
│
└── llmProviders/
    ├── openai.ts              # OpenAI 프로바이더
    ├── gemini.ts              # Gemini 프로바이더
    ├── claude.ts              # Claude 프로바이더
    └── lmstudio.ts            # LM Studio 프로바이더
```

---

## 2. Assumptions (가정)

### 2.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 위험 시 영향 | 검증 방법 |
|----|------|--------|------|-------------|----------|
| A1 | SPEC-INIT-001이 완료되어 프로젝트 구조가 존재함 | 높음 | 의존성 SPEC | 컴포넌트 마운트 실패 | `ls src/types/index.ts` |
| A2 | SPEC-KANBAN-001이 완료되어 칸반 보드가 동작함 | 높음 | 의존성 SPEC | 트리거 이벤트 미발생 | 칸반 드래그 테스트 |
| A3 | Express 서버가 포트 3001에서 동작 중 | 높음 | Phase 1 완료 | API 호출 실패 | `curl localhost:3001/api/health` |
| A4 | 최소 1개 이상의 LLM 프로바이더가 설정됨 | 중간 | 사용자 설정 | 질문 생성 불가 | LLM 연결 테스트 |
| A5 | OpenAI API Key가 유효함 (기본 프로바이더) | 중간 | 환경 변수 | AI 질문 생성 실패 | API 연결 테스트 |

### 2.2 비즈니스 가정

| ID | 가정 | 신뢰도 | 근거 |
|----|------|--------|------|
| B1 | Q&A는 Feature List → Design Doc 이동 시에만 트리거됨 | 높음 | PRD 명세 |
| B2 | AI가 생성하는 질문 수는 5-7개로 제한됨 | 높음 | UX 가이드라인 |
| B3 | 질문 카테고리는 5가지로 고정됨 (대상 사용자, 기술 제약, 성공 지표, 의존성, 우선순위) | 높음 | PRD 명세 |
| B4 | 사용자는 Q&A를 건너뛰기(Skip) 할 수 있음 | 중간 | UX 편의성 |
| B5 | Q&A 응답은 후속 문서 생성의 컨텍스트로 활용됨 | 높음 | 핵심 기능 |

---

## 3. Requirements (EARS 형식 요구사항)

### 3.1 Ubiquitous Requirements (항상 적용)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| UR-001 | 시스템은 **항상** Q&A 모달에 진행 상태 표시줄(ProgressBar)을 표시해야 한다 | HIGH |
| UR-002 | 시스템은 **항상** 각 질문에 카테고리 라벨을 표시해야 한다 (대상 사용자, 기술 제약 등) | MEDIUM |
| UR-003 | 시스템은 **항상** 이전/다음 질문 네비게이션 버튼을 제공해야 한다 | HIGH |
| UR-004 | 시스템은 **항상** 현재 질문 번호와 전체 질문 수를 표시해야 한다 (예: 3/7) | MEDIUM |
| UR-005 | 시스템은 **항상** Q&A 응답을 Feature 카드 메타데이터에 저장해야 한다 | HIGH |
| UR-006 | 시스템은 **항상** 설정된 LLM 프로바이더를 사용하여 질문을 생성해야 한다 | HIGH |

### 3.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 | 트리거 이벤트 |
|----|----------|---------------|
| ED-001 | **WHEN** 사용자가 Feature 카드를 Feature List에서 Design Doc 컬럼으로 드래그 **THEN** Q&A 모달을 자동으로 열어야 한다 | onDragEnd (특정 조건) |
| ED-002 | **WHEN** Q&A 모달이 열릴 때 **THEN** LLM API를 호출하여 Feature 설명 기반 질문을 생성해야 한다 | onModalOpen |
| ED-003 | **WHEN** 사용자가 질문에 응답 입력 후 "다음" 클릭 **THEN** 응답을 저장하고 다음 질문을 표시해야 한다 | onNextClick |
| ED-004 | **WHEN** 사용자가 마지막 질문에 응답 후 "완료" 클릭 **THEN** 모든 응답을 저장하고 모달을 닫고 카드를 Design Doc으로 이동해야 한다 | onCompleteClick |
| ED-005 | **WHEN** 사용자가 "건너뛰기" 버튼 클릭 **THEN** Q&A 없이 카드를 Design Doc으로 이동해야 한다 | onSkipClick |
| ED-006 | **WHEN** 사용자가 모달 외부 클릭 또는 ESC 키 입력 **THEN** 확인 다이얼로그를 표시해야 한다 | onOutsideClick, onEscKey |
| ED-007 | **WHEN** LLM 질문 생성 완료 **THEN** 로딩 인디케이터를 숨기고 첫 번째 질문을 표시해야 한다 | onQuestionsGenerated |
| ED-008 | **WHEN** 사용자가 이전 질문으로 이동 **THEN** 이전에 입력한 응답을 복원하여 표시해야 한다 | onPreviousClick |

### 3.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 | 조건 상태 |
|----|----------|----------|
| SD-001 | **IF** LLM 질문 생성 중 **THEN** 로딩 스피너와 "AI가 질문을 생성하고 있습니다..." 메시지를 표시해야 한다 | isGenerating === true |
| SD-002 | **IF** LLM 연결 실패 **THEN** 에러 메시지와 "기본 질문 사용" 옵션을 표시해야 한다 | llmError !== null |
| SD-003 | **IF** 현재 질문이 첫 번째 **THEN** "이전" 버튼을 비활성화해야 한다 | currentIndex === 0 |
| SD-004 | **IF** 현재 질문이 마지막 **THEN** "다음" 버튼 대신 "완료" 버튼을 표시해야 한다 | currentIndex === questions.length - 1 |
| SD-005 | **IF** 현재 질문의 응답이 비어있음 **THEN** "다음" 버튼을 비활성화해야 한다 (필수 질문) | answer.trim() === '' && question.required |
| SD-006 | **IF** Q&A 세션이 이미 완료됨 **THEN** 동일 Feature의 Q&A 재시작 확인 다이얼로그를 표시해야 한다 | task.qaAnswers.length > 0 |
| SD-007 | **IF** 오프라인 모드 (LM Studio) **THEN** 로컬 LLM 서버 연결 상태를 표시해야 한다 | provider === 'lmstudio' |

### 3.4 Unwanted Behavior Requirements (비정상 상황)

| ID | 요구사항 | 금지 동작 |
|----|----------|----------|
| UW-001 | 시스템은 Q&A 완료 전에 카드를 Design Doc 컬럼으로 **이동시키지 않아야 한다** | 사전 이동 금지 |
| UW-002 | 시스템은 LLM API Key를 클라이언트에 **노출하지 않아야 한다** | API Key 노출 금지 |
| UW-003 | 시스템은 사용자 응답 데이터를 **외부 서버로 전송하지 않아야 한다** (LLM API 제외) | 데이터 유출 금지 |
| UW-004 | 시스템은 Q&A 도중 사용자 입력을 **자동 저장 없이 손실하지 않아야 한다** | 데이터 손실 금지 |
| UW-005 | 시스템은 7개를 **초과하는 질문을 생성하지 않아야 한다** | 과다 질문 금지 |
| UW-006 | 시스템은 중복된 카테고리의 질문을 **연속으로 표시하지 않아야 한다** | 중복 카테고리 금지 |

### 3.5 Optional Feature Requirements (선택 기능)

| ID | 요구사항 | 조건 |
|----|----------|------|
| OF-001 | **가능하면** 질문 응답에 자동 완성 제안을 제공 (이전 프로젝트 데이터 기반) | 히스토리 데이터 존재 |
| OF-002 | **가능하면** 음성 입력(Speech-to-Text)을 지원 | Web Speech API 지원 브라우저 |
| OF-003 | **가능하면** 질문별 도움말 툴팁을 제공 | 도움말 콘텐츠 정의 |
| OF-004 | **가능하면** 키보드 단축키(Ctrl+Enter: 다음, Ctrl+Shift+Enter: 완료)를 지원 | 키보드 이벤트 |
| OF-005 | **가능하면** Q&A 응답 내보내기(JSON/Markdown) 기능을 제공 | 내보내기 버튼 |

### 3.6 Complex Requirements (복합 조건)

| ID | 요구사항 | 상태 + 이벤트 |
|----|----------|---------------|
| CR-001 | **IF** LLM 프로바이더가 LM Studio **AND WHEN** 로컬 서버 연결 실패 **THEN** 자동으로 OpenAI 폴백을 시도하고 사용자에게 알려야 한다 | provider === 'lmstudio' && connectionFailed |
| CR-002 | **IF** Q&A 세션이 진행 중 **AND WHEN** 브라우저 탭 닫기/새로고침 **THEN** 현재까지의 응답을 localStorage에 임시 저장해야 한다 | sessionActive && beforeunload |
| CR-003 | **IF** 동일 Feature에 기존 Q&A 데이터 존재 **AND WHEN** Q&A 모달 열기 **THEN** 기존 응답을 미리 채워서 표시해야 한다 | existingAnswers.length > 0 && onModalOpen |

---

## 4. Specifications (상세 명세)

### 4.1 QAModal.tsx 컴포넌트

**역할**: Q&A 시스템 메인 모달 컨테이너

```typescript
interface QAModalProps {
  isOpen: boolean;
  task: Task;
  onComplete: (answers: QAAnswer[]) => void;
  onSkip: () => void;
  onCancel: () => void;
}

// 주요 상태
- questions: Question[]       // LLM이 생성한 질문 목록
- currentIndex: number        // 현재 질문 인덱스
- answers: Map<string, string>  // 질문ID → 응답 매핑
- isGenerating: boolean       // LLM 질문 생성 중 여부
- error: string | null        // 에러 메시지

// 주요 핸들러
- handleNext: () => void      // 다음 질문으로 이동
- handlePrevious: () => void  // 이전 질문으로 이동
- handleComplete: () => void  // Q&A 완료 처리
- handleSkip: () => void      // Q&A 건너뛰기
```

### 4.2 QAQuestion.tsx 컴포넌트

**역할**: 개별 질문 표시 및 응답 입력

```typescript
interface QAQuestionProps {
  question: Question;
  answer: string;
  onAnswerChange: (answer: string) => void;
  isActive: boolean;
}

// Question 타입
interface Question {
  id: string;
  category: QACategory;
  text: string;
  hint?: string;
  required: boolean;
  inputType: 'text' | 'textarea' | 'select';
  options?: string[];  // select 타입일 때
}

// QACategory 타입
type QACategory =
  | 'target_users'      // 대상 사용자
  | 'technical_constraints'  // 기술 제약
  | 'success_metrics'   // 성공 지표
  | 'dependencies'      // 의존성
  | 'priority_rationale';  // 우선순위 근거

// 스타일
- 카테고리 라벨: bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm
- 질문 텍스트: text-lg font-medium text-gray-900
- 힌트: text-sm text-gray-500 italic
- 입력 영역: w-full border rounded-lg p-3 min-h-[120px]
```

### 4.3 QAProgressBar.tsx 컴포넌트

**역할**: Q&A 진행 상태 시각화

```typescript
interface QAProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  categories: QACategory[];  // 카테고리별 진행 표시용
}

// 스타일
- 컨테이너: w-full bg-gray-200 rounded-full h-2
- 진행 바: bg-blue-600 h-2 rounded-full transition-all duration-300
- 스텝 인디케이터: flex justify-between mt-2
```

### 4.4 useQASession.ts Custom Hook

**역할**: Q&A 세션 로직 캡슐화

```typescript
interface UseQASessionReturn {
  // 상태
  questions: Question[];
  currentIndex: number;
  answers: Map<string, string>;
  isGenerating: boolean;
  error: string | null;

  // 액션
  generateQuestions: (featureDescription: string) => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  complete: () => QAAnswer[];
  reset: () => void;
}

// 사용 예시
const {
  questions,
  currentIndex,
  isGenerating,
  generateQuestions,
  setAnswer,
  goToNext,
  complete
} = useQASession();
```

### 4.5 qaStore.ts (Zustand)

**역할**: Q&A 전역 상태 관리

```typescript
interface QAStoreState {
  activeSession: QASession | null;
  questionHistory: Question[][];  // 이전 생성된 질문 캐시
  defaultQuestions: Question[];   // LLM 실패 시 폴백
}

interface QAStoreActions {
  startSession: (taskId: string, featureDescription: string) => Promise<void>;
  endSession: () => void;
  saveAnswers: (taskId: string, answers: QAAnswer[]) => Promise<void>;
  loadDefaultQuestions: () => void;
}

// QASession 타입
interface QASession {
  id: string;
  taskId: string;
  questions: Question[];
  answers: QAAnswer[];
  status: 'in_progress' | 'completed' | 'skipped';
  startedAt: string;
  completedAt: string | null;
}

// QAAnswer 타입
interface QAAnswer {
  questionId: string;
  category: QACategory;
  questionText: string;
  answer: string;
  answeredAt: string;
}
```

### 4.6 qaService.ts (API 클라이언트)

**역할**: Q&A 관련 백엔드 API 통신

```typescript
// API 엔드포인트
POST   /api/qa/generate-questions     // LLM으로 질문 생성
POST   /api/qa-sessions               // Q&A 세션 시작
PUT    /api/qa-sessions/:id           // 세션 업데이트 (응답 저장)
PUT    /api/qa-sessions/:id/complete  // 세션 완료
GET    /api/qa-sessions/:taskId       // 특정 태스크의 Q&A 세션 조회
GET    /api/question-library/default  // 기본 질문 목록 조회

// 질문 생성 요청/응답
interface GenerateQuestionsRequest {
  featureDescription: string;
  category?: string;  // 게임 카테고리 (mechanic, economy, growth)
  projectContext?: string;
}

interface GenerateQuestionsResponse {
  success: boolean;
  data: {
    questions: Question[];
    provider: string;  // 사용된 LLM 프로바이더
  };
  error: string | null;
}
```

### 4.7 LLM 프로바이더 인터페이스

**역할**: 다중 LLM 프로바이더 추상화

```typescript
interface LLMProviderInterface {
  generateQuestions(prompt: string): Promise<Question[]>;
  testConnection(): Promise<boolean>;
  getProviderName(): string;
}

// 지원 프로바이더
- OpenAI (GPT-4o, GPT-4o-mini)
- Google Gemini (Gemini Pro)
- Anthropic Claude (Claude 3.5 Sonnet)
- LM Studio (로컬 LLM)

// 프롬프트 템플릿
const QUESTION_GENERATION_PROMPT = `
다음 게임 기능 설명을 분석하고, 기획 문서 작성에 필요한 5-7개의 구조화된 질문을 생성하세요.

기능 설명: {featureDescription}

질문 카테고리:
1. target_users: 이 기능의 주요 대상 사용자는 누구인가요?
2. technical_constraints: 기술적 제약 사항이 있나요?
3. success_metrics: 이 기능의 성공을 어떻게 측정할 수 있나요?
4. dependencies: 다른 시스템과의 의존성이 있나요?
5. priority_rationale: 이 기능의 우선순위가 높은/낮은 이유는?

JSON 형식으로 응답하세요:
{
  "questions": [
    {
      "id": "q1",
      "category": "target_users",
      "text": "질문 내용",
      "hint": "응답 힌트 (선택)",
      "required": true,
      "inputType": "textarea"
    }
  ]
}
`;
```

---

## 5. Constraints (제약 조건)

### 5.1 기술적 제약

| ID | 제약 | 이유 |
|----|------|------|
| C1 | LLM API 호출은 서버 사이드에서만 수행 | API Key 보안 |
| C2 | 질문 생성 타임아웃 30초 | UX 및 API 비용 |
| C3 | 세션당 최대 질문 수 7개 | UX 피로도 방지 |
| C4 | 응답 텍스트 최대 2000자 | 데이터 저장 효율 |

### 5.2 성능 제약

| ID | 제약 | 이유 |
|----|------|------|
| P1 | LLM 질문 생성 응답 시간 < 10초 | 사용자 대기 시간 |
| P2 | 모달 열림 애니메이션 < 300ms | 부드러운 UX |
| P3 | 질문 간 전환 < 100ms | 즉각적인 반응 |
| P4 | localStorage 자동 저장 디바운스 500ms | 성능 최적화 |

### 5.3 보안 제약

| ID | 제약 | 이유 |
|----|------|------|
| S1 | API Key는 환경 변수로만 관리 | 보안 |
| S2 | 사용자 입력 XSS 필터링 필수 | 보안 |
| S3 | LLM 응답 JSON 스키마 검증 필수 | 데이터 무결성 |

---

## 6. Dependencies (의존성)

### 6.1 선행 SPEC

| SPEC ID | 제목 | 필요 산출물 |
|---------|------|------------|
| SPEC-INIT-001 | 프로젝트 초기화 | 디렉토리 구조, 타입 정의, Express 서버 |
| SPEC-KANBAN-001 | 칸반 보드 | 드래그 이벤트 트리거, Task 타입, taskStore |

### 6.2 외부 의존성

| 패키지/서비스 | 버전 | 용도 |
|--------------|------|------|
| OpenAI API | v4 | GPT 기반 질문 생성 |
| Google Generative AI | ^0.21.0 | Gemini 기반 질문 생성 |
| Anthropic SDK | ^0.32.0 | Claude 기반 질문 생성 |
| uuid | ^11.0.0 | 세션/질문 ID 생성 |

### 6.3 후속 SPEC (이번 SPEC 범위 외)

| SPEC ID | 제목 | 연관성 |
|---------|------|--------|
| SPEC-LLM-001 | LLM 문서 생성 | Q&A 응답을 컨텍스트로 사용 |
| SPEC-DESIGN-001 | Design Document 생성 | Q&A 완료 후 자동 트리거 |

---

## 7. Traceability (추적성)

### 7.1 문서 연결

| 문서 | 관련 섹션 |
|------|----------|
| PRD-DesignWorkflow-Implementation-Guide-v2.md | Section 4.5 (Q&A 시스템) |
| .moai/project/product.md | 핵심 기능 2. Q&A 시스템 |
| .moai/project/structure.md | src/qa/, src/store/qaStore.ts |

### 7.2 TAG 블록

```
[SPEC-QA-001] Q&A 시스템 (Q&A System)
├── [UR-001~006] Ubiquitous Requirements
├── [ED-001~008] Event-Driven Requirements
├── [SD-001~007] State-Driven Requirements
├── [UW-001~006] Unwanted Behavior Requirements
├── [OF-001~005] Optional Feature Requirements
├── [CR-001~003] Complex Requirements
├── Components
│   ├── QAModal.tsx (메인 모달 컨테이너)
│   ├── QAQuestion.tsx (개별 질문)
│   ├── QAProgressBar.tsx (진행 상태)
│   └── hooks/useQASession.ts (세션 관리 훅)
├── State Management
│   └── qaStore.ts (Zustand)
├── API Integration
│   └── qaService.ts
└── LLM Providers
    ├── openai.ts
    ├── gemini.ts
    ├── claude.ts
    └── lmstudio.ts
```

---

## 8. Lifecycle (SPEC 생명주기)

| 항목 | 값 |
|------|-----|
| **Lifecycle Level** | spec-anchored |
| **유지보수 정책** | 분기별 검토, LLM API 변경 시 업데이트 |
| **선행 SPEC** | SPEC-INIT-001, SPEC-KANBAN-001 |
| **후속 SPEC** | SPEC-LLM-001, SPEC-DESIGN-001 |

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
