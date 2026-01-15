# SPEC-KANBAN-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-KANBAN-001 |
| **제목** | 칸반 보드 (Kanban Board) |
| **관련 SPEC** | spec.md, acceptance.md |

---

## 1. 구현 마일스톤

### 1.1 마일스톤 개요

| 순서 | 마일스톤 | 우선순위 | 산출물 |
|------|----------|----------|--------|
| M1 | 의존성 설치 및 타입 확장 | Primary | package.json, types 확장 |
| M2 | Task Storage 및 API 구현 | Primary | server/utils/, server/routes/ |
| M3 | Task Service 및 Store 구현 | Primary | services/, store/ |
| M4 | KanbanBoard 컴포넌트 구현 | Primary | kanban/KanbanBoard.tsx |
| M5 | KanbanColumn 컴포넌트 구현 | Primary | kanban/KanbanColumn.tsx |
| M6 | KanbanCard 컴포넌트 구현 | Primary | kanban/KanbanCard.tsx |
| M7 | TaskDetailModal 구현 | Secondary | kanban/TaskDetailModal.tsx |
| M8 | 통합 테스트 및 최적화 | Secondary | E2E 테스트, 성능 최적화 |

---

## 2. 상세 구현 계획

### 2.1 M1: 의존성 설치 및 타입 확장

**목표**: @dnd-kit 라이브러리 설치 및 기존 타입 확인

**작업 항목**:
1. @dnd-kit 패키지 설치
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. 타입 정의 확인 (src/types/index.ts)
   - Task 인터페이스 존재 확인
   - TaskStatus 타입 확인
   - CreateTaskDto 확인

**검증 기준**:
- `npm ls @dnd-kit/core` 버전 확인
- TypeScript 컴파일 오류 없음

---

### 2.2 M2: Task Storage 및 API 구현

**목표**: 백엔드 태스크 CRUD API 구현

**작업 항목**:

1. **server/utils/taskStorage.ts** 구현
   - `getTasksByProject(projectId)`: 프로젝트별 태스크 조회
   - `getTaskById(id)`: 단일 태스크 조회
   - `createTask(data)`: 새 태스크 생성
   - `updateTask(id, updates)`: 태스크 업데이트
   - `updateTaskStatus(id, status)`: 상태만 업데이트
   - `deleteTask(id)`: 태스크 삭제

2. **server/routes/tasks.ts** 구현
   - `GET /api/projects/:projectId/tasks`: 프로젝트 태스크 목록
   - `POST /api/projects/:projectId/tasks`: 태스크 생성
   - `GET /api/tasks/:id`: 단일 태스크 조회
   - `PUT /api/tasks/:id`: 태스크 업데이트
   - `PUT /api/tasks/:id/status`: 상태 업데이트
   - `DELETE /api/tasks/:id`: 태스크 삭제

3. **server/index.ts** 업데이트
   - tasksRouter 등록
   - 프로젝트 범위 라우트 등록

**검증 기준**:
```bash
# 태스크 생성
curl -X POST http://localhost:3001/api/projects/{pid}/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트 태스크","featureList":"기능 설명"}'

# 태스크 목록 조회
curl http://localhost:3001/api/projects/{pid}/tasks

# 상태 업데이트
curl -X PUT http://localhost:3001/api/tasks/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"design"}'
```

---

### 2.3 M3: Task Service 및 Store 구현

**목표**: 프론트엔드 상태 관리 및 API 통신 레이어 구현

**작업 항목**:

1. **src/services/taskService.ts** 구현
   ```typescript
   export async function getTasks(projectId: string): Promise<Task[]>
   export async function getTask(id: string): Promise<Task>
   export async function createTask(data: CreateTaskDto): Promise<Task>
   export async function updateTask(id: string, data: Partial<Task>): Promise<Task>
   export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task>
   export async function deleteTask(id: string): Promise<void>
   ```

2. **src/store/taskStore.ts** 구현
   - State: tasks, isLoading, error, generatingTaskIds
   - Actions: fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask
   - Selectors: getTasksByStatus

**검증 기준**:
- Zustand DevTools에서 상태 확인
- 콘솔에서 API 호출 로그 확인

---

### 2.4 M4: KanbanBoard 컴포넌트 구현

**목표**: 칸반 보드 메인 컨테이너 및 DndContext 구현

**작업 항목**:

1. **src/kanban/KanbanBoard.tsx** 구현
   ```typescript
   // 핵심 기능
   - DndContext 설정 (collisionDetection: closestCenter)
   - 4개 컬럼 렌더링
   - handleDragStart: activeTask 설정
   - handleDragEnd: 상태 업데이트 및 API 호출
   - DragOverlay: 드래그 미리보기
   ```

2. **COLUMNS 상수 정의**:
   ```typescript
   const COLUMNS: { id: TaskStatus; title: string }[] = [
     { id: 'featurelist', title: 'Feature List' },
     { id: 'design', title: 'Design Document' },
     { id: 'prd', title: 'PRD' },
     { id: 'prototype', title: 'Prototype' },
   ];
   ```

3. **프로젝트 미선택 상태 처리**:
   - currentProject === null 시 안내 메시지 표시

**검증 기준**:
- 4개 컬럼이 가로로 배치됨
- 프로젝트 선택 시 태스크 로드됨

---

### 2.5 M5: KanbanColumn 컴포넌트 구현

**목표**: 단일 칸반 컬럼 및 Droppable 영역 구현

**작업 항목**:

1. **src/kanban/KanbanColumn.tsx** 구현
   ```typescript
   // 핵심 기능
   - useDroppable({ id: columnId })
   - SortableContext (verticalListSortingStrategy)
   - 컬럼 헤더 (제목 + 태스크 개수)
   - 호버 하이라이트 (isOver ? ring-2 ring-blue-400)
   - Feature List 컬럼에 "+" 버튼 추가
   ```

2. **스타일**:
   ```css
   flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4
   min-h-[200px] /* 빈 컬럼 높이 유지 */
   ```

**검증 기준**:
- 드래그 시 컬럼 하이라이트 표시
- 태스크 개수 배지 정확히 표시

---

### 2.6 M6: KanbanCard 컴포넌트 구현

**목표**: 드래그 가능한 태스크 카드 구현

**작업 항목**:

1. **src/kanban/KanbanCard.tsx** 구현
   ```typescript
   // 핵심 기능
   - useSortable({ id: task.id })
   - CSS.Transform.toString(transform)
   - onClick 핸들러 (모달 열기)
   - 상태 배지 (Design, PRD, Code)
   - AI 생성 중 인디케이터
   ```

2. **스타일**:
   ```css
   // 기본
   bg-white rounded-lg p-4 shadow-sm border border-gray-200
   cursor-grab hover:shadow-md transition-shadow

   // 드래그 중
   opacity-50 rotate-3

   // AI 생성 중
   border-blue-400 animate-pulse
   ```

3. **상태 배지**:
   ```typescript
   {task.designDocument && (
     <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
       Design
     </span>
   )}
   ```

**검증 기준**:
- 카드 드래그 시 회전 효과
- 상태 배지 조건부 표시

---

### 2.7 M7: TaskDetailModal 구현

**목표**: 태스크 상세 정보 표시 및 편집 모달 구현

**작업 항목**:

1. **src/kanban/TaskDetailModal.tsx** 구현
   ```typescript
   // 핵심 기능
   - 제목 편집 (인라인 편집)
   - Feature List 표시
   - Design Document 표시 (react-markdown)
   - PRD 표시 (react-markdown)
   - Prototype 표시 (CodeMirror)
   - 삭제 버튼 + 확인 다이얼로그
   ```

2. **모달 UI**:
   ```css
   // 오버레이
   fixed inset-0 bg-black/50 flex items-center justify-center z-50

   // 모달 컨테이너
   bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto
   ```

3. **탭 구조**:
   - Feature (기본)
   - Design (designDocument 존재 시)
   - PRD (prd 존재 시)
   - Prototype (prototype 존재 시)

**검증 기준**:
- 모달 열기/닫기 동작
- 마크다운 렌더링 정상
- 삭제 확인 다이얼로그 표시

---

### 2.8 M8: 통합 테스트 및 최적화

**목표**: E2E 테스트 및 성능 최적화

**작업 항목**:

1. **통합 테스트**:
   - 드래그 앤 드롭 시나리오
   - API 오류 처리
   - 모바일 터치 테스트

2. **성능 최적화**:
   - React.memo로 불필요한 리렌더링 방지
   - 낙관적 업데이트 구현
   - 로딩 상태 최적화

3. **접근성 검증**:
   - 키보드 네비게이션 테스트
   - 스크린 리더 테스트
   - 색상 대비 검증

**검증 기준**:
- Lighthouse 접근성 점수 90+
- 드래그 앤 드롭 지연 < 100ms

---

## 3. 기술적 접근 방식

### 3.1 드래그 앤 드롭 아키텍처

```
                    KanbanBoard
                        │
              ┌─────────┼─────────┐
              │         │         │
         DndContext  DragOverlay  Columns[]
              │
    ┌─────────┼─────────┬─────────┐
    │         │         │         │
  Column    Column    Column    Column
(Droppable)(Droppable)(Droppable)(Droppable)
    │         │         │         │
  Cards[]   Cards[]   Cards[]   Cards[]
(Sortable) (Sortable) (Sortable) (Sortable)
```

### 3.2 상태 관리 흐름

```
User Action → Event Handler → Zustand Store → API Call → UI Update
                                   │
                                   ↓
                            Optimistic Update
                                   │
                                   ↓
                            API Success/Rollback
```

### 3.3 컴포넌트 계층

```
App.tsx
└── KanbanBoard.tsx (DndContext 제공)
    ├── KanbanColumn.tsx (Droppable) × 4
    │   └── KanbanCard.tsx (Draggable) × N
    ├── DragOverlay
    │   └── KanbanCard (미리보기)
    └── TaskDetailModal.tsx (조건부 렌더링)
```

---

## 4. 위험 요소 및 대응 계획

### 4.1 기술적 위험

| 위험 | 영향도 | 대응 계획 |
|------|--------|----------|
| @dnd-kit과 React 19 호환성 | 높음 | 설치 직후 기본 드래그 테스트 |
| 모바일 터치 이벤트 지원 | 중간 | @dnd-kit/core의 TouchSensor 활용 |
| 대량 태스크 렌더링 성능 | 중간 | 가상화 (react-window) 고려 |

### 4.2 대응 전략

1. **호환성 이슈 발생 시**:
   - @dnd-kit 버전 다운그레이드
   - react-beautiful-dnd 대안 검토

2. **성능 이슈 발생 시**:
   - React.memo 적용
   - useMemo/useCallback 최적화
   - 가상 스크롤 도입

---

## 5. 의존성 체크리스트

### 5.1 선행 조건 (SPEC-INIT-001)

- [ ] src/types/index.ts에 Task, TaskStatus 정의됨
- [ ] src/App.tsx에 기본 레이아웃 존재
- [ ] server/index.ts에 Express 서버 동작
- [ ] Zustand, Tailwind CSS 설치 완료

### 5.2 패키지 설치

```bash
# 필수
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 선택 (TaskDetailModal용)
npm install react-markdown remark-gfm
npm install @uiw/react-codemirror @codemirror/lang-markdown
```

---

## 6. 파일 생성 체크리스트

| 파일 경로 | 마일스톤 | 상태 |
|----------|----------|------|
| server/utils/taskStorage.ts | M2 | Pending |
| server/routes/tasks.ts | M2 | Pending |
| src/services/taskService.ts | M3 | Pending |
| src/store/taskStore.ts | M3 | Pending |
| src/kanban/KanbanBoard.tsx | M4 | Pending |
| src/kanban/KanbanColumn.tsx | M5 | Pending |
| src/kanban/KanbanCard.tsx | M6 | Pending |
| src/kanban/TaskDetailModal.tsx | M7 | Pending |

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
