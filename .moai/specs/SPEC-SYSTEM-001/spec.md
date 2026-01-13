<<<<<<< HEAD
# SPEC-SYSTEM-001: System Document Management

## TAG BLOCK

```yaml
spec_id: SPEC-SYSTEM-001
title: System Document Management
status: completed
priority: high
created: 2026-01-04
updated: 2026-01-04
lifecycle: spec-anchored
dependencies:
  - SPEC-PROJECT-001 (Project Management - completed)
blocks:
  - Reference System Selection (Feature 3)
  - Relevant Systems Auto-Discovery (Feature 8)
related_specs:
  - SPEC-PROJECT-001
  - SPEC-TASK-001
  - SPEC-KANBAN-001
```

---

## Environment

### Project Context

- **Project**: AI Workflow Kanban (design-workflow)
- **Domain**: Game Design Pipeline Workflow System
- **Current Progress**: 65% complete (Project, Kanban, Task, System management implemented)
- **Target Users**: Game system planners managing planning documents

### Technical Environment

- **Frontend**: React 19, TypeScript 5.9, Tailwind CSS 4, Zustand
- **Backend**: Node.js 20.x LTS, Express 4.x
- **Storage**: File-based (JSON metadata, Markdown content)
- **Existing Components**: MarkdownEditor, ConfirmDialog (reusable)

### Integration Points

- **Project Store**: Current project context for document scoping
- **Task System**: Reference documents for task creation
- **Future Dependencies**: Reference System Selection, Auto-Discovery features

---

## Assumptions

### Technical Assumptions

| Assumption | Confidence | Risk if Wrong | Validation Method |
|------------|------------|---------------|-------------------|
| File-based storage sufficient for 100+ documents | High | Performance degradation at scale | Load testing with 200 documents |
| Existing MarkdownEditor supports system document editing | High | Component modification needed | Feature verification |
| Express routing patterns from projects.ts work for systems | High | Minimal - consistent patterns | Pattern verification |

### Business Assumptions

| Assumption | Confidence | Risk if Wrong | Validation Method |
|------------|------------|---------------|-------------------|
| Users organize documents by category primarily | Medium | UI reorganization needed | User feedback collection |
| Tag-based filtering is essential for 100+ documents | High | Discovery becomes difficult | Usability testing |
| Dependent systems tracking is valuable | Medium | Feature underutilization | Usage analytics |

---

## Requirements

### Functional Requirements

#### FR-1: System Document CRUD Operations (Ubiquitous)

- **FR-1.1**: The system shall always provide the ability to create new system documents with name, category, tags, content, and dependent systems
- **FR-1.2**: The system shall always persist system documents to the file system in the project's systems directory
- **FR-1.3**: The system shall always validate system document names are unique within a project

#### FR-2: Category-Based Organization (Event-Driven)

- **FR-2.1**: WHEN a user selects a category filter THEN the system shall display only documents belonging to that category
- **FR-2.2**: WHEN a user creates a document THEN the system shall require category selection from predefined or custom categories
- **FR-2.3**: WHEN categories are displayed THEN the system shall group documents by category with collapsible sections

#### FR-3: Tag-Based Filtering (Event-Driven)

- **FR-3.1**: WHEN a user clicks a tag THEN the system shall filter the document list to show only documents with that tag
- **FR-3.2**: WHEN a user creates or edits a document THEN the system shall allow adding multiple tags via tag input component
- **FR-3.3**: WHEN multiple tags are selected THEN the system shall filter using AND logic (documents must have all selected tags)

#### FR-4: Document Search (Event-Driven)

- **FR-4.1**: WHEN a user enters search text THEN the system shall filter documents by name and content matching
- **FR-4.2**: WHEN search results are displayed THEN the system shall highlight matching terms in document names
- **FR-4.3**: WHEN search is performed THEN the system shall return results within 200ms for 100+ documents

#### FR-5: Markdown Content Management (Event-Driven)

- **FR-5.1**: WHEN a user opens the document editor THEN the system shall display the existing markdown content in the MarkdownEditor component
- **FR-5.2**: WHEN a user saves document changes THEN the system shall persist the markdown content to the file system
- **FR-5.3**: WHEN a document is previewed THEN the system shall render markdown to HTML with proper styling

#### FR-6: Sidebar Navigation (State-Driven)

- **FR-6.1**: IF the sidebar is in expanded state THEN the system shall display full document list with categories
- **FR-6.2**: IF the sidebar is in collapsed state THEN the system shall display compact icons only
- **FR-6.3**: IF no project is selected THEN the system shall disable the system document sidebar

### Non-Functional Requirements

#### NFR-1: Performance

- **NFR-1.1**: Document list shall render within 100ms for up to 100 documents
- **NFR-1.2**: Search results shall appear within 200ms of input
- **NFR-1.3**: Document save operations shall complete within 500ms

#### NFR-2: Usability

- **NFR-2.1**: Category grouping shall be collapsible with persistent state
- **NFR-2.2**: Tag input shall support autocomplete from existing tags
- **NFR-2.3**: Document preview shall be accessible via eye icon without opening edit modal

#### NFR-3: Reliability

- **NFR-3.1**: The system shall not allow duplicate document names within a project
- **NFR-3.2**: The system shall validate required fields before saving
- **NFR-3.3**: The system shall display appropriate error messages for failed operations

### Unwanted Requirements

- **UW-1**: The system shall not allow creating documents without a category
- **UW-2**: The system shall not allow empty document names
- **UW-3**: The system shall not delete documents without user confirmation

### Optional Requirements

- **OPT-1**: Where possible, provide drag-and-drop document reordering within categories
- **OPT-2**: Where possible, provide bulk tag editing for multiple documents
- **OPT-3**: Where possible, provide document export to standalone markdown files

---

## Specifications

### Data Model

```typescript
// Already defined in src/types/index.ts
interface SystemDocument {
=======
# SPEC-SYSTEM-001: 시스템 문서 관리

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SYSTEM-001 |
| 제목 | 시스템 문서 관리 (System Document Management) |
| PRD Phase | Feature 2 |
| 생성일 | 2026-01-05 |
| 상태 | Completed |
| 우선순위 | High |
| 의존성 | SPEC-PROJECT-001 (완료) |
| 후속 활성화 | SPEC-QA-001, SPEC-DOCUMENT-001 |
| 담당 에이전트 | expert-frontend, expert-backend |
| 라이프사이클 | spec-anchored |

---

## 1. 개요 (Overview)

### 1.1 배경

게임 기획 워크플로우에서 기존 기획 문서(시스템 문서)는 새로운 기획 작업의 핵심 참조 자료입니다. 기획자는 캐릭터, 전투, 경제 등 다양한 시스템에 대한 기존 문서를 프로젝트별로 등록하고, 카테고리와 태그로 분류하여 빠르게 검색하고 참조할 수 있어야 합니다.

현재 프로젝트에는 시스템 문서 관리 기능이 구현되어 있지 않으며, 이 SPEC은 Feature 3 (참조 시스템 선택)의 선행 요구사항입니다.

### 1.2 목표

- 시스템 문서 CRUD (생성, 조회, 수정, 삭제) 구현
- 마크다운 에디터를 통한 문서 직접 작성
- 카테고리별 그룹화 및 태그 기반 필터링
- 키워드 검색 (100개 이상 문서 지원)
- 시스템 문서 간 의존성 관리
- 접이식 사이드바 UI 구현

### 1.3 범위

**포함**:
- SystemSidebar.tsx: 접이식 사이드바 (시스템 문서 목록)
- SystemList.tsx: 카테고리별 그룹화된 목록 뷰
- SystemCard.tsx: 개별 시스템 문서 카드
- SystemCreateModal.tsx: 시스템 문서 생성 모달
- SystemEditModal.tsx: 시스템 문서 편집 모달
- SystemPreview.tsx: 시스템 문서 미리보기 (마크다운 렌더링)
- systemStore.ts: Zustand 상태 관리
- systemDocService.ts: API 서비스 레이어
- server/routes/systems.ts: 백엔드 API 라우트

**제외**:
- 참조 시스템 선택 UI (SPEC-REF-001 - 후속)
- AI 기반 연관 시스템 자동 추천 (SPEC-AI-RECOMMEND-001 - 후속)
- 시스템 문서 버전 관리 (향후 고려)
- 시스템 문서 내보내기/가져오기 (향후 고려)

---

## 2. 환경 (Environment)

### 2.1 기술 스택

**프론트엔드**:
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.18
- Zustand 5.0.9 (상태 관리)
- react-markdown + remark-gfm (마크다운 렌더링)
- Vitest (테스트)

**백엔드**:
- Node.js 20.x LTS
- Express 4.x
- TypeScript 5.x

**스토리지**:
- 로컬 파일 시스템 (workspace/projects/{project_id}/systems/)
- JSON (메타데이터: systems.json)
- Markdown (문서 내용: {document_id}.md)

### 2.2 기존 타입 정의 (활용)

```typescript
// src/types/index.ts (기존)
export interface SystemDocument {
>>>>>>> main
  id: string;
  projectId: string;
  name: string;
  category: string;
  tags: string[];
  content: string;
<<<<<<< HEAD
  dependencies: string[];  // Note: maps to dependentSystems in product.md
=======
  dependencies: string[];
>>>>>>> main
  createdAt: string;
  updatedAt: string;
}

<<<<<<< HEAD
// Store State (to be created)
interface SystemDocumentState {
  documents: SystemDocument[];
  selectedDocumentIds: string[];
  selectedCategory: string | null;
  selectedTags: string[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// DTOs for API operations
interface CreateSystemDocumentDto {
=======
export interface SystemDocumentState {
  documents: SystemDocument[];
  selectedDocumentIds: string[];
  isLoading: boolean;
  error: string | null;
}
```

### 2.3 신규 타입 정의

```typescript
// 시스템 문서 생성 DTO
export interface CreateSystemDocumentDto {
  projectId: string;
>>>>>>> main
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

<<<<<<< HEAD
interface UpdateSystemDocumentDto {
=======
// 시스템 문서 수정 DTO
export interface UpdateSystemDocumentDto {
>>>>>>> main
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}
<<<<<<< HEAD
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects/:projectId/systems | Get all system documents for a project |
| GET | /api/projects/:projectId/systems/:systemId | Get a single system document |
| POST | /api/projects/:projectId/systems | Create a new system document |
| PUT | /api/projects/:projectId/systems/:systemId | Update a system document |
| DELETE | /api/projects/:projectId/systems/:systemId | Delete a system document |
| GET | /api/projects/:projectId/systems/categories | Get all categories for a project |
| GET | /api/projects/:projectId/systems/tags | Get all tags for a project |

### Component Architecture

```
src/components/system/
├── SystemSidebar.tsx      # E+A pattern collapsible sidebar
├── SystemList.tsx         # Category-grouped document list
├── SystemCard.tsx         # Individual document card with preview
├── SystemCreateModal.tsx  # Create document modal
├── SystemEditModal.tsx    # Edit document modal
├── SystemPreview.tsx      # Markdown preview modal
└── ReferenceTagBar.tsx    # Header tag bar (for Reference System feature)

src/store/
└── systemStore.ts         # Zustand store for system documents

src/services/
└── systemDocService.ts    # API communication layer

server/routes/
└── systems.ts             # Express API routes

server/utils/
└── systemStorage.ts       # File system operations for systems
```

### File Storage Structure
=======

// 시스템 문서 필터 옵션
export interface SystemDocumentFilter {
  category?: string;
  tags?: string[];
  searchKeyword?: string;
}

// 카테고리별 그룹화된 문서
export interface CategoryGroup {
  category: string;
  documents: SystemDocument[];
  isExpanded: boolean;
}
```

### 2.4 디렉토리 구조

```
src/
  components/system/
    SystemSidebar.tsx       # 접이식 사이드바
    SystemList.tsx          # 카테고리별 그룹화 목록
    SystemCard.tsx          # 개별 시스템 문서 카드
    SystemCreateModal.tsx   # 시스템 문서 생성 모달
    SystemEditModal.tsx     # 시스템 문서 편집 모달
    SystemPreview.tsx       # 마크다운 미리보기
    SystemFilter.tsx        # 필터 UI (카테고리, 태그)
    SystemSearch.tsx        # 검색 입력 컴포넌트
  services/
    systemDocService.ts     # 시스템 문서 API 서비스
  stores/
    systemStore.ts          # 시스템 문서 상태 관리

server/
  routes/
    systems.ts              # 시스템 문서 API 라우트
```

### 2.5 워크스페이스 스토리지 패턴
>>>>>>> main

```
workspace/projects/{project_id}/
├── systems/
<<<<<<< HEAD
│   ├── systems.json       # System document metadata array
│   ├── {system_id}.md     # Individual document content
│   └── ...
└── ...
=======
│   ├── systems.json        # 시스템 문서 메타데이터
│   ├── character.md        # 캐릭터 시스템 문서
│   ├── combat.md           # 전투 시스템 문서
│   └── economy.md          # 경제 시스템 문서
>>>>>>> main
```

---

<<<<<<< HEAD
## Traceability

| Requirement | Test Case | Component | API Endpoint |
|-------------|-----------|-----------|--------------|
| FR-1.1 | TC-CREATE-001 | SystemCreateModal | POST /systems |
| FR-1.2 | TC-PERSIST-001 | systemStorage | POST /systems |
| FR-1.3 | TC-VALIDATE-001 | systems.ts | POST /systems |
| FR-2.1 | TC-FILTER-CAT-001 | SystemList | GET /systems |
| FR-3.1 | TC-FILTER-TAG-001 | SystemList | GET /systems |
| FR-4.1 | TC-SEARCH-001 | SystemSidebar | GET /systems |
| FR-5.1 | TC-EDIT-001 | SystemEditModal | GET /systems/:id |
| FR-6.1 | TC-SIDEBAR-001 | SystemSidebar | - |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance with 100+ documents | Low | Medium | Implement virtual scrolling if needed |
| Category/tag naming conflicts | Medium | Low | Normalize category/tag strings |
| File system concurrent access | Low | High | Implement optimistic locking |
| Large markdown content handling | Medium | Medium | Implement content chunking for large files |

---

## Expert Consultation Recommendations

### Backend Expert (code-backend)

- API endpoint design validation
- File storage pattern optimization
- Error handling strategy review

### Frontend Expert (code-frontend)

- Component architecture validation
- State management pattern review
- Performance optimization for large lists

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | workflow-spec | Initial SPEC creation |
| 1.1.0 | 2026-01-04 | moai-sync | Implementation completed - all components, store, services, and tests implemented |
| 1.2.0 | 2026-01-04 | manager-docs | Tech stack version update (React 19, TypeScript 5.9, Tailwind CSS 4) |
=======
## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [HIGH] SPEC-PROJECT-001의 프로젝트 관리가 완전히 구현되어 있음
  - 신뢰도: High
  - 근거: SPEC-PROJECT-001 상태가 Completed
  - 검증 방법: projectStore, projectService 파일 존재 및 기능 확인

- [HIGH] 기존 서비스 패턴(projectService.ts, taskService.ts)을 따름
  - 신뢰도: High
  - 근거: 코드베이스 분석 완료
  - 검증 방법: handleResponse, API_BASE_URL 패턴 재사용

- [MEDIUM] MarkdownEditor 컴포넌트가 공용으로 사용 가능함
  - 신뢰도: Medium
  - 근거: SPEC-TASK-001에서 구현됨
  - 검증 방법: src/components/common/MarkdownEditor.tsx 존재 확인

- [HIGH] 워크스페이스 디렉토리 구조가 이미 존재함
  - 신뢰도: High
  - 근거: projectService에서 사용 중
  - 검증 방법: workspace/projects/ 디렉토리 확인

### 3.2 비즈니스 가정

- [HIGH] 시스템 문서는 프로젝트에 종속됨 (프로젝트 선택 필수)
  - 신뢰도: High
  - 근거: product.md "프로젝트별로 등록"

- [HIGH] 카테고리는 사용자가 자유롭게 입력 가능 (고정 목록 아님)
  - 신뢰도: High
  - 근거: product.md에서 카테고리 제한 없음
  - 위험: 카테고리 중복/불일치 가능성

- [MEDIUM] 100개 이상의 문서에서 키워드 검색 지원 필요
  - 신뢰도: Medium
  - 근거: product.md "100+ documents" 언급
  - 위험: 클라이언트 측 검색 성능 이슈 가능

- [HIGH] 시스템 문서 삭제는 하드 삭제
  - 신뢰도: High
  - 근거: product.md에 소프트 삭제 언급 없음

- [MEDIUM] 의존성(dependencies)은 다른 시스템 문서 ID 배열
  - 신뢰도: Medium
  - 근거: SystemDocument 타입 정의
  - 검증 방법: 구현 시 확정

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항 (EARS 형식)

#### FR-001: 시스템 문서 목록 (SystemSidebar, SystemList)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 접이식 사이드바를 화면 좌측에 표시해야 한다
- 시스템은 **항상** 사이드바 상단에 검색 입력 필드를 표시해야 한다
- 시스템은 **항상** 문서 목록을 카테고리별로 그룹화하여 표시해야 한다
- 시스템은 **항상** 각 카테고리 그룹을 접기/펼치기 가능하게 해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 사이드바 토글 버튼을 클릭하면 **THEN** 사이드바가 접히거나 펼쳐진다
- **WHEN** 사용자가 카테고리 헤더를 클릭하면 **THEN** 해당 카테고리 문서 목록이 접히거나 펼쳐진다
- **WHEN** 사용자가 검색어를 입력하면 **THEN** 문서 이름, 태그, 내용에서 키워드 매칭 결과가 필터링된다
- **WHEN** 검색 결과가 없으면 **THEN** "검색 결과가 없습니다" 메시지를 표시한다

**State-Driven (IF-THEN)**:
- **IF** 현재 프로젝트에 시스템 문서가 없으면 **THEN** "시스템 문서를 추가하세요" 안내를 표시한다
- **IF** 프로젝트가 선택되지 않았으면 **THEN** "프로젝트를 먼저 선택하세요" 메시지를 표시한다
- **IF** 문서 로딩 중이면 **THEN** 스켈레톤 로딩 UI를 표시한다

#### FR-002: 시스템 문서 생성 (SystemCreateModal)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** `[+ 새 시스템 문서]` 버튼을 사이드바 하단에 표시해야 한다
- 시스템은 **항상** 모달에 이름, 카테고리, 태그, 의존 시스템 입력 필드를 표시해야 한다
- 시스템은 **항상** 모달에 마크다운 에디터를 표시해야 한다
- 시스템은 **항상** 취소/생성 버튼을 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 `[+ 새 시스템 문서]` 버튼을 클릭하면 **THEN** 생성 모달이 열린다
- **WHEN** 사용자가 필수 필드(이름, 카테고리)를 입력하고 "생성" 버튼을 클릭하면 **THEN** 새 시스템 문서가 생성된다
- **WHEN** 문서 생성이 성공하면 **THEN** 모달이 닫히고 새 문서가 목록에 추가된다
- **WHEN** 문서 생성이 실패하면 **THEN** 에러 메시지를 모달 내에 표시한다
- **WHEN** 사용자가 "취소" 버튼을 클릭하면 **THEN** 모달이 닫힌다
- **WHEN** 사용자가 ESC 키를 누르면 **THEN** 모달이 닫힌다

**State-Driven (IF-THEN)**:
- **IF** 이름이 비어있으면 **THEN** "생성" 버튼을 비활성화한다
- **IF** 카테고리가 비어있으면 **THEN** "생성" 버튼을 비활성화한다
- **IF** API 호출 중이면 **THEN** 로딩 인디케이터를 표시하고 버튼을 비활성화한다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 이름 또는 카테고리 없이 문서를 생성**하지 않아야 한다**
- 시스템은 프로젝트가 선택되지 않은 상태에서 문서를 생성**하지 않아야 한다**

#### FR-003: 시스템 문서 편집 (SystemEditModal)

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 모달에 마크다운 에디터를 표시해야 한다
- 시스템은 **항상** 모달 헤더에 문서 이름을 표시해야 한다
- 시스템은 **항상** 저장/취소 버튼을 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 문서 카드의 편집 버튼을 클릭하면 **THEN** 편집 모달이 열린다
- **WHEN** 사용자가 내용을 수정하고 "저장" 버튼을 클릭하면 **THEN** 변경 사항이 서버에 저장된다
- **WHEN** 저장이 성공하면 **THEN** 모달이 닫히고 성공 토스트가 표시된다
- **WHEN** 저장이 실패하면 **THEN** 에러 메시지를 모달 내에 표시한다
- **WHEN** 사용자가 "취소"를 클릭하면 **THEN** 변경 사항을 무시하고 모달이 닫힌다

**State-Driven (IF-THEN)**:
- **IF** 내용이 변경되었는데 취소하려 하면 **THEN** "변경 사항을 저장하지 않고 닫으시겠습니까?" 확인을 요청한다
- **IF** API 호출 중이면 **THEN** 로딩 인디케이터를 표시한다

**Optional (가능하면)**:
- **가능하면** 마크다운 미리보기 탭을 제공한다
- **가능하면** 자동 저장 기능을 30초마다 실행한다

#### FR-004: 시스템 문서 삭제

**Ubiquitous (시스템은 항상)**:
- 시스템은 **항상** 삭제 확인 다이얼로그에 문서 이름을 표시해야 한다
- 시스템은 **항상** "삭제하면 복구할 수 없습니다" 경고를 표시해야 한다

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 카드의 삭제 버튼(휴지통 아이콘)을 클릭하면 **THEN** 삭제 확인 다이얼로그가 열린다
- **WHEN** 사용자가 "삭제" 버튼을 클릭하면 **THEN** 문서가 삭제되고 목록에서 제거된다
- **WHEN** 삭제가 성공하면 **THEN** 다이얼로그가 닫히고 "시스템 문서가 삭제되었습니다" 토스트가 표시된다
- **WHEN** 삭제가 실패하면 **THEN** 에러 토스트가 표시되고 다이얼로그가 닫힌다
- **WHEN** 사용자가 "취소"를 클릭하면 **THEN** 다이얼로그가 닫힌다

**State-Driven (IF-THEN)**:
- **IF** 다른 시스템 문서가 이 문서를 의존하고 있으면 **THEN** "이 문서를 참조하는 시스템이 있습니다" 경고를 추가로 표시한다

**Unwanted (시스템은 하지 않아야 한다)**:
- 시스템은 사용자 확인 없이 문서를 삭제**하지 않아야 한다**

#### FR-005: 시스템 문서 미리보기 (SystemPreview)

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 문서 카드를 클릭하면 **THEN** 미리보기 패널이 열린다
- **WHEN** 사용자가 미리보기의 "편집" 버튼을 클릭하면 **THEN** 편집 모달이 열린다
- **WHEN** 사용자가 미리보기 외부를 클릭하면 **THEN** 미리보기가 닫힌다

**State-Driven (IF-THEN)**:
- **IF** 문서 내용이 비어있으면 **THEN** "내용이 없습니다" 메시지를 표시한다

#### FR-006: 필터링 및 검색 (SystemFilter, SystemSearch)

**Event-Driven (WHEN-THEN)**:
- **WHEN** 사용자가 카테고리 필터를 선택하면 **THEN** 해당 카테고리의 문서만 표시된다
- **WHEN** 사용자가 태그 필터를 선택하면 **THEN** 해당 태그를 포함한 문서만 표시된다
- **WHEN** 사용자가 검색어를 입력하면 **THEN** 300ms 디바운스 후 검색이 실행된다
- **WHEN** 필터를 초기화하면 **THEN** 모든 문서가 표시된다

**State-Driven (IF-THEN)**:
- **IF** 검색어와 필터가 모두 적용되면 **THEN** AND 조건으로 결합하여 필터링한다
- **IF** 필터 결과가 없으면 **THEN** "조건에 맞는 문서가 없습니다" 메시지를 표시한다

### 4.2 비기능 요구사항

#### NFR-001: 성능

- 사이드바 토글: 200ms 이내 애니메이션
- 문서 목록 로딩: 1초 이내 (100개 문서 기준)
- 검색 디바운스: 300ms
- 마크다운 렌더링: 500ms 이내
- API 응답: 1초 이내

#### NFR-002: 사용성

- 사이드바 너비: 280px (접힘 시 48px)
- 사이드바 접힘 상태 LocalStorage 저장
- 카테고리 접힘 상태 세션 유지
- 키보드 단축키: Cmd/Ctrl + B (사이드바 토글)
- 반응형 지원: 768px 이하에서 오버레이 모드

#### NFR-003: 접근성

- ARIA 레이블 적용 (role="complementary" for sidebar)
- 키보드 네비게이션 지원
- 스크린 리더 호환성 확보
- 색상 대비 WCAG AA 준수

---

## 5. 제약사항 (Constraints)

### 5.1 기술적 제약

- 기존 서비스 패턴(projectService.ts, taskService.ts) 준수
- Zustand 상태 관리 패턴 준수
- Tailwind CSS 유틸리티 클래스 사용
- Express 서버를 통한 API 통신
- 로컬 파일 시스템 기반 스토리지

### 5.2 UI 제약

- 사이드바 최소 너비: 280px
- 카드 최소 높이: 64px
- 모달 최소 너비: 640px
- 마크다운 에디터 최소 높이: 400px

### 5.3 API 제약

- RESTful API 설계 원칙 준수
- ApiResponse<T> 타입 사용
- 에러 응답 시 적절한 HTTP 상태 코드 반환

---

## 6. 명세 (Specifications)

### 6.1 컴포넌트 명세

#### SystemSidebar.tsx

```typescript
interface SystemSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// 기능:
// - 접이식 토글 버튼
// - 검색 입력 필드
// - SystemList 포함
// - 새 문서 추가 버튼
// - 반응형 오버레이 모드
```

#### SystemList.tsx

```typescript
interface SystemListProps {
  documents: SystemDocument[];
  filter: SystemDocumentFilter;
  onSelectDocument: (doc: SystemDocument) => void;
  onEditDocument: (doc: SystemDocument) => void;
  onDeleteDocument: (doc: SystemDocument) => void;
}

// 기능:
// - 카테고리별 그룹화
// - 카테고리 접기/펼치기
// - 문서 카드 목록 렌더링
```

#### SystemCard.tsx

```typescript
interface SystemCardProps {
  document: SystemDocument;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// 기능:
// - 문서 이름, 카테고리, 태그 표시
// - 호버 시 편집/삭제 버튼 표시
// - 선택 상태 시각적 표시
// - 의존성 카운트 표시
```

#### SystemCreateModal.tsx

```typescript
interface SystemCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingCategories: string[];
  existingDocuments: SystemDocument[];
}

// 기능:
// - 이름 입력 (필수)
// - 카테고리 입력/선택 (필수, 자동완성)
// - 태그 입력 (선택, 칩 형태)
// - 의존 시스템 선택 (다중 선택)
// - 마크다운 에디터 (선택)
// - 생성/취소 버튼
```

#### SystemEditModal.tsx

```typescript
interface SystemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: SystemDocument;
  existingCategories: string[];
  existingDocuments: SystemDocument[];
}

// 기능:
// - 모든 필드 편집 가능
// - 마크다운 에디터
// - 미리보기 탭
// - 저장/취소 버튼
// - 변경 감지
```

#### SystemPreview.tsx

```typescript
interface SystemPreviewProps {
  document: SystemDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

// 기능:
// - 마크다운 렌더링
// - 메타데이터 표시 (카테고리, 태그, 의존성)
// - 편집 버튼
// - 닫기 버튼
```

### 6.2 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/projects/:projectId/systems | 시스템 문서 목록 조회 | - | ApiResponse<SystemDocument[]> |
| GET | /api/systems/:id | 시스템 문서 상세 조회 | - | ApiResponse<SystemDocument> |
| POST | /api/projects/:projectId/systems | 시스템 문서 생성 | CreateSystemDocumentDto | ApiResponse<SystemDocument> |
| PUT | /api/systems/:id | 시스템 문서 수정 | UpdateSystemDocumentDto | ApiResponse<SystemDocument> |
| DELETE | /api/systems/:id | 시스템 문서 삭제 | - | ApiResponse<null> |
| GET | /api/projects/:projectId/systems/categories | 카테고리 목록 조회 | - | ApiResponse<string[]> |
| GET | /api/projects/:projectId/systems/tags | 태그 목록 조회 | - | ApiResponse<string[]> |

### 6.3 Zustand Store

```typescript
// src/stores/systemStore.ts
interface SystemStore {
  // 상태
  documents: SystemDocument[];
  selectedDocument: SystemDocument | null;
  filter: SystemDocumentFilter;
  categoryGroups: CategoryGroup[];
  isLoading: boolean;
  error: string | null;

  // 사이드바 상태
  isSidebarCollapsed: boolean;

  // 모달 상태
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isPreviewOpen: boolean;
  isDeleteConfirmOpen: boolean;

  // 액션
  fetchDocuments: (projectId: string) => Promise<void>;
  createDocument: (dto: CreateSystemDocumentDto) => Promise<SystemDocument>;
  updateDocument: (id: string, dto: UpdateSystemDocumentDto) => Promise<SystemDocument>;
  deleteDocument: (id: string) => Promise<void>;

  // 필터 액션
  setFilter: (filter: SystemDocumentFilter) => void;
  clearFilter: () => void;

  // UI 액션
  toggleSidebar: () => void;
  toggleCategoryExpand: (category: string) => void;
  selectDocument: (doc: SystemDocument | null) => void;

  // 모달 액션
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (doc: SystemDocument) => void;
  closeEditModal: () => void;
  openPreview: (doc: SystemDocument) => void;
  closePreview: () => void;
  openDeleteConfirm: (doc: SystemDocument) => void;
  closeDeleteConfirm: () => void;
}
```

### 6.4 systemDocService.ts

```typescript
// src/services/systemDocService.ts
export async function getSystemDocuments(projectId: string): Promise<SystemDocument[]>;
export async function getSystemDocument(id: string): Promise<SystemDocument>;
export async function createSystemDocument(dto: CreateSystemDocumentDto): Promise<SystemDocument>;
export async function updateSystemDocument(id: string, dto: UpdateSystemDocumentDto): Promise<SystemDocument>;
export async function deleteSystemDocument(id: string): Promise<void>;
export async function getCategories(projectId: string): Promise<string[]>;
export async function getTags(projectId: string): Promise<string[]>;
```

---

## 7. 추적성 (Traceability)

### 7.1 PRD 매핑

| 요구사항 | PRD 항목 | 수락 기준 |
|----------|----------|-----------|
| FR-001 | Feature 2 - 카테고리 그룹화 | AC-001, AC-002 |
| FR-002 | Feature 2 - 시스템 문서 추가 | AC-003, AC-004 |
| FR-003 | Feature 2 - 시스템 문서 편집 | AC-005, AC-006 |
| FR-004 | Feature 2 - 시스템 문서 삭제 | AC-007 |
| FR-005 | Feature 2 - 시스템 문서 미리보기 | AC-008 |
| FR-006 | Feature 2 - 태그 필터링, 키워드 검색 | AC-009, AC-010 |

### 7.2 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| SystemSidebar | src/components/system/SystemSidebar.tsx | expert-frontend |
| SystemList | src/components/system/SystemList.tsx | expert-frontend |
| SystemCard | src/components/system/SystemCard.tsx | expert-frontend |
| SystemCreateModal | src/components/system/SystemCreateModal.tsx | expert-frontend |
| SystemEditModal | src/components/system/SystemEditModal.tsx | expert-frontend |
| SystemPreview | src/components/system/SystemPreview.tsx | expert-frontend |
| SystemFilter | src/components/system/SystemFilter.tsx | expert-frontend |
| SystemSearch | src/components/system/SystemSearch.tsx | expert-frontend |
| systemDocService | src/services/systemDocService.ts | expert-frontend |
| systemStore | src/stores/systemStore.ts | expert-frontend |
| systems route | server/routes/systems.ts | expert-backend |

### 7.3 관련 SPEC

- SPEC-PROJECT-001: 프로젝트 관리 (의존성, 완료)
- SPEC-TASK-001: 태스크 관리 UI (참조, 완료)
- SPEC-KANBAN-001: 칸반 보드 UI (참조, 완료)
- SPEC-REF-001: 참조 시스템 선택 (후속, 계획) - 본 SPEC에서 구현된 시스템 문서 활용
- SPEC-QA-001: Q&A 폼 시스템 (후속, 계획)
- SPEC-DOCUMENT-001: 문서 편집 (후속, 계획)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-05 | 초안 작성 |
| 1.1 | 2026-01-05 | 구현 완료 및 상태 업데이트 |

### 버전 1.1 (2026-01-05)
- 구현 완료 및 상태 업데이트
- 162개 테스트 추가 (91.81% 커버리지)
- 8개 컴포넌트 구현 완료
- API 엔드포인트 및 Zustand 스토어 구현
>>>>>>> main
