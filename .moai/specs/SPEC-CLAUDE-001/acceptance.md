# SPEC-CLAUDE-001: Acceptance Criteria

---
spec_id: SPEC-CLAUDE-001
version: "1.0.0"
status: "planned"
created: "2026-01-07"
updated: "2026-01-07"
---

## Overview

Claude Code 통합 서비스 (Headless Mode)의 인수 기준. 총 15개 이상의 테스트 시나리오를 통해 모든 EARS 요구사항을 검증한다.

## Test Scenarios

### Feature: Claude Code 프로세스 실행 (REQ-U-001, REQ-U-003, REQ-N-002)

```gherkin
Scenario: 정상적인 Claude Code 프로세스 실행
  Given Claude Code CLI가 설치되어 있고
  And ANTHROPIC_API_KEY가 설정되어 있을 때
  When 유효한 프롬프트로 Claude Code 실행을 요청하면
  Then 프로세스가 성공적으로 시작되어야 한다
  And 허용된 도구(Read, Write, Grep)만 전달되어야 한다
  And 120초 타임아웃이 적용되어야 한다

Scenario: 타임아웃 시 프로세스 종료
  Given Claude Code 프로세스가 실행 중일 때
  When 120초 타임아웃이 초과되면
  Then 프로세스가 강제 종료되어야 한다
  And 타임아웃 에러가 반환되어야 한다
  And 사용자에게 재시도 안내가 표시되어야 한다

Scenario: 허용되지 않은 도구 요청 차단
  Given 생성 요청에 허용되지 않은 도구(Bash)가 포함될 때
  When Claude Code 실행을 요청하면
  Then 요청이 거부되어야 한다
  And 에러 코드 "TOOL_DENIED"가 반환되어야 한다
  And 보안 로그에 기록되어야 한다
```

### Feature: JSON 출력 파싱 (REQ-U-002)

```gherkin
Scenario: 유효한 JSON 출력 파싱 성공
  Given Claude Code가 유효한 JSON 형식으로 응답할 때
  When 출력을 파싱하면
  Then ClaudeCodeResponse 객체가 생성되어야 한다
  And metadata.generatedAt 필드가 ISO 8601 형식이어야 한다
  And content 필드에 생성된 문서가 포함되어야 한다

Scenario: 유효하지 않은 JSON 출력 처리
  Given Claude Code가 유효하지 않은 JSON을 반환할 때
  When 출력 파싱을 시도하면
  Then 에러 코드 "PARSE_ERROR"가 반환되어야 한다
  And 원본 출력이 로깅되어야 한다
  And 사용자에게 에러 메시지가 표시되어야 한다

Scenario: 빈 출력 처리
  Given Claude Code가 빈 응답을 반환할 때
  When 출력 파싱을 시도하면
  Then 에러 코드 "EMPTY_RESPONSE"가 반환되어야 한다
  And 재시도 옵션이 제공되어야 한다
```

### Feature: 로딩 상태 표시 (REQ-U-004)

```gherkin
Scenario: 생성 시작 시 로딩 상태 표시
  Given 사용자가 문서 생성을 요청할 때
  When 생성 프로세스가 시작되면
  Then isGenerating 상태가 true로 변경되어야 한다
  And UI에 로딩 인디케이터가 표시되어야 한다
  And 현재 생성 중인 문서 유형이 표시되어야 한다

Scenario: 생성 완료 시 로딩 상태 해제
  Given 문서 생성이 진행 중일 때
  When 생성이 성공적으로 완료되면
  Then isGenerating 상태가 false로 변경되어야 한다
  And 로딩 인디케이터가 사라져야 한다
  And 생성된 문서 미리보기가 표시되어야 한다

Scenario: 생성 실패 시 로딩 상태 해제
  Given 문서 생성이 진행 중일 때
  When 생성이 실패하면
  Then isGenerating 상태가 false로 변경되어야 한다
  And 에러 메시지가 표시되어야 한다
  And 재시도 버튼이 활성화되어야 한다
```

### Feature: Q&A 완료 후 Design Document 생성 (REQ-E-001)

```gherkin
Scenario: Q&A 완료 시 Design Document 자동 생성
  Given 프로젝트 "project-123"에 Q&A 응답이 완료되었을 때
  When 사용자가 Q&A 폼을 제출하면
  Then POST /api/generate/design-document 요청이 전송되어야 한다
  And Q&A 응답 데이터가 프롬프트에 포함되어야 한다
  And Design Document가 마크다운 형식으로 생성되어야 한다
  And 문서가 프로젝트 documents 디렉토리에 저장되어야 한다

Scenario: 참조 시스템 컨텍스트 포함
  Given 프로젝트에 참조 시스템 "ref-001", "ref-002"가 선택되어 있을 때
  When Design Document 생성을 요청하면
  Then 참조 시스템 정보가 프롬프트 컨텍스트에 포함되어야 한다
  And 생성된 문서에 참조 시스템 관련 내용이 반영되어야 한다
```

### Feature: 문서 수정 요청 (REQ-E-002)

```gherkin
Scenario: 기존 문서 수정 요청 처리
  Given 프로젝트 "project-123"에 Design Document v1.0이 존재할 때
  And 사용자가 수정 요청 "Goals 섹션에 비용 절감 목표 추가"를 제출하면
  When POST /api/generate/modify 요청이 전송되면
  Then 기존 문서 내용이 컨텍스트에 포함되어야 한다
  And 수정 요청이 프롬프트에 포함되어야 한다
  And 수정된 문서 v1.1이 생성되어야 한다
  And 이전 버전 v1.0이 보관되어야 한다

Scenario: 다중 수정 요청 iterative 처리
  Given Design Document v1.0이 존재할 때
  When 첫 번째 수정으로 v1.1이 생성되고
  And 두 번째 수정 요청이 제출되면
  Then v1.1을 기반으로 v1.2가 생성되어야 한다
  And 버전 히스토리에 3개 버전이 존재해야 한다
```

### Feature: Design Document 승인 후 PRD 생성 (REQ-E-003)

```gherkin
Scenario: Design Document 승인 시 PRD 자동 생성
  Given 프로젝트 "project-123"의 Design Document가 승인 대기 중일 때
  When 사용자가 승인 버튼을 클릭하면
  Then Design Document 상태가 "approved"로 변경되어야 한다
  And POST /api/generate/prd 요청이 자동 전송되어야 한다
  And Design Document 내용이 PRD 생성 프롬프트에 포함되어야 한다
  And PRD가 마크다운 형식으로 생성되어야 한다

Scenario: PRD 생성 실패 시 롤백
  Given Design Document가 승인되었을 때
  When PRD 생성이 실패하면
  Then 에러 메시지가 표시되어야 한다
  And Design Document 상태는 "approved" 유지
  And PRD 재생성 옵션이 제공되어야 한다
```

### Feature: PRD 승인 후 Prototype 생성 (REQ-E-004)

```gherkin
Scenario: PRD 승인 시 Prototype HTML 자동 생성
  Given 프로젝트 "project-123"의 PRD가 승인 대기 중일 때
  When 사용자가 승인 버튼을 클릭하면
  Then PRD 상태가 "approved"로 변경되어야 한다
  And POST /api/generate/prototype 요청이 자동 전송되어야 한다
  And Prototype HTML 파일이 생성되어야 한다
  And 생성된 HTML은 브라우저에서 렌더링 가능해야 한다

Scenario: Prototype 생성 후 미리보기
  Given Prototype HTML이 성공적으로 생성되었을 때
  When 사용자가 미리보기를 요청하면
  Then 생성된 HTML이 iframe 또는 새 탭에서 렌더링되어야 한다
```

### Feature: Feature List 분석 (REQ-E-005)

```gherkin
Scenario: Feature List 저장 시 키워드 추출
  Given 프로젝트에 Feature List가 작성되었을 때
  When Feature List가 저장되면
  Then POST /api/generate/analyze-features 요청이 전송되어야 한다
  And Claude Code가 Feature List를 분석해야 한다
  And 관련 시스템 키워드 목록이 추출되어야 한다
  And 키워드가 프로젝트 메타데이터에 저장되어야 한다
```

### Feature: 중복 요청 방지 (REQ-S-001)

```gherkin
Scenario: 생성 중 추가 요청 차단
  Given Claude Code 프로세스가 실행 중일 때 (isGenerating === true)
  When 사용자가 추가 생성 요청을 시도하면
  Then 요청이 차단되어야 한다
  And "이미 생성 중입니다" 메시지가 표시되어야 한다
  And 생성 버튼이 비활성화 상태여야 한다

Scenario: 생성 완료 후 새 요청 허용
  Given 이전 생성이 완료되었을 때 (isGenerating === false)
  When 사용자가 새 생성 요청을 시도하면
  Then 요청이 정상적으로 처리되어야 한다
  And 생성 프로세스가 시작되어야 한다
```

### Feature: 참조 시스템 컨텍스트 주입 (REQ-S-002)

```gherkin
Scenario: 참조 시스템 선택 시 컨텍스트 포함
  Given 프로젝트에 참조 시스템 3개가 선택되어 있을 때
  When 문서 생성을 요청하면
  Then 참조 시스템 정보가 프롬프트에 주입되어야 한다
  And 각 시스템의 주요 특성이 컨텍스트에 포함되어야 한다

Scenario: 참조 시스템 미선택 시 기본 프롬프트
  Given 프로젝트에 참조 시스템이 선택되지 않았을 때
  When 문서 생성을 요청하면
  Then 참조 시스템 컨텍스트 없이 기본 프롬프트가 사용되어야 한다
```

### Feature: 버전 히스토리 관리 (REQ-S-003)

```gherkin
Scenario: 새 버전 생성 시 히스토리 업데이트
  Given Design Document v1.0이 존재할 때
  When 수정 요청으로 v1.1이 생성되면
  Then versions 배열에 v1.1이 추가되어야 한다
  And v1.0은 히스토리에 보관되어야 한다
  And 각 버전에 생성 타임스탬프가 기록되어야 한다

Scenario: 버전 롤백
  Given Design Document v1.0, v1.1, v1.2가 존재할 때
  When 사용자가 v1.0으로 롤백을 요청하면
  Then 현재 버전이 v1.0 내용으로 변경되어야 한다
  And 버전 히스토리는 유지되어야 한다
```

### Feature: 생성 실패 알림 (REQ-N-003)

```gherkin
Scenario: 생성 실패 시 사용자 알림
  Given Claude Code 실행 중 오류가 발생했을 때
  When 에러가 감지되면
  Then 사용자에게 에러 메시지가 표시되어야 한다
  And 에러 유형에 따른 적절한 안내가 제공되어야 한다
  And 재시도 또는 문의 옵션이 제공되어야 한다

Scenario: 타임아웃 실패 시 상세 알림
  Given Claude Code 실행이 타임아웃으로 실패했을 때
  When 에러가 사용자에게 전달되면
  Then "생성 시간이 초과되었습니다" 메시지가 표시되어야 한다
  And 재시도 버튼이 표시되어야 한다
  And 프롬프트 축소 제안이 표시되어야 한다
```

### Feature: 보안 검증 (REQ-N-001)

```gherkin
Scenario: 허용되지 않은 도구 접근 시도 차단
  Given 악의적인 요청에 allowedTools: ['Bash', 'Shell']이 포함될 때
  When API 엔드포인트에 요청이 도달하면
  Then 요청이 즉시 거부되어야 한다
  And HTTP 상태 코드 403이 반환되어야 한다
  And 보안 이벤트가 로깅되어야 한다

Scenario: 프롬프트 인젝션 방지
  Given 프롬프트에 시스템 명령 인젝션 시도가 포함될 때
  When 프롬프트가 검증되면
  Then 위험한 패턴이 제거되거나 이스케이프되어야 한다
  And 원본 악의적 입력이 로깅되어야 한다
```

## Quality Gates

### Code Quality

- [ ] ESLint 에러 0개
- [ ] TypeScript 타입 에러 0개
- [ ] 코드 복잡도 < 10 (McCabe)
- [ ] 중복 코드 < 3%

### Test Coverage

- [ ] 전체 테스트 커버리지 >= 85%
- [ ] claudeCodeRunner.ts 커버리지 >= 90%
- [ ] promptBuilder.ts 커버리지 >= 90%
- [ ] generate.ts 라우트 커버리지 >= 85%
- [ ] useAIGeneration.ts 훅 커버리지 >= 85%

### Security

- [ ] 허용된 도구만 Claude Code에 전달 검증
- [ ] 입력 값 sanitization 적용
- [ ] 환경변수로 API 키 관리
- [ ] 에러 메시지에 민감 정보 미포함

### Performance

- [ ] Design Document 생성 평균 < 60초
- [ ] PRD 생성 평균 < 45초
- [ ] Prototype 생성 평균 < 90초
- [ ] API 응답 시작 (스트리밍 시작) < 5초
- [ ] 메모리 사용량 < 500MB

## Definition of Done

### Backend

- [ ] claudeCodeRunner.ts 구현 및 테스트 완료
- [ ] promptBuilder.ts 구현 및 테스트 완료
- [ ] generate.ts 모든 엔드포인트 구현 완료
- [ ] 타임아웃 처리 검증 완료
- [ ] 에러 핸들링 전체 시나리오 구현 완료
- [ ] API 문서화 완료

### Frontend

- [ ] claudeCodeService.ts 구현 및 테스트 완료
- [ ] useAIGeneration.ts 훅 구현 및 테스트 완료
- [ ] GenerationProgress 컴포넌트 구현 완료
- [ ] GenerationError 컴포넌트 구현 완료
- [ ] 로딩 상태 UI 검증 완료

### Integration

- [ ] Q&A → Design Document 플로우 E2E 테스트 완료
- [ ] Design Document → PRD 플로우 E2E 테스트 완료
- [ ] PRD → Prototype 플로우 E2E 테스트 완료
- [ ] 수정 요청 플로우 E2E 테스트 완료
- [ ] 에러 시나리오 통합 테스트 완료

## Verification Methods

### Unit Testing

- Vitest for backend utilities (claudeCodeRunner, promptBuilder)
- React Testing Library for hooks (useAIGeneration)
- Mock child_process for Claude Code CLI 시뮬레이션
- Mock API responses for frontend service testing

### Integration Testing

- Supertest for API endpoint testing
- MSW (Mock Service Worker) for frontend API mocking
- 실제 Claude Code CLI 연동 테스트 (선택적)

### Manual Testing Checklist

- [ ] Q&A 완료 후 Design Document 생성 확인
- [ ] Design Document 승인 후 PRD 자동 생성 확인
- [ ] PRD 승인 후 Prototype 자동 생성 확인
- [ ] 수정 요청 처리 및 버전 관리 확인
- [ ] 타임아웃 발생 시 에러 처리 확인
- [ ] 동시 요청 차단 확인
- [ ] 참조 시스템 컨텍스트 주입 확인
- [ ] 로딩 상태 UI 동작 확인

---

**TAG**: SPEC-CLAUDE-001
**VERSION**: 1.0.0
**STATUS**: planned
