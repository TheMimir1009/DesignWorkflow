# Passthrough Architecture Documentation

## Overview

The Passthrough Automatic Pipeline is a distributed document generation system that automatically creates Design Documents, PRDs, and Prototypes after Q&A completion. The system provides real-time progress tracking, state persistence, and flexible control over the pipeline execution.

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        UI[PassthroughPanel]
        Store[passthroughStore]
        Service[passthroughService]
    end

    subgraph Server["Server Layer"]
        Router[passthroughRouter]
        Runner[passthroughRunner]
        Storage[passthroughStorage]
    end

    subgraph External["External Services"]
        LLM[LLM Provider]
        Claude[Claude Code]
    end

    subgraph Data["Data Layer"]
        TaskDB[taskStorage]
        PipelineDB[passthrough-pipelines/]
    end

    UI --> Store
    Store --> Service
    Service --> Router
    Router --> Runner
    Runner --> Storage
    Runner --> LLM
    Runner --> Claude
    Storage --> PipelineDB
    Router --> TaskDB
```

---

## Component Architecture

### Client Layer

**PassthroughPanel Component**

```mermaid
classDiagram
    class PassthroughPanel {
        +taskId: string
        +isQACompleted: boolean
        +pipeline: PassthroughPipeline | null
        +isLoading: boolean
        +onStart()
        +onPause()
        +onResume()
        +onCancel()
        +onRetry()
    }

    class PassthroughProgress {
        +progress: number
        +currentStage: PipelineStage | null
        +stages: StageInfo[]
        +renderProgressBar()
        +renderStageIcons()
    }

    class PassthroughStageCard {
        +stage: StageInfo
        +isActive: boolean
        +render()
        +formatDuration()
    }

    class PassthroughControls {
        +status: PipelineStatus
        +isQACompleted: boolean
        +renderButtons()
        +handlePause()
        +handleCancel()
    }

    PassthroughPanel --> PassthroughProgress
    PassthroughPanel --> PassthroughStageCard
    PassthroughPanel --> PassthroughControls
```

**State Management (Zustand)**

```typescript
interface PassthroughStore {
  // State
  pipeline: PassthroughPipeline | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  startPipeline: (taskId: string) => Promise<void>;
  pausePipeline: (taskId: string) => Promise<void>;
  resumePipeline: (taskId: string) => Promise<void>;
  cancelPipeline: (taskId: string) => Promise<void>;
  retryStage: (taskId: string, stage: PipelineStage) => Promise<void>;
  fetchPipelineStatus: (taskId: string) => Promise<void>;

  // Polling
  startPolling: (taskId: string) => void;
  stopPolling: () => void;
}
```

---

### Server Layer

**API Routes**

```mermaid
flowchart LR
    Start[POST /start] -->|Create| Pipeline
    Pause[POST /pause] -->|Update| Pipeline
    Resume[POST /resume] -->|Update| Pipeline
    Cancel[POST /cancel] -->|Update| Pipeline
    Status[GET /status] -->|Read| Pipeline
    Retry[POST /retry] -->|Reset| Pipeline

    Pipeline --> Storage[passthroughStorage]
    Storage --> FS[(File System)]
```

**Pipeline Execution Flow**

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Runner
    participant Storage
    participant LLM

    Client->>API: POST /start
    API->>Storage: createPipeline()
    Storage-->>API: pipeline
    API-->>Client: pipeline created

    API->>Runner: runPipeline()
    Runner->>Storage: getPipelineById()
    Storage-->>Runner: pipeline

    loop For each stage
        Runner->>Storage: updateStage(running)
        Runner->>LLM: generateContent()
        LLM-->>Runner: content
        Runner->>Storage: updateStage(completed)
        Runner->>Storage: savePipeline()

        alt Pause requested
            Runner->>Storage: updateStatus(paused)
            Runner-->>Client: paused
        end
    end

    Runner->>Storage: updateStatus(completed)
    Runner-->>Client: completed
```

**Error Handling with Retry**

```mermaid
flowchart TD
    Start[Run Stage] --> Execute[Execute Stage]
    Execute -->|Success| Complete[Mark Complete]
    Execute -->|Error| CheckRetry{Retry Count < Max?}

    CheckRetry -->|Yes| Increment[Increment Retry]
    Increment --> Wait[Wait before retry]
    Wait --> Execute

    CheckRetry -->|No| Fail[Mark Failed]
    Fail --> UpdatePipeline[Update Pipeline Status]

    Complete --> NextStage{More Stages?}
    NextStage -->|Yes| Execute
    NextStage -->|No| CompletePipeline[Mark Pipeline Complete]
    UpdatePipeline --> Stop[Stop Pipeline]
    CompletePipeline --> Stop
```

---

## Data Flow

### Pipeline Creation Flow

```mermaid
flowchart TD
    QAComplete[Q&A Completed] --> UserClick[User clicks Start]
    UserClick --> ValidateQA{Validate Q&A?}
    ValidateQA -->|No| ShowError[Show Error]
    ValidateQA -->|Yes| CheckRunning{Pipeline Running?}
    CheckRunning -->|Yes| ShowConflict[Show Conflict]
    CheckRunning -->|No| CreatePipeline[Create Pipeline]
    CreatePipeline --> SaveState[Save State]
    SaveState --> StartExecution[Start Execution]
    StartExecution --> DesignDoc[Design Doc Stage]
    DesignDoc --> PRD[PRD Stage]
    PRD --> Prototype[Prototype Stage]
    Prototype --> Complete[Pipeline Complete]
```

### State Persistence Flow

```mermaid
flowchart LR
    Memory[Pipeline State] --> Serialize[Serialize to JSON]
    Serialize --> Write[Write to File]
    Write --> File[task-{taskId}.json]
    Write --> File2[pipeline-{id}.json]

    File --> Read[Read on Recovery]
    File2 --> Read
    Read --> Deserialize[Deserialize JSON]
    Deserialize --> Restore[Restore State]
```

---

## Type System

### Core Types

```typescript
// Pipeline stage names
type PassthroughStageName = 'design_doc' | 'prd' | 'prototype';

// Stage status
type PassthroughStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Pipeline status
type PassthroughPipelineStatus = 'idle' | 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

// Stage information
interface PassthroughStage {
  id: string;
  name: PassthroughStageName;
  displayName: string;
  status: PassthroughStageStatus;
  startedAt: string | null;
  completedAt: string | null;
  error: PassthroughStageError | null;
  progress: number;
}

// Pipeline state
interface PassthroughPipeline {
  id: string;
  taskId: string;
  qaSessionId: string;
  status: PassthroughPipelineStatus;
  currentStage: PassthroughStageName | null;
  stages: PassthroughStage[];
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}
```

---

## Storage Architecture

### File System Structure

```
workspace/
  passthrough-pipelines/
    pipeline-{uuid}.json      # Primary storage by pipeline ID
    task-{taskId}.json         # Quick lookup by task ID
```

### Storage Operations

| Operation | Description | Files |
|-----------|-------------|-------|
| createPipeline | Create new pipeline | Both files |
| savePipeline | Update pipeline state | Both files |
| getPipelineById | Retrieve by pipeline ID | pipeline-{id}.json |
| getPipelineByTaskId | Retrieve by task ID | task-{taskId}.json |
| deletePipeline | Remove pipeline | Both files |
| listPipelines | List with filters | All pipeline files |

---

## LLM Integration

### LLM Provider Interface

```mermaid
classDiagram
    class LLMProviderInterface {
        <<interface>>
        +generateText(prompt: string) Promise~string~
        +chat(messages: Message[]) Promise~ChatResponse~
    }

    class OpenAIProvider {
        +generateText(prompt)
        +chat(messages)
    }

    class GeminiProvider {
        +generateText(prompt)
        +chat(messages)
    }

    class LMStudioProvider {
        +generateText(prompt)
        +chat(messages)
    }

    class ClaudeCodeRunner {
        +call(prompt, cwd, options)
    }

    LLMProviderInterface <|-- OpenAIProvider
    LLMProviderInterface <|-- GeminiProvider
    LLMProviderInterface <|-- LMStudioProvider
```

### Prompt Building

```mermaid
flowchart TD
    Task[Task Context] --> DesignDoc[Design Doc Prompt]
    DesignDoc --> LLM1[LLM Generate]
    LLM1 --> DocResult[Design Document]

    DocResult --> PRDPrompt[PRD Prompt]
    PRDPrompt --> LLM2[LLM Generate]
    LLM2 --> PRDResult[PRD Document]

    PRDResult --> ProtoPrompt[Prototype Prompt]
    ProtoPrompt --> Claude[Claude Code]
    Claude --> ProtoResult[Prototype Code]
```

---

## Performance Considerations

### Polling Strategy

- Client polls every 2 seconds for pipeline status
- Server responds with current pipeline state
- Polling stops when pipeline reaches terminal state

### State Persistence

- State saved after each stage completion
- Immediate save on pause/cancel operations
- Atomic file writes using fs.promises

### Timeout Handling

- Default stage timeout: 120 seconds
- Retry delay: 1 second
- Maximum retries: 3 attempts

---

## Security Considerations

### Input Validation

- Task ID validation before pipeline creation
- Stage name validation for retry operations
- Status validation for state transitions

### Operation Guards

- Q&A completion required before starting
- Duplicate pipeline prevention
- Operation-state compatibility checks

### Error Information

- Stack traces only in development
- Sanitized error messages for clients
- Detailed logging server-side

---

## Related Files

| Component | File Path |
|-----------|-----------|
| API Routes | `server/routes/passthrough.ts` |
| Pipeline Runner | `server/utils/passthroughRunner.ts` |
| Storage | `server/utils/passthroughStorage.ts` |
| Client Service | `src/services/passthroughService.ts` |
| State Store | `src/store/passthroughStore.ts` |
| Types | `src/types/passthrough.ts` |
| UI Components | `src/components/passthrough/` |
