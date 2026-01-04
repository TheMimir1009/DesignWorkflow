# SPEC-REFERENCE-001: Acceptance Criteria

## Traceability

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-REFERENCE-001 |
| Document | Acceptance Criteria |
| Related SPEC | [spec.md](./spec.md) |
| Implementation Plan | [plan.md](./plan.md) |

---

## Test Scenarios

### TC-REF-001: Header Tag Removal

**Requirement:** E1 - 태그 x 버튼 클릭으로 참조 제거

```gherkin
Scenario: 사용자가 헤더 태그의 x 버튼을 클릭하여 참조 제거
  Given 프로젝트 "Game Alpha"가 선택되어 있다
  And "Character" 시스템이 참조 목록에 추가되어 있다
  And 헤더에 "[Character x]" 태그가 표시되어 있다
  When 사용자가 "Character" 태그의 "x" 버튼을 클릭한다
  Then "Character" 시스템이 참조 목록에서 제거된다
  And 헤더에서 "[Character x]" 태그가 사라진다
  And 사이드바의 "Character" 체크박스가 해제된다
```

**Edge Cases:**
- 마지막 참조 제거 시 플레이스홀더 표시 확인
- 빠른 연속 클릭 시 중복 제거 방지

---

### TC-REF-002: Add Reference via Dropdown

**Requirement:** E2, E3 - [+ 추가] 버튼으로 검색 드롭다운 열기 및 시스템 추가

```gherkin
Scenario: 사용자가 검색 드롭다운을 통해 참조 시스템 추가
  Given 프로젝트 "Game Alpha"가 선택되어 있다
  And 시스템 문서 "Combat", "Character", "Economy"가 존재한다
  And 참조 목록이 비어있다
  When 사용자가 헤더의 "[+ 추가]" 버튼을 클릭한다
  Then 검색 드롭다운이 표시된다
  And 모든 시스템 문서가 드롭다운에 표시된다
  When 사용자가 검색창에 "Com"을 입력한다
  Then "Combat" 시스템만 필터링되어 표시된다
  When 사용자가 "Combat"를 클릭한다
  Then "Combat"이 참조 목록에 추가된다
  And 헤더에 "[Combat x]" 태그가 표시된다
  And 드롭다운이 닫힌다
```

**Edge Cases:**
- 이미 선택된 시스템은 드롭다운에서 비활성화 또는 체크 표시
- 검색 결과 없을 시 "결과 없음" 메시지 표시
- ESC 키로 드롭다운 닫기

---

### TC-REF-003: Checkbox Selection in Sidebar

**Requirement:** E4 - 사이드바 체크박스로 참조 상태 토글

```gherkin
Scenario: 사용자가 사이드바에서 체크박스로 시스템 선택
  Given 프로젝트 "Game Alpha"가 선택되어 있다
  And 사이드바가 펼쳐져 있다
  And "Character" 시스템 카드가 표시되어 있다
  And "Character"가 참조 목록에 없다
  When 사용자가 "Character" 카드의 체크박스를 클릭한다
  Then "Character"가 참조 목록에 추가된다
  And 헤더에 "[Character x]" 태그가 표시된다
  And 체크박스가 선택 상태로 변경된다
  When 사용자가 같은 체크박스를 다시 클릭한다
  Then "Character"가 참조 목록에서 제거된다
  And 헤더에서 "[Character x]" 태그가 사라진다
  And 체크박스가 해제 상태로 변경된다
```

---

### TC-REF-004: Save as Default References

**Requirement:** E5 - 기본 참조로 저장

```gherkin
Scenario: 사용자가 현재 선택을 기본 참조로 저장
  Given 프로젝트 "Game Alpha"가 선택되어 있다
  And "Character", "Combat" 시스템이 참조 목록에 추가되어 있다
  When 사용자가 "기본 참조로 저장" 버튼을 클릭한다
  Then 저장 확인 메시지가 표시된다
  And 프로젝트의 defaultReferences가 ["Character_id", "Combat_id"]로 업데이트된다
  When 사용자가 브라우저를 새로고침한다
  And 프로젝트 "Game Alpha"를 선택한다
  Then "Character", "Combat"이 자동으로 참조 목록에 추가된다
```

**API Verification:**
```
PUT /api/projects/game-alpha
Body: { "defaultReferences": ["char-001", "combat-001"] }
Response: 200 OK
```

---

### TC-REF-005: Auto-Apply Default References

**Requirement:** U3, S1 - 프로젝트 전환 시 기본 참조 자동 적용

```gherkin
Scenario: 프로젝트 전환 시 기본 참조 자동 적용
  Given 프로젝트 "Game Alpha"의 기본 참조가 ["Character", "Combat"]으로 설정되어 있다
  And 프로젝트 "Game Beta"의 기본 참조가 ["Economy"]로 설정되어 있다
  And 현재 프로젝트가 "Game Alpha"이다
  When 사용자가 프로젝트를 "Game Beta"로 전환한다
  Then 참조 목록이 초기화된다
  And "Economy"가 자동으로 참조 목록에 추가된다
  And 헤더에 "[Economy x]" 태그만 표시된다
```

---

### TC-REF-006: Category Fold/Unfold

**Requirement:** E6 - 카테고리 접기/펼치기

```gherkin
Scenario: 카테고리 헤더 클릭으로 접기/펼치기
  Given 사이드바가 펼쳐져 있다
  And "Core Systems" 카테고리에 3개의 문서가 있다
  And 카테고리가 펼쳐진 상태이다
  When 사용자가 "Core Systems" 카테고리 헤더를 클릭한다
  Then 해당 카테고리의 문서 목록이 접힌다
  And 접힘 아이콘이 표시된다
  When 사용자가 같은 헤더를 다시 클릭한다
  Then 해당 카테고리의 문서 목록이 펼쳐진다
  And 펼침 아이콘이 표시된다
```

---

### TC-REF-007: Preview Button

**Requirement:** E7 - 미리보기 버튼으로 모달 표시

```gherkin
Scenario: 시스템 문서 미리보기
  Given 사이드바가 펼쳐져 있다
  And "Character" 시스템 카드가 표시되어 있다
  When 사용자가 "Character" 카드의 눈 아이콘 버튼을 클릭한다
  Then 마크다운 미리보기 모달이 표시된다
  And "Character" 시스템의 전체 내용이 렌더링된다
  When 사용자가 모달 외부를 클릭한다
  Then 모달이 닫힌다
```

---

### TC-REF-008: Empty Reference State

**Requirement:** S2 - 빈 참조 목록 플레이스홀더

```gherkin
Scenario: 참조 목록이 비어있을 때 플레이스홀더 표시
  Given 프로젝트 "Game Alpha"가 선택되어 있다
  And 참조 목록이 비어있다
  Then 헤더 태그 바에 "참조 시스템 없음" 플레이스홀더가 표시된다
  And "[+ 추가]" 버튼이 표시된다
```

---

### TC-REF-009: Duplicate Prevention

**Requirement:** N1 - 중복 추가 방지

```gherkin
Scenario: 이미 선택된 시스템 중복 추가 방지
  Given "Character" 시스템이 참조 목록에 추가되어 있다
  When 사용자가 검색 드롭다운을 연다
  Then "Character" 항목에 선택됨 표시가 있다
  When 사용자가 "Character"를 다시 클릭한다
  Then 참조 목록에 "Character"가 중복 추가되지 않는다
  And 참조 목록에는 여전히 1개의 "Character"만 존재한다
```

---

### TC-REF-010: Sidebar Collapsed Mode

**Requirement:** S4 - 사이드바 접힘 상태에서 헤더만으로 관리

```gherkin
Scenario: 사이드바가 접힌 상태에서 참조 관리
  Given 사이드바가 접혀있다
  And "Character" 시스템이 참조 목록에 있다
  When 사용자가 헤더의 "Character" 태그 x 버튼을 클릭한다
  Then "Character"가 참조 목록에서 제거된다
  When 사용자가 "[+ 추가]" 버튼을 클릭한다
  Then 검색 드롭다운이 정상적으로 표시된다
  And 드롭다운에서 시스템을 선택할 수 있다
```

---

## Quality Gates

### Functional Requirements

| ID | Criteria | Verification Method |
|----|----------|---------------------|
| QG-F1 | 모든 EARS 요구사항 충족 | Test case pass rate 100% |
| QG-F2 | 참조 상태 동기화 정확성 | Integration test |
| QG-F3 | API 응답 정확성 | API test |

### Performance Requirements

| ID | Criteria | Target | Verification Method |
|----|----------|--------|---------------------|
| QG-P1 | 참조 토글 응답 시간 | < 100ms | Performance test |
| QG-P2 | 검색 필터링 응답 시간 | < 200ms | Performance test |
| QG-P3 | 기본 참조 저장 API | < 500ms | API response time |

### Code Quality

| ID | Criteria | Target |
|----|----------|--------|
| QG-C1 | TypeScript strict mode | No errors |
| QG-C2 | ESLint | No warnings |
| QG-C3 | Test coverage | >= 85% |

---

## Definition of Done

| Item | Required |
|------|----------|
| 모든 테스트 케이스 통과 | Yes |
| TypeScript 컴파일 에러 없음 | Yes |
| ESLint 경고 없음 | Yes |
| 코드 리뷰 완료 | Yes |
| UI가 디자인 명세와 일치 | Yes |
| 성능 요구사항 충족 | Yes |
| 기존 기능 회귀 없음 | Yes |
| API 문서 업데이트 | Yes |

---

## Regression Test Cases

기존 SPEC-SYSTEM-001 기능이 영향받지 않도록 다음 테스트 케이스를 유지한다:

| Test Case | Description |
|-----------|-------------|
| TC-SYS-001 | 시스템 문서 생성 |
| TC-SYS-002 | 시스템 문서 수정 |
| TC-SYS-003 | 시스템 문서 삭제 |
| TC-SYS-004 | 카테고리 필터링 |
| TC-SYS-005 | 태그 필터링 |
| TC-SYS-006 | 키워드 검색 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | manager-spec | Initial acceptance criteria |
