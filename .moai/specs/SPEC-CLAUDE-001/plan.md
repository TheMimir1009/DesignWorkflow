# SPEC-CLAUDE-001: Implementation Plan

---
spec_id: SPEC-CLAUDE-001
version: "1.0.0"
status: "planned"
created: "2026-01-07"
updated: "2026-01-07"
---

## Overview

Claude Code Headless Mode 통합 서비스의 구현 계획. 5개의 핵심 파일을 통해 AI 기반 문서 생성 기능을 구현한다.

## Implementation Phases

### Phase 1: Core Infrastructure (Priority: High)

Claude Code 실행 기반 인프라 구축

#### Milestone 1.1: Claude Code Runner

**Target File**: `server/utils/claudeCodeRunner.ts`

- [ ] child_process spawn을 사용한 Claude Code CLI 실행 함수 구현
- [ ] 타임아웃 처리 로직 구현 (기본 120초)
- [ ] allowedTools 파라미터 전달 구현
- [ ] stdout/stderr 스트림 처리 및 버퍼링
- [ ] JSON 출력 파싱 및 에러 처리
- [ ] 프로세스 종료 코드 기반 결과 처리

핵심 기능:
- runClaudeCode(prompt, options): Promise<RunnerResult>
- parseClaudeOutput(stdout): ClaudeCodeResponse
- handleTimeout(process, timeout): void

#### Milestone 1.2: Prompt Builder

**Target File**: `server/utils/promptBuilder.ts`

- [ ] 문서 유형별 프롬프트 템플릿 정의
- [ ] Q&A 응답 데이터 포맷팅 함수 구현
- [ ] 참조 시스템 컨텍스트 주입 함수 구현
- [ ] 수정 요청 컨텍스트 병합 함수 구현
- [ ] 프롬프트 길이 검증 (100,000자 제한)

핵심 기능:
- buildPrompt(type, context): string
- formatQAResponses(responses): string
- formatReferenceContext(systems): string
- mergeModificationContext(original, request): string

### Phase 2: API Layer (Priority: High)

생성 API 엔드포인트 구현

#### Milestone 2.1: Generation Routes

**Target File**: `server/routes/generate.ts`

- [ ] POST /api/generate/design-document 엔드포인트 구현
- [ ] POST /api/generate/prd 엔드포인트 구현
- [ ] POST /api/generate/prototype 엔드포인트 구현
- [ ] POST /api/generate/analyze-features 엔드포인트 구현
- [ ] POST /api/generate/modify 엔드포인트 구현
- [ ] GET /api/generate/status 엔드포인트 구현
- [ ] GET /api/generate/history/:projectId 엔드포인트 구현
- [ ] 요청 유효성 검사 미들웨어 적용
- [ ] 생성 상태 관리 (중복 요청 방지)
- [ ] 에러 핸들링 및 응답 표준화

핵심 기능:
- validateGenerateRequest(req): ValidationResult
- trackGenerationStatus(projectId, type): void
- saveGenerationHistory(result): Promise<void>

### Phase 3: Frontend Integration (Priority: Medium)

프론트엔드 서비스 및 훅 구현

#### Milestone 3.1: Claude Code Service

**Target File**: `src/services/claudeCodeService.ts`

- [ ] API 호출 함수 구현 (axios/fetch)
- [ ] 요청/응답 타입 정의
- [ ] 에러 처리 및 재시도 로직
- [ ] 응답 캐싱 전략 구현

핵심 기능:
- generateDesignDocument(projectId, qaResponses): Promise<Response>
- generatePRD(projectId, designDoc): Promise<Response>
- generatePrototype(projectId, prd): Promise<Response>
- modifyDocument(projectId, type, request): Promise<Response>

#### Milestone 3.2: AI Generation Hook

**Target File**: `src/hooks/useAIGeneration.ts`

- [ ] 생성 상태 관리 (isGenerating, progress, error)
- [ ] 낙관적 업데이트 전략 구현
- [ ] 폴링 또는 SSE 기반 진행 상황 추적
- [ ] 생성 취소 기능 구현 (선택적)
- [ ] 재시도 로직 구현

핵심 기능:
- useAIGeneration(): GenerationHookReturn
- generate(type, context): Promise<void>
- cancelGeneration(): void
- resetError(): void

### Phase 4: UI Components (Priority: Medium)

생성 관련 UI 컴포넌트 구현

#### Milestone 4.1: Generation Progress UI

- [ ] GenerationProgress.tsx - 진행 상태 표시 컴포넌트
- [ ] GenerationError.tsx - 에러 표시 및 재시도 컴포넌트
- [ ] DocumentPreview.tsx - 생성 문서 미리보기 컴포넌트

### Phase 5: Integration & Testing (Priority: High)

통합 테스트 및 최적화

#### Milestone 5.1: End-to-End Integration

- [ ] Q&A 완료 → Design Document 생성 플로우 통합
- [ ] Design Document 승인 → PRD 생성 플로우 통합
- [ ] PRD 승인 → Prototype 생성 플로우 통합
- [ ] 수정 요청 플로우 통합

#### Milestone 5.2: Error Handling & Edge Cases

- [ ] 타임아웃 시나리오 처리
- [ ] 네트워크 오류 복구
- [ ] 동시 요청 방지 검증
- [ ] 대용량 입력 처리

## Technical Approach

### Backend Architecture

```
server/
├── routes/
│   └── generate.ts              # 생성 API 라우트
├── utils/
│   ├── claudeCodeRunner.ts      # Claude Code CLI 실행
│   └── promptBuilder.ts         # 프롬프트 구성
├── middleware/
│   └── generationGuard.ts       # 중복 요청 방지
└── types/
    └── generation.ts            # 타입 정의
```

### Frontend Architecture

```
src/
├── services/
│   └── claudeCodeService.ts     # API 호출 서비스
├── hooks/
│   └── useAIGeneration.ts       # 생성 상태 훅
├── store/
│   └── generationStore.ts       # 전역 생성 상태 (선택적)
└── components/
    └── generation/
        ├── GenerationProgress.tsx
        ├── GenerationError.tsx
        └── DocumentPreview.tsx
```

### Claude Code Integration Pattern

```typescript
// 실행 패턴
const args = [
  '--print',
  '--output-format', 'json',
  '--allowedTools', 'Read,Write,Grep',
  prompt
];

const process = spawn('claude', args, {
  cwd: workingDirectory,
  timeout: 120000
});
```

## Risks and Mitigations

### Risk 1: Claude Code CLI 응답 지연

- **영향**: 사용자 대기 시간 증가, 타임아웃 발생
- **완화**:
  - 적절한 타임아웃 설정 (120초)
  - 프로그레스 표시로 사용자 인지
  - 백그라운드 생성 옵션 고려

### Risk 2: 프롬프트 품질 불일치

- **영향**: 생성 문서 품질 저하
- **완화**:
  - 문서 유형별 최적화된 프롬프트 템플릿
  - 참조 시스템 컨텍스트 활용
  - iterative 수정 기능 제공

### Risk 3: 동시 요청으로 인한 리소스 경합

- **영향**: 서버 부하 증가, 응답 지연
- **완화**:
  - 단일 사용자당 동시 요청 1개 제한
  - 생성 상태 기반 요청 차단
  - 큐 기반 처리 고려 (향후)

### Risk 4: JSON 파싱 실패

- **영향**: 응답 처리 불가
- **완화**:
  - 출력 포맷 검증
  - 파싱 실패 시 원본 텍스트 로깅
  - 폴백 처리 로직

## Dependencies

### Backend Dependencies

- Node.js child_process (내장)
- uuid: ^9.0.0 - 요청 ID 생성
- express-validator: ^7.0.0 - 요청 검증

### External Dependencies

- Claude Code CLI (시스템 설치 필요)
- ANTHROPIC_API_KEY 환경변수

### Internal Dependencies

- SPEC-PROJECT-001: 프로젝트 컨텍스트
- SPEC-QA-001: Q&A 응답 데이터
- SPEC-REFERENCE-001: 참조 시스템 정보
- SPEC-DOCUMENT-001: 문서 저장/관리
- SPEC-AUTH-001: 인증 미들웨어

## Success Criteria

- [ ] 모든 EARS 요구사항 (15개) 충족
- [ ] 테스트 커버리지 85% 이상
- [ ] Claude Code 실행 성공률 95% 이상
- [ ] 평균 응답 시간 60초 이내 (문서 유형별 상이)
- [ ] 에러 발생 시 100% 사용자 알림

## File Creation Order

구현 우선순위에 따른 파일 생성 순서:

1. `server/utils/claudeCodeRunner.ts` - Core infrastructure
2. `server/utils/promptBuilder.ts` - Prompt templates
3. `server/routes/generate.ts` - API endpoints
4. `src/services/claudeCodeService.ts` - Frontend API service
5. `src/hooks/useAIGeneration.ts` - State management hook

---

**TAG**: SPEC-CLAUDE-001
**VERSION**: 1.0.0
**STATUS**: planned
