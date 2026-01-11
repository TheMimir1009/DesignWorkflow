# AI Workflow Kanban

Game design pipeline visualization and AI-powered document generation workflow system.

## Project Progress

**Current Progress: 100%**

### Completed Features

- Project Management (SPEC-PROJECT-001)
- Kanban Board UI (SPEC-KANBAN-001)
- Task Management (SPEC-TASK-001)
- System Document Management (SPEC-SYSTEM-001)
- Reference System Selection (SPEC-REFERENCE-001)
- Template System (SPEC-TEMPLATE-001)
- Q&A System (SPEC-QA-001)
- Multi-User Authentication (SPEC-AUTH-001)
- Document Editing Pipeline (SPEC-DOCUMENT-001)
- Archive Feature (SPEC-ARCHIVE-001)
- Claude Code Integration (SPEC-CLAUDE-001)
- Dashboard and Analytics (SPEC-DASHBOARD-001)
- Relevant Systems Auto-Discovery (SPEC-AUTODISCOVERY-001)
- Completed Task Document API (SPEC-DOCREF-001)
- Document Reference Panel UI (SPEC-DOCREF-002)
- AI Model History Recording (SPEC-MODELHISTORY-001)

### In Progress Features

- Document Editing Enhancement (SPEC-DOCEDIT-001)
  - Backend Implementation: 100% Complete (39 tests passed)
  - Frontend Implementation: Pending
  - Features: Version management, diff generation, auto-save API

- Circular Dependency Fix (SPEC-DOCEDIT-002)
  - Created shared types.ts file for document components
  - Extracted SaveStatus type to break circular dependency
  - EnhancedDocumentEditor and SaveStatusIndicator updated
  - Test coverage: 7/7 tests passed for types and circular dependency

## Project Context

This project implements a Kanban board-based workflow system for game planning documents. It automates the pipeline from Feature List to Design Document to PRD to Prototype, with AI assistance at each stage.

## Tech Stack

- Frontend: React 19, Vite 7, TypeScript 5.9
- Styling: Tailwind CSS 4
- State Management: Zustand
- Kanban: @dnd-kit/core
- Markdown: react-markdown + remark-gfm
- Backend: Node.js + Express
- AI Engine: Claude Code (Headless Mode)
- Storage: Local File System

## Architecture Overview

The application follows a component-based architecture with clear separation of concerns:

- **Components**: Reusable UI components organized by domain
- **Services**: API communication and business logic
- **Store**: Global state management with Zustand
- **Types**: TypeScript type definitions
- **Prompts**: AI prompt templates for document generation

## Key Directories

```
src/
  components/
    layout/      - Header, Sidebar, Footer
    project/     - Project management components
    system/      - System document components
    kanban/      - Kanban board and columns
    task/        - Task card and modal
    document/    - Document viewer and editor
    archive/     - Archive view components
    common/      - Shared UI components (Button, Modal, etc.)
  services/      - API client, file operations
  prompts/       - AI prompt templates
  types/         - TypeScript interfaces
  store/         - Zustand store definitions
server/
  routes/        - Express API routes (including documentVersions.ts)
  utils/         - Server utilities (including versionStorage.ts, diffGenerator.ts)
workspace/
  projects/      - Per-project data storage
  templates/
    questions/   - Q&A template JSONs
```

## Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Type checking
npx tsc --noEmit     # Check TypeScript without emitting
```

## Coding Standards

- Use TypeScript strict mode
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Maintain 100% type coverage
- Use meaningful variable and function names
- Keep components small and focused

## Do Not

- Do not use any CSS or style files
- Do not use class components
- Do not use any state management other than Zustand
- Do not store secrets in code
- Do not commit node_modules or build artifacts

## New Specifications (Draft)

- Circular Dependency Fix (SPEC-DOCEDIT-002) - Fix blank screen issue
- Game Development Specification (SPEC-GAME-001) - Bag collection game PRD
