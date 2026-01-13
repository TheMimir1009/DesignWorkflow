# SPEC-KANBAN-001: 구현 계획 (Implementation Plan)

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-KANBAN-001 |
| 제목 | 칸반 보드 UI 구현 계획 |
| 생성일 | 2026-01-03 |
| 상태 | Planned |

---

## 1. 마일스톤 (Priority-Based)

### Primary Goal: 기본 칸반 보드 렌더링

**목표**: 4컬럼 칸반 보드 기본 구조 구현

**산출물**:
- KanbanBoard.tsx: DndContext 설정, 컬럼 렌더링
- KanbanColumn.tsx: 컬럼 헤더, 태스크 목록 표시
- KanbanCard.tsx: 기본 카드 UI
- taskStore.ts: 기본 상태 관리 확장

**완료 조건**:
- 4개 컬럼이 가로로 배치됨
- 각 컬럼에 해당 상태의 태스크가 표시됨
- 컬럼 헤더에 태스크 수가 표시됨

### Secondary Goal: 드래그앤드롭 기능

**목표**: @dnd-kit 기반 드래그앤드롭 상태 전환 구현

**산출물**:
- KanbanBoard.tsx: 드래그 이벤트 핸들러
- KanbanColumn.tsx: Droppable 영역 설정
- KanbanCard.tsx: Draggable 설정, 드래그 스타일
- taskService.ts: 상태 변경 API 연동

**완료 조건**:
- 카드를 드래그하여 다른 컬럼으로 이동 가능
- 드래그 중 시각적 피드백 제공
- 상태 변경이 서버에 저장됨

### Tertiary Goal: AI 트리거 연동

**목표**: 카드 이동 시 AI 문서 생성 트리거

**산출물**:
- taskStore.ts: AI 생성 상태 관리
- taskService.ts: AI 트리거 API 연동
- KanbanCard.tsx: 로딩/완료/에러 상태 표시

**완료 조건**:
- Feature List에서 Design Doc 이동 시 AI 트리거
- Design Doc에서 PRD 이동 시 AI 트리거
- PRD에서 Prototype 이동 시 AI 트리거
- 생성 중 로딩 인디케이터 표시

### Final Goal: 카드 상세 정보 및 접근성

**목표**: 카드 정보 완성 및 접근성 개선

**산출물**:
- KanbanCard.tsx: 참조 태그, 문서 미리보기, 수정 시간
- 접근성 개선: ARIA 레이블, 키보드 네비게이션
- 컨텍스트 메뉴: 드래그 대안 제공

**완료 조건**:
- 참조 시스템 태그가 카드에 표시됨
- 문서 미리보기 버튼 동작함
- 키보드로 카드 이동 가능

---

## 2. 기술 접근 방식

### 2.1 @dnd-kit 라이브러리 구성

```typescript
// 센서 구성
import {
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  }),
  useSensor(KeyboardSensor)
);
```

### 2.2 드래그앤드롭 플로우

```
1. onDragStart
   - 드래그 시작 카드 식별
   - 드래그 오버레이 활성화

2. onDragOver
   - 현재 위치한 컬럼 식별
   - 드롭 가능 영역 하이라이트

3. onDragEnd
   - 드롭 위치 확인
   - 상태 변경 API 호출 (optimistic update)
   - AI 트리거 조건 확인 및 실행
   - 실패 시 롤백
```

### 2.3 Optimistic Update 패턴

```typescript
// 낙관적 업데이트로 즉각적인 UI 반응
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const taskId = active.id as string;
  const newStatus = over.id as TaskStatus;
  const oldStatus = tasks.find(t => t.id === taskId)?.status;

  // 1. 즉시 UI 업데이트
  updateTaskStatusLocal(taskId, newStatus);

  try {
    // 2. 서버 동기화
    await taskService.updateStatus(taskId, newStatus);

    // 3. AI 트리거 (조건 충족 시)
    if (shouldTriggerAI(oldStatus, newStatus)) {
      await triggerAIGeneration(taskId, newStatus);
    }
  } catch (error) {
    // 4. 실패 시 롤백
    updateTaskStatusLocal(taskId, oldStatus);
    showErrorToast('상태 변경에 실패했습니다.');
  }
};
```

### 2.4 AI 트리거 로직

```typescript
const AI_TRIGGER_MAP = {
  'feature_list->design_doc': 'generate_design_document',
  'design_doc->prd': 'generate_prd',
  'prd->prototype': 'generate_prototype',
};

const shouldTriggerAI = (
  oldStatus: TaskStatus,
  newStatus: TaskStatus
): boolean => {
  const key = `${oldStatus}->${newStatus}`;
  return key in AI_TRIGGER_MAP;
};
```

---

## 3. 아키텍처 설계 방향

### 3.1 컴포넌트 계층 구조

```
<KanbanBoard>
  <DndContext>
    <SortableContext>
      <KanbanColumn id="feature_list">
        <KanbanCard />
        <KanbanCard />
      </KanbanColumn>
      <KanbanColumn id="design_doc">
        ...
      </KanbanColumn>
      <KanbanColumn id="prd">
        ...
      </KanbanColumn>
      <KanbanColumn id="prototype">
        ...
      </KanbanColumn>
    </SortableContext>
    <DragOverlay>
      <KanbanCard /> {/* 드래그 중인 카드 */}
    </DragOverlay>
  </DndContext>
</KanbanBoard>
```

### 3.2 상태 관리 구조

```typescript
// taskStore.ts
interface TaskState {
  // 데이터
  tasks: Task[];

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // AI 생성 상태
  generatingTasks: Set<string>;
  generationProgress: Map<string, number>;
}

interface TaskActions {
  // CRUD
  fetchTasks: (projectId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;

  // AI 관련
  triggerAIGeneration: (taskId: string, targetStatus: TaskStatus) => Promise<void>;
  checkAIStatus: (taskId: string) => Promise<void>;

  // 로컬 상태
  setGenerating: (taskId: string, isGenerating: boolean) => void;
  updateProgress: (taskId: string, progress: number) => void;

  // 계산된 값
  getTasksByStatus: (status: TaskStatus) => Task[];
  isTaskGenerating: (taskId: string) => boolean;
}
```

### 3.3 API 통신 패턴

```typescript
// taskService.ts
export const taskService = {
  // 태스크 목록 조회
  getTasks: (projectId: string) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`),

  // 상태 변경
  updateStatus: (taskId: string, status: TaskStatus) =>
    api.put<Task>(`/tasks/${taskId}/status`, { status }),

  // AI 트리거
  triggerAI: (taskId: string, targetStatus: TaskStatus) =>
    api.post<{ jobId: string }>(`/tasks/${taskId}/trigger-ai`, { targetStatus }),

  // AI 상태 확인
  checkAIStatus: (taskId: string) =>
    api.get<{ status: string; progress?: number }>(`/tasks/${taskId}/ai-status`),
};
```

---

## 4. 위험 및 대응 방안

### 4.1 기술적 위험

| 위험 | 영향도 | 발생 확률 | 대응 방안 |
|------|--------|----------|----------|
| @dnd-kit 호환성 이슈 | High | Low | 공식 예제 기반 구현, 버전 고정 |
| AI 생성 지연/실패 | High | Medium | 타임아웃 설정, 재시도 로직, 폴링 간격 조절 |
| 드래그 성능 저하 | Medium | Low | useMemo 최적화, 가상화 검토 |
| 상태 동기화 충돌 | Medium | Medium | optimistic update + 롤백 패턴 |

### 4.2 비즈니스 위험

| 위험 | 영향도 | 발생 확률 | 대응 방안 |
|------|--------|----------|----------|
| 사용자 혼란 (AI 트리거 시점) | Medium | Medium | 명확한 안내 UI, 확인 다이얼로그 |
| 의도치 않은 상태 변경 | Low | Low | 드래그 활성화 거리 설정 (8px) |

---

## 5. 의존성 설치

### 5.1 프론트엔드 패키지

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 5.2 백엔드 패키지

```bash
# 기존 패키지로 충분 (Express, cors)
# 추가 설치 불필요
```

---

## 6. 파일 생성 목록

### 6.1 신규 생성

| 파일 | 목적 |
|------|------|
| src/components/kanban/KanbanBoard.tsx | 메인 칸반 보드 컴포넌트 |
| src/components/kanban/KanbanColumn.tsx | 컬럼 컴포넌트 |
| src/components/kanban/KanbanCard.tsx | 카드 컴포넌트 |
| src/components/kanban/index.ts | 배럴 익스포트 |

### 6.2 수정/확장

| 파일 | 변경 내용 |
|------|----------|
| src/store/taskStore.ts | AI 생성 상태, 드래그 관련 액션 추가 |
| src/services/taskService.ts | 상태 변경, AI 트리거 API 추가 |
| src/types/index.ts | KanbanColumn 타입 추가 |
| server/routes/tasks.ts | 상태 변경, AI 트리거 엔드포인트 추가 |

---

## 7. 테스트 전략

### 7.1 단위 테스트

- KanbanColumn: 태스크 필터링 로직
- KanbanCard: 참조 태그 표시 로직
- taskStore: 상태 변경 액션

### 7.2 통합 테스트

- 드래그앤드롭 후 상태 변경 API 호출 확인
- AI 트리거 조건 확인

### 7.3 E2E 테스트

- 카드 드래그 → 컬럼 이동 → 상태 변경 플로우
- AI 생성 트리거 → 로딩 → 완료 플로우

---

## 8. 추적성

### 8.1 SPEC 참조

- **spec.md**: SPEC-KANBAN-001 요구사항 정의
- **acceptance.md**: Given-When-Then 수락 기준

### 8.2 관련 SPEC

| SPEC ID | 관계 | 설명 |
|---------|------|------|
| SPEC-PROJECT-001 | 의존 | 프로젝트 선택 기능 필요 |
| SPEC-TASK-001 | 후속 | 태스크 CRUD 기능 |
| SPEC-DOCUMENT-001 | 후속 | 문서 편집 모달 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-03 | 초안 작성 |
