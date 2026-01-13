# SPEC-LLM-001: Acceptance Criteria

## Overview

이 문서는 LLM 연결 테스트 시스템 개선의 인수 기준(Acceptance Criteria)을 정의합니다.

---

## Test Scenarios

### Scenario 1: 연결 테스트 시작 시 testing 상태 표시

**Given**: 프로바이더가 `untested` 상태이다
**When**: 사용자가 연결 테스트 버튼을 클릭할 때
**Then**: 시스템은 즉시 `testing` 상태로 변경하고 로딩 표시기를 표시해야 한다

```typescript
// Given
const provider = createMockProvider({ connectionStatus: 'untested' });

// When
await store.testConnection(projectId, 'openai');

// Then - 첫 번째 상태 업데이트 확인
expect(store.getState().testingProvider).toBe('openai');

// API 호출 전에 상태가 변경되었는지 확인
const settings = store.getState().settings?.providers.find(p => p.provider === 'openai');
expect(settings?.connectionStatus).toBe('testing');
```

**Edge Cases**:
- 이미 `testing` 상태인 프로바이더: 중복 요청 무시
- 로딩 표시기가 즉시 표시되는지 확인

---

### Scenario 2: 연결 테스트 성공 시 connected 상태로 변경

**Given**: 프로바이더가 `testing` 상태이고 API 키가 유효하다
**When**: 연결 테스트가 성공적으로 완료될 때
**Then**: 시스템은 `connected` 상태로 변경하고 지연 시간을 표시해야 한다

```typescript
// Given
const provider = createMockProvider({
  connectionStatus: 'testing',
  apiKey: 'valid-api-key'
});
mockConnectionTest.mockResolvedValue({
  success: true,
  status: 'connected',
  latency: 245,
  timestamp: new Date().toISOString()
});

// When
const result = await store.testConnection(projectId, 'openai');

// Then
expect(result.success).toBe(true);
expect(result.status).toBe('connected');
expect(result.latency).toBeDefined();

const settings = await store.getState().settings;
const openaiSettings = settings?.providers.find(p => p.provider === 'openai');
expect(openaiSettings?.connectionStatus).toBe('connected');
expect(openaiSettings?.lastLatency).toBe(245);
```

**Edge Cases**:
- 네트워크 지연이 긴 경우: 타임아웃 전 완료 시 정상 처리
- 지연 시간이 0인 경우: 정상 처리

---

### Scenario 3: 연결 테스트 실패 시 (connected -> disconnected)

**Given**: 프로바이더가 `connected` 상태였고 테스트가 실패한다
**When**: 연결 테스트가 실패할 때
**Then**: 시스템은 `disconnected` 상태로 변경해야 한다

```typescript
// Given
const provider = createMockProvider({
  connectionStatus: 'connected',
  apiKey: 'expired-api-key'
});
mockConnectionTest.mockResolvedValue({
  success: false,
  status: 'disconnected',
  error: {
    code: 'API_KEY_INVALID',
    message: 'API 키가 유효하지 않습니다',
    suggestion: 'API 키를 확인하고 다시 입력하세요'
  },
  timestamp: new Date().toISOString()
});

// When
const result = await store.testConnection(projectId, 'openai');

// Then
expect(result.success).toBe(false);
expect(result.status).toBe('disconnected');
expect(result.error?.code).toBe('API_KEY_INVALID');

const settings = await store.getState().settings;
const openaiSettings = settings?.providers.find(p => p.provider === 'openai');
expect(openaiSettings?.connectionStatus).toBe('disconnected');
```

**Edge Cases**:
- 일시적 네트워크 오류: 재시도 후 실패 시 `disconnected`
- 서버 일시적 오류: 재시도 후 실패 시 `disconnected`

---

### Scenario 4: 연결 테스트 실패 시 (untested -> error)

**Given**: 프로바이더가 `untested` 또는 `error` 상태이고 API 키가 없다
**When**: 연결 테스트를 실행할 때
**Then**: 시스템은 즉시 `error` 상태로 변경하고 구체적인 에러 메시지를 표시해야 한다

```typescript
// Given
const provider = createMockProvider({
  connectionStatus: 'untested',
  apiKey: '' // No API key
});

// When
const result = await store.testConnection(projectId, 'openai');

// Then
expect(result.success).toBe(false);
expect(result.status).toBe('error');
expect(result.error?.code).toBe('API_KEY_MISSING');
expect(result.error?.message).toBe('API 키가 필요합니다');
expect(result.error?.suggestion).toBe('프로바이더 설정에서 API 키를 입력하세요');
```

**Edge Cases**:
- 빈 API 키: `API_KEY_MISSING`
- 잘못된 형식의 API 키: `API_KEY_INVALID`

---

### Scenario 5: 중복 연결 테스트 요청 방지

**Given**: 프로바이더가 `testing` 상태이다
**When**: 사용자가 연결 테스트 버튼을 다시 클릭할 때
**Then**: 시스템은 새로운 요청을 무시하고 이미 테스트 중임을 알려야 한다

```typescript
// Given
store.setState({ testingProvider: 'openai' });
let callCount = 0;
mockConnectionTest.mockImplementation(() => {
  callCount++;
  return new Promise(resolve => setTimeout(() => resolve({
    success: true,
    status: 'connected',
    timestamp: new Date().toISOString()
  }), 1000));
});

// When - 두 번 연속 호출
const promise1 = store.testConnection(projectId, 'openai');
const promise2 = store.testConnection(projectId, 'openai');

// Then - 첫 번째 요청만 처리됨
const result1 = await promise1;
const result2 = await promise2;

expect(result1.success).toBe(true); // 첫 번째는 정상 실행
expect(result2.status).toBe('testing'); // 두 번째는 testing 상태 반환
expect(callCount).toBe(1); // API는 한 번만 호출됨
```

**Edge Cases**:
- 다른 프로바이더: 동시 테스트 허용
- 테스트 완료 후 즉시 재요청: 정상 처리

---

### Scenario 6: 타임아웃 처리

**Given**: 프로바이더가 `testing` 상태이고 API 응답이 10초 이상 지연된다
**When**: 연결 테스트 요청이 10초간 응답이 없을 때
**Then**: 시스템은 요청을 취소하고 타임아웃 에러를 반환해야 한다

```typescript
// Given
mockConnectionTest.mockImplementation(() => {
  return new Promise(() => {}); // Never resolves
});

// When
const result = await store.testConnection(projectId, 'openai', 10000); // 10s timeout

// Then
expect(result.success).toBe(false);
expect(result.status).toBe('error');
expect(result.error?.code).toBe('TIMEOUT');
expect(result.error?.message).toBe('요청 시간이 초과되었습니다');
expect(result.error?.suggestion).toBe('네트워크 상태를 확인하고 다시 시도하세요');

// 상태가 error로 변경되었는지 확인
const settings = await store.getState().settings;
const openaiSettings = settings?.providers.find(p => p.provider === 'openai');
expect(openaiSettings?.connectionStatus).toBe('error');
```

**Edge Cases**:
- 9.9초 후 응답: 정상 처리
- 10.1초 후 응답: 타임아웃 처리

---

### Scenario 7: 네트워크 오류 처리

**Given**: 프로바이더가 `testing` 상태이고 네트워크 연결이 끊겨있다
**When**: 연결 테스트 요청이 실패할 때
**Then**: 시스템은 `NETWORK_ERROR` 코드와 함께 적절한 메시지를 반환해야 한다

```typescript
// Given
mockFetch.mockImplementation(() => {
  throw new TypeError('Failed to fetch');
});

// When
const result = await store.testConnection(projectId, 'openai');

// Then
expect(result.success).toBe(false);
expect(result.status).toBe('error');
expect(result.error?.code).toBe('NETWORK_ERROR');
expect(result.error?.message).toBe('네트워크 연결에 실패했습니다');
expect(result.error?.suggestion).toBe('인터넷 연결을 확인하고 다시 시도하세요');
```

**Edge Cases**:
- DNS 해결 실패: `NETWORK_ERROR`
- 프록시 오류: `NETWORK_ERROR`

---

### Scenario 8: API 할당량 초과 처리

**Given**: 프로바이더가 `testing` 상태이고 API 할당량을 초과했다
**When**: 연결 테스트 요청이 HTTP 429를 반환할 때
**Then**: 시스템은 `QUOTA_EXCEEDED` 코드와 함께 할당량 관련 메시지를 반환해야 한다

```typescript
// Given
mockConnectionTest.mockResolvedValue({
  success: false,
  status: 'error',
  error: {
    code: 'QUOTA_EXCEEDED',
    message: 'API 사용 한도를 초과했습니다',
    suggestion: '요금제를 확인하거나 나중에 다시 시도하세요',
    technical: 'HTTP 429: Rate limit exceeded'
  },
  timestamp: new Date().toISOString()
});

// When
const result = await store.testConnection(projectId, 'openai');

// Then
expect(result.success).toBe(false);
expect(result.error?.code).toBe('QUOTA_EXCEEDED');
expect(result.error?.message).toContain('한도');
```

**Edge Cases**:
- 무료 계정 한도 초과: 동일한 에러
- 유료 계정 한도 초과: 동일한 에러

---

### Scenario 9: 연결 상태 전환 (connected -> testing -> connected)

**Given**: 프로바이더가 `connected` 상태이다
**When**: 사용자가 연결 테스트를 다시 실행하고 성공할 때
**Then**: 상태 전환은 `connected` -> `testing` -> `connected`로 이루어져야 한다

```typescript
// Given
const initialState = createMockProvider({ connectionStatus: 'connected' });
store.setState({
  settings: { providers: [initialState] },
  testingProvider: null
});

// When - Step 1: testing 상태로 변경
const testPromise = store.testConnection(projectId, 'openai');

// 첫 번째 상태 업데이트 확인
expect(store.getState().testingProvider).toBe('openai');

// When - Step 2: 성공 완료
await testPromise;

// Then - 최종 상태 확인
const finalSettings = await store.getState().settings;
const openaiSettings = finalSettings?.providers.find(p => p.provider === 'openai');
expect(openaiSettings?.connectionStatus).toBe('connected');
expect(store.getState().testingProvider).toBeNull();
```

---

## Edge Cases & Additional Scenarios

### EC-1: LMStudio 프로바이더 (API 키 없음)

**Given**: LMStudio 프로바이더가 설정되어 있고 API 키가 없다
**When**: 연결 테스트를 실행할 때
**Then**: 로컬 엔드포인트 연결 테스트를 실행해야 한다

```typescript
// Given
const provider = createMockProvider({
  provider: 'lmstudio',
  connectionStatus: 'untested',
  apiKey: '',
  endpoint: 'http://localhost:1234/v1'
});

// When
const result = await store.testConnection(projectId, 'lmstudio');

// Then - API 키 오류가 아님
expect(result.error?.code).not.toBe('API_KEY_MISSING');
```

### EC-2: Claude Code 프로바이더 (기본)

**Given**: Claude Code 프로바이더가 설정되어 있다
**When**: 연결 테스트를 실행할 때
**Then**: 항상 성공해야 한다 (내장 프로바이더)

```typescript
// Given
const provider = createMockProvider({
  provider: 'claude-code',
  connectionStatus: 'untested',
  apiKey: ''
});

// When
const result = await store.testConnection(projectId, 'claude-code');

// Then
expect(result.success).toBe(true);
expect(result.status).toBe('connected');
```

### EC-3: 여러 프로바이더 동시 테스트

**Given**: 여러 프로바이더가 설정되어 있다
**When**: 사용자가 서로 다른 프로바이더를 동시에 테스트할 때
**Then**: 각 테스트는 독립적으로 실행되어야 한다

```typescript
// Given
const providers = ['openai', 'gemini', 'claude-code'] as const;

// When - 동시에 모두 테스트
const results = await Promise.all(
  providers.map(p => store.testConnection(projectId, p))
);

// Then - 모든 테스트가 완료됨
expect(results).toHaveLength(3);
results.forEach(result => {
  expect(result).toBeDefined();
  expect(result.status).toBeDefined();
});
```

### EC-4: 설정 변경 중 테스트

**Given**: 프로바이더가 `testing` 상태이다
**When**: 사용자가 API 키를 변경할 때
**Then**: 진행 중인 테스트가 완료된 후 변경사항이 적용되어야 한다

---

## Success Criteria

### Functional Requirements

| # | Criteria | Verification Method |
|---|----------|---------------------|
| 1 | testing 상태가 모든 연결 테스트에 표시됨 | Automated Test |
| 2 | 연결 성공 시 connected 상태로 변경 | Automated Test |
| 3 | connected -> 실패 시 disconnected 상태로 변경 | Automated Test |
| 4 | untested -> 실패 시 error 상태로 변경 | Automated Test |
| 5 | 모든 에러가 에러 코드와 메시지, 제안을 포함 | Automated Test |
| 6 | 중복 테스트 요청이 방지됨 | Automated Test |
| 7 | 타임아웃이 10초로 설정되고 작동함 | Automated Test |
| 8 | 지연 시간(latency)이 기록됨 | Automated Test |

### Non-Functional Requirements

| # | Criteria | Target |
|---|----------|--------|
| 1 | 연결 테스트 응답 시간 | < 10s (timeout) |
| 2 | 테스트 커버리지 | > 90% |
| 3 | 에러 메시지 명확성 | 모든 에러에 해결 제안 포함 |
| 4 | UI 반응성 | 상태 변경이 즉시 표시됨 |

---

## Testing Checklist

### Unit Tests

- [ ] `ConnectionStatus` 타입에 `testing`이 포함됨
- [ ] `isValidConnectionStatus()` 함수가 모든 상태를 인식
- [ ] `ConnectionTestResult` 인터페이스가 새 필드 포함
- [ ] 에러 분류 로직이 모든 에러 타입을 처리

### Integration Tests

- [ ] 연결 테스트 전체 흐름 (untested -> testing -> connected)
- [ ] 연결 실패 흐름 (connected -> testing -> disconnected)
- [ ] 설정 오류 흐름 (untested -> testing -> error)
- [ ] 중복 요청 방지
- [ ] 타임아웃 처리
- [ ] 네트워크 오류 처리
- [ ] API 인증 오류 처리
- [ ] 할당량 초과 처리

### UI Tests

- [ ] testing 상태 시 로딩 표시기 표시
- [ ] connected 상태 시 녹색 배지 표시
- [ ] disconnected 상태 시 주황색 배지 표시
- [ ] error 상태 시 적색 배지 및 에러 메시지 표시
- [ ] 지연 시간 표시
- [ ] 에러 메시지와 해결 제안 표시

### Manual Testing

- [ ] OpenAI 프로바이더 연결 테스트
- [ ] Gemini 프로바이더 연결 테스트
- [ ] LMStudio 프로바이더 연결 테스트
- [ ] Claude Code 프로바이더 연결 테스트
- [ ] 잘못된 API 키 입력 시 에러 메시지 확인
- [ ] 네트워크 연결 끊김 시 에러 메시지 확인

---

## Definition of Done

각 구현 항목은 다음 조건을 만족해야 "완료"로 간주됩니다:

1. **코드 구현**: 요구사항이 코드로 구현되고 PR이 제출됨
2. **테스트 통과**: 모든 관련 테스트가 통과함
3. **코드 리뷰**: 최소 1명의 리뷰어 승인을 받음
4. **문서화**: API 문서가 업데이트됨 (필요한 경우)
5. **회귀 없음**: 기존 기능에 영향이 없음을 확인함
