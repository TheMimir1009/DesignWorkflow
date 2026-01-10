# SPEC-MODELHISTORY-001: 구현 계획

## 개요

AI 모델 히스토리 기록 시스템의 상세 구현 계획입니다.

---

## 기술 스택

- **Frontend**: React 19, TypeScript 5.9, Tailwind CSS 4
- **Backend**: Express 5, TypeScript 5.9
- **상태 관리**: Zustand 5
- **저장소**: 파일 기반 JSON 저장

---

## 구현 단계

### Phase 1: 타입 및 Backend 핵심 기능

#### Task 1.1: 타입 정의 추가

**파일**: `src/types/index.ts`

**작업 내용**:
- `GenerationHistoryEntry` 인터페이스 정의
- `Task` 인터페이스에 `generationHistory` 필드 추가
- `LLMProvider` 타입 import (llm.ts에서)

**예상 코드**:
```typescript
import { LLMProvider } from './llm';

export interface GenerationHistoryEntry {
  id: string;
  documentType: 'design' | 'prd' | 'prototype';
  action: 'create' | 'modify';
  provider: LLMProvider;
  model: string;
  createdAt: string;
  tokens?: {
    input: number;
    output: number;
  };
  feedback?: string;
}

export interface Task {
  // ... existing fields ...
  generationHistory: GenerationHistoryEntry[];
}
```

#### Task 1.2: Task 저장소 수정

**파일**: `server/utils/taskStorage.ts`

**작업 내용**:
- `createTask()` 함수에서 초기 `generationHistory: []` 설정
- `addGenerationHistoryEntry(projectId, taskId, entry)` 헬퍼 함수 추가

**헬퍼 함수 스펙**:
```typescript
export async function addGenerationHistoryEntry(
  projectId: string,
  taskId: string,
  entry: Omit<GenerationHistoryEntry, 'id' | 'createdAt'>
): Promise<void> {
  // 1. Task 로드
  // 2. 새 entry 생성 (id: uuid, createdAt: ISO string)
  // 3. generationHistory 배열에 추가
  // 4. Task 저장
}
```

---

### Phase 2: 생성 라우트 통합

#### Task 2.1: Design Document 생성 엔드포인트

**파일**: `server/routes/generate.ts`

**위치**: `/api/generate/design-document` 엔드포인트

**수정 내용**:
- 생성 성공 후 `addGenerationHistoryEntry()` 호출
- entry 데이터: documentType: 'design', action: 'create', provider, model, tokens

#### Task 2.2: PRD 생성 엔드포인트

**파일**: `server/routes/generate.ts`

**위치**: `/api/generate/prd` 엔드포인트

**수정 내용**:
- PRD 생성 성공 후 히스토리 기록
- entry 데이터: documentType: 'prd', action: 'create', provider, model

#### Task 2.3: Prototype 생성 엔드포인트

**파일**: `server/routes/generate.ts`

**위치**: `/api/generate/prototype` 엔드포인트

**수정 내용**:
- Prototype 생성 성공 후 히스토리 기록
- entry 데이터: documentType: 'prototype', action: 'create', provider, model

#### Task 2.4: 문서 수정 엔드포인트

**파일**: `server/routes/generate.ts`

**위치**: `/api/generate/modify` (또는 유사 엔드포인트)

**수정 내용**:
- 수정 완료 후 히스토리 기록
- entry 데이터: action: 'modify', feedback: 사용자 수정 요청 내용

#### Task 2.5: Trigger AI 엔드포인트

**파일**: `server/routes/tasks.ts`

**위치**: `/api/tasks/:taskId/trigger-ai` 엔드포인트

**수정 내용**:
- Claude Code 사용 시 provider: 'claude-code' 기록
- 생성된 문서 유형에 따른 히스토리 추가

---

### Phase 3: Frontend 표시

#### Task 3.1: ModelHistoryList 컴포넌트 생성

**파일**: `src/components/task/ModelHistoryList.tsx` (신규)

**Props 인터페이스**:
```typescript
interface ModelHistoryListProps {
  history: GenerationHistoryEntry[];
  className?: string;
}
```

**표시 요소**:
- 시간순 정렬 (최신 먼저)
- 각 항목: 날짜/시간, Provider 아이콘, Model 이름, 문서 유형, 액션 유형
- 토큰 사용량 (있는 경우)
- 수정 요청 내용 (있는 경우)
- 빈 상태 메시지

**UI 구조**:
```
┌─────────────────────────────────────────┐
│ AI 생성 히스토리                    [v] │
├─────────────────────────────────────────┤
│ 2026-01-10 14:30:25                     │
│ [Claude] claude-3.5-sonnet              │
│ Design Document 생성                    │
│ Tokens: 1,234 / 2,567                   │
├─────────────────────────────────────────┤
│ 2026-01-10 15:45:12                     │
│ [OpenAI] gpt-4o                         │
│ PRD 생성                                │
│ Tokens: 856 / 1,892                     │
└─────────────────────────────────────────┘
```

#### Task 3.2: TaskEditModal 수정

**파일**: `src/components/task/TaskEditModal.tsx`

**수정 내용**:
- ModelHistoryList 컴포넌트 import
- 히스토리 섹션 추가 (접을 수 있는 패널)
- Task의 generationHistory props 전달
- 하위 호환성: `task.generationHistory ?? []` 처리

---

### Phase 4: 테스트 및 검증

#### Task 4.1: 단위 테스트

**파일들**:
- `server/utils/__tests__/taskStorage.test.ts` (수정)
- `src/components/task/__tests__/ModelHistoryList.test.tsx` (신규)

**테스트 케이스**:
- `addGenerationHistoryEntry()` 함수 동작 확인
- 기존 Task 로드 시 undefined 처리
- 컴포넌트 렌더링 테스트 (빈 상태, 데이터 있는 상태)

#### Task 4.2: 통합 테스트

**테스트 시나리오**:
- Design Document 생성 후 히스토리 확인
- PRD 생성 후 히스토리 확인
- Prototype 생성 후 히스토리 확인
- 문서 수정 후 히스토리 확인

#### Task 4.3: E2E 검증

**검증 항목**:
- 실제 문서 생성 → Task JSON 히스토리 확인
- Task 모달 열기 → 히스토리 표시 확인
- 여러 번 생성 → 히스토리 누적 확인

---

## 구현 순서

| 순서 | Task | 의존성 | 예상 파일 |
|------|------|--------|----------|
| 1 | Task 1.1 | 없음 | src/types/index.ts |
| 2 | Task 1.2 | Task 1.1 | server/utils/taskStorage.ts |
| 3 | Task 2.1-2.5 | Task 1.2 | server/routes/generate.ts, tasks.ts |
| 4 | Task 3.1 | Task 1.1 | src/components/task/ModelHistoryList.tsx |
| 5 | Task 3.2 | Task 3.1 | src/components/task/TaskEditModal.tsx |
| 6 | Task 4.1-4.3 | 모든 Task | tests/ |

---

## 리스크 관리

### 리스크 1: 기존 데이터 호환성

**문제**: 기존 Task에 `generationHistory` 필드가 없음

**해결 방안**:
- 로드 시 `task.generationHistory ?? []` 처리
- Task 타입에 선택적 필드로 정의: `generationHistory?: GenerationHistoryEntry[]`
- 초기 마이그레이션 불필요 (lazy migration)

### 리스크 2: 히스토리 저장 실패

**문제**: 네트워크 오류 등으로 히스토리 저장 실패 가능

**해결 방안**:
- 히스토리 저장은 try-catch로 감싸서 실패해도 생성 응답은 성공 반환
- 실패 시 서버 로그에만 기록
- 사용자에게는 영향 없음

### 리스크 3: 데이터 증가

**문제**: 생성/수정할 때마다 히스토리가 증가

**해결 방안**:
- 현재 단계에서는 제한 없이 저장 (항목당 약 200-300 bytes)
- 향후 필요 시 최대 100개 항목 제한 또는 오래된 항목 정리

---

## 참조 파일

현재 관련 구현 위치:
- `src/types/index.ts:1-200` - Task 인터페이스
- `src/types/llm.ts:1-50` - LLMProvider 타입
- `server/routes/generate.ts:1-500` - 문서 생성 라우트
- `server/utils/taskStorage.ts:1-300` - Task 저장 유틸리티
- `src/components/task/TaskEditModal.tsx:1-400` - Task 편집 모달
