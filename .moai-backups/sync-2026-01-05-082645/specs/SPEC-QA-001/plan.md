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
