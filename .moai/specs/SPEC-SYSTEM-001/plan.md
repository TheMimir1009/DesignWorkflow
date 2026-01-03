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
