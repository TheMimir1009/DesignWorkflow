# SPEC-TASK-001: 태스크 관리 UI

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-TASK-001 |
| 제목 | 태스크 생성/수정/삭제 UI (Task Management UI) |
| PRD Phase | Feature 5 |
| 생성일 | 2026-01-03 |
| 상태 | Planned |
| 우선순위 | High |
| 의존성 | SPEC-KANBAN-001 (완료) |
| 담당 에이전트 | expert-frontend |
| 라이프사이클 | spec-anchored |

---

## 1. 개요 (Overview)

### 1.1 배경

SPEC-KANBAN-001에서 구현된 칸반 보드 위에서 사용자가 새로운 기획 태스크를 생성하고, 기능 목록을 작성하며, 필요 시 태스크를 삭제할 수 있어야 합니다. 태스크 생성 시 프로젝트의 기본 참조 시스템이 자동으로 적용되어야 하며, 마크다운 에디터를 통해 기능 목록을 편집할 수 있어야 합니다.

### 1.2 목표

- 태스크 생성 모달 (TaskCreateModal) 구현
- 기능 목록 편집 모달 (TaskEditModal) 구현
- 태스크 삭제 확인 다이얼로그 (TaskDeleteConfirm) 구현
- 참조 시스템 표시 컴포넌트 (TaskReferences) 구현
- Zustand store 및 API 서비스 확장

### 1.3 범위

**포함**:
- TaskCreateModal.tsx: 새 태스크 생성 모달
- TaskEditModal.tsx: 기능 목록 편집 모달 (마크다운 에디터)
- TaskDeleteConfirm.tsx: 삭제 확인 다이얼로그
- TaskReferences.tsx: 태스크에 적용된 참조 시스템 표시
- taskStore.ts 확장: 생성/수정/삭제 액션 추가
- taskService.ts 확장: CRUD API 호출 함수 추가

**제외**:
- Q&A 폼 시스템 (SPEC-QA-001)
- 설계 문서 편집기 (SPEC-DOCUMENT-001)
- 아카이브 기능 (SPEC-ARCHIVE-001)
- 시스템 문서 관리 (SPEC-SYSTEM-001)

---

## 2. 환경 (Environment)

### 2.1 기술 스택

**프론트엔드**:
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- Zustand (상태 관리)
- 마크다운 에디터 (react-markdown, remark-gfm 기반)

**백엔드**:
- Node.js 20.x LTS
- Express 4.x
- TypeScript 5.x

### 2.2 기존 타입 정의 (활용)

```typescript
// src/types/index.ts (기존)
export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  featureList: string;
  designDocument: string | null;
  prd: string | null;
  prototype: string | null;
  references: string[];
  qaAnswers: QAAnswer[];
  revisions: Revision[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'featurelist' | 'design' | 'prd' | 'prototype';
```

### 2.3 신규 타입 정의

```typescript
// 태스크 생성 DTO
export interface CreateTaskDto {
  projectId: string;
  title: string;
  featureList?: string;
  references?: string[];
}

// 태스크 수정 DTO
export interface UpdateTaskDto {
  title?: string;
  featureList?: string;
  references?: string[];
}
```

### 2.4 디렉토리 구조

```
src/
  components/task/
    TaskCreateModal.tsx     # 태스크 생성 모달
    TaskEditModal.tsx       # 기능 목록 편집 모달
    TaskDeleteConfirm.tsx   # 삭제 확인 다이얼로그
    TaskReferences.tsx      # 참조 시스템 표시
  components/common/
    MarkdownEditor.tsx      # 마크다운 에디터 (공용)
    ConfirmDialog.tsx       # 확인 다이얼로그 (공용)
  services/
    taskService.ts          # 태스크 API (확장)
  store/
    taskStore.ts            # 태스크 상태 (확장)

server/
  routes/
    tasks.ts                # 태스크 API 라우트 (확장)
```

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [HIGH] SPEC-KANBAN-001의 칸반 보드가 완전히 구현되어 있음
  - 신뢰도: High
  - 근거: SPEC-KANBAN-001 상태가 Completed
  - 검증 방법: KanbanBoard, KanbanColumn, KanbanCard 컴포넌트 존재 확인

- [HIGH] taskStore.ts와 taskService.ts가 기본 CRUD를 지원하는 구조로 존재함
  - 신뢰도: High
  - 근거: SPEC-KANBAN-001에서 구현됨
  - 검증 방법: 파일 존재 및 기존 함수 확인

- [MEDIUM] MarkdownEditor 컴포넌트가 공용으로 사용 가능함
  - 신뢰도: Medium
  - 근거: structure.md에 정의됨
  - 검증 방법: 파일 존재 확인, 없으면 신규 구현

### 3.2 비즈니스 가정

- [HIGH] 태스크 생성 시 기본 참조 시스템이 프로젝트 설정에서 가져옴
  - 신뢰도: High
  - 근거: product.md Feature 5 요구사항

- [MEDIUM] 태스크 삭제는 소프트 삭제가 아닌 하드 삭제
  - 신뢰도: Medium
  - 근거: 아카이브 기능이 별도로 존재 (SPEC-ARCHIVE-001)

- [HIGH] 기능 목록은 마크다운 형식으로 저장됨
  - 신뢰도: High
  - 근거: product.md "마크다운 에디터로 기능 목록 작성"

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항 (EARS 형식)

#### FR-001: 태스크 생성 모달 (TaskCreateModal)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** `[+ New Task]` 버튼을 칸반 보드 상단에 표시해야 한다
- 시스템은 **항상** 모달에 제목 입력 필드를 표시해야 한다
- 시스템은 **항상** 모달에 취소/생성 버튼을 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 `[+ New Task]` 버튼을 클릭하면 **THEN** 태스크 생성 모달이 열린다
- **WHEN** 사용자가 제목을 입력하고 "생성" 버튼을 클릭하면 **THEN** 새 태스크가 Feature List 컬럼에 추가된다
- **WHEN** 태스크 생성이 성공하면 **THEN** 모달이 닫히고 새 태스크 카드가 애니메이션과 함께 나타난다
- **WHEN** 태스크 생성이 실패하면 **THEN** 에러 메시지를 모달 내에 표시한다
- **WHEN** 사용자가 "취소" 버튼을 클릭하거나 모달 외부를 클릭하면 **THEN** 모달이 닫힌다
- **WHEN** 사용자가 ESC 키를 누르면 **THEN** 모달이 닫힌다

**State-Driven (IF-THEN)**:
- **IF** 현재 프로젝트에 기본 참조 시스템이 설정되어 있으면 **THEN** 자동으로 새 태스크에 적용한다
- **IF** 제목이 비어있으면 **THEN** "생성" 버튼을 비활성화한다
- **IF** API 호출 중이면 **THEN** 로딩 인디케이터를 표시하고 버튼을 비활성화한다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 제목 없이 태스크를 생성**하지 않아야 한다**
- 시스템은 프로젝트가 선택되지 않은 상태에서 태스크를 생성**하지 않아야 한다**

#### FR-002: 기능 목록 편집 모달 (TaskEditModal)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 모달에 마크다운 에디터를 표시해야 한다
- 시스템은 **항상** 모달 헤더에 태스크 제목을 표시해야 한다
- 시스템은 **항상** 저장/취소 버튼을 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 칸반 카드를 클릭하면 **THEN** 기능 목록 편집 모달이 열린다
- **WHEN** 사용자가 마크다운 에디터에서 내용을 수정하면 **THEN** 변경 사항이 로컬 상태에 반영된다
- **WHEN** 사용자가 "저장" 버튼을 클릭하면 **THEN** 변경 사항이 서버에 저장된다
- **WHEN** 저장이 성공하면 **THEN** 모달이 닫히고 성공 토스트가 표시된다
- **WHEN** 저장이 실패하면 **THEN** 에러 메시지를 모달 내에 표시한다
- **WHEN** 사용자가 "취소"를 클릭하면 **THEN** 변경 사항을 무시하고 모달이 닫힌다

**State-Driven (IF-THEN)**:
- **IF** 내용이 변경되었는데 취소하려 하면 **THEN** "변경 사항을 저장하지 않고 닫으시겠습니까?" 확인을 요청한다
- **IF** API 호출 중이면 **THEN** 로딩 인디케이터를 표시한다

**Optional (가능하면)**:
- **가능하면** 마크다운 미리보기 탭을 제공한다
- **가능하면** 자동 저장 기능을 30초마다 실행한다

#### FR-003: 태스크 삭제 (TaskDeleteConfirm)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 삭제 확인 다이얼로그에 태스크 제목을 표시해야 한다
- 시스템은 **항상** "삭제하면 복구할 수 없습니다" 경고를 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 카드의 삭제 버튼(휴지통 아이콘)을 클릭하면 **THEN** 삭제 확인 다이얼로그가 열린다
- **WHEN** 사용자가 "삭제" 버튼을 클릭하면 **THEN** 태스크가 삭제되고 칸반 보드에서 제거된다
- **WHEN** 삭제가 성공하면 **THEN** 다이얼로그가 닫히고 "태스크가 삭제되었습니다" 토스트가 표시된다
- **WHEN** 삭제가 실패하면 **THEN** 에러 토스트가 표시되고 다이얼로그가 닫힌다
- **WHEN** 사용자가 "취소"를 클릭하면 **THEN** 다이얼로그가 닫힌다

**State-Driven (IF-THEN)**:
- **IF** AI 생성이 진행 중인 태스크라면 **THEN** "AI 생성 중인 태스크는 삭제할 수 없습니다" 경고를 표시한다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 사용자 확인 없이 태스크를 삭제**하지 않아야 한다**

#### FR-004: 참조 시스템 표시 (TaskReferences)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 태스크에 적용된 참조 시스템 태그를 표시해야 한다
- 시스템은 **항상** 태그를 가로 스크롤 가능한 영역에 배치해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 참조 태그를 클릭하면 **THEN** 해당 시스템 문서 미리보기가 열린다
- **WHEN** 태그의 "x" 버튼을 클릭하면 **THEN** 해당 참조가 태스크에서 제거된다
- **WHEN** "+ 추가" 버튼을 클릭하면 **THEN** 시스템 문서 검색 드롭다운이 열린다
- **WHEN** 드롭다운에서 시스템을 선택하면 **THEN** 해당 시스템이 참조로 추가된다

**State-Driven (IF-THEN)**:
- **IF** 참조 시스템이 3개를 초과하면 **THEN** 3개만 표시하고 "+N" 배지를 표시한다
- **IF** 참조 시스템이 없으면 **THEN** "참조 시스템을 추가하세요" 안내를 표시한다

### 4.2 비기능 요구사항

#### NFR-001: 성능

- 모달 오픈: 200ms 이내
- 태스크 생성 API: 1초 이내 응답
- 기능 목록 저장 API: 1초 이내 응답
- 마크다운 에디터 입력 지연: 50ms 이내

#### NFR-002: 사용성

- 모달은 화면 중앙에 표시
- 모달 배경은 반투명 오버레이로 처리
- ESC 키로 모달 닫기 지원
- 탭 키로 포커스 순환 (접근성)
- 마크다운 에디터 툴바 제공 (볼드, 이탤릭, 리스트 등)

#### NFR-003: 접근성

- ARIA 레이블 적용 (role="dialog", aria-modal="true")
- 포커스 트랩 구현 (모달 내부에서만 탭 이동)
- 스크린 리더 호환성 확보
- 키보드 전용 사용자 지원

---

## 5. 제약사항 (Constraints)

### 5.1 기술적 제약

- 기존 taskStore.ts, taskService.ts 확장 방식 사용
- Zustand 상태 관리 패턴 준수
- Tailwind CSS 유틸리티 클래스 사용
- Express 서버를 통한 API 통신

### 5.2 UI 제약

- 모달 최소 너비: 480px
- 마크다운 에디터 최소 높이: 300px
- 버튼 스타일: Tailwind 기본 버튼 스타일 준수

### 5.3 API 제약

- RESTful API 설계 원칙 준수
- ApiResponse<T> 타입 사용
- 에러 응답 시 적절한 HTTP 상태 코드 반환

---

## 6. 명세 (Specifications)

### 6.1 컴포넌트 명세

#### TaskCreateModal.tsx

```typescript
interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultReferences?: string[];
}

// 기능:
// - 제목 입력 필드 (필수)
// - 기본 참조 시스템 자동 적용
// - 생성/취소 버튼
// - 로딩 상태 표시
// - 에러 메시지 표시
```

#### TaskEditModal.tsx

```typescript
interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

// 기능:
// - 마크다운 에디터 (featureList 편집)
// - 미리보기 탭 (선택사항)
// - 저장/취소 버튼
// - 변경 감지 및 확인 다이얼로그
// - 참조 시스템 표시 및 편집 (TaskReferences 포함)
```

#### TaskDeleteConfirm.tsx

```typescript
interface TaskDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onConfirm: () => void;
}

// 기능:
// - 태스크 제목 표시
// - 경고 메시지 표시
// - 삭제/취소 버튼
// - AI 생성 중 삭제 방지
```

#### TaskReferences.tsx

```typescript
interface TaskReferencesProps {
  references: string[];
  onRemove: (referenceId: string) => void;
  onAdd: (referenceId: string) => void;
  maxDisplay?: number;  // 기본값 3
  readonly?: boolean;
}

// 기능:
// - 참조 태그 목록 표시
// - 태그 클릭 시 미리보기
// - 태그 제거 (x 버튼)
// - 참조 추가 드롭다운
// - +N 배지 (초과 시)
```

### 6.2 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /api/projects/:projectId/tasks | 태스크 생성 | CreateTaskDto | ApiResponse<Task> |
| PUT | /api/tasks/:id | 태스크 수정 | UpdateTaskDto | ApiResponse<Task> |
| DELETE | /api/tasks/:id | 태스크 삭제 | - | ApiResponse<null> |
| GET | /api/tasks/:id | 태스크 상세 조회 | - | ApiResponse<Task> |

### 6.3 Zustand Store 확장

```typescript
// src/store/taskStore.ts (확장)
interface TaskStoreActions {
  // 기존 액션 유지
  fetchTasks: (projectId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;

  // 신규 액션 추가
  createTask: (dto: CreateTaskDto) => Promise<Task>;
  updateTask: (taskId: string, dto: UpdateTaskDto) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;

  // 모달 상태 관리
  selectedTask: Task | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
  openDeleteConfirm: (task: Task) => void;
  closeDeleteConfirm: () => void;
}
```

### 6.4 taskService.ts 확장

```typescript
// src/services/taskService.ts (확장)
export async function createTask(dto: CreateTaskDto): Promise<Task>;
export async function updateTask(taskId: string, dto: UpdateTaskDto): Promise<Task>;
export async function deleteTask(taskId: string): Promise<void>;
export async function getTask(taskId: string): Promise<Task>;
```

---

## 7. 추적성 (Traceability)

### 7.1 PRD 매핑

| 요구사항 | PRD 항목 | 수락 기준 |
|----------|----------|-----------|
| FR-001 | Feature 5 - 태스크 생성 | AC-001, AC-002 |
| FR-002 | Feature 5 - 기능 목록 편집 | AC-003, AC-004 |
| FR-003 | Feature 5 - 태스크 삭제 | AC-005 |
| FR-004 | Feature 5 - 참조 시스템 표시 | AC-006, AC-007 |

### 7.2 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| TaskCreateModal | src/components/task/TaskCreateModal.tsx | expert-frontend |
| TaskEditModal | src/components/task/TaskEditModal.tsx | expert-frontend |
| TaskDeleteConfirm | src/components/task/TaskDeleteConfirm.tsx | expert-frontend |
| TaskReferences | src/components/task/TaskReferences.tsx | expert-frontend |
| MarkdownEditor | src/components/common/MarkdownEditor.tsx | expert-frontend |
| taskService | src/services/taskService.ts | expert-frontend |
| taskStore | src/store/taskStore.ts | expert-frontend |
| tasks route | server/routes/tasks.ts | expert-backend |

### 7.3 관련 SPEC

- SPEC-KANBAN-001: 칸반 보드 UI (의존성, 완료)
- SPEC-SYSTEM-001: 시스템 문서 관리 (후속, 계획)
- SPEC-DOCUMENT-001: 문서 편집 (후속, 계획)
- SPEC-QA-001: Q&A 폼 시스템 (후속, 계획)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-03 | 초안 작성 |
