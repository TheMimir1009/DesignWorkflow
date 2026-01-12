# SPEC-DEBUG-004: Implementation Sync Report

**Date**: 2026-01-12
**Status**: 65% Complete (In Progress)
**Critical Issue**: Dual Path Problem Identified

---

## Executive Summary

SPEC-DEBUG-004 aims to integrate LLM provider configuration so that project-specific LLM settings are properly applied when generating documents. The infrastructure is 100% complete, but the main integration point (KanbanBoard) uses the wrong AI generation path.

**Good News**: The `useAIGeneration` hook and `claudeCodeService` already fully support projectId/taskId parameters.

**Issue**: `KanbanBoard` uses `taskStore.triggerAIGeneration` which calls `/api/tasks/:id/trigger-ai` - an endpoint that does not support project-specific LLM selection.

---

## 1. What's Working (100% Complete)

### 1.1 useAIGeneration Hook (`src/hooks/useAIGeneration.ts`)

The hook has been fully updated to accept and pass projectId/taskId parameters:

```typescript
// Lines 66-70: Interface correctly defined
generateDesignDocument: (
  request: GenerateDesignDocumentRequest,
  projectId?: string,
  taskId?: string
) => Promise<void>;

// Lines 210-224: Implementation correctly passes parameters
const generateDesignDocument = useCallback(
  async (
    request: GenerateDesignDocumentRequest,
    projectId?: string,
    taskId?: string
  ): Promise<void> => {
    const enhancedRequest = {
      ...request,
      ...(projectId !== undefined && { projectId }),
      ...(taskId !== undefined && { taskId }),
    };
    await executeWithLoading(() => apiGenerateDesignDocument(enhancedRequest));
  },
  [executeWithLoading]
);
```

**Status**: All three generation functions (generateDesignDocument, generatePRD, generatePrototype) properly handle projectId/taskId.

### 1.2 claudeCodeService (`src/services/claudeCodeService.ts`)

The service interfaces include projectId and taskId fields:

```typescript
export interface GenerateDesignDocumentRequest {
  qaResponses: QAResponseItem[];
  referenceSystemIds?: ReferenceSystemItem[];
  workingDir?: string;
  projectId?: string;  // Present
  taskId?: string;     // Present
}
```

**Status**: All request interfaces include the required fields.

---

## 2. The Problem: KanbanBoard Uses Wrong Path

### 2.1 Current KanbanBoard Implementation

`src/components/kanban/KanbanBoard.tsx`:

```typescript
// Line 96: Imports from taskStore
const triggerAIGeneration = useTaskStore((state) => state.triggerAIGeneration);

// Line 249: Calls the wrong path
if (isForward) {
  await triggerAIGeneration(taskId, targetStatus);
}
```

This calls `taskStore.triggerAIGeneration` -> `taskService.triggerAI()` -> `/api/tasks/:id/trigger-ai`

### 2.2 The taskStore Path

`src/store/taskStore.ts` (lines 146-174):

```typescript
triggerAIGeneration: async (taskId: string, targetStatus: TaskStatus) => {
  // ... sets generating state ...
  const updatedTask = await taskService.triggerAI(taskId, targetStatus);
  // ... updates task ...
}
```

`src/services/taskService.ts` (lines 62-71):

```typescript
export async function triggerAI(taskId: string, targetStatus: TaskStatus): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/trigger-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetStatus }),
  });
  return handleResponse<Task>(response);
}
```

**Issue**: This endpoint only receives `taskId` and `targetStatus` - NO `projectId` is sent.

---

## 3. Dual Path Architecture Diagram

```
KanbanBoard Component
    |
    +-- Current (WRONG) Path: taskStore.triggerAIGeneration
    |       |
    |       v
    |   taskService.triggerAI(taskId, targetStatus)
    |       |
    |       v
    |   POST /api/tasks/:id/trigger-ai
    |       |
    |       v
    |   Server: NO projectId context
    |       |
    |       v
    |   Defaults to Claude Code (ignores project settings)
    |
    +-- Correct Path (NOT USED): useAIGeneration hook
            |
            v
        claudeCodeService.generateDesignDocument(request, projectId, taskId)
            |
            v
        POST /api/generate/design-document
            |
            v
        Server: HAS projectId context
            |
            v
        Uses project's configured LLM provider
```

---

## 4. What's Missing (Integration Required)

### 4.1 Required Changes to KanbanBoard

The KanbanBoard needs to:

1. Import and use `useAIGeneration` hook
2. Map `targetStatus` to appropriate generation function
3. Pass `projectId` (already available as prop) and `taskId` to generation functions
4. Handle the response appropriately

### 4.2 Status Mapping

The `targetStatus` parameter maps to generation functions as follows:

| targetStatus | Generation Function | Required Request Data |
|--------------|---------------------|----------------------|
| `design` | `generateDesignDocument` | QA responses from task |
| `prd` | `generatePRD` | Design document content from task |
| `prototype` | `generatePrototype` | PRD content from task |

---

## 5. Implementation Roadmap

### Phase 1: Understand Task Data Structure

First, understand what data is available on the Task object for building generation requests.

### Phase 2: Create Bridge Function

Create a function in KanbanBoard that:
- Takes `taskId` and `targetStatus`
- Retrieves the task data
- Maps to appropriate useAIGeneration function
- Passes projectId and taskId

### Phase 3: Update KanbanBoard

Replace the `triggerAIGeneration` call with the new bridge function.

### Phase 4: Testing

Test that:
- Design document generation uses project's LLM provider
- PRD generation uses project's LLM provider
- Prototype generation uses project's LLM provider

---

## 6. Next Steps

1. **Analyze Task Structure**: Determine what data is stored on tasks for generation requests
2. **Design Bridge Function**: Create mapping between targetStatus and generation functions
3. **Implement Integration**: Update KanbanBoard to use useAIGeneration path
4. **Test LLM Selection**: Verify project-specific providers are used
5. **Update Documentation**: Document the unified path

---

## 7. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing taskStore functionality | High | Keep taskStore path for other consumers |
| Task data structure may lack required fields | Medium | May need to enhance task data storage |
| Different response handling requirements | Low | Can adapt in bridge function |

---

## 8. Recommendation

**Recommendation**: Complete the integration by connecting KanbanBoard to the useAIGeneration hook path.

**Alternative**: Enhance the `/api/tasks/:id/trigger-ai` endpoint to accept and use projectId, but this would require server-side changes.

**Preferred Approach**: Use the existing complete infrastructure (useAIGeneration hook) rather than duplicating effort on the server side.
