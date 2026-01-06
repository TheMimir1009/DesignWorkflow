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
  id: string;
  projectId: string;
  name: string;
  category: string;
  tags: string[];
  content: string;
  dependencies: string[];  // Note: maps to dependentSystems in product.md
  createdAt: string;
  updatedAt: string;
}

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
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

interface UpdateSystemDocumentDto {
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}
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

```
workspace/projects/{project_id}/
├── systems/
│   ├── systems.json       # System document metadata array
│   ├── {system_id}.md     # Individual document content
│   └── ...
└── ...
```

---

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
