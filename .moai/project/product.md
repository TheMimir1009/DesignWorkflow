# AI Workflow Kanban - Product Vision

## Project Overview

**Project Name**: design-workflow
**Version**: 1.3
**Created**: 2025-12-31
**Last Updated**: 2026-01-12

### Vision Statement

A visual workflow system that displays game planning pipelines as a kanban board, where AI (Claude Code) automatically generates documents at each stage.

### Target Users

- MMORPG and various genre system planners
- Game development teams utilizing Claude Code
- AI workflow automation enthusiasts

### Problems Solved

- Excessive time spent on planning document creation
- Difficulty in identifying relationships with existing planning documents
- Repetitive documentation work
- Need for context separation between multiple game projects
- LLM API debugging difficulties in production environments
- Cost optimization needs for multi-LLM workflows

---

## Core Features

### 1. Project (Game) Management

**Description**: Manage multiple game projects separately. Each project has independent system documents and tech stack.

**User Story**:
> "As a planner, I want to separate and manage planning documents for multiple game projects"

**Acceptance Criteria**:
- Project creation (name, description, tech stack, category definition)
- Project selection/switching (header dropdown)
- Project settings modification
- Project deletion (confirmation dialog)

---

### 2. System Document Management (Related Planning Documents)

**Description**: Register existing planning documents (system documents) by project and classify by category/tags

**User Story**:
> "As a planner, I want to classify existing planning documents by category and tags for easy finding and reference"

**Acceptance Criteria**:
- Add system document (name, category, tags, content, dependent systems)
- Direct writing with markdown editor
- Edit/delete system documents
- Category grouping
- Tag-based filtering
- Keyword search (supports 100+ documents)

---

### 3. Reference System Selection (E+A Pattern)

**Description**: Select system documents to reference via collapsible sidebar + header tag bar

**User Story**:
> "As a planner, I want to easily select existing systems to reference when writing new planning documents"

**Acceptance Criteria**:
- Display selected system tags in header `[Character x] [Combat x] [+ Add]`
- Quick removal by clicking tag `x`
- Search dropdown on `[+ Add]` click
- Checkbox selection in collapsible sidebar
- Category fold/unfold
- Search and tag filters
- Eye button for system document preview
- "Default references" setting per project

---

### 4. Kanban Board UI

**Description**: React-based kanban board for visualizing planning pipeline

**User Story**:
> "As a planner, I want to manage planning progress status with drag and drop"

**Acceptance Criteria**:
- 4 columns: Feature List | Design Doc | PRD | Prototype
- Status change via task (card) drag and drop
- AI task trigger on card movement
- Generated document preview on each card
- Reference system tag display on cards

---

### 5. Task Management (Kanban Cards)

**Description**: Create new planning tasks, write feature lists, delete

**User Story**:
> "As a planner, I want to create new planning tasks and write feature lists"

**Acceptance Criteria**:
- Task creation button `[+ New Task]`
- Auto-apply default reference systems on task creation
- Feature list edit modal on card click
- Write feature list with markdown editor
- Task deletion (confirmation dialog)

---

### 6. Form-based Q&A System

**Description**: Collect planning intent through structured questions before design document generation

**User Story**:
> "As a planner, I want AI to generate a design document draft after answering 3 core questions"

**Acceptance Criteria**:
- Default category: Game Mechanic (3 questions)
- Optional categories: Economy, Growth (changeable)
- Question list managed in JSON
- AI design document generation trigger on answer completion

---

### 7. Design Document Draft Generation and Editing

**Description**: AI generates design document draft based on Q&A answers, editable through free text feedback or direct editing

**User Story**:
> "As a planner, I want to review AI-generated drafts and either edit directly or request AI modifications"

**Acceptance Criteria**:
- Design document draft generation with Claude Code Headless
- Draft preview with markdown editor
- **Direct edit mode**: Direct modification with markdown editor
- **AI revision request mode**: Input revision request as free text
- Version history management
- "Approve" button to proceed to next stage

---

### 8. Relevant Systems Auto-Discovery

**Description**: Auto-recommend related systems via keyword extraction from feature list + AI judgment

**User Story**:
> "As a planner, I want automatic recommendations of existing systems related to new planning documents"

**Acceptance Criteria**:
- Extract tag keywords from feature list text
- Match with system document tags
- Claude determines related system list
- Recommend up to 5 related systems
- Add recommended results to references

---

### 9. Archive Feature

**Description**: Archive tasks after prototype development completion for organization

**User Story**:
> "As a planner, I want to archive completed planning tasks to keep the kanban board clean"

**Acceptance Criteria**:
- "Archive" button in prototype column
- Archived tasks hidden from kanban board
- View archived task list in separate view
- View archived task details (all documents)
- Restore from archive to kanban board if needed

---

## New Features (Updated 2026-01-12)

### 10. Debug Console

**Description**: Real-time LLM API call monitoring and debugging interface for developers

**Related SPECs**: SPEC-DEBUG-001, SPEC-DEBUG-002, SPEC-DEBUG-003, SPEC-DEBUG-004, SPEC-DEBUG-005

**User Story**:
> "As a developer, I want to monitor LLM API calls in real-time to diagnose issues and optimize costs"

**Acceptance Criteria**:
- Real-time LLM API call log display
- Request/response detailed view
- Token usage and cost calculation
- Failed request retry functionality
- Filter and search functionality
- Log export (JSON/CSV)
- Development mode only access

**Components**:
- DebugConsole.tsx - Main console component
- DebugStatsPanel.tsx - Statistics display
- DebugLogFilter.tsx - Filter controls
- DebugStatusIcon.tsx - Status indicator

---

### 11. Multi-LLM Provider Support

**Description**: Support for multiple LLM providers (Claude, OpenAI, Gemini, GLM, LM Studio)

**Related SPECs**: SPEC-LLM-001, SPEC-LLM-002, SPEC-LLM-003

**User Story**:
> "As a user, I want to use different LLM providers for different tasks to optimize cost and performance"

**Acceptance Criteria**:
- Provider configuration per project
- Connection test with detailed logging
- Model selection per task stage
- API key encryption (AES-256-CBC)
- Fallback on provider unavailability

**Supported Providers**:
- Claude Code (default, headless mode)
- OpenAI (GPT-4, GPT-4o-mini)
- Google Gemini (Gemini Pro, Flash)
- GLM (glm-4.7 series)
- LM Studio (local models)

**Components**:
- LLMSettingsTab.tsx - Settings tab
- ProviderConfigCard.tsx - Provider configuration card
- ColumnSettingsButton.tsx - Column LLM settings button
- ColumnLLMSettingsModal.tsx - Column LLM configuration modal
- TaskStageModelSelector.tsx - Stage model selector

---

### 12. Enhanced Document Editor

**Description**: Professional markdown editing experience with CodeMirror integration

**Related SPECs**: SPEC-DOCEDIT-001, SPEC-DOCEDIT-002

**User Story**:
> "As a planner, I want a professional editor with syntax highlighting and auto-save"

**Acceptance Criteria**:
- CodeMirror 6 editor with markdown language support
- Syntax highlighting and line numbers
- Auto-save with 5-second debounce
- Keyboard shortcuts (Ctrl+S, Ctrl+B, Ctrl+I, Ctrl+K)
- Save status indicator
- Read-only mode support
- Version comparison view

**Components**:
- EnhancedDocumentEditor.tsx - Main editor with CodeMirror
- SaveStatusIndicator.tsx - Save status display
- VersionComparisonView.tsx - Version diff viewer
- KeyboardShortcutsHelp.tsx - Shortcut help modal
- DiffViewerModal.tsx - Diff visualization modal

---

### 13. AI Model History Recording

**Description**: Track which AI models were used for document generation

**Related SPEC**: SPEC-MODELHISTORY-001

**User Story**:
> "As a planner, I want to know which AI model was used for each document generation"

**Acceptance Criteria**:
- Record model name per document
- Record provider information
- Display model history in version panel
- Export model usage statistics

---

### 14. Reference Document Panel

**Description**: Side panel for viewing reference documents while editing

**Related SPECs**: SPEC-DOCREF-001, SPEC-DOCREF-002

**User Story**:
> "As a planner, I want to view reference documents side-by-side while editing"

**Acceptance Criteria**:
- Collapsible side panel
- Document list with filtering
- Side-by-side view
- Document search
- Category filtering

**Components**:
- DocumentReferenceSidePanel.tsx - Side panel container
- ReferenceDocButton.tsx - Toggle button
- ReferenceDocDetail.tsx - Document detail view
- ReferenceDocFilter.tsx - Filter controls
- ReferenceSearchInput.tsx - Search input
- ReferenceSearchDropdown.tsx - Search dropdown
- SideBySideView.tsx - Side-by-side comparison

---

### 15. Dashboard and Analytics

**Description**: Comprehensive dashboard with charts and statistics

**Related SPEC**: SPEC-DASHBOARD-001

**User Story**:
> "As a project manager, I want to see project progress and statistics"

**Acceptance Criteria**:
- Task status pie chart
- Progress timeline line chart
- Statistics summary cards
- Date range filtering
- Empty state handling

---

## Glossary

| Term | Definition | Example |
|------|------------|---------|
| **Project** | A single game unit | Project Alpha, Project Beta |
| **Task** | A single planning work unit (kanban card) | "Guardian Star System", "New Raid" |
| **System Document** | Existing planning documents for the game | Character.md, Combat.md |
| **RootRule** | Project's Central Dogma | System index, glossary, dependency graph |
| **LLM Provider** | AI service provider | Claude, OpenAI, Gemini, GLM |
| **Debug Console** | Developer tool for monitoring LLM calls | Request/response logging interface |

---

## Success Metrics

- Feature list to design document draft generation time: Within 5 minutes
- Q&A 3 questions to design document generation success rate: 90% or higher
- Revision request to revision accuracy: 80% or higher
- Full pipeline (feature list to prototype): Within 30 minutes
- Debug console log capture overhead: Less than 10ms per request
- Multi-LLM provider fallback success rate: 95% or higher

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
