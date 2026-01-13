---
id: SPEC-DEBUG-004
version: "1.1.0"
status: "in-progress"
created: "2026-01-12"
updated: "2026-01-12"
author: "MoAI-ADK"
priority: "high"
---

# SPEC-DEBUG-004: LLM Provider Configuration Integration

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2026-01-12 | MoAI-ADK | Status changed to in-progress; implementation findings documented |
| 1.0.0 | 2026-01-12 | MoAI-ADK | Initial SPEC creation |

---

## Implementation Status

**Overall Progress**: 65% Complete

**Status Breakdown**:

| Component | Status | Notes |
|-----------|--------|-------|
| Infrastructure | 100% | Service layer, hook, API endpoints all complete |
| Hook Integration | 100% | useAIGeneration hook accepts projectId/taskId parameters |
| Service Integration | 100% | claudeCodeService interfaces include projectId/taskId |
| KanbanBoard Integration | 0% | **CRITICAL ISSUE**: Uses wrong path |

**Key Finding - Dual Path Issue**:

The codebase contains TWO separate AI generation paths:

1. **Correct Path** (useAIGeneration hook):
   - Hook: `src/hooks/useAIGeneration.ts`
   - Service: `src/services/claudeCodeService.ts`
   - API Endpoints: `/api/generate/*`
   - Status: **100% Complete** - Fully supports projectId/taskId parameters
   - Functions:
     - `generateDesignDocument(request, projectId?, taskId?)`
     - `generatePRD(request, projectId?, taskId?)`
     - `generatePrototype(request, projectId?, taskId?)`

2. **Incorrect Path** (taskStore path):
   - Store: `src/store/taskStore.ts`
   - Service: `src/services/taskService.ts`
   - API Endpoint: `/api/tasks/:id/trigger-ai`
   - Status: **Used by KanbanBoard** but does NOT support project-specific LLM selection
   - Function: `triggerAIGeneration(taskId, targetStatus)`

**The Problem**:

`KanbanBoard` component (line 96, 249) uses:
```typescript
const triggerAIGeneration = useTaskStore((state) => state.triggerAIGeneration);
// Calls: /api/tasks/${taskId}/trigger-ai
```

This path lacks projectId context and cannot select project-specific LLM providers.

**Required Integration**:

Connect `KanbanBoard` to use the `useAIGeneration` hook path instead of the `taskStore.triggerAIGeneration` path.

---

## 1. Overview

### 1.1 Description

LLM Provider Configuration Integration fixes the issue where configured LLM provider settings are not being applied correctly. Currently, the frontend does not send projectId and taskId parameters to the server, causing it to always default to Claude Code as the provider regardless of user configuration.

### 1.2 User Story

> "As a user, when I configure OpenAI (or any other LLM provider) as my project's LLM provider, I expect the system to use that provider for generating documents instead of always defaulting to Claude Code."

### 1.3 Problem Statement

The LLM provider configuration feature exists but is not functioning correctly:

**Root Cause Analysis**:
- Frontend service (claudeCodeService.ts) does not include projectId/taskId in API requests
- Server expects these parameters to select project-specific LLM provider
- When parameters are missing, server defaults to Claude Code
- User configuration for alternative providers (OpenAI, Gemini, etc.) is ignored

**Impact**:
- Users cannot use their configured LLM providers
- All generation requests default to Claude Code
- Project-specific settings are not respected

### 1.4 Scope

**Included**:
- Adding projectId parameter to all generation request interfaces
- Adding taskId parameter to all generation request interfaces
- Updating frontend service functions to pass these parameters
- Updating hook functions to accept and forward these parameters
- Ensuring server receives parameters correctly

**Excluded**:
- Server-side LLM provider selection logic (assumed to exist)
- LLM provider configuration UI (assumed to exist)
- Authentication/authorization for different providers
- Provider-specific features beyond basic selection

---

## 2. Requirements (EARS Format)

### 2.1 Ubiquitous Requirements (always apply)

**REQ-LLM-001**: The system must send projectId with all generation requests.

**REQ-LLM-002**: The system must send taskId with all generation requests.

**REQ-LLM-003**: The system must maintain backward compatibility with existing API endpoints.

### 2.2 Event-Driven Requirements (trigger-based)

**REQ-LLM-004**: When a user generates a design document, the system must send projectId and taskId to the server.

**REQ-LLM-005**: When a user generates a PRD, the system must send projectId and taskId to the server.

**REQ-LLM-006**: When a user generates a prototype, the system must send projectId and taskId to the server.

**REQ-LLM-007**: When the server receives a request with projectId, it must use that project's configured LLM provider.

**REQ-LLM-008**: When the server receives a request without projectId, it must log a warning message.

### 2.3 Unwanted Behavior Requirements (what should not happen)

**REQ-LLM-009**: The system must not hardcode Claude Code as the only provider.

**REQ-LLM-010**: The system must not ignore user-configured LLM provider settings.

**REQ-LLM-011**: The system must not break existing API contracts when adding new parameters.

### 2.4 State-Driven Requirements (conditional)

**REQ-LLM-012**: When projectId is provided and valid, the system must use the project's LLM provider.

**REQ-LLM-013**: When projectId is null or undefined, the system must use the default provider.

**REQ-LLM-014**: When taskId is provided, the system must include it in the request for tracking purposes.

### 2.5 Optional Features (nice to have)

**REQ-LLM-015**: The system may provide visual feedback indicating which provider is being used.

**REQ-LLM-016**: The system may log provider selection for debugging purposes.

---

## 3. Technical Architecture

### 3.1 Files to Modify

```
src/
  services/
    claudeCodeService.ts       # Add projectId, taskId to request interfaces
  hooks/
    useAIGeneration.ts         # Update to pass projectId, taskId
```

### 3.2 Interface Changes

**GenerateDesignDocumentRequest** - Add:
```typescript
projectId?: string;
taskId?: string;
```

**GeneratePRDRequest** - Add:
```typescript
projectId?: string;
taskId?: string;
```

**GeneratePrototypeRequest** - Add:
```typescript
projectId?: string;
taskId?: string;
```

### 3.3 Function Signature Updates

**useAIGeneration.ts** - Update function signatures:

```typescript
// Before
generateDesignDocument: (request: GenerateDesignDocumentRequest) => Promise<void>;

// After
generateDesignDocument: (request: GenerateDesignDocumentRequest & { projectId?: string; taskId?: string; }) => Promise<void>;
```

### 3.4 Data Flow

```
User Action
    |
    v
Component calls hook
    |
    v
useAIGeneration.generateDesignDocument(request, projectId, taskId)
    |
    v
claudeCodeService.generateDesignDocument({ ...request, projectId, taskId })
    |
    v
API Request with projectId/taskId
    |
    v
Server selects configured provider
    |
    v
Response using configured provider
```

---

## 4. Implementation Tasks

### 4.1 Frontend Service Updates (claudeCodeService.ts)

**Task-001**: Update GenerateDesignDocumentRequest interface
- Add projectId?: string
- Add taskId?: string

**Task-002**: Update GeneratePRDRequest interface
- Add projectId?: string
- Add taskId?: string

**Task-003**: Update GeneratePrototypeRequest interface
- Add projectId?: string
- Add taskId?: string

**Task-004**: Verify makeRequest function passes all request body fields
- Ensure projectId and taskId are included in API call body

### 4.2 Hook Updates (useAIGeneration.ts)

**Task-005**: Update generateDesignDocument function
- Accept projectId and taskId parameters
- Merge into request object before API call

**Task-006**: Update generatePRD function
- Accept projectId and taskId parameters
- Merge into request object before API call

**Task-007**: Update generatePrototype function
- Accept projectId and taskId parameters
- Merge into request object before API call

**Task-008**: Update UseAIGenerationReturn interface
- Add projectId and taskId to function signatures

### 4.3 Testing

**Task-009**: Write unit tests for service functions
- Test projectId is included in request
- Test taskId is included in request
- Test backward compatibility (undefined values)

**Task-010**: Write integration tests
- Test full flow with mock API
- Verify server receives parameters

---

## 5. Non-Functional Requirements

### 5.1 Performance

- Adding parameters should not increase request latency
- Parameter validation should not add noticeable overhead

### 5.2 Backward Compatibility

- Existing API consumers must continue to work
- Parameters are optional (undefined allowed)
- No breaking changes to API contracts

### 5.3 Code Quality

- Follow TypeScript best practices
- Maintain JSDoc comments for all modified functions
- Update inline documentation

---

## 6. Related Documents

- [SPEC-DEBUG-001: LLM Debug Console](../SPEC-DEBUG-001/spec.md)
- [SPEC-CLAUDE-001: Claude Integration](../SPEC-CLAUDE-001/spec.md)
- [Project LLM Settings](../../llm-settings.md)
