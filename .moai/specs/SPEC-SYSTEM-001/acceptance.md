<<<<<<< HEAD
# SPEC-SYSTEM-001: Acceptance Criteria

## TAG BLOCK

```yaml
spec_id: SPEC-SYSTEM-001
document_type: acceptance
created: 2026-01-04
updated: 2026-01-04
=======
# SPEC-SYSTEM-001: 수락 기준

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-SYSTEM-001 |
| 관련 SPEC | spec.md, plan.md |
| 작성일 | 2026-01-05 |

---

## 1. 수락 기준 (Acceptance Criteria)

### AC-001: 시스템 문서 사이드바 표시

**Given** 사용자가 프로젝트를 선택한 상태에서 메인 화면을 보고 있을 때
**When** 페이지가 로드되면
**Then** 좌측에 시스템 문서 사이드바가 표시된다

**Given** 사이드바가 펼쳐진 상태일 때
**When** 사이드바 토글 버튼을 클릭하면
**Then** 사이드바가 48px 너비로 접힌다

**Given** 사이드바가 접힌 상태일 때
**When** 사이드바 토글 버튼을 클릭하면
**Then** 사이드바가 280px 너비로 펼쳐진다

**Given** 사이드바 상태를 변경한 후
**When** 페이지를 새로고침하면
**Then** 이전 사이드바 상태가 유지된다 (LocalStorage)

---

### AC-002: 카테고리별 그룹화

**Given** 프로젝트에 여러 카테고리의 시스템 문서가 있을 때
**When** 사이드바 문서 목록을 볼 때
**Then** 문서들이 카테고리별로 그룹화되어 표시된다

**Given** 카테고리 헤더가 표시되어 있을 때
**When** 카테고리 헤더를 클릭하면
**Then** 해당 카테고리의 문서 목록이 접히거나 펼쳐진다

**Given** 프로젝트에 시스템 문서가 없을 때
**When** 사이드바를 볼 때
**Then** "시스템 문서를 추가하세요" 안내 메시지가 표시된다

**Given** 프로젝트가 선택되지 않았을 때
**When** 사이드바를 볼 때
**Then** "프로젝트를 먼저 선택하세요" 메시지가 표시된다

---

### AC-003: 시스템 문서 생성

**Given** 사용자가 프로젝트를 선택한 상태일 때
**When** `[+ 새 시스템 문서]` 버튼을 클릭하면
**Then** 시스템 문서 생성 모달이 화면 중앙에 열린다

**Given** 생성 모달이 열려 있을 때
**When** 이름과 카테고리가 모두 비어있으면
**Then** "생성" 버튼이 비활성화된다

**Given** 생성 모달에서 이름과 카테고리를 입력했을 때
**When** "생성" 버튼을 클릭하면
**Then** 새 시스템 문서가 생성되고 사이드바 목록에 추가된다

**Given** 생성 모달이 열려 있을 때
**When** "취소" 버튼을 클릭하거나 ESC 키를 누르면
**Then** 모달이 닫힌다

---

### AC-004: 시스템 문서 생성 폼 필드

**Given** 생성 모달이 열려 있을 때
**When** 카테고리 입력 필드에 포커스하면
**Then** 기존 카테고리 목록이 자동완성으로 표시된다

**Given** 생성 모달이 열려 있을 때
**When** 태그 입력 필드에 텍스트를 입력하고 Enter를 누르면
**Then** 태그가 칩 형태로 추가된다

**Given** 생성 모달에서 태그 칩이 있을 때
**When** 태그 칩의 "x" 버튼을 클릭하면
**Then** 해당 태그가 제거된다

**Given** 생성 모달이 열려 있을 때
**When** 의존 시스템 필드를 클릭하면
**Then** 기존 시스템 문서 목록이 드롭다운으로 표시되어 다중 선택 가능하다

---

### AC-005: 시스템 문서 편집

**Given** 시스템 문서 카드가 사이드바에 있을 때
**When** 카드의 편집 버튼(연필 아이콘)을 클릭하면
**Then** 편집 모달이 열리고 기존 내용이 채워진다

**Given** 편집 모달에서 내용을 수정했을 때
**When** "저장" 버튼을 클릭하면
**Then** 변경 사항이 저장되고 "저장되었습니다" 토스트가 표시된다

**Given** 편집 모달에서 내용을 수정했을 때
**When** "취소" 버튼을 클릭하면
**Then** "변경 사항을 저장하지 않고 닫으시겠습니까?" 확인 다이얼로그가 표시된다

**Given** 편집 모달에서 내용을 수정하지 않았을 때
**When** "취소" 버튼을 클릭하면
**Then** 확인 없이 모달이 바로 닫힌다

---

### AC-006: 마크다운 에디터 기능

**Given** 생성 또는 편집 모달이 열려 있을 때
**When** 마크다운 문법으로 텍스트를 입력하면
**Then** 입력 내용이 실시간으로 반영된다

**Given** 마크다운 에디터에 내용이 있을 때
**When** 미리보기 탭을 클릭하면 (구현된 경우)
**Then** 마크다운이 렌더링된 결과가 표시된다

---

### AC-007: 시스템 문서 삭제

**Given** 시스템 문서 카드가 사이드바에 있을 때
**When** 카드의 삭제 버튼(휴지통 아이콘)을 클릭하면
**Then** "이 시스템 문서를 삭제하시겠습니까?" 확인 다이얼로그가 표시된다

**Given** 삭제 확인 다이얼로그에서
**When** "삭제" 버튼을 클릭하면
**Then** 문서가 삭제되고 사이드바에서 제거되며 "시스템 문서가 삭제되었습니다" 토스트가 표시된다

**Given** 다른 시스템 문서가 이 문서를 의존하고 있을 때
**When** 삭제를 시도하면
**Then** "이 문서를 참조하는 시스템이 N개 있습니다" 추가 경고가 표시된다

---

### AC-008: 시스템 문서 미리보기

**Given** 시스템 문서 카드가 사이드바에 있을 때
**When** 카드를 클릭하면 (편집/삭제 버튼 제외 영역)
**Then** 미리보기 패널이 열리고 마크다운 렌더링된 내용이 표시된다

**Given** 미리보기 패널이 열려 있을 때
**When** "편집" 버튼을 클릭하면
**Then** 미리보기가 닫히고 편집 모달이 열린다

**Given** 미리보기 패널이 열려 있을 때
**When** 패널 외부를 클릭하거나 "닫기" 버튼을 클릭하면
**Then** 미리보기 패널이 닫힌다

---

### AC-009: 키워드 검색

**Given** 사이드바 상단에 검색 입력 필드가 있을 때
**When** 검색어를 입력하면
**Then** 300ms 후 문서 이름, 태그, 내용에서 키워드를 검색하여 결과를 필터링한다

**Given** 검색어가 입력된 상태에서
**When** 검색 결과가 있으면
**Then** 매칭된 문서만 목록에 표시된다

**Given** 검색어가 입력된 상태에서
**When** 검색 결과가 없으면
**Then** "검색 결과가 없습니다" 메시지가 표시된다

**Given** 검색어가 입력된 상태에서
**When** 검색 입력 필드를 비우면
**Then** 모든 문서가 다시 표시된다

---

### AC-010: 필터링

**Given** 사이드바에 필터 UI가 있을 때
**When** 카테고리 필터를 선택하면
**Then** 해당 카테고리의 문서만 표시된다

**Given** 사이드바에 필터 UI가 있을 때
**When** 태그 필터를 선택하면 (다중 선택 가능)
**Then** 선택된 태그를 포함한 문서만 표시된다

**Given** 검색어와 필터가 모두 적용되었을 때
**When** 결과를 볼 때
**Then** 검색어 AND 필터 조건을 모두 만족하는 문서만 표시된다

**Given** 필터가 적용된 상태에서
**When** "필터 초기화" 버튼을 클릭하면
**Then** 모든 필터가 해제되고 전체 문서가 표시된다

---

## 2. 테스트 시나리오 (Given-When-Then)

### 시나리오 1: 시스템 문서 생성 전체 흐름

```gherkin
Feature: 시스템 문서 생성
  사용자가 새로운 시스템 문서를 생성할 수 있어야 한다

  Background:
    Given 사용자가 "Project Alpha" 프로젝트를 선택했다
    And 프로젝트에 기존 카테고리 ["Core", "Combat", "Economy"]가 있다

  Scenario: 성공적인 시스템 문서 생성
    Given 사이드바가 펼쳐져 있다
    When "[+ 새 시스템 문서]" 버튼을 클릭한다
    Then 시스템 문서 생성 모달이 열린다

    When 이름 필드에 "캐릭터 성장 시스템"을 입력한다
    And 카테고리 필드에 "Core"를 선택한다
    And 태그로 "character", "progression"을 추가한다
    And 마크다운 에디터에 "## 개요\n캐릭터 성장 시스템 설명"을 입력한다
    Then "생성" 버튼이 활성화된다

    When "생성" 버튼을 클릭한다
    Then 모달이 닫힌다
    And "Core" 카테고리 그룹에 "캐릭터 성장 시스템" 카드가 추가된다
    And 카드에 "character", "progression" 태그가 표시된다

  Scenario: 필수 필드 없이 생성 시도
    Given 시스템 문서 생성 모달이 열려 있다
    When 이름 필드가 비어있는 상태에서
    Then "생성" 버튼이 비활성화되어 있다

    When 이름만 입력하고 카테고리는 비워둔 상태에서
    Then "생성" 버튼이 여전히 비활성화되어 있다
```

### 시나리오 2: 시스템 문서 편집 및 변경 감지

```gherkin
Feature: 시스템 문서 편집
  사용자가 기존 시스템 문서를 편집할 수 있어야 한다

  Background:
    Given "캐릭터 시스템" 문서가 "Core" 카테고리에 있다
    And 문서 내용은 "## 캐릭터\n기본 설명"이다

  Scenario: 시스템 문서 내용 수정 및 저장
    When 해당 카드의 편집 버튼을 클릭한다
    Then 편집 모달이 열린다
    And 마크다운 에디터에 기존 내용이 표시된다

    When 에디터 내용을 "## 캐릭터\n수정된 설명"으로 변경한다
    And "저장" 버튼을 클릭한다
    Then "저장되었습니다" 토스트가 표시된다
    And 모달이 닫힌다

  Scenario: 변경 사항 있을 때 취소 시도
    Given 편집 모달이 열려 있다
    When 에디터 내용을 수정한다
    And "취소" 버튼을 클릭한다
    Then "변경 사항을 저장하지 않고 닫으시겠습니까?" 다이얼로그가 표시된다

    When "닫기" 버튼을 클릭한다
    Then 모달이 닫힌다
    And 변경 사항은 저장되지 않는다

  Scenario: 변경 사항 없을 때 취소
    Given 편집 모달이 열려 있다
    When 내용을 수정하지 않고 "취소" 버튼을 클릭한다
    Then 확인 다이얼로그 없이 모달이 바로 닫힌다
```

### 시나리오 3: 시스템 문서 삭제

```gherkin
Feature: 시스템 문서 삭제
  사용자가 시스템 문서를 삭제할 수 있어야 한다

  Scenario: 일반 시스템 문서 삭제
    Given "테스트 시스템" 문서가 사이드바에 있다
    And 다른 문서가 이 문서를 의존하지 않는다
    When 카드의 삭제 버튼(휴지통 아이콘)을 클릭한다
    Then 삭제 확인 다이얼로그가 표시된다
    And "테스트 시스템"이 다이얼로그에 표시된다

    When "삭제" 버튼을 클릭한다
    Then 다이얼로그가 닫힌다
    And "시스템 문서가 삭제되었습니다" 토스트가 표시된다
    And 사이드바에서 해당 카드가 사라진다

  Scenario: 의존성 있는 문서 삭제 시도
    Given "캐릭터 시스템" 문서가 있다
    And "전투 시스템" 문서가 "캐릭터 시스템"을 의존한다
    When "캐릭터 시스템" 카드의 삭제 버튼을 클릭한다
    Then 삭제 확인 다이얼로그에 "이 문서를 참조하는 시스템이 1개 있습니다" 경고가 추가로 표시된다

    When "삭제" 버튼을 클릭한다
    Then 문서가 삭제된다
    And "전투 시스템"의 의존성에서 해당 참조가 제거된다
```

### 시나리오 4: 검색 및 필터링

```gherkin
Feature: 검색 및 필터링
  사용자가 시스템 문서를 검색하고 필터링할 수 있어야 한다

  Background:
    Given 프로젝트에 다음 시스템 문서가 있다:
      | 이름 | 카테고리 | 태그 |
      | 캐릭터 시스템 | Core | character, stats |
      | 전투 시스템 | Combat | battle, skill |
      | 경제 시스템 | Economy | gold, item |
      | 캐릭터 성장 | Core | character, progression |

  Scenario: 키워드 검색
    When 검색 필드에 "캐릭터"를 입력한다
    And 300ms가 지난다
    Then 목록에 "캐릭터 시스템"과 "캐릭터 성장"만 표시된다

  Scenario: 카테고리 필터
    When 카테고리 필터에서 "Core"를 선택한다
    Then 목록에 "캐릭터 시스템"과 "캐릭터 성장"만 표시된다

  Scenario: 태그 필터
    When 태그 필터에서 "character"를 선택한다
    Then 목록에 "캐릭터 시스템"과 "캐릭터 성장"만 표시된다

  Scenario: 검색과 필터 결합
    When 검색 필드에 "시스템"을 입력한다
    And 카테고리 필터에서 "Core"를 선택한다
    Then 목록에 "캐릭터 시스템"만 표시된다

  Scenario: 필터 초기화
    Given 카테고리 "Core" 필터가 적용되어 있다
    When "필터 초기화" 버튼을 클릭한다
    Then 모든 4개 문서가 다시 표시된다
>>>>>>> main
```

---

<<<<<<< HEAD
## Acceptance Scenarios

### AS-1: System Document Creation

#### Scenario: Create a new system document with all fields

```gherkin
Given the user has selected a project
And the user clicks the "Add System Document" button
When the user enters "Combat System" as the name
And the user selects "Core" as the category
And the user adds tags "combat", "damage", "skills"
And the user enters markdown content in the editor
And the user selects "Character System" as a dependency
And the user clicks "Create"
Then a new system document should be created
And the document should appear in the system list under "Core" category
And the document should have the correct tags displayed
And a success toast notification should appear
```

#### Scenario: Prevent duplicate document names

```gherkin
Given a system document named "Combat System" exists in the project
When the user tries to create a new document with name "Combat System"
Then the system should display an error message "A system document with this name already exists"
And the document should not be created
```

#### Scenario: Require mandatory fields

```gherkin
Given the user opens the create document modal
When the user attempts to save without entering a name
Then the "Create" button should be disabled
And a validation message should indicate "Name is required"

When the user attempts to save without selecting a category
Then the "Create" button should be disabled
And a validation message should indicate "Category is required"
```

---

### AS-2: System Document Editing

#### Scenario: Edit existing document content

```gherkin
Given a system document "Combat System" exists
When the user clicks the edit button on the document card
Then the edit modal should open
And the name field should contain "Combat System"
And the category should show the current category
And the tags should show current tags
And the markdown editor should contain the current content

When the user modifies the content
And clicks "Save"
Then the document should be updated
And the updatedAt timestamp should change
And the document list should reflect the changes
```

#### Scenario: Cancel editing with unsaved changes

```gherkin
Given the user is editing a document
And the user has made changes to the content
When the user clicks the close button
Then a confirmation dialog should appear asking "Discard unsaved changes?"
When the user confirms
Then the modal should close
And the original content should be preserved
```

---

### AS-3: System Document Deletion

#### Scenario: Delete document with confirmation

```gherkin
Given a system document "Combat System" exists
When the user clicks the delete button on the document card
Then a confirmation dialog should appear
And the dialog should ask "Are you sure you want to delete 'Combat System'?"

When the user confirms the deletion
Then the document should be removed from the list
And the document files should be deleted from storage
And a success toast should appear
```

#### Scenario: Cancel document deletion

```gherkin
Given the delete confirmation dialog is open
When the user clicks "Cancel"
Then the dialog should close
And the document should remain in the list
```

---

### AS-4: Category-Based Organization

#### Scenario: View documents grouped by category

```gherkin
Given the following system documents exist:
  | Name           | Category |
  | Combat System  | Core     |
  | Character      | Core     |
  | Shop System    | Economy  |
  | Inventory      | Economy  |
When the user views the system document list
Then documents should be grouped under category headers
And "Core" section should contain "Combat System" and "Character"
And "Economy" section should contain "Shop System" and "Inventory"
```

#### Scenario: Collapse and expand category sections

```gherkin
Given the "Core" category section is expanded
When the user clicks the "Core" category header
Then the section should collapse
And documents under "Core" should be hidden

When the user clicks the "Core" category header again
Then the section should expand
And documents under "Core" should be visible
```

#### Scenario: Filter by single category

```gherkin
Given multiple categories exist with documents
When the user clicks the "Core" category filter
Then only documents in the "Core" category should be displayed
And other category documents should be hidden
And the "Core" filter should appear as active
```

---

### AS-5: Tag-Based Filtering

#### Scenario: Filter by single tag

```gherkin
Given documents have the following tags:
  | Document       | Tags                    |
  | Combat System  | combat, damage, skills  |
  | Character      | character, stats        |
  | Skill Tree     | skills, progression     |
When the user clicks the "skills" tag filter
Then "Combat System" and "Skill Tree" should be displayed
And "Character" should be hidden
```

#### Scenario: Filter by multiple tags (AND logic)

```gherkin
Given documents have the following tags:
  | Document       | Tags                    |
  | Combat System  | combat, damage, skills  |
  | Skill Tree     | skills, progression     |
When the user selects both "skills" and "damage" tags
Then only "Combat System" should be displayed
And "Skill Tree" should be hidden (missing "damage" tag)
```

#### Scenario: Clear tag filters

```gherkin
Given tag filters are active
When the user clicks "Clear Filters"
Then all documents should be displayed
And no tags should appear as selected
```

---

### AS-6: Document Search

#### Scenario: Search by document name

```gherkin
Given the following documents exist:
  | Name           |
  | Combat System  |
  | Character      |
  | Combat Skills  |
When the user types "Combat" in the search field
Then "Combat System" and "Combat Skills" should be displayed
And "Character" should be hidden
```

#### Scenario: Search by document content

```gherkin
Given "Character" document contains text "health points and stamina"
When the user searches for "stamina"
Then "Character" document should appear in results
```

#### Scenario: Search with no results

```gherkin
When the user searches for "xyz123nonexistent"
Then an empty state message should display "No documents found matching 'xyz123nonexistent'"
And a suggestion to clear filters or create new document should appear
```

#### Scenario: Search performance

```gherkin
Given 100 system documents exist in the project
When the user types a search query
Then results should appear within 200 milliseconds
```

---

### AS-7: Document Preview

#### Scenario: Preview document without editing

```gherkin
Given a system document with markdown content exists
When the user clicks the eye (preview) icon on the document card
Then a preview modal should open
And the markdown should be rendered as formatted HTML
And the modal should have a close button

When the user clicks outside the modal
Then the modal should close
```

#### Scenario: Preview keyboard navigation

```gherkin
Given the preview modal is open
When the user presses the Escape key
Then the modal should close
```

---

### AS-8: Sidebar Navigation

#### Scenario: Expand and collapse sidebar

```gherkin
Given the system sidebar is in collapsed state
When the user clicks the expand toggle
Then the sidebar should expand to full width
And the document list should be visible
And search and filters should be accessible

When the user clicks the collapse toggle
Then the sidebar should collapse
And only icons should be visible
```

#### Scenario: Sidebar disabled without project

```gherkin
Given no project is currently selected
When the user views the system sidebar
Then the sidebar should be disabled
And a message should indicate "Select a project to view system documents"
```

---

### AS-9: API Integration

#### Scenario: Load documents on project selection

```gherkin
Given the user selects a project
Then the system should fetch all system documents for that project
And display a loading skeleton while fetching
And render the document list when complete
```

#### Scenario: Handle API errors gracefully

```gherkin
Given the API returns an error
Then an error message should display
And a retry button should be available
And the previous data (if any) should remain visible
```

---

## Edge Cases

### EC-1: Empty State

```gherkin
Given a project has no system documents
When the user views the system sidebar
Then an empty state should display
And a prominent "Add Your First Document" button should appear
```

### EC-2: Large Document Handling

```gherkin
Given a document has content exceeding 100KB
When the user saves the document
Then the document should save successfully
And performance should not degrade noticeably
```

### EC-3: Special Characters in Names

```gherkin
Given the user creates a document with name containing special characters
When the user enters "Player's Stats & Attributes"
Then the document should be created successfully
And the name should be displayed correctly
And the file system should handle the name appropriately
```

### EC-4: Concurrent Editing

```gherkin
Given two browser tabs have the same document open
When Tab A saves changes
And Tab B attempts to save older changes
Then Tab B should receive a conflict notification
And the user should be able to reload and retry
```

---

## Quality Gates

### Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Document list render time | < 100ms | Performance API timing |
| Search response time | < 200ms | Performance API timing |
| Document save time | < 500ms | API response time |
| Initial load time | < 1s | Time to interactive |

### Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All interactive elements focusable via Tab |
| Screen reader support | ARIA labels on all interactive elements |
| Focus management | Modal traps focus, returns focus on close |
| Color contrast | WCAG AA compliant (4.5:1 minimum) |

### Test Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Backend routes | 90% |
| Service layer | 85% |
| Store actions | 85% |
| UI components | 80% |
| Overall | 85% |

---

## Verification Methods

### Manual Testing Checklist

- [ ] Create document with all fields
- [ ] Edit document and verify persistence
- [ ] Delete document with confirmation
- [ ] Category filtering works correctly
- [ ] Tag filtering works correctly (single and multiple)
- [ ] Search returns correct results
- [ ] Preview modal renders markdown
- [ ] Sidebar collapse/expand works
- [ ] Empty state displays correctly
- [ ] Error states handled gracefully
- [ ] Keyboard navigation functional
- [ ] Mobile responsive behavior

### Automated Testing

- Unit tests for all service functions
- Unit tests for all store actions
- Integration tests for API endpoints
- Component tests for UI interactions
- E2E tests for critical user flows

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-04 | workflow-spec | Initial acceptance criteria |
=======
## 3. 품질 게이트 (Quality Gates)

### 3.1 테스트 커버리지

| 구분 | 목표 | 측정 방법 |
|------|------|-----------|
| 단위 테스트 커버리지 | 85% 이상 | vitest --coverage |
| 컴포넌트 테스트 | 모든 주요 인터랙션 | @testing-library/react |
| API 통합 테스트 | 모든 엔드포인트 | vitest + supertest |
| E2E 테스트 | 핵심 시나리오 4개 이상 | Playwright 또는 수동 |

### 3.2 성능 기준

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 사이드바 토글 애니메이션 | 200ms 이내 | Performance API |
| 문서 목록 로딩 (100개) | 1초 이내 | 네트워크 탭 |
| 검색 디바운스 | 300ms | 구현 확인 |
| 마크다운 렌더링 | 500ms 이내 | 체감 테스트 |
| API 응답 | 1초 이내 | 네트워크 탭 |

### 3.3 접근성 기준

| 항목 | 요구사항 | 검증 방법 |
|------|----------|-----------|
| ARIA 레이블 | 모든 인터랙티브 요소 | axe-core 검사 |
| 키보드 네비게이션 | Tab, ESC, Enter 지원 | 수동 테스트 |
| 포커스 트랩 | 모달 내부 순환 | 수동 테스트 |
| 색상 대비 | WCAG AA 준수 | lighthouse 접근성 검사 |
| 스크린 리더 | 의미 있는 읽기 순서 | VoiceOver/NVDA 테스트 |

---

## 4. Definition of Done (완료 정의)

### 4.1 코드 완료 기준

- 모든 컴포넌트 구현 완료
- TypeScript 타입 정의 완료 (any 사용 금지)
- ESLint 경고 0개
- Prettier 포맷팅 적용

### 4.2 테스트 완료 기준

- 단위 테스트 85% 이상 커버리지
- 모든 수락 기준에 대한 테스트 작성
- API 엔드포인트 통합 테스트 통과
- E2E 핵심 시나리오 4개 이상 통과

### 4.3 문서화 기준

- 컴포넌트 Props 인터페이스 JSDoc 주석
- API 엔드포인트 문서화
- systemStore 액션 설명 주석
- 사용 예제 코드 포함

### 4.4 통합 기준

- 메인 레이아웃에 사이드바 통합 완료
- 기존 테스트 (SPEC-PROJECT-001, SPEC-KANBAN-001, SPEC-TASK-001) 통과
- 브라우저 호환성 확인 (Chrome, Firefox, Safari)
- 반응형 디자인 확인 (768px 이하)

---

## 5. 검증 방법 및 도구

### 5.1 테스트 도구

| 도구 | 용도 |
|------|------|
| Vitest | 단위/통합 테스트 |
| @testing-library/react | 컴포넌트 테스트 |
| MSW (Mock Service Worker) | API 모킹 |
| axe-core | 접근성 테스트 |
| Playwright | E2E 테스트 (선택) |

### 5.2 검증 명령어

```bash
# 전체 테스트 실행
npm test

# 커버리지 리포트
npm run test:coverage

# 특정 파일 테스트
npm test -- SystemSidebar
npm test -- systemStore

# 접근성 검사
npm run a11y

# 타입 체크
npm run typecheck
```

### 5.3 수동 테스트 체크리스트

- 시스템 문서 생성 후 사이드바에 표시 확인
- 카테고리별 그룹화 및 접기/펼치기 확인
- 마크다운 입력 및 저장 확인
- 미리보기 마크다운 렌더링 확인
- 삭제 후 목록에서 제거 확인
- 검색어 입력 후 필터링 결과 확인
- ESC 키로 모달 닫기 확인
- 탭 키로 포커스 이동 확인
- 사이드바 토글 애니메이션 확인
- 모바일 반응형 확인 (768px 이하)
- 새로고침 후 사이드바 상태 유지 확인

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-01-05 | 초안 작성 |
>>>>>>> main
