# AI Workflow Kanban

Game design pipeline visualization and AI-powered document generation workflow system.

## Project Progress

**Current Progress: 65%**

### Completed Features

- Project Management (SPEC-PROJECT-001)
- Kanban Board UI (SPEC-KANBAN-001)
- Task Management (SPEC-TASK-001)
- System Document Management (SPEC-SYSTEM-001)

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
  routes/        - Express API routes
  utils/         - Server utilities
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
