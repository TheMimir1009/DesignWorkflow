---
spec_id: SPEC-DEBUG-003
title: LLM Logger API Integration - Acceptance Criteria
category: debug
priority: high
status: draft
created_at: 2026-01-12
updated_at: 2026-01-12
author: alfred
version: 1.0.0
---

# SPEC-DEBUG-003: Acceptance Criteria

## Overview

이 문서는 SPEC-DEBUG-003 (LLM Logger API Integration)의 인수 기준(Acceptance Criteria)을 정의합니다. 각 기능은 Given-When-Then 형식의 시나리오로 검증됩니다.

## Acceptance Test Scenarios

### Scenario 1: OpenAI API 호출 시 로깅

**Given**: 사용자가 OpenAI Provider를 선택하고 모델을 gpt-4로 설정함

**When**: 사용자가 Generate API를 호출하여 LLM 생성을 요청함

**Then**: 다음 정보가 Debug Console에 표시됨
- Provider: "openai"
- Model: "gpt-4"
- Prompt Tokens: 실제 사용량 (예: 150)
- Completion Tokens: 실제 사용량 (예: 50)
- Total Tokens: 200
- Estimated Cost: 계산된 비용 (예: $0.006)
- Duration: API 호출 시간 (ms)

### Scenario 2: Gemini API 호출 시 로깅

**Given**: 사용자가 Gemini Provider를 선택하고 모델을 gemini-pro로 설정함

**When**: 사용자가 Generate API를 호출하여 LLM 생성을 요청함

**Then**: 다음 정보가 Debug Console에 표시됨
- Provider: "gemini"
- Model: "gemini-pro"
- Prompt Tokens: 실제 사용량
- Completion Tokens: 실제 사용량
- Total Tokens: 합계
- Duration: API 호출 시간 (ms)

### Scenario 3: API 호출 실패 시 에러 로깅

**Given**: 사용자가 유효하지 않은 API 키로 설정함

**When**: 사용자가 Generate API를 호출함

**Then**: 다음 에러 정보가 Debug Console에 표시됨
- Error: true 표시
- Error Message: "Invalid API key" 또는 적절한 에러 메시지
- Provider: 시도한 Provider 이름
- Model: 시도한 모델 이름
- Duration: 실패까지 걸린 시간

### Scenario 4: API 키 보안

**Given**: 사용자가 API 키를 설정하고 LLM API를 호출함

**When**: 로그가 생성되고 Debug Console에 표시됨

**Then**:
- 로그 어디에도 원시 API 키가 포함되지 않음
- API 키가 마스킹되어 표시됨 (예: sk-***xyz)
- 로그 저장소에 API 키 없음

### Scenario 5: 디버그 모드 비활성화 시

**Given**: 사용자가 디버그 모드를 비활성화함 (debugStore.isDebugEnabled = false)

**When**: 사용자가 Generate API를 호출함

**Then**:
- 서버는 여전히 로깅을 수행함
- API 응답에 debug.llm 객체가 포함되지 않음
- Debug Console에 LLM 정보가 표시되지 않음

### Scenario 6: 디버그 모드 활성화 시

**Given**: 사용자가 디버그 모드를 활성화함 (debugStore.isDebugEnabled = true)

**When**: 사용자가 Generate API를 호출함

**Then**:
- 서버가 로깅을 수행함
- API 응답에 debug.llm 객체가 포함됨
- Debug Console에 LLM 정보가 표시됨

### Scenario 7: 연속 호출 시 로그 축적

**Given**: 사용자가 디버그 모드를 활성화함

**When**: 사용자가 3번 연속으로 Generate API를 호출함

**Then**:
- 각 호출이 별도 로그 엔트리로 기록됨
- Debug Console에 3개의 LLM 로그 항목이 표시됨
- 각 로그에는 고유한 ID와 타임스탬프가 있음

### Scenario 8: 로그 지우기

**Given**: Debug Console에 여러 LLM 로그가 표시됨

**When**: 사용자가 "Clear Logs" 버튼을 클릭함

**Then**:
- Debug Console에서 모든 LLM 로그가 제거됨
- debugStore.llmLogs 배열이 비어 있음

### Scenario 9: ClaudeCode Provider 로깅

**Given**: 사용자가 ClaudeCode Provider를 선택함

**When**: 사용자가 Generate API를 호출하여 Claude Code를 실행함

**Then**: 다음 정보가 Debug Console에 표시됨
- Provider: "claude-code"
- Model: 사용된 모델 (예: "claude-opus-4-5")
- 사용된 도구 목록 (있는 경우)
- 실행 결과 요약
- Duration: 총 실행 시간

### Scenario 10: 성능 오버헤드 검증

**Given**: LLM Logger가 활성화됨

**When**: 100번의 LLM API 호출을 수행함

**Then**:
- 평균 로깅 오버헤드가 10ms 미만임
- API 응답 시간이 로거 없을 때와 크게 다르지 않음 (오차 범위 5% 이내)

## Technical Acceptance Criteria

### TAC-1: Logger Module

- [ ] LLMLogger 클래스가 올바르게 구현됨
- [ ] logRequest(), logResponse(), logError() 메서드가 동작함
- [ ] getLogs()로 로그 조회 가능
- [ ] clearLogs()로 로그 삭제 가능
- [ ] 단위 테스트 커버리지 85% 이상

### TAC-2: BaseHTTPProvider Integration

- [ ] 모든 HTTP 요청이 로깅됨
- [ ] 요청/응답 시간이 정확히 기록됨 (1ms 단위)
- [ ] 에러가 올바르게 로깅됨
- [ ] 기존 기능에 회귀 없음

### TAC-3: Provider-specific Logging

- [ ] OpenAI Provider에서 토큰 사용량 추출 가능
- [ ] Gemini Provider에서 토큰 사용량 추출 가능
- [ ] LMStudio Provider에서 모델 정보 추출 가능
- [ ] ClaudeCode Provider에서 실행 정보 추출 가능

### TAC-4: API Response Format

- [ ] API 응답에 debug.llm 객체 포함됨 (디버그 모드 시)
- [ ] debug.llm 객체에 필수 필드 포함됨
- [ ] 디버그 모드 비활성화 시 debug.llm 미포함

### TAC-5: Client-side Handling

- [ ] API 응답에서 디버그 정보 추출 가능
- [ ] DebugStore에 정보 전달 가능
- [ ] Debug Console에 LLM 정보 표시됨
- [ ] 토큰 사용량 포맷팅됨

### TAC-6: Security

- [ ] 원시 API 키가 로그에 포함되지 않음
- [ ] 민감한 사용자 데이터가 로그에 포함되지 않음
- [ ] 디버그 정보는 인증된 사용자만 접근 가능

### TAC-7: Performance

- [ ] 로깅 오버헤드 < 10ms
- [ ] 비동기 로깅으로 메인 스레드 차단 방지
- [ ] 메모리 사용량이 제한됨 (로그 순환)

## Test Cases

### Unit Tests

#### llmLogger.test.ts

```typescript
describe('LLMLogger', () => {
  it('should log request with correct fields')
  it('should log response with token usage')
  it('should log error with message')
  it('should retrieve all logs')
  it('should clear all logs')
  it('should handle concurrent logging')
})
```

#### base.test.ts

```typescript
describe('BaseHTTPProvider', () => {
  it('should log request before API call')
  it('should log response after API call')
  it('should log error on API failure')
  it('should measure request duration accurately')
})
```

#### llmClientLogger.test.ts

```typescript
describe('LLMClientLogger', () => {
  it('should extract debug info from response')
  it('should format token usage')
  it('should calculate estimated cost')
  it('should update debug store')
})
```

### Integration Tests

#### generate.test.ts

```typescript
describe('Generate API', () => {
  it('should include debug info when debug mode enabled')
  it('should not include debug info when debug mode disabled')
  it('should handle multiple consecutive calls')
  it('should handle API errors gracefully')
})
```

## Exit Criteria

다음 조건이 모두 충족될 때 SPEC-DEBUG-003이 완료로 간주됩니다:

1. [ ] 모든 단위 테스트 통과 (커버리지 85% 이상)
2. [ ] 모든 통합 테스트 통과
3. [ ] 모든 인수 시나리오 (Scenario 1-10) 통과
4. [ ] 모든 기술적 인수 기준 (TAC 1-7) 충족
5. [ ] Debug Console에 LLM 정보 실시간 표시
6. [ ] API 키 보안 확인
7. [ ] 성능 기준 충족 (오버헤드 < 10ms)
8. [ ] 코드 리뷰 완료 및 승인
9. [ ] 사용자 매뉴얼 업데이트

## Sign-off

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 개발자 | Alfred | | |
| 코드 리뷰어 | | | |
| QA 엔지니어 | | | |
| 제품 오너 | | | |
