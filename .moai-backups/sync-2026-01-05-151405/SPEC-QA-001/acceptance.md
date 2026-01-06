---
id: SPEC-QA-001
version: "1.0.0"
status: "draft"
created: "2026-01-05"
updated: "2026-01-05"
author: "MoAI-ADK"
priority: "high"
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-05 | MoAI-ADK | Initial acceptance criteria creation |

---

# SPEC-QA-001: 인수 조건 (Acceptance Criteria)

## 1. 핵심 시나리오

### Scenario 1: 카테고리 선택 및 질문 로드

```gherkin
Given 태스크가 "Feature List" 컬럼에 있다
  And 사용자가 칸반 보드를 보고 있다
When 사용자가 태스크 카드를 "Design Doc" 컬럼으로 드래그한다
Then QAFormModal이 열린다
  And 기본 카테고리(Game Mechanic)가 선택되어 있다
  And 해당 카테고리의 첫 번째 질문이 표시된다
  And 진행 상태가 "1/3"으로 표시된다

When 사용자가 "Economy" 카테고리를 클릭한다
Then Economy 카테고리가 선택된다
  And Economy 카테고리의 질문 목록이 로드되어 표시된다
  And 진행 상태가 초기화된다
```

### Scenario 2: Q&A 완료 및 AI 트리거

```gherkin
Given QAFormModal이 열려 있다
  And 사용자가 Game Mechanic 카테고리를 선택했다
When 사용자가 첫 번째 질문에 응답을 입력한다
  And "다음" 버튼을 클릭한다
Then 두 번째 질문이 표시된다
  And 진행 상태가 "2/3"으로 업데이트된다

When 사용자가 두 번째, 세 번째 질문에 모두 응답한다
  And "완료" 버튼을 클릭한다
Then 모든 응답이 서버에 저장된다
  And AI 설계 문서 생성이 트리거된다
  And 모달이 닫힌다
  And 태스크 카드에 "AI 생성 중..." 상태가 표시된다

When AI 생성이 완료된다
Then 태스크 상태가 "Design"으로 변경된다
  And "설계 문서가 생성되었습니다" 토스트가 표시된다
```

---

## 2. 기능별 인수 조건

### AC-001: Q&A 폼 모달 오픈

**Scenario: 태스크 드래그로 Q&A 모달 열기**

```gherkin
Given 사용자가 칸반 보드를 보고 있다
  And Feature List 컬럼에 태스크 카드가 있다
When 사용자가 태스크 카드를 Design 컬럼으로 드래그한다
Then Q&A 폼 모달이 열린다
  And 기본 카테고리(Game Mechanic)가 선택되어 있다
  And 첫 번째 질문이 표시된다
  And 진행 상태가 "1/3"으로 표시된다
```

**Scenario: Q&A 완료 없이 드래그 취소**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 아직 어떤 질문에도 응답하지 않았다
When 사용자가 모달을 닫는다 (X 버튼 또는 ESC)
Then 태스크가 원래 Feature List 컬럼에 남아있다
  And 태스크 상태는 변경되지 않는다
```

---

### AC-002: 카테고리 선택

**Scenario: 기본 카테고리 표시**

```gherkin
Given Q&A 폼 모달이 열려 있다
When 모달이 로드된다
Then 3개의 카테고리 옵션이 표시된다 (Game Mechanic, Economy, Growth)
  And Game Mechanic이 기본 선택되어 있다
  And Game Mechanic 카테고리의 질문이 로드되어 있다
```

**Scenario: 카테고리 변경**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And Game Mechanic 카테고리가 선택되어 있다
When 사용자가 Economy 카테고리를 클릭한다
Then Economy 카테고리가 선택된다
  And Economy 카테고리의 질문 목록이 로드된다
  And 진행 상태가 초기화된다 (1/N)
```

**Scenario: 응답 중 카테고리 변경 경고**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 사용자가 첫 번째 질문에 이미 응답했다
When 사용자가 다른 카테고리를 클릭한다
Then "기존 응답이 초기화됩니다. 계속하시겠습니까?" 확인 다이얼로그가 표시된다
When 사용자가 "확인"을 클릭한다
Then 기존 응답이 초기화된다
  And 새 카테고리의 질문이 로드된다
```

---

### AC-003: 질문 응답

**Scenario: 질문에 응답 입력**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 질문이 표시되어 있다
When 사용자가 텍스트 영역에 응답을 입력한다
Then 입력한 내용이 실시간으로 표시된다
  And "다음" 버튼이 활성화된다
```

**Scenario: 필수 질문 미응답 시 다음 버튼 비활성화**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 질문이 필수 질문이다
When 응답 필드가 비어있다
Then "다음" 버튼이 비활성화되어 있다
  And "응답을 입력해주세요" 안내 메시지가 표시된다
```

**Scenario: 최대 글자 수 제한**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 질문의 최대 글자 수가 1000자다
When 사용자가 950자를 입력한다
Then "950/1000" 글자 수 표시가 나타난다
When 사용자가 1000자를 초과하여 입력하려 한다
Then 추가 입력이 차단된다
  And 글자 수 표시가 "1000/1000 (최대)"로 변경된다
```

---

### AC-004: 단계 진행

**Scenario: 다음 질문으로 이동**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 첫 번째 질문(1/3)이 표시되어 있다
  And 사용자가 응답을 입력했다
When 사용자가 "다음" 버튼을 클릭한다
Then 두 번째 질문(2/3)이 표시된다
  And 진행 상태가 "2/3"으로 업데이트된다
  And 이전 응답이 저장되어 있다
```

**Scenario: 이전 질문으로 돌아가기**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 두 번째 질문(2/3)이 표시되어 있다
When 사용자가 "이전" 버튼을 클릭한다
Then 첫 번째 질문(1/3)이 표시된다
  And 이전에 입력한 응답이 유지되어 있다
```

**Scenario: 첫 번째 질문에서 이전 버튼 비활성화**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 첫 번째 질문(1/3)이 표시되어 있다
Then "이전" 버튼이 비활성화되어 있다
```

**Scenario: 마지막 질문에서 완료 버튼 표시**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 마지막 질문(3/3)이 표시되어 있다
Then "다음" 버튼 대신 "완료" 버튼이 표시된다
```

---

### AC-005: 진행 상태 표시

**Scenario: 진행률 시각화**

```gherkin
Given Q&A 폼 모달이 열려 있다
When 사용자가 각 단계를 진행한다
Then 프로그레스 바 또는 단계 표시가 현재 진행률을 반영한다
  And 완료된 단계는 체크 표시 또는 색상으로 구분된다
  And 현재 단계는 강조되어 표시된다
```

**Scenario: 진행 표시 클릭으로 단계 이동**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 현재 세 번째 질문(3/3)이 표시되어 있다
  And 첫 번째와 두 번째 질문에 응답이 있다
When 사용자가 진행 표시에서 첫 번째 단계를 클릭한다
Then 첫 번째 질문으로 이동한다
  And 기존 응답이 유지되어 있다
```

---

### AC-006: Q&A 완료

**Scenario: 모든 질문 응답 후 완료**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 모든 필수 질문에 응답했다
  And 현재 마지막 질문이 표시되어 있다
When 사용자가 "완료" 버튼을 클릭한다
Then 모든 응답이 서버에 저장된다
  And AI 설계 문서 생성이 트리거된다
  And 모달이 닫힌다
  And 태스크 카드에 "AI 생성 중..." 상태가 표시된다
```

**Scenario: 응답 저장 실패**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 모든 질문에 응답했다
When 사용자가 "완료" 버튼을 클릭한다
  And 네트워크 오류로 저장이 실패한다
Then 에러 메시지가 표시된다 "저장에 실패했습니다. 다시 시도해주세요."
  And 응답이 로컬에 임시 저장된다
  And "재시도" 버튼이 표시된다
```

---

### AC-007: AI 설계 문서 생성 트리거

**Scenario: AI 생성 성공**

```gherkin
Given Q&A가 완료되었다
  And AI 설계 문서 생성이 트리거되었다
When AI 생성이 완료된다 (120초 이내)
Then 설계 문서가 workspace/projects/{projectId}/tasks/{taskId}/design_doc.md에 저장된다
  And 태스크 상태가 "design"으로 변경된다
  And 태스크 카드에서 로딩 상태가 해제된다
  And "설계 문서가 생성되었습니다" 토스트가 표시된다
```

**Scenario: AI 생성 타임아웃**

```gherkin
Given Q&A가 완료되었다
  And AI 설계 문서 생성이 트리거되었다
When 120초가 경과해도 생성이 완료되지 않는다
Then 타임아웃 에러 토스트가 표시된다 "AI 생성 시간이 초과되었습니다"
  And 태스크 카드에 "재시도" 버튼이 표시된다
  And 태스크가 Feature List 컬럼에 남아있다
```

**Scenario: AI 생성 실패**

```gherkin
Given Q&A가 완료되었다
  And AI 설계 문서 생성이 트리거되었다
When AI 생성 중 오류가 발생한다
Then 에러 토스트가 표시된다 "설계 문서 생성에 실패했습니다"
  And 태스크 카드에 "재시도" 버튼이 표시된다
  And Q&A 응답은 유지된다
```

---

### AC-008: 모달 닫기 및 취소

**Scenario: 응답 중 모달 닫기 시도**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 사용자가 일부 질문에 응답했다
When 사용자가 X 버튼을 클릭하거나 ESC 키를 누른다
Then "작성 중인 내용이 사라집니다. 닫으시겠습니까?" 확인 다이얼로그가 표시된다
When 사용자가 "확인"을 클릭한다
Then 모달이 닫힌다
  And 응답이 삭제된다
  And 태스크가 Feature List 컬럼에 남아있다
```

**Scenario: 응답 없이 모달 닫기**

```gherkin
Given Q&A 폼 모달이 열려 있다
  And 아직 어떤 질문에도 응답하지 않았다
When 사용자가 X 버튼을 클릭하거나 ESC 키를 누른다
Then 확인 없이 모달이 닫힌다
  And 태스크가 Feature List 컬럼에 남아있다
```

---

## 3. 비기능 인수 조건

### AC-NFR-001: 성능

```gherkin
Scenario: 모달 오픈 성능
Given 칸반 보드가 로드되어 있다
When 사용자가 태스크를 Design 컬럼으로 드래그한다
Then Q&A 폼 모달이 200ms 이내에 표시된다

Scenario: 질문 로드 성능
Given Q&A 폼 모달이 열려 있다
When 카테고리가 변경된다
Then 새 질문 목록이 500ms 이내에 로드된다

Scenario: 단계 전환 성능
Given Q&A 폼 모달이 열려 있다
When 사용자가 "다음" 또는 "이전" 버튼을 클릭한다
Then 다음/이전 질문이 300ms 이내에 표시된다
```

### AC-NFR-002: 접근성

```gherkin
Scenario: 키보드 네비게이션
Given Q&A 폼 모달이 열려 있다
When 사용자가 Tab 키를 사용하여 탐색한다
Then 카테고리 선택 -> 응답 필드 -> 이전/다음 버튼 순으로 포커스가 이동한다

Scenario: 스크린 리더 호환
Given 스크린 리더가 활성화되어 있다
When Q&A 폼 모달이 열린다
Then 모달 제목, 현재 질문, 진행 상태가 읽힌다
  And 각 입력 필드에 적절한 레이블이 연결되어 있다

Scenario: ESC 키로 모달 닫기
Given Q&A 폼 모달이 열려 있다
When 사용자가 ESC 키를 누른다
Then 모달 닫기 동작이 트리거된다
```

### AC-NFR-003: 반응형 디자인

```gherkin
Scenario: 데스크톱 레이아웃
Given 화면 너비가 1024px 이상이다
When Q&A 폼 모달이 열린다
Then 모달 너비가 640px로 표시된다
  And 모달이 화면 중앙에 위치한다

Scenario: 태블릿 레이아웃
Given 화면 너비가 768px ~ 1023px다
When Q&A 폼 모달이 열린다
Then 모달 너비가 화면 너비의 80%로 표시된다

Scenario: 모바일 레이아웃
Given 화면 너비가 767px 이하다
When Q&A 폼 모달이 열린다
Then 모달이 화면 전체를 차지한다 (full-screen modal)
  And 버튼이 하단에 고정되어 표시된다
```

---

## 4. 엣지 케이스

### EC-001: 네트워크 오류 복구

```gherkin
Scenario: 오프라인 상태에서 Q&A 진행
Given 사용자가 Q&A를 진행 중이다
When 네트워크 연결이 끊어진다
  And 사용자가 "완료"를 클릭한다
Then 응답이 로컬 스토리지에 저장된다
  And "오프라인 상태입니다. 연결 복구 시 자동 저장됩니다" 메시지가 표시된다

Scenario: 네트워크 복구 후 자동 저장
Given Q&A 응답이 로컬에 저장되어 있다
When 네트워크 연결이 복구된다
Then 로컬에 저장된 응답이 서버에 자동 저장된다
  And "응답이 저장되었습니다" 토스트가 표시된다
```

### EC-002: 질문 템플릿 로드 실패

```gherkin
Scenario: 템플릿 파일 누락
Given Q&A 폼 모달이 열린다
When 질문 템플릿 JSON 파일이 존재하지 않는다
Then 기본 폴백 질문 3개가 표시된다
  And 콘솔에 경고 로그가 출력된다
```

### EC-003: 동시 편집 방지

```gherkin
Scenario: 같은 태스크의 중복 Q&A 시도
Given 사용자 A가 태스크의 Q&A를 진행 중이다
When 사용자 B가 같은 태스크를 Design 컬럼으로 드래그한다
Then "다른 사용자가 이 태스크를 편집 중입니다" 메시지가 표시된다
  And Q&A 모달이 열리지 않는다
```

---

## 5. 품질 기준 (Quality Criteria)

### 5.1 테스트 커버리지

- 단위 테스트 커버리지: 85% 이상
- 통합 테스트: 핵심 플로우 100% 커버
- E2E 테스트: 주요 시나리오 완료

### 5.2 성능 기준

- 모달 오픈: 200ms 이내
- 질문 로드: 500ms 이내
- API 응답: 2초 이내

### 5.3 접근성 기준

- WCAG 2.1 AA 준수
- 키보드 네비게이션 완전 지원
- 스크린 리더 호환

---

## 6. 테스트 체크리스트

### 기능 테스트

- [ ] Q&A 폼 모달이 드래그 시 정상 오픈
- [ ] 3개 카테고리 전환 동작
- [ ] 카테고리 변경 시 확인 다이얼로그
- [ ] 질문 응답 입력 및 저장
- [ ] 단계 진행 (다음/이전)
- [ ] 진행 상태 표시 업데이트
- [ ] 필수 응답 검증
- [ ] 최대 글자 수 제한
- [ ] Q&A 완료 및 AI 트리거
- [ ] 모달 닫기 및 취소 동작
- [ ] 에러 핸들링 및 재시도

### 비기능 테스트

- [ ] 모달 오픈 성능 (< 200ms)
- [ ] 질문 로드 성능 (< 500ms)
- [ ] 키보드 네비게이션
- [ ] 스크린 리더 호환성
- [ ] 반응형 레이아웃
- [ ] 오프라인 대응

### 통합 테스트

- [ ] 칸반 드래그 -> Q&A -> AI 생성 전체 플로우
- [ ] 기존 Q&A 응답 로드 및 수정
- [ ] 다중 브라우저 탭 동작

---

## 7. Definition of Done

1. 모든 기능 인수 조건 (AC-001 ~ AC-008) 통과
2. 모든 비기능 인수 조건 (AC-NFR-001 ~ AC-NFR-003) 통과
3. 엣지 케이스 테스트 완료
4. 코드 리뷰 완료
5. 단위 테스트 커버리지 85% 이상
6. 통합 테스트 통과
7. 접근성 테스트 통과 (WCAG AA)
8. 문서 업데이트 완료

---

## 8. 추적성

| 항목 | 참조 |
|------|------|
| SPEC 참조 | SPEC-QA-001 |
| 요구사항 매핑 | FR-001 ~ FR-005 |
| PRD 항목 | Feature 6 - Form-based Q&A System |
| spec.md | /Users/mimir/Apps/DesignWorkflow/.moai/specs/SPEC-QA-001/spec.md |
| plan.md | /Users/mimir/Apps/DesignWorkflow/.moai/specs/SPEC-QA-001/plan.md |
