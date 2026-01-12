# SPEC-LLM-002: Acceptance Criteria

## Overview

이 문서는 LLM 연결 테스트 로깅 시스템의 인수 기준(Acceptance Criteria)을 정의합니다.

---

## Test Scenarios

### Scenario 1: 연결 테스트 시작 로깅

**Given**: 프로바이더가 설정되어 있고 프로젝트 ID가 존재한다
**When**: 연결 테스트가 시작될 때
**Then**: 시스템은 시작 로그를 기록해야 한다

```typescript
// Given
const provider = createMockProvider({ connectionStatus: 'untested' });
const projectId = 'test-project-1';
const logger = new LLMLogger();

// When
await provider.testConnection(projectId);

// Then
const connectionTestLogs = logger.getConnectionTestLogs();
expect(connectionTestLogs).toHaveLength(1);

const startLog = connectionTestLogs[0];
expect(startLog.request?.parameters).toHaveProperty('type', 'connection-test');
expect(startLog.request?.parameters).toHaveProperty('phase', 'start');
expect(startLog.request?.parameters).toHaveProperty('projectId', projectId);
```

**Edge Cases**:
- 프로젝트 ID가 없는 경우: 로깅 건너뜀 (선택적 매개변수)
- 로거가 없는 경우: 오류 없이 처리

---

### Scenario 2: 연결 테스트 성공 로깅

**Given**: 연결 테스트가 시작되었고 API 연결이 성공한다
**When**: 연결 테스트가 완료될 때
**Then**: 시스템은 성공 로그를 모델 정보와 함께 기록해야 한다

```typescript
// Given
const provider = createMockProvider({
  connectionStatus: 'testing',
  apiKey: 'valid-api-key'
});
const projectId = 'test-project-1';
const logger = new LLMLogger();
const testId = 'test-openai-123';

// When
await provider.testConnection(projectId);

// Then
const connectionTestLogs = logger.getConnectionTestLogs();
const successLog = connectionTestLogs.find(log =>
  log.request?.parameters?.phase === 'success'
);

expect(successLog).toBeDefined();
expect(successLog?.response?.content).toContain('models');
expect(successLog?.metrics?.duration_ms).toBeGreaterThan(0);

const params = successLog?.request?.parameters as Record<string, unknown>;
expect(params).toHaveProperty('modelCount');
expect(params).toHaveProperty('models');
expect(Array.isArray(params?.models)).toBe(true);
```

**Edge Cases**:
- 모델 목록이 비어있는 경우: modelCount는 0
- 지연 시간이 0인 경우: 정상 처리

---

### Scenario 3: 연결 테스트 실패 로깅

**Given**: 연결 테스트가 시작되었고 API 연결이 실패한다
**When**: 연결 테스트가 실패할 때
**Then**: 시스템은 실패 로그를 에러 정보와 함께 기록해야 한다

```typescript
// Given
const provider = createMockProvider({
  connectionStatus: 'testing',
  apiKey: 'invalid-api-key'
});
const projectId = 'test-project-1';
const logger = new LLMLogger();

// When
await provider.testConnection(projectId);

// Then
const connectionTestLogs = logger.getConnectionTestLogs();
const failureLog = connectionTestLogs.find(log =>
  log.request?.parameters?.phase === 'failure'
);

expect(failureLog).toBeDefined();
expect(failureLog?.error).toBeDefined();
expect(failureLog?.error?.code).toBeDefined();
expect(failureLog?.error?.message).toBeDefined();

const params = failureLog?.request?.parameters as Record<string, unknown>;
expect(params).toHaveProperty('suggestion');
```

**Edge Cases**:
- 네트워크 오류: NETWORK_ERROR 코드
- 타임아웃: TIMEOUT 코드
- 인증 실패: AUTHENTICATION_FAILED 코드

---

### Scenario 4: 연결 테스트 로그 필터링

**Given**: 일반 API 로그와 연결 테스트 로그가 혼재되어 있다
**When**: `getConnectionTestLogs()`를 호출할 때
**Then**: 시스템은 연결 테스트 로그만 반환해야 한다

```typescript
// Given
const logger = new LLMLogger();

// 일반 API 로그 추가
logger.logRequest({
  id: 'req-1',
  provider: 'openai',
  model: 'gpt-4o',
  request: {
    prompt: 'Hello'
  }
});

// 연결 테스트 로그 추가
logger.logConnectionTestStart({
  id: 'test-1',
  timestamp: new Date().toISOString(),
  projectId: 'project-1',
  provider: 'openai',
  startedAt: new Date().toISOString()
});

// When
const allLogs = logger.getLogs();
const connectionTestLogs = logger.getConnectionTestLogs();

// Then
expect(allLogs.length).toBeGreaterThan(connectionTestLogs.length);
expect(connectionTestLogs).toHaveLength(1);
expect(connectionTestLogs[0].id).toBe('test-1');
```

---

### Scenario 5: 디버그 API로 연결 테스트 로그 조회

**Given**: 연결 테스트 로그가 존재한다
**When**: GET `/api/debug/logs/connection-tests`를 요청할 때
**Then**: 시스템은 연결 테스트 로그 목록을 반환해야 한다

```typescript
// Given
const logger = getSharedLogger();
logger.logConnectionTestStart({
  id: 'test-1',
  timestamp: '2026-01-12T00:00:00.000Z',
  projectId: 'project-1',
  provider: 'openai',
  startedAt: '2026-01-12T00:00:00.000Z'
});

// When
const response = await fetch('/api/debug/logs/connection-tests');
const json = await response.json();

// Then
expect(json.success).toBe(true);
expect(json.data).toBeInstanceOf(Array);
expect(json.data.length).toBeGreaterThan(0);
expect(json.data[0]).toHaveProperty('type', 'connection-test');
```

---

### Scenario 6: 프로바이더별 연결 테스트 로그 필터링

**Given**: 여러 프로바이더의 연결 테스트 로그가 존재한다
**When**: GET `/api/debug/logs/connection-tests/:provider`를 요청할 때
**Then**: 시스템은 해당 프로바이더의 로그만 반환해야 한다

```typescript
// Given
const logger = getSharedLogger();

logger.logConnectionTestStart({
  id: 'test-openai-1',
  timestamp: '2026-01-12T00:00:00.000Z',
  projectId: 'project-1',
  provider: 'openai',
  startedAt: '2026-01-12T00:00:00.000Z'
});

logger.logConnectionTestStart({
  id: 'test-gemini-1',
  timestamp: '2026-01-12T00:00:01.000Z',
  projectId: 'project-1',
  provider: 'gemini',
  startedAt: '2026-01-12T00:00:01.000Z'
});

// When
const response = await fetch('/api/debug/logs/connection-tests/openai');
const json = await response.json();

// Then
expect(json.success).toBe(true);
expect(json.data).toHaveLength(1);
expect(json.data[0].provider).toBe('openai');
```

---

### Scenario 7: 연결 테스트 로그 로테이션

**Given**: 연결 테스트 로그가 최대 용량(1000개)에 도달했다
**When**: 새로운 연결 테스트 로그가 추가될 때
**Then**: 시스템은 가장 오래된 로그를 제거하고 새 로그를 추가해야 한다

```typescript
// Given
const logger = new LLMLogger();
// Fill logger to max capacity
for (let i = 0; i < 1000; i++) {
  logger.logRequest({
    id: `req-${i}`,
    provider: 'openai',
    model: 'gpt-4o'
  });
}

const logCountBefore = logger.getLogs().length;

// When
logger.logConnectionTestStart({
  id: 'test-new',
  timestamp: new Date().toISOString(),
  projectId: 'project-1',
  provider: 'openai',
  startedAt: new Date().toISOString()
});

// Then
const logCountAfter = logger.getLogs().length;
expect(logCountAfter).toBe(1000); // Still 1000
expect(logger.getLogs()[0].id).not.toBe('req-0'); // Oldest log removed
```

---

### Scenario 8: 연결 테스트 시작-성능 로그 연결

**Given**: 연결 테스트가 시작되었다
**When**: 연결 테스트가 성공으로 완료될 때
**Then**: 시스템은 동일한 ID로 시작 로그와 성공 로그를 연결해야 한다

```typescript
// Given
const provider = createMockProvider({ connectionStatus: 'untested' });
const projectId = 'test-project-1';
const logger = new LLMLogger();

// When
await provider.testConnection(projectId);

// Then
const connectionTestLogs = logger.getConnectionTestLogs();

// 같은 ID를 가진 로그가 하나만 있어야 함 (업데이트됨)
const uniqueIds = new Set(connectionTestLogs.map(log => log.id));
expect(uniqueIds.size).toBe(1);

// 업데이트된 로그에는 성공 정보가 있어야 함
const log = connectionTestLogs[0];
expect(log.response).toBeDefined();
expect(log.metrics).toBeDefined();
```

---

### Scenario 9: 로깅 실패 시 연결 테스트 계속 진행

**Given**: 로거에 오류가 발생할 수 있는 상태이다
**When**: 연결 테스트가 실행될 때
**Then**: 로깅 실패와 관계없이 연결 테스트는 계속 진행되어야 한다

```typescript
// Given
const provider = createMockProvider({ connectionStatus: 'untested' });
const logger = new LLMLogger();

// 로깅 메서드를 오류 throw하도록 수정
jest.spyOn(logger, 'logConnectionTestStart').mockImplementation(() => {
  throw new Error('Logging failed');
});

// When - 로깅 오류가 발생해도 테스트는 계속됨
const result = await provider.testConnection('project-1');

// Then - 테스트 결과는 정상 반환됨
expect(result).toBeDefined();
expect(result.success).toBeDefined();
```

---

## Edge Cases & Additional Scenarios

### EC-1: 프로젝트 ID가 없는 연결 테스트

**Given**: 연결 테스트가 프로젝트 ID 없이 호출된다
**When**: 연결 테스트가 실행될 때
**Then**: 로깅은 건너뛰고 테스트는 정상 실행된다

```typescript
// Given
const provider = createMockProvider({ connectionStatus: 'untested' });
const logger = new LLMLogger();

// When - 프로젝트 ID 없이 호출
const result = await provider.testConnection();

// Then - 테스트는 정상 실행
expect(result.success).toBeDefined();
```

### EC-2: 여러 연결 테스트 동시 실행

**Given**: 여러 프로바이더에서 동시에 연결 테스트가 실행된다
**When**: 모든 테스트가 완료될 때
**Then**: 각 테스트의 로그가 개별적으로 기록되어야 한다

```typescript
// Given
const providers = [
  createMockProvider({ provider: 'openai' }),
  createMockProvider({ provider: 'gemini' }),
  createMockProvider({ provider: 'lmstudio' })
];

// When - 동시에 테스트 실행
await Promise.all(providers.map(p => p.testConnection('project-1')));

// Then - 각 테스트 로그가 존재
const connectionTestLogs = logger.getConnectionTestLogs();
expect(connectionTestLogs.length).toBeGreaterThanOrEqual(3);
```

### EC-3: 빈 모델 목록 반환

**Given**: 연결 테스트가 성공하지만 사용 가능한 모델이 없다
**When**: 연결 테스트가 완료될 때
**Then**: 성공 로그에 빈 모델 목록과 modelCount 0이 기록되어야 한다

```typescript
// Given
const provider = createMockProvider({
  connectionStatus: 'connected',
  models: [] // 빈 모델 목록
});

// When
const result = await provider.testConnection('project-1');

// Then
const connectionTestLogs = logger.getConnectionTestLogs();
const successLog = connectionTestLogs.find(log =>
  log.request?.parameters?.phase === 'success'
);

const params = successLog?.request?.parameters as Record<string, unknown>;
expect(params?.modelCount).toBe(0);
expect(params?.models).toEqual([]);
```

---

## Success Criteria

### Functional Requirements

| # | Criteria | Verification Method |
|---|----------|---------------------|
| 1 | 연결 테스트 시작 시 로그가 기록됨 | Automated Test |
| 2 | 연결 테스트 성공 시 모델 정보와 함께 로그가 기록됨 | Automated Test |
| 3 | 연결 테스트 실패 시 에러 정보와 함께 로그가 기록됨 | Automated Test |
| 4 | getConnectionTestLogs()로 연결 테스트 로그만 필터링 가능 | Automated Test |
| 5 | GET /api/debug/logs/connection-tests 엔드포인트가 로그를 반환함 | Automated Test |
| 6 | GET /api/debug/logs/connection-tests/:provider로 프로바이더 필터링 가능 | Automated Test |
| 7 | 로그 로테이션이 정상 작동함 | Automated Test |
| 8 | 로깅 실패 시 테스트가 계속 진행됨 | Automated Test |

### Non-Functional Requirements

| # | Criteria | Target |
|---|----------|--------|
| 1 | 로깅으로 인한 성능 영향 | < 10ms 추가 지연 |
| 2 | 로그 조회 응답 시간 | < 100ms |
| 3 | 테스트 커버리지 | > 90% |
| 4 | 로그 데이터 크기 | < 1KB per entry |

---

## Testing Checklist

### Unit Tests

- [ ] `logConnectionTestStart()` 메서드가 시작 로그를 기록함
- [ ] `logConnectionTestSuccess()` 메서드가 성공 로그를 기록함
- [ ] `logConnectionTestFailure()` 메서드가 실패 로그를 기록함
- [ ] `getConnectionTestLogs()`가 연결 테스트 로그만 필터링함
- [ ] 로그가 기존 LLMLogEntry 구조와 호환됨

### Integration Tests

- [ ] 연결 테스트 시작-성공 전체 흐름 로깅
- [ ] 연결 테스트 시작-실패 전체 흐름 로깅
- [ ] 프로젝트 ID가 없을 때 처리
- [ ] 여러 프로바이더 동시 테스트 로깅
- [ ] 로그 로테이션 동작

### API Tests

- [ ] GET /api/debug/logs/connection-tests가 모든 연결 테스트 로그 반환
- [ ] GET /api/debug/logs/connection-tests/:provider가 필터링된 로그 반환
- [ ] 빈 로그 목록 시 빈 배열 반환
- [ ] 잘못된 프로바이더 시 빈 배열 반환

### UI Tests

- [ ] 디버그 콘솔에 연결 테스트 로그가 표시됨
- [ ] 연결 테스트 로그가 일반 API 로그와 구분되어 표시됨
- [ ] 성공 로그에 모델 정보가 표시됨
- [ ] 실패 로그에 에러 정보가 표시됨

---

## Definition of Done

각 구현 항목은 다음 조건을 만족해야 "완료"로 간주됩니다:

1. **코드 구현**: 요구사항이 코드로 구현되고 PR이 제출됨
2. **테스트 통과**: 모든 관련 테스트가 통과함
3. **코드 리뷰**: 최소 1명의 리뷰어 승인을 받음
4. **문서화**: API 문서가 업데이트됨 (필요한 경우)
5. **회귀 없음**: 기존 기능에 영향이 없음을 확인함
