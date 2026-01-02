# SPEC-SYSTEM-001: 시스템 문서 관리 기능

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SYSTEM-001 |
| 제목 | 시스템 문서 관리 기능 (System Document Management) |
| PRD Phase | 2 - System Document Management |
| 생성일 | 2026-01-02 |
| 상태 | Planned |
| 우선순위 | High |
| 의존성 | SPEC-PROJECT-001 (완료) |
| 담당 에이전트 | expert-backend, expert-frontend |

---

## 1. 개요 (Overview)

### 1.1 배경

AI Workflow Kanban 시스템에서 각 프로젝트별로 기존 기획 문서(시스템 문서)를 등록하고 카테고리/태그별로 분류하여 관리할 수 있는 기능이 필요합니다. 시스템 문서는 칸반 태스크 작성 시 참조 문서로 활용되며, 새로운 기획 문서 작성 시 기존 시스템과의 연관성을 파악하는 데 사용됩니다.

### 1.2 목표

- 시스템 문서 CRUD (Create, Read, Update, Delete) 기능 구현
- 카테고리별 그룹화 및 태그 기반 필터링
- 마크다운 에디터를 통한 직접 작성/수정
- 키워드 검색 기능 (100개 이상 문서 지원)
- E+A 패턴 기반 사이드바 UI 구현

### 1.3 범위

**포함**:
- Phase 3.1: 시스템 문서 CRUD API 및 저장소
- Phase 3.2: 시스템 문서 사이드바 UI (E+A 패턴)
- Phase 3.3: 카테고리/태그 필터링 및 검색

**제외**:
- 참조 시스템 선택 (SPEC-REFERENCE-001)
- 관련 시스템 자동 발견 (SPEC-DISCOVERY-001)
- 칸반 보드 통합 (SPEC-KANBAN-001)

---

## 2. 환경 (Environment)

### 2.1 기술 스택

**프론트엔드**:
- React 18.x
- TypeScript 5.x
- Zustand (상태 관리)
- Tailwind CSS 3.x
- react-markdown (마크다운 렌더링)

**백엔드**:
- Node.js 20.x LTS
- Express 4.x
- TypeScript 5.x

**저장소**:
- 파일 기반 저장 (workspace/projects/{project_id}/systems/)
- JSON 메타데이터 (systems.json)
- Markdown 콘텐츠 ({system_id}.md)

### 2.2 기존 타입 정의

```typescript
// src/types/index.ts (기존 정의)
export interface SystemDocument {
  id: string;
  projectId: string;
  name: string;
  category: string;
  tags: string[];
  content: string;
  dependencies: string[];  // 의존하는 다른 시스템 문서 ID
  createdAt: string;
  updatedAt: string;
}

export interface SystemDocumentState {
  documents: SystemDocument[];
  selectedDocumentIds: string[];
  isLoading: boolean;
  error: string | null;
}
```

### 2.3 디렉토리 구조

```
src/
  components/system/
    SystemSidebar.tsx         # 시스템 문서 사이드바 (E+A 패턴)
    SystemList.tsx            # 카테고리별 시스템 목록
    SystemCard.tsx            # 시스템 문서 카드
    SystemCreateModal.tsx     # 시스템 문서 생성 모달
    SystemEditModal.tsx       # 시스템 문서 수정 모달
    SystemPreview.tsx         # 시스템 문서 미리보기
    ReferenceTagBar.tsx       # 헤더 참조 태그 바 (후속 SPEC)
  services/
    systemDocService.ts       # API 통신
  store/
    systemStore.ts            # Zustand 상태 관리

server/
  routes/
    systems.ts                # Express API 라우트

workspace/
  projects/
    {project_id}/
      systems/
        systems.json          # 시스템 메타데이터 배열
        {system_id}.md        # 각 시스템 문서 콘텐츠
```

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [HIGH] SPEC-PROJECT-001의 프로젝트 관리 기능이 완료되어 있음
- [HIGH] workspace/projects/{project_id}/systems/ 디렉토리가 프로젝트 생성 시 초기화됨
- [MEDIUM] react-markdown 패키지가 설치되어 있음 (없을 경우 설치 필요)
- [LOW] 마크다운 에디터 컴포넌트가 공통 컴포넌트로 구현됨

### 3.2 비즈니스 가정

- [HIGH] 단일 프로젝트당 시스템 문서 수는 100~200개 수준
- [HIGH] 사용자는 기획자로서 마크다운 문법에 익숙함
- [MEDIUM] 카테고리는 시스템, 콘텐츠, UI, 경제, 성장 등 5~10개 수준
- [LOW] 태그당 평균 문서 수는 10~20개 수준

### 3.3 사용자 가정

- [HIGH] 사용자는 기존 기획 문서를 카테고리/태그로 분류하는 개념을 이해함
- [MEDIUM] 사용자는 시스템 간 의존성 관계를 파악하고 있음

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항 (EARS 형식)

#### FR-001: 시스템 문서 생성

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 문서 ID를 UUID v4 형식으로 자동 생성해야 한다
- 시스템은 **항상** createdAt과 updatedAt을 ISO 8601 형식으로 저장해야 한다
- 시스템은 **항상** 문서 콘텐츠를 별도의 마크다운 파일로 저장해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 "시스템 문서 추가" 버튼을 클릭하면 **THEN** SystemCreateModal이 열린다
- **WHEN** 사용자가 필수 필드(이름, 카테고리)를 입력하고 저장하면 **THEN** 시스템 문서가 생성된다
- **WHEN** 시스템 문서가 성공적으로 생성되면 **THEN** 사이드바 목록이 업데이트되고 해당 카테고리가 확장된다

**State-Driven (IF-THEN)**:
- **IF** 문서 이름이 비어있으면 **THEN** 저장 버튼을 비활성화한다
- **IF** 카테고리가 선택되지 않으면 **THEN** 저장 버튼을 비활성화한다
- **IF** 동일 프로젝트 내 동일한 이름의 문서가 존재하면 **THEN** 경고 메시지를 표시한다

#### FR-002: 시스템 문서 목록 조회

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 시스템 문서 목록을 카테고리별로 그룹화하여 표시한다
- 시스템은 **항상** 각 카테고리 내에서 문서를 이름 알파벳순으로 정렬한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 프로젝트가 선택되면 **THEN** 해당 프로젝트의 시스템 문서 목록을 로드한다
- **WHEN** 프로젝트가 전환되면 **THEN** 이전 프로젝트의 문서 목록을 초기화하고 새 프로젝트의 문서를 로드한다
- **WHEN** 카테고리 헤더를 클릭하면 **THEN** 해당 카테고리가 펼쳐지거나 접힌다

**State-Driven (IF-THEN)**:
- **IF** 현재 프로젝트에 시스템 문서가 없으면 **THEN** "시스템 문서가 없습니다" 메시지를 표시한다
- **IF** 특정 카테고리에 문서가 없으면 **THEN** 해당 카테고리 섹션을 숨긴다

#### FR-003: 시스템 문서 검색 및 필터링

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 검색어를 입력하면 **THEN** 문서 이름과 태그에서 일치하는 항목을 필터링한다
- **WHEN** 사용자가 태그를 선택하면 **THEN** 해당 태그를 포함하는 문서만 표시한다
- **WHEN** 검색어나 태그 필터를 제거하면 **THEN** 전체 문서 목록을 표시한다

**State-Driven (IF-THEN)**:
- **IF** 검색 결과가 없으면 **THEN** "검색 결과가 없습니다" 메시지를 표시한다
- **IF** 검색어가 입력되어 있으면 **THEN** 검색 초기화 버튼을 표시한다

**Optional (가능하면)**:
- **가능하면** 검색 시 문서 콘텐츠 내용도 검색 대상에 포함한다
- **가능하면** 검색 결과에서 일치하는 키워드를 하이라이트 표시한다

#### FR-004: 시스템 문서 수정

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 문서 카드의 수정 버튼을 클릭하면 **THEN** SystemEditModal이 열린다
- **WHEN** 사용자가 문서를 수정하고 저장하면 **THEN** 변경사항이 저장된다
- **WHEN** 문서가 성공적으로 수정되면 **THEN** 성공 토스트 메시지를 표시한다

**State-Driven (IF-THEN)**:
- **IF** 수정된 내용이 없으면 **THEN** 저장 버튼을 비활성화한다
- **IF** 카테고리가 변경되면 **THEN** 문서가 새 카테고리로 이동한다

#### FR-005: 시스템 문서 삭제

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 삭제 버튼을 클릭하면 **THEN** 확인 다이얼로그가 표시된다
- **WHEN** 사용자가 삭제를 확인하면 **THEN** 시스템 문서와 마크다운 파일이 삭제된다
- **WHEN** 문서가 삭제되면 **THEN** 목록에서 제거되고 성공 토스트를 표시한다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 확인 없이 문서를 삭제**하지 않아야 한다**
- 시스템은 다른 문서에서 의존성으로 참조하는 문서를 경고 없이 삭제**하지 않아야 한다**

#### FR-006: 시스템 문서 미리보기

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 문서 카드의 미리보기 버튼(눈 아이콘)을 클릭하면 **THEN** SystemPreview가 표시된다
- **WHEN** 미리보기에서 수정 버튼을 클릭하면 **THEN** 미리보기가 닫히고 수정 모달이 열린다

**State-Driven (IF-THEN)**:
- **IF** 미리보기가 열려있으면 **THEN** 다른 문서 클릭 시 해당 문서의 미리보기로 전환한다

### 4.2 비기능 요구사항

#### NFR-001: 성능

- 시스템 문서 목록 로드: 500ms 이내 (100개 문서 기준)
- 검색 필터링: 입력 후 100ms 이내 결과 표시 (debounce 적용)
- 문서 생성/수정/삭제: 1초 이내
- 마크다운 미리보기 렌더링: 200ms 이내

#### NFR-002: 사용성

- 모달 창은 ESC 키로 닫을 수 있어야 한다
- 마크다운 에디터는 실시간 미리보기를 지원해야 한다
- 사이드바는 접기/펼치기가 가능해야 한다
- 태그 입력은 자동완성을 지원해야 한다

#### NFR-003: 데이터 무결성

- 문서 삭제 시 관련 마크다운 파일도 삭제되어야 한다
- 메타데이터와 콘텐츠 파일의 동기화가 보장되어야 한다
- 저장 실패 시 기존 데이터가 손상되지 않아야 한다

---

## 5. 제약사항 (Constraints)

### 5.1 기술적 제약

- 파일 기반 저장소 사용 (데이터베이스 사용 불가)
- 메타데이터는 systems.json에, 콘텐츠는 개별 .md 파일에 저장
- Express 서버를 통한 파일 I/O 필수
- Zustand 상태 관리 패턴 준수

### 5.2 UI 제약

- Tailwind CSS 유틸리티 클래스 사용
- E+A 패턴: 확장(Expand) + 액션(Action) 사이드바 구조
- 반응형 디자인 (최소 너비 1024px)
- 공통 컴포넌트 재사용 (MarkdownEditor, ConfirmDialog, Toast)

### 5.3 API 제약

- RESTful API 설계 원칙 준수
- 프로젝트 ID를 경로에 포함 (/api/projects/:projectId/systems)
- JSON 응답 형식 표준화 (ApiResponse<T> 타입 사용)
- 에러 코드 표준화 (400, 404, 500)

---

## 6. 명세 (Specifications)

### 6.1 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/projects/:projectId/systems | 시스템 문서 목록 조회 | - | ApiResponse<SystemDocument[]> |
| GET | /api/projects/:projectId/systems/:id | 시스템 문서 상세 조회 | - | ApiResponse<SystemDocument> |
| POST | /api/projects/:projectId/systems | 시스템 문서 생성 | CreateSystemDto | ApiResponse<SystemDocument> |
| PUT | /api/projects/:projectId/systems/:id | 시스템 문서 수정 | UpdateSystemDto | ApiResponse<SystemDocument> |
| DELETE | /api/projects/:projectId/systems/:id | 시스템 문서 삭제 | - | ApiResponse<void> |
| GET | /api/projects/:projectId/systems/categories | 카테고리 목록 조회 | - | ApiResponse<string[]> |
| GET | /api/projects/:projectId/systems/tags | 태그 목록 조회 | - | ApiResponse<string[]> |

### 6.2 데이터 전송 객체 (DTO)

```typescript
// CreateSystemDto
interface CreateSystemDto {
  name: string;           // 필수, 1-100자
  category: string;       // 필수
  tags?: string[];        // 선택, 태그 목록
  content?: string;       // 선택, 마크다운 콘텐츠
  dependencies?: string[]; // 선택, 의존 문서 ID 목록
}

// UpdateSystemDto
interface UpdateSystemDto {
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}
```

### 6.3 컴포넌트 명세

#### SystemSidebar.tsx

- 위치: 메인 레이아웃 좌측
- 기능: 시스템 문서 목록 및 필터링
- Props: 없음 (Zustand store 직접 사용)
- 상태: isCollapsed, expandedCategories, searchQuery, selectedTags

#### SystemList.tsx

- 기능: 카테고리별 그룹화된 문서 목록
- Props: documents, searchQuery, selectedTags, onDocumentClick
- 하위 컴포넌트: SystemCard

#### SystemCard.tsx

- 기능: 개별 시스템 문서 카드
- Props: document, onEdit, onDelete, onPreview
- UI: 이름, 카테고리 뱃지, 태그 목록, 액션 버튼

#### SystemCreateModal.tsx

- 기능: 새 시스템 문서 생성 폼
- Props: isOpen, onClose, onSuccess
- 필드: name (필수), category (필수), tags, content, dependencies

#### SystemEditModal.tsx

- 기능: 시스템 문서 수정 폼
- Props: isOpen, onClose, documentId, onSuccess
- 필드: name, category, tags, content, dependencies

#### SystemPreview.tsx

- 기능: 시스템 문서 마크다운 미리보기
- Props: document, onClose, onEdit
- UI: 마크다운 렌더링, 메타데이터 표시, 액션 버튼

### 6.4 Zustand Store 명세

```typescript
// systemStore.ts
interface SystemStore extends SystemDocumentState {
  // Additional state
  searchQuery: string;
  selectedTags: string[];
  expandedCategories: string[];
  previewDocumentId: string | null;

  // Actions
  fetchDocuments: (projectId: string) => Promise<void>;
  createDocument: (projectId: string, data: CreateSystemDto) => Promise<SystemDocument>;
  updateDocument: (projectId: string, id: string, data: UpdateSystemDto) => Promise<SystemDocument>;
  deleteDocument: (projectId: string, id: string) => Promise<void>;

  // Filter actions
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;

  // UI actions
  toggleCategory: (category: string) => void;
  setPreviewDocument: (id: string | null) => void;

  // Computed
  filteredDocuments: SystemDocument[];
  categories: string[];
  allTags: string[];
}
```

### 6.5 파일 저장 구조

```
workspace/
  projects/
    {project_id}/
      systems/
        systems.json          # 시스템 메타데이터 배열
        │   [
        │     {
        │       "id": "uuid",
        │       "projectId": "project-uuid",
        │       "name": "Character System",
        │       "category": "System",
        │       "tags": ["core", "player"],
        │       "dependencies": ["uuid-combat"],
        │       "createdAt": "ISO8601",
        │       "updatedAt": "ISO8601"
        │     }
        │   ]
        {system_id}.md        # 각 시스템 문서 콘텐츠
```

---

## 7. 추적성 (Traceability)

### 7.1 PRD 매핑

| 요구사항 | PRD 항목 | 수락 기준 |
|----------|----------|-----------|
| FR-001 | Feature 2 - 시스템 문서 추가 | AC-001, AC-002 |
| FR-002 | Feature 2 - 카테고리 그룹화 | AC-003, AC-004 |
| FR-003 | Feature 2 - 태그 필터링/검색 | AC-005, AC-006 |
| FR-004 | Feature 2 - 시스템 문서 수정 | AC-007 |
| FR-005 | Feature 2 - 시스템 문서 삭제 | AC-008 |
| FR-006 | Feature 2 - 마크다운 에디터 | AC-009 |

### 7.2 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| SystemSidebar | src/components/system/SystemSidebar.tsx | expert-frontend |
| SystemList | src/components/system/SystemList.tsx | expert-frontend |
| SystemCard | src/components/system/SystemCard.tsx | expert-frontend |
| SystemCreateModal | src/components/system/SystemCreateModal.tsx | expert-frontend |
| SystemEditModal | src/components/system/SystemEditModal.tsx | expert-frontend |
| SystemPreview | src/components/system/SystemPreview.tsx | expert-frontend |
| systemDocService | src/services/systemDocService.ts | expert-frontend |
| systemStore | src/store/systemStore.ts | expert-frontend |
| systems route | server/routes/systems.ts | expert-backend |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-02 | 초안 작성 |
