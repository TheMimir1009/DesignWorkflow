<<<<<<< HEAD
# SPEC-SYSTEM-001: Implementation Plan

## TAG BLOCK

```yaml
spec_id: SPEC-SYSTEM-001
document_type: plan
created: 2026-01-04
updated: 2026-01-04
```

---

## Implementation Strategy

### Approach

**Bottom-up Implementation**: Build from data layer to UI layer to ensure each layer is testable before building dependent layers.

### Reusable Components from Existing Codebase

| Component | Location | Reuse Strategy |
|-----------|----------|----------------|
| MarkdownEditor | src/components/common/MarkdownEditor.tsx | Direct reuse for content editing |
| ConfirmDialog | src/components/common/ConfirmDialog.tsx | Direct reuse for delete confirmation |
| projectService pattern | src/services/projectService.ts | Pattern replication for systemDocService |
| projectStore pattern | src/store/projectStore.ts | Pattern replication for systemStore |
| projects.ts pattern | server/routes/projects.ts | Pattern replication for systems.ts |

---

## Phase Breakdown

### Phase 1: Backend Foundation (Primary Goal)

**Objective**: Establish data persistence and API layer

**Deliverables**:
1. `server/utils/systemStorage.ts` - File system operations
   - `getAllSystemDocuments(projectId)` - Read systems.json
   - `getSystemDocumentById(projectId, systemId)` - Read single document
   - `saveSystemDocument(projectId, document)` - Write document
   - `deleteSystemDocument(projectId, systemId)` - Remove document
   - `isSystemNameDuplicate(projectId, name, excludeId?)` - Validation

2. `server/routes/systems.ts` - Express API routes
   - CRUD endpoints following projects.ts pattern
   - Category and tag aggregation endpoints
   - Validation middleware

3. `server/types.ts` updates
   - `CreateSystemDocumentDto`
   - `UpdateSystemDocumentDto`

**Dependencies**: None (can start immediately)

**Testing Focus**: API endpoint integration tests

---

### Phase 2: State Management (Primary Goal)

**Objective**: Implement client-side state management

**Deliverables**:
1. `src/services/systemDocService.ts` - API communication
   - Following projectService.ts pattern
   - All CRUD operations
   - Category/tag fetching

2. `src/store/systemStore.ts` - Zustand store
   - State: documents, filters, loading, error
   - Actions: CRUD, filtering, search
   - Computed: filteredDocuments, categories, tags

**Dependencies**: Phase 1 (Backend API)

**Testing Focus**: Service layer unit tests, store action tests

---

### Phase 3: Core UI Components (Secondary Goal)

**Objective**: Build essential UI components

**Deliverables**:
1. `SystemCard.tsx` - Document card component
   - Display name, category, tags
   - Preview button (eye icon)
   - Edit/Delete action buttons

2. `SystemList.tsx` - Category-grouped list
   - Collapsible category sections
   - Empty state handling
   - Loading skeleton

3. `SystemPreview.tsx` - Markdown preview modal
   - react-markdown rendering
   - Close on backdrop click
   - Keyboard navigation (ESC)

4. `TagInput.tsx` (common component) - Tag input with autocomplete
   - Multi-tag selection
   - Existing tag suggestions
   - New tag creation

**Dependencies**: Phase 2 (State Management)

**Testing Focus**: Component rendering tests, interaction tests

---

### Phase 4: Modal Components (Secondary Goal)

**Objective**: Build create/edit functionality

**Deliverables**:
1. `SystemCreateModal.tsx` - Create document modal
   - Name input (required)
   - Category selector (required)
   - Tags input (TagInput component)
   - Content editor (MarkdownEditor)
   - Dependencies selector (multi-select)

2. `SystemEditModal.tsx` - Edit document modal
   - Pre-filled form from existing document
   - Unsaved changes warning
   - Delete button with confirmation

**Dependencies**: Phase 3 (Core UI Components)

**Testing Focus**: Form validation, submit handling

---

### Phase 5: Sidebar Integration (Final Goal)

**Objective**: Complete sidebar with search and filtering

**Deliverables**:
1. `SystemSidebar.tsx` - Main sidebar component
   - E+A pattern (Expand + Action)
   - Collapse/expand toggle
   - Search input
   - Category filter tabs
   - Tag filter chips
   - Add document button

2. Layout Integration
   - Update Layout.tsx to include SystemSidebar
   - Responsive behavior (mobile collapse)

3. Header Integration (preparation for Reference System)
   - ReferenceTagBar placeholder
   - Selected documents display

**Dependencies**: Phase 4 (Modal Components)

**Testing Focus**: Integration tests, responsive behavior

---

## Technical Decisions

### State Management Pattern

**Decision**: Use Zustand with devtools middleware

**Rationale**:
- Consistent with existing projectStore.ts pattern
- DevTools support for debugging
- Simpler than Redux for this scope

### File Storage Structure

**Decision**: Separate metadata JSON from content markdown

**Rationale**:
- systems.json for quick metadata queries
- {system_id}.md for content isolation
- Efficient for search (metadata-only scan)
- Consistent with tasks storage pattern

### Search Implementation

**Decision**: Client-side search with fuzzy matching

**Rationale**:
- 100 documents manageable on client
- Immediate feedback without API round-trips
- Can upgrade to server-side later if needed

### Category Management

**Decision**: Freeform categories with suggestions

**Rationale**:
- Flexibility for different project needs
- Autocomplete from existing categories
- No rigid category schema maintenance

---

## Component Dependency Graph

```
SystemSidebar
├── SearchInput (common - to create)
├── CategoryFilter (internal)
├── TagFilter (internal)
└── SystemList
    └── SystemCard
        └── SystemPreview

SystemCreateModal
├── MarkdownEditor (existing)
├── TagInput (common - to create)
└── ConfirmDialog (existing)

SystemEditModal
├── MarkdownEditor (existing)
├── TagInput (common - to create)
└── ConfirmDialog (existing)
```

---

## API Response Examples

### GET /api/projects/:projectId/systems

```json
{
  "success": true,
  "data": [
    {
      "id": "sys-001",
      "projectId": "proj-001",
      "name": "Character System",
      "category": "Core",
      "tags": ["character", "stats", "progression"],
      "content": "# Character System\n\n## Overview...",
      "dependencies": ["sys-002"],
      "createdAt": "2026-01-04T10:00:00Z",
      "updatedAt": "2026-01-04T10:00:00Z"
    }
  ],
  "error": null
}
```

### GET /api/projects/:projectId/systems/categories

```json
{
  "success": true,
  "data": ["Core", "Combat", "Economy", "UI/UX"],
  "error": null
}
```

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Large document list performance | Implement virtual scrolling in SystemList |
| Category/tag proliferation | Provide cleanup utility, suggest existing values |
| Unsaved changes lost | Implement autosave draft, warn on navigation |
| File system race conditions | Use file-based locking, sequential writes |

---

## Definition of Done

### Phase Completion Criteria

**Phase 1**: All API endpoints pass integration tests
**Phase 2**: Store actions update state correctly
**Phase 3**: Components render with mock data
**Phase 4**: CRUD operations work end-to-end
**Phase 5**: Full user workflow functional

### Overall SPEC Completion

- All acceptance criteria from acceptance.md pass
- Test coverage >= 85% for new code
- No ESLint warnings
- Documentation updated
- Performance requirements met (100ms render, 200ms search)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | workflow-spec | Initial plan creation |
=======
# SPEC-SYSTEM-001: 구현 계획

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SYSTEM-001 |
| 관련 SPEC | spec.md, acceptance.md |
| 작성일 | 2026-01-05 |

---

## 1. 마일스톤 (Milestones)

### 1.1 마일스톤 개요

| 마일스톤 | 우선순위 | 주요 목표 | 의존성 |
|----------|----------|-----------|--------|
| M1 | Primary | 백엔드 API 및 스토리지 | 없음 |
| M2 | Primary | Zustand Store 및 서비스 레이어 | M1 |
| M3 | Primary | 사이드바 및 목록 UI | M2 |
| M4 | Secondary | 생성/편집/삭제 모달 | M3 |
| M5 | Secondary | 필터링 및 검색 | M3 |
| M6 | Final | 통합 테스트 및 최적화 | M4, M5 |

---

## 2. 마일스톤 상세 계획

### M1: 백엔드 API 및 스토리지 (Primary Goal)

**목표**: 시스템 문서 CRUD API 구현 및 파일 시스템 스토리지 설정

**태스크 분해**:

| 태스크 | 설명 | 파일 |
|--------|------|------|
| M1-T1 | 시스템 문서 라우트 설정 | server/routes/systems.ts |
| M1-T2 | 스토리지 유틸리티 구현 | server/utils/systemStorage.ts |
| M1-T3 | GET /api/projects/:projectId/systems 구현 | server/routes/systems.ts |
| M1-T4 | POST /api/projects/:projectId/systems 구현 | server/routes/systems.ts |
| M1-T5 | PUT /api/systems/:id 구현 | server/routes/systems.ts |
| M1-T6 | DELETE /api/systems/:id 구현 | server/routes/systems.ts |
| M1-T7 | GET /api/systems/:id 구현 | server/routes/systems.ts |
| M1-T8 | Express 앱에 라우트 등록 | server/index.ts |

**완료 조건**:
- 모든 API 엔드포인트가 정상 동작
- workspace/projects/{projectId}/systems/ 디렉토리 자동 생성
- systems.json 메타데이터 파일 관리
- 개별 .md 파일로 문서 내용 저장

**기술적 접근**:
- 기존 projectStorage 패턴 참조
- ApiResponse<T> 타입 사용
- 에러 핸들링 미들웨어 적용

---

### M2: Zustand Store 및 서비스 레이어 (Primary Goal)

**목표**: 프론트엔드 상태 관리 및 API 통신 레이어 구현

**태스크 분해**:

| 태스크 | 설명 | 파일 |
|--------|------|------|
| M2-T1 | systemDocService.ts 생성 | src/services/systemDocService.ts |
| M2-T2 | API 함수 구현 (CRUD) | src/services/systemDocService.ts |
| M2-T3 | systemStore.ts 생성 | src/stores/systemStore.ts |
| M2-T4 | 문서 상태 및 액션 구현 | src/stores/systemStore.ts |
| M2-T5 | 필터/검색 상태 구현 | src/stores/systemStore.ts |
| M2-T6 | UI 상태 (모달, 사이드바) 구현 | src/stores/systemStore.ts |
| M2-T7 | 신규 타입 정의 추가 | src/types/index.ts |

**완료 조건**:
- 모든 CRUD 액션 정상 동작
- 카테고리별 그룹화 로직 구현
- 필터링 로직 구현
- 로딩/에러 상태 관리

**기술적 접근**:
- taskStore 및 projectStore 패턴 참조
- Immer 미들웨어 사용 (복잡한 상태 업데이트)
- persist 미들웨어로 사이드바 상태 저장

---

### M3: 사이드바 및 목록 UI (Primary Goal)

**목표**: 시스템 문서 목록을 표시하는 접이식 사이드바 구현

**태스크 분해**:

| 태스크 | 설명 | 파일 |
|--------|------|------|
| M3-T1 | SystemSidebar 컴포넌트 생성 | src/components/system/SystemSidebar.tsx |
| M3-T2 | 접이식 토글 기능 구현 | src/components/system/SystemSidebar.tsx |
| M3-T3 | SystemList 컴포넌트 생성 | src/components/system/SystemList.tsx |
| M3-T4 | 카테고리별 그룹화 UI 구현 | src/components/system/SystemList.tsx |
| M3-T5 | SystemCard 컴포넌트 생성 | src/components/system/SystemCard.tsx |
| M3-T6 | 카드 호버/선택 상태 스타일링 | src/components/system/SystemCard.tsx |
| M3-T7 | 메인 레이아웃에 사이드바 통합 | src/App.tsx 또는 레이아웃 컴포넌트 |
| M3-T8 | 반응형 디자인 적용 | 관련 컴포넌트 |

**완료 조건**:
- 사이드바 접기/펼치기 동작
- 카테고리별 문서 그룹화 표시
- 카테고리 접기/펼치기 동작
- 문서 카드 표시 (이름, 카테고리, 태그)
- 반응형 오버레이 모드 (768px 이하)

**기술적 접근**:
- Tailwind CSS 애니메이션 (transition)
- LocalStorage로 사이드바 상태 유지
- 기존 KanbanBoard 레이아웃 패턴 참조

---

### M4: 생성/편집/삭제 모달 (Secondary Goal)

**목표**: 시스템 문서 CRUD 모달 컴포넌트 구현

**태스크 분해**:

| 태스크 | 설명 | 파일 |
|--------|------|------|
| M4-T1 | SystemCreateModal 컴포넌트 생성 | src/components/system/SystemCreateModal.tsx |
| M4-T2 | 이름/카테고리/태그 입력 폼 구현 | src/components/system/SystemCreateModal.tsx |
| M4-T3 | 의존 시스템 선택 UI 구현 | src/components/system/SystemCreateModal.tsx |
| M4-T4 | 마크다운 에디터 통합 | src/components/system/SystemCreateModal.tsx |
| M4-T5 | SystemEditModal 컴포넌트 생성 | src/components/system/SystemEditModal.tsx |
| M4-T6 | 변경 감지 및 확인 다이얼로그 구현 | src/components/system/SystemEditModal.tsx |
| M4-T7 | SystemPreview 컴포넌트 생성 | src/components/system/SystemPreview.tsx |
| M4-T8 | 삭제 확인 다이얼로그 구현 | src/components/system/SystemDeleteConfirm.tsx |
| M4-T9 | 토스트 알림 연동 | 관련 컴포넌트 |

**완료 조건**:
- 생성 모달 정상 동작 (필수 필드 검증)
- 편집 모달 정상 동작 (변경 감지)
- 미리보기 패널 정상 동작 (마크다운 렌더링)
- 삭제 확인 다이얼로그 정상 동작
- ESC 키로 모달 닫기
- 접근성 지원 (포커스 트랩, ARIA)

**기술적 접근**:
- TaskCreateModal, TaskEditModal 패턴 참조
- MarkdownEditor 공용 컴포넌트 재사용
- 기존 ConfirmDialog 컴포넌트 재사용

---

### M5: 필터링 및 검색 (Secondary Goal)

**목표**: 카테고리/태그 필터 및 키워드 검색 기능 구현

**태스크 분해**:

| 태스크 | 설명 | 파일 |
|--------|------|------|
| M5-T1 | SystemSearch 컴포넌트 생성 | src/components/system/SystemSearch.tsx |
| M5-T2 | 검색 디바운스 로직 구현 | src/components/system/SystemSearch.tsx |
| M5-T3 | SystemFilter 컴포넌트 생성 | src/components/system/SystemFilter.tsx |
| M5-T4 | 카테고리 필터 드롭다운 구현 | src/components/system/SystemFilter.tsx |
| M5-T5 | 태그 필터 칩 선택 UI 구현 | src/components/system/SystemFilter.tsx |
| M5-T6 | 필터 초기화 버튼 구현 | src/components/system/SystemFilter.tsx |
| M5-T7 | 검색/필터 결합 로직 구현 | src/stores/systemStore.ts |
| M5-T8 | 검색 결과 하이라이팅 | src/components/system/SystemCard.tsx |

**완료 조건**:
- 검색어 입력 시 300ms 디바운스 적용
- 이름, 태그, 내용에서 키워드 검색
- 카테고리 필터 단일 선택
- 태그 필터 다중 선택
- 필터 초기화 기능
- 결과 없음 메시지 표시

**기술적 접근**:
- useDeferredValue 또는 커스텀 디바운스 훅
- 클라이언트 측 필터링 (100개 이하)
- AND 조건 결합

---

### M6: 통합 테스트 및 최적화 (Final Goal)

**목표**: 전체 기능 통합 검증 및 성능 최적화

**태스크 분해**:

| 태스크 | 설명 | 파일 |
|--------|------|------|
| M6-T1 | systemStore 단위 테스트 작성 | src/stores/__tests__/systemStore.test.ts |
| M6-T2 | SystemSidebar 컴포넌트 테스트 | src/components/system/__tests__/SystemSidebar.test.tsx |
| M6-T3 | SystemCreateModal 컴포넌트 테스트 | src/components/system/__tests__/SystemCreateModal.test.tsx |
| M6-T4 | API 통합 테스트 작성 | server/routes/__tests__/systems.test.ts |
| M6-T5 | E2E 시나리오 테스트 | tests/e2e/system-documents.test.ts |
| M6-T6 | 성능 최적화 (메모이제이션) | 관련 컴포넌트 |
| M6-T7 | 접근성 검사 및 수정 | 관련 컴포넌트 |
| M6-T8 | 문서화 및 JSDoc 주석 | 모든 파일 |

**완료 조건**:
- 단위 테스트 커버리지 85% 이상
- 모든 수락 기준 테스트 통과
- Lighthouse 접근성 점수 90 이상
- 100개 문서 기준 목록 로딩 1초 이내

**기술적 접근**:
- Vitest + React Testing Library
- MSW (Mock Service Worker) API 모킹
- React.memo, useMemo, useCallback 최적화

---

## 3. 기술적 접근 방식

### 3.1 아키텍처 설계

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layout                           │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│  SystemSidebar│              Main Content                   │
│  ┌───────────┐│  ┌─────────────────────────────────────────┐│
│  │ Search    ││  │                                         ││
│  ├───────────┤│  │           KanbanBoard                   ││
│  │ Filter    ││  │                                         ││
│  ├───────────┤│  │                                         ││
│  │           ││  │                                         ││
│  │ SystemList││  │                                         ││
│  │  - Category│  │                                         ││
│  │    - Card ││  │                                         ││
│  │    - Card ││  │                                         ││
│  │           ││  │                                         ││
│  ├───────────┤│  │                                         ││
│  │ + New Doc ││  │                                         ││
│  └───────────┘│  └─────────────────────────────────────────┘│
└───────────────┴─────────────────────────────────────────────┘
```

### 3.2 데이터 흐름

```
User Action
    ↓
Component (SystemSidebar, Modal, etc.)
    ↓
systemStore Action (Zustand)
    ↓
systemDocService (API Call)
    ↓
Express API Route
    ↓
File System (workspace/projects/{id}/systems/)
    ↓
Response → Store Update → UI Re-render
```

### 3.3 파일 스토리지 구조

```
workspace/projects/{project_id}/systems/
├── systems.json          # 메타데이터 (id, name, category, tags, dependencies, timestamps)
├── {document_id}.md      # 문서 내용 (마크다운)
├── character-sys-001.md
├── combat-sys-002.md
└── economy-sys-003.md
```

**systems.json 스키마**:
```json
{
  "documents": [
    {
      "id": "character-sys-001",
      "projectId": "project-alpha",
      "name": "캐릭터 시스템",
      "category": "Core",
      "tags": ["character", "stats", "progression"],
      "dependencies": [],
      "createdAt": "2026-01-05T10:00:00Z",
      "updatedAt": "2026-01-05T10:00:00Z"
    }
  ]
}
```

### 3.4 상태 관리 전략

**전역 상태 (Zustand)**:
- 문서 목록 (documents)
- 선택된 문서 (selectedDocument)
- 필터 상태 (filter)
- 카테고리 그룹 (categoryGroups)
- UI 상태 (모달, 사이드바)

**로컬 상태 (useState)**:
- 폼 입력 값
- 임시 편집 내용
- 검색어 입력 (디바운스 전)

**파생 상태 (computed)**:
- 필터링된 문서 목록
- 카테고리별 그룹화

---

## 4. 위험 및 대응 방안

### 4.1 기술적 위험

| 위험 | 영향도 | 발생 가능성 | 대응 방안 |
|------|--------|-------------|-----------|
| 100+ 문서 검색 성능 저하 | Medium | Medium | 클라이언트 검색 + 필요 시 서버 검색 전환 |
| 파일 시스템 동시 접근 충돌 | High | Low | 낙관적 잠금 + 버전 체크 |
| 사이드바 레이아웃 충돌 | Medium | Low | 기존 레이아웃과 통합 테스트 |
| 마크다운 XSS 취약점 | High | Low | DOMPurify로 sanitize |

### 4.2 의존성 위험

| 위험 | 영향도 | 대응 방안 |
|------|--------|-----------|
| MarkdownEditor 미구현 | Medium | SPEC-TASK-001에서 구현 확인, 없으면 신규 구현 |
| projectStore 변경 | Low | 인터페이스 분리, 느슨한 결합 |

---

## 5. 구현 순서 권장

### Phase 1: 기반 구축 (M1 + M2)

1. M1-T2: 스토리지 유틸리티 구현
2. M1-T1, M1-T3~T8: API 엔드포인트 구현
3. M2-T7: 타입 정의 추가
4. M2-T1, M2-T2: 서비스 레이어 구현
5. M2-T3~T6: Zustand Store 구현

### Phase 2: 코어 UI (M3)

1. M3-T5, M3-T6: SystemCard 컴포넌트
2. M3-T3, M3-T4: SystemList 컴포넌트
3. M3-T1, M3-T2: SystemSidebar 컴포넌트
4. M3-T7: 레이아웃 통합
5. M3-T8: 반응형 디자인

### Phase 3: CRUD UI (M4)

1. M4-T1~T4: SystemCreateModal
2. M4-T5, M4-T6: SystemEditModal
3. M4-T7: SystemPreview
4. M4-T8, M4-T9: 삭제 및 알림

### Phase 4: 검색/필터 (M5)

1. M5-T1, M5-T2: SystemSearch
2. M5-T3~T6: SystemFilter
3. M5-T7: 결합 로직
4. M5-T8: 하이라이팅

### Phase 5: 품질 보증 (M6)

1. M6-T1~T4: 테스트 작성
2. M6-T5: E2E 테스트
3. M6-T6, M6-T7: 최적화 및 접근성
4. M6-T8: 문서화

---

## 6. Expert 상담 권장 사항

### 6.1 Backend Expert 상담 권장

- API 엔드포인트 설계 검토
- 파일 시스템 스토리지 패턴 검토
- 동시성 처리 전략 검토
- 에러 핸들링 패턴 검토

### 6.2 Frontend Expert 상담 권장

- 사이드바 레이아웃 통합 방안
- 상태 관리 전략 검토
- 컴포넌트 구조 및 재사용성 검토
- 접근성 구현 패턴 검토

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-05 | 초안 작성 |
>>>>>>> main
