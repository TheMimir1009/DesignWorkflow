# AI Workflow Kanban

Game design pipeline visualization and AI-powered document generation workflow system.

## Project Progress

**Current Progress: 100%** (20 features completed)

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
- Circular Dependency Fix (SPEC-DOCEDIT-002)
- Agent Refactoring for Claude Code Integration (SPEC-AGENT-001)
- **LLM Logger API Integration (SPEC-DEBUG-003)**
  - Server-side LLM call logging infrastructure
  - Token usage tracking for all providers (OpenAI, Gemini, LMStudio, ClaudeCode)
  - Cost estimation by model pricing
  - 53 tests passing with 95.55% coverage
  - Core logging modules: llmLogger.ts, tokenExtractor.ts, modelPricing.ts
- **LM Studio Dynamic Model Selection UI (SPEC-LLM-004)**
  - LM Studio 프로바이더 선택 시 동적 모델 목록 표시
  - 로딩 상태 및 에러 처리 UI 개선
  - TaskStageModelSelector 및 ColumnLLMSettingsModal 수정
  - 23/23 테스트 통과
  - 관련 SPEC: SPEC-LLM-002, SPEC-LLM-003
- **Prompt Manager System (SPEC-PROMPT-001)**
  - 프롬프트 템플릿 관리 UI (PromptManagerPage, PromptList, PromptCard)
  - 프롬프트 편집기 (CodeMirror 6 기반 PromptEditor)
  - 변수 관리 패널 (PromptVariablePanel)
  - 버전 히스토리 시스템 (PromptVersionHistory)
  - 프롬프트 저장소 (promptStorage.ts, promptSeed.ts)
  - Zustand 상태 관리 (promptStore.ts)
  - RESTful API 엔드포인트 (/api/prompts/*)
  - 150+ 테스트 통과
  - 관련 SPEC: SPEC-QA-001, SPEC-DOCUMENT-001, SPEC-CLAUDE-001

### Completed Features (continued)

- **Passthrough Automatic Pipeline (SPEC-PASSTHROUGH-001)**
  - Q&A 완료 후 Design Doc -> PRD -> Prototype 자동 생성
  - 파이프라인 제어: 시작, 일시정지, 재개, 취소, 재시도
  - 실시간 진행률 표시 및 단계별 상태 관리
  - 브라우저 새로고침 후 상태 복구 지원
  - LLM 설정 연동 (mashup 모드 포함)
  - 구현 파일:
    - server/routes/passthrough.ts (API 라우트)
    - server/utils/passthroughRunner.ts (파이프라인 실행 엔진)
    - server/utils/passthroughStorage.ts (상태 지속성)
    - src/services/passthroughService.ts (API 서비스)
    - src/store/passthroughStore.ts (상태 관리)
    - src/types/passthrough.ts (타입 정의)
    - src/components/passthrough/ (UI 컴포넌트)

### In Progress Features

- Document Editing Enhancement (SPEC-DOCEDIT-001)
  - Backend Implementation: 100% Complete (39 tests passed)
  - Frontend Implementation: Pending
  - Features: Version management, diff generation, auto-save API

- LLM Debug Console (SPEC-DEBUG-001)
  - Keyboard shortcut (Ctrl+D/Cmd+D) to open debug console
  - Real-time LLM API call monitoring
  - Server-side logging complete (SPEC-DEBUG-003)
  - Client-side integration pending

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
    prompt/      - Prompt template management components
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
