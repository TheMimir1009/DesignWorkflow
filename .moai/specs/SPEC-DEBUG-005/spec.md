---
id: SPEC-DEBUG-005
version: "1.0.0"
status: draft
created: "2026-01-12"
updated: "2026-01-12"
author: ""
priority: HIGH
---

# SPEC-DEBUG-005: API Error Handling & Response Standardization

## History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-12 | Initial draft | - |

## Overview

이 SPEC은 Design Workflow 애플리케이션의 API 에러 처리 및 응답 형식을 표준화합니다. 현재 시스템에서는 일관성 없는 에러 응답으로 인해 클라이언트가 에러를 적절히 처리하지 못하는 문제가 있습니다.

### Problem Statement

1. **404 응답의 불일치**: Q&A 세션이 존재하지 않을 때 `GET /api/tasks/:taskId/qa`가 404를 반환하지만, 이는 "리소스 없음"이 아니라 "아직 생성되지 않음"을 의미합니다.
2. **500 응답의 모호함**: `/api/tasks/:taskId/trigger-ai`에서 LLM provider 설정 누락 등의 명확한 클라이언트 오류가 500으로 반환됩니다.
3. **에러 응답 형식의 불일치**: 일부 에러는 순수 문자열, 일부는 객체 형식으로 반환됩니다.

### Solution Goals

- 표준화된 에러 응답 인터페이스 정의
- 존재하지 않는 선택적 리소스에 대해 200 OK + null 반환
- 클라이언트 오류(400)와 서버 오류(500)의 명확한 구분
- 에러 코드 및 상세 정보 제공

---

## Requirements (EARS)

### 1. Ubiquitous Requirements (항상 적용)

**REQ-ERR-001**: 모든 API 엔드포인트는 표준화된 에러 응답 형식을 반환해야 한다.

```typescript
interface ApiErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: {
    field?: string;
    provider?: string;
    model?: string;
    action?: string;
  };
}
```

**REQ-ERR-002**: 모든 에러 응답은 적절한 HTTP 상태 코드를 사용해야 한다.
- 400 Bad Request: 클라이언트 요청 오류 (필수 필드 누락, 잘못된 값 등)
- 404 Not Found: 경로나 리소스가 존재하지 않음 (taskId가 유효하지 않은 경우)
- 500 Internal Server Error: 예상치 못한 서버 오류
- 504 Gateway Timeout: 외부 서비스(LLM API) 시간초과

**REQ-ERR-003**: 모든 성공 응답은 표준화된 형식을 따라야 한다.

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}
```

### 2. Event-Driven Requirements (이벤트 기반)

**REQ-ERR-004**: Q&A 세션이 존재하지 않는 상태에서 GET `/api/tasks/:taskId/qa` 요청이 들어오면, 시스템은 HTTP 200 OK와 함께 빈 세션 객체 또는 null을 반환한다.

```typescript
// Response: 200 OK
{
  success: true,
  data: null  // 또는 빈 Q&A 세션 구조
}
```

**RATIONALE**: Q&A 세션은 선택적 리소스이며, 존재하지 않는 것은 오류가 아닙니다. 클라이언트는 null 응답을 감지하고 세션 생성을 유도할 수 있습니다.

**REQ-ERR-005**: POST `/api/tasks/:taskId/qa` 요청으로 Q&A 답변 저장 시 세션이 존재하지 않으면, 시스템은 자동으로 새 세션을 생성하고 답변을 저장한다.

```typescript
// Request: POST /api/tasks/{taskId}/qa
// Body: { category: "game_mechanic", answers: [...], currentStep: 1 }

// Response: 200 OK
{
  success: true,
  data: {
    sessionId: "uuid",
    session: { /* QASession */ }
  }
}
```

**REQ-ERR-006**: `/api/tasks/:taskId/trigger-ai` 요청 처리 중 LLM provider 선택 실패 시, 시스템은 명확한 에러 메시지와 함께 HTTP 400 Bad Request를 반환한다.

```typescript
// Response: 400 Bad Request
{
  success: false,
  error: "LLM provider configuration missing",
  errorCode: "LLM_CONFIG_MISSING",
  details: {
    action: "configure_llm",
    guidance: "Configure LLM settings in project settings"
  }
}
```

### 3. Unwanted Behavior Requirements (방지해야 할 동작)

**REQ-ERR-007**: 시스템은 존재하지 않는 선택적 리소스(Q&A 세션, Design Document 등)에 대해 404 Not Found를 반환해서는 안 된다.

**REQ-ERR-008**: 시스템은 클라이언트 설정 오류(LLM provider 누락 등)에 대해 500 Internal Server Error를 반환해서는 안 된다.

**REQ-ERR-009**: 시스템은 에러 응답에서 스택 트레이스나 내부 구현 정보를 노출해서는 안 된다.

### 4. State-Driven Requirements (상태 기반)

**REQ-ERR-010**: Task가 존재하지 않는 상태에서 모든 Task 관련 API 요청이 들어오면, 시스템은 404 Not Found를 반환한다.

```typescript
// Response: 404 Not Found
{
  success: false,
  error: "Task not found",
  errorCode: "TASK_NOT_FOUND",
  details: {
    field: "taskId",
    value: "{taskId}"
  }
}
```

**REQ-ERR-011**: Design Document가 존재하지 않는 상태에서 PRD 생성을 요청하면, 시스템은 400 Bad Request와 함께 명확한 안내 메시지를 반환한다.

```typescript
// Response: 400 Bad Request
{
  success: false,
  error: "Design Document is required to generate PRD",
  errorCode: "PREREQUISITE_MISSING",
  details: {
    field: "designDocument",
    action: "complete_design",
    guidance: "Complete the Q&A session to generate Design Document first"
  }
}
```

**REQ-ERR-012**: PRD가 존재하지 않는 상태에서 Prototype 생성을 요청하면, 시스템은 400 Bad Request와 함께 명확한 안내 메시지를 반환한다.

```typescript
// Response: 400 Bad Request
{
  success: false,
  error: "PRD is required to generate Prototype",
  errorCode: "PREREQUISITE_MISSING",
  details: {
    field: "prd",
    action: "generate_prd",
    guidance: "Generate PRD first before creating Prototype"
  }
}
```

### 5. Optional Features (선택적 기능)

**REQ-ERR-013**: 에러 응답에는 다국어 지원을 위한 에러 코드가 포함될 수 있다.

```typescript
// 다국어 매핑 예시
const errorMessages = {
  TASK_NOT_FOUND: {
    ko: "작업을 찾을 수 없습니다",
    en: "Task not found",
    ja: "タスクが見つかりません"
  }
};
```

**REQ-ERR-014**: 에러 응답에는 문제 해결을 위한 가이드 링크가 포함될 수 있다.

```typescript
{
  success: false,
  error: "LLM provider configuration missing",
  errorCode: "LLM_CONFIG_MISSING",
  details: {
    helpUrl: "/docs/llm-configuration"
  }
}
```

---

## Error Code Definitions

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `TASK_NOT_FOUND` | 404 | 지정된 ID의 작업을 찾을 수 없음 |
| `PROJECT_NOT_FOUND` | 404 | 지정된 ID의 프로젝트를 찾을 수 없음 |
| `INVALID_CATEGORY` | 400 | 유효하지 않은 Q&A 카테고리 |
| `MISSING_REQUIRED_FIELD` | 400 | 필수 필드 누락 |
| `INVALID_STATUS` | 400 | 유효하지 않은 작업 상태 |
| `PREREQUISITE_MISSING` | 400 | 선행 문서가 생성되지 않음 |
| `LLM_CONFIG_MISSING` | 400 | LLM provider 설정 누락 |
| `LLM_GENERATION_FAILED` | 500 | LLM 콘텐츠 생성 실패 |
| `AI_GENERATION_TIMEOUT` | 504 | AI 생성 시간 초과 |

---

## API Endpoints Affected

### 1. Q&A Session Endpoints

| Endpoint | Current Behavior | New Behavior |
|----------|------------------|--------------|
| `GET /api/tasks/:taskId/qa` | 404 if session not found | 200 with `null` data |
| `POST /api/tasks/:taskId/qa` | Error if session not found | Auto-create session |

### 2. Task AI Generation Endpoints

| Endpoint | Current Behavior | New Behavior |
|----------|------------------|--------------|
| `POST /api/tasks/:taskId/trigger-ai` | 500 on LLM errors | 400/504 with structured error |

### 3. General Error Handling

All endpoints will use the standardized `ApiErrorResponse` format.

---

## Type Definitions

```typescript
/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: ErrorDetails;
}

/**
 * Error details for additional context
 */
export interface ErrorDetails {
  field?: string;
  value?: string;
  provider?: string;
  model?: string;
  action?: string;
  guidance?: string;
  helpUrl?: string;
}

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Union type for all API responses
 */
export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

---

## Related SPECs

- **SPEC-DEBUG-004**: LLM Provider Selection (LLM provider 관련 에러 처리)
- **SPEC-MODELHISTORY-001**: Generation History Tracking

---

## Success Criteria

1. 모든 API 엔드포인트가 표준화된 에러 응답 형식을 사용
2. Q&A 세션 미존재 시 200 OK + null 반환
3. LLM 설정 오류 시 400 Bad Request 반환
4. 클라이언트가 에러 코드를 기반으로 적절한 UI를 표시할 수 있음
5. 모든 에러 케이스에 대한 테스트 커버리지 100%
