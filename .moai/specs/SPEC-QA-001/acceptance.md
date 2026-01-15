# SPEC-QA-001: 인수 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-QA-001 |
| **제목** | Q&A 시스템 (Q&A System) |
| **관련 SPEC** | spec.md, plan.md |

---

## 1. 기능 인수 기준 (Given-When-Then)

### 1.1 Q&A 트리거 기능

#### AC-001: Feature List → Design Doc 이동 시 Q&A 모달 표시

```gherkin
Feature: Q&A 시스템 트리거
  게임 기획자로서,
  Feature 카드를 Design Doc 단계로 이동할 때 Q&A를 통해 상세 정보를 입력하고 싶다.

  Background:
    Given 사용자가 로그인되어 있고
    And 프로젝트 "RPG 게임"이 선택되어 있고
    And Feature List에 "가챠 시스템" 태스크가 존재할 때

  Scenario: Feature → Design 이동 시 Q&A 모달 자동 열기
    When 사용자가 "가챠 시스템" 카드를 Feature List에서 Design Doc 컬럼으로 드래그하면
    Then Q&A 모달이 자동으로 열려야 하고
    And 카드는 아직 Feature List에 남아있어야 하고
    And 모달 제목에 "가챠 시스템 - Q&A"가 표시되어야 한다

  Scenario: Design → PRD 이동 시 Q&A 트리거 안 함
    Given "전투 시스템" 태스크가 Design Doc 컬럼에 있을 때
    When 사용자가 "전투 시스템" 카드를 PRD 컬럼으로 드래그하면
    Then Q&A 모달이 열리지 않아야 하고
    And 카드가 PRD 컬럼으로 즉시 이동해야 한다

  Scenario: PRD → Feature List 역방향 이동 시 Q&A 트리거 안 함
    Given "인벤토리 시스템" 태스크가 PRD 컬럼에 있을 때
    When 사용자가 "인벤토리 시스템" 카드를 Feature List 컬럼으로 드래그하면
    Then Q&A 모달이 열리지 않아야 하고
    And 카드가 Feature List 컬럼으로 즉시 이동해야 한다
```

#### AC-002: 기존 Q&A 데이터 존재 시 재시작 확인

```gherkin
Feature: Q&A 재시작 확인
  게임 기획자로서,
  이미 Q&A를 완료한 태스크를 다시 Feature List로 옮긴 후 Design으로 이동할 때
  기존 응답을 유지할지 새로 시작할지 선택하고 싶다.

  Scenario: 기존 Q&A 데이터 존재 시 확인 다이얼로그
    Given "성장 시스템" 태스크에 이전 Q&A 응답 5개가 저장되어 있고
    And 해당 태스크가 Feature List 컬럼에 있을 때
    When 사용자가 "성장 시스템" 카드를 Design Doc 컬럼으로 드래그하면
    Then "기존 Q&A 응답이 있습니다. 어떻게 하시겠습니까?" 다이얼로그가 표시되어야 하고
    And "기존 응답 유지" 옵션이 있어야 하고
    And "새로 시작" 옵션이 있어야 한다

  Scenario: 기존 응답 유지 선택
    Given Q&A 확인 다이얼로그가 표시되어 있을 때
    When 사용자가 "기존 응답 유지"를 선택하면
    Then Q&A 모달이 열려야 하고
    And 이전 응답들이 각 질문에 미리 채워져 있어야 한다

  Scenario: 새로 시작 선택
    Given Q&A 확인 다이얼로그가 표시되어 있을 때
    When 사용자가 "새로 시작"을 선택하면
    Then Q&A 모달이 열려야 하고
    And 모든 응답 필드가 비어있어야 하고
    And LLM 질문 생성 요청이 발생해야 한다
```

---

### 1.2 AI 질문 생성 기능

#### AC-003: LLM 기반 질문 생성

```gherkin
Feature: AI 질문 생성
  게임 기획자로서,
  Feature 설명에 맞는 맞춤형 질문을 AI가 생성해주기를 원한다.

  Scenario: LLM 질문 생성 성공
    Given Q&A 모달이 열렸고
    And OpenAI API가 정상 동작할 때
    When LLM에게 "가챠 시스템: 캐릭터와 무기를 뽑는 랜덤 보상 시스템" 설명으로 질문 생성을 요청하면
    Then 5-7개의 질문이 생성되어야 하고
    And 각 질문은 다음 카테고리 중 하나에 속해야 하고:
      | 카테고리              | 설명           |
      | target_users          | 대상 사용자     |
      | technical_constraints | 기술 제약       |
      | success_metrics       | 성공 지표       |
      | dependencies          | 의존성          |
      | priority_rationale    | 우선순위 근거   |
    And 로딩 인디케이터가 사라져야 하고
    And 첫 번째 질문이 표시되어야 한다

  Scenario: 질문 생성 중 로딩 상태 표시
    Given Q&A 모달이 열렸을 때
    When LLM 질문 생성 요청이 진행 중이면
    Then 로딩 스피너가 표시되어야 하고
    And "AI가 질문을 생성하고 있습니다..." 메시지가 표시되어야 하고
    And 이전/다음/완료 버튼이 비활성화되어야 한다

  Scenario: LLM 질문 생성 실패 시 폴백
    Given Q&A 모달이 열렸고
    And LLM API 호출이 실패할 때
    Then "질문 생성에 실패했습니다" 에러 메시지가 표시되어야 하고
    And "기본 질문 사용" 버튼이 표시되어야 하고
    When 사용자가 "기본 질문 사용" 버튼을 클릭하면
    Then 미리 정의된 5개의 기본 질문이 로드되어야 한다
```

---

### 1.3 Q&A 진행 기능

#### AC-004: 질문 네비게이션

```gherkin
Feature: Q&A 질문 네비게이션
  게임 기획자로서,
  질문들을 순차적으로 탐색하고 응답을 입력하고 싶다.

  Background:
    Given Q&A 모달이 열려있고
    And 7개의 질문이 생성되어 있을 때

  Scenario: 다음 질문으로 이동
    Given 현재 1번째 질문이 표시되어 있고
    And 응답이 입력되어 있을 때
    When 사용자가 "다음" 버튼을 클릭하면
    Then 2번째 질문이 표시되어야 하고
    And 진행 상태가 "2/7"로 업데이트되어야 하고
    And 진행률 바가 약 29%로 표시되어야 한다

  Scenario: 이전 질문으로 이동
    Given 현재 3번째 질문이 표시되어 있을 때
    When 사용자가 "이전" 버튼을 클릭하면
    Then 2번째 질문이 표시되어야 하고
    And 이전에 입력한 2번째 응답이 복원되어야 한다

  Scenario: 첫 번째 질문에서 이전 버튼 비활성화
    Given 현재 1번째 질문이 표시되어 있을 때
    Then "이전" 버튼이 비활성화되어야 한다

  Scenario: 마지막 질문에서 완료 버튼 표시
    Given 현재 7번째(마지막) 질문이 표시되어 있을 때
    Then "다음" 버튼 대신 "완료" 버튼이 표시되어야 한다

  Scenario: 필수 질문 미응답 시 다음 버튼 비활성화
    Given 현재 질문이 필수(required: true)이고
    And 응답이 비어있을 때
    Then "다음" 버튼이 비활성화되어야 한다
```

#### AC-005: 진행 상태 표시

```gherkin
Feature: Q&A 진행 상태 표시
  게임 기획자로서,
  Q&A 진행 상황을 한눈에 파악하고 싶다.

  Scenario: 진행률 바 표시
    Given Q&A 모달에 7개의 질문이 있고
    And 현재 3번째 질문이 표시되어 있을 때
    Then 진행률 바가 모달 상단에 표시되어야 하고
    And 진행률이 약 43% (3/7)로 시각적으로 표시되어야 하고
    And "3/7" 텍스트가 표시되어야 한다

  Scenario: 카테고리 라벨 표시
    Given 현재 질문의 카테고리가 "target_users"일 때
    Then 질문 상단에 "대상 사용자" 라벨이 파란색 배지로 표시되어야 한다

  Scenario: 각 카테고리별 색상 구분
    Given 다양한 카테고리의 질문이 있을 때
    Then 각 카테고리는 다음 색상으로 구분되어야 한다:
      | 카테고리              | 배경색       | 텍스트색     |
      | target_users          | bg-blue-100  | text-blue-800  |
      | technical_constraints | bg-red-100   | text-red-800   |
      | success_metrics       | bg-green-100 | text-green-800 |
      | dependencies          | bg-yellow-100| text-yellow-800|
      | priority_rationale    | bg-purple-100| text-purple-800|
```

---

### 1.4 Q&A 완료 및 건너뛰기

#### AC-006: Q&A 완료

```gherkin
Feature: Q&A 완료
  게임 기획자로서,
  모든 질문에 응답한 후 Q&A를 완료하고 카드를 Design Doc으로 이동시키고 싶다.

  Scenario: Q&A 완료 처리
    Given 모든 7개 질문에 응답을 완료했고
    And 마지막 질문이 표시되어 있을 때
    When 사용자가 "완료" 버튼을 클릭하면
    Then 모든 응답이 서버에 저장되어야 하고
    And Q&A 세션이 'completed' 상태로 변경되어야 하고
    And Q&A 모달이 닫혀야 하고
    And 해당 태스크 카드가 Design Doc 컬럼으로 이동해야 하고
    And Design Doc 컬럼의 태스크 개수가 1 증가해야 한다

  Scenario: 완료 후 Task에 Q&A 응답 저장 확인
    Given Q&A가 완료되었을 때
    When 해당 태스크의 상세 정보를 확인하면
    Then task.qaAnswers 배열에 7개의 응답이 저장되어 있어야 하고
    And 각 응답에 questionId, category, answer, answeredAt이 포함되어야 한다
```

#### AC-007: Q&A 건너뛰기

```gherkin
Feature: Q&A 건너뛰기
  게임 기획자로서,
  Q&A 없이 카드를 Design Doc으로 빠르게 이동시키고 싶을 때 건너뛰기 옵션을 사용하고 싶다.

  Scenario: Q&A 건너뛰기
    Given Q&A 모달이 열려있을 때
    When 사용자가 "건너뛰기" 버튼을 클릭하면
    Then "Q&A 없이 진행하시겠습니까?" 확인 다이얼로그가 표시되어야 하고
    When 사용자가 "확인"을 클릭하면
    Then Q&A 세션이 'skipped' 상태로 저장되어야 하고
    And Q&A 모달이 닫혀야 하고
    And 해당 태스크 카드가 Design Doc 컬럼으로 이동해야 하고
    And task.qaAnswers 배열이 비어있어야 한다

  Scenario: 건너뛰기 취소
    Given "Q&A 없이 진행하시겠습니까?" 다이얼로그가 표시되어 있을 때
    When 사용자가 "취소"를 클릭하면
    Then 다이얼로그가 닫혀야 하고
    And Q&A 모달이 유지되어야 한다
```

---

### 1.5 Q&A 취소 및 데이터 보존

#### AC-008: Q&A 취소

```gherkin
Feature: Q&A 취소
  게임 기획자로서,
  Q&A 도중 취소하더라도 입력한 데이터가 임시 저장되기를 원한다.

  Scenario: ESC 키로 Q&A 취소 시도
    Given Q&A 모달이 열려있고
    And 3개의 질문에 응답을 입력했을 때
    When 사용자가 ESC 키를 누르면
    Then "Q&A를 취소하시겠습니까? 입력한 응답은 임시 저장됩니다." 다이얼로그가 표시되어야 한다

  Scenario: 모달 외부 클릭으로 Q&A 취소 시도
    Given Q&A 모달이 열려있을 때
    When 사용자가 모달 외부 영역을 클릭하면
    Then 취소 확인 다이얼로그가 표시되어야 한다

  Scenario: Q&A 취소 확인
    Given 취소 확인 다이얼로그가 표시되어 있을 때
    When 사용자가 "취소 확인"을 클릭하면
    Then 현재까지의 응답이 localStorage에 임시 저장되어야 하고
    And Q&A 모달이 닫혀야 하고
    And 태스크 카드가 Feature List에 남아있어야 한다

  Scenario: Q&A 취소 후 재시도 시 응답 복구
    Given 이전에 Q&A를 취소하여 임시 저장된 응답이 있을 때
    When 동일 태스크로 Q&A를 다시 시작하면
    Then 임시 저장된 응답이 복구되어야 하고
    And "이전에 입력한 응답을 복구했습니다" 메시지가 표시되어야 한다
```

---

### 1.6 다중 LLM 프로바이더 지원

#### AC-009: LLM 프로바이더 선택

```gherkin
Feature: 다중 LLM 프로바이더 지원
  게임 기획자로서,
  선호하는 LLM 프로바이더를 사용하여 질문을 생성하고 싶다.

  Scenario: OpenAI 프로바이더 사용
    Given LLM 설정에서 OpenAI가 선택되어 있고
    And OpenAI API Key가 유효할 때
    When Q&A 질문 생성을 요청하면
    Then OpenAI GPT-4o 모델로 질문이 생성되어야 하고
    And 생성된 질문에 "provider: openai" 메타데이터가 포함되어야 한다

  Scenario: Gemini 프로바이더 사용
    Given LLM 설정에서 Gemini가 선택되어 있고
    And Google API Key가 유효할 때
    When Q&A 질문 생성을 요청하면
    Then Gemini Pro 모델로 질문이 생성되어야 하고
    And 생성된 질문에 "provider: gemini" 메타데이터가 포함되어야 한다

  Scenario: LM Studio (로컬) 프로바이더 사용
    Given LLM 설정에서 LM Studio가 선택되어 있고
    And 로컬 LM Studio 서버가 실행 중일 때
    When Q&A 질문 생성을 요청하면
    Then 로컬 LLM으로 질문이 생성되어야 하고
    And 네트워크 외부 호출이 발생하지 않아야 한다

  Scenario: LM Studio 연결 실패 시 자동 폴백
    Given LLM 설정에서 LM Studio가 선택되어 있고
    And 로컬 LM Studio 서버가 중지되어 있을 때
    When Q&A 질문 생성을 요청하면
    Then "로컬 LLM 연결 실패. OpenAI로 전환합니다." 메시지가 표시되어야 하고
    And OpenAI로 자동 폴백하여 질문이 생성되어야 한다
```

---

## 2. 비기능 인수 기준

### 2.1 성능 기준

| ID | 기준 | 목표값 |
|----|------|--------|
| P-001 | LLM 질문 생성 응답 시간 | < 10초 (OpenAI), < 15초 (LM Studio) |
| P-002 | Q&A 모달 열림 시간 | < 300ms |
| P-003 | 질문 간 전환 시간 | < 100ms |
| P-004 | 응답 자동 저장 간격 | 500ms 디바운스 |
| P-005 | 완료 버튼 클릭 후 처리 | < 1초 |

### 2.2 접근성 기준

| ID | 기준 | 요구사항 |
|----|------|----------|
| A-001 | 키보드 네비게이션 | Tab으로 입력 필드 간 이동 |
| A-002 | 키보드 단축키 | Ctrl+Enter: 다음, ESC: 취소 |
| A-003 | 스크린 리더 | 질문 및 진행 상태 읽기 지원 |
| A-004 | 색상 대비 | WCAG 2.1 AA 수준 (4.5:1) |
| A-005 | 포커스 표시 | 입력 필드 포커스 시 가시적 표시 |

### 2.3 보안 기준

| ID | 기준 | 요구사항 |
|----|------|----------|
| S-001 | API Key 보호 | 클라이언트에 API Key 노출 금지 |
| S-002 | 입력 검증 | XSS, SQL Injection 방지 |
| S-003 | 데이터 전송 | HTTPS 통신 필수 (프로덕션) |
| S-004 | 임시 저장 | localStorage 데이터 암호화 (선택) |

---

## 3. 에러 처리 기준

### 3.1 LLM API 오류 처리

```gherkin
Feature: LLM API 오류 처리
  게임 기획자로서,
  LLM API 오류 시에도 Q&A를 진행할 수 있기를 원한다.

  Scenario: LLM API 타임아웃 (30초 초과)
    Given Q&A 모달이 열렸고
    And LLM API 응답이 30초 이상 지연될 때
    Then "질문 생성 시간이 초과되었습니다" 메시지가 표시되어야 하고
    And "다시 시도" 및 "기본 질문 사용" 버튼이 표시되어야 한다

  Scenario: LLM API 인증 오류 (401)
    Given LLM API Key가 만료되었을 때
    When Q&A 질문 생성을 요청하면
    Then "API 인증에 실패했습니다. 설정에서 API Key를 확인하세요." 메시지가 표시되어야 하고
    And "설정으로 이동" 링크가 표시되어야 한다

  Scenario: LLM 응답 형식 오류
    Given LLM이 잘못된 JSON 형식을 반환할 때
    Then "AI 응답을 처리할 수 없습니다" 메시지가 표시되어야 하고
    And "기본 질문 사용" 옵션이 제공되어야 한다

  Scenario: 네트워크 연결 오류
    Given 네트워크 연결이 끊어졌을 때
    When Q&A 완료를 시도하면
    Then "네트워크 연결을 확인하세요" 메시지가 표시되어야 하고
    And 응답이 손실되지 않아야 하고
    And "다시 시도" 버튼이 표시되어야 한다
```

---

## 4. Definition of Done (완료 정의)

### 4.1 필수 완료 조건

- [ ] AC-001 ~ AC-009 모든 기능 인수 기준 통과
- [ ] Feature List → Design Doc 드래그 시 Q&A 모달 자동 열림
- [ ] LLM 질문 생성 정상 동작 (최소 OpenAI)
- [ ] 질문 네비게이션 (이전/다음/완료) 정상 동작
- [ ] Q&A 완료 시 응답 저장 및 카드 이동
- [ ] Q&A 건너뛰기 기능 동작
- [ ] 에러 상황 시 폴백 질문 제공
- [ ] TypeScript 컴파일 오류 없음 (strict 모드)
- [ ] ESLint 경고/오류 없음
- [ ] 크롬 개발자 도구 콘솔 오류 없음

### 4.2 권장 완료 조건

- [ ] Vitest 단위 테스트 커버리지 80%+
- [ ] E2E 테스트 통과 (주요 시나리오)
- [ ] 다중 LLM 프로바이더 테스트 (OpenAI, Gemini, LM Studio)
- [ ] 모바일 반응형 레이아웃 확인
- [ ] Lighthouse 접근성 점수 90+
- [ ] 코드 리뷰 완료

---

## 5. 테스트 시나리오

### 5.1 수동 테스트 체크리스트

| ID | 테스트 항목 | 예상 결과 |
|----|------------|----------|
| T-001 | Feature → Design 드래그 시 Q&A 모달 열림 | 모달 표시, 카드 이동 안 함 |
| T-002 | LLM 질문 생성 | 5-7개 질문 표시 |
| T-003 | 질문 응답 입력 | 텍스트 저장 |
| T-004 | 다음 버튼 클릭 | 다음 질문으로 이동 |
| T-005 | 이전 버튼 클릭 | 이전 질문으로 이동, 응답 복구 |
| T-006 | 완료 버튼 클릭 | 세션 저장, 카드 Design으로 이동 |
| T-007 | 건너뛰기 버튼 클릭 | 확인 후 카드 Design으로 이동 |
| T-008 | ESC 키 입력 | 취소 확인 다이얼로그 표시 |
| T-009 | LLM 에러 시 폴백 | 기본 질문 5개 표시 |
| T-010 | 진행률 바 표시 | 현재 진행 상태 시각화 |

### 5.2 API 테스트

```bash
# 질문 생성 테스트
curl -X POST http://localhost:3001/api/qa/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"featureDescription":"가챠 시스템: 캐릭터와 무기를 뽑는 랜덤 보상 시스템"}'
# 예상: { success: true, data: { questions: [...], provider: "openai" } }

# Q&A 세션 생성
curl -X POST http://localhost:3001/api/qa-sessions \
  -H "Content-Type: application/json" \
  -d '{"taskId":"task-123","questions":[...]}'
# 예상: { success: true, data: { id: "session-xxx", status: "in_progress" } }

# Q&A 세션 완료
curl -X PUT http://localhost:3001/api/qa-sessions/{id}/complete \
  -H "Content-Type: application/json" \
  -d '{"answers":[...]}'
# 예상: { success: true, data: { status: "completed" } }

# 기본 질문 조회
curl http://localhost:3001/api/question-library/default
# 예상: { success: true, data: { questions: [...] } }
```

### 5.3 LLM 프로바이더별 테스트

| 프로바이더 | 테스트 항목 | 검증 방법 |
|-----------|------------|----------|
| OpenAI | API Key 인증 | 유효한 키로 질문 생성 |
| OpenAI | 응답 형식 | JSON 파싱 성공 |
| Gemini | API Key 인증 | 유효한 키로 질문 생성 |
| Gemini | 긴 컨텍스트 | 긴 Feature 설명 처리 |
| Claude | API Key 인증 | 유효한 키로 질문 생성 |
| LM Studio | 로컬 연결 | localhost:1234 접속 |
| LM Studio | 폴백 | 연결 실패 시 OpenAI 전환 |

---

**문서 버전**: 1.0.0
**최종 수정일**: 2026-01-15
**작성자**: workflow-spec agent
