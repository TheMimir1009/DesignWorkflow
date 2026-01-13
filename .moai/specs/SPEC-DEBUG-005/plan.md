# SPEC-DEBUG-005: Implementation Plan

## Overview

이 문서는 API Error Handling & Response Standardization의 구현 계획을 설명합니다.

---

## Phase Breakdown

### Phase 1: Error Response Infrastructure (기반 구조)

**Duration**: 1일

**Tasks**:
1. `server/types/api.ts` 파일 생성 (또는 타입 확장)
   - `ApiErrorResponse` 인터페이스 정의
   - `ErrorDetails` 인터페이스 정의
   - 에러 코드 상수 정의

2. `server/utils/errorBuilder.ts` 생성
   - `buildError()` 함수: 표준 에러 응답 생성
   - `buildNotFoundError()` 함수: 404 에러 생성
   - `buildValidationError()` 함수: 400 검증 오류 생성
   - `buildPrerequisiteError()` 함수: 선행 조건 누락 오류 생성

3. `server/utils/response.ts` 확장
   - `sendError()` 함수 오버로드 추가
   - 에러 코드 및 디테일 지원

**Files to Create**:
- `server/types/api.ts`
- `server/utils/errorBuilder.ts`

**Files to Modify**:
- `server/utils/response.ts`

---

### Phase 2: Q&A Session Endpoint Updates

**Duration**: 1일

**Tasks**:
1. `server/routes/qa.ts` - `getTaskQA()` 함수 수정
   - 세션이 없을 때 404 대신 200 + null 반환
   - 로깅 추가

2. `server/routes/qa.ts` - `saveTaskQA()` 함수 검증
   - 자동 생성 로직이 이미 존재하는지 확인
   - 없으면 추가

**Files to Modify**:
- `server/routes/qa.ts`

**Code Changes**:

```typescript
// Before
export async function getTaskQA(req: Request, res: Response): Promise<void> {
  // ...
  const session = await getQASessionByTaskId(taskId);
  if (!session) {
    sendError(res, 404, 'Q&A session not found for this task');
    return;
  }
  sendSuccess(res, session);
}

// After
export async function getTaskQA(req: Request, res: Response): Promise<void> {
  // ...
  const session = await getQASessionByTaskId(taskId);
  // Return null instead of 404 when session doesn't exist
  sendSuccess(res, session); // session can be null
}
```

---

### Phase 3: Task AI Generation Error Handling

**Duration**: 1일

**Tasks**:
1. `server/routes/tasks.ts` - `trigger-ai` 엔드포인트 수정
   - LLM provider 선택 실패 시 400 반환
   - 선행 문서 누락 시 명확한 안내 메시지 추가
   - 타임아웃 에러를 504로 변환

2. 예외 처리 개선
   - `selectLLMProvider()` 호출 에러 처리
   - 각 에러 케이스별 적절한 상태 코드 반환

**Files to Modify**:
- `server/routes/tasks.ts`

**Code Changes**:

```typescript
// Add specific error handling for LLM provider
tasksRouter.post('/:id/trigger-ai', async (req: Request, res: Response): Promise<void> => {
  try {
    // ... validation ...

    const { provider, config } = await selectLLMProvider(
      taskResult.projectId,
      mapStatusToStage(targetStatus)
    );

    // Check if provider is properly configured
    if (!provider || !config) {
      sendError(res, 400, 'LLM provider configuration missing. Please configure LLM settings.');
      return;
    }

    // ... rest of the logic ...
  } catch (error) {
    if (error instanceof LLMTimeoutError) {
      sendError(res, 504, 'AI generation timed out. Please try again.');
    } else if (error instanceof LLMConfigError) {
      sendError(res, 400, `LLM configuration error: ${error.message}`);
    } else {
      console.error('Error triggering AI generation:', error);
      sendError(res, 500, 'Failed to trigger AI generation');
    }
  }
});
```

---

### Phase 4: Testing & Documentation

**Duration**: 1일

**Tasks**:
1. 테스트 파일 작성
   - `tests/server/routes/qa.errorHandling.test.ts`
   - `tests/server/routes/tasks.errorHandling.test.ts`
   - `tests/server/utils/errorBuilder.test.ts`

2. 통합 테스트
   - 모든 에러 시나리오 검증
   - 엣지 케이스 테스트

3. 문서 업데이트
   - API 엔드포인트 문서에 에러 응답 추가
   - 에러 코드 목록 문서화

**Files to Create**:
- `tests/server/routes/qa.errorHandling.test.ts`
- `tests/server/routes/tasks.errorHandling.test.ts`
- `tests/server/utils/errorBuilder.test.ts`

---

## File Modification Summary

| File | Action | Description |
|------|--------|-------------|
| `server/types/api.ts` | CREATE | API 타입 정의 |
| `server/utils/errorBuilder.ts` | CREATE | 에러 빌더 유틸리티 |
| `server/utils/response.ts` | MODIFY | 에러 응답 함수 확장 |
| `server/routes/qa.ts` | MODIFY | getTaskQA 404 제거 |
| `server/routes/tasks.ts` | MODIFY | trigger-ai 에러 처리 개선 |
| `tests/server/utils/errorBuilder.test.ts` | CREATE | errorBuilder 테스트 |
| `tests/server/routes/qa.errorHandling.test.ts` | CREATE | Q&A 에러 처리 테스트 |
| `tests/server/routes/tasks.errorHandling.test.ts` | CREATE | Tasks 에러 처리 테스트 |

---

## Error Response Structure

### Standard Error Response

```typescript
interface ApiErrorResponse {
  success: false;
  error: string;           // Human-readable error message
  errorCode?: string;      // Machine-readable error code
  details?: {
    field?: string;        // Field that caused the error
    value?: string;        // Invalid value provided
    provider?: string;     // LLM provider (if applicable)
    model?: string;        // LLM model (if applicable)
    action?: string;       // Suggested action
    guidance?: string;     // Detailed guidance
    helpUrl?: string;      // Link to documentation
  };
}
```

### Example Error Responses

```json
// Task not found
{
  "success": false,
  "error": "Task not found",
  "errorCode": "TASK_NOT_FOUND",
  "details": {
    "field": "taskId",
    "value": "123e4567-e89b-12d3-a456-426614174000"
  }
}

// Prerequisite missing (Design Document required for PRD)
{
  "success": false,
  "error": "Design Document is required to generate PRD",
  "errorCode": "PREREQUISITE_MISSING",
  "details": {
    "field": "designDocument",
    "action": "complete_design",
    "guidance": "Complete the Q&A session to generate Design Document first"
  }
}

// LLM configuration missing
{
  "success": false,
  "error": "LLM provider configuration missing",
  "errorCode": "LLM_CONFIG_MISSING",
  "details": {
    "action": "configure_llm",
    "guidance": "Configure LLM settings in project settings"
  }
}

// AI generation timeout
{
  "success": false,
  "error": "AI generation timed out. Please try again.",
  "errorCode": "AI_GENERATION_TIMEOUT",
  "details": {
    "provider": "openai",
    "model": "gpt-4o"
  }
}
```

---

## Error Code Constants

```typescript
// server/types/api.ts

export const ERROR_CODES = {
  // Not Found (404)
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',

  // Bad Request (400)
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_STATUS: 'INVALID_STATUS',
  PREREQUISITE_MISSING: 'PREREQUISITE_MISSING',
  LLM_CONFIG_MISSING: 'LLM_CONFIG_MISSING',

  // Server Error (500)
  LLM_GENERATION_FAILED: 'LLM_GENERATION_FAILED',

  // Gateway Timeout (504)
  AI_GENERATION_TIMEOUT: 'AI_GENERATION_TIMEOUT',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 기존 클라이언트 코드 호환성 문제 | Medium | Medium | 점진적 롤아웃, 버전 관리 |
| 에러 응답 형식 변경으로 인한 회귀 | Low | High | 포괄적인 테스트 커버리지 |
| LLM provider 에러 분류 복잡성 | Medium | Low | 에러 분류 가이드라인 작성 |
| 404를 200으로 변경 시 클라이언트 동작 변경 | Medium | Medium | 클라이언트 코드 동시 수정 |

---

## Dependencies

- **SPEC-DEBUG-004**: LLM Provider Selection (LLM provider 관련 로직 참조)
- **기존 response.ts 유틸리티**: 확장 기반

---

## Rollback Plan

각 Phase는 독립적으로 롤백 가능:

1. Phase 4: 테스트 파일 삭제
2. Phase 3: `tasks.ts`에서 에러 처리 로직 원복
3. Phase 2: `qa.ts`에서 getTaskQA 404 로직 복원
4. Phase 1: 새로운 파일 및 response.ts 수정 원복
