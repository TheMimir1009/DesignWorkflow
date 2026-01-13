---
id: SPEC-LLM-001
version: "1.0.0"
status: draft
created: "2026-01-12"
updated: "2026-01-12"
author: "Alfred"
priority: HIGH
---

# SPEC-LLM-001: LLM 연결 테스트 시스템 개선

## History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-12 | Initial draft | Alfred |

## Overview

이 SPEC은 Design Workflow 애플리케이션의 LLM 연결 테스트 시스템을 개선합니다. 현재 시스템에서는 연결 상태 관리, 에러 처리, 중복 요청 방지 등의 기능이 부족하여 사용자 경험이 저하됩니다.

### Problem Statement

1. **연결 상태 타입 미사용**: `ConnectionStatus` 타입에 `disconnected` 상태가 정의되어 있지만 실제로 사용되지 않습니다.
2. **테스트 중 상태 부재**: 연결 테스트 진행 중임을 나타내는 `testing` 상태가 없어 사용자가 테스트 진행 여부를 명확히 알 수 없습니다.
3. **상태 동기화 문제**: 테스트 결과와 `connectionStatus` 업데이트 간 불일치가 발생할 수 있습니다.
4. **에러 처리 미흡**: 네트워크 오류, 인증 오류 등이 구분되지 않아 사용자가 문제를 진단하기 어렵습니다.
5. **중복 요청 방지 부재**: 동일한 프로바이더에 대해 여러 테스트 요청을 동시에 보낼 수 있습니다.

### Solution Goals

- `testing` 상태를 `ConnectionStatus` 타입에 추가
- 실제 API 호출을 통한 연결 테스트 및 적절한 검증 구현
- 구체적인 에러 메시지와 해결 제안 제공
- 중복 테스트 요청 방지
- 타임아웃 및 재시도 로직 추가

---

## Requirements (EARS)

### 1. Ubiquitous Requirements (항상 적용)

**REQ-LLM-001**: 모든 LLM 프로바이더 연결 테스트는 표준화된 연결 상태 타입을 사용해야 한다.

```typescript
// Extended ConnectionStatus type
export type ConnectionStatus =
  | 'connected'      // 연결 성공
  | 'disconnected'   // 연결 실패 (이전에 연결됨)
  | 'error'          // 설정 오류 (API 키 누락 등)
  | 'testing'        // 연결 테스트 진행 중
  | 'untested';      // 아직 테스트되지 않음
```

**REQ-LLM-002**: 모든 연결 테스트 결과는 표준화된 응답 형식을 따라야 한다.

```typescript
interface ConnectionTestResult {
  success: boolean;
  status: ConnectionStatus;
  latency?: number;           // 응답 시간 (ms)
  models?: string[];          // 사용 가능한 모델 목록
  error?: {
    code: string;             // 에러 코드
    message: string;          // 사용자용 메시지
    technical?: string;       // 기술적 상세 정보
    suggestion?: string;      // 해결 제안
  };
}
```

**REQ-LLM-003**: 모든 연결 테스트는 기본 타임아웃(10초)을 가져야 한다.

### 2. Event-Driven Requirements (이벤트 기반)

**REQ-LLM-004**: 사용자가 연결 테스트 버튼을 클릭하면, 시스템은 즉시 `testing` 상태로 변경하고 UI에 로딩 표시기를 표시해야 한다.

```typescript
// 클라이언트 상태 업데이트 순서
1. testingProvider 상태 설정 (store)
2. connectionStatus를 'testing'으로 업데이트
3. UI에서 로딩 스피너 표시
4. API 요청 전송
```

**REQ-LLM-005**: 연결 테스트가 완료되면, 시스템은 결과에 따라 적절한 상태로 변경해야 한다.

```typescript
// 성공 시: connected
connectionStatus: 'connected'
errorMessage: undefined

// 실패 시 (이전에 연결됨): disconnected
connectionStatus: 'disconnected'
errorMessage: '연결이 끊어졌습니다. 네트워크를 확인하세요.'

// 실패 시 (설정 오류): error
connectionStatus: 'error'
errorMessage: 'API 키가 유효하지 않습니다.'
```

**REQ-LLM-006**: 연결 테스트 API 호출이 진행 중일 때 동일한 프로바이더에 대한 추가 테스트 요청이 들어오면, 시스템은 이를 무시하거나 대기열에 추가해야 한다.

```typescript
// 중복 요청 방지 로직
if (testingProvider === provider) {
  // 이미 테스트 중 - 요청 무시
  return;
}
```

### 3. Unwanted Behavior Requirements (방지해야 할 동작)

**REQ-LLM-007**: 시스템은 연결 테스트 중인 상태에서 다른 테스트를 시작할 수 있게 해서는 안 된다.

**REQ-LLM-008**: 시스템은 에러 발생 시 일반적인 "연결 실패" 메시지만 표시해서는 안 된다. 구체적인 원인과 해결 방법을 제공해야 한다.

**REQ-LLM-009**: 시스템은 타임아웃 발생 시 무한 대기를 해서는 안 된다. 10초 후 타임아웃 처리해야 한다.

### 4. State-Driven Requirements (상태 기반)

**REQ-LLM-010**: 프로바이더가 `untested` 상태일 때 첫 연결 테스트를 요청하면, 시스템은 `testing` 상태로 변경 후 테스트를 실행해야 한다.

```typescript
// 상태 전환: untested -> testing -> (connected | error)
```

**REQ-LLM-011**: 프로바이더가 `connected` 상태일 때 재테스트를 요청하면, 실패 시 `disconnected` 상태로 변경해야 한다.

```typescript
// 상태 전환: connected -> testing -> (connected | disconnected)
```

**REQ-LLM-012**: 프로바이더가 `error` 상태일 때(설정 오류), 연결 테스트를 요청하면 설정 유효성을 먼저 검증해야 한다.

```typescript
// 사전 검증: API 키 존재 여부 확인
if (!providerSettings.apiKey && provider !== 'lmstudio') {
  return {
    success: false,
    status: 'error',
    error: {
      code: 'API_KEY_MISSING',
      message: 'API 키가 필요합니다',
      suggestion: '프로바이더 설정에서 API 키를 입력하세요'
    }
  };
}
```

### 5. Optional Features (선택적 기능)

**REQ-LLM-013**: 연결 테스트 결과에는 응답 시간(latency) 정보가 포함될 수 있다.

```typescript
{
  success: true,
  status: 'connected',
  latency: 245  // ms
}
```

**REQ-LLM-014**: 연결 테스트 성공 시 사용 가능한 모델 목록이 포함될 수 있다.

**REQ-LLM-015**: 일시적 네트워크 오류에 대해 자동 재시도가 수행될 수 있다 (최대 2회).

---

## Error Code Definitions

| Error Code | Description | HTTP Status | Suggestion |
|------------|-------------|-------------|------------|
| `API_KEY_MISSING` | API 키가 설정되지 않음 | 400 | 프로바이더 설정에서 API 키를 입력하세요 |
| `API_KEY_INVALID` | API 키가 유효하지 않음 | 401 | API 키를 확인하고 다시 입력하세요 |
| `QUOTA_EXCEEDED` | API 할당량 초과 | 429 | 요금제를 확인하거나 나중에 다시 시도하세요 |
| `NETWORK_ERROR` | 네트워크 연결 실패 | N/A | 인터넷 연결을 확인하고 다시 시도하세요 |
| `TIMEOUT` | 요청 시간 초과 | 408 | 네트워크 상태를 확인하고 다시 시도하세요 |
| `SERVER_ERROR` | LLM 서버 오류 | 500/502/503 | 잠시 후 다시 시도하세요 |
| `ENDPOINT_UNREACHABLE` | 엔드포인트에 연결할 수 없음 | N/A | 엔드포인트 URL을 확인하세요 |
| `MODEL_NOT_FOUND` | 지정한 모델을 찾을 수 없음 | 404 | 사용 가능한 모델 목록을 확인하세요 |

---

## Architecture

### Component Structure

```
Client Side:
  src/types/llm.ts
    - ConnectionStatus (extended)
    - ConnectionTestResult (enhanced)
    - ConnectionError (new)

  src/store/llmSettingsStore.ts
    - testingProvider (existing)
    - connectionStatus (per provider)
    - testConnection() action

  src/components/llm/ProviderConfigCard.tsx
    - Connection status display
    - Test button with loading state
    - Error message display

  src/services/llmSettingsService.ts
    - testProviderConnection() (enhanced)

Server Side:
  server/routes/llmSettings.ts
    - POST /test-connection/:provider (enhanced)

  server/utils/llmProviders/base.ts
    - BaseHTTPProvider.testConnection() (enhanced)
    - Error classification logic
```

### State Flow

```
User Action (Click Test Button)
    |
    v
[Client] testingProvider = provider
[Client] connectionStatus = 'testing'
    |
    v
[Client] API POST /test-connection/:provider
    |
    v
[Server] Create provider instance
[Server] Validate configuration
[Server] Execute testConnection()
    |
    v
[Server] Update connectionStatus in storage
[Server] Return ConnectionTestResult
    |
    v
[Client] Update state based on result
[Client] Display success/error message
```

---

## Design

### Type Definitions

```typescript
/**
 * Extended connection status with testing state
 */
export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'testing'
  | 'untested';

/**
 * Connection error details
 */
export interface ConnectionError {
  code: ConnectionErrorCode;
  message: string;
  technical?: string;
  suggestion?: string;
}

/**
 * Connection error codes
 */
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

/**
 * Enhanced connection test result
 */
export interface ConnectionTestResult {
  success: boolean;
  status: ConnectionStatus;
  latency?: number;
  models?: string[];
  error?: ConnectionError;
  timestamp: string;
}

/**
 * Provider settings with enhanced connection tracking
 */
export interface LLMProviderSettings {
  provider: LLMProvider;
  apiKey: string;
  endpoint?: string;
  isEnabled: boolean;
  connectionStatus: ConnectionStatus;
  lastTestedAt?: string;
  lastError?: ConnectionError;
  lastLatency?: number;
}
```

### Error Messages

```typescript
const ERROR_MESSAGES: Record<ConnectionErrorCode, {
  message: string;
  suggestion: string;
}> = {
  API_KEY_MISSING: {
    message: 'API 키가 필요합니다',
    suggestion: '프로바이더 설정에서 API 키를 입력하세요'
  },
  API_KEY_INVALID: {
    message: 'API 키가 유효하지 않습니다',
    suggestion: 'API 키를 확인하고 다시 입력하세요'
  },
  QUOTA_EXCEEDED: {
    message: 'API 사용 한도를 초과했습니다',
    suggestion: '요금제를 확인하거나 나중에 다시 시도하세요'
  },
  NETWORK_ERROR: {
    message: '네트워크 연결에 실패했습니다',
    suggestion: '인터넷 연결을 확인하고 다시 시도하세요'
  },
  TIMEOUT: {
    message: '요청 시간이 초과되었습니다',
    suggestion: '네트워크 상태를 확인하고 다시 시도하세요'
  },
  SERVER_ERROR: {
    message: '서버 오류가 발생했습니다',
    suggestion: '잠시 후 다시 시도하세요'
  },
  ENDPOINT_UNREACHABLE: {
    message: '엔드포인트에 연결할 수 없습니다',
    suggestion: '엔드포인트 URL을 확인하세요'
  },
  MODEL_NOT_FOUND: {
    message: '모델을 찾을 수 없습니다',
    suggestion: '사용 가능한 모델 목록을 확인하세요'
  },
  UNKNOWN_ERROR: {
    message: '알 수 없는 오류가 발생했습니다',
    suggestion: '관리자에게 문의하세요'
  }
};
```

---

## Implementation

### Phase 1: Type Definitions Update

**Files to Modify**:
- `src/types/llm.ts`

**Changes**:
1. Add `testing` to `ConnectionStatus` type
2. Create `ConnectionError` interface
3. Create `ConnectionErrorCode` type
4. Enhance `ConnectionTestResult` interface
5. Update `isValidConnectionStatus()` function

### Phase 2: Client-Side Implementation

**Files to Modify**:
- `src/store/llmSettingsStore.ts`
- `src/services/llmSettingsService.ts`
- `src/components/llm/ProviderConfigCard.tsx`

**Changes**:
1. Add duplicate request prevention in store
2. Update `testConnection()` action to handle `testing` state
3. Update service to pass proper timeout
4. Update component to display new status

### Phase 3: Server-Side Implementation

**Files to Modify**:
- `server/routes/llmSettings.ts`
- `server/utils/llmProviders/base.ts`
- `server/utils/llmProviders/*.ts` (each provider)

**Changes**:
1. Add timeout handling to test connection
2. Classify errors into appropriate error codes
3. Return structured error responses
4. Add retry logic for transient errors

### Phase 4: Testing & Documentation

**Files to Create**:
- `tests/server/llm/connection.test.ts`
- `tests/client/llm/llmSettingsStore.test.ts`

**Changes**:
1. Test all connection status transitions
2. Test error handling scenarios
3. Test timeout behavior
4. Test duplicate request prevention

---

## Related SPECs

- **SPEC-DEBUG-005**: API Error Handling & Response Standardization
- **SPEC-DEBUG-004**: LLM Provider Selection

---

## Success Criteria

1. `testing` 상태가 모든 연결 테스트에 표시됨
2. 모든 에러가 구체적인 메시지와 해결 제안과 함께 반환됨
3. 중복 테스트 요청이 방지됨
4. 타임아웃이 10초로 설정되고 정상 작동함
5. 모든 연결 상태 전환이 올바르게 처리됨
6. 테스트 커버리지가 90% 이상 달성됨
