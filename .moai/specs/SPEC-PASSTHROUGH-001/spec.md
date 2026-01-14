---
id: SPEC-PASSTHROUGH-001
version: "1.0.0"
status: completed
created: "2026-01-14"
updated: "2026-01-14"
author: "Mimir"
priority: HIGH
---

# SPEC-PASSTHROUGH-001: 패스쓰루 자동 파이프라인

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-14 | Mimir | 최초 작성 |

---

## 1. 개요 (Overview)

### 1.1 배경

AI Workflow Kanban 시스템에서 Q&A 완료 후 Design Doc, PRD, Prototype까지 자동으로 문서를 생성하는 "패스쓰루" 기능이 필요합니다. 현재는 각 단계별로 수동으로 카드를 이동해야 하지만, 패스쓰루 기능을 통해 버튼 한 번으로 전체 파이프라인을 자동 실행할 수 있습니다.

### 1.2 목표

1. Q&A 완료 시 버튼 한 번으로 Design Doc -> PRD -> Prototype 자동 생성
2. 파이프라인 실행 중 일시정지(pause), 재개(resume), 취소(cancel) 제어
3. 브라우저 새로고침 후에도 마지막 완료 단계부터 재개 가능
4. SPEC-LLM-001 설정을 활용한 LLM 연동 (mashup 모드 지원)
5. 실시간 진행률 표시 및 단계별 상태 관리

### 1.3 사용자 스토리

"기획자로서, Q&A 답변을 완료한 후 '자동 생성' 버튼을 클릭하면 Design Doc, PRD, Prototype이 순차적으로 자동 생성되길 원합니다. 생성 중간에 일시정지하거나 취소할 수 있어야 하며, 브라우저를 새로고침해도 진행 상태가 유지되어야 합니다."

---

## 2. 의존성 (Dependencies)

| SPEC ID | 제목 | 상태 | 관계 |
|---------|------|------|------|
| SPEC-QA-001 | 폼 기반 Q&A 시스템 | Completed | 트리거 지점 (Q&A 완료 시 패스쓰루 시작) |
| SPEC-DOCUMENT-001 | 문서 생성 및 편집 파이프라인 | Completed | 문서 생성 로직 재사용 |
| SPEC-LLM-001 | LLM 연결 테스트 시스템 | Completed | LLM 설정 연동 (mashup 모드) |
| SPEC-KANBAN-001 | 칸반 보드 UI | Completed | 카드 상태 이동 및 UI 업데이트 |

---

## 3. 환경 (Environment)

### 3.1 기술 스택

**프론트엔드**:
- React 19.2.x
- TypeScript 5.9.x
- Zustand 5.x (상태 관리)
- Tailwind CSS 4.x

**백엔드**:
- Node.js 20.x LTS
- Express 5.x
- TypeScript 5.9.x

**AI 엔진**:
- Claude Code (Headless Mode)
- Multi-LLM 지원 (OpenAI, Gemini, GLM, LM Studio)

### 3.2 디렉토리 구조

```
src/
  components/passthrough/
    PassthroughPanel.tsx         # 패스쓰루 제어 패널
    PassthroughProgress.tsx      # 진행률 표시 컴포넌트
    PassthroughStageCard.tsx     # 단계별 상태 카드
    PassthroughControls.tsx      # 일시정지/재개/취소 버튼
  store/
    passthroughStore.ts          # 패스쓰루 상태 관리
  services/
    passthroughService.ts        # 패스쓰루 API 서비스
  types/
    passthrough.ts               # 패스쓰루 관련 타입

server/
  routes/
    passthrough.ts               # 패스쓰루 API 라우트
  utils/
    passthroughRunner.ts         # 파이프라인 실행 엔진
    passthroughStorage.ts        # 상태 지속성 관리
```

---

## 4. 가정 (Assumptions)

### 4.1 기술적 가정

- [HIGH] SPEC-QA-001의 Q&A 시스템이 완전히 구현되어 있음
  - 신뢰도: High
  - 근거: SPEC-QA-001 상태가 Completed
  - 검증 방법: qaStore.currentSession.isCompleted 확인

- [HIGH] SPEC-DOCUMENT-001의 문서 생성 로직이 재사용 가능함
  - 신뢰도: High
  - 근거: SPEC-DOCUMENT-001 상태가 Completed
  - 검증 방법: generateDesignDocument, generatePRD, generatePrototype 함수 존재 확인

- [HIGH] SPEC-LLM-001의 LLM 설정이 정상 동작함
  - 신뢰도: High
  - 근거: SPEC-LLM-001 상태가 Completed
  - 검증 방법: llmSettingsStore.testConnection 성공 확인

- [MEDIUM] 파이프라인 상태는 서버 측 JSON 파일로 지속 저장됨
  - 신뢰도: Medium
  - 근거: 기존 프로젝트의 파일 기반 저장 패턴
  - 오류 시 대응: localStorage 폴백

### 4.2 비즈니스 가정

- [HIGH] 패스쓰루는 Q&A 완료 후에만 시작 가능함
  - 신뢰도: High
  - 근거: Q&A 답변이 문서 생성의 필수 입력

- [HIGH] 각 단계는 이전 단계 완료 후 순차적으로 실행됨
  - 신뢰도: High
  - 근거: Design Doc -> PRD -> Prototype 순서 의존성

- [MEDIUM] 단계별 타임아웃은 120초로 설정됨
  - 신뢰도: Medium
  - 근거: 기존 Claude Code 타임아웃 설정

---

## 5. 요구사항 (Requirements)

### 5.1 보편적 요구사항 (Ubiquitous Requirements)

**REQ-U-001: 상태 지속성**
시스템은 **항상** 파이프라인 상태(현재 단계, 완료된 단계, 실패 정보)를 서버에 저장하여 브라우저 새로고침 후에도 복구 가능해야 한다.

**REQ-U-002: 실시간 UI 업데이트**
시스템은 **항상** 파이프라인 진행 상태를 실시간으로 UI에 반영해야 한다 (현재 단계, 진행률, 예상 시간).

**REQ-U-003: LLM 설정 연동**
시스템은 **항상** SPEC-LLM-001에서 설정된 LLM 프로바이더와 모델을 사용하여 문서를 생성해야 한다.

**REQ-U-004: 진행률 표시**
시스템은 **항상** 전체 파이프라인 진행률(0-100%)과 현재 단계 정보를 표시해야 한다.

### 5.2 이벤트 기반 요구사항 (Event-Driven Requirements)

**REQ-E-001: 패스쓰루 시작**
**WHEN** Q&A가 완료된 상태에서 사용자가 "자동 생성" 버튼을 클릭 **THEN** 시스템은 Design Doc 생성부터 파이프라인을 시작해야 한다.

**REQ-E-002: 일시정지**
**WHEN** 파이프라인 실행 중 사용자가 "일시정지" 버튼을 클릭 **THEN** 시스템은 현재 단계 완료 후 파이프라인을 일시정지하고 상태를 'paused'로 변경해야 한다.

**REQ-E-003: 재개**
**WHEN** 파이프라인이 일시정지된 상태에서 사용자가 "재개" 버튼을 클릭 **THEN** 시스템은 다음 단계부터 파이프라인을 재개해야 한다.

**REQ-E-004: 취소**
**WHEN** 파이프라인 실행 중 사용자가 "취소" 버튼을 클릭 **THEN** 시스템은 즉시 파이프라인을 중단하고 상태를 'cancelled'로 변경해야 한다.

**REQ-E-005: 자동 진행**
**WHEN** 현재 단계 문서 생성이 성공적으로 완료 **THEN** 시스템은 자동으로 다음 단계를 시작해야 한다.

**REQ-E-006: 에러 처리**
**WHEN** 문서 생성 중 에러가 발생 **THEN** 시스템은 파이프라인을 중단하고 에러 정보를 표시하며 재시도 옵션을 제공해야 한다.

### 5.3 상태 기반 요구사항 (State-Driven Requirements)

**REQ-S-001: 버튼 상태 - idle**
**IF** 파이프라인 상태가 'idle' **THEN** "자동 생성" 버튼만 활성화하고 "일시정지", "재개", "취소" 버튼은 비활성화한다.

**REQ-S-002: 버튼 상태 - running**
**IF** 파이프라인 상태가 'running' **THEN** "일시정지"와 "취소" 버튼을 활성화하고 "자동 생성"과 "재개" 버튼은 비활성화한다.

**REQ-S-003: 버튼 상태 - paused**
**IF** 파이프라인 상태가 'paused' **THEN** "재개"와 "취소" 버튼을 활성화하고 "자동 생성"과 "일시정지" 버튼은 비활성화한다.

**REQ-S-004: 상태 복구**
**IF** 브라우저 새로고침 후 저장된 파이프라인 상태가 존재 **THEN** 시스템은 해당 상태를 복구하고 마지막 완료 단계 정보를 표시해야 한다.

### 5.4 금지 요구사항 (Unwanted Behavior Requirements)

**REQ-N-001: Q&A 미완료 시작 금지**
시스템은 Q&A가 완료되지 않은 상태에서 패스쓰루를 시작**하지 않아야 한다**.

**REQ-N-002: 중복 실행 금지**
시스템은 파이프라인이 이미 실행 중일 때 새로운 파이프라인을 시작**하지 않아야 한다**.

**REQ-N-003: 무한 재시도 금지**
시스템은 동일 단계에서 3회 이상 연속 실패 시 자동 재시도를 시도**하지 않아야 한다**.

**REQ-N-004: 칸반 카드 수동 이동 금지**
시스템은 패스쓰루 실행 중 해당 태스크의 칸반 카드 수동 드래그앤드롭 이동을 허용**하지 않아야 한다**.

### 5.5 선택적 요구사항 (Optional Requirements)

**REQ-O-001: 예상 시간 표시**
**가능하면** 시스템은 각 단계의 예상 소요 시간과 전체 예상 완료 시간을 표시해야 한다.

**REQ-O-002: 단계별 모델 선택**
**가능하면** 사용자가 각 단계(Design Doc, PRD, Prototype)에서 사용할 LLM 모델을 개별 선택할 수 있어야 한다.

**REQ-O-003: 이전 결과 비교**
**가능하면** 재실행 시 이전 생성 결과와 새 결과를 비교할 수 있어야 한다.

**REQ-O-004: 알림 기능**
**가능하면** 파이프라인 완료 또는 에러 발생 시 브라우저 알림을 제공해야 한다.

---

## 6. 명세 (Specifications)

### 6.1 타입 정의

```typescript
// src/types/passthrough.ts

// 파이프라인 상태
export type PipelineStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

// 단계 상태
export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// 파이프라인 단계
export type PipelineStage = 'design_doc' | 'prd' | 'prototype';

// 단계 정보
export interface StageInfo {
  stage: PipelineStage;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  error?: {
    code: string;
    message: string;
    retryCount: number;
  };
  documentId?: string;
}

// 파이프라인 상태
export interface PipelineState {
  id: string;
  taskId: string;
  status: PipelineStatus;
  currentStage: PipelineStage | null;
  stages: StageInfo[];
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
  cancelledAt?: string;
  progress: number;  // 0-100
  llmSettings: {
    provider: string;
    model: string;
    routingMode: string;
  };
}

// 패스쓰루 시작 요청
export interface StartPassthroughRequest {
  taskId: string;
  resumeFromStage?: PipelineStage;  // 재개 시 시작 단계
}

// 패스쓰루 응답
export interface PassthroughResponse {
  success: boolean;
  pipeline: PipelineState;
  message?: string;
}
```

### 6.2 컴포넌트 명세

#### PassthroughPanel.tsx

```typescript
interface PassthroughPanelProps {
  taskId: string;
  isQACompleted: boolean;
  onComplete?: () => void;
}

// 기능:
// - 파이프라인 상태 표시 (idle, running, paused, completed, failed)
// - 단계별 진행 상태 카드 렌더링
// - 제어 버튼 (시작, 일시정지, 재개, 취소)
// - 에러 발생 시 재시도 옵션
```

#### PassthroughProgress.tsx

```typescript
interface PassthroughProgressProps {
  progress: number;  // 0-100
  currentStage: PipelineStage | null;
  stages: StageInfo[];
}

// 기능:
// - 전체 진행률 프로그레스 바
// - 현재 실행 중인 단계 표시
// - 각 단계별 완료/진행/대기 상태 아이콘
```

#### PassthroughStageCard.tsx

```typescript
interface PassthroughStageCardProps {
  stage: StageInfo;
  isActive: boolean;
}

// 기능:
// - 단계 이름 및 상태 표시
// - 실행 시간 표시
// - 에러 정보 표시
// - 완료된 문서 링크
```

#### PassthroughControls.tsx

```typescript
interface PassthroughControlsProps {
  status: PipelineStatus;
  isQACompleted: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
  isLoading: boolean;
}

// 기능:
// - 상태에 따른 버튼 활성화/비활성화
// - 로딩 상태 표시
// - 확인 다이얼로그 (취소 시)
```

### 6.3 API 엔드포인트

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /api/tasks/:taskId/passthrough/start | 패스쓰루 시작 | StartPassthroughRequest | PassthroughResponse |
| POST | /api/tasks/:taskId/passthrough/pause | 일시정지 | - | PassthroughResponse |
| POST | /api/tasks/:taskId/passthrough/resume | 재개 | - | PassthroughResponse |
| POST | /api/tasks/:taskId/passthrough/cancel | 취소 | - | PassthroughResponse |
| GET | /api/tasks/:taskId/passthrough/status | 상태 조회 | - | PassthroughResponse |
| POST | /api/tasks/:taskId/passthrough/retry | 재시도 | { stage: PipelineStage } | PassthroughResponse |

### 6.4 상태 관리 (passthroughStore)

```typescript
// src/store/passthroughStore.ts
interface PassthroughStore {
  // 상태
  pipeline: PipelineState | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  startPipeline: (taskId: string) => Promise<void>;
  pausePipeline: (taskId: string) => Promise<void>;
  resumePipeline: (taskId: string) => Promise<void>;
  cancelPipeline: (taskId: string) => Promise<void>;
  retryStage: (taskId: string, stage: PipelineStage) => Promise<void>;
  fetchPipelineStatus: (taskId: string) => Promise<void>;
  clearPipeline: () => void;

  // 폴링
  startPolling: (taskId: string) => void;
  stopPolling: () => void;
}
```

### 6.5 파이프라인 실행 흐름

```
Q&A 완료
    |
    v
[사용자] "자동 생성" 클릭
    |
    v
[Client] POST /passthrough/start
    |
    v
[Server] 파이프라인 상태 생성 (status: 'running')
    |
    v
[Server] Stage 1: Design Doc 생성
    |
    +-- 성공 --> Stage 2: PRD 생성
    |              |
    |              +-- 성공 --> Stage 3: Prototype 생성
    |              |              |
    |              |              +-- 성공 --> 완료 (status: 'completed')
    |              |              |
    |              |              +-- 실패 --> 에러 (status: 'failed')
    |              |
    |              +-- 실패 --> 에러 (status: 'failed')
    |
    +-- 실패 --> 에러 (status: 'failed')
    |
    +-- 일시정지 요청 --> 현재 단계 완료 후 (status: 'paused')
    |
    +-- 취소 요청 --> 즉시 중단 (status: 'cancelled')
```

### 6.6 상태 지속성

```typescript
// workspace/passthrough/{taskId}.json
interface PersistentPipelineState extends PipelineState {
  version: string;
  lastUpdatedAt: string;
}
```

---

## 7. 비기능 요구사항

### 7.1 성능

- 파이프라인 시작 API 응답: 500ms 이내
- 상태 폴링 간격: 2초
- 단계별 타임아웃: 120초
- UI 상태 업데이트: 200ms 이내

### 7.2 안정성

- 네트워크 오류 시 자동 재시도 (최대 3회)
- 브라우저 새로고침 후 상태 복구
- 서버 재시작 후 진행 중인 파이프라인 복구

### 7.3 사용성

- 명확한 진행 상태 표시
- 에러 발생 시 구체적인 원인과 해결 방법 안내
- 키보드 단축키 지원 (Escape: 취소 확인)

---

## 8. 추적성 (Traceability)

### 8.1 파일 매핑

| 컴포넌트 | 파일 경로 | 담당 |
|----------|-----------|------|
| PassthroughPanel | src/components/passthrough/PassthroughPanel.tsx | expert-frontend |
| PassthroughProgress | src/components/passthrough/PassthroughProgress.tsx | expert-frontend |
| PassthroughStageCard | src/components/passthrough/PassthroughStageCard.tsx | expert-frontend |
| PassthroughControls | src/components/passthrough/PassthroughControls.tsx | expert-frontend |
| passthroughStore | src/store/passthroughStore.ts | expert-frontend |
| passthroughService | src/services/passthroughService.ts | expert-frontend |
| passthrough types | src/types/passthrough.ts | expert-frontend |
| passthrough route | server/routes/passthrough.ts | expert-backend |
| passthroughRunner | server/utils/passthroughRunner.ts | expert-backend |
| passthroughStorage | server/utils/passthroughStorage.ts | expert-backend |

### 8.2 관련 문서

- [plan.md](./plan.md) - 구현 계획
- [acceptance.md](./acceptance.md) - 인수 기준

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-14 | Mimir | 초기 SPEC 작성 |
