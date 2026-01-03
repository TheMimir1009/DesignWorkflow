# SPEC-KANBAN-001: 칸반 보드 UI

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-KANBAN-001 |
| 제목 | 칸반 보드 UI (Kanban Board UI) |
| PRD Phase | Feature 4 |
| 생성일 | 2026-01-03 |
| 상태 | Planned |
| 우선순위 | High |
| 의존성 | SPEC-PROJECT-001 (완료) |
| 담당 에이전트 | expert-frontend |
| 라이프사이클 | spec-anchored |

---

## 1. 개요 (Overview)

### 1.1 배경

AI Workflow Kanban 시스템에서 기획 파이프라인을 시각적으로 관리할 수 있는 칸반 보드가 필요합니다. 사용자는 드래그앤드롭을 통해 태스크의 상태를 변경하고, 카드 이동 시 AI가 자동으로 다음 단계의 문서를 생성해야 합니다.

### 1.2 목표

- React + @dnd-kit 기반의 4컬럼 칸반 보드 구현
- 드래그앤드롭으로 태스크 상태 전환
- 카드 이동 시 AI 문서 생성 트리거
- 참조 시스템 태그 및 문서 미리보기 표시
- Zustand 기반 상태 관리 및 Express API 연동

### 1.3 범위

**포함**:
- KanbanBoard.tsx: 메인 칸반 보드 컴포넌트
- KanbanColumn.tsx: 4개 컬럼 (Feature List, Design Doc, PRD, Prototype)
- KanbanCard.tsx: 드래그 가능한 태스크 카드
- 드래그앤드롭 상태 전환 로직
- AI 생성 트리거 연동 (API 호출)
- 참조 시스템 태그 표시
- 문서 미리보기 기능

**제외**:
- 태스크 생성/수정/삭제 UI (SPEC-TASK-001)
- 시스템 문서 관리 (SPEC-SYSTEM-001)
- 문서 편집 모달 (SPEC-DOCUMENT-001)
- 아카이브 기능 (SPEC-ARCHIVE-001)

---

## 2. 환경 (Environment)

### 2.1 기술 스택

**프론트엔드**:
- React 18.x
- TypeScript 5.x
- @dnd-kit/core ^6.0.0
- @dnd-kit/sortable ^7.0.0
- @dnd-kit/utilities (드래그 스타일링)
- Zustand (상태 관리)
- Tailwind CSS 3.x

**백엔드**:
- Node.js 20.x LTS
- Express 4.x
- TypeScript 5.x

### 2.2 기존 타입 정의

```typescript
// src/types/index.ts (기존 정의 활용)
export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  references: string[];  // 참조 시스템 ID 배열
  featureList?: FeatureList;
  designDocument?: DesignDocument;
  prd?: PRD;
  prototype?: Prototype;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus =
  | 'feature_list'
  | 'design_doc'
  | 'prd'
  | 'prototype'
  | 'archived';

// 컬럼 정의
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
```

### 2.3 디렉토리 구조

```
src/
  components/kanban/
    KanbanBoard.tsx        # 메인 칸반 보드
    KanbanColumn.tsx       # 컬럼 컴포넌트
    KanbanCard.tsx         # 카드 컴포넌트
  services/
    taskService.ts         # 태스크 API 통신 (확장)
  store/
    taskStore.ts           # 태스크 상태 관리 (확장)

server/
  routes/
    tasks.ts               # 태스크 API 라우트 (확장)
```

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [HIGH] SPEC-PROJECT-001의 프로젝트 관리 기능이 완료되어 있음
  - 신뢰도: High
  - 근거: SPEC-PROJECT-001 상태가 Completed
  - 검증 방법: projectStore.currentProjectId 확인

- [HIGH] @dnd-kit 라이브러리가 React 18과 호환됨
  - 신뢰도: High
  - 근거: 공식 문서에서 React 18 지원 명시
  - 검증 방법: npm install 후 기본 동작 확인

- [MEDIUM] taskStore.ts가 기본 구조로 존재함
  - 신뢰도: Medium
  - 근거: structure.md에 정의됨
  - 검증 방법: 파일 존재 확인, 없으면 생성

### 3.2 비즈니스 가정

- [HIGH] 태스크는 한 번에 하나의 컬럼에만 존재함
  - 신뢰도: High
  - 근거: 칸반 보드의 기본 원칙

- [MEDIUM] 프로젝트당 활성 태스크 수는 50개 이하
  - 신뢰도: Medium
  - 근거: 일반적인 기획 프로젝트 규모

- [MEDIUM] 역방향 이동(예: PRD에서 Design Doc으로)은 허용됨
  - 신뢰도: Medium
  - 근거: 수정/재작업 시나리오 지원 필요

### 3.3 사용자 가정

- [HIGH] 사용자는 드래그앤드롭 인터랙션에 익숙함
  - 신뢰도: High
  - 근거: 칸반 도구 사용 경험

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항 (EARS 형식)

#### FR-001: 칸반 보드 렌더링

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 4개의 컬럼을 가로로 배치해야 한다: Feature List | Design Doc | PRD | Prototype
- 시스템은 **항상** 각 컬럼에 해당 상태의 태스크 카드를 표시해야 한다
- 시스템은 **항상** 각 컬럼의 태스크 수를 헤더에 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 프로젝트가 선택되면 **THEN** 해당 프로젝트의 모든 태스크를 로드하여 칸반 보드에 표시한다
- **WHEN** 태스크 데이터 로드에 실패하면 **THEN** 에러 메시지를 표시하고 재시도 버튼을 제공한다

**State-Driven (IF-THEN)**:
- **IF** 현재 선택된 프로젝트가 없으면 **THEN** "프로젝트를 선택해주세요" 안내 메시지를 표시한다
- **IF** 프로젝트에 태스크가 없으면 **THEN** 빈 칸반 보드와 "태스크 생성" 안내를 표시한다
- **IF** 태스크 로딩 중이면 **THEN** 스켈레톤 UI를 표시한다

#### FR-002: 드래그앤드롭 상태 전환

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 드래그 중인 카드에 시각적 피드백(그림자, 투명도)을 제공해야 한다
- 시스템은 **항상** 드롭 가능한 영역에 하이라이트 효과를 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 카드를 드래그 시작하면 **THEN** 카드가 드래그 가능한 상태로 변환된다
- **WHEN** 사용자가 카드를 다른 컬럼에 드롭하면 **THEN** 태스크 상태가 해당 컬럼의 상태로 변경된다
- **WHEN** 드래그가 취소되면 **THEN** 카드가 원래 위치로 돌아간다
- **WHEN** 상태 변경 API 호출이 실패하면 **THEN** 카드를 원래 위치로 롤백하고 에러 토스트를 표시한다

**State-Driven (IF-THEN)**:
- **IF** 같은 컬럼 내에서 드롭하면 **THEN** 순서 변경만 적용하고 상태는 유지한다
- **IF** 카드가 archived 상태이면 **THEN** 드래그를 비활성화한다

#### FR-003: AI 태스크 트리거

**Event-Driven (WHEN-THEN)**:
- **WHEN** 카드가 Feature List에서 Design Doc으로 이동하면 **THEN** AI 설계문서 생성을 트리거한다
- **WHEN** 카드가 Design Doc에서 PRD로 이동하면 **THEN** AI PRD 생성을 트리거한다
- **WHEN** 카드가 PRD에서 Prototype으로 이동하면 **THEN** AI 프로토타입 생성을 트리거한다
- **WHEN** AI 생성이 시작되면 **THEN** 해당 카드에 로딩 인디케이터를 표시한다
- **WHEN** AI 생성이 완료되면 **THEN** 카드에 "완료" 배지를 표시하고 문서 미리보기를 활성화한다
- **WHEN** AI 생성이 실패하면 **THEN** 에러 배지를 표시하고 재시도 버튼을 제공한다

**State-Driven (IF-THEN)**:
- **IF** 역방향 이동(예: PRD에서 Design Doc)이면 **THEN** AI 트리거 없이 상태만 변경한다
- **IF** 이미 해당 단계의 문서가 존재하면 **THEN** "기존 문서 덮어쓰기" 확인을 요청한다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 Feature List 문서가 비어있는 상태에서 AI 생성을 트리거**하지 않아야 한다**
- 시스템은 이전 AI 생성이 진행 중일 때 새 생성을 트리거**하지 않아야 한다**

#### FR-004: 카드 정보 표시

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 카드에 태스크 제목을 표시해야 한다
- 시스템은 **항상** 카드에 참조 시스템 태그를 표시해야 한다 (최대 3개, 초과 시 "+N")
- 시스템은 **항상** 카드에 현재 단계 문서 존재 여부를 아이콘으로 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 카드를 클릭하면 **THEN** 태스크 상세 모달이 열린다
- **WHEN** 사용자가 참조 태그를 클릭하면 **THEN** 해당 시스템 문서 미리보기가 열린다
- **WHEN** 사용자가 문서 미리보기 버튼을 클릭하면 **THEN** 해당 단계 문서 미리보기가 열린다

**Optional (가능하면)**:
- **가능하면** 카드에 마지막 수정 시간을 상대적 형식(예: "2시간 전")으로 표시한다

### 4.2 비기능 요구사항

#### NFR-001: 성능

- 태스크 목록 로드: 500ms 이내
- 드래그 시작 반응: 100ms 이내
- 드롭 후 UI 업데이트: 200ms 이내
- AI 트리거 API 호출: 1초 이내 응답 (생성 완료는 별도)

#### NFR-002: 사용성

- 드래그 시 명확한 시각적 피드백 제공
- 터치 디바이스에서도 드래그 가능 (태블릿 지원)
- 키보드 네비게이션 지원 (Tab, Enter, Space)
- 최소 너비 1024px에서 4컬럼 가로 배치

#### NFR-003: 접근성

- 드래그앤드롭 대안으로 컨텍스트 메뉴 제공 ("이동" 메뉴)
- ARIA 레이블 적용 (role="list", role="listitem")
- 스크린 리더 호환성 확보

---

## 5. 제약사항 (Constraints)

### 5.1 기술적 제약

- @dnd-kit 라이브러리 사용 필수 (다른 DnD 라이브러리 사용 불가)
- Zustand 상태 관리 패턴 준수
- Express 서버를 통한 API 통신 필수

### 5.2 UI 제약

- Tailwind CSS 유틸리티 클래스 사용
- 컬럼 최소 너비: 280px
- 카드 최소 높이: 80px
- 컬럼 간 간격: 16px

### 5.3 API 제약

- RESTful API 설계 원칙 준수
- JSON 응답 형식 표준화 (ApiResponse<T> 타입 사용)
- AI 생성은 비동기 처리 (폴링 또는 WebSocket)

---

## 6. 명세 (Specifications)

### 6.1 컴포넌트 명세

#### KanbanBoard.tsx

```typescript
interface KanbanBoardProps {
  // Props 없음 - Zustand store 직접 사용
}

// 기능:
// - DndContext 프로바이더 설정
// - sensors: PointerSensor, TouchSensor, KeyboardSensor
// - 4개 KanbanColumn 렌더링
// - onDragStart, onDragEnd 핸들러
// - AI 트리거 로직
```

#### KanbanColumn.tsx

```typescript
interface KanbanColumnProps {
  column: {
    id: TaskStatus;
    title: string;
  };
  tasks: Task[];
  isOver?: boolean;
}

// 기능:
// - SortableContext 설정
// - 컬럼 헤더 (제목, 태스크 수)
// - useDroppable 훅 사용
// - KanbanCard 목록 렌더링
```

#### KanbanCard.tsx

```typescript
interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
  isGenerating?: boolean;
}

// 기능:
// - useSortable 훅 사용
// - 태스크 제목 표시
// - 참조 시스템 태그 표시 (최대 3개)
// - 문서 상태 아이콘 표시
// - 클릭 이벤트 핸들링
// - 드래그 스타일 적용
```

### 6.2 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/projects/:projectId/tasks | 프로젝트별 태스크 목록 | - | ApiResponse<Task[]> |
| PUT | /api/tasks/:id/status | 태스크 상태 변경 | { status: TaskStatus } | ApiResponse<Task> |
| POST | /api/tasks/:id/trigger-ai | AI 생성 트리거 | { targetStatus: TaskStatus } | ApiResponse<{ jobId: string }> |
| GET | /api/tasks/:id/ai-status | AI 생성 상태 확인 | - | ApiResponse<{ status: string, progress?: number }> |

### 6.3 Zustand Store 명세 (확장)

```typescript
// src/store/taskStore.ts
interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  generatingTasks: Set<string>;  // AI 생성 중인 태스크 ID

  // Actions
  fetchTasks: (projectId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  triggerAIGeneration: (taskId: string, targetStatus: TaskStatus) => Promise<void>;
  setGenerating: (taskId: string, isGenerating: boolean) => void;

  // Computed
  getTasksByStatus: (status: TaskStatus) => Task[];
  isTaskGenerating: (taskId: string) => boolean;
}
```

### 6.4 컬럼 정의

```typescript
export const KANBAN_COLUMNS: Array<{ id: TaskStatus; title: string }> = [
  { id: 'feature_list', title: 'Feature List' },
  { id: 'design_doc', title: 'Design Doc' },
  { id: 'prd', title: 'PRD' },
  { id: 'prototype', title: 'Prototype' },
];
```

### 6.5 AI 트리거 매핑

| From Status | To Status | AI Action |
|-------------|-----------|-----------|
| feature_list | design_doc | Design Document 생성 |
| design_doc | prd | PRD 생성 |
| prd | prototype | Prototype HTML 생성 |

---

## 7. 추적성 (Traceability)

### 7.1 PRD 매핑

| 요구사항 | PRD 항목 | 수락 기준 |
|----------|----------|-----------|
| FR-001 | Feature 4 - 칸반 보드 UI | AC-001, AC-002 |
| FR-002 | Feature 4 - 드래그앤드롭 상태 변경 | AC-003, AC-004 |
| FR-003 | Feature 4 - AI 태스크 트리거 | AC-005, AC-006 |
| FR-004 | Feature 4 - 카드 정보 표시 | AC-007, AC-008 |

### 7.2 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| KanbanBoard | src/components/kanban/KanbanBoard.tsx | expert-frontend |
| KanbanColumn | src/components/kanban/KanbanColumn.tsx | expert-frontend |
| KanbanCard | src/components/kanban/KanbanCard.tsx | expert-frontend |
| taskService | src/services/taskService.ts | expert-frontend |
| taskStore | src/store/taskStore.ts | expert-frontend |
| tasks route | server/routes/tasks.ts | expert-backend |

### 7.3 관련 SPEC

- SPEC-PROJECT-001: 프로젝트 관리 (의존성, 완료)
- SPEC-TASK-001: 태스크 관리 (후속, 계획)
- SPEC-DOCUMENT-001: 문서 편집 (후속, 계획)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-03 | 초안 작성 |
