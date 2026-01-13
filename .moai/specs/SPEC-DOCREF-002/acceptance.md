# SPEC-DOCREF-002: 인수 기준

## 테스트 시나리오

### Scenario 1: 참조 문서 버튼

```gherkin
Feature: 참조 문서 버튼
  As a 기획자
  I want to AI가 생성한 문서를 검토할 때 참조 문서 버튼을 보고 싶다
  So that 완료된 태스크 문서를 쉽게 탐색할 수 있다

  Scenario: 버튼 표시
    Given DocumentEditor 컴포넌트가 렌더링되어 있다
    When 페이지가 로드되면
    Then "참조 문서 보기" 버튼이 문서 편집 영역 상단에 표시되어야 한다
    And 버튼에 아이콘과 텍스트가 표시되어야 한다

  Scenario: 버튼 클릭으로 패널 열기
    Given "참조 문서 보기" 버튼이 표시되어 있다
    When 버튼을 클릭하면
    Then 문서 참조 사이드 패널이 오른쪽에서 슬라이드되어 열려야 한다
    And 애니메이션이 300ms 내에 완료되어야 한다
```

### Scenario 2: 사이드 패널 열기/닫기

```gherkin
Feature: 문서 참조 사이드 패널
  As a 기획자
  I want to 패널을 열고 닫을 수 있어야 한다
  So that 필요할 때만 참조 문서를 볼 수 있다

  Scenario: 패널 열기 애니메이션
    Given 패널이 닫혀 있다
    When "참조 문서 보기" 버튼을 클릭하면
    Then 패널이 오른쪽에서 왼쪽으로 슬라이드되어 나타나야 한다
    And 배경에 반투명 오버레이가 표시되어야 한다
    And 애니메이션이 부드럽게 진행되어야 한다 (300ms)

  Scenario: X 버튼으로 패널 닫기
    Given 패널이 열려 있다
    When X 버튼을 클릭하면
    Then 패널이 오른쪽으로 슬라이드되어 닫혀야 한다
    And 오버레이가 사라져야 한다

  Scenario: 오버레이 클릭으로 패널 닫기
    Given 패널이 열려 있다
    When 배경 오버레이를 클릭하면
    Then 패널이 닫혀야 한다

  Scenario: ESC 키로 패널 닫기
    Given 패널이 열려 있다
    When ESC 키를 누르면
    Then 패널이 닫혀야 한다
```

### Scenario 3: 완료 문서 목록 표시

```gherkin
Feature: 완료 문서 목록
  As a 기획자
  I want to 완료된 태스크의 문서 목록을 보고 싶다
  So that 참고할 문서를 선택할 수 있다

  Scenario: 문서 목록 로딩
    Given 패널이 열렸다
    When 문서 목록을 가져오는 중이면
    Then 로딩 스켈레톤이 표시되어야 한다

  Scenario: 문서 목록 표시
    Given 프로젝트에 완료된 태스크 3개가 있다
    When 패널이 열리면
    Then 3개의 문서 항목이 목록에 표시되어야 한다
    And 각 항목에 다음 정보가 표시되어야 한다
      | 정보 | 설명 |
      | 제목 | 태스크 제목 |
      | 문서 타입 | Design Doc, PRD, Prototype 아이콘 |
      | 날짜 | 완료/아카이브 날짜 |
      | 참조 시스템 | 태그 형태로 표시 |

  Scenario: 빈 목록 표시
    Given 프로젝트에 완료된 태스크가 없다
    When 패널이 열리면
    Then "완료된 문서가 없습니다" 메시지가 표시되어야 한다

  Scenario: 스크롤 가능한 목록
    Given 완료된 태스크가 20개 이상이다
    When 패널이 열리면
    Then 목록이 스크롤 가능해야 한다
    And 검색창과 필터는 상단에 고정되어야 한다
```

### Scenario 4: 키워드 검색

```gherkin
Feature: 문서 검색
  As a 기획자
  I want to 키워드로 문서를 검색하고 싶다
  So that 특정 주제의 문서를 빠르게 찾을 수 있다

  Scenario: 실시간 검색
    Given 패널이 열려 있고 문서 목록이 표시되어 있다
    When 검색창에 "전투"를 입력하면
    Then 300ms 디바운스 후 검색이 실행되어야 한다
    And "전투"가 포함된 태스크만 목록에 표시되어야 한다

  Scenario: 검색 결과 없음
    Given 패널이 열려 있다
    When 일치하는 결과가 없는 키워드를 입력하면
    Then "검색 결과가 없습니다" 메시지가 표시되어야 한다

  Scenario: 검색어 초기화
    Given 검색어가 입력되어 있다
    When 검색창의 X 버튼을 클릭하면
    Then 검색어가 지워져야 한다
    And 전체 문서 목록이 다시 표시되어야 한다
```

### Scenario 5: 문서 타입 필터링

```gherkin
Feature: 문서 타입 필터링
  As a 기획자
  I want to 특정 유형의 문서만 필터링하고 싶다
  So that 필요한 문서 유형을 가진 태스크만 볼 수 있다

  Scenario: 단일 타입 필터
    Given 패널이 열려 있다
    When "Design Doc" 필터를 체크하면
    Then Design Document가 있는 태스크만 표시되어야 한다
    And 활성 필터가 표시되어야 한다

  Scenario: 복수 타입 필터
    Given 패널이 열려 있다
    When "Design Doc"와 "PRD" 필터를 체크하면
    Then Design Document 또는 PRD가 있는 태스크가 표시되어야 한다

  Scenario: 필터 해제
    Given "Design Doc" 필터가 적용되어 있다
    When 체크를 해제하면
    Then 전체 문서 목록이 다시 표시되어야 한다

  Scenario: 전체 필터 초기화
    Given 여러 필터가 적용되어 있다
    When "필터 초기화" 버튼을 클릭하면
    Then 모든 필터가 해제되어야 한다
    And 전체 문서 목록이 표시되어야 한다
```

### Scenario 6: 문서 상세 보기

```gherkin
Feature: 문서 상세 보기
  As a 기획자
  I want to 선택한 태스크의 문서 내용을 상세히 보고 싶다
  So that 기존 문서의 구조와 내용을 참고할 수 있다

  Scenario: 문서 선택 및 상세 보기
    Given 문서 목록이 표시되어 있다
    When 목록에서 태스크를 클릭하면
    Then 해당 태스크의 문서 상세 뷰가 패널 내에 표시되어야 한다
    And 문서 타입 탭 (Feature List, Design Doc, PRD, Prototype)이 표시되어야 한다

  Scenario: 문서 타입 탭 전환
    Given 문서 상세 뷰가 표시되어 있다
    When "PRD" 탭을 클릭하면
    Then PRD 문서 내용이 표시되어야 한다
    And 마크다운이 렌더링되어야 한다

  Scenario: 목록으로 돌아가기
    Given 문서 상세 뷰가 표시되어 있다
    When "뒤로" 버튼을 클릭하면
    Then 문서 목록 뷰로 돌아가야 한다
    And 이전 검색/필터 상태가 유지되어야 한다

  Scenario: 마크다운 렌더링
    Given 문서 상세 뷰가 표시되어 있다
    When Design Document 내용이 표시되면
    Then 마크다운이 올바르게 렌더링되어야 한다
    And 테이블, 코드 블록, 목록이 정상 표시되어야 한다
```

### Scenario 7: 반응형 레이아웃

```gherkin
Feature: 반응형 디자인
  As a 사용자
  I want to 다양한 화면 크기에서 패널을 사용하고 싶다
  So that 모든 디바이스에서 기능을 이용할 수 있다

  Scenario: 데스크톱 레이아웃 (1024px+)
    Given 화면 너비가 1024px 이상이다
    When 패널이 열리면
    Then 패널 너비가 400px이어야 한다
    And 문서 편집 영역과 나란히 표시되어야 한다

  Scenario: 태블릿 레이아웃 (768px-1023px)
    Given 화면 너비가 768px-1023px이다
    When 패널이 열리면
    Then 패널이 화면의 50%를 차지해야 한다

  Scenario: 모바일 레이아웃 (<768px)
    Given 화면 너비가 768px 미만이다
    When 패널이 열리면
    Then 패널이 전체 화면을 덮어야 한다
```

### Scenario 8: 접근성

```gherkin
Feature: 접근성 지원
  As a 스크린 리더 사용자
  I want to 키보드와 스크린 리더로 패널을 사용할 수 있어야 한다
  So that 모든 사용자가 기능을 이용할 수 있다

  Scenario: 키보드 네비게이션
    Given 패널이 열려 있다
    When Tab 키로 이동하면
    Then 검색창 → 필터 → 문서 목록 순으로 포커스가 이동해야 한다
    And Enter 키로 항목을 선택할 수 있어야 한다

  Scenario: 포커스 트랩
    Given 패널이 열려 있다
    When Tab 키로 계속 이동하면
    Then 포커스가 패널 내에서만 순환해야 한다
    And 패널 외부로 포커스가 이동하지 않아야 한다

  Scenario: 스크린 리더 레이블
    Given 스크린 리더를 사용하고 있다
    When 패널 요소에 포커스가 이동하면
    Then 적절한 ARIA 레이블이 읽혀야 한다
```

---

## 성능 기준

| 항목 | 기준값 | 측정 방법 |
|------|--------|----------|
| 패널 열기 애니메이션 | < 300ms | 사용자 체감 |
| 문서 목록 초기 로딩 | < 500ms | API 호출 + 렌더링 |
| 검색 응답 시간 | < 300ms | 디바운스 후 결과 표시 |
| 탭 전환 | < 100ms | 즉각적 |

---

## 완료 기준 체크리스트

### 기능 체크리스트

- [ ] 참조 문서 버튼이 DocumentEditor에 표시됨
- [ ] 사이드 패널 열기/닫기 동작
- [ ] 슬라이드 애니메이션 적용
- [ ] 완료 문서 목록 표시
- [ ] 로딩 스켈레톤 표시
- [ ] 빈 상태 메시지 표시
- [ ] 키워드 검색 동작 (300ms 디바운스)
- [ ] 문서 타입 필터 동작
- [ ] 필터 초기화 동작
- [ ] 문서 상세 보기 동작
- [ ] 문서 타입 탭 전환
- [ ] 마크다운 렌더링

### 비기능 체크리스트

- [ ] 반응형 레이아웃 (데스크톱/태블릿/모바일)
- [ ] 키보드 네비게이션 지원
- [ ] ESC 키로 패널 닫기
- [ ] ARIA 레이블 적용
- [ ] 색상 대비 WCAG AA 충족

### 테스트 체크리스트

- [ ] 컴포넌트 단위 테스트 통과
- [ ] Store 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 테스트 커버리지 85%+
