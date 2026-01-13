# SPEC-DEBUG-004: Acceptance Criteria

## 1. Test Summary

| Category | Scenario Count | Coverage |
|----------|----------------|----------|
| Parameter Transmission (파라미터 전송) | 6 | 100% |
| Provider Selection (프로바이더 선택) | 4 | 100% |
| Backward Compatibility (하위 호환성) | 3 | 100% |
| Error Handling (에러 처리) | 3 | 100% |
| **Total** | **16** | **100%** |

---

## 2. Gherkin Scenarios

### 2.1 Parameter Transmission (파라미터 전송)

#### Scenario 1: Design Document 생성 시 projectId 전송
```gherkin
Feature: LLM Provider Parameter Transmission

  Scenario: 사용자가 Design Document를 생성할 때 projectId가 서버로 전송된다
    Given 사용자가 프로젝트 "project-123"를 선택한다
    And 사용자가 Design Document 생성을 위해 QA 응답을 작성한다
    When 사용자가 "Generate Design Document" 버튼을 클릭한다
    Then 시스템은 API 요청에 projectId "project-123"을 포함한다
    And 요청 본문에 { "projectId": "project-123" }이 포함된다
```

#### Scenario 2: PRD 생성 시 projectId와 taskId 전송
```gherkin
  Scenario: 사용자가 PRD를 생성할 때 projectId와 taskId가 서버로 전송된다
    Given 사용자가 프로젝트 "project-456"를 선택한다
    And 사용자가 태스크 "task-789"를 선택한다
    And 사용자가 Design Document 내용을 입력한다
    When 사용자가 "Generate PRD" 버튼을 클릭한다
    Then 시스템은 API 요청에 projectId "project-456"을 포함한다
    And 시스템은 API 요청에 taskId "task-789"을 포함한다
```

#### Scenario 3: Prototype 생성 시 파라미터 전송
```gherkin
  Scenario: 사용자가 Prototype을 생성할 때 모든 파라미터가 서버로 전송된다
    Given 사용자가 프로젝트 "project-999"를 선택한다
    And 사용자가 태스크 "task-888"를 선택한다
    And 사용자가 PRD 내용을 입력한다
    When 사용자가 "Generate Prototype" 버튼을 클릭한다
    Then 시스템은 API 요청에 projectId "project-999"을 포함한다
    And 시스템은 API 요청에 taskId "task-888"을 포함한다
```

#### Scenario 4: API 요청 본문 검증
```gherkin
  Scenario: API 요청 본문에 파라미터가 올바르게 포함된다
    Given 사용자가 생성 요청을 준비한다
    When 요청이 서버로 전송된다
    Then JSON 요청 본문은 다음을 포함한다:
      """
      {
        "projectId": "project-123",
        "taskId": "task-456",
        ...다른 필드들
      }
      """
```

#### Scenario 5: 선택적 파라미터 미전송
```gherkin
  Scenario: projectId와 taskId가 없는 경우 요청이 정상 처리된다
    Given 사용자가 프로젝트를 선택하지 않았다
    And 사용자가 태스크를 선택하지 않았다
    When 사용자가 생성 요청을 보낸다
    Then 요청 본문에 projectId가 null이거나 undefined이다
    And 요청 본문에 taskId가 null이거나 undefined이다
    And 서버는 기본 프로바이더를 사용한다
```

#### Scenario 6: null 값 파라미터 처리
```gherkin
  Scenario: 명시적으로 null이 전달된 경우 요청이 정상 처리된다
    Given 사용자가 projectId에 null을 전달한다
    When 요청이 서버로 전송된다
    Then 요청 본문에 { "projectId": null }이 포함된다
    And 서버는 null을 기본값으로 처리한다
```

---

### 2.2 Provider Selection (프로바이더 선택)

#### Scenario 7: OpenAI 설정 시 프로바이더 사용
```gherkin
Feature: LLM Provider Selection Based on Configuration

  Scenario: 사용자가 OpenAI를 프로젝트 프로바이더로 설정한 경우 OpenAI가 사용된다
    Given 사용자가 프로젝트 "project-ai"의 LLM 프로바이더로 OpenAI를 설정했다
    And API 키가 올바르게 구성되어 있다
    When 사용자가 Design Document를 생성한다
    Then 시스템은 OpenAI API를 사용하여 생성을 수행한다
    And 응답이 OpenAI 모델의 출력 형식을 따른다
```

#### Scenario 8: Gemini 설정 시 프로바이더 사용
```gherkin
  Scenario: 사용자가 Gemini를 프로젝트 프로바이더로 설정한 경우 Gemini가 사용된다
    Given 사용자가 프로젝트 "project-gemini"의 LLM 프로바이더로 Gemini를 설정했다
    And API 키가 올바르게 구성되어 있다
    When 사용자가 PRD를 생성한다
    Then 시스템은 Gemini API를 사용하여 생성을 수행한다
    And 응답이 Gemini 모델의 출력 형식을 따른다
```

#### Scenario 9: 설정된 프로바이더로 세 문서 유형 생성
```gherkin
  Scenario: 동일한 프로젝트에서 세 가지 문서 유형을 생성할 때 동일한 프로바이더가 사용된다
    Given 사용자가 프로젝트 "project-test"의 LLM 프로바이더로 OpenAI를 설정했다
    When 사용자가 Design Document를 생성한다
    And 사용자가 PRD를 생성한다
    And 사용자가 Prototype을 생성한다
    Then 모든 요청이 OpenAI 프로바이더를 사용한다
```

#### Scenario 10: 기본 프로바이더 사용
```gherkin
  Scenario: 프로젝트 프로바이더가 설정되지 않은 경우 기본 프로바이더가 사용된다
    Given 사용자가 프로젝트에 대해 LLM 프로바이더를 설정하지 않았다
    When 사용자가 문서를 생성한다
    Then 시스템은 Claude Code를 기본 프로바이더로 사용한다
    And 생성이 성공적으로 완료된다
```

---

### 2.3 Backward Compatibility (하위 호환성)

#### Scenario 11: 기존 API 호출자 계속 작동
```gherkin
Feature: Backward Compatibility

  Scenario: projectId와 taskId 없이 호출하는 기존 코드가 계속 작동한다
    Given 기존 코드가 projectId 없이 API를 호출한다
    When API 요청이 전송된다
    Then 요청이 성공한다
    And 응답이 정상적으로 반환된다
```

#### Scenario 12: 부분 파라미터 전송
```gherkin
  Scenario: projectId만 전달하고 taskId는 생략하는 경우
    Given 사용자가 projectId만 전달한다
    When API 요청이 전송된다
    Then 요청 본문에 projectId가 포함된다
    And 요청 본문에 taskId가 포함되지 않는다
    And 요청이 성공적으로 처리된다
```

#### Scenario 13: TypeScript 컴파일 에러 없음
```gherkin
  Scenario: 인터페이스 변경으로 인한 TypeScript 컴파일 에러가 없다
    Given 모든 인터페이스가 업데이트되었다
    When 프로젝트가 컴파일된다
    Then TypeScript 컴파일이 성공한다
    And 타입 에러가 발생하지 않는다
```

---

### 2.4 Error Handling (에러 처리)

#### Scenario 14: 잘못된 projectId 처리
```gherkin
Feature: Error Handling

  Scenario: 존재하지 않는 projectId가 전달된 경우
    Given 사용자가 존재하지 않는 projectId "invalid-project"를 전달한다
    When API 요청이 전송된다
    Then 서버는 400 또는 404 상태 코드를 반환한다
    And 사용자에게 적절한 에러 메시지가 표시된다
```

#### Scenario 15: 유효하지 않은 API 키 처리
```gherkin
  Scenario: 구성된 프로바이더의 API 키가 유효하지 않은 경우
    Given 사용자가 OpenAI를 프로바이더로 설정했다
    And OpenAI API 키가 만료되었거나 유효하지 않다
    When 문서 생성을 시도한다
    Then 시스템은 401 또는 403 상태 코드를 반환한다
    And 사용자에게 "API 키가 유효하지 않습니다" 메시지가 표시된다
```

#### Scenario 16: 프로바이더 서비스 다운 처리
```gherkin
  Scenario: 구성된 프로바이더 서비스가 다운된 경우
    Given 사용자가 OpenAI를 프로바이더로 설정했다
    And OpenAI 서비스가 현재 다운되어 있다
    When 문서 생성을 시도한다
    Then 시스템은 503 상태 코드를 반환한다
    And 사용자에게 "서비스를 사용할 수 없습니다" 메시지가 표시된다
```

---

## 3. Test Execution Matrix

| ID | Scenario | Test Type | Automated |
|----|----------|-----------|-----------|
| A01 | Design Document 생성 시 projectId 전송 | Integration | Yes |
| A02 | PRD 생성 시 projectId와 taskId 전송 | Integration | Yes |
| A03 | Prototype 생성 시 파라미터 전송 | Integration | Yes |
| A04 | API 요청 본문 검증 | Unit | Yes |
| A05 | 선택적 파라미터 미전송 | Unit | Yes |
| A06 | null 값 파라미터 처리 | Unit | Yes |
| A07 | OpenAI 설정 시 프로바이더 사용 | E2E | Yes |
| A08 | Gemini 설정 시 프로바이더 사용 | E2E | Yes |
| A09 | 설정된 프로바이더로 세 문서 유형 생성 | E2E | Yes |
| A10 | 기본 프로바이더 사용 | E2E | Yes |
| A11 | 기존 API 호출자 계속 작동 | Regression | Yes |
| A12 | 부분 파라미터 전송 | Unit | Yes |
| A13 | TypeScript 컴파일 에러 없음 | Build | Yes |
| A14 | 잘못된 projectId 처리 | E2E | Yes |
| A15 | 유효하지 않은 API 키 처리 | E2E | Yes |
| A16 | 프로바이더 서비스 다운 처리 | E2E | Yes |

---

## 4. Definition of Done

각 시나리오에 대해 다음 조건이 충족되어야 합니다:

1. **기능 동작**: 예상대로 기능이 동작한다
2. **테스트 통과**: 해당 테스트 케이스가 통과한다
3. **코드 리뷰**: 코드가 리뷰되어 승인된다
4. **문서화**: 필요한 문서가 업데이트된다
5. **회귀 없음**: 기존 기능에 영향이 없다
6. **타입 안전성**: TypeScript 타입 검증을 통과한다

---

## 5. Exit Criteria

SPEC-DEBUG-004가 완료되기 위해 다음 조건이 모두 충족되어야 합니다:

- [ ] 모든 16개 시나리오가 통과한다
- [ ] 자동화 가능한 테스트의 100%가 자동화된다
- [ ] 코드 커버리지가 85% 이상이다
- [ ] TypeScript 컴파일 에러가 없다
- [ ] ESLint 경지가 없다
- [ ] 기존 API 소비자와의 하위 호환성이 유지된다
- [ ] 서버가 projectId와 taskId를 올바르게 수신한다
- [ ] 구성된 LLM 프로바이더가 올바르게 사용된다
- [ ] 에러 상황이 적절하게 처리된다

---

## 6. Acceptance Test Examples

### Example 1: OpenAI Provider End-to-End Test
```typescript
describe('OpenAI Provider E2E', () => {
  it('should use OpenAI when configured for project', async () => {
    // Arrange: Configure OpenAI for project
    await configureProjectProvider('project-123', 'openai', 'sk-test-...');

    // Act: Generate design document
    const response = await generateDesignDocument({
      qaResponses: [{ question: 'What is this?', answer: 'A test project' }],
      projectId: 'project-123',
      taskId: 'task-456'
    });

    // Assert
    expect(response.success).toBe(true);
    expect(response.provider).toBe('openai');
  });
});
```

### Example 2: Backward Compatibility Test
```typescript
describe('Backward Compatibility', () => {
  it('should work without projectId and taskId', async () => {
    // Act: Generate without project context
    const response = await generateDesignDocument({
      qaResponses: [{ question: 'What is this?', answer: 'A test' }]
    });

    // Assert
    expect(response.success).toBe(true);
  });
});
```
