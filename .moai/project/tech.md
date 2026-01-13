# AI Workflow Kanban - Technology Stack

## Overview

This document describes the technology stack and development environment for the AI Workflow Kanban project.

**Last Updated**: 2026-01-12

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.x | UI component library |
| Vite | 7.x | Build tool and dev server |
| TypeScript | 5.9.x | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| @dnd-kit/core | 6.x | Drag and drop functionality |
| @dnd-kit/sortable | 10.x | Sortable list functionality |
| @uiw/react-codemirror | 4.x | CodeMirror 6 editor integration (NEW) |
| @codemirror/lang-markdown | 6.x | Markdown language support (NEW) |
| @codemirror/theme-one-dark | 6.x | One Dark theme (NEW) |
| react-markdown | 10.x | Markdown rendering |
| remark-gfm | 4.x | GitHub Flavored Markdown support |
| Zustand | 5.x | Lightweight state management |
| Recharts | 3.6.x | Chart library for dashboard |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| Express | 5.x | Web framework |
| TypeScript | 5.9.x | Type safety |
| bcrypt | 6.x | Password hashing (SPEC-AUTH-001) |
| jsonwebtoken | 9.x | JWT authentication (SPEC-AUTH-001) |
| uuid | 13.x | UUID generation |
| crypto | Built-in | API key encryption (AES-256-CBC) |

### AI Engine

| Technology | Version | Purpose |
|------------|---------|---------|
| Claude Code | Latest | AI document generation (Headless Mode) |
| OpenAI | API | Alternative LLM provider |
| Google Gemini | API | Alternative LLM provider |
| GLM | API | Alternative LLM provider (NEW) |
| LM Studio | Local | Local LLM provider |

### Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | 4.x | Unit/Integration testing |
| @testing-library/react | 16.x | Component testing |
| @testing-library/jest-dom | 6.x | DOM matchers |
| @testing-library/user-event | 14.x | User interaction testing |
| supertest | 7.x | API endpoint testing |
| jsdom | 27.x | DOM simulation |
| @vitest/coverage-v8 | 4.x | Code coverage |

### Storage

| Technology | Purpose |
|------------|---------|
| Local File System | Project data, documents, workspace |
| JSON | Metadata storage, LLM settings |
| Markdown | Document content |

---

## Development Environment Setup

### Prerequisites

1. **Node.js 20.x LTS**
   ```bash
   # Check version
   node --version  # Should be v20.x.x
   ```

2. **Claude Code CLI** (Optional - for headless mode)
   ```bash
   # Verify installation
   claude --version
   ```

### Project Setup

1. **Clone and Install**
   ```bash
   cd design-workflow
   npm install
   ```

2. **Start Development Servers**
   ```bash
   # Option 1: Start both servers concurrently
   npm run start

   # Option 2: Start separately
   # Terminal 1: Frontend (port 5173)
   npm run dev

   # Terminal 2: Backend (port 3001)
   npm run server
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

---

## Package Dependencies

### Dependencies (Production)

```json
{
  "dependencies": {
    "@codemirror/lang-json": "^6.0.1",
    "@codemirror/lang-markdown": "^6.3.2",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@uiw/react-codemirror": "^4.23.7",
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-markdown": "^10.1.0",
    "recharts": "^3.6.0",
    "remark-gfm": "^4.0.1",
    "uuid": "^13.0.0",
    "zustand": "^5.0.9"
  }
}
```

### DevDependencies (Development)

```json
{
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@tailwindcss/vite": "^4.1.18",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@testing-library/user-event": "^14.6.1",
    "@types/bcrypt": "^6.0.0",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@types/supertest": "^6.0.3",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^5.1.1",
    "@vitest/coverage-v8": "^4.0.16",
    "autoprefixer": "^10.4.23",
    "concurrently": "^9.2.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "jsdom": "^27.4.0",
    "postcss": "^8.5.6",
    "supertest": "^7.1.4",
    "tailwindcss": "^4.1.18",
    "tsx": "^4.21.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4",
    "vitest": "^4.0.16"
  }
}
```

---

## Multi-LLM Provider Integration

### Supported Providers

| Provider | Status | Configuration | Models |
|----------|--------|---------------|--------|
| Claude Code | Default | Headless mode (no API key required) | claude-opus-4-5, claude-sonnet-4-5 |
| OpenAI | Optional | API key required | gpt-4o, gpt-4o-mini |
| Google Gemini | Optional | API key required | gemini-2.0-flash, gemini-2.5-pro |
| GLM | Optional | API key required | glm-4.7 series (NEW) |
| LM Studio | Optional | Local endpoint (http://localhost:1234) | Local models |

### LLM Routing Configuration

The system supports three routing modes configured in `.moai/config/sections/llm.yaml`:

| Mode | Description | Use Case |
|------|-------------|----------|
| claude-only | Use Claude for all phases | Highest quality, predictable costs |
| mashup | Plan with Claude, Run/Sync with GLM | Balanced cost and quality (NEW) |
| glm-only | Use GLM for all phases | Lowest cost option (NEW) |

### Task Stage Model Configuration

Each task stage can use a different LLM model:

| Stage | Default Model | Configurable |
|-------|---------------|--------------|
| Design Document | claude-sonnet-4-5 | Yes |
| PRD | claude-sonnet-4-5 | Yes |
| Prototype | claude-sonnet-4-5 | Yes |

### API Key Encryption

API keys are encrypted before storage using AES-256-CBC encryption with a project-specific salt:

```typescript
// server/utils/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SALT_LENGTH = 16;

export function encryptApiKey(text: string, projectId: string): string {
  const salt = crypto.scryptSync(projectId, 'salt', SALT_LENGTH);
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(projectId + process.env.ENCRYPTION_SECRET, 'salt', 32);
  // ... encryption logic
}
```

---

## Enhanced Document Editor

### CodeMirror 6 Integration

The enhanced document editor uses CodeMirror 6 for professional editing experience:

**Features**:
- Syntax highlighting for Markdown, JavaScript, HTML, CSS, Python, JSON
- Line numbers with active line highlighting
- Auto-save with 5-second debounce
- Keyboard shortcuts (Ctrl+S, Ctrl+B, Ctrl+I, Ctrl+K, Escape)
- One Dark theme support
- Read-only mode support
- Error handling with automatic retry

**Dependencies**:
```json
{
  "@codemirror/lang-markdown": "^6.3.2",
  "@codemirror/lang-javascript": "^6.0.2",
  "@codemirror/lang-html": "^6.4.9",
  "@codemirror/lang-css": "^6.3.1",
  "@codemirror/lang-python": "^6.1.6",
  "@codemirror/lang-json": "^6.0.1",
  "@codemirror/theme-one-dark": "^6.1.2",
  "@uiw/react-codemirror": "^4.23.7"
}
```

### Document Version Management

- Version history tracking with diff generation
- Model history recording (SPEC-MODELHISTORY-001)
- Side-by-side version comparison
- Keyboard shortcuts help modal

---

## Debug Console Infrastructure

### LLM Logger

The LLM logger captures all API calls for debugging and cost tracking:

```typescript
// server/utils/llmLogger.ts
export class LLMLogger {
  private logs: LLMCallLog[] = [];
  private maxLogs = 1000;

  logRequest(config: LLMRequestConfig): string {
    const log: LLMCallLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      model: config.model,
      provider: config.provider,
      endpoint: config.endpoint,
      requestHeaders: this.sanitizeHeaders(config.headers),
      requestBody: config.body,
    };
    this.logs.push(log);
    return log.id;
  }

  logResponse(logId: string, response: LLMResponse): void {
    const usage = this.extractUsage(response);
    this.updateLog(logId, {
      status: 'success',
      statusCode: response.status,
      duration: response.duration,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cost: this.calculateCost(usage),
    });
  }
}
```

### Debug Components

| Component | Purpose |
|-----------|---------|
| DebugConsole.tsx | Main console container |
| DebugStatsPanel.tsx | Statistics display (requests, success rate, tokens, cost) |
| DebugLogFilter.tsx | Filter by status, model, search |
| DebugStatusIcon.tsx | Status indicator (success/error/pending) |
| LogList.tsx | Paginated log list |
| LogDetailModal.tsx | Request/response detail view |

### Model Pricing

Cost calculation based on model-specific pricing:

```typescript
// server/utils/modelPricing.ts
export const MODEL_PRICING: ModelPricing[] = [
  { model: 'claude-opus-4-5', inputPricePer1K: 3.0, outputPricePer1K: 15.0 },
  { model: 'claude-sonnet-4-5', inputPricePer1K: 1.5, outputPricePer1K: 7.5 },
  { model: 'gpt-4o', inputPricePer1K: 2.5, outputPricePer1K: 10.0 },
  { model: 'gpt-4o-mini', inputPricePer1K: 0.15, outputPricePer1K: 0.6 },
  { model: 'gemini-2.5-pro', inputPricePer1K: 1.25, outputPricePer1K: 10.0 },
  { model: 'glm-4.7', inputPricePer1K: 0.1, outputPricePer1K: 0.1 },
];
```

---

## Claude Code Integration

### Headless Mode Invocation

```typescript
// server/utils/claudeCodeRunner.ts
import { spawn } from 'child_process';

async function callClaudeCode(
  prompt: string,
  workingDir: string
): Promise<string> {
  const process = spawn('claude', [
    '-p', prompt,
    '--output-format', 'json',
    '--allowedTools', 'Read,Write,Grep'
  ], {
    cwd: workingDir
  });

  return collectOutput(process);
}
```

### Configuration

- Timeout: 120 seconds
- Allowed Tools: Read, Write, Grep
- Output Format: JSON
- Working Directory: Per-project workspace

---

## Coding Standards

### TypeScript Configuration

- Strict mode enabled
- ES2022 target
- Module resolution: bundler
- Path aliases: @/* for src/*

### Component Guidelines

- Functional components with hooks
- One default export per file
- Props interface definitions
- JSDoc comments for public APIs

### State Management

- Zustand for global state
- Local state for component-specific data
- Immer middleware for complex state updates

### Error Handling

- Try-catch for async operations
- User-friendly error messages
- Toast notifications for feedback
- Automatic retry with exponential backoff

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run server` | Start Express server (port 3001) |
| `npm run start` | Start both servers concurrently |
| `npm run build` | Production build |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | ESLint check |
| `npm run kill` | Kill processes on ports 3001, 5173 |

---

## Environment Variables

```bash
# .env (optional)
VITE_API_URL=http://localhost:3001
CLAUDE_TIMEOUT=120000

# LLM Provider API Keys (optional - for non-default providers)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GLM_API_TOKEN=...
```

---

## Testing Strategy

### Unit Tests

- Vitest for component and utility testing
- React Testing Library for component behavior
- Coverage target: 80%+

### Integration Tests

- API endpoint testing with supertest
- Service layer testing
- Store integration testing

### E2E Tests

- Manual testing per phase
- Full pipeline validation (Feature List to Prototype)

---

## Architecture Diagrams

### System Context

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|   React Client   |---->|  Express Server   |---->|  LLM Providers   |
|   (Vite + TS)    |     |  (Node.js + TS)   |     |  (Multi-Provider)|
|                  |     |                   |     |  Claude, OpenAI  |
+------------------+     +-------------------+     |  Gemini, GLM     |
                                 |               |  LM Studio       |
                                 v               +------------------+
                         +---------------+
                         |               |
                         |  File System  |
                         |  (workspace/) |
                         |               |
                         +---------------+
```

### Component Architecture

```
App.tsx
  |
  +-- Layout
        |
        +-- Header (ProjectSelector, ReferenceTagBar)
        |
        +-- Sidebar (SystemSidebar)
        |
        +-- Main Content
              |
              +-- KanbanBoard
              |     +-- KanbanColumn (x4)
              |           +-- KanbanCard (xN)
              |
              +-- Dashboard
              |     +-- StatsSummary
              |     +-- TaskStatusChart
              |     +-- ProgressTimeline
              |
              +-- DocumentEditor / EnhancedDocumentEditor
              |     +-- DocumentReferenceSidePanel
              |     +-- SideBySideView
              |
              +-- DebugConsole (development only)
                    +-- DebugStatsPanel
                    +-- LogList
                    +-- LogDetailModal
```

### LLM Provider Architecture

```
+-----------------------------------------------+
|               LLM Provider Layer              |
+-----------------------------------------------+
|                                               |
|  +-------------+  +------------+  +----------+ |
|  | Claude Code |  |  OpenAI    |  |  Gemini  | |
|  |  Provider   |  |  Provider  |  | Provider | |
|  +-------------+  +------------+  +----------+ |
|                                               |
|  +-------------+  +------------+              |
|  |   LM Studio |  |    GLM     |              |
|  |  Provider   |  |  Provider  |              |
|  +-------------+  +------------+              |
|                                               |
+-------------------+---------------------------+
                    |
                    v
          +-------------------+
          |   BaseHTTPProvider|
          |   (Abstract Base) |
          +-------------------+
                    |
                    v
          +-------------------+
          |   LLMLogger       |
          |   (Debug Layer)   |
          +-------------------+
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Claude Code response delay | 120s timeout, loading UI, retry button |
| Large document context overflow | Use RootRule summary, include only relevant systems |
| Generated document quality inconsistency | Improve Q&A questions, iterative prompt tuning |
| File system concurrent access | Per-project lock files, sequential processing |
| API key security | AES-256-CBC encryption, secure storage |
| LLM provider unavailability | Multi-provider fallback support |
| Debug console memory usage | 1000 log limit, automatic cleanup |
| CodeMirror performance | Lazy loading, virtualization for large documents |

---

## Performance Optimization

### Frontend

- Code splitting for routes
- Lazy loading for large components
- Virtual scrolling for large lists
- Debounced search inputs

### Backend

- Response caching for static data
- Connection pooling for LLM APIs
- Streaming responses for long generations
- Worker threads for CPU-intensive tasks

### LLM Integration

- Prompt compression for token efficiency
- Caching for repeated requests
- Batch requests when possible
- Model selection based on task complexity

---

Last Updated: 2026-01-12
