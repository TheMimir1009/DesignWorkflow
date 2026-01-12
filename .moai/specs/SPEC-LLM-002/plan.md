# SPEC-LLM-002: Implementation Plan

## Overview

이 문서는 LLM 연결 테스트 로깅 시스템의 구현 계획을 설명합니다.

---

## Phase Breakdown

### Phase 1: LLMLogger Extension (LLMLogger 확장)

**Duration**: 1일

**Tasks**:

1. `server/utils/llmLogger.ts` 파일 수정
   - 연결 테스트 로그 매개변수 인터페이스 추가
   - `logConnectionTestStart()` 메서드 구현
   - `logConnectionTestSuccess()` 메서드 구현
   - `logConnectionTestFailure()` 메서드 구현
   - `getConnectionTestLogs()` 메서드 구현

**Files to Modify**:
- `server/utils/llmLogger.ts`

**Code Changes**:

```typescript
// 연결 테스트 로그 매개변수 인터페이스 추가
export interface ConnectionTestStartParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: string;
  startedAt: string;
}

export interface ConnectionTestSuccessParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: string;
  completedAt: string;
  latency: number;
  models: string[];
}

export interface ConnectionTestFailureParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: string;
  error: {
    code: string;
    message: string;
    suggestion?: string;
  };
}

// LLMLogger 클래스에 메서드 추가
export class LLMLogger {
  // ... 기존 메서드 ...

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

    this.addLog(params.id, logEntry as LLMLogEntry);
  }

  /**
   * Log connection test success
   */
  logConnectionTestSuccess(params: ConnectionTestSuccessParams): void {
    const existing = this.logs.get(params.id);

    if (existing) {
      // 기존 엔트리 업데이트
      existing.response = {
        content: `Connection test successful. Found ${params.models.length} models.`,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: params.models.length
        }
      };
      existing.metrics = {
        duration_ms: params.latency
      };
    } else {
      // 새 엔트리 생성
      const logEntry: LLMLogEntry = {
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

      this.addLog(params.id, logEntry);
    }
  }

  /**
   * Log connection test failure
   */
  logConnectionTestFailure(params: ConnectionTestFailureParams): void {
    const existing = this.logs.get(params.id);

    if (existing) {
      // 기존 엔트리 업데이트
      existing.error = {
        message: params.error.message,
        code: params.error.code
      };
    } else {
      // 새 엔트리 생성
      const logEntry: LLMLogEntry = {
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

      this.addLog(params.id, logEntry);
    }
  }

  /**
   * Get connection test logs only
   */
  getConnectionTestLogs(): LLMLogEntry[] {
    return this.getLogs().filter(log => {
      const params = log.request?.parameters;
      return params &&
        typeof params === 'object' &&
        'type' in params &&
        params.type === 'connection-test';
    });
  }

  /**
   * Add a log entry maintaining order and rotation
   * (기존 메서드를 public으로 변경하거나 별도 구현)
   */
  private addLog(id: string, entry: LLMLogEntry): void {
    if (!this.logs.has(id)) {
      this.logOrder.push(id);

      if (this.logOrder.length > this.MAX_LOGS) {
        const oldestId = this.logOrder.shift();
        if (oldestId) {
          this.logs.delete(oldestId);
        }
      }
    }

    this.logs.set(id, entry);
  }
}
```

---

### Phase 2: Provider Integration (프로바이더 통합)

**Duration**: 2일

**Tasks**:

1. `server/utils/llmProviders/base.ts` 수정
   - `testConnection()` 메서드에 로깅 통합
   - 테스트 ID 생성 로직 추가
   - 프로젝트 ID 전달 처리

2. 각 프로바이더 구현 확인
   - 기본 `testConnection()` 구현 사용 확인
   - 필요한 경우 개별 구현 수정

**Files to Modify**:
- `server/utils/llmProviders/base.ts`
- `server/routes/llmSettings.ts` (프로젝트 ID 전달을 위해)

**Code Changes**:

```typescript
// server/utils/llmProviders/base.ts
export abstract class BaseHTTPProvider implements LLMProviderInterface {
  // ... 기존 코드 ...

  /**
   * Test the connection to the provider with logging
   */
  async testConnection(projectId?: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const testId = `test-${this.provider}-${Date.now()}`;

    try {
      // 로깅 시작
      if (projectId) {
        this.logger.logConnectionTestStart({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          startedAt: new Date().toISOString()
        });
      }

      // 연결 테스트 실행
      const models = await retryWithBackoff(
        () => this.getAvailableModels(),
        this.retryConfig,
        (attempt, error) => {
          this.logger.logError({
            id: `${testId}-retry-${attempt}`,
            error: {
              message: `Retry attempt ${attempt}: ${error.message}`,
              code: error.code,
            },
          });
        }
      );

      const latency = Date.now() - startTime;

      // 성공 로깅
      if (projectId) {
        this.logger.logConnectionTestSuccess({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          completedAt: new Date().toISOString(),
          latency,
          models
        });
      }

      return {
        success: true,
        status: 'connected',
        latency,
        models,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const classifiedError = classifyError(error);
      const latency = Date.now() - startTime;

      // 실패 로깅
      if (projectId) {
        this.logger.logConnectionTestFailure({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          error: {
            code: classifiedError.code,
            message: classifiedError.message,
            suggestion: this.getErrorSuggestion(classifiedError.code)
          }
        });
      }

      return {
        success: false,
        status: 'error',
        error: classifiedError,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get error suggestion based on error code
   */
  private getErrorSuggestion(code: ConnectionErrorCode): string {
    const suggestions: Record<ConnectionErrorCode, string> = {
      'NETWORK_ERROR': '인터넷 연결을 확인하고 다시 시도하세요',
      'TIMEOUT': '네트워크 상태를 확인하고 다시 시도하세요',
      'AUTHENTICATION_FAILED': 'API 키를 확인하고 다시 입력하세요',
      'API_ERROR': '잠시 후 다시 시도하세요',
      'INVALID_RESPONSE': '프로바이더 설정을 확인하세요',
      'UNKNOWN_ERROR': '관리자에게 문의하세요'
    };

    return suggestions[code] || '잠시 후 다시 시도하세요';
  }
}

// server/routes/llmSettings.ts
llmSettingsRouter.post(
  '/:projectId/llm-settings/test-connection/:provider',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, provider } = req.params;

      // ... 기존 검증 코드 ...

      // Create provider instance with shared logger
      const logger = getSharedLogger();
      const llmProvider = createLLMProvider(providerSettings, logger);

      // 프로젝트 ID를 전달하여 로깅 활성화
      const result = await llmProvider.testConnection(projectId);

      // ... 기존 응답 처리 ...
    } catch (error) {
      // ... 에러 처리 ...
    }
  }
);
```

---

### Phase 3: Debug API Endpoints (디버그 API 엔드포인트)

**Duration**: 1일

**Tasks**:

1. `server/routes/debug.ts` 수정
   - `GET /api/debug/logs/connection-tests` 엔드포인트 추가
   - `GET /api/debug/logs/connection-tests/:provider` 엔드포인트 추가
   - 연결 테스트 로그 필터링 구현

**Files to Modify**:
- `server/routes/debug.ts`

**Code Changes**:

```typescript
/**
 * GET /api/debug/logs/connection-tests
 * Get connection test logs only
 */
debugRouter.get('/logs/connection-tests', async (req: Request, res: Response): Promise<void> => {
  try {
    const logger = getSharedLogger();
    const connectionTestLogs = logger.getConnectionTestLogs();

    // Transform to client format
    const clientLogs = connectionTestLogs.map(log => {
      const params = log.request?.parameters as Record<string, unknown> | undefined;
      return {
        id: log.id,
        timestamp: log.timestamp,
        provider: log.provider,
        type: 'connection-test',
        phase: params?.phase as string,
        projectId: params?.projectId as string,
        latency: log.metrics?.duration_ms,
        models: params?.models as string[] | undefined,
        modelCount: params?.modelCount as number | undefined,
        error: log.error,
      };
    });

    sendSuccess(res, clientLogs);
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * GET /api/debug/logs/connection-tests/:provider
 * Get connection test logs for a specific provider
 */
debugRouter.get('/logs/connection-tests/:provider', async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;

    const logger = getSharedLogger();
    const allConnectionTestLogs = logger.getConnectionTestLogs();

    // Filter by provider
    const filteredLogs = allConnectionTestLogs.filter(log => log.provider === provider);

    // Transform to client format
    const clientLogs = filteredLogs.map(log => {
      const params = log.request?.parameters as Record<string, unknown> | undefined;
      return {
        id: log.id,
        timestamp: log.timestamp,
        provider: log.provider,
        type: 'connection-test',
        phase: params?.phase as string,
        projectId: params?.projectId as string,
        latency: log.metrics?.duration_ms,
        models: params?.models as string[] | undefined,
        modelCount: params?.modelCount as number | undefined,
        error: log.error,
      };
    });

    sendSuccess(res, clientLogs);
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
  }
});
```

---

### Phase 4: Client-Side Display (클라이언트 표시)

**Duration**: 1일

**Tasks**:

1. `src/types/debug.ts` 수정
   - 연결 테스트 로그 타입 추가

2. `src/store/debugStore.ts` 수정
   - 연결 테스트 로그 가져오기 액션 추가

3. `src/components/debug/DebugConsole.tsx` 수정
   - 연결 테스트 로그 표시 UI 추가

**Files to Modify**:
- `src/types/debug.ts`
- `src/store/debugStore.ts`
- `src/components/debug/DebugConsole.tsx`

**Code Changes**:

```typescript
// src/types/debug.ts
export interface ConnectionTestLog {
  id: string;
  timestamp: string;
  provider: string;
  type: 'connection-test';
  phase: 'start' | 'success' | 'failure';
  projectId: string;
  latency?: number;
  models?: string[];
  modelCount?: number;
  error?: {
    code?: string;
    message: string;
  };
}

// DebugState에 추가
export interface DebugState {
  // ... 기존 필드 ...
  connectionTestLogs: ConnectionTestLog[];

  // ... 기존 액션 ...
  fetchConnectionTestLogs: () => Promise<void>;
  fetchConnectionTestLogsByProvider: (provider: string) => Promise<void>;
}

// src/store/debugStore.ts
export const useDebugStore = create<DebugState>((set, get) => ({
  // ... 기존 상태 ...

  connectionTestLogs: [],

  // ... 기존 액션 ...

  fetchConnectionTestLogs: async () => {
    try {
      const response = await fetch('/api/debug/logs/connection-tests');
      const json = await response.json();
      if (json.success) {
        set({ connectionTestLogs: json.data });
      }
    } catch (error) {
      console.error('Failed to fetch connection test logs:', error);
    }
  },

  fetchConnectionTestLogsByProvider: async (provider: string) => {
    try {
      const response = await fetch(`/api/debug/logs/connection-tests/${provider}`);
      const json = await response.json();
      if (json.success) {
        set({ connectionTestLogs: json.data });
      }
    } catch (error) {
      console.error('Failed to fetch connection test logs:', error);
    }
  },
}));
```

---

### Phase 5: Testing & Documentation (테스트 및 문서화)

**Duration**: 1일

**Tasks**:

1. 테스트 파일 작성
   - `tests/server/utils/llmLogger.connection.test.ts`
   - `tests/server/routes/debug.connection.test.ts`

2. API 문서 업데이트

**Files to Create**:
- `tests/server/utils/llmLogger.connection.test.ts`
- `tests/server/routes/debug.connection.test.ts`

**Test Examples**:

```typescript
// tests/server/utils/llmLogger.connection.test.ts
describe('LLMLogger - Connection Test Logging', () => {
  let logger: LLMLogger;

  beforeEach(() => {
    logger = new LLMLogger();
  });

  describe('logConnectionTestStart', () => {
    it('should log connection test start', () => {
      const params = {
        id: 'test-123',
        timestamp: '2026-01-12T00:00:00.000Z',
        projectId: 'project-1',
        provider: 'openai',
        startedAt: '2026-01-12T00:00:00.000Z'
      };

      logger.logConnectionTestStart(params);

      const logs = logger.getConnectionTestLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe('test-123');
    });

    it('should include connection-test type in parameters', () => {
      const params = {
        id: 'test-123',
        timestamp: '2026-01-12T00:00:00.000Z',
        projectId: 'project-1',
        provider: 'openai',
        startedAt: '2026-01-12T00:00:00.000Z'
      };

      logger.logConnectionTestStart(params);

      const logs = logger.getLogs();
      const log = logs[0];
      expect(log.request?.parameters).toHaveProperty('type', 'connection-test');
    });
  });

  describe('logConnectionTestSuccess', () => {
    it('should log connection test success with models', () => {
      const startParams = {
        id: 'test-123',
        timestamp: '2026-01-12T00:00:00.000Z',
        projectId: 'project-1',
        provider: 'openai',
        startedAt: '2026-01-12T00:00:00.000Z'
      };

      const successParams = {
        id: 'test-123',
        timestamp: '2026-01-12T00:00:01.000Z',
        projectId: 'project-1',
        provider: 'openai',
        completedAt: '2026-01-12T00:00:01.000Z',
        latency: 245,
        models: ['gpt-4o', 'gpt-4o-mini']
      };

      logger.logConnectionTestStart(startParams);
      logger.logConnectionTestSuccess(successParams);

      const logs = logger.getConnectionTestLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].response?.content).toContain('2 models');
      expect(logs[0].metrics?.duration_ms).toBe(245);
    });
  });

  describe('logConnectionTestFailure', () => {
    it('should log connection test failure with error details', () => {
      const failureParams = {
        id: 'test-123',
        timestamp: '2026-01-12T00:00:01.000Z',
        projectId: 'project-1',
        provider: 'openai',
        error: {
          code: 'API_KEY_INVALID',
          message: 'Invalid API key',
          suggestion: 'Check your API key'
        }
      };

      logger.logConnectionTestFailure(failureParams);

      const logs = logger.getConnectionTestLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error?.code).toBe('API_KEY_INVALID');
    });
  });

  describe('getConnectionTestLogs', () => {
    it('should filter only connection test logs', () => {
      // Add regular API log
      logger.logRequest({
        id: 'req-123',
        provider: 'openai',
        model: 'gpt-4o'
      });

      // Add connection test log
      logger.logConnectionTestStart({
        id: 'test-123',
        timestamp: '2026-01-12T00:00:00.000Z',
        projectId: 'project-1',
        provider: 'openai',
        startedAt: '2026-01-12T00:00:00.000Z'
      });

      const allLogs = logger.getLogs();
      const connectionTestLogs = logger.getConnectionTestLogs();

      expect(allLogs).toHaveLength(2);
      expect(connectionTestLogs).toHaveLength(1);
      expect(connectionTestLogs[0].id).toBe('test-123');
    });
  });
});
```

---

## File Modification Summary

| File | Action | Description |
|------|--------|-------------|
| `server/utils/llmLogger.ts` | MODIFY | 연결 테스트 로깅 메서드 추가 |
| `server/utils/llmProviders/base.ts` | MODIFY | testConnection()에 로깅 통합 |
| `server/routes/llmSettings.ts` | MODIFY | 프로젝트 ID를 전달하여 로깅 활성화 |
| `server/routes/debug.ts` | MODIFY | 연결 테스트 로그 API 엔드포인트 추가 |
| `src/types/debug.ts` | MODIFY | ConnectionTestLog 타입 추가 |
| `src/store/debugStore.ts` | MODIFY | 연결 테스트 로그 가져오기 액션 추가 |
| `src/components/debug/DebugConsole.tsx` | MODIFY | 연결 테스트 로그 표시 UI 추가 |
| `tests/server/utils/llmLogger.connection.test.ts` | CREATE | 연결 테스트 로깅 단위 테스트 |
| `tests/server/routes/debug.connection.test.ts` | CREATE | 연결 테스트 로그 API 테스트 |

---

## Connection Test Logging Flow

```
[User Action] Click Test Connection Button
         |
         v
[Client] POST /api/projects/:projectId/llm-settings/test-connection/:provider
         |
         v
[Server] Create provider instance with logger
         |
         v
[Server] logger.logConnectionTestStart()
         | - Log: { type: 'connection-test', phase: 'start', projectId, provider }
         |
         v
[Server] provider.testConnection(projectId)
         |
         +-- Success --> logger.logConnectionTestSuccess()
         |                | - Log: { phase: 'success', models, latency, modelCount }
         |                |
         |                v
         |           [Return success result]
         |
         +-- Failure --> logger.logConnectionTestFailure()
                          | - Log: { phase: 'failure', error.code, error.message }
                          |
                          v
                     [Return error result]
         |
         v
[Client] Update UI with result
         |
         v
[Client] Debug Console polls /api/debug/logs/connection-tests
         |
         v
[Client] Display connection test logs with phases
```

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 로깅으로 인한 연결 테스트 성능 저하 | Low | Medium | 비동기 로깅 고려, 로깅 실패 시 테스트 계속 진행 |
| 로그 용량 과도 증가 | Medium | Low | 로그 로테이션 유지, 최대 1000개 엔트리 |
| 기존 LLMLogEntry와 호환성 문제 | Low | High | 기존 구조 재사용, type 필드로 구분 |
| 프로젝트 ID 미전달 시 로깅 누락 | Medium | Low | 선택적 매개변수로 처리 |

---

## Dependencies

- **SPEC-LLM-001**: LLM 연결 테스트 시스템 개선 (연결 테스트 기본 기능)
- **SPEC-DEBUG-003**: Debug API Routes (디버그 로그 API 기반)

---

## Rollback Plan

각 Phase는 독립적으로 롤백 가능:

1. Phase 5: 테스트 파일 삭제
2. Phase 4: 클라이언트 변경사항 원복
3. Phase 3: API 엔드포인트 삭제
4. Phase 2: 프로바이더 로깅 통합 제거
5. Phase 1: LLMLogger 메서드 삭제
