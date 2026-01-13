<<<<<<< HEAD
# SPEC-QA-001: 구현 계획

## 개요

본 문서는 폼 기반 Q&A 시스템의 구현 계획을 정의합니다.

---

## 마일스톤

### 1차 목표 (Primary Goal): 핵심 Q&A 기능

**우선순위: High**

구현 항목:
- 질문 데이터 모델 및 타입 정의
- qaStore 상태 관리 구현
- 기본 API 엔드포인트 구현 (/api/questions, /api/qa-sessions)
- QAFormModal 기본 구조 구현

### 2차 목표 (Secondary Goal): UI 컴포넌트 완성

**우선순위: High**

구현 항목:
- QuestionList 컴포넌트 구현
- QuestionItem 컴포넌트 구현 (다양한 입력 타입 지원)
- CategorySelector 컴포넌트 구현
- 폼 유효성 검사 로직 구현

### 3차 목표 (Tertiary Goal): 세션 관리 및 저장

**우선순위: Medium**

구현 항목:
- 세션 자동 저장 기능 구현
- 세션 복구 기능 구현
- 진행률 표시 기능 구현
- 로컬 스토리지 연동

### 최종 목표 (Final Goal): 통합 및 최적화

**우선순위: Medium**

구현 항목:
- SPEC-TASK-001 태스크 시스템 연동
- SPEC-TEMPLATE-001 템플릿 시스템 연동
- 성능 최적화 및 에러 처리 개선
- 단위 테스트 및 통합 테스트 작성

---

## 태스크 분해

### Phase 1: 데이터 레이어

#### Task 1.1: 타입 정의

파일: `src/types/qa.ts`

```typescript
// Question, QASession, QAStore 인터페이스 정의
```

**의존성**: 없음

#### Task 1.2: Store 구현

파일: `src/stores/qaStore.ts`

- Zustand 기반 상태 관리
- 세션 CRUD 액션 구현
- 로컬 스토리지 persist 설정

**의존성**: Task 1.1

#### Task 1.3: API 라우트 구현

파일:
- `src/app/api/questions/route.ts`
- `src/app/api/qa-sessions/route.ts`
- `src/app/api/qa-sessions/[id]/route.ts`

**의존성**: Task 1.1

### Phase 2: 서비스 레이어

#### Task 2.1: QA 서비스 구현

파일: `src/services/qaService.ts`

- API 호출 래퍼 함수
- 에러 처리 로직
- 타입 안전한 응답 처리

**의존성**: Task 1.3

#### Task 2.2: 질문 파서 유틸리티

파일: `src/utils/questionParser.ts`

- JSON 템플릿 파싱
- 질문 유효성 검사
- 카테고리 추출

**의존성**: Task 1.1

### Phase 3: UI 컴포넌트

#### Task 3.1: QuestionItem 컴포넌트

파일: `src/components/qa/QuestionItem.tsx`

지원 입력 타입:
- text: 단일 텍스트 입력
- textarea: 다중 줄 텍스트
- select: 단일 선택 드롭다운
- multiselect: 다중 선택
- checkbox: 체크박스

**의존성**: Task 1.1

#### Task 3.2: QuestionList 컴포넌트

파일: `src/components/qa/QuestionList.tsx`

기능:
- 질문 목록 렌더링
- 가상 스크롤 (많은 질문 시)
- 카테고리 필터링

**의존성**: Task 3.1

#### Task 3.3: CategorySelector 컴포넌트

파일: `src/components/qa/CategorySelector.tsx`

기능:
- 탭 형태 카테고리 선택
- 전체 보기 옵션
- 카테고리별 진행률 표시

**의존성**: Task 1.1

#### Task 3.4: QAFormModal 컴포넌트

파일: `src/components/qa/QAFormModal.tsx`

기능:
- 모달 컨테이너
- 헤더 (제목, 진행률)
- 본문 (CategorySelector + QuestionList)
- 푸터 (저장, 완료, 취소 버튼)

**의존성**: Task 3.2, Task 3.3

### Phase 4: 통합

#### Task 4.1: 메인 페이지 통합

파일: `src/app/page.tsx` 또는 해당 페이지

- Q&A 시작 버튼 추가
- QAFormModal 연동
- 세션 상태 표시

**의존성**: Task 3.4, Task 2.1

#### Task 4.2: 태스크 시스템 연동

파일: 관련 태스크 컴포넌트

- Q&A 세션과 태스크 연결
- 태스크 완료 시 Q&A 트리거

**의존성**: Task 4.1, SPEC-TASK-001

---

## 기술적 접근 방식

### 상태 관리 전략

Zustand를 사용하여 Q&A 상태를 관리합니다:

- **전역 상태**: 현재 세션, 질문 목록, 로딩 상태
- **로컬 상태**: 개별 입력 필드 값, 유효성 검사 상태
- **영속성**: localStorage를 통한 세션 자동 저장

### 폼 유효성 검사

Zod 스키마를 활용한 런타임 유효성 검사:

- 필수 필드 검증
- 패턴 매칭 (이메일, URL 등)
- 길이 제한 검증
- 실시간 피드백 제공

### 성능 최적화

- React.memo를 통한 불필요한 리렌더링 방지
- 대량 질문 목록 시 가상 스크롤 적용
- 디바운스를 통한 자동 저장 최적화

---

## 아키텍처 설계 방향

### 컴포넌트 계층 구조

```
QAFormModal (Container)
├── Header
│   ├── Title
│   └── ProgressBar
├── Body
│   ├── CategorySelector
│   └── QuestionList
│       └── QuestionItem (반복)
└── Footer
    ├── SaveButton
    ├── CompleteButton
    └── CancelButton
```

### 데이터 흐름

1. 사용자가 Q&A 시작 버튼 클릭
2. qaStore.startSession() 호출
3. API로 질문 템플릿 로드
4. 새 세션 생성 및 상태 초기화
5. 사용자 답변 입력 시 qaStore.updateAnswer() 호출
6. 자동 저장 및 로컬 스토리지 동기화
7. 완료 버튼 클릭 시 qaStore.completeSession() 호출
8. API로 최종 저장 및 세션 종료

---

## 리스크 및 대응 방안

### 리스크 1: 대량 질문 처리 성능

**설명**: 질문이 많을 경우 렌더링 성능 저하 가능

**대응**: 가상 스크롤 라이브러리(react-virtual) 적용

### 리스크 2: 세션 데이터 손실

**설명**: 브라우저 크래시 또는 실수로 인한 데이터 손실

**대응**: 자동 저장 주기 단축, 로컬 스토리지 백업

### 리스크 3: 복잡한 유효성 검사

**설명**: 질문 간 의존성이 있는 복잡한 유효성 검사

**대응**: Zod 커스텀 검증 함수, 비동기 검증 지원

---

## 관련 문서

- [spec.md](./spec.md) - 요구사항 명세
- [acceptance.md](./acceptance.md) - 인수 기준
=======
---
id: SPEC-QA-001
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
| 1.0.0 | 2026-01-05 | MoAI-ADK | Initial plan creation |
| 1.1.0 | 2026-01-05 | MoAI-ADK | Implementation completed, status updated to completed |

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
>>>>>>> main
