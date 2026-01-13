# SPEC-DOCREF-001: 인수 기준

## 테스트 시나리오

### Scenario 1: 완료 문서 목록 조회

```gherkin
Feature: 완료 태스크 문서 목록 조회
  As a 기획자
  I want to AI 생성 문서를 검토할 때 완료된 태스크 문서 목록을 조회하고 싶다
  So that 기존 패턴을 참고하여 문서 품질을 높일 수 있다

  Scenario: 프로젝트의 완료 문서 전체 조회
    Given 프로젝트 "project-alpha"에 다음 태스크가 있다
      | taskId | title | status | hasDesignDoc | hasPrd | hasPrototype |
      | task-1 | 전투 시스템 | prototype | true | true | true |
      | task-2 | 캐릭터 성장 | prototype | true | false | false |
    And 아카이브된 태스크 "task-3"이 있다
    When GET /api/projects/project-alpha/completed-documents 요청을 보내면
    Then 응답 상태 코드가 200이어야 한다
    And 3개의 문서 요약 정보가 반환되어야 한다
    And 각 문서에 taskId, title, status, hasDesignDoc, hasPrd, hasPrototype가 포함되어야 한다

  Scenario: 아카이브 제외 조회
    Given 프로젝트에 prototype 상태 태스크 2개와 아카이브된 태스크 1개가 있다
    When GET /api/projects/{projectId}/completed-documents?includeArchived=false 요청을 보내면
    Then 2개의 문서만 반환되어야 한다
    And 아카이브된 태스크는 포함되지 않아야 한다
```

### Scenario 2: 키워드 검색

```gherkin
Feature: 완료 문서 키워드 검색
  As a 기획자
  I want to 키워드로 관련 문서를 검색하고 싶다
  So that 특정 주제의 기존 문서를 빠르게 찾을 수 있다

  Scenario: 태스크 제목으로 검색
    Given 다음 완료 태스크가 있다
      | taskId | title |
      | task-1 | 전투 시스템 기획 |
      | task-2 | 캐릭터 성장 시스템 |
      | task-3 | 전투 밸런스 조정 |
    When GET /api/projects/{projectId}/completed-documents?search=전투 요청을 보내면
    Then task-1과 task-3이 반환되어야 한다
    And task-2는 반환되지 않아야 한다

  Scenario: 대소문자 구분 없는 검색
    Given 태스크 제목이 "Combat System"인 태스크가 있다
    When GET /api/projects/{projectId}/completed-documents?search=combat 요청을 보내면
    Then 해당 태스크가 반환되어야 한다

  Scenario: 문서 내용에서 검색
    Given 태스크의 Design Document에 "던전 보스 패턴"이 포함되어 있다
    When GET /api/projects/{projectId}/completed-documents?search=던전 요청을 보내면
    Then 해당 태스크가 반환되어야 한다
```

### Scenario 3: 문서 타입 필터링

```gherkin
Feature: 문서 타입별 필터링
  As a 기획자
  I want to 특정 유형의 문서가 있는 태스크만 필터링하고 싶다
  So that 필요한 문서 유형을 가진 참고 자료를 찾을 수 있다

  Scenario: Design Document가 있는 태스크만 조회
    Given 다음 완료 태스크가 있다
      | taskId | hasDesignDoc | hasPrd | hasPrototype |
      | task-1 | true | true | true |
      | task-2 | true | false | false |
      | task-3 | false | true | false |
    When GET /api/projects/{projectId}/completed-documents?documentType=design 요청을 보내면
    Then task-1과 task-2가 반환되어야 한다
    And task-3은 반환되지 않아야 한다

  Scenario: 복수 문서 타입 필터링
    Given 위와 동일한 태스크가 있을 때
    When GET /api/projects/{projectId}/completed-documents?documentType=design,prd 요청을 보내면
    Then Design Document 또는 PRD가 있는 태스크가 반환되어야 한다
```

### Scenario 4: 참조 시스템 필터링

```gherkin
Feature: 참조 시스템별 필터링
  As a 기획자
  I want to 특정 시스템을 참조하는 태스크만 필터링하고 싶다
  So that 관련 시스템의 기존 기획을 참고할 수 있다

  Scenario: 단일 시스템 참조 필터
    Given 다음 완료 태스크가 있다
      | taskId | references |
      | task-1 | [character, combat] |
      | task-2 | [combat, economy] |
      | task-3 | [ui, ux] |
    When GET /api/projects/{projectId}/completed-documents?reference=combat 요청을 보내면
    Then task-1과 task-2가 반환되어야 한다
    And task-3은 반환되지 않아야 한다
```

### Scenario 5: 단일 문서 상세 조회

```gherkin
Feature: 완료 문서 상세 조회
  As a 기획자
  I want to 특정 태스크의 전체 문서를 상세히 조회하고 싶다
  So that 기존 문서의 구조와 내용을 참고할 수 있다

  Scenario: 완료 태스크 문서 상세 조회
    Given taskId가 "task-1"인 완료 태스크가 있다
    And 해당 태스크에 다음 문서가 있다
      | document | content |
      | featureList | # 전투 시스템\n- 기본 공격... |
      | designDocument | # Design Document\n## 1. 개요... |
      | prd | # PRD\n## 기능 명세... |
      | prototype | <html>...</html> |
    When GET /api/projects/{projectId}/completed-documents/task-1 요청을 보내면
    Then 응답 상태 코드가 200이어야 한다
    And featureList, designDocument, prd, prototype 전체 내용이 반환되어야 한다
    And references 배열이 반환되어야 한다
    And qaAnswers 배열이 반환되어야 한다

  Scenario: 존재하지 않는 태스크 조회
    Given taskId가 "non-existent"인 태스크가 없다
    When GET /api/projects/{projectId}/completed-documents/non-existent 요청을 보내면
    Then 응답 상태 코드가 404여야 한다
    And 에러 메시지가 반환되어야 한다

  Scenario: 아카이브된 태스크 상세 조회
    Given archiveId가 "archive-1"인 아카이브 태스크가 있다
    When GET /api/projects/{projectId}/completed-documents/archive-1 요청을 보내면
    Then 응답 상태 코드가 200이어야 한다
    And status가 "archived"여야 한다
    And archivedAt 필드가 포함되어야 한다
```

### Scenario 6: 에러 처리

```gherkin
Feature: API 에러 처리
  As a 개발자
  I want to 적절한 에러 응답을 받고 싶다
  So that 문제를 빠르게 진단하고 해결할 수 있다

  Scenario: 존재하지 않는 프로젝트
    Given projectId가 "non-existent-project"인 프로젝트가 없다
    When GET /api/projects/non-existent-project/completed-documents 요청을 보내면
    Then 응답 상태 코드가 404여야 한다
    And 에러 메시지가 "Project not found"여야 한다

  Scenario: 잘못된 documentType 파라미터
    Given 프로젝트가 존재한다
    When GET /api/projects/{projectId}/completed-documents?documentType=invalid 요청을 보내면
    Then 응답 상태 코드가 400이어야 한다
    And 에러 메시지에 유효한 타입 목록이 포함되어야 한다
```

---

## 성능 기준

| 항목 | 기준값 | 측정 방법 |
|------|--------|----------|
| 목록 조회 응답 시간 | < 500ms | 100개 태스크 기준 |
| 상세 조회 응답 시간 | < 200ms | 단일 태스크 |
| 검색 응답 시간 | < 500ms | 키워드 검색 |

---

## 완료 기준 체크리스트

- [ ] GET /api/projects/:projectId/completed-documents 동작
- [ ] GET /api/projects/:projectId/completed-documents/:taskId 동작
- [ ] 키워드 검색 기능 동작
- [ ] 문서 타입 필터링 동작
- [ ] 참조 시스템 필터링 동작
- [ ] 아카이브 포함/제외 옵션 동작
- [ ] 페이지네이션 동작
- [ ] 에러 처리 완료
- [ ] 단위 테스트 통과 (커버리지 85%+)
- [ ] 통합 테스트 통과
