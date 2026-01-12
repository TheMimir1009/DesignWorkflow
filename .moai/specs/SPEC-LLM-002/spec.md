---
id: SPEC-LLM-002
version: "1.0.0"
status: draft
created: "2026-01-12"
updated: "2026-01-12"
author: "Alfred"
priority: MEDIUM
---

# SPEC-LLM-002: LLM 연결 테스트 로깅 시스템

## History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-12 | Initial draft | Alfred |

## Overview

이 SPEC은 Design Workflow 애플리케이션의 LLM 연결 테스트 로깅 시스템을 구현합니다. 현재 LLMLogger는 API 호출 로깅만 지원하며, 연결 테스트에 대한 로깅 기능이 부족합니다.

### Problem Statement

1. **연결 테스트 시작 로깅 부재**: 연결 테스트가 시작될 때 어떤 프로바이더, 어떤 프로젝트에서 테스트가 시작되었는지 로깅되지 않습니다.
2. **연결 테스트 성공 로깅 부재**: 연결 테스트가 성공하면 발견된 모델 목록, 응답 시간, 모델 수 등의 정보가 로깅되지 않습니다.
3. **연결 테스트 실패 로깅 부재**: 연결 테스트가 실패하면 에러 코드, 메시지, 해결 제안 등의 상세 정보가 로깅되지 않습니다.
4. **디버깅 어려움**: 연결 테스트 실패 시 원인을 파악하기 위해 로그를 확인할 수 없어 디버깅이 어렵습니다.
5. **감사 추적 부재**: 언제 어떤 프로바이더 연결 테스트가 수행되었는지에 대한 감사 기록이 없습니다.

### Solution Goals

- 연결 테스트 시작 로깅 (프로바이더, 프로젝트, 타임스탬프)
- 연결 테스트 성공 로깅 (모델 목록, 지연 시간, 모델 수)
- 연결 테스트 실패 로깅 (에러 코드, 메시지, 해결 제안)
- LLMLogger에 새로운 로그 엔트리 타입 추가
- 디버그 API 엔드포인트를 통한 연결 테스트 로그 조회

---

## Requirements (EARS)

### 1. Ubiquitous Requirements (항상 적용)

**REQ-LLM-002-001**: 모든 LLM 연결 테스트 활동은 LLMLogger를 통해 기록되어야 한다.

**REQ-LLM-002-002**: 연결 테스트 로그는 표준화된 형식을 따라야 한다.

```typescript
interface ConnectionTestLogEntry {
  id: string;
  timestamp: string;
  type: 'connection-test';
  projectId: string;
  provider: LLMProvider;
  phase: 'start' | 'success' | 'failure';
  // Start phase fields
  startedAt?: string;
  // Success phase fields
  completedAt?: string;
  latency?: number;
  models?: string[];
  modelCount?: number;
  // Failure phase fields
  error?: {
    code: ConnectionErrorCode;
    message: string;
    suggestion?: string;
  };
}
```

**REQ-LLM-002-003**: 모든 연결 테스트 로그는 기존 LLMLogEntry와 호환되어야 한다.

### 2. Event-Driven Requirements (이벤트 기반)

**REQ-LLM-002-004**: 연결 테스트가 시작되면, 시스템은 시작 로그를 기록해야 한다.

```typescript
// 연결 테스트 시작 로그 기록
logger.logConnectionTestStart({
  id: generateTestId(),
  timestamp: new Date().toISOString(),
  projectId: projectId,
  provider: provider,
  phase: 'start',
  startedAt: new Date().toISOString()
});
```

**REQ-LLM-002-005**: 연결 테스트가 성공하면, 시스템은 성공 로그를 기록해야 한다.

```typescript
// 연결 테스트 성공 로그 기록
logger.logConnectionTestSuccess({
  id: testId,
  timestamp: new Date().toISOString(),
  projectId: projectId,
  provider: provider,
  phase: 'success',
  completedAt: new Date().toISOString(),
  latency: result.latency,
  models: result.models,
  modelCount: result.models?.length || 0
});
```

**REQ-LLM-002-006**: 연결 테스트가 실패하면, 시스템은 실패 로그를 기록해야 한다.

```typescript
// 연결 테스트 실패 로그 기록
logger.logConnectionTestFailure({
  id: testId,
  timestamp: new Date().toISOString(),
  projectId: projectId,
  provider: provider,
  phase: 'failure',
  error: {
    code: error.code,
    message: error.message,
    suggestion: error.suggestion
  }
});
```

**REQ-LLM-002-007**: 연결 테스트 로그가 생성되면, 디버그 콘솔이 이를 표시해야 한다.

### 3. Unwanted Behavior Requirements (방지해야 할 동작)

**REQ-LLM-002-008**: 시스템은 연결 테스트 로깅으로 인해 테스트 성능이 저하되어서는 안 된다.

**REQ-LLM-002-009**: 시스템은 로깅 실패로 인해 연결 테스트가 중단되어서는 안 된다.

**REQ-LLM-002-010**: 시스템은 중복된 연결 테스트 로그를 생성해서는 안 된다.

### 4. State-Driven Requirements (상태 기반)

**REQ-LLM-002-011**: 프로바이더가 `testing` 상태일 때 연결 테스트를 시작하면, 시스템은 시작 로그를 기록해야 한다.

**REQ-LLM-002-012**: 연결 테스트가 `connected` 상태로 완료되면, 시스템은 성공 로그를 기록해야 한다.

**REQ-LLM-002-013**: 연결 테스트가 `error` 또는 `disconnected` 상태로 완료되면, 시스템은 실패 로그를 기록해야 한다.

### 5. Optional Features (선택적 기능)

**REQ-LLM-002-014**: 연결 테스트 로그에는 재시도 횟수가 포함될 수 있다.

**REQ-LLM-002-015**: 연결 테스트 로그에는 사용자 식별자가 포함될 수 있다.

**REQ-LLM-002-016**: 연결 테스트 로그는 필터링 가능한 형태로 제공될 수 있다.

---

## Architecture

### Component Structure

```
Server Side:
  server/utils/llmLogger.ts
    - logConnectionTestStart() method (new)
    - logConnectionTestSuccess() method (new)
    - logConnectionTestFailure() method (new)
    - getConnectionTestLogs() method (new)
    - ConnectionTestLogEntry interface (new)

  server/routes/debug.ts
    - GET /api/debug/logs/connection-tests (new)
    - GET /api/debug/logs/connection-tests/:provider (new)

  server/utils/llmProviders/base.ts
    - Integrate connection test logging into testConnection()
```

### Data Flow

```
[Client] Connection Test Request
    |
    v
[Server] llmSettingsRouter.post('/test-connection/:provider')
    |
    v
[Server] Create provider instance
    |
    v
[Server] logger.logConnectionTestStart() --> Log entry created
    |
    v
[Server] provider.testConnection()
    |
    +--> Success --> logger.logConnectionTestSuccess()
    |
    +--> Failure --> logger.logConnectionTestFailure()
    |
    v
[Server] Return result to client
    |
    v
[Client] Debug console polls /api/debug/logs
    |
    v
[Client] Display connection test logs
```

---

## Design

### Type Definitions

```typescript
/**
 * Connection test log phases
 */
export type ConnectionTestPhase = 'start' | 'success' | 'failure';

/**
 * Connection test log entry
 * Extends LLMLogEntry for compatibility
 */
export interface ConnectionTestLogEntry extends LLMLogEntry {
  /** Log type identifier */
  type: 'connection-test';
  /** Project identifier */
  projectId: string;
  /** Test phase */
  phase: ConnectionTestPhase;
  /** Test start timestamp */
  startedAt?: string;
  /** Test completion timestamp */
  completedAt?: string;
  /** Response latency in milliseconds */
  latency?: number;
  /** Available models list */
  models?: string[];
  /** Number of models found */
  modelCount?: number;
  /** Connection test specific error */
  connectionError?: {
    code: ConnectionErrorCode;
    message: string;
    suggestion?: string;
  };
}

/**
 * Connection test log start parameters
 */
export interface ConnectionTestStartParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: LLMProvider;
  startedAt: string;
}

/**
 * Connection test log success parameters
 */
export interface ConnectionTestSuccessParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: LLMProvider;
  completedAt: string;
  latency: number;
  models: string[];
}

/**
 * Connection test log failure parameters
 */
export interface ConnectionTestFailureParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: LLMProvider;
  error: {
    code: ConnectionErrorCode;
    message: string;
    suggestion?: string;
  };
}
```

### LLMLogger Extensions

```typescript
export class LLMLogger {
  // ... existing methods ...

  /**
   * Log connection test start
   */
  logConnectionTestStart(params: ConnectionTestStartParams): void {
    const logEntry: Partial<LLMLogEntry> = {
      id: params.id,
      timestamp: params.timestamp,
      provider: params.provider,
      model: 'connection-test',
      request: {
        prompt: `Connection test started for project: ${params.projectId}`,
        parameters: {
          type: 'connection-test',
          phase: 'start',
          projectId: params.projectId,
          startedAt: params.startedAt
        }
      }
    };

    this.logRequest(logEntry);
  }

  /**
   * Log connection test success
   */
  logConnectionTestSuccess(params: ConnectionTestSuccessParams): void {
    const logEntry: Partial<LLMLogEntry> = {
      id: params.id,
      timestamp: params.timestamp,
      provider: params.provider,
      model: 'connection-test',
      response: {
        content: `Connection test successful. Found ${params.models.length} models.`,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: params.models.length
        }
      },
      metrics: {
        duration_ms: params.latency
      },
      request: {
        parameters: {
          type: 'connection-test',
          phase: 'success',
          projectId: params.projectId,
          completedAt: params.completedAt,
          modelCount: params.models.length,
          models: params.models
        }
      }
    };

    this.logResponse(logEntry);
  }

  /**
   * Log connection test failure
   */
  logConnectionTestFailure(params: ConnectionTestFailureParams): void {
    const logEntry: Partial<LLMLogEntry> = {
      id: params.id,
      timestamp: params.timestamp,
      provider: params.provider,
      model: 'connection-test',
      error: {
        message: params.error.message,
        code: params.error.code
      },
      request: {
        parameters: {
          type: 'connection-test',
          phase: 'failure',
          projectId: params.projectId,
          suggestion: params.error.suggestion
        }
      }
    };

    this.logError(logEntry);
  }

  /**
   * Get connection test logs only
   */
  getConnectionTestLogs(): LLMLogEntry[] {
    return this.getLogs().filter(log =>
      log.request?.parameters &&
      typeof log.request.parameters === 'object' &&
      'type' in log.request.parameters &&
      log.request.parameters.type === 'connection-test'
    );
  }
}
```

---

## Implementation

### Phase 1: LLMLogger Extension

**Files to Modify**:
- `server/utils/llmLogger.ts`

**Changes**:
1. Add `ConnectionTestStartParams` interface
2. Add `ConnectionTestSuccessParams` interface
3. Add `ConnectionTestFailureParams` interface
4. Add `logConnectionTestStart()` method
5. Add `logConnectionTestSuccess()` method
6. Add `logConnectionTestFailure()` method
7. Add `getConnectionTestLogs()` method

### Phase 2: Provider Integration

**Files to Modify**:
- `server/utils/llmProviders/base.ts`
- `server/utils/llmProviders/openai.ts`
- `server/utils/llmProviders/gemini.ts`
- `server/utils/llmProviders/lmstudio.ts`
- `server/utils/llmProviders/claudeCode.ts`

**Changes**:
1. Modify `BaseHTTPProvider.testConnection()` to log test start
2. Log success with models and latency
3. Log failure with error details
4. Generate unique test ID for each connection test

### Phase 3: Debug API Endpoints

**Files to Modify**:
- `server/routes/debug.ts`

**Changes**:
1. Add `GET /api/debug/logs/connection-tests` endpoint
2. Add `GET /api/debug/logs/connection-tests/:provider` endpoint
3. Return filtered connection test logs

### Phase 4: Client-Side Display

**Files to Modify**:
- `src/types/debug.ts`
- `src/store/debugStore.ts`
- `src/components/debug/DebugConsole.tsx`

**Changes**:
1. Add connection test log type to client types
2. Fetch connection test logs from debug API
3. Display connection test logs in debug console

### Phase 5: Testing & Documentation

**Files to Create**:
- `tests/server/utils/llmLogger.connection.test.ts`
- `tests/server/routes/debug.connection.test.ts`

**Changes**:
1. Test all connection test logging methods
2. Test log filtering functionality
3. Test API endpoints
4. Update API documentation

---

## Related SPECs

- **SPEC-LLM-001**: LLM 연결 테스트 시스템 개선 (연결 테스트 기본 기능)
- **SPEC-DEBUG-003**: Debug API Routes (디버그 로그 API)
- **SPEC-DEBUG-005**: API Error Handling & Response Standardization (에러 처리)

---

## Success Criteria

1. 모든 연결 테스트 시작이 로깅됨
2. 모든 연결 테스트 성공이 상세 정보와 함께 로깅됨
3. 모든 연결 테스트 실패가 에러 정보와 함께 로깅됨
4. 디버그 API를 통해 연결 테스트 로그를 조회할 수 있음
5. 로깅이 연결 테스트 성능에 영향을 주지 않음
6. 테스트 커버리지가 90% 이상 달성됨
