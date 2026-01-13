# SPEC-DEBUG-005: Acceptance Criteria

## Overview

이 문서는 API Error Handling & Response Standardization의 인수 기준(Acceptance Criteria)을 정의합니다.

---

## Test Scenarios

### Scenario 1: Q&A 세션 조회 (404 → 200)

**Given**: 존재하는 Task가 있다
**When**: 클라이언트가 `GET /api/tasks/:taskId/qa`를 요청하고 Q&A 세션이 존재하지 않을 때
**Then**: HTTP 200 OK와 함께 `data: null`을 반환한다

```typescript
// Given
const task = await createTask({ title: 'Test Task' });
const taskId = task.id;

// When
const response = await request(app)
  .get(`/api/tasks/${taskId}/qa`)
  .expect(200);

// Then
expect(response.body).toEqual({
  success: true,
  data: null,
  error: null
});
```

**Edge Cases**:
- Task가 존재하지 않을 때: 404 Not Found 반환
- 세션이 존재할 때: 200 OK + 세션 데이터 반환

---

### Scenario 2: Q&A 세션 저장 (자동 생성)

**Given**: 존재하는 Task가 있고 Q&A 세션이 존재하지 않는다
**When**: 클라이언트가 `POST /api/tasks/:taskId/qa`로 답변을 저장 요청할 때
**Then**: 새 Q&A 세션이 자동 생성되고 200 OK를 반환한다

```typescript
// Given
const task = await createTask({ title: 'Test Task' });
const answers = [
  { questionId: 'q1', answer: 'Yes', answeredAt: new Date().toISOString() }
];

// When
const response = await request(app)
  .post(`/api/tasks/${task.id}/qa`)
  .send({
    category: 'game_mechanic',
    answers: answers,
    currentStep: 1
  })
  .expect(200);

// Then
expect(response.body.success).toBe(true);
expect(response.body.data.sessionId).toBeDefined();
expect(response.body.data.session.answers).toEqual(answers);
```

**Edge Cases**:
- 잘못된 category: 400 Bad Request
- Task가 존재하지 않을 때: 404 Not Found

---

### Scenario 3: LLM Provider 누락 (400 with guidance)

**Given**: Task가 존재하고 LLM provider가 설정되지 않은 프로젝트에 속해 있다
**When**: 클라이언트가 `POST /api/tasks/:taskId/trigger-ai`로 PRD 생성을 요청할 때
**Then**: HTTP 400 Bad Request와 명확한 에러 메시지를 반환한다

```typescript
// Given
const project = await createProject({ name: 'Test Project' });
const task = await createTask({
  title: 'Test Task',
  projectId: project.id,
  designDocument: '# Test Design Document'
});
// LLM settings가 설정되지 않은 상태

// When
const response = await request(app)
  .post(`/api/tasks/${task.id}/trigger-ai`)
  .send({ targetStatus: 'prd' })
  .expect(400);

// Then
expect(response.body).toEqual({
  success: false,
  error: expect.stringContaining('LLM'),
  errorCode: 'LLM_CONFIG_MISSING',
  details: {
    action: 'configure_llm',
    guidance: expect.any(String)
  }
});
```

**Edge Cases**:
- LLM API 키 만료: 400 또는 500 (공급자별 처리)
- 지원하지 않는 모델: 400 Bad Request

---

### Scenario 4: AI 생성 시간초과 (504)

**Given**: Task가 존재하고 Design Document가 있다
**When**: LLM API 응답이 시간 초과될 때
**Then**: HTTP 504 Gateway Timeout을 반환한다

```typescript
// Given
const task = await createTask({
  title: 'Test Task',
  designDocument: '# Test'
});
// Mock timeout scenario
mockLLMProvider.mockImplementationOnce(() => {
  throw new TimeoutError('Request timeout');
});

// When
const response = await request(app)
  .post(`/api/tasks/${task.id}/trigger-ai`)
  .send({ targetStatus: 'prd' })
  .expect(504);

// Then
expect(response.body).toEqual({
  success: false,
  error: expect.stringContaining('timeout'),
  errorCode: 'AI_GENERATION_TIMEOUT'
});
```

**Edge Cases**:
- 네트워크 오류: 500 Internal Server Error
- LLM 서비스 다운: 502 Bad Gateway 또는 503 Service Unavailable

---

### Scenario 5: 선행 문서 누락 (400 with guidance)

**Given**: Task가 존재하지만 Design Document가 없다
**When**: 클라이언트가 `POST /api/tasks/:taskId/trigger-ai`로 PRD 생성을 요청할 때
**Then**: HTTP 400 Bad Request와 명확한 안내 메시지를 반환한다

```typescript
// Given
const task = await createTask({
  title: 'Test Task'
  // designDocument is null
});

// When
const response = await request(app)
  .post(`/api/tasks/${task.id}/trigger-ai`)
  .send({ targetStatus: 'prd' })
  .expect(400);

// Then
expect(response.body).toEqual({
  success: false,
  error: 'Design Document is required to generate PRD',
  errorCode: 'PREREQUISITE_MISSING',
  details: {
    field: 'designDocument',
    action: 'complete_design',
    guidance: 'Complete the Q&A session to generate Design Document first'
  }
});
```

**Edge Cases**:
- PRD 없이 Prototype 생성: 400 with PRD required message
- 이미 문서가 존재할 때: 덮어쓰기 또는 409 Conflict

---

## Edge Cases & Additional Scenarios

### EC-1: 잘못된 Task ID (UUID 형식 오류)

**Given**: 잘못된 형식의 Task ID가 있다
**When**: 어떤 Task 관련 API를 요청할 때
**Then**: 400 Bad Request 또는 404 Not Found를 반환한다

### EC-2: 필수 필드 누락

**Given**: 유효한 Task가 있다
**When**: 필수 필드가 누락된 요청을 보낼 때
**Then**: 400 Bad Request와 누락된 필드 정보를 반환한다

```typescript
// Missing targetStatus
const response = await request(app)
  .post(`/api/tasks/${task.id}/trigger-ai`)
  .send({}) // No targetStatus
  .expect(400);

expect(response.body.error).toContain('Target status is required');
```

### EC-3: 잘못된 상태 값

**Given**: 유효한 Task가 있다
**When**: 유효하지 않은 targetStatus 값을 보낼 때
**Then**: 400 Bad Request와 유효한 값 목록을 반환한다

```typescript
const response = await request(app)
  .post(`/api/tasks/${task.id}/trigger-ai`)
  .send({ targetStatus: 'invalid_status' })
  .expect(400);

expect(response.body.error).toContain('Must be one of');
```

### EC-4: 중복 요청 처리

**Given**: AI 생성이 진행 중인 Task가 있다
**When**: 동일한 Task에 대해 다른 AI 생성을 요청할 때
**Then**: 409 Conflict 또는 적절한 상태 코드를 반환한다

---

## Success Criteria

### Functional Requirements

| # | Criteria | Verification Method |
|---|----------|---------------------|
| 1 | Q&A 세션 미존재 시 200 + null 반환 | Automated Test |
| 2 | Q&A 세션 자동 생성 | Automated Test |
| 3 | LLM 설정 누락 시 400 반환 | Automated Test |
| 4 | AI 생성 시간초과 시 504 반환 | Automated Test |
| 5 | 선행 문서 누락 시 400 + 가이드 반환 | Automated Test |
| 6 | 모든 에러 응답이 표준 형식 따름 | Automated Test |
| 7 | 에러 코드가 정확히 매핑됨 | Automated Test |

### Non-Functional Requirements

| # | Criteria | Target |
|---|----------|--------|
| 1 | 에러 응답 시간 | < 100ms |
| 2 | 에러 로깅覆盖率 | 100% |
| 3 | 테스트 커버리지 | > 90% |
| 4 | API 문서 업데이트 | All endpoints documented |

---

## Testing Checklist

### Unit Tests

- [ ] `errorBuilder.ts`: 모든 에러 빌더 함수
- [ ] `response.ts`: 확장된 에러 응답 함수
- [ ] 에러 코드 상수 검증

### Integration Tests

- [ ] Q&A 엔드포인트 에러 처리
- [ ] Tasks AI 생성 엔드포인트 에러 처리
- [ ] 타임아웃 시나리오
- [ ] LLM provider 오류 시나리오

### Manual Testing

- [ ] 클라이언트 UI에서 에러 메시지 표시 확인
- [ ] 다양한 에러 코드에 대한 사용자 경험 검증
- [ ] 에러 발생 후 복구 절차 테스트

---

## Definition of Done

각 구현 항목은 다음 조건을 만족해야 "완료"로 간주됩니다:

1. **코드 구현**: 요구사항이 코드로 구현되고 PR이 제출됨
2. **테스트 통과**: 모든 관련 테스트가 통과함
3. **코드 리뷰**: 최소 1명의 리뷰어 승인을 받음
4. **문서화**: API 문서가 업데이트됨 (필요한 경우)
5. **회귀 없음**: 기존 기능에 영향이 없음을 확인함
