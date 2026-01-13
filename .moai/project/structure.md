# AI Workflow Kanban - Project Structure

## Directory Overview

```
/design-workflow
├── CLAUDE.md                      # Claude Code project context
├── package.json
├── vite.config.ts
├── vitest.config.ts               # Test configuration
├── start.sh                       # Startup script
│
├── /src
│   ├── /components
│   │   ├── /layout
│   │   │   ├── Header.tsx             # Project selection, reference tag bar
│   │   │   ├── Sidebar.tsx            # System document sidebar
│   │   │   └── Layout.tsx             # Main layout
│   │   │
│   │   ├── /project
│   │   │   ├── ProjectSelector.tsx    # Project selection dropdown
│   │   │   ├── ProjectCreateModal.tsx # Project creation modal
│   │   │   └── ProjectSettingsModal.tsx # Project settings modal
│   │   │
│   │   ├── /system
│   │   │   ├── SystemSidebar.tsx      # System document sidebar (E+A pattern)
│   │   │   ├── SystemList.tsx         # System list (by category)
│   │   │   ├── SystemCard.tsx         # System document card
│   │   │   ├── SystemCreateModal.tsx  # Add system document modal
│   │   │   ├── SystemEditModal.tsx    # Edit system document modal
│   │   │   ├── SystemPreview.tsx      # System document preview
│   │   │   ├── SystemSearch.tsx       # System search input
│   │   │   └── SystemFilter.tsx       # System filter controls
│   │   │
│   │   ├── /kanban
│   │   │   ├── KanbanBoard.tsx        # Main kanban board
│   │   │   ├── KanbanColumn.tsx       # Column component
│   │   │   ├── KanbanCard.tsx         # Card component
│   │   │   └── __tests__/             # Kanban component tests
│   │   │
│   │   ├── /task
│   │   │   ├── TaskCreateModal.tsx    # Task creation modal
│   │   │   ├── TaskEditModal.tsx      # Feature list edit modal
│   │   │   ├── TaskDeleteConfirm.tsx  # Task deletion confirm
│   │   │   └── TaskReferences.tsx     # Task reference systems display
│   │   │
│   │   ├── /document
│   │   │   ├── QAFormModal.tsx        # Q&A form modal
│   │   │   ├── DocumentPreview.tsx    # Document preview
│   │   │   ├── DocumentEditor.tsx     # Markdown direct editing
│   │   │   ├── EnhancedDocumentEditor.tsx  # CodeMirror editor (NEW)
│   │   │   ├── RevisionPanel.tsx      # AI revision request panel
│   │   │   ├── VersionHistory.tsx     # Version history
│   │   │   ├── SaveStatusIndicator.tsx    # Save status indicator (NEW)
│   │   │   ├── VersionComparisonView.tsx  # Version diff viewer (NEW)
│   │   │   ├── KeyboardShortcutsHelp.tsx  # Shortcut help (NEW)
│   │   │   ├── DiffViewerModal.tsx    # Diff visualization (NEW)
│   │   │   ├── DocumentViewerModal.tsx    # Document viewer modal (NEW)
│   │   │   ├── CategorySelector.tsx   # Category selector
│   │   │   ├── ProgressIndicator.tsx  # Progress indicator
│   │   │   ├── QuestionStep.tsx       # Q&A step component
│   │   │   └── __tests__/             # Document component tests
│   │   │
│   │   ├── /archive                       # NEW (SPEC-ARCHIVE-001)
│   │   │   ├── ArchiveList.tsx           # Archive list view
│   │   │   ├── ArchiveDetail.tsx         # Archive detail view
│   │   │   ├── ArchiveCard.tsx           # Archive card component (NEW)
│   │   │   ├── ArchiveConfirmDialog.tsx  # Archive confirmation (NEW)
│   │   │   └── __tests__/                # Archive component tests
│   │   │
│   │   ├── /dashboard                     # NEW (SPEC-DASHBOARD-001)
│   │   │   ├── Dashboard.tsx             # Main dashboard component
│   │   │   ├── DashboardHeader.tsx       # Header with filters
│   │   │   ├── StatsSummary.tsx          # Statistics cards
│   │   │   ├── TaskStatusChart.tsx       # Task status pie chart
│   │   │   ├── ProgressTimeline.tsx      # Timeline line chart
│   │   │   └── __tests__/                # Dashboard tests
│   │   │
│   │   ├── /reference                     # NEW (SPEC-DOCREF-001/002)
│   │   │   ├── ReferenceDocButton.tsx         # Reference doc button
│   │   │   ├── DocumentReferenceSidePanel.tsx # Side panel
│   │   │   ├── ReferenceDocList.tsx           # Document list
│   │   │   ├── ReferenceDocListItem.tsx       # List item
│   │   │   ├── ReferenceDocDetail.tsx         # Document detail
│   │   │   ├── ReferenceDocFilter.tsx         # Filter UI
│   │   │   ├── ReferenceSearchInput.tsx       # Search input
│   │   │   ├── ReferenceSearchDropdown.tsx    # Search dropdown (NEW)
│   │   │   ├── SideBySideView.tsx             # Side-by-side comparison (NEW)
│   │   │   ├── ReferenceTagBar.tsx            # Tag bar
│   │   │   └── __tests__/                    # Reference tests
│   │   │
│   │   ├── /llm                           # NEW (Multi-LLM Support)
│   │   │   ├── LLMSettingsTab.tsx               # Settings tab
│   │   │   ├── ProviderConfigCard.tsx           # Provider config card (NEW)
│   │   │   ├── ColumnSettingsButton.tsx         # Column LLM settings (NEW)
│   │   │   ├── ColumnLLMSettingsModal.tsx       # Column LLM modal (NEW)
│   │   │   ├── TaskStageModelSelector.tsx       # Stage model selector (NEW)
│   │   │   └── index.ts
│   │   │
│   │   ├── /debug                         # NEW (SPEC-DEBUG-001 ~ 005)
│   │   │   ├── DebugConsole.tsx              # Main console component
│   │   │   ├── DebugHeader.tsx               # Console header
│   │   │   ├── DebugFilters.tsx              # Filter controls
│   │   │   ├── DebugStatsPanel.tsx           # Statistics display (NEW)
│   │   │   ├── DebugStatusIcon.tsx           # Status indicator (NEW)
│   │   │   ├── LogList.tsx                   # Log list component
│   │   │   ├── LogItem.tsx                   # Log item component
│   │   │   ├── LogDetailModal.tsx            # Detail view modal
│   │   │   ├── EmptyDebugState.tsx           # Empty state
│   │   │   └── index.ts
│   │   │
│   │   ├── /qa
│   │   │   ├── CategorySelector.tsx   # Q&A category selector
│   │   │   ├── QAFormModal.tsx        # Q&A form modal
│   │   │   ├── QuestionItem.tsx       # Question item component
│   │   │   └── QuestionList.tsx       # Question list component
│   │   │
│   │   ├── /template
│   │   │   ├── TemplateCard.tsx       # Template card
│   │   │   ├── TemplateList.tsx       # Template list
│   │   │   ├── TemplateManager.tsx    # Template manager
│   │   │   ├── TemplateCreateModal.tsx    # Template creation
│   │   │   ├── TemplateEditModal.tsx      # Template editing
│   │   │   ├── TemplatePreview.tsx        # Template preview
│   │   │   ├── TemplateVariableEditor.tsx # Variable editor
│   │   │   ├── TemplateVariableForm.tsx   # Variable form
│   │   │   └── TemplateImportExport.tsx   # Import/Export
│   │   │
│   │   ├── /generation
│   │   │   ├── GenerationProgress.tsx  # Generation progress
│   │   │   ├── GenerationError.tsx     # Generation error display
│   │   │   └── DocumentPreview.tsx     # Generated document preview
│   │   │
│   │   ├── /discovery
│   │   │   ├── DiscoverySkeleton.tsx        # Loading skeleton
│   │   │   ├── RecommendationCard.tsx       # Recommendation card
│   │   │   └── AutoDiscoveryRecommendation.tsx  # Auto-discovery
│   │   │
│   │   ├── /auth
│   │   │   ├── LoginForm.tsx         # Login form
│   │   │   ├── RegisterForm.tsx      # Registration form
│   │   │   └── ProtectedRoute.tsx    # Auth protected route
│   │   │
│   │   └── /common
│   │       ├── MarkdownEditor.tsx     # Shared markdown editor
│   │       ├── SearchInput.tsx        # Search input
│   │       ├── TagInput.tsx           # Tag input
│   │       ├── ConfirmDialog.tsx      # Confirmation dialog
│   │       └── Toast.tsx              # Notification toast
│   │
│   ├── /services
│   │   ├── projectService.ts          # Project CRUD
│   │   ├── systemDocService.ts        # System document CRUD
│   │   ├── taskService.ts             # Task CRUD
│   │   ├── claudeCodeService.ts       # Claude Code Headless calls
│   │   ├── templateService.ts         # Template management
│   │   ├── qaService.ts               # Q&A session management
│   │   ├── authService.ts             # Authentication (SPEC-AUTH-001)
│   │   ├── archiveService.ts          # Archive management (SPEC-ARCHIVE-001)
│   │   ├── dashboardService.ts        # Dashboard analytics (SPEC-DASHBOARD-001)
│   │   ├── discoveryService.ts        # Auto-discovery (SPEC-AUTODISCOVERY-001)
│   │   ├── referenceDocService.ts     # Reference docs (SPEC-DOCREF-001)
│   │   └── llmSettingsService.ts      # LLM provider settings (NEW)
│   │
│   ├── /stores
│   │   ├── projectStore.ts            # Project state
│   │   ├── systemStore.ts             # System document state
│   │   ├── taskStore.ts               # Task state
│   │   ├── referenceStore.ts          # Reference selection state
│   │   ├── templateStore.ts           # Template state (SPEC-TEMPLATE-001)
│   │   ├── qaStore.ts                 # Q&A state (SPEC-QA-001)
│   │   ├── authStore.ts               # Auth state (SPEC-AUTH-001)
│   │   ├── archiveStore.ts            # Archive state (SPEC-ARCHIVE-001)
│   │   ├── discoveryStore.ts          # Discovery state (SPEC-AUTODISCOVERY-001)
│   │   ├── referenceDocStore.ts       # Reference doc state (SPEC-DOCREF-002)
│   │   ├── dashboardStore.ts          # Dashboard state (SPEC-DASHBOARD-001)
│   │   ├── debugStore.ts              # Debug state (SPEC-DEBUG-001) (NEW)
│   │   └── llmSettingsStore.ts        # LLM settings state (NEW)
│   │
│   ├── /types
│   │   ├── index.ts                   # TypeScript type definitions
│   │   ├── llm.ts                     # LLM provider types
│   │   └── debug.ts                   # Debug types (NEW)
│   │
│   ├── /utils
│   │   ├── llmLogger.ts               # LLM logging utility (NEW)
│   │   └── accessControl.ts           # Access control (NEW)
│   │
│   └── App.tsx
│
├── /server
│   ├── index.ts                       # Express server
│   ├── /routes
│   │   ├── projects.ts                # Project API
│   │   ├── systems.ts                 # System document API
│   │   ├── tasks.ts                   # Task API
│   │   ├── archives.ts                # Archive API (SPEC-ARCHIVE-001)
│   │   ├── templates.ts               # Template API (SPEC-TEMPLATE-001)
│   │   ├── questions.ts               # Questions API (SPEC-QA-001)
│   │   ├── qa.ts                      # Q&A session API (SPEC-QA-001)
│   │   ├── qa-sessions.ts             # Q&A sessions API
│   │   ├── auth.ts                    # Auth API (SPEC-AUTH-001)
│   │   ├── users.ts                   # Users API
│   │   ├── projectAccess.ts           # Project access API
│   │   ├── analytics.ts               # Analytics API (SPEC-DASHBOARD-001)
│   │   ├── discovery.ts               # Discovery API (SPEC-AUTODISCOVERY-001)
│   │   ├── completedDocuments.ts      # Completed docs API (SPEC-DOCREF-001)
│   │   ├── llmSettings.ts             # LLM settings API (NEW)
│   │   ├── llmSettings.test.ts        # LLM settings tests (NEW)
│   │   ├── debug.ts                   # Debug API (NEW)
│   │   └── generate.ts                # AI generation API
│   │
│   └── /utils
│       ├── claudeCodeRunner.ts        # Claude Code process execution
│       ├── keywordExtractor.ts        # Keyword extraction
│       ├── projectStorage.ts          # Project file storage
│       ├── taskStorage.ts             # Task file storage
│       ├── systemStorage.ts           # System doc storage
│       ├── qaStorage.ts               # Q&A storage
│       ├── archiveStorage.ts          # Archive storage
│       ├── templateStorage.ts         # Template storage
│       ├── completedDocStorage.ts     # Completed doc storage
│       ├── llmSettingsStorage.ts      # LLM settings storage
│       ├── llmProvider.ts             # LLM provider utilities
│       ├── llmLogger.ts               # LLM request logging (NEW)
│       ├── llmProviders/              # Provider-specific implementations
│       │   ├── index.ts               # Provider registry
│       │   ├── base.ts                # Base provider class
│       │   ├── claudeCode.ts          # Claude Code provider
│       │   ├── openai.ts              # OpenAI provider
│       │   ├── gemini.ts              # Gemini provider
│       │   ├── lmstudio.ts            # LM Studio provider (UPDATED)
│       │   └── __tests__/             # Provider tests
│       ├── encryption.ts              # API key encryption
│       ├── modelPricing.ts            # Model pricing data (NEW)
│       ├── tokenExtractor.ts          # Token usage extraction
│       ├── apiResponse.ts             # API response utilities
│       ├── errorBuilder.ts            # Error response builder
│       ├── diffGenerator.ts           # Diff generation utility
│       ├── promptBuilder.ts           # Prompt builder
│       ├── validation.ts              # Input validation
│       ├── response.ts                # Response formatter
│       └── tokenManager.ts            # Token management
│
├── /tests
│   ├── qa-sessions.test.ts            # Q&A sessions tests
│   ├── archives.test.ts               # Archive tests
│   └── /server
│       ├── /routes
│       │   ├── generate.llm.test.ts   # LLM generate tests
│       │   ├── llmSettings.test.ts    # LLM settings tests
│       │   └── ...
│       └── /utils
│           ├── encryption.test.ts
│           ├── llmProvider.test.ts
│           ├── llmLogger.test.ts      # LLM logger tests (NEW)
│           └── llmSettingsStorage.test.ts
│
├── /scripts
│   └── kill-ports.sh                  # Port cleanup script
│
├── /workspace                         # Working directory (gitignore)
│   ├── /projects                      # Project folders
│   │   └── /{project_id}
│   │       ├── project.json           # Project settings
│   │       ├── RootRule.md            # Central Dogma
│   │       ├── llm-settings.json      # LLM provider settings (NEW)
│   │       ├── /systems               # System documents
│   │       │   ├── character.md
│   │       │   ├── combat.md
│   │       │   └── systems.json       # System metadata
│   │       ├── /tasks                 # Tasks (kanban cards)
│   │       │   └── /{task_id}
│   │       │       ├── task.json      # Task metadata
│   │       │       ├── feature_list.md
│   │       │       ├── design_doc.md
│   │       │       ├── prd.md
│   │       │       ├── prototype.html
│   │       │       └── /revisions
│   │       └── /archives              # Archived tasks
│   │           └── /{task_id}
│   │               └── ...
│   │
│   └── /templates                     # Common templates
│       └── /questions
│           ├── game_mechanic.json
│           ├── economy.json
│           └── growth.json
│
├── /moai
│   ├── /config
│   │   ├── config.yaml                # Main configuration
│   │   ├── /sections
│   │   │   ├── git-strategy.yaml      # Git workflow config
│   │   │   ├── language.yaml          # Language settings
│   │   │   ├── llm.yaml               # Multi-LLM routing (NEW)
│   │   │   ├── project.yaml           # Project metadata
│   │   │   ├── quality.yaml           # Quality settings
│   │   │   ├── system.yaml            # System settings
│   │   │   └── user.yaml              # User settings
│   │   └── /sections-new              # New config sections
│   │       ├── llm.yaml               # LLM routing config (NEW)
│   │       └── pricing.yaml           # Pricing config (NEW)
│   │
│   ├── /specs                         # SPEC implementations
│   │   ├── SPEC-SETUP-001/
│   │   ├── SPEC-PROJECT-001/
│   │   ├── SPEC-KANBAN-001/
│   │   ├── SPEC-TASK-001/
│   │   ├── SPEC-SYSTEM-001/
│   │   ├── SPEC-REFERENCE-001/
│   │   ├── SPEC-TEMPLATE-001/
│   │   ├── SPEC-QA-001/
│   │   ├── SPEC-AUTH-001/
│   │   ├── SPEC-DOCUMENT-001/
│   │   ├── SPEC-ARCHIVE-001/
│   │   ├── SPEC-CLAUDE-001/
│   │   ├── SPEC-DASHBOARD-001/
│   │   ├── SPEC-AUTODISCOVERY-001/
│   │   ├── SPEC-DOCREF-001/
│   │   ├── SPEC-DOCREF-002/
│   │   ├── SPEC-DOCEDIT-001/
│   │   ├── SPEC-DOCEDIT-002/
│   │   ├── SPEC-MODELHISTORY-001/
│   │   ├── SPEC-LLM-001/
│   │   ├── SPEC-LLM-002/
│   │   ├── SPEC-LLM-003/
│   │   ├── SPEC-DEBUG-001/
│   │   ├── SPEC-DEBUG-002/
│   │   ├── SPEC-DEBUG-003/
│   │   ├── SPEC-DEBUG-004/
│   │   ├── SPEC-DEBUG-005/
│   │   ├── SPEC-AGENT-001/
│   │   └── SPEC-GAME-001/
│   │
│   ├── /project
│   │   ├── product.md                # Product overview
│   │   ├── structure.md              # Project structure
│   │   └── tech.md                   # Technology stack
│   │
│   └── /memory
│       └── last-session-state.json   # Session state
│
└── /claude
    ├── /agents/moai                   # Agent definitions
    │   ├── expert-backend.md
    │   ├── expert-frontend.md
    │   ├── expert-security.md
    │   ├── expert-devops.md
    │   ├── expert-performance.md
    │   ├── expert-debug.md
    │   ├── expert-testing.md
    │   ├── expert-refactoring.md      # NEW (code refactoring)
    │   ├── manager-claude-code.md
    │   ├── manager-docs.md
    │   ├── manager-git.md
    │   ├── manager-project.md
    │   ├── manager-quality.md
    │   ├── manager-spec.md
    │   ├── manager-strategy.md
    │   └── manager-tdd.md
    │
    ├── /commands/moai                 # Command definitions
    │   ├── 0-project.md               # Project management
    │   ├── 1-plan.md                  # Specification generation
    │   ├── 2-run.md                   # TDD implementation
    │   ├── 3-sync.md                  # Documentation sync
    │   ├── 9-feedback.md              # Feedback collection
    │   ├── alfred.md                  # NEW (intelligent routing)
    │   ├── cancel-loop.md             # NEW (cancel loop execution)
    │   ├── fix.md                     # NEW (quick fix command)
    │   └── loop.md                    # NEW (loop execution)
    │
    └── /skills/moai                   # Skill definitions
        ├── moai-foundation-claude/
        ├── moai-foundation-core/
        ├── moai-foundation-context/
        ├── moai-foundation-quality/
        ├── moai-domain-backend/
        ├── moai-domain-database/
        ├── moai-domain-frontend/
        ├── moai-domain-uiux/
        ├── moai-docs-generation/
        ├── moai-formats-data/
        ├── moai-workflow-docs/
        └── ...
```

---

## Directory Descriptions

### /src/components

UI components organized by domain:

| Directory | Description | Related SPEC |
|-----------|-------------|--------------|
| `/layout` | Main layout components including header, sidebar | - |
| `/project` | Project (game) management related components | SPEC-PROJECT-001 |
| `/system` | System document management and E+A pattern UI | SPEC-SYSTEM-001 |
| `/kanban` | Kanban board core components | SPEC-KANBAN-001 |
| `/task` | Task (kanban card) management components | SPEC-TASK-001 |
| `/document` | Document generation, editing, version management | SPEC-DOCUMENT-001, SPEC-DOCEDIT-001/002 |
| `/archive` | Archive feature components | SPEC-ARCHIVE-001 |
| `/dashboard` | Dashboard and analytics charts | SPEC-DASHBOARD-001 |
| `/reference` | Reference document panel and comparison | SPEC-DOCREF-001/002 |
| `/llm` | LLM provider settings and configuration | SPEC-LLM-001, SPEC-LLM-002, SPEC-LLM-003 |
| `/debug` | Debug console and LLM monitoring | SPEC-DEBUG-001 ~ 005 |
| `/qa` | Q&A form components | SPEC-QA-001 |
| `/template` | Template management components | SPEC-TEMPLATE-001 |
| `/generation` | Document generation progress and preview | - |
| `/discovery` | Auto-discovery recommendation components | SPEC-AUTODISCOVERY-001 |
| `/auth` | Authentication and authorization UI | SPEC-AUTH-001 |
| `/common` | Reusable common components | - |

### /src/services

Business logic layer:

| File | Description | Related SPEC |
|------|-------------|--------------|
| `projectService.ts` | Project CRUD API calls | SPEC-PROJECT-001 |
| `systemDocService.ts` | System document CRUD API calls | SPEC-SYSTEM-001 |
| `taskService.ts` | Task CRUD API calls | SPEC-TASK-001 |
| `claudeCodeService.ts` | Claude Code Headless mode integration | SPEC-CLAUDE-001 |
| `templateService.ts` | Template management | SPEC-TEMPLATE-001 |
| `qaService.ts` | Q&A session management | SPEC-QA-001 |
| `authService.ts` | Authentication service | SPEC-AUTH-001 |
| `archiveService.ts` | Archive management | SPEC-ARCHIVE-001 |
| `dashboardService.ts` | Dashboard analytics | SPEC-DASHBOARD-001 |
| `discoveryService.ts` | Auto-discovery logic | SPEC-AUTODISCOVERY-001 |
| `referenceDocService.ts` | Reference document API | SPEC-DOCREF-001 |
| `llmSettingsService.ts` | LLM provider settings | SPEC-LLM-001 ~ 003 |

### /src/stores

Zustand state management:

| File | Description | Related SPEC |
|------|-------------|--------------|
| `projectStore.ts` | Current project, project list | SPEC-PROJECT-001 |
| `systemStore.ts` | System documents, selected systems | SPEC-SYSTEM-001 |
| `taskStore.ts` | Tasks, kanban state | SPEC-TASK-001 |
| `referenceStore.ts` | Reference selection state | SPEC-REFERENCE-001 |
| `templateStore.ts` | Template state | SPEC-TEMPLATE-001 |
| `qaStore.ts` | Q&A state | SPEC-QA-001 |
| `authStore.ts` | Authentication state | SPEC-AUTH-001 |
| `archiveStore.ts` | Archive state | SPEC-ARCHIVE-001 |
| `discoveryStore.ts` | Discovery state | SPEC-AUTODISCOVERY-001 |
| `referenceDocStore.ts` | Reference document panel state | SPEC-DOCREF-002 |
| `dashboardStore.ts` | Dashboard state | SPEC-DASHBOARD-001 |
| `debugStore.ts` | Debug console state | SPEC-DEBUG-001 ~ 005 |
| `llmSettingsStore.ts` | LLM settings state | SPEC-LLM-001 ~ 003 |

### /server

Express backend:

| Directory | Description |
|-----------|-------------|
| `/routes` | REST API endpoints (20+ route files) |
| `/utils` | Storage utilities, Claude Code runner, encryption, LLM providers |
| `/utils/llmProviders` | Multi-provider LLM implementations |

### /.moai/config/sections

Configuration sections:

| File | Description |
|------|-------------|
| `config.yaml` | Main configuration file |
| `git-strategy.yaml` | Git workflow settings |
| `language.yaml` | Language and localization |
| `llm.yaml` | Multi-LLM routing configuration (NEW) |
| `project.yaml` | Project metadata |
| `quality.yaml` | Quality gate settings |
| `system.yaml` | System-level settings |
| `user.yaml` | User preferences |
| `pricing.yaml` | Model pricing data (NEW) |

### /.moai/specs

SPEC implementations (27 total):

| Category | SPECs |
|----------|-------|
| Core (16) | SETUP-001, PROJECT-001, KANBAN-001, TASK-001, SYSTEM-001, REFERENCE-001, TEMPLATE-001, QA-001, AUTH-001, DOCUMENT-001, ARCHIVE-001, CLAUDE-001, DASHBOARD-001, AUTODISCOVERY-001, DOCREF-001, DOCREF-002 |
| Editor (2) | DOCEDIT-001, DOCEDIT-002 |
| LLM (3) | LLM-001, LLM-002, LLM-003 |
| Debug (5) | DEBUG-001, DEBUG-002, DEBUG-003, DEBUG-004, DEBUG-005 |
| Other (3) | MODELHISTORY-001, AGENT-001, GAME-001 |

### /.claude/agents/moai

Agent definitions (21 total):

**Manager Agents (8)**:
- manager-claude-code, manager-docs, manager-git, manager-project
- manager-quality, manager-spec, manager-strategy, manager-tdd

**Expert Agents (9)**:
- expert-backend, expert-frontend, expert-security, expert-devops
- expert-performance, expert-debug, expert-testing, expert-refactoring (NEW)
- expert-refactoring

**Builder Agents (4)**:
- builder-agent, builder-command, builder-skill, builder-plugin

**Removed Agents (merged)**:
- expert-database (merged into expert-backend)
- expert-uiux (merged into expert-frontend)

### /.claude/commands/moai

Command definitions (9 total):

**Core Commands (4)**:
- 0-project, 1-plan, 2-run, 3-sync

**Utility Commands (4)**:
- alfred (NEW), fix (NEW), loop (NEW), cancel-loop (NEW)

**Feedback Command (1)**:
- 9-feedback

---

## Architecture Flow

```
Frontend (React) <--> Backend (Express) <--> Claude Code Headless / Multi-LLM Providers
                                               |
                                         /workspace (File System)
```

### Data Flow

1. **User Action** - Frontend UI interaction
2. **API Call** - Service layer calls Express backend
3. **File I/O** - Backend reads/writes to workspace directory
4. **AI Generation** - Backend calls Claude Code or configured LLM provider
5. **Response** - Results returned to frontend
6. **State Update** - Zustand store updates
7. **Re-render** - UI reflects new state

---

## SPEC Implementation Status

All 27 SPECs completed or in progress:

| SPEC ID | Feature | Status |
|---------|---------|--------|
| SPEC-SETUP-001 | Project Setup | Completed |
| SPEC-PROJECT-001 | Project Management | Completed |
| SPEC-KANBAN-001 | Kanban Board UI | Completed |
| SPEC-TASK-001 | Task Management | Completed |
| SPEC-SYSTEM-001 | System Document Management | Completed |
| SPEC-REFERENCE-001 | Reference System Selection | Completed |
| SPEC-TEMPLATE-001 | Template System | Completed |
| SPEC-QA-001 | Q&A System | Completed |
| SPEC-AUTH-001 | Multi-User Authentication | Completed |
| SPEC-DOCUMENT-001 | Document Editing Pipeline | Completed |
| SPEC-ARCHIVE-001 | Archive Feature | Completed |
| SPEC-CLAUDE-001 | Claude Code Integration | Completed |
| SPEC-DASHBOARD-001 | Dashboard and Analytics | Completed |
| SPEC-AUTODISCOVERY-001 | Relevant Systems Auto-Discovery | Completed |
| SPEC-DOCREF-001 | Completed Task Document API | Completed |
| SPEC-DOCREF-002 | Document Reference Panel UI | Completed |
| SPEC-DOCEDIT-001 | Enhanced Document Editor | Completed |
| SPEC-DOCEDIT-002 | Document Editor Improvements | Completed |
| SPEC-MODELHISTORY-001 | AI Model History Recording | Completed |
| SPEC-LLM-001 | Multi-LLM Provider Support | Completed |
| SPEC-LLM-002 | LLM Connection Test Logging | Completed |
| SPEC-LLM-003 | LM Studio Provider Refactoring | In Progress |
| SPEC-DEBUG-001 | LLM Debug Console | In Progress (60%) |
| SPEC-DEBUG-002 | Debug Log Filtering | In Progress |
| SPEC-DEBUG-003 | Debug Statistics | In Progress |
| SPEC-DEBUG-004 | Debug Log Export | In Progress |
| SPEC-DEBUG-005 | Debug Retry Functionality | In Progress |
| SPEC-AGENT-001 | Alfred Agent Integration | Completed |
| SPEC-GAME-001 | Game-specific Features | In Progress |

**Completion Rate**: 21/27 completed (78%)

---

Last Updated: 2026-01-12
