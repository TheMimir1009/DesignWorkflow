---
id: SPEC-TEMPLATE-001
version: "1.0.0"
status: "draft"
created: "2026-01-04"
updated: "2026-01-04"
author: "manager-spec"
priority: "medium"
---

# SPEC-TEMPLATE-001: Template System - Document Template Management

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | manager-spec | Initial SPEC creation |

---

## TAG BLOCK

```yaml
spec_id: SPEC-TEMPLATE-001
title: Template System - Document Template Management
status: draft
priority: medium
created: 2026-01-04
updated: 2026-01-04
lifecycle: spec-anchored
dependencies:
  - SPEC-PROJECT-001 (Project Management - completed)
  - SPEC-SYSTEM-001 (System Document Management - completed)
blocks:
  - Q&A Form System Enhancement (Feature 6)
  - Design Document Draft Generation (Feature 7)
related_specs:
  - SPEC-SYSTEM-001
  - SPEC-TASK-001
```

---

## Environment

### Project Context

- **Project**: AI Workflow Kanban (design-workflow)
- **Domain**: Game Design Pipeline Workflow System
- **Current Progress**: 65% complete (Project, Kanban, Task, System management implemented)
- **Target Users**: Game system planners managing document templates

### Technical Environment

- **Frontend**: React 18.x, TypeScript 5.x, Tailwind CSS 3.x, Zustand
- **Backend**: Node.js 20.x LTS, Express 4.x
- **Storage**: File-based (JSON metadata, Markdown content)
- **Existing Components**: MarkdownEditor, TagInput, ConfirmDialog (reusable)
- **Existing Types**: QuestionTemplate, Question (defined in src/types/index.ts)

### Integration Points

- **Q&A Form System (Feature 6)**: Question templates for design document generation
- **Document Generation (Feature 7)**: Document structure templates for AI prompts
- **Project Settings**: Default templates per project
- **workspace/templates/**: Template file storage location

---

## Assumptions

### Technical Assumptions

| Assumption | Confidence | Risk if Wrong | Validation Method |
|------------|------------|---------------|-------------------|
| JSON format sufficient for template definitions | High | Migration complexity | Template complexity testing |
| Existing QuestionTemplate interface covers Q&A needs | Medium | Interface extension needed | Feature verification |
| Template variable substitution is straightforward | Medium | Complex parsing required | Prototype testing |
| File-based storage works for template versioning | High | Database migration needed | Performance testing |

### Business Assumptions

| Assumption | Confidence | Risk if Wrong | Validation Method |
|------------|------------|---------------|-------------------|
| Users need 3 template categories initially | High | Category expansion needed | User feedback |
| Template customization is per-project | Medium | Global templates needed | Usage patterns |
| Variable placeholders use standard syntax | Medium | Custom syntax required | User testing |

---

## Requirements

### Functional Requirements

#### FR-1: Template CRUD Operations (Ubiquitous)

- **FR-1.1**: The system shall always provide the ability to create new templates with name, category, content, and variables
- **FR-1.2**: The system shall always persist templates to the file system in the workspace/templates directory
- **FR-1.3**: The system shall always validate template names are unique within a category
- **FR-1.4**: The system shall always support template editing with variable placeholder preservation

#### FR-2: Template Categories Management (Ubiquitous)

- **FR-2.1**: The system shall always support three initial categories: Q&A Questions, Document Structure, Prompts
- **FR-2.2**: The system shall always allow category-based template organization
- **FR-2.3**: The system shall always provide category filtering in template list

#### FR-3: Template Variable System (Event-Driven)

- **FR-3.1**: WHEN a template is created THEN the system shall allow defining variables with syntax `{{variable_name}}`
- **FR-3.2**: WHEN a template is applied THEN the system shall substitute variables with provided values
- **FR-3.3**: WHEN a template contains undefined variables THEN the system shall highlight them for user input
- **FR-3.4**: WHEN a template is previewed THEN the system shall show variable placeholders with distinct styling

#### FR-4: Template Application (Event-Driven)

- **FR-4.1**: WHEN a user selects a Q&A template THEN the system shall populate the Q&A form with template questions
- **FR-4.2**: WHEN a user selects a document template THEN the system shall create a new document with template structure
- **FR-4.3**: WHEN a user applies a prompt template THEN the system shall generate AI prompt with substituted variables

#### FR-5: Template Preview (Event-Driven)

- **FR-5.1**: WHEN a user clicks preview THEN the system shall render template content with sample variable values
- **FR-5.2**: WHEN a template has variables THEN the preview shall display variable input form
- **FR-5.3**: WHEN preview is generated THEN the system shall show rendered output in read-only mode

#### FR-6: Project Template Settings (State-Driven)

- **FR-6.1**: IF a project has default templates configured THEN the system shall auto-apply templates on new task creation
- **FR-6.2**: IF no project templates are set THEN the system shall use system default templates
- **FR-6.3**: IF a template is deleted THEN the system shall update project settings to remove reference

#### FR-7: Template Import/Export (Event-Driven)

- **FR-7.1**: WHEN a user exports a template THEN the system shall generate a JSON file with complete template data
- **FR-7.2**: WHEN a user imports a template THEN the system shall validate and add the template to the library
- **FR-7.3**: WHEN importing fails THEN the system shall display specific validation errors

### Non-Functional Requirements

#### NFR-1: Performance

- **NFR-1.1**: Template list shall render within 100ms for up to 50 templates
- **NFR-1.2**: Template preview shall generate within 200ms
- **NFR-1.3**: Variable substitution shall complete within 50ms for templates under 10KB

#### NFR-2: Usability

- **NFR-2.1**: Template editor shall provide syntax highlighting for variables
- **NFR-2.2**: Variable autocomplete shall suggest existing variables when typing `{{`
- **NFR-2.3**: Template categories shall be visually distinct with icons

#### NFR-3: Reliability

- **NFR-3.1**: The system shall validate template JSON structure before saving
- **NFR-3.2**: The system shall backup templates before deletion
- **NFR-3.3**: The system shall maintain template version history

### Unwanted Requirements

- **UW-1**: The system shall not allow creating templates without a category
- **UW-2**: The system shall not allow empty template names
- **UW-3**: The system shall not delete templates referenced by active projects without warning
- **UW-4**: The system shall not allow invalid variable syntax in templates

### Optional Requirements

- **OPT-1**: Where possible, provide template duplication for quick variations
- **OPT-2**: Where possible, provide template sharing between projects
- **OPT-3**: Where possible, provide template version comparison view
- **OPT-4**: Where possible, provide AI-assisted template generation suggestions

---

## Specifications

### Data Model

```typescript
// Template categories
export type TemplateCategory = 'qa-questions' | 'document-structure' | 'prompts';

// Template variable definition
export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue: string | null;
  required: boolean;
  type: 'text' | 'textarea' | 'select' | 'number';
  options: string[] | null;  // For select type
}

// Main Template interface
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  content: string;  // JSON string for Q&A, Markdown for documents
  variables: TemplateVariable[];
  isDefault: boolean;
  projectId: string | null;  // null = global template
  createdAt: string;
  updatedAt: string;
}

// Template Store State
export interface TemplateState {
  templates: Template[];
  selectedTemplateId: string | null;
  selectedCategory: TemplateCategory | null;
  isLoading: boolean;
  error: string | null;
}

// DTOs for API operations
export interface CreateTemplateDto {
  name: string;
  category: TemplateCategory;
  description?: string;
  content: string;
  variables?: TemplateVariable[];
  isDefault?: boolean;
  projectId?: string | null;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
  isDefault?: boolean;
}

// Template application context
export interface TemplateApplicationContext {
  templateId: string;
  variableValues: Record<string, string>;
  targetType: 'qa-form' | 'document' | 'prompt';
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/templates | Get all templates (with optional category filter) |
| GET | /api/templates/:templateId | Get a single template |
| POST | /api/templates | Create a new template |
| PUT | /api/templates/:templateId | Update a template |
| DELETE | /api/templates/:templateId | Delete a template |
| POST | /api/templates/:templateId/apply | Apply template with variables |
| POST | /api/templates/:templateId/preview | Preview template with sample values |
| POST | /api/templates/import | Import template from JSON |
| GET | /api/templates/:templateId/export | Export template to JSON |
| GET | /api/projects/:projectId/templates | Get project-specific templates |

### Component Architecture

```
src/components/template/
├── TemplateManager.tsx        # Main template management page
├── TemplateList.tsx           # Category-grouped template list
├── TemplateCard.tsx           # Individual template card
├── TemplateCreateModal.tsx    # Create template modal
├── TemplateEditModal.tsx      # Edit template modal
├── TemplatePreview.tsx        # Template preview with variable substitution
├── TemplateVariableEditor.tsx # Variable definition editor
├── TemplateVariableForm.tsx   # Variable input form for application
└── TemplateImportExport.tsx   # Import/Export functionality

src/store/
└── templateStore.ts           # Zustand store for templates

src/services/
└── templateService.ts         # API communication layer

src/utils/
└── templateParser.ts          # Variable parsing and substitution

server/routes/
└── templates.ts               # Express API routes

server/utils/
└── templateStorage.ts         # File system operations for templates
```

### File Storage Structure

```
workspace/templates/
├── templates.json             # Template metadata index
├── qa-questions/
│   ├── game_mechanic.json     # Default game mechanic Q&A
│   ├── economy.json           # Default economy Q&A
│   └── growth.json            # Default growth system Q&A
├── document-structure/
│   ├── design_doc.md          # Design document template
│   ├── prd.md                 # PRD template
│   └── feature_list.md        # Feature list template
└── prompts/
    ├── design_generation.txt  # AI design generation prompt
    ├── prd_generation.txt     # AI PRD generation prompt
    └── revision.txt           # AI revision request prompt
```

### Variable Substitution Algorithm

```
1. Parse template content for {{variable_name}} patterns
2. Extract unique variable names
3. Match with template.variables definitions
4. For each variable:
   - If value provided: substitute
   - If required and missing: throw validation error
   - If optional and missing: use defaultValue or empty string
5. Return substituted content
```

---

## Traceability

| Requirement | Test Case | Component | API Endpoint |
|-------------|-----------|-----------|--------------|
| FR-1.1 | TC-CREATE-001 | TemplateCreateModal | POST /templates |
| FR-1.2 | TC-PERSIST-001 | templateStorage | POST /templates |
| FR-2.1 | TC-CATEGORY-001 | TemplateList | GET /templates |
| FR-3.1 | TC-VARIABLE-001 | TemplateVariableEditor | - |
| FR-3.2 | TC-APPLY-001 | templateParser | POST /templates/:id/apply |
| FR-4.1 | TC-QA-APPLY-001 | QAFormModal | POST /templates/:id/apply |
| FR-5.1 | TC-PREVIEW-001 | TemplatePreview | POST /templates/:id/preview |
| FR-6.1 | TC-PROJECT-001 | ProjectSettingsModal | GET /projects/:id/templates |
| FR-7.1 | TC-EXPORT-001 | TemplateImportExport | GET /templates/:id/export |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex variable syntax parsing | Medium | Medium | Use regex with comprehensive test suite |
| Template-project coupling issues | Low | Medium | Implement null projectId for global templates |
| Large template content performance | Low | Low | Implement lazy loading for content |
| Variable naming conflicts | Medium | Low | Enforce unique variable names per template |
| Template versioning complexity | Medium | Medium | Start with simple backup, expand later |

---

## Expert Consultation Recommendations

### Backend Expert (code-backend)

- Template storage pattern optimization
- Variable substitution algorithm review
- Import/Export JSON schema validation

### Frontend Expert (code-frontend)

- Template editor with syntax highlighting
- Variable form dynamic generation
- Preview component performance

---

## Constitution Alignment

### Technology Stack Verification

- Frontend: React 18.x, TypeScript 5.x, Tailwind CSS (Aligned)
- Backend: Node.js 20.x, Express 4.x (Aligned)
- Storage: JSON/Markdown file-based (Aligned)
- State: Zustand (Aligned)

### Naming Conventions

- Component names: PascalCase (TemplateManager, TemplateCard)
- Service functions: camelCase (createTemplate, applyTemplate)
- API routes: kebab-case (/api/templates/:templateId/apply)
- File names: PascalCase for components, camelCase for utilities

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | workflow-spec | Initial SPEC creation |
