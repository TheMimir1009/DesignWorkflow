# SPEC-TASK-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-TASK-001 |
| 관련 SPEC | spec.md, acceptance.md |
| 작성일 | 2026-01-03 |

---

## 1. 마일스톤 (우선순위 기반)

### Primary Goal: 핵심 CRUD 기능 구현

**목표**: 태스크 생성, 수정, 삭제의 기본 기능 완성

**작업 항목**:

1. TaskStore 확장
   - createTask, updateTask, deleteTask 액션 추가
   - 모달 상태 관리 (selectedTask, isOpen 플래그)
   - 낙관적 업데이트 및 롤백 로직

2. TaskService 확장
   - createTask(dto) API 호출 함수
   - updateTask(id, dto) API 호출 함수
   - deleteTask(id) API 호출 함수

3. Backend API 확장 (server/routes/tasks.ts)
   - POST /api/projects/:projectId/tasks
   - PUT /api/tasks/:id
   - DELETE /api/tasks/:id

**완료 기준**: 기본 CRUD가 API를 통해 동작

---

### Secondary Goal: UI 컴포넌트 구현

**목표**: 사용자 인터페이스 컴포넌트 완성

**작업 항목**:

1. TaskCreateModal.tsx 구현
   - 제목 입력 필드
   - 기본 참조 시스템 자동 적용
   - 생성/취소 버튼
   - 로딩 및 에러 상태 처리

2. TaskEditModal.tsx 구현
   - 마크다운 에디터 통합
   - 변경 감지 및 확인 다이얼로그
   - 저장/취소 버튼
   - TaskReferences 컴포넌트 포함

3. TaskDeleteConfirm.tsx 구현
   - 확인 다이얼로그 UI
   - 경고 메시지 표시
   - AI 생성 중 삭제 방지

4. TaskReferences.tsx 구현
   - 참조 태그 목록 표시
   - 태그 추가/제거 기능
   - 검색 드롭다운

5. MarkdownEditor.tsx 구현 (공용)
   - 마크다운 입력 영역
   - 미리보기 탭 (선택사항)
   - 기본 툴바 (볼드, 이탤릭, 리스트)

**완료 기준**: 모든 UI 컴포넌트가 스토리북 또는 통합 테스트 통과

---

### Final Goal: 통합 및 접근성

**목표**: 칸반 보드와 통합 및 접근성 완성

**작업 항목**:

1. KanbanBoard 통합
   - `[+ New Task]` 버튼 추가
   - 카드 클릭 시 TaskEditModal 연결
   - 삭제 버튼 및 TaskDeleteConfirm 연결

2. 접근성 (A11y) 적용
   - ARIA 레이블 추가
   - 포커스 트랩 구현
   - 키보드 네비게이션 (ESC, Tab)

3. 성능 최적화
   - 모달 lazy loading
   - 마크다운 에디터 debounce

**완료 기준**: E2E 테스트 및 접근성 테스트 통과

---

### Optional Goal: 고급 기능

**목표**: 사용자 경험 향상

**작업 항목**:

1. 자동 저장 기능 (30초마다)
2. 마크다운 미리보기 탭
3. 참조 시스템 미리보기 팝오버
4. 애니메이션 효과 (모달 열기/닫기, 카드 추가)

**완료 기준**: 기능 동작 확인

---

## 2. 기술적 접근

### 2.1 상태 관리 전략

**Zustand Store 구조**:

```
TaskStore
  - tasks: Task[]
  - selectedTask: Task | null
  - isCreateModalOpen: boolean
  - isEditModalOpen: boolean
  - isDeleteConfirmOpen: boolean
  - isLoading: boolean
  - error: string | null

Actions:
  - createTask(dto) -> 낙관적 업데이트 -> API 호출 -> 성공/롤백
  - updateTask(id, dto) -> 낙관적 업데이트 -> API 호출 -> 성공/롤백
  - deleteTask(id) -> 낙관적 삭제 -> API 호출 -> 성공/롤백
```

### 2.2 컴포넌트 계층 구조

```
KanbanBoard
  +-- [+ New Task] 버튼 -> TaskCreateModal
  +-- KanbanColumn
        +-- KanbanCard
              +-- onClick -> TaskEditModal
              +-- 삭제 버튼 -> TaskDeleteConfirm

TaskEditModal
  +-- MarkdownEditor
  +-- TaskReferences
```

### 2.3 API 설계

**요청/응답 예시**:

POST /api/projects/:projectId/tasks
```json
Request:
{
  "title": "새 기능 기획",
  "featureList": "",
  "references": ["system-001", "system-002"]
}

Response:
{
  "success": true,
  "data": {
    "id": "task-001",
    "projectId": "project-001",
    "title": "새 기능 기획",
    "status": "featurelist",
    "featureList": "",
    "references": ["system-001", "system-002"],
    "createdAt": "2026-01-03T10:00:00Z",
    "updatedAt": "2026-01-03T10:00:00Z"
  }
}
```

---

## 3. TDD 접근 (RED-GREEN-REFACTOR)

### 3.1 테스트 우선순위

**Priority High - 단위 테스트**:

1. TaskStore 테스트
   - createTask 성공/실패 케이스
   - updateTask 낙관적 업데이트 및 롤백
   - deleteTask 및 모달 상태 관리

2. TaskService 테스트
   - API 호출 성공/실패 케이스
   - 에러 핸들링

**Priority Medium - 컴포넌트 테스트**:

3. TaskCreateModal 테스트
   - 렌더링 (열기/닫기)
   - 제목 입력 및 유효성 검사
   - 생성 버튼 클릭 및 API 호출

4. TaskEditModal 테스트
   - 마크다운 에디터 렌더링
   - 변경 감지 및 저장
   - 취소 시 확인 다이얼로그

5. TaskDeleteConfirm 테스트
   - 확인/취소 동작
   - AI 생성 중 삭제 방지

6. TaskReferences 테스트
   - 태그 렌더링
   - 추가/제거 동작

**Priority Low - 통합 테스트**:

7. KanbanBoard 통합 테스트
   - 태스크 생성 후 보드에 추가 확인
   - 카드 클릭 후 편집 모달 열기 확인
   - 삭제 후 보드에서 제거 확인

### 3.2 테스트 파일 구조

```
src/
  components/task/
    __tests__/
      TaskCreateModal.test.tsx
      TaskEditModal.test.tsx
      TaskDeleteConfirm.test.tsx
      TaskReferences.test.tsx
  store/
    __tests__/
      taskStore.test.ts
  services/
    __tests__/
      taskService.test.ts

tests/
  integration/
    task-management.test.tsx
```

---

## 4. 아키텍처 설계 방향

### 4.1 컴포넌트 설계 원칙

- **단일 책임**: 각 컴포넌트는 하나의 역할만 담당
- **Props 인터페이스**: 명확한 타입 정의로 재사용성 확보
- **제어 컴포넌트**: 모든 폼 입력은 제어 컴포넌트로 구현

### 4.2 상태 관리 원칙

- **Zustand 단일 스토어**: 전역 상태는 TaskStore에서 관리
- **로컬 상태 최소화**: 폼 입력 등 일시적 상태만 로컬 관리
- **낙관적 업데이트**: 사용자 경험 향상을 위해 즉시 UI 반영

### 4.3 에러 처리 전략

- **API 에러**: taskStore.error에 저장, 토스트로 표시
- **유효성 에러**: 인라인 에러 메시지 표시
- **네트워크 에러**: 재시도 버튼 제공

---

## 5. 리스크 및 대응 계획

### 리스크 1: 마크다운 에디터 복잡도

**위험**: 고급 마크다운 에디터 구현에 예상보다 많은 시간 소요
**대응**:
- 1차: 기본 textarea + react-markdown 미리보기
- 2차: 필요 시 외부 라이브러리 (예: @uiw/react-md-editor) 도입

### 리스크 2: 모달 접근성

**위험**: 포커스 트랩 및 키보드 네비게이션 구현 복잡
**대응**:
- 1차: 기본 기능 먼저 구현
- 2차: @radix-ui/react-dialog 또는 HeadlessUI 도입 검토

### 리스크 3: 기존 코드와의 충돌

**위험**: SPEC-KANBAN-001 구현과의 통합 시 충돌
**대응**:
- 기존 taskStore 확장 방식 유지
- 기존 테스트가 깨지지 않도록 점진적 확장

---

## 6. 예상 작업 범위

### 6.1 생성할 파일 목록

**신규 컴포넌트**:
- src/components/task/TaskCreateModal.tsx
- src/components/task/TaskEditModal.tsx
- src/components/task/TaskDeleteConfirm.tsx
- src/components/task/TaskReferences.tsx
- src/components/common/MarkdownEditor.tsx
- src/components/common/ConfirmDialog.tsx

**수정할 파일**:
- src/store/taskStore.ts (확장)
- src/services/taskService.ts (확장)
- src/types/index.ts (DTO 타입 추가)
- src/components/kanban/KanbanBoard.tsx (버튼 추가)
- src/components/kanban/KanbanCard.tsx (클릭 이벤트 추가)
- server/routes/tasks.ts (API 확장)

### 6.2 테스트 파일 목록

- src/components/task/__tests__/TaskCreateModal.test.tsx
- src/components/task/__tests__/TaskEditModal.test.tsx
- src/components/task/__tests__/TaskDeleteConfirm.test.tsx
- src/components/task/__tests__/TaskReferences.test.tsx
- src/components/common/__tests__/MarkdownEditor.test.tsx
- src/store/__tests__/taskStore.extended.test.ts
- src/services/__tests__/taskService.extended.test.ts
- tests/integration/task-management.test.tsx

---

## 7. 전문가 상담 권장

### 7.1 프론트엔드 전문가 (expert-frontend)

**상담 범위**:
- 마크다운 에디터 라이브러리 선택
- 모달 접근성 구현 패턴
- 애니메이션 및 트랜지션 효과

### 7.2 백엔드 전문가 (expert-backend)

**상담 범위**:
- API 엔드포인트 설계 검토
- 파일 시스템 기반 데이터 저장 최적화
- 동시성 처리 (여러 사용자 동시 편집 시)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-03 | 초안 작성 |
