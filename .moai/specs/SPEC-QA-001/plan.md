# SPEC-QA-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-QA-001 |
| **제목** | Q&A 시스템 (Q&A System) |
| **관련 SPEC** | spec.md, acceptance.md |

---

## 1. 구현 마일스톤

### 1.1 마일스톤 개요

| 순서 | 마일스톤 | 우선순위 | 산출물 |
|------|----------|----------|--------|
| M1 | Q&A 타입 및 인터페이스 정의 | Primary | src/types/qa.ts 확장 |
| M2 | Q&A Storage 및 API 구현 | Primary | server/utils/, server/routes/ |
| M3 | LLM 질문 생성 서비스 구현 | Primary | server/llmProviders/, server/routes/questions.ts |
| M4 | Q&A Service 및 Store 구현 | Primary | src/services/, src/store/ |
| M5 | QAModal 컴포넌트 구현 | Primary | src/qa/QAModal.tsx |
| M6 | QAQuestion 및 QAProgressBar 구현 | Primary | src/qa/QAQuestion.tsx, QAProgressBar.tsx |
| M7 | useQASession Hook 구현 | Primary | src/qa/hooks/useQASession.ts |
| M8 | 칸반 보드 연동 (트리거 통합) | Primary | src/kanban/KanbanBoard.tsx 수정 |
| M9 | 통합 테스트 및 최적화 | Secondary | E2E 테스트, 에러 핸들링 |

---

## 2. 상세 구현 계획

### 2.1 M1: Q&A 타입 및 인터페이스 정의

**목표**: Q&A 시스템에 필요한 TypeScript 타입 정의

**작업 항목**:

1. **src/types/qa.ts 확장**
   ```typescript
   // QACategory 타입
   type QACategory =
     | 'target_users'
     | 'technical_constraints'
     | 'success_metrics'
     | 'dependencies'
     | 'priority_rationale';

   // Question 인터페이스
   interface Question {
     id: string;
     category: QACategory;
     text: string;
     hint?: string;
     required: boolean;
     inputType: 'text' | 'textarea' | 'select';
     options?: string[];
   }

   // QAAnswer 인터페이스
   interface QAAnswer {
     questionId: string;
     category: QACategory;
     questionText: string;
     answer: string;
     answeredAt: string;
   }

   // QASession 인터페이스
   interface QASession {
     id: string;
     taskId: string;
     questions: Question[];
     answers: QAAnswer[];
     status: 'in_progress' | 'completed' | 'skipped';
     provider: string;
     startedAt: string;
     completedAt: string | null;
   }
   ```

2. **src/types/index.ts 업데이트**
   - Task 인터페이스에 `qaAnswers: QAAnswer[]` 필드 추가 확인

**검증 기준**:
- TypeScript 컴파일 오류 없음
- 타입 자동 완성 동작 확인

---

### 2.2 M2: Q&A Storage 및 API 구현

**목표**: 백엔드 Q&A 세션 CRUD API 구현

**작업 항목**:

1. **server/utils/qaStorage.ts 구현**
   ```typescript
   // 주요 함수
   export async function createSession(data: CreateSessionDto): Promise<QASession>
   export async function getSession(id: string): Promise<QASession | null>
   export async function getSessionByTaskId(taskId: string): Promise<QASession | null>
   export async function updateSession(id: string, updates: Partial<QASession>): Promise<QASession>
   export async function completeSession(id: string, answers: QAAnswer[]): Promise<QASession>
   export async function deleteSession(id: string): Promise<void>
   ```

2. **server/routes/qa-sessions.ts 구현**
   ```typescript
   // API 엔드포인트
   POST   /api/qa-sessions              // 새 Q&A 세션 시작
   GET    /api/qa-sessions/:id          // 세션 조회
   GET    /api/qa-sessions/task/:taskId // 태스크별 세션 조회
   PUT    /api/qa-sessions/:id          // 세션 업데이트
   PUT    /api/qa-sessions/:id/complete // 세션 완료
   DELETE /api/qa-sessions/:id          // 세션 삭제
   ```

3. **server/index.ts 업데이트**
   - qaSessionsRouter 등록

**검증 기준**:
```bash
# 세션 생성
curl -X POST http://localhost:3001/api/qa-sessions \
  -H "Content-Type: application/json" \
  -d '{"taskId":"task-123","questions":[]}'

# 세션 조회
curl http://localhost:3001/api/qa-sessions/task/task-123

# 세션 완료
curl -X PUT http://localhost:3001/api/qa-sessions/{id}/complete \
  -H "Content-Type: application/json" \
  -d '{"answers":[...]}'
```

---

### 2.3 M3: LLM 질문 생성 서비스 구현

**목표**: LLM API를 활용한 동적 질문 생성 기능 구현

**작업 항목**:

1. **server/utils/questionGenerator.ts 구현**
   ```typescript
   // 주요 함수
   export async function generateQuestions(
     featureDescription: string,
     provider: LLMProvider,
     options?: GenerateOptions
   ): Promise<Question[]>

   // 프롬프트 템플릿
   const QUESTION_PROMPT = `
   게임 기능 설명을 분석하고 5-7개의 구조화된 질문을 생성하세요.

   기능 설명: {featureDescription}

   질문 카테고리:
   1. target_users: 대상 사용자
   2. technical_constraints: 기술 제약
   3. success_metrics: 성공 지표
   4. dependencies: 의존성
   5. priority_rationale: 우선순위 근거

   JSON 형식으로 응답하세요.
   `;
   ```

2. **server/routes/questions.ts 구현**
   ```typescript
   // API 엔드포인트
   POST /api/qa/generate-questions  // LLM 질문 생성
   GET  /api/question-library/default  // 기본 질문 목록
   ```

3. **LLM 프로바이더별 구현 확인**
   - OpenAI: `server/llmProviders/openai.ts`
   - Gemini: `server/llmProviders/gemini.ts`
   - Claude: `server/llmProviders/claude.ts` (신규)
   - LM Studio: `server/llmProviders/lmstudio.ts`

4. **기본 질문 폴백 데이터**
   ```typescript
   // workspace/templates/questions/default.json
   const DEFAULT_QUESTIONS: Question[] = [
     {
       id: 'default-1',
       category: 'target_users',
       text: '이 기능의 주요 대상 사용자는 누구인가요?',
       hint: '예: 하드코어 게이머, 캐주얼 유저, 신규 유저 등',
       required: true,
       inputType: 'textarea'
     },
     // ... 5개 더
   ];
   ```

**검증 기준**:
```bash
# 질문 생성 테스트
curl -X POST http://localhost:3001/api/qa/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"featureDescription":"가챠 시스템: 캐릭터와 무기를 뽑을 수 있는 랜덤 보상 시스템"}'

# 예상 응답: 5-7개의 구조화된 질문 JSON
```

---

### 2.4 M4: Q&A Service 및 Store 구현

**목표**: 프론트엔드 Q&A 상태 관리 및 API 통신 레이어 구현

**작업 항목**:

1. **src/services/qaService.ts 구현**
   ```typescript
   // API 함수
   export async function generateQuestions(featureDescription: string): Promise<Question[]>
   export async function createSession(taskId: string, questions: Question[]): Promise<QASession>
   export async function getSession(taskId: string): Promise<QASession | null>
   export async function saveAnswers(sessionId: string, answers: QAAnswer[]): Promise<void>
   export async function completeSession(sessionId: string): Promise<void>
   export async function getDefaultQuestions(): Promise<Question[]>
   ```

2. **src/store/qaStore.ts 구현**
   ```typescript
   interface QAStoreState {
     activeSession: QASession | null;
     currentQuestions: Question[];
     currentAnswers: Map<string, string>;
     currentIndex: number;
     isGenerating: boolean;
     error: string | null;
     defaultQuestions: Question[];
   }

   interface QAStoreActions {
     startSession: (taskId: string, featureDescription: string) => Promise<void>;
     setAnswer: (questionId: string, answer: string) => void;
     goToNext: () => void;
     goToPrevious: () => void;
     completeSession: () => Promise<QAAnswer[]>;
     skipSession: () => void;
     cancelSession: () => void;
     loadDefaultQuestions: () => Promise<void>;
     clearError: () => void;
   }
   ```

**검증 기준**:
- Zustand DevTools에서 상태 확인
- 콘솔에서 API 호출 로그 확인
- 질문 생성 및 응답 저장 동작 확인

---

### 2.5 M5: QAModal 컴포넌트 구현

**목표**: Q&A 시스템 메인 모달 UI 구현

**작업 항목**:

1. **src/qa/QAModal.tsx 구현**
   ```typescript
   // 핵심 기능
   - 모달 오버레이 및 컨테이너
   - 질문 생성 중 로딩 상태 표시
   - QAProgressBar 연동
   - QAQuestion 렌더링
   - 네비게이션 버튼 (이전/다음/완료/건너뛰기)
   - 에러 상태 처리 및 폴백 옵션
   - ESC 키 및 외부 클릭 핸들링
   ```

2. **스타일**:
   ```css
   // 오버레이
   fixed inset-0 bg-black/50 flex items-center justify-center z-50

   // 모달 컨테이너
   bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto
   shadow-xl animate-fadeIn

   // 헤더
   flex justify-between items-center mb-6 border-b pb-4

   // 버튼 그룹
   flex justify-between mt-6 pt-4 border-t
   ```

**검증 기준**:
- 모달 열기/닫기 애니메이션 동작
- 로딩 상태 표시 확인
- 키보드 이벤트 (ESC) 동작 확인

---

### 2.6 M6: QAQuestion 및 QAProgressBar 구현

**목표**: 개별 질문 컴포넌트 및 진행 상태 표시 구현

**작업 항목**:

1. **src/qa/QAQuestion.tsx 구현**
   ```typescript
   // 핵심 기능
   - 카테고리 라벨 표시
   - 질문 텍스트 표시
   - 힌트 텍스트 표시 (있을 경우)
   - inputType에 따른 입력 필드 렌더링
   - 필수 필드 표시 (*)
   - 실시간 응답 변경 핸들링
   ```

2. **src/qa/QAProgressBar.tsx 구현**
   ```typescript
   // 핵심 기능
   - 진행률 바 (currentIndex / totalQuestions)
   - 스텝 인디케이터 (각 질문 상태 표시)
   - 카테고리별 색상 구분
   - 애니메이션 전환 효과
   ```

3. **카테고리별 색상 정의**:
   ```typescript
   const CATEGORY_COLORS: Record<QACategory, string> = {
     target_users: 'bg-blue-100 text-blue-800',
     technical_constraints: 'bg-red-100 text-red-800',
     success_metrics: 'bg-green-100 text-green-800',
     dependencies: 'bg-yellow-100 text-yellow-800',
     priority_rationale: 'bg-purple-100 text-purple-800',
   };
   ```

**검증 기준**:
- 각 카테고리 라벨 색상 구분 확인
- 진행률 바 애니메이션 동작
- 텍스트 입력 및 변경 반영 확인

---

### 2.7 M7: useQASession Hook 구현

**목표**: Q&A 세션 로직을 재사용 가능한 Hook으로 캡슐화

**작업 항목**:

1. **src/qa/hooks/useQASession.ts 구현**
   ```typescript
   export function useQASession(taskId: string) {
     // qaStore 연동
     const {
       currentQuestions,
       currentAnswers,
       currentIndex,
       isGenerating,
       error,
       startSession,
       setAnswer,
       goToNext,
       goToPrevious,
       completeSession,
     } = useQAStore();

     // 편의 함수
     const currentQuestion = currentQuestions[currentIndex];
     const currentAnswer = currentAnswers.get(currentQuestion?.id) || '';
     const progress = (currentIndex + 1) / currentQuestions.length * 100;
     const isFirst = currentIndex === 0;
     const isLast = currentIndex === currentQuestions.length - 1;
     const canProceed = !currentQuestion?.required || currentAnswer.trim() !== '';

     return {
       // 상태
       questions: currentQuestions,
       currentQuestion,
       currentAnswer,
       currentIndex,
       progress,
       isGenerating,
       error,
       isFirst,
       isLast,
       canProceed,

       // 액션
       start: (featureDescription: string) => startSession(taskId, featureDescription),
       answer: (text: string) => setAnswer(currentQuestion.id, text),
       next: goToNext,
       previous: goToPrevious,
       complete: completeSession,
     };
   }
   ```

**검증 기준**:
- Hook 반환 값 타입 검사
- QAModal에서 Hook 사용 테스트

---

### 2.8 M8: 칸반 보드 연동 (트리거 통합)

**목표**: Feature List → Design Doc 드래그 시 Q&A 모달 자동 트리거

**작업 항목**:

1. **src/kanban/KanbanBoard.tsx 수정**
   ```typescript
   // handleDragEnd 수정
   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;

     if (!over) return;

     const task = tasks.find(t => t.id === active.id);
     const targetColumn = over.id as TaskStatus;

     // Q&A 트리거 조건 체크
     if (
       task?.status === 'featurelist' &&
       targetColumn === 'design'
     ) {
       // Q&A 모달 열기 (상태 업데이트는 완료 후)
       setQATargetTask(task);
       setIsQAModalOpen(true);
       return;  // 드래그 완료 처리 중단
     }

     // 일반 드래그 처리
     updateTaskStatus(active.id as string, targetColumn);
   };

   // Q&A 완료 핸들러
   const handleQAComplete = async (answers: QAAnswer[]) => {
     if (qaTargetTask) {
       await saveQAAnswers(qaTargetTask.id, answers);
       await updateTaskStatus(qaTargetTask.id, 'design');
       setIsQAModalOpen(false);
       setQATargetTask(null);
     }
   };

   // Q&A 건너뛰기 핸들러
   const handleQASkip = async () => {
     if (qaTargetTask) {
       await updateTaskStatus(qaTargetTask.id, 'design');
       setIsQAModalOpen(false);
       setQATargetTask(null);
     }
   };
   ```

2. **QAModal 렌더링 추가**:
   ```tsx
   {isQAModalOpen && qaTargetTask && (
     <QAModal
       isOpen={isQAModalOpen}
       task={qaTargetTask}
       onComplete={handleQAComplete}
       onSkip={handleQASkip}
       onCancel={() => setIsQAModalOpen(false)}
     />
   )}
   ```

**검증 기준**:
- Feature List → Design Doc 드래그 시 모달 열림
- Q&A 완료 후 카드 Design Doc으로 이동
- 건너뛰기 시 Q&A 없이 카드 이동

---

### 2.9 M9: 통합 테스트 및 최적화

**목표**: E2E 테스트 및 에러 핸들링 강화

**작업 항목**:

1. **통합 테스트**:
   - Q&A 전체 플로우 테스트
   - LLM 에러 시 폴백 테스트
   - 브라우저 새로고침 시 데이터 복구 테스트

2. **에러 핸들링 강화**:
   - LLM 타임아웃 처리
   - 네트워크 오류 재시도 로직
   - 유효성 검사 에러 메시지

3. **성능 최적화**:
   - 질문 생성 결과 캐싱
   - 응답 자동 저장 디바운싱
   - 모달 렌더링 최적화

**검증 기준**:
- 모든 시나리오 정상 동작
- 에러 상황에서 적절한 피드백 제공
- 메모리 누수 없음

---

## 3. 기술적 접근 방식

### 3.1 Q&A 시스템 아키텍처

```
                    KanbanBoard
                        │
                   onDragEnd
                        │
              ┌─────────▼─────────┐
              │   Q&A Trigger     │
              │ (Feature→Design)  │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │     QAModal       │
              │  ┌─────────────┐  │
              │  │QAProgressBar│  │
              │  └─────────────┘  │
              │  ┌─────────────┐  │
              │  │ QAQuestion  │  │
              │  └─────────────┘  │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   useQASession     qaStore        qaService
        │               │               │
        └───────────────┼───────────────┘
                        │
              ┌─────────▼─────────┐
              │    Express API    │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   qaStorage     questionGenerator   LLM Providers
        │               │               │
        │               │       ┌───────┼───────┐
        │               │       │       │       │
        │               │    OpenAI  Gemini  Claude
        │               │       │       │       │
        │               │       └───────┴───────┘
        │               │               │
        └───────────────┴───────────────┘
```

### 3.2 상태 관리 흐름

```
드래그 시작 → Feature List → Design Doc 감지
                    │
                    ▼
            Q&A 모달 열기
                    │
                    ▼
          LLM 질문 생성 요청 ──────┐
                    │              │
                    ▼              ▼
            로딩 상태 표시    실패 시 폴백 질문
                    │              │
                    ▼              ▼
            질문 표시 (1/N) ◄──────┘
                    │
                    ▼
            사용자 응답 입력
                    │
                    ▼
            다음 질문으로 이동
                    │
                    ▼
            마지막 질문 완료
                    │
                    ▼
            응답 저장 및 세션 완료
                    │
                    ▼
            카드 Design Doc으로 이동
```

### 3.3 LLM 프로바이더 선택 흐름

```
사용자 설정 확인
        │
        ▼
┌───────────────────┐
│ 설정된 프로바이더? │
└───────────────────┘
        │
   ┌────┴────┐────────┬────────┐
   ▼         ▼        ▼        ▼
OpenAI   Gemini   Claude   LM Studio
   │         │        │        │
   ▼         ▼        ▼        ▼
API 호출  API 호출  API 호출  로컬 호출
   │         │        │        │
   └────┬────┘────────┴────────┘
        │
        ▼
   성공 시 질문 반환
        │
   실패 시
        │
        ▼
   기본 질문 폴백
```

---

## 4. 위험 요소 및 대응 계획

### 4.1 기술적 위험

| 위험 | 영향도 | 대응 계획 |
|------|--------|----------|
| LLM API 응답 지연 | 높음 | 30초 타임아웃, 폴백 질문 준비 |
| LLM 응답 형식 불일치 | 중간 | JSON 스키마 검증, 파싱 에러 핸들링 |
| 브라우저 새로고침 시 데이터 손실 | 중간 | localStorage 임시 저장 |
| 동시 세션 충돌 | 낮음 | 세션 잠금 메커니즘 |

### 4.2 대응 전략

1. **LLM 지연/실패 시**:
   - 30초 타임아웃 적용
   - 기본 질문 5개 폴백 제공
   - 사용자에게 "기본 질문 사용" 옵션 제공

2. **데이터 손실 방지**:
   - 각 응답 입력 시 localStorage 저장
   - 모달 재오픈 시 임시 데이터 복구
   - 세션 완료 시 localStorage 정리

---

## 5. 의존성 체크리스트

### 5.1 선행 조건 (SPEC-INIT-001, SPEC-KANBAN-001)

- [ ] src/types/index.ts에 Task 타입 정의됨
- [ ] src/store/taskStore.ts에 updateTaskStatus 함수 존재
- [ ] src/kanban/KanbanBoard.tsx에 handleDragEnd 핸들러 존재
- [ ] server/index.ts에 Express 서버 동작
- [ ] LLM 프로바이더 설정 완료 (최소 1개)

### 5.2 환경 변수 설정

```bash
# .env
OPENAI_API_KEY=sk-...          # OpenAI API Key (선택)
GOOGLE_API_KEY=...             # Gemini API Key (선택)
ANTHROPIC_API_KEY=...          # Claude API Key (선택)
LM_STUDIO_BASE_URL=http://localhost:1234  # LM Studio URL (선택)
```

---

## 6. 파일 생성 체크리스트

| 파일 경로 | 마일스톤 | 상태 |
|----------|----------|------|
| src/types/qa.ts (확장) | M1 | Pending |
| server/utils/qaStorage.ts | M2 | Pending |
| server/routes/qa-sessions.ts | M2 | Pending |
| server/utils/questionGenerator.ts | M3 | Pending |
| server/routes/questions.ts | M3 | Pending |
| server/llmProviders/claude.ts | M3 | Pending |
| src/services/qaService.ts | M4 | Pending |
| src/store/qaStore.ts | M4 | Pending |
| src/qa/QAModal.tsx | M5 | Pending |
| src/qa/QAQuestion.tsx | M6 | Pending |
| src/qa/QAProgressBar.tsx | M6 | Pending |
| src/qa/hooks/useQASession.ts | M7 | Pending |
| src/kanban/KanbanBoard.tsx (수정) | M8 | Pending |
| workspace/templates/questions/default.json | M3 | Pending |

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
