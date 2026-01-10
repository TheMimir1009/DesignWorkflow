---
id: SPEC-MODELHISTORY-001
version: "1.1.0"
status: "completed"
created: "2026-01-10"
updated: "2026-01-10"
author: "MoAI-ADK"
priority: "medium"
---

# HISTORY

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.1.0 | 2026-01-10 | 구현 완료, 상태 업데이트 | MoAI-ADK |
| 1.0.0 | 2026-01-10 | 초기 SPEC 생성 | MoAI-ADK |

---

# SPEC-MODELHISTORY-001: AI 모델 히스토리 기록 시스템

## 개요

각 Task에서 문서 생성 시 사용된 AI 모델 정보를 자동으로 기록하고, Task 상세 모달에서 전체 히스토리를 확인할 수 있는 기능을 구현합니다.

### 배경

현재 AI Workflow Kanban 시스템은 각 Task의 Design Document, PRD, Prototype 생성 시 다양한 LLM 제공자(Claude Code, OpenAI, Gemini, LMStudio)를 사용할 수 있습니다. 그러나 어떤 모델로 문서가 생성되었는지에 대한 정보가 기록되지 않아 추적이 불가능합니다.

### 목적

- 문서 생성 시 사용된 AI 모델 정보 자동 기록
- 전체 생성/수정 히스토리 추적
- Task 상세 모달에서 히스토리 확인

---

## 요구사항 (EARS 형식)

### REQ-MH-001: 모델 정보 자동 기록 (Ubiquitous)

시스템은 **항상** 문서 생성 시 사용된 AI 모델 정보(provider, model ID, 생성 시각)를 Task에 저장해야 한다.

**근거**: 사용자가 어떤 AI 모델로 문서가 생성되었는지 추적할 수 있어야 함

**검증 방법**: 문서 생성 후 Task JSON에 모델 정보가 저장되었는지 확인

### REQ-MH-002: 히스토리 확장 (Event-Driven)

**WHEN** 문서가 생성되거나 수정될 때 **THEN** 시스템은 `generationHistory` 배열에 새 항목을 추가해야 한다.

**근거**: 전체 생성/수정 이력을 시간순으로 추적해야 함

**검증 방법**: 여러 번 생성 후 히스토리 항목 수 확인

### REQ-MH-003: 히스토리 표시 (Event-Driven)

**WHEN** 사용자가 Task 상세 모달을 열 때 **THEN** 시스템은 해당 Task의 AI 모델 히스토리 목록을 표시해야 한다.

**근거**: 사용자가 모달에서 쉽게 히스토리를 확인할 수 있어야 함

**검증 방법**: 모달에서 히스토리 목록 렌더링 테스트

### REQ-MH-004: 토큰 사용량 기록 (Optional)

**가능하면** 시스템은 각 생성 시 사용된 토큰 수(input/output)도 함께 기록해야 한다.

**근거**: 비용 추적 및 사용량 분석에 유용

**검증 방법**: 토큰 정보가 포함된 provider 응답 시 저장 확인

### REQ-MH-005: 하위 호환성 (State-Driven)

**IF** 기존 Task에 `generationHistory` 필드가 없는 경우 **THEN** 시스템은 빈 배열로 처리해야 한다.

**근거**: 기존 데이터와의 호환성 유지

**검증 방법**: 기존 Task 로드 시 에러 없이 처리되는지 확인

---

## 데이터 구조

### GenerationHistoryEntry 인터페이스

```typescript
export interface GenerationHistoryEntry {
  id: string;                              // UUID
  documentType: 'design' | 'prd' | 'prototype';
  action: 'create' | 'modify';             // 생성 또는 수정
  provider: LLMProvider;                   // 'openai' | 'gemini' | 'claude-code' | 'lmstudio'
  model: string;                           // 예: 'gpt-4o', 'gemini-1.5-pro'
  createdAt: string;                       // ISO 8601 타임스탬프
  tokens?: {
    input: number;
    output: number;
  };
  feedback?: string;                       // 수정 요청 시 사용자 피드백
}
```

### Task 인터페이스 확장

```typescript
export interface Task {
  // ... 기존 필드들 ...
  generationHistory: GenerationHistoryEntry[];  // 신규 필드
}
```

---

## 영향 범위

### Backend

| 파일 | 변경 내용 |
|------|----------|
| `src/types/index.ts` | GenerationHistoryEntry 추가, Task 확장 |
| `server/utils/taskStorage.ts` | addGenerationHistoryEntry 함수 추가 |
| `server/routes/generate.ts` | 생성 엔드포인트에 히스토리 기록 추가 |
| `server/routes/tasks.ts` | trigger-ai 엔드포인트에 히스토리 기록 추가 |

### Frontend

| 파일 | 변경 내용 |
|------|----------|
| `src/components/task/TaskEditModal.tsx` | 히스토리 섹션 추가 |
| `src/components/task/ModelHistoryList.tsx` (신규) | 히스토리 표시 컴포넌트 |

---

## 의존성

- SPEC-DOCUMENT-001: 문서 편집 파이프라인
- LLM Provider 시스템 (llmSettingsStore, llmProvider)

---

## 제약사항

- 히스토리 항목당 데이터 크기: 약 200-300 bytes
- 히스토리 저장 실패 시에도 문서 생성은 성공으로 처리
- 기존 Task 데이터와의 하위 호환성 필수
