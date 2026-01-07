# SPEC-CLAUDE-001: Claude Code 통합 서비스 (Headless Mode)

---
id: SPEC-CLAUDE-001
version: "1.0.0"
status: "planned"
created: "2026-01-07"
updated: "2026-01-07"
author: "workflow-spec"
priority: "high"
tags: [claude-code, ai-generation, headless-mode, design-workflow, prompt-engineering]
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-07 | workflow-spec | 초기 SPEC 문서 작성 |

## Overview

Claude Code Headless Mode를 활용하여 AI 기반 문서 생성 서비스를 구현한다. 사용자의 Q&A 응답을 기반으로 Design Document, PRD, Prototype HTML을 자동 생성하며, 수정 요청을 통해 iterative하게 문서를 개선할 수 있다.

## Environment

- **Backend**: Express 4.x + Node.js child_process (Claude Code CLI 실행)
- **Frontend**: React 18.x, Zustand (상태 관리), React Query (API 호출)
- **Claude Code**: Headless Mode (--print 옵션)
- **Allowed Tools**: Read, Write, Grep (보안 제한)
- **Timeout**: 120초 기본 타임아웃
- **Output Format**: JSON (구조화된 응답)

## Assumptions

- Claude Code CLI가 서버 환경에 설치되어 있다
- 환경변수 ANTHROPIC_API_KEY가 설정되어 있다
- workspace 디렉토리에 대한 읽기/쓰기 권한이 있다
- 프로젝트별 참조 시스템(Reference System) 데이터가 존재할 수 있다
- Q&A 데이터는 SPEC-QA-001에 정의된 형식을 따른다

## Requirements

### Ubiquitous Requirements (항상 적용)

- [REQ-U-001] 시스템은 **항상** Claude Code 프로세스 실행 시 120초 타임아웃을 적용해야 한다
  - WHY: 무한 대기 방지 및 서버 리소스 보호
  - IMPACT: 타임아웃 없이 프로세스가 무한 대기할 경우 서버 리소스 고갈

- [REQ-U-002] 시스템은 **항상** Claude Code 출력을 JSON 형식으로 파싱해야 한다
  - WHY: 구조화된 데이터로 일관된 처리 보장
  - IMPACT: 비구조화 출력 시 프론트엔드에서 데이터 처리 불가

- [REQ-U-003] 시스템은 **항상** 허용된 도구(Read, Write, Grep)만 Claude Code에 전달해야 한다
  - WHY: 보안 제한으로 시스템 무결성 보호
  - IMPACT: 임의 도구 허용 시 시스템 보안 취약점 발생

- [REQ-U-004] 시스템은 **항상** AI 생성 요청에 대한 로딩 상태를 UI에 표시해야 한다
  - WHY: 사용자 경험 향상 및 작업 진행 상황 인지
  - IMPACT: 로딩 상태 미표시 시 사용자가 시스템 응답 여부 확인 불가

### Event-Driven Requirements (이벤트 기반)

- [REQ-E-001] **WHEN** 사용자가 Q&A 폼 완료 시 **THEN** Design Document 초안을 생성한다
  - Trigger: Q&A 폼 제출 이벤트
  - Action: Claude Code를 통해 Design Document 생성
  - Output: Design Document 마크다운 파일

- [REQ-E-002] **WHEN** 사용자가 수정 요청 제출 시 **THEN** AI가 문서를 수정한다
  - Trigger: 수정 요청 폼 제출 이벤트
  - Action: 기존 문서 + 수정 요청을 컨텍스트로 Claude Code 실행
  - Output: 수정된 문서 버전

- [REQ-E-003] **WHEN** Design Document가 승인될 때 **THEN** PRD 자동 생성을 트리거한다
  - Trigger: Design Document 승인 버튼 클릭
  - Action: Design Document를 입력으로 PRD 생성 프롬프트 실행
  - Output: PRD 마크다운 파일

- [REQ-E-004] **WHEN** PRD가 승인될 때 **THEN** Prototype HTML 생성을 트리거한다
  - Trigger: PRD 승인 버튼 클릭
  - Action: PRD를 입력으로 Prototype HTML 생성 프롬프트 실행
  - Output: Prototype HTML 파일

- [REQ-E-005] **WHEN** Feature List가 작성될 때 **THEN** 관련 시스템 키워드를 추출한다
  - Trigger: Feature List 저장 이벤트
  - Action: Claude Code로 Feature List 분석 및 키워드 추출
  - Output: 시스템 키워드 목록

### State-Driven Requirements (상태 기반)

- [REQ-S-001] **IF** Claude Code 프로세스가 실행 중이라면 **THEN** 중복 요청을 방지한다
  - State: isGenerating === true
  - Action: 추가 생성 요청 비활성화
  - WHY: 동시 실행으로 인한 리소스 경합 방지

- [REQ-S-002] **IF** 프로젝트에 참조 시스템이 선택되어 있다면 **THEN** 해당 컨텍스트를 프롬프트에 포함한다
  - State: project.referenceSystemIds.length > 0
  - Action: 참조 시스템 정보를 프롬프트 컨텍스트에 추가
  - WHY: 참조 시스템 기반 문서 품질 향상

- [REQ-S-003] **IF** 생성된 문서 버전이 존재한다면 **THEN** 버전 히스토리를 관리한다
  - State: document.versions.length > 0
  - Action: 새 버전 생성 시 이전 버전 보관
  - WHY: 문서 변경 이력 추적 및 롤백 지원

### Unwanted Behavior (금지 사항)

- [REQ-N-001] 시스템은 Claude Code 실행 중 임의의 도구 접근을 **허용하지 않아야 한다**
  - Forbidden: Bash, Shell, System 등 허용 목록 외 도구
  - WHY: 시스템 보안 및 무결성 보호
  - IMPACT: 임의 도구 허용 시 악의적 코드 실행 가능

- [REQ-N-002] 시스템은 타임아웃 없이 무한 대기 상태를 **유지하지 않아야 한다**
  - Forbidden: 타임아웃 미설정 프로세스 실행
  - WHY: 서버 리소스 보호
  - IMPACT: 무한 대기 시 서버 프로세스 고갈

- [REQ-N-003] 시스템은 생성 실패 시 사용자 알림 없이 **종료하지 않아야 한다**
  - Forbidden: 무음 실패 (Silent Failure)
  - WHY: 사용자 경험 및 디버깅 지원
  - IMPACT: 실패 원인 파악 불가로 사용자 혼란

## Specifications

### Data Models

#### ClaudeCodeRequest

```typescript
interface ClaudeCodeRequest {
  prompt: string;                    // 사용자 프롬프트
  projectId: string;                 // 프로젝트 ID
  documentType: DocumentType;        // 생성 문서 유형
  context?: {                        // 추가 컨텍스트
    qaResponses?: QAResponse[];      // Q&A 응답 데이터
    referenceSystemIds?: string[];   // 참조 시스템 ID 목록
    previousVersion?: string;        // 이전 버전 내용
    modificationRequest?: string;    // 수정 요청 내용
  };
  options?: {
    timeout?: number;                // 타임아웃 (기본: 120000ms)
    allowedTools?: string[];         // 허용 도구 (기본: Read, Write, Grep)
  };
}

type DocumentType = 'design-document' | 'prd' | 'prototype' | 'feature-analysis';
```

#### ClaudeCodeResponse

```typescript
interface ClaudeCodeResponse {
  success: boolean;
  documentType: DocumentType;
  content: string;                   // 생성된 문서 내용
  metadata: {
    generatedAt: string;             // ISO 8601 타임스탬프
    promptTokens: number;            // 입력 토큰 수
    outputTokens: number;            // 출력 토큰 수
    executionTime: number;           // 실행 시간 (ms)
  };
  version: string;                   // 문서 버전
  error?: {
    code: string;
    message: string;
  };
}
```

#### GenerationState

```typescript
interface GenerationState {
  isGenerating: boolean;
  currentTask: DocumentType | null;
  progress: number;                  // 0-100
  error: string | null;
  lastGenerated: {
    documentType: DocumentType;
    timestamp: string;
    success: boolean;
  } | null;
}
```

### Component Architecture

```
src/
├── services/
│   └── claudeCodeService.ts         # Claude Code API 호출 서비스
├── hooks/
│   └── useAIGeneration.ts           # AI 생성 상태 관리 커스텀 훅
├── components/
│   └── generation/
│       ├── GenerationProgress.tsx   # 생성 진행 상태 UI
│       ├── GenerationError.tsx      # 에러 표시 컴포넌트
│       └── DocumentPreview.tsx      # 생성 문서 미리보기

server/
├── routes/
│   └── generate.ts                  # AI 생성 API 엔드포인트
├── utils/
│   ├── claudeCodeRunner.ts          # Claude Code 프로세스 실행
│   └── promptBuilder.ts             # 동적 프롬프트 구성
└── types/
    └── generation.ts                # 생성 관련 타입 정의
```

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/generate/design-document | Design Document 생성 | Yes |
| POST | /api/generate/prd | PRD 생성 | Yes |
| POST | /api/generate/prototype | Prototype HTML 생성 | Yes |
| POST | /api/generate/analyze-features | Feature 분석 및 키워드 추출 | Yes |
| POST | /api/generate/modify | 기존 문서 수정 | Yes |
| GET | /api/generate/status | 현재 생성 상태 조회 | Yes |
| GET | /api/generate/history/:projectId | 프로젝트별 생성 히스토리 | Yes |

### Claude Code Runner Specification

```typescript
// server/utils/claudeCodeRunner.ts

interface RunnerOptions {
  timeout: number;              // 기본: 120000ms
  allowedTools: string[];       // 기본: ['Read', 'Write', 'Grep']
  workingDirectory: string;     // workspace 경로
  outputFormat: 'json' | 'text';
}

interface RunnerResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  timedOut: boolean;
}

// Claude Code CLI 실행 명령어 형식
// claude --print --output-format json --allowedTools Read,Write,Grep "prompt"
```

### Prompt Builder Specification

```typescript
// server/utils/promptBuilder.ts

interface PromptTemplate {
  type: DocumentType;
  basePrompt: string;
  contextInjectors: ContextInjector[];
  outputFormat: string;
}

interface ContextInjector {
  key: string;
  transform: (data: any) => string;
}

// 예시: Design Document 프롬프트 템플릿
const designDocumentTemplate: PromptTemplate = {
  type: 'design-document',
  basePrompt: `다음 Q&A 응답을 기반으로 Design Document를 작성하세요.
출력 형식: Markdown
섹션: Overview, Goals, User Stories, Technical Requirements, Constraints`,
  contextInjectors: [
    { key: 'qaResponses', transform: formatQAResponses },
    { key: 'referenceSystem', transform: formatReferenceContext }
  ],
  outputFormat: 'markdown'
};
```

### Security Specifications

- Claude Code 실행 시 allowedTools 파라미터로 도구 제한
- 프로세스 실행 전 입력 값 검증 및 sanitization
- 출력 데이터 JSON 파싱 시 에러 처리
- 환경변수로 민감 정보 관리 (ANTHROPIC_API_KEY)

### Error Handling

| Error Code | Description | Recovery Action |
|------------|-------------|-----------------|
| TIMEOUT | 120초 타임아웃 초과 | 사용자에게 재시도 안내 |
| PARSE_ERROR | JSON 파싱 실패 | 원본 출력 로깅 및 에러 보고 |
| TOOL_DENIED | 허용되지 않은 도구 접근 | 요청 거부 및 보안 로그 |
| PROCESS_ERROR | Claude Code 프로세스 실패 | 에러 메시지 표시 및 재시도 |
| RATE_LIMIT | API 호출 제한 | 대기 후 재시도 안내 |

## Traceability

- **Related SPECs**:
  - SPEC-PROJECT-001 (프로젝트 관리)
  - SPEC-REFERENCE-001 (참조 시스템)
  - SPEC-DOCUMENT-001 (문서 관리)
  - SPEC-QA-001 (Q&A 폼)
- **Dependencies**: child_process (Node.js), Claude Code CLI
- **Test Coverage Target**: 85%

## Constraints

- Claude Code CLI 응답 시간에 따라 전체 응답 시간 가변
- 동시 생성 요청 1개로 제한 (서버 리소스 보호)
- 단일 프롬프트 최대 길이: 100,000자
- 생성 문서 최대 크기: 500KB

---

**TAG**: SPEC-CLAUDE-001
**VERSION**: 1.0.0
**STATUS**: planned
