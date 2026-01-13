# SPEC-DEBUG-004: Implementation Plan

## 1. Implementation Overview

**Complexity**: Low
**Estimated Effort**: 2-3 hours
**Risk Level**: Low (backward compatible changes)

This is a straightforward parameter addition task. The changes are isolated to two files and involve adding optional parameters to existing interfaces and function signatures.

---

## 2. Implementation Phases

### Phase 1: Frontend Service Updates

**File**: `src/services/claudeCodeService.ts`

**Step 1.1**: Update GenerateDesignDocumentRequest interface

```typescript
// Current (lines 95-99)
export interface GenerateDesignDocumentRequest {
  qaResponses: QAResponseItem[];
  referenceSystemIds?: ReferenceSystemItem[];
  workingDir?: string;
}

// Update to
export interface GenerateDesignDocumentRequest {
  qaResponses: QAResponseItem[];
  referenceSystemIds?: ReferenceSystemItem[];
  workingDir?: string;
  projectId?: string;  // ADD
  taskId?: string;     // ADD
}
```

**Step 1.2**: Update GeneratePRDRequest interface

```typescript
// Current (lines 104-108)
export interface GeneratePRDRequest {
  designDocContent: string;
  projectContext?: string;
  workingDir?: string;
}

// Update to
export interface GeneratePRDRequest {
  designDocContent: string;
  projectContext?: string;
  workingDir?: string;
  projectId?: string;  // ADD
  taskId?: string;     // ADD
}
```

**Step 1.3**: Update GeneratePrototypeRequest interface

```typescript
// Current (lines 113-117)
export interface GeneratePrototypeRequest {
  prdContent: string;
  styleFramework?: string;
  workingDir?: string;
}

// Update to
export interface GeneratePrototypeRequest {
  prdContent: string;
  styleFramework?: string;
  workingDir?: string;
  projectId?: string;  // ADD
  taskId?: string;     // ADD
}
```

**Step 1.4**: Verify makeRequest function

The makeRequest function (lines 201-224) uses JSON.stringify(body) which will automatically include any new properties. No changes needed.

---

### Phase 2: Hook Updates

**File**: `src/hooks/useAIGeneration.ts`

**Step 2.1**: Update GenerateDesignDocumentRequest import

Update the import on line 28 to reflect the new interface properties.

**Step 2.2**: Update UseAIGenerationReturn interface

```typescript
// Current (line 66)
generateDesignDocument: (request: GenerateDesignDocumentRequest) => Promise<void>;

// Update to
generateDesignDocument: (request: GenerateDesignDocumentRequest & { projectId?: string; taskId?: string; }) => Promise<void>;
```

Apply similar updates to:
- generatePRD (line 68)
- generatePrototype (line 70)

**Step 2.3**: Update generateDesignDocument function

```typescript
// Current (lines 198-203)
const generateDesignDocument = useCallback(
  async (request: GenerateDesignDocumentRequest): Promise<void> => {
    await executeWithLoading(() => apiGenerateDesignDocument(request));
  },
  [executeWithLoading]
);

// Update to accept and pass projectId, taskId
const generateDesignDocument = useCallback(
  async (request: GenerateDesignDocumentRequest, projectId?: string, taskId?: string): Promise<void> => {
    const enhancedRequest = { ...request, projectId, taskId };
    await executeWithLoading(() => apiGenerateDesignDocument(enhancedRequest));
  },
  [executeWithLoading]
);
```

**Step 2.4**: Update generatePRD function

```typescript
// Current (lines 208-213)
const generatePRD = useCallback(
  async (request: GeneratePRDRequest): Promise<void> => {
    await executeWithLoading(() => apiGeneratePRD(request));
  },
  [executeWithLoading]
);

// Update to
const generatePRD = useCallback(
  async (request: GeneratePRDRequest, projectId?: string, taskId?: string): Promise<void> => {
    const enhancedRequest = { ...request, projectId, taskId };
    await executeWithLoading(() => apiGeneratePRD(enhancedRequest));
  },
  [executeWithLoading]
);
```

**Step 2.5**: Update generatePrototype function

```typescript
// Current (lines 218-223)
const generatePrototype = useCallback(
  async (request: GeneratePrototypeRequest): Promise<void> => {
    await executeWithLoading(() => apiGeneratePrototype(request));
  },
  [executeWithLoading]
);

// Update to
const generatePrototype = useCallback(
  async (request: GeneratePrototypeRequest, projectId?: string, taskId?: string): Promise<void> => {
    const enhancedRequest = { ...request, projectId, taskId };
    await executeWithLoading(() => apiGeneratePrototype(enhancedRequest));
  },
  [executeWithLoading]
);
```

---

### Phase 3: Testing

**Step 3.1**: Unit Tests for Service

Create/update `tests/services/claudeCodeService.test.ts`:

```typescript
describe('ClaudeCodeService - LLM Provider Integration', () => {
  it('should include projectId in design document request', async () => {
    const request: GenerateDesignDocumentRequest = {
      qaResponses: [{ question: 'q', answer: 'a' }],
      projectId: 'project-123',
      taskId: 'task-456'
    };
    // Mock fetch and verify projectId is in request body
  });

  it('should include projectId in PRD request', async () => {
    const request: GeneratePRDRequest = {
      designDocContent: 'content',
      projectId: 'project-123',
      taskId: 'task-456'
    };
    // Mock fetch and verify
  });

  it('should include projectId in prototype request', async () => {
    const request: GeneratePrototypeRequest = {
      prdContent: 'prd',
      projectId: 'project-123',
      taskId: 'task-456'
    };
    // Mock fetch and verify
  });

  it('should handle missing projectId gracefully', async () => {
    const request: GenerateDesignDocumentRequest = {
      qaResponses: [{ question: 'q', answer: 'a' }]
      // projectId, taskId omitted
    };
    // Should not throw error
  });
});
```

**Step 3.2**: Unit Tests for Hook

Create/update `tests/hooks/useAIGeneration.test.ts`:

```typescript
describe('useAIGeneration - LLM Provider Integration', () => {
  it('should pass projectId and taskId to generateDesignDocument', async () => {
    const { result } = renderHook(() => useAIGeneration());
    await act(async () => {
      await result.current.generateDesignDocument(
        { qaResponses: [{ question: 'q', answer: 'a' }] },
        'project-123',
        'task-456'
      );
    });
    // Verify API call includes projectId and taskId
  });

  it('should pass projectId and taskId to generatePRD', async () => {
    // Similar test for PRD
  });

  it('should pass projectId and taskId to generatePrototype', async () => {
    // Similar test for Prototype
  });

  it('should work without projectId and taskId (backward compatibility)', async () => {
    const { result } = renderHook(() => useAIGeneration());
    await act(async () => {
      await result.current.generateDesignDocument({
        qaResponses: [{ question: 'q', answer: 'a' }]
      });
    });
    // Should not throw error
  });
});
```

---

## 3. Rollout Plan

### Step 1: Development
- Create feature branch: `feature/llm-provider-integration`
- Implement Phase 1 and Phase 2 changes
- Write unit tests

### Step 2: Testing
- Run unit tests: `npm test`
- Run TypeScript check: `npm run type-check`
- Test manually with configured LLM provider
- Verify server receives parameters

### Step 3: Code Review
- Submit pull request
- Review for backward compatibility
- Verify no breaking changes

### Step 4: Deployment
- Merge to main branch
- Deploy to development environment
- Monitor for issues
- Deploy to production

---

## 4. Verification Checklist

**Code Changes**:
- [ ] GenerateDesignDocumentRequest has projectId and taskId
- [ ] GeneratePRDRequest has projectId and taskId
- [ ] GeneratePrototypeRequest has projectId and taskId
- [ ] generateDesignDocument hook accepts and passes parameters
- [ ] generatePRD hook accepts and passes parameters
- [ ] generatePrototype hook accepts and passes parameters

**Testing**:
- [ ] Unit tests written for service changes
- [ ] Unit tests written for hook changes
- [ ] All tests pass
- [ ] TypeScript compilation succeeds

**Manual Verification**:
- [ ] Configure OpenAI for a project
- [ ] Generate design document - verify OpenAI is used
- [ ] Generate PRD - verify OpenAI is used
- [ ] Generate prototype - verify OpenAI is used
- [ ] Test with no projectId configured - verify defaults work

---

## 5. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing API consumers | High | Parameters are optional, maintain backward compatibility |
| Server not ready to receive parameters | Medium | Server should handle optional parameters gracefully |
| TypeScript compilation errors | Low | Update all type definitions consistently |

---

## 6. Success Criteria

- All three request interfaces include projectId and taskId
- All three hook functions accept and pass the parameters
- Unit tests verify parameters are included in API calls
- Existing functionality continues to work (backward compatibility)
- Server receives projectId and taskId in request body
