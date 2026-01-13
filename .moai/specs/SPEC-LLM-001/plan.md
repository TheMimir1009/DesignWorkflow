# SPEC-LLM-001: Implementation Plan

## Overview

이 문서는 LLM 연결 테스트 시스템 개선의 구현 계획을 설명합니다.

---

## Phase Breakdown

### Phase 1: Type Definitions Update (타입 정의 업데이트)

**Duration**: 1일

**Tasks**:

1. `src/types/llm.ts` 파일 수정
   - `ConnectionStatus` 타입에 `testing` 추가
   - `ConnectionError` 인터페이스 생성
   - `ConnectionErrorCode` 타입 생성
   - `ConnectionTestResult` 인터페이스 확장
   - `LLMProviderSettings` 인터페이스에 `lastError`, `lastLatency` 필드 추가
   - `isValidConnectionStatus()` 함수 업데이트

**Files to Modify**:
- `src/types/llm.ts`

**Code Changes**:

```typescript
// Before
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'untested';

export interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  models?: string[];
  error?: string;
}

// After
export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'testing'
  | 'untested';

export type ConnectionErrorCode =
  | 'API_KEY_MISSING'
  | 'API_KEY_INVALID'
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'ENDPOINT_UNREACHABLE'
  | 'MODEL_NOT_FOUND'
  | 'UNKNOWN_ERROR';

export interface ConnectionError {
  code: ConnectionErrorCode;
  message: string;
  technical?: string;
  suggestion?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  status: ConnectionStatus;
  latency?: number;
  models?: string[];
  error?: ConnectionError;
  timestamp: string;
}

export function isValidConnectionStatus(value: string): value is ConnectionStatus {
  return ['connected', 'disconnected', 'error', 'testing', 'untested'].includes(value);
}
```

---

### Phase 2: Client-Side Store & Service Implementation

**Duration**: 2일

**Tasks**:

1. `src/store/llmSettingsStore.ts` 수정
   - 중복 요청 방지 로직 추가
   - `testConnection()` 액션에서 `testing` 상태 처리
   - 에러 처리 개선

2. `src/services/llmSettingsService.ts` 수정
   - `testProviderConnection()` 함수에 타임아웃 추가
   - AbortController를 사용한 요청 취소

**Files to Modify**:
- `src/store/llmSettingsStore.ts`
- `src/services/llmSettingsService.ts`

**Code Changes**:

```typescript
// src/store/llmSettingsStore.ts
testConnection: async (projectId: string, provider: LLMProvider) => {
  // 중복 요청 방지
  const { testingProvider } = get();
  if (testingProvider === provider) {
    // 이미 테스트 중 - 요청 무지
    return {
      success: false,
      status: 'testing',
      error: {
        code: 'ALREADY_TESTING',
        message: '이미 연결 테스트가 진행 중입니다'
      }
    };
  }

  // testing 상태로 변경
  set({ testingProvider: provider, error: null }, false, 'testConnection/start');

  try {
    const result = await llmSettingsService.testProviderConnection(projectId, provider);

    // 연결 테스트 결과 업데이트
    set(
      state => {
        const newResults = new Map(state.connectionTestResults);
        newResults.set(provider, result);
        return {
          testingProvider: null,
          connectionTestResults: newResults,
        };
      },
      false,
      'testConnection/success'
    );

    // 설정 재조회하여 connectionStatus 업데이트
    const settings = await llmSettingsService.getLLMSettings(projectId);
    set({ settings }, false, 'testConnection/refreshSettings');

    return result;
  } catch (error) {
    const errorResult: ConnectionTestResult = {
      success: false,
      status: 'error',
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestion: '잠시 후 다시 시도하세요'
      },
      timestamp: new Date().toISOString()
    };

    set(
      state => {
        const newResults = new Map(state.connectionTestResults);
        newResults.set(provider, errorResult);
        return {
          testingProvider: null,
          error: errorResult.error?.message,
          connectionTestResults: newResults,
        };
      },
      false,
      'testConnection/error'
    );

    return errorResult;
  }
}

// src/services/llmSettingsService.ts
export async function testProviderConnection(
  projectId: string,
  provider: LLMProvider,
  timeoutMs: number = 10000
): Promise<ConnectionTestResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/llm-settings/test-connection/${provider}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    const json = (await response.json()) as ApiResponse<ConnectionTestResult>;

    if (!json.success) {
      throw new Error(json.error || 'Unknown error occurred');
    }

    return json.data as ConnectionTestResult;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        status: 'error',
        error: {
          code: 'TIMEOUT',
          message: '요청 시간이 초과되었습니다',
          suggestion: '네트워크 상태를 확인하고 다시 시도하세요'
        },
        timestamp: new Date().toISOString()
      };
    }

    throw error;
  }
}
```

---

### Phase 3: Client-Side UI Component Update

**Duration**: 1일

**Tasks**:

1. `src/components/llm/ProviderConfigCard.tsx` 수정
   - `testing` 상태 표시 추가
   - 에러 메시지 표시 개선
   - 연결 상태 배지 업데이트

**Files to Modify**:
- `src/components/llm/ProviderConfigCard.tsx`

**Code Changes**:

```typescript
// 상태 배지 함수 업데이트
function getStatusBadge(status: ConnectionStatus) {
  switch (status) {
    case 'connected':
      return { color: 'bg-green-500', text: '연결됨' };
    case 'disconnected':
      return { color: 'bg-orange-500', text: '연결 끊김' };
    case 'error':
      return { color: 'bg-red-500', text: '오류' };
    case 'testing':
      return { color: 'bg-blue-500', text: '테스트 중' };
    case 'untested':
    default:
      return { color: 'bg-gray-500', text: '미확인' };
  }
}

// 테스트 결과 표시 컴포넌트 개선
{testResult && (
  <div className={`text-sm mt-2 p-2 rounded ${
    testResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
  }`}>
    {testResult.success ? (
      <div>
        <span>연결 성공</span>
        {testResult.latency && <span className="ml-2">({testResult.latency}ms)</span>}
      </div>
    ) : (
      <div>
        <div className="font-medium">{testResult.error?.message || '연결 실패'}</div>
        {testResult.error?.suggestion && (
          <div className="text-xs mt-1 opacity-80">{testResult.error.suggestion}</div>
        )}
      </div>
    )}
  </div>
)}
```

---

### Phase 4: Server-Side Implementation

**Duration**: 2일

**Tasks**:

1. `server/routes/llmSettings.ts` 수정
   - `test-connection` 라우트 업데이트
   - 타임아웃 처리 추가
   - 에러 응답 구조화

2. `server/utils/llmProviders/base.ts` 수정
   - `BaseHTTPProvider` 클래스에 에러 분류 메서드 추가
   - 타임아웃 설정

3. 각 프로바이더 구현 파일 수정
   - `openai.ts`
   - `gemini.ts`
   - `lmstudio.ts`
   - `claudeCode.ts`

**Files to Modify**:
- `server/routes/llmSettings.ts`
- `server/utils/llmProviders/base.ts`
- `server/utils/llmProviders/openai.ts`
- `server/utils/llmProviders/gemini.ts`
- `server/utils/llmProviders/lmstudio.ts`
- `server/utils/llmProviders/claudeCode.ts`

**Code Changes**:

```typescript
// server/utils/llmProviders/base.ts
export abstract class BaseHTTPProvider implements LLMProviderInterface {
  protected readonly CONNECTION_TIMEOUT = 10000; // 10 seconds

  /**
   * Classify error into appropriate error code
   */
  protected classifyError(error: unknown): ConnectionError {
    if (error instanceof Error) {
      // Timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return {
          code: 'TIMEOUT',
          message: '요청 시간이 초과되었습니다',
          suggestion: '네트워크 상태를 확인하고 다시 시도하세요',
          technical: error.message
        };
      }

      // HTTP status errors
      const httpMatch = error.message.match(/HTTP (\d+)/);
      if (httpMatch) {
        const status = parseInt(httpMatch[1], 10);
        switch (status) {
          case 401:
            return {
              code: 'API_KEY_INVALID',
              message: 'API 키가 유효하지 않습니다',
              suggestion: 'API 키를 확인하고 다시 입력하세요'
            };
          case 429:
            return {
              code: 'QUOTA_EXCEEDED',
              message: 'API 사용 한도를 초과했습니다',
              suggestion: '요금제를 확인하거나 나중에 다시 시도하세요'
            };
          case 404:
            return {
              code: 'MODEL_NOT_FOUND',
              message: '모델을 찾을 수 없습니다',
              suggestion: '사용 가능한 모델 목록을 확인하세요'
            };
          default:
            if (status >= 500) {
              return {
                code: 'SERVER_ERROR',
                message: '서버 오류가 발생했습니다',
                suggestion: '잠시 후 다시 시도하세요'
              };
            }
        }
      }

      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          code: 'NETWORK_ERROR',
          message: '네트워크 연결에 실패했습니다',
          suggestion: '인터넷 연결을 확인하고 다시 시도하세요'
        };
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다',
      suggestion: '관리자에게 문의하세요',
      technical: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// server/routes/llmSettings.ts
llmSettingsRouter.post(
  '/:projectId/llm-settings/test-connection/:provider',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, provider } = req.params;

      // Validation
      if (!projectId) {
        sendError(res, 400, 'Project ID is required');
        return;
      }

      if (!provider || !isValidProvider(provider)) {
        sendError(res, 400, 'Invalid provider');
        return;
      }

      const settings = await getLLMSettingsOrDefault(projectId);
      const providerSettings = settings.providers.find(p => p.provider === provider);

      if (!providerSettings) {
        sendError(res, 404, 'Provider not found in settings');
        return;
      }

      // Pre-validation for required fields
      if (provider !== 'lmstudio' && provider !== 'claude-code' && !providerSettings.apiKey) {
        const result: ConnectionTestResult = {
          success: false,
          status: 'error',
          error: {
            code: 'API_KEY_MISSING',
            message: 'API 키가 필요합니다',
            suggestion: '프로바이더 설정에서 API 키를 입력하세요'
          },
          timestamp: new Date().toISOString()
        };

        // Update status
        await updateProviderSettings(projectId, provider as LLMProvider, {
          connectionStatus: 'error',
          lastTestedAt: result.timestamp,
          lastError: result.error
        });

        sendSuccess(res, result);
        return;
      }

      // Create provider instance and test connection
      const llmProvider = createLLMProvider(providerSettings);
      const result = await llmProvider.testConnection();

      // Update connection status based on result
      const newStatus: ConnectionStatus = result.success
        ? 'connected'
        : providerSettings.connectionStatus === 'connected'
          ? 'disconnected'
          : 'error';

      await updateProviderSettings(projectId, provider as LLMProvider, {
        connectionStatus: newStatus,
        lastTestedAt: new Date().toISOString(),
        errorMessage: result.error?.message,
      });

      sendSuccess(res, result);
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
);
```

---

### Phase 5: Testing & Documentation

**Duration**: 2일

**Tasks**:

1. 테스트 파일 작성
   - `tests/server/llm/connection.test.ts`
   - `tests/client/llm/llmSettingsStore.test.ts`
   - `tests/client/llm/llmSettingsService.test.ts`

2. 통합 테스트
   - 모든 연결 상태 전환 검증
   - 에러 시나리오 테스트
   - 타임아웃 테스트
   - 중복 요청 방지 테스트

3. 문서 업데이트
   - API 엔드포인트 문서 업데이트
   - 에러 코드 목록 문서화

**Files to Create**:
- `tests/server/llm/connection.test.ts`
- `tests/client/llm/llmSettingsStore.test.ts`
- `tests/client/llm/llmSettingsService.test.ts`

---

## File Modification Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/llm.ts` | MODIFY | ConnectionStatus, ConnectionTestResult 업데이트 |
| `src/store/llmSettingsStore.ts` | MODIFY | 중복 요청 방지, testing 상태 처리 |
| `src/services/llmSettingsService.ts` | MODIFY | 타임아웃 추가, 에러 처리 개선 |
| `src/components/llm/ProviderConfigCard.tsx` | MODIFY | UI 업데이트 (testing 상태, 에러 메시지) |
| `server/routes/llmSettings.ts` | MODIFY | test-connection 라우트 개선 |
| `server/utils/llmProviders/base.ts` | MODIFY | 에러 분류 메서드 추가 |
| `server/utils/llmProviders/openai.ts` | MODIFY | testConnection() 개선 |
| `server/utils/llmProviders/gemini.ts` | MODIFY | testConnection() 개선 |
| `server/utils/llmProviders/lmstudio.ts` | MODIFY | testConnection() 개선 |
| `server/utils/llmProviders/claudeCode.ts` | MODIFY | testConnection() 개선 |
| `tests/server/llm/connection.test.ts` | CREATE | 연결 테스트 서버 테스트 |
| `tests/client/llm/llmSettingsStore.test.ts` | CREATE | 스토어 테스트 |
| `tests/client/llm/llmSettingsService.test.ts` | CREATE | 서비스 테스트 |

---

## Connection State Transition Diagram

```
                    +-----------------+
                    |    untested     |  (초기 상태)
                    +-----------------+
                             |
                    [Test Connection]
                             |
                             v
                    +-----------------+
        +-----------|     testing     |-----------+
        |           +-----------------+           |
        |                 |   |                   |
        |        [Success]|   |[Failure]          |
        |                 |   |                   |
        |                 v   v                   |
[Success]         +---------+ +---------+    [Failure]
        |         |connected| |disconnected|       |
        |         +---------+ +---------+       |
        |              |           |            |
        |    [Retest] |           | [Retest]   |
        |              |           |            |
        +--------------+           +------------+
                     |               |
                     v               v
              +-----------------+
              |     testing     |
              +-----------------+
```

---

## Error Handling Flow

```
[Test Connection Request]
         |
         v
[Validate Configuration]
         |
         +-- API Key Missing --> Return API_KEY_ERROR
         |
         v
[Set status to 'testing']
         |
         v
[Execute API Test]
         |
         +-- Timeout (10s) --> Return TIMEOUT_ERROR
         |
         +-- Network Error --> Return NETWORK_ERROR
         |
         +-- HTTP 401 --> Return API_KEY_INVALID
         |
         +-- HTTP 429 --> Return QUOTA_EXCEEDED
         |
         +-- HTTP 5xx --> Return SERVER_ERROR
         |
         v
[Update Status]
         |
         +-- Success --> 'connected'
         |
         +-- Failure (was 'connected') --> 'disconnected'
         |
         +-- Failure (was not 'connected') --> 'error'
```

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 기존 클라이언트 코드와 호환성 문제 | Medium | Medium | 점진적 롤아웃, 하위 호환성 유지 |
| 타임아웃 설정이 너무 짧음 | Low | Medium | 사용자 설정 가능하게 고려 |
| 에러 분류 로직 복잡성 증가 | Medium | Low | 단위 테스트로 검증 |
| 상태 전환 로직 버그 | Medium | High | 상태 다이어그램 기반 테스트 |

---

## Dependencies

- **SPEC-DEBUG-005**: API Error Handling & Response Standardization (에러 응답 형식 참조)
- **SPEC-DEBUG-004**: LLM Provider Selection (프로바이더 관련 로직 참조)

---

## Rollback Plan

각 Phase는 독립적으로 롤백 가능:

1. Phase 5: 테스트 파일 삭제
2. Phase 4: 서버 측 변경사항 원복
3. Phase 3: UI 컴포넌트 원복
4. Phase 2: 스토어 및 서비스 원복
5. Phase 1: 타입 정의 원복
