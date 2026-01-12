---
spec_id: SPEC-LLM-004
title: LM Studio Dynamic Model Selection UI - Acceptance Criteria
category: llm
priority: high
status: completed
created_at: 2026-01-12
updated_at: 2026-01-13
author: alfred
version: 1.1.0
---

# SPEC-LLM-004: Acceptance Criteria

## User Scenarios

### Scenario 1: LM Studio 모델 목록 표시

**Given** 사용자가 LLM 설정 페이지에 있고 LM Studio 서버가 실행 중이고
**When** LM Studio 프로바이더를 선택하면
**Then** 사용 가능한 모델 목록이 드롭다운에 표시되어야 한다

**Acceptance Tests**:
- [x] LM Studio 선택 후 드롭다운에 모델 목록 표시
- [x] 첫 번째 모델이 자동으로 선택됨
- [x] 드롭다운에서 모델 변경 가능

### Scenario 2: 로딩 상태 표시

**Given** 사용자가 LM Studio 프로바이더를 선택했고
**When** 모델 목록을 가져오는 중이면
**Then** 로딩 스피너와 "모델 목록을 가져오는 중..." 메시지가 표시되어야 한다

**Acceptance Tests**:
- [x] LM Studio 선택 시 즉시 로딩 상태 표시
- [x] 로딩 중에는 드롭다운이 비활성화됨
- [x] 로딩 완료 후 로딩 상태 사라짐

### Scenario 3: 서버 중지 시 에러 처리

**Given** 사용자가 LM Studio 프로바이더를 선택했고
**When** LM Studio 서버가 실행 중이 아니면
**Then** "서버 연결 불가" 또는 유사한 에러 메시지가 표시되어야 한다

**Acceptance Tests**:
- [x] 서버 중지 시 에러 메시지 표시
- [x] 에러 발생 후 다른 프로바이더로 변경 가능
- [x] 에러 상태가 다른 UI 요소에 영향 주지 않음

### Scenario 4: 다른 프로바이더 정상 작동

**Given** 사용자가 OpenAI/Gemini/Claude Code 프로바이더를 선택하고
**When** 모델 드롭다운을 확인하면
**Then** 기존 정적 모델 목록이 표시되어야 한다

**Acceptance Tests**:
- [x] OpenAI 선택 시 기존 모델 목록 표시
- [x] Gemini 선택 시 기존 모델 목록 표시
- [x] Claude Code 선택 시 기존 모델 목록 표시
- [x] 다른 프로바이더에서는 로딩 상태 표시 안 됨

### Scenario 5: 빈 모델 목록 처리

**Given** 사용자가 LM Studio 프로바이더를 선택했고
**When** LM Studio에 로드된 모델이 없으면
**Then** "사용 가능한 모델이 없습니다" 메시지가 표시되어야 한다

**Acceptance Tests**:
- [x] 빈 목록 시 안내 메시지 표시
- [x] 안내 메시지에 서버 확인 안내 포함

## Technical Acceptance Criteria

### TaskStageModelSelector

| Criteria | Test Method | Expected Result |
|----------|-------------|-----------------|
| LM Studio 선택 시 API 호출 | 단위 테스트 | getProviderModels() 호출됨 |
| 로딩 상태 관리 | 단위 테스트 | isLoadingModels가 true/false로 변경됨 |
| 에러 상태 관리 | 단위 테스트 | modelLoadError에 메시지 설정됨 |
| 다른 프로바이더 선택 시 API 미호출 | 단위 테스트 | getProviderModels() 호출 안 됨 |
| availableModels 계산 | 코드 검사 | LM Studio는 dynamicModels 사용 |
| availableModels 계산 (다른 프로바이더) | 코드 검사 | 다른 프로바이더는 AVAILABLE_MODELS 사용 |

### ColumnLLMSettingsModal

| Criteria | Test Method | Expected Result |
|----------|-------------|-----------------|
| LM Studio 선택 시 API 호출 | 단위 테스트 | getProviderModels() 호출됨 |
| 로딩 상태 표시 | 시각적 테스트 | 모달 내 로딩 스피너 표시됨 |
| 에러 상태 표시 | 시각적 테스트 | 모달 내 에러 메시지 표시됨 |
| 모델 선택 및 저장 | 통합 테스트 | 선택한 모델이 저장됨 |

### API Integration

| Criteria | Test Method | Expected Result |
|----------|-------------|-----------------|
| GET /models 엔드포인트 호출 | 통합 테스트 | HTTP 200 응답 |
| models 배열 파싱 | 통합 테스트 | 모델 ID 목록 추출됨 |
| 타임아웃 처리 | 통합 테스트 | 5초 후 타임아웃 및 에러 반환 |
| 에러 응답 처리 | 통합 테스트 | 빈 배열 반환 및 에러 메시지 |

### UI/UX

| Criteria | Test Method | Expected Result |
|----------|-------------|-----------------|
| 로딩 스피너 애니메이션 | 시각적 테스트 | 부드러운 회전 애니메이션 |
| 에러 아이콘 표시 | 시각적 테스트 | 경고 아이콘 명확히 보임 |
| 텍스트 가독성 | 시각적 테스트 | 메시지가 읽기 쉬움 |
| 드롭다운 비활성화 | 기능 테스트 | 로딩 중 선택 불가 |

### Regression

| Criteria | Test Method | Expected Result |
|----------|-------------|-----------------|
| OpenAI 모델 선택 | 통합 테스트 | 기존 동작 유지 |
| Gemini 모델 선택 | 통합 테스트 | 기존 동작 유지 |
| Claude Code 모델 선택 | 통합 테스트 | 기존 동작 유지 |
| Temperature 슬라이더 | 기능 테스트 | 기존 동작 유지 |
| Max Tokens 슬라이더 | 기능 테스트 | 기존 동작 유지 |
| Top P 슬라이더 | 기능 테스트 | 기존 동작 유지 |
| 설정 저장 | 기능 테스트 | 기존 동작 유지 |

## Test Cases

### TC-LLMUI-001: TaskStageModelSelector 모델 목록 가져오기

**Preconditions**:
- LM Studio 서버가 실행 중
- 하나 이상의 모델이 로드됨 (예: qwen3-vl-32b-instruct)
- 프로젝트 설정 페이지 열림

**Steps**:
1. Design Doc 스테이지에서 프로바이더 드롭다운 클릭
2. "LMStudio" 선택
3. 모델 목록이 표시될 때까지 대기

**Expected Result**:
- 로딩 스피너가 잠시 표시됨
- 모델 드롭다운에 LM Studio 모델 목록 표시됨
- 첫 번째 모델이 자동 선택됨

### TC-LLMUI-002: ColumnLLMSettingsModal 모델 목록 가져오기

**Preconditions**:
- LM Studio 서버가 실행 중
- 하나 이상의 모델이 로드됨
- 칸반 열 설정 모달 열림

**Steps**:
1. 프로바이더 드롭다운 클릭
2. "LMStudio" 선택
3. 모델 목록이 표시될 때까지 대기

**Expected Result**:
- 모달 내 로딩 스피너 표시됨
- 모델 드롭다운에 LM Studio 모델 목록 표시됨

### TC-LLMUI-003: 로딩 상태 표시

**Preconditions**:
- LM Studio 서버가 실행 중
- 프로젝트 설정 페이지 열림

**Steps**:
1. 프로바이더를 "OpenAI"에서 "LMStudio"로 변경
2. 드롭다운 아래 UI 변경 관찰

**Expected Result**:
- 즉시 "모델 목록을 가져오는 중..." 메시지와 스피너 표시됨
- 모델 드롭다운이 비활성화됨
- 로딩 완료 후 메시지 사라짐

### TC-LLMUI-004: 다른 프로바이더 선택 시 동적 로딩 안 함

**Preconditions**:
- 프로젝트 설정 페이지 열림

**Steps**:
1. 프로바이더를 "OpenAI"로 선택
2. 드롭다운 아래 UI 관찰

**Expected Result**:
- 로딩 스피너 표시 안 됨
- 기존 정적 모델 목록 즉시 표시됨

### TC-LLMUI-005: 서버 중지 시 에러 처리

**Preconditions**:
- LM Studio 서버가 중지됨
- 프로젝트 설정 페이지 열림

**Steps**:
1. 프로바이더를 "LMStudio"로 선택
2. 드롭다운 아래 UI 관찰

**Expected Result**:
- 로딩 상태 후 에러 메시지 표시됨
- 에러 메시지: "서버 연결 불가" 또는 유사한 메시지
- 모델 드롭다운이 비어있음

### TC-LLMUI-006: 빈 모델 목록 처리

**Preconditions**:
- LM Studio 서버가 실행 중이지만 로드된 모델 없음
- 프로젝트 설정 페이지 열림

**Steps**:
1. 프로바이더를 "LMStudio"로 선택
2. 드롭다운 아래 UI 관찰

**Expected Result**:
- "사용 가능한 모델이 없습니다. LM Studio 서버가 실행 중인지 확인하세요." 메시지 표시됨

## Code Quality Metrics

| Metric | Target | Current |
|--------|--------|---------|
| 단위 테스트 커버리지 | >= 80% | 100% (23/23 tests pass) |
| 복잡도 | cyclomatic complexity < 10 | PASS |
| TypeScript 타입 안전성 | 100% (any 없음) | PASS |

## Sign-off

- [x] 개발자: 구현 완료 및 자체 테스트 통과
- [x] QA: 인수 테스트 통과
- [x] Product Owner: 사용자 시나리오 검증 완료
- [x] FE 리뷰어: 코드 리뷰 완료

## Definition of Done

- [x] 모든 사용자 시나리오 통과
- [x] 모든 기술적 인수 기준 충족
- [x] 모든 테스트 케이스 통과
- [x] 코드 커버리지 80% 이상
- [x] 회귀 테스트 통과
- [x] TypeScript 타입 오류 없음
- [x] ESLint 경고 없음
- [x] 코드 리뷰 완료
