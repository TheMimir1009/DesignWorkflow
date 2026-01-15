# SPEC-KANBAN-001: 인수 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-KANBAN-001 |
| **제목** | 칸반 보드 (Kanban Board) |
| **관련 SPEC** | spec.md, plan.md |

---

## 1. 기능 인수 기준 (Given-When-Then)

### 1.1 칸반 보드 초기 렌더링

#### AC-001: 프로젝트 선택 시 칸반 보드 표시

```gherkin
Feature: 칸반 보드 초기 렌더링
  사용자로서,
  프로젝트를 선택하면 해당 프로젝트의 태스크를 칸반 보드에서 확인하고 싶다.

  Scenario: 프로젝트 선택 시 태스크 로드
    Given 사용자가 로그인되어 있고
    And 프로젝트 "테스트 프로젝트"에 3개의 태스크가 존재할 때
    When 사용자가 "테스트 프로젝트"를 선택하면
    Then 칸반 보드에 4개의 컬럼이 표시되어야 하고
    And 각 컬럼 헤더에 "Feature List", "Design Document", "PRD", "Prototype"이 표시되어야 하고
    And 해당 프로젝트의 태스크들이 각 상태에 맞는 컬럼에 표시되어야 한다

  Scenario: 프로젝트 미선택 시 안내 메시지
    Given 사용자가 로그인되어 있고
    And 아직 프로젝트를 선택하지 않았을 때
    When 칸반 보드 영역을 확인하면
    Then "프로젝트를 선택하세요" 메시지가 표시되어야 한다
```

#### AC-002: 컬럼 태스크 개수 배지 표시

```gherkin
Feature: 컬럼 태스크 개수 배지
  사용자로서,
  각 단계에 몇 개의 태스크가 있는지 빠르게 파악하고 싶다.

  Scenario: 각 컬럼에 태스크 개수 표시
    Given 프로젝트가 선택되어 있고
    And Feature List에 5개, Design에 3개, PRD에 2개, Prototype에 1개의 태스크가 있을 때
    When 칸반 보드를 확인하면
    Then Feature List 컬럼 헤더에 "5" 배지가 표시되어야 하고
    And Design Document 컬럼 헤더에 "3" 배지가 표시되어야 하고
    And PRD 컬럼 헤더에 "2" 배지가 표시되어야 하고
    And Prototype 컬럼 헤더에 "1" 배지가 표시되어야 한다
```

---

### 1.2 드래그 앤 드롭 기능

#### AC-003: 태스크 컬럼 간 이동

```gherkin
Feature: 드래그 앤 드롭으로 태스크 이동
  사용자로서,
  태스크를 드래그하여 다른 워크플로우 단계로 이동시키고 싶다.

  Scenario: Feature List에서 Design으로 태스크 이동
    Given 프로젝트가 선택되어 있고
    And "가챠 시스템" 태스크가 Feature List 컬럼에 있을 때
    When 사용자가 "가챠 시스템" 카드를 Design Document 컬럼으로 드래그하면
    Then 드래그 중 카드가 회전(rotate-3)하고 투명도(opacity-50)가 적용되어야 하고
    And Design Document 컬럼에 하이라이트(ring-2)가 표시되어야 하고
    And 드롭 후 "가챠 시스템" 태스크가 Design Document 컬럼에 표시되어야 하고
    And API PUT /api/tasks/{id}/status가 호출되어야 하고
    And Feature List 컬럼의 태스크 개수가 1 감소해야 하고
    And Design Document 컬럼의 태스크 개수가 1 증가해야 한다

  Scenario: 역방향 이동 (PRD에서 Design으로)
    Given "전투 시스템" 태스크가 PRD 컬럼에 있을 때
    When 사용자가 "전투 시스템" 카드를 Design Document 컬럼으로 드래그하면
    Then "전투 시스템" 태스크가 Design Document 컬럼으로 이동되어야 한다

  Scenario: 동일 컬럼에 드롭 시 변경 없음
    Given "레벨업 시스템" 태스크가 Feature List 컬럼에 있을 때
    When 사용자가 "레벨업 시스템" 카드를 같은 Feature List 컬럼에 드롭하면
    Then 태스크 상태가 변경되지 않아야 하고
    And API가 호출되지 않아야 한다
```

#### AC-004: 드래그 오버레이 표시

```gherkin
Feature: 드래그 미리보기
  사용자로서,
  드래그 중인 카드를 명확하게 확인하고 싶다.

  Scenario: 드래그 시 오버레이 표시
    Given 프로젝트가 선택되어 있고
    And "퀘스트 시스템" 태스크가 Feature List에 있을 때
    When 사용자가 "퀘스트 시스템" 카드를 드래그 시작하면
    Then 마우스 커서 위치에 카드 미리보기(DragOverlay)가 표시되어야 하고
    And 원본 카드 위치에 원본 카드가 유지되어야 하고
    And 드래그 종료 시 오버레이가 사라져야 한다
```

---

### 1.3 태스크 카드 표시

#### AC-005: 태스크 카드 콘텐츠

```gherkin
Feature: 태스크 카드 정보 표시
  사용자로서,
  카드에서 태스크의 핵심 정보를 빠르게 확인하고 싶다.

  Scenario: 기본 카드 정보 표시
    Given 프로젝트가 선택되어 있고
    And "인벤토리 시스템" 태스크가 다음 정보를 가질 때:
      | 필드          | 값                              |
      | title         | 인벤토리 시스템                  |
      | featureList   | 아이템 저장, 정렬, 필터링 기능   |
    When 칸반 보드에서 해당 카드를 확인하면
    Then 카드 제목으로 "인벤토리 시스템"이 표시되어야 하고
    And 설명으로 "아이템 저장, 정렬, 필터링 기능"이 2줄까지 표시되어야 한다

  Scenario: 상태 배지 표시
    Given "성장 시스템" 태스크가 다음 상태를 가질 때:
      | 필드            | 값    |
      | designDocument  | 존재  |
      | prd             | null  |
      | prototype       | null  |
    When 칸반 보드에서 해당 카드를 확인하면
    Then 녹색 "Design" 배지가 표시되어야 하고
    And "PRD" 배지는 표시되지 않아야 하고
    And "Code" 배지는 표시되지 않아야 한다

  Scenario: 모든 상태 배지 표시
    Given "경제 시스템" 태스크가 모든 문서를 가질 때:
      | 필드            | 값    |
      | designDocument  | 존재  |
      | prd             | 존재  |
      | prototype       | 존재  |
    When 칸반 보드에서 해당 카드를 확인하면
    Then 녹색 "Design" 배지가 표시되어야 하고
    And 보라색 "PRD" 배지가 표시되어야 하고
    And 주황색 "Code" 배지가 표시되어야 한다
```

#### AC-006: AI 생성 중 표시

```gherkin
Feature: AI 생성 상태 표시
  사용자로서,
  태스크가 AI 문서 생성 중인지 확인하고 싶다.

  Scenario: AI 생성 중 인디케이터
    Given "매칭 시스템" 태스크가 AI 생성 중일 때
    When 칸반 보드에서 해당 카드를 확인하면
    Then 카드 테두리가 파란색(border-blue-400)으로 표시되어야 하고
    And 펄스 애니메이션(animate-pulse)이 적용되어야 하고
    And "AI 생성 중..." 텍스트와 스피너가 표시되어야 하고
    And 해당 카드는 드래그할 수 없어야 한다
```

---

### 1.4 태스크 CRUD 기능

#### AC-007: 새 태스크 생성

```gherkin
Feature: 새 태스크 생성
  사용자로서,
  새로운 기능 아이디어를 태스크로 등록하고 싶다.

  Scenario: Feature List에 새 태스크 추가
    Given 프로젝트가 선택되어 있고
    And Feature List 컬럼의 "+" 버튼이 표시되어 있을 때
    When 사용자가 "+" 버튼을 클릭하고
    And 제목에 "보스 레이드"를 입력하고
    And 설명에 "주간 보스 레이드 콘텐츠"를 입력하고
    And "생성" 버튼을 클릭하면
    Then API POST /api/projects/{pid}/tasks가 호출되어야 하고
    And Feature List 컬럼에 "보스 레이드" 카드가 추가되어야 하고
    And Feature List 컬럼의 태스크 개수가 1 증가해야 한다
```

#### AC-008: 태스크 상세 보기

```gherkin
Feature: 태스크 상세 모달
  사용자로서,
  태스크의 전체 정보와 생성된 문서를 확인하고 싶다.

  Scenario: 태스크 카드 클릭 시 상세 모달 표시
    Given 프로젝트가 선택되어 있고
    And "길드 시스템" 태스크가 존재할 때
    When 사용자가 "길드 시스템" 카드를 클릭하면
    Then TaskDetailModal이 열려야 하고
    And 태스크 제목이 표시되어야 하고
    And Feature List 내용이 표시되어야 하고
    And 닫기 버튼이 표시되어야 한다

  Scenario: 생성된 문서 탭 표시
    Given "길드 시스템" 태스크에 Design Document가 존재할 때
    When TaskDetailModal이 열리면
    Then "Design" 탭이 활성화 가능해야 하고
    And "Design" 탭 클릭 시 마크다운 형식의 문서가 표시되어야 한다
```

#### AC-009: 태스크 삭제

```gherkin
Feature: 태스크 삭제
  사용자로서,
  더 이상 필요 없는 태스크를 삭제하고 싶다.

  Scenario: 삭제 확인 후 태스크 삭제
    Given "테스트 태스크"가 Feature List에 있고
    And TaskDetailModal이 열려 있을 때
    When 사용자가 "삭제" 버튼을 클릭하면
    Then "정말 삭제하시겠습니까?" 확인 다이얼로그가 표시되어야 하고
    When 사용자가 "확인"을 클릭하면
    Then API DELETE /api/tasks/{id}가 호출되어야 하고
    And 태스크가 칸반 보드에서 제거되어야 하고
    And TaskDetailModal이 닫혀야 한다

  Scenario: 삭제 취소
    Given 삭제 확인 다이얼로그가 표시되어 있을 때
    When 사용자가 "취소"를 클릭하면
    Then 태스크가 삭제되지 않아야 하고
    And 다이얼로그가 닫혀야 한다
```

---

### 1.5 반응형 디자인

#### AC-010: 모바일 뷰 대응

```gherkin
Feature: 반응형 칸반 보드
  사용자로서,
  모바일 기기에서도 칸반 보드를 사용하고 싶다.

  Scenario: 모바일 뷰포트에서 가로 스크롤
    Given 뷰포트 너비가 768px 미만일 때
    When 칸반 보드를 확인하면
    Then 4개의 컬럼이 가로로 배치되어야 하고
    And 가로 스크롤이 활성화되어야 하고
    And 각 컬럼 너비(w-80)가 유지되어야 한다

  Scenario: 터치 드래그 지원
    Given 터치 기기에서 칸반 보드를 사용할 때
    When 사용자가 카드를 길게 터치하고 드래그하면
    Then 드래그 앤 드롭이 정상 동작해야 한다
```

---

## 2. 비기능 인수 기준

### 2.1 성능 기준

| ID | 기준 | 목표값 |
|----|------|--------|
| P-001 | 태스크 목록 로딩 시간 | < 500ms (50개 태스크 기준) |
| P-002 | 드래그 앤 드롭 반응 지연 | < 100ms |
| P-003 | 상태 업데이트 후 UI 반영 | < 200ms (낙관적 업데이트) |
| P-004 | 초기 번들 크기 증가 | < 50KB (@dnd-kit 포함) |

### 2.2 접근성 기준

| ID | 기준 | 요구사항 |
|----|------|----------|
| A-001 | 키보드 네비게이션 | Tab으로 카드 간 이동, Enter로 선택 |
| A-002 | 스크린 리더 | ARIA 레이블 제공 (role, aria-label) |
| A-003 | 색상 대비 | WCAG 2.1 AA 수준 (4.5:1 이상) |
| A-004 | 포커스 표시 | 포커스 시 가시적 outline 표시 |

### 2.3 호환성 기준

| ID | 브라우저 | 버전 |
|----|----------|------|
| C-001 | Chrome | 120+ |
| C-002 | Firefox | 120+ |
| C-003 | Safari | 17+ |
| C-004 | Edge | 120+ |
| C-005 | Mobile Safari | iOS 17+ |
| C-006 | Chrome Mobile | Android 13+ |

---

## 3. 에러 처리 기준

### 3.1 API 오류 처리

```gherkin
Feature: API 오류 복구
  사용자로서,
  네트워크 오류 시에도 데이터가 보존되기를 원한다.

  Scenario: 상태 업데이트 실패 시 롤백
    Given 사용자가 태스크를 드래그하여 이동했을 때
    When API 호출이 실패하면 (네트워크 오류)
    Then 태스크가 원래 컬럼으로 롤백되어야 하고
    And 에러 메시지가 표시되어야 한다

  Scenario: 태스크 로딩 실패
    Given 프로젝트를 선택했을 때
    When 태스크 목록 API가 실패하면
    Then "태스크를 불러오는 데 실패했습니다" 메시지가 표시되어야 하고
    And "다시 시도" 버튼이 표시되어야 한다
```

---

## 4. Definition of Done (완료 정의)

### 4.1 필수 완료 조건

- [ ] 모든 기능 인수 기준(AC-001 ~ AC-010) 통과
- [ ] TypeScript 컴파일 오류 없음 (strict 모드)
- [ ] ESLint 경고/오류 없음
- [ ] API 연동 정상 동작 (CRUD)
- [ ] 드래그 앤 드롭 정상 동작
- [ ] 모바일 터치 지원 확인
- [ ] 크롬 개발자 도구 콘솔 오류 없음

### 4.2 권장 완료 조건

- [ ] Lighthouse 접근성 점수 90+
- [ ] 단위 테스트 커버리지 80%+
- [ ] E2E 테스트 통과 (주요 시나리오)
- [ ] 코드 리뷰 완료

---

## 5. 테스트 시나리오

### 5.1 수동 테스트 체크리스트

| ID | 테스트 항목 | 예상 결과 |
|----|------------|----------|
| T-001 | 프로젝트 선택 후 태스크 로드 | 4개 컬럼에 태스크 표시 |
| T-002 | 카드 드래그 시 시각 피드백 | 회전, 투명도 적용 |
| T-003 | 컬럼 간 카드 이동 | 상태 변경 및 API 호출 |
| T-004 | 카드 클릭 시 모달 표시 | TaskDetailModal 열림 |
| T-005 | 새 태스크 생성 | Feature List에 카드 추가 |
| T-006 | 태스크 삭제 | 확인 후 카드 제거 |
| T-007 | 모바일 가로 스크롤 | 4개 컬럼 스크롤 가능 |
| T-008 | AI 생성 중 표시 | 펄스 애니메이션 및 텍스트 |

### 5.2 API 테스트

```bash
# 태스크 목록 조회
curl http://localhost:3001/api/projects/{pid}/tasks
# 예상: { success: true, data: Task[], error: null }

# 태스크 생성
curl -X POST http://localhost:3001/api/projects/{pid}/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","featureList":"설명"}'
# 예상: { success: true, data: Task, error: null }

# 상태 업데이트
curl -X PUT http://localhost:3001/api/tasks/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status":"design"}'
# 예상: { success: true, data: Task, error: null }

# 태스크 삭제
curl -X DELETE http://localhost:3001/api/tasks/{id}
# 예상: { success: true, data: { deleted: true }, error: null }
```

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
