# SPEC-PROJECT-001: 프로젝트(게임) 관리 기능

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-PROJECT-001 |
| 제목 | 프로젝트(게임) 관리 기능 |
| PRD Phase | 2.1 - 2.3 |
| 생성일 | 2026-01-02 |
| 상태 | Completed |
| 우선순위 | High |
| 의존성 | SPEC-SETUP-001 (완료) |
| 담당 에이전트 | expert-backend, expert-frontend |

---

## 1. 개요 (Overview)

### 1.1 배경

AI Workflow Kanban 시스템에서 여러 게임 프로젝트를 독립적으로 관리할 수 있는 기능이 필요합니다. 각 프로젝트는 독립된 시스템 문서와 기술 스택을 가지며, 사용자는 헤더 드롭다운을 통해 프로젝트 간 전환이 가능해야 합니다.

### 1.2 목표

- 게임 프로젝트 CRUD (Create, Read, Update, Delete) 기능 구현
- 프로젝트별 기술 스택 및 카테고리 정의
- 헤더 드롭다운을 통한 프로젝트 전환 UI 구현
- Zustand 기반 상태 관리 및 Express API 연동

### 1.3 범위

**포함**:
- Phase 2.1: 프로젝트 생성 (이름, 설명, 기술 스택, 카테고리)
- Phase 2.2: 프로젝트 선택/전환 (ProjectSelector in header)
- Phase 2.3: 프로젝트 설정 수정 및 삭제

**제외**:
- 시스템 문서 관리 (SPEC-SYSTEM-001)
- 칸반 보드 UI (SPEC-KANBAN-001)
- RootRule 자동 생성 (향후 SPEC)

---

## 2. 환경 (Environment)

### 2.1 기술 스택

**프론트엔드**:
- React 19
- TypeScript 5.9
- Zustand (상태 관리)
- Tailwind CSS 4

**백엔드**:
- Node.js 20.x LTS
- Express 4.x
- TypeScript 5.9

**저장소**:
- 파일 기반 저장 (workspace/projects/)
- JSON 메타데이터

### 2.2 기존 타입 정의

```typescript
// src/types/index.ts (기존 정의)
export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  categories: string[];
  defaultReferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}
```

### 2.3 디렉토리 구조

```
src/
  components/project/
    ProjectSelector.tsx      # 헤더 드롭다운
    ProjectCreateModal.tsx   # 프로젝트 생성 모달
    ProjectSettingsModal.tsx # 프로젝트 설정 모달
  services/
    projectService.ts        # API 통신
  store/
    projectStore.ts          # Zustand 상태 관리

server/
  routes/
    projects.ts              # Express API 라우트

workspace/
  projects/
    {project_id}/
      project.json           # 프로젝트 메타데이터
```

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [HIGH] Node.js 20.x LTS 및 npm이 설치되어 있음
- [HIGH] SPEC-SETUP-001의 개발 환경 구축이 완료되어 있음
- [MEDIUM] Zustand가 프로젝트에 설치되어 있음 (없을 경우 설치 필요)
- [MEDIUM] uuid 패키지가 설치되어 있음 (없을 경우 설치 필요)

### 3.2 비즈니스 가정

- [HIGH] 단일 사용자 환경을 기본으로 함 (동시 접근 고려 불필요)
- [MEDIUM] 프로젝트 수는 100개 이하로 예상됨
- [LOW] 프로젝트 데이터 크기는 프로젝트당 1MB 이하

### 3.3 사용자 가정

- [HIGH] 사용자는 게임 기획자로서 프로젝트 관리 개념을 이해하고 있음
- [MEDIUM] 사용자는 기술 스택 용어(엔진, 서버 등)를 이해함

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항 (EARS 형식)

#### FR-001: 프로젝트 생성

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 프로젝트 ID를 UUID v4 형식으로 자동 생성해야 한다
- 시스템은 **항상** createdAt과 updatedAt을 ISO 8601 형식으로 저장해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 "새 프로젝트" 버튼을 클릭하면 **THEN** ProjectCreateModal이 열린다
- **WHEN** 사용자가 필수 필드(이름)를 입력하고 저장하면 **THEN** 프로젝트가 생성되고 목록에 추가된다
- **WHEN** 프로젝트가 성공적으로 생성되면 **THEN** 해당 프로젝트가 자동으로 선택된다

**State-Driven (IF-THEN)**:
- **IF** 프로젝트 이름이 비어있으면 **THEN** 저장 버튼을 비활성화한다
- **IF** 동일한 이름의 프로젝트가 존재하면 **THEN** 경고 메시지를 표시한다

#### FR-002: 프로젝트 목록 조회

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 프로젝트 목록을 생성일 기준 최신순으로 정렬한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 애플리케이션이 시작되면 **THEN** 모든 프로젝트 목록을 로드한다
- **WHEN** 프로젝트 목록 로드에 실패하면 **THEN** 에러 메시지를 표시한다

**State-Driven (IF-THEN)**:
- **IF** 저장된 프로젝트가 없으면 **THEN** "프로젝트가 없습니다. 새 프로젝트를 만들어주세요" 메시지를 표시한다
- **IF** 프로젝트가 1개 이상 존재하면 **THEN** 첫 번째 프로젝트를 자동으로 선택한다

#### FR-003: 프로젝트 선택/전환

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 헤더의 ProjectSelector 드롭다운을 클릭하면 **THEN** 프로젝트 목록이 표시된다
- **WHEN** 사용자가 프로젝트를 선택하면 **THEN** currentProjectId가 업데이트된다
- **WHEN** 프로젝트가 전환되면 **THEN** 해당 프로젝트의 시스템 문서와 태스크가 로드된다

**State-Driven (IF-THEN)**:
- **IF** 현재 선택된 프로젝트가 있으면 **THEN** 드롭다운에서 해당 프로젝트명을 표시한다
- **IF** 프로젝트가 없으면 **THEN** "프로젝트 선택" placeholder를 표시한다

#### FR-004: 프로젝트 수정

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 프로젝트 설정 버튼(기어 아이콘)을 클릭하면 **THEN** ProjectSettingsModal이 열린다
- **WHEN** 사용자가 프로젝트 정보를 수정하고 저장하면 **THEN** 변경사항이 저장된다
- **WHEN** 프로젝트가 성공적으로 수정되면 **THEN** 성공 토스트 메시지를 표시한다

**State-Driven (IF-THEN)**:
- **IF** 수정된 내용이 없으면 **THEN** 저장 버튼을 비활성화한다

#### FR-005: 프로젝트 삭제

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 삭제 버튼을 클릭하면 **THEN** 확인 다이얼로그가 표시된다
- **WHEN** 사용자가 삭제를 확인하면 **THEN** 프로젝트와 관련 데이터가 삭제된다
- **WHEN** 프로젝트가 삭제되면 **THEN** 목록에서 제거되고 다른 프로젝트가 자동 선택된다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 확인 없이 프로젝트를 삭제**하지 않아야 한다**
- 시스템은 마지막 프로젝트 삭제 시 데이터 유실 경고 없이 삭제**하지 않아야 한다**

### 4.2 비기능 요구사항

#### NFR-001: 성능

- 프로젝트 목록 로드: 500ms 이내
- 프로젝트 생성/수정/삭제: 1초 이내
- 프로젝트 전환: 200ms 이내

#### NFR-002: 사용성

- 모달 창은 ESC 키로 닫을 수 있어야 한다
- 폼 입력 중 Enter 키로 저장할 수 있어야 한다
- 드롭다운은 키보드 네비게이션을 지원해야 한다

#### NFR-003: 데이터 무결성

- 프로젝트 삭제 시 관련 workspace 데이터도 삭제되어야 한다
- 저장 실패 시 기존 데이터가 손상되지 않아야 한다

---

## 5. 제약사항 (Constraints)

### 5.1 기술적 제약

- 파일 기반 저장소 사용 (데이터베이스 사용 불가)
- Express 서버를 통한 파일 I/O 필수
- Zustand 상태 관리 패턴 준수

### 5.2 UI 제약

- Tailwind CSS 유틸리티 클래스 사용
- 반응형 디자인 (최소 너비 1024px)
- 모달 컴포넌트는 common/ConfirmDialog.tsx 패턴 준수

### 5.3 API 제약

- RESTful API 설계 원칙 준수
- JSON 응답 형식 표준화 (ApiResponse<T> 타입 사용)
- 에러 코드 표준화 (400, 404, 500)

---

## 6. 명세 (Specifications)

### 6.1 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/projects | 프로젝트 목록 조회 | - | ApiResponse<Project[]> |
| GET | /api/projects/:id | 프로젝트 상세 조회 | - | ApiResponse<Project> |
| POST | /api/projects | 프로젝트 생성 | CreateProjectDto | ApiResponse<Project> |
| PUT | /api/projects/:id | 프로젝트 수정 | UpdateProjectDto | ApiResponse<Project> |
| DELETE | /api/projects/:id | 프로젝트 삭제 | - | ApiResponse<void> |

### 6.2 데이터 전송 객체 (DTO)

```typescript
// CreateProjectDto
interface CreateProjectDto {
  name: string;           // 필수, 1-100자
  description?: string;   // 선택, 0-500자
  techStack?: string[];   // 선택, 기술 스택 목록
  categories?: string[];  // 선택, 카테고리 목록
  defaultReferences?: string[]; // 선택, 기본 참조 문서 ID
}

// UpdateProjectDto
interface UpdateProjectDto {
  name?: string;
  description?: string;
  techStack?: string[];
  categories?: string[];
  defaultReferences?: string[];
}
```

### 6.3 컴포넌트 명세

#### ProjectSelector.tsx

- 위치: Header 컴포넌트 내부
- 기능: 프로젝트 선택 드롭다운
- Props: 없음 (Zustand store 직접 사용)
- 상태: isOpen (드롭다운 열림/닫힘)

#### ProjectCreateModal.tsx

- 기능: 새 프로젝트 생성 폼
- Props: isOpen, onClose, onSuccess
- 필드: name (필수), description, techStack, categories

#### ProjectSettingsModal.tsx

- 기능: 프로젝트 설정 수정 및 삭제
- Props: isOpen, onClose, projectId
- 탭: 기본 정보, 기술 스택, 카테고리, 위험 영역(삭제)

### 6.4 Zustand Store 명세

```typescript
// projectStore.ts
interface ProjectStore extends ProjectState {
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectDto) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => void;

  // Computed
  currentProject: Project | null;
}
```

### 6.5 파일 저장 구조

```
workspace/
  projects/
    {project_id}/
      project.json          # 프로젝트 메타데이터
      RootRule.md           # 중앙 도그마 (빈 파일로 초기화)
      systems/              # 시스템 문서 폴더 (빈 폴더)
        systems.json        # 시스템 메타데이터 (빈 배열)
      tasks/                # 태스크 폴더 (빈 폴더)
      archives/             # 아카이브 폴더 (빈 폴더)
```

---

## 7. 추적성 (Traceability)

### 7.1 PRD 매핑

| 요구사항 | PRD 항목 | 수락 기준 |
|----------|----------|-----------|
| FR-001 | Feature 1 - 프로젝트 생성 | AC-001, AC-002 |
| FR-002 | Feature 1 - 프로젝트 조회 | AC-003 |
| FR-003 | Feature 1 - 프로젝트 선택/전환 | AC-004, AC-005 |
| FR-004 | Feature 1 - 프로젝트 설정 수정 | AC-006 |
| FR-005 | Feature 1 - 프로젝트 삭제 | AC-007, AC-008 |

### 7.2 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| ProjectSelector | src/components/project/ProjectSelector.tsx | expert-frontend |
| ProjectCreateModal | src/components/project/ProjectCreateModal.tsx | expert-frontend |
| ProjectSettingsModal | src/components/project/ProjectSettingsModal.tsx | expert-frontend |
| projectService | src/services/projectService.ts | expert-frontend |
| projectStore | src/store/projectStore.ts | expert-frontend |
| projects route | server/routes/projects.ts | expert-backend |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
| 1.1 | 2026-01-02 | 구현 완료 - 상태 Completed로 변경 |
| 1.2 | 2026-01-04 | 기술 스택 버전 업데이트 (React 19, TypeScript 5.9, Tailwind CSS 4) |
