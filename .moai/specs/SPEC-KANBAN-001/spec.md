# SPEC-KANBAN-001: 칸반 보드 (Kanban Board)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-KANBAN-001 |
| **제목** | 칸반 보드 (Kanban Board) |
| **상태** | Planned |
| **우선순위** | HIGH |
| **복잡도** | MODERATE-HIGH |
| **생성일** | 2026-01-15 |
| **작성자** | workflow-spec |
| **의존성** | SPEC-INIT-001 (프로젝트 초기화) |
| **관련 문서** | PRD-DesignWorkflow-Implementation-Guide-v2.md Section 4.4 |

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
| **드래그앤드롭** | @dnd-kit/core | 6.x | 접근성 지원, 모바일 터치 |
| **드래그앤드롭** | @dnd-kit/sortable | 8.x | 정렬 가능 리스트 |
| **백엔드** | Express | 5.x | ESM 모드, async 라우터 |

### 1.3 컴포넌트 구조 (목표 상태)

```
src/
├── kanban/                     # 칸반 보드 컴포넌트
│   ├── KanbanBoard.tsx         # 보드 컨테이너 (DndContext 제공)
│   ├── KanbanColumn.tsx        # 칸반 컬럼 (Droppable)
│   ├── KanbanCard.tsx          # 태스크 카드 (Draggable)
│   └── TaskDetailModal.tsx     # 태스크 상세 모달
│
├── store/                      # Zustand 상태 관리
│   └── taskStore.ts            # 태스크 CRUD, 드래그 상태
│
├── services/                   # API 통신 레이어
│   └── taskService.ts          # 태스크 API 클라이언트
│
└── types/
    └── index.ts                # Task, TaskStatus 타입
```

---

## 2. Assumptions (가정)

### 2.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 위험 시 영향 | 검증 방법 |
|----|------|--------|------|-------------|----------|
| A1 | SPEC-INIT-001이 완료되어 프로젝트 구조가 존재함 | 높음 | 의존성 SPEC | 컴포넌트 마운트 실패 | `ls src/types/index.ts` |
| A2 | Express 서버가 포트 3001에서 동작 중 | 높음 | Phase 1 완료 | API 호출 실패 | `curl localhost:3001/api/health` |
| A3 | @dnd-kit 라이브러리가 React 19와 호환됨 | 중간 | 공식 문서 확인 필요 | 드래그 기능 불가 | npm 설치 후 테스트 |
| A4 | 모바일 터치 이벤트가 @dnd-kit에서 지원됨 | 중간 | 공식 문서 명시 | 모바일 UX 저하 | 모바일 시뮬레이터 테스트 |

### 2.2 비즈니스 가정

| ID | 가정 | 신뢰도 | 근거 |
|----|------|--------|------|
| B1 | 4단계 워크플로우 순서는 고정됨 (Feature → Design → PRD → Prototype) | 높음 | PRD 명세 |
| B2 | 태스크는 역방향 이동이 가능함 (PRD → Design 등) | 높음 | PRD 명세 |
| B3 | LLM 연동은 별도 SPEC에서 구현 (이번 SPEC 범위 외) | 높음 | Phase 분리 |
| B4 | Q&A 시스템 연동은 별도 SPEC에서 구현 | 높음 | Phase 분리 |

---

## 3. Requirements (EARS 형식 요구사항)

### 3.1 Ubiquitous Requirements (항상 적용)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| UR-001 | 시스템은 **항상** 4개의 칸반 컬럼을 가로로 배치해야 한다 (Feature List, Design Doc, PRD, Prototype) | HIGH |
| UR-002 | 시스템은 **항상** 각 컬럼에 해당 단계의 태스크 개수를 표시해야 한다 | MEDIUM |
| UR-003 | 시스템은 **항상** 태스크 카드에 제목과 상태 배지를 표시해야 한다 | HIGH |
| UR-004 | 시스템은 **항상** 드래그 중인 카드에 시각적 피드백(회전, 투명도)을 제공해야 한다 | MEDIUM |
| UR-005 | 시스템은 **항상** 현재 프로젝트에 속한 태스크만 표시해야 한다 | HIGH |

### 3.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 | 트리거 이벤트 |
|----|----------|---------------|
| ED-001 | **WHEN** 프로젝트 선택 **THEN** 해당 프로젝트의 모든 태스크를 칸반 보드에 로드해야 한다 | 프로젝트 변경 |
| ED-002 | **WHEN** 사용자가 태스크 카드를 드래그 시작 **THEN** DragOverlay로 미리보기를 표시해야 한다 | onDragStart |
| ED-003 | **WHEN** 사용자가 태스크 카드를 다른 컬럼에 드롭 **THEN** 태스크 상태를 업데이트하고 API를 호출해야 한다 | onDragEnd |
| ED-004 | **WHEN** 사용자가 태스크 카드를 클릭 **THEN** TaskDetailModal을 열어야 한다 | onClick |
| ED-005 | **WHEN** 새 태스크 생성 버튼 클릭 **THEN** Feature List 컬럼에 새 태스크를 추가해야 한다 | onClick |
| ED-006 | **WHEN** 태스크 삭제 확인 **THEN** API를 호출하여 태스크를 삭제하고 UI에서 제거해야 한다 | onDelete |
| ED-007 | **WHEN** 드롭 대상 컬럼 위에 호버 **THEN** 해당 컬럼에 하이라이트(ring-2)를 표시해야 한다 | isOver |

### 3.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 | 조건 상태 |
|----|----------|----------|
| SD-001 | **IF** 현재 프로젝트가 선택되지 않음 **THEN** "프로젝트를 선택하세요" 메시지를 표시해야 한다 | currentProject === null |
| SD-002 | **IF** 태스크 로딩 중 **THEN** 로딩 인디케이터를 표시해야 한다 | isLoading === true |
| SD-003 | **IF** 컬럼에 태스크가 없음 **THEN** 빈 상태 영역(min-h-[200px])을 유지해야 한다 | tasks.length === 0 |
| SD-004 | **IF** 태스크가 AI 생성 중 **THEN** 카드에 애니메이션 펄스와 "AI 생성 중..." 텍스트를 표시해야 한다 | generatingTaskIds.includes(task.id) |
| SD-005 | **IF** 태스크에 Design Doc이 있음 **THEN** 녹색 "Design" 배지를 표시해야 한다 | task.designDocument !== null |
| SD-006 | **IF** 태스크에 PRD가 있음 **THEN** 보라색 "PRD" 배지를 표시해야 한다 | task.prd !== null |
| SD-007 | **IF** 태스크에 Prototype이 있음 **THEN** 주황색 "Code" 배지를 표시해야 한다 | task.prototype !== null |
| SD-008 | **IF** 모바일 뷰포트 **THEN** 가로 스크롤을 활성화해야 한다 | viewport.width < 1280px |

### 3.4 Unwanted Behavior Requirements (비정상 상황)

| ID | 요구사항 | 금지 동작 |
|----|----------|----------|
| UW-001 | 시스템은 드래그 앤 드롭 중 페이지 스크롤을 **방지하지 않아야 한다** (모바일 UX) | 스크롤 차단 금지 |
| UW-002 | 시스템은 API 오류 시 사용자 입력을 **손실하지 않아야 한다** (낙관적 업데이트 롤백) | 데이터 손실 금지 |
| UW-003 | 시스템은 다른 프로젝트의 태스크를 **표시하지 않아야 한다** | 프로젝트 격리 위반 금지 |
| UW-004 | 시스템은 AI 생성 중인 태스크를 **드래그할 수 없도록 해야 한다** | 생성 중 이동 금지 |
| UW-005 | 시스템은 삭제 확인 없이 태스크를 **삭제하지 않아야 한다** | 즉시 삭제 금지 |

### 3.5 Optional Feature Requirements (선택 기능)

| ID | 요구사항 | 조건 |
|----|----------|------|
| OF-001 | **가능하면** 키보드 네비게이션(Tab, Enter, Space)을 지원하여 접근성 제공 | a11y 지원 |
| OF-002 | **가능하면** 태스크 카드에 카테고리 태그를 표시 | 카테고리 데이터 존재 |
| OF-003 | **가능하면** 컬럼 내 태스크 순서 재정렬(SortableContext) 지원 | 정렬 기능 |
| OF-004 | **가능하면** 다크 모드 테마 지원 | 시스템 설정 감지 |

---

## 4. Specifications (상세 명세)

### 4.1 KanbanBoard.tsx 컴포넌트

**역할**: 칸반 보드 컨테이너, DndContext 제공

```typescript
// 핵심 구조
interface KanbanBoardProps {
  // 프로젝트 ID는 useProjectStore에서 가져옴
}

// 컬럼 정의
const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'featurelist', title: 'Feature List' },
  { id: 'design', title: 'Design Document' },
  { id: 'prd', title: 'PRD' },
  { id: 'prototype', title: 'Prototype' },
];

// 주요 상태
- activeTask: Task | null  // 드래그 중인 태스크

// 주요 핸들러
- handleDragStart: DragStartEvent 처리
- handleDragEnd: DragEndEvent 처리, 상태 업데이트

// DndContext 설정
- collisionDetection: closestCenter
- DragOverlay로 드래그 미리보기
```

### 4.2 KanbanColumn.tsx 컴포넌트

**역할**: 단일 칸반 컬럼, Droppable 영역

```typescript
interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  generatingTaskIds: string[];
  onAddTask?: () => void;  // Feature List 컬럼에만 표시
}

// 스타일
- 기본: bg-gray-100 rounded-lg p-4 w-80
- 호버 시: ring-2 ring-blue-400 (isOver 상태)
- 헤더: title + 태스크 개수 배지
```

### 4.3 KanbanCard.tsx 컴포넌트

**역할**: 태스크 카드, Draggable 요소

```typescript
interface KanbanCardProps {
  task: Task;
  isGenerating: boolean;
  isDragging?: boolean;
  onClick?: () => void;
}

// 스타일
- 기본: bg-white rounded-lg p-4 shadow-sm border border-gray-200
- 드래그 중: opacity-50 rotate-3
- AI 생성 중: border-blue-400 animate-pulse
- 호버: shadow-md transition-shadow

// 콘텐츠
- 제목 (h4, font-medium)
- 설명 (line-clamp-2로 2줄 제한)
- 상태 배지 (Design, PRD, Code)
- AI 생성 중 인디케이터
```

### 4.4 TaskDetailModal.tsx 컴포넌트

**역할**: 태스크 상세 정보 표시 및 편집

```typescript
interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

// 콘텐츠 섹션
- 제목 (편집 가능)
- Feature List 설명
- Design Document (react-markdown 렌더링)
- PRD (react-markdown 렌더링)
- Prototype (CodeMirror 코드 표시)
- 삭제 버튼 (확인 다이얼로그 포함)
```

### 4.5 taskStore.ts (Zustand)

**역할**: 태스크 상태 관리

```typescript
interface TaskStoreState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  generatingTaskIds: string[];
}

interface TaskStoreActions {
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setGenerating: (taskId: string, generating: boolean) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  clearError: () => void;
}
```

### 4.6 taskService.ts (API 클라이언트)

**역할**: 백엔드 API 통신

```typescript
// API 엔드포인트
GET    /api/projects/:pid/tasks      // 태스크 목록 조회
POST   /api/projects/:pid/tasks      // 태스크 생성
GET    /api/tasks/:id                // 단일 태스크 조회
PUT    /api/tasks/:id                // 태스크 업데이트
PUT    /api/tasks/:id/status         // 상태만 업데이트
DELETE /api/tasks/:id                // 태스크 삭제

// 응답 형식
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
```

### 4.7 Task 타입 정의

```typescript
type TaskStatus = 'featurelist' | 'design' | 'prd' | 'prototype';

interface Task {
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
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTaskDto {
  projectId: string;
  title: string;
  featureList: string;
  references?: string[];
}
```

---

## 5. Constraints (제약 조건)

### 5.1 기술적 제약

| ID | 제약 | 이유 |
|----|------|------|
| C1 | @dnd-kit/core 6.x 버전 사용 | React 19 호환성, 접근성 지원 |
| C2 | @dnd-kit/sortable 8.x 버전 사용 | 컬럼 내 정렬 기능 |
| C3 | DragOverlay 필수 사용 | 드래그 시 원본 카드 유지 |
| C4 | closestCenter collision detection 사용 | 중앙 기준 드롭 영역 계산 |

### 5.2 성능 제약

| ID | 제약 | 이유 |
|----|------|------|
| P1 | 단일 프로젝트당 최대 200개 태스크 | UI 렌더링 성능 |
| P2 | 카드 설명 2줄 제한 (line-clamp-2) | 레이아웃 일관성 |
| P3 | 낙관적 업데이트 적용 | UX 반응성 |

### 5.3 접근성 제약

| ID | 제약 | 이유 |
|----|------|------|
| A1 | ARIA 속성 필수 (role, aria-label) | 스크린 리더 지원 |
| A2 | 포커스 관리 필수 | 키보드 네비게이션 |
| A3 | 색상 대비 4.5:1 이상 | WCAG 2.1 준수 |

---

## 6. Dependencies (의존성)

### 6.1 선행 SPEC

| SPEC ID | 제목 | 필요 산출물 |
|---------|------|------------|
| SPEC-INIT-001 | 프로젝트 초기화 | 디렉토리 구조, 타입 정의, Express 서버 |

### 6.2 프로덕션 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @dnd-kit/core | ^6.0.0 | 드래그 앤 드롭 코어 |
| @dnd-kit/sortable | ^8.0.0 | 정렬 가능 리스트 |
| @dnd-kit/utilities | ^3.0.0 | CSS 유틸리티 |
| react-markdown | ^9.0.0 | 마크다운 렌더링 |
| remark-gfm | ^4.0.0 | GFM 지원 |

### 6.3 후속 SPEC (이번 SPEC 범위 외)

| SPEC ID | 제목 | 연관성 |
|---------|------|--------|
| SPEC-QA-001 | Q&A 시스템 | Feature → Design 이동 시 트리거 |
| SPEC-LLM-001 | LLM 연동 | Design/PRD/Prototype 생성 |

---

## 7. Traceability (추적성)

### 7.1 문서 연결

| 문서 | 관련 섹션 |
|------|----------|
| PRD-DesignWorkflow-Implementation-Guide-v2.md | Section 4.4 (Phase 3: 태스크 & 칸반 보드) |
| .moai/project/product.md | 핵심 기능 1. 칸반 보드 |
| .moai/project/structure.md | src/kanban/, src/store/, src/services/ |

### 7.2 TAG 블록

```
[SPEC-KANBAN-001] 칸반 보드 (Kanban Board)
├── [UR-001~005] Ubiquitous Requirements
├── [ED-001~007] Event-Driven Requirements
├── [SD-001~008] State-Driven Requirements
├── [UW-001~005] Unwanted Behavior Requirements
├── [OF-001~004] Optional Feature Requirements
├── Components
│   ├── KanbanBoard.tsx (DndContext 제공)
│   ├── KanbanColumn.tsx (Droppable)
│   ├── KanbanCard.tsx (Draggable)
│   └── TaskDetailModal.tsx (상세 모달)
├── State Management
│   └── taskStore.ts (Zustand)
└── API Integration
    └── taskService.ts
```

---

## 8. Lifecycle (SPEC 생명주기)

| 항목 | 값 |
|------|-----|
| **Lifecycle Level** | spec-anchored |
| **유지보수 정책** | 분기별 검토, UI 변경 시 업데이트 |
| **선행 SPEC** | SPEC-INIT-001 (프로젝트 초기화) |
| **후속 SPEC** | SPEC-QA-001 (Q&A 시스템), SPEC-LLM-001 (LLM 연동) |

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
