---
spec_id: SPEC-LLM-004
title: LM Studio Dynamic Model Selection UI
category: llm
priority: high
status: completed
created_at: 2026-01-12
updated_at: 2026-01-13
author: alfred
version: 1.1.0
related_specs:
  - SPEC-LLM-002: LLM Connection Test Logging
  - SPEC-LLM-003: LM Studio Provider Refactoring
---

# SPEC-LLM-004: LM Studio 동적 모델 선택 UI 구현

## Overview

**Description**: LM Studio 프로바이더 선택 시 모델 목록을 동적으로 가져와서 표시하는 프론트엔드 기능 구현

**Purpose**: 현재 LM Studio 선택 시 모델 드롭다운이 비어있는 문제를 해결하고, 실제 로드된 모델 목록을 사용자에게 표시

**Scope**: 프론트엔드 컴포넌트 수정 (TaskStageModelSelector, ColumnLLMSettingsModal)

## Background

### Current State

LM Studio 연결 테스트는 성공하고 API 로그에 모델 목록이 기록되지만, UI에서는 모델 목록이 표시되지 않음:

1. **정상 작동 부분**:
   - `GET /api/projects/:projectId/llm-settings/provider/lmstudio/models` 엔드포인트 작동
   - `getProviderModels()` 서비스 함수 존재
   - LM Studio 서버에서 모델 목록을 성공적으로 가져옴

2. **문제 부분**:
   - `TaskStageModelSelector.tsx`가 정적 `AVAILABLE_MODELS` 상수 사용 (Line 67, 99-101)
   - `ColumnLLMSettingsModal.tsx`가 동일한 정적 상수 사용 (Line 92, 133-135)
   - `src/types/llm.ts`에 `lmstudio: []` 빈 배열 정의

### Problem Statement

사용자가 Design Doc/PRD 설정에서 LM Studio를 선택하면:
- 모델 드롭다운이 비어있음
- 사용자가 모델을 선택할 수 없음
- 실제로는 5개 이상의 모델이 LM Studio에 로드되어 있음

### Root Cause

프론트엔드 컴포넌트가 정적 모델 목록(`AVAILABLE_MODELS`)을 사용하고, 동적 API 호출(`getProviderModels()`)을 사용하지 않음

## Requirements (EARS Format)

### Ubiquitous Requirements (항상 적용)

**REQ-LLMUI-001**: 시스템은 LM Studio 프로바이더 선택 시 모델 목록을 API를 통해 동적으로 가져와야 한다.

**REQ-LLMUI-002**: 시스템은 모델 목록을 가져오는 동안 로딩 상태를 표시해야 한다.

**REQ-LLMUI-003**: 시스템은 OpenAI, Gemini, Claude Code 프로바이더에 대해서는 기존 정적 모델 목록을 사용해야 한다.

### Event-Driven Requirements (이벤트 발생 시 수행)

**REQ-LLMUI-004**: WHEN 사용자가 LM Studio 프로바이더를 선택하면, 시스템은 `getProviderModels()` API를 호출하여 모델 목록을 가져와야 한다.

**REQ-LLMUI-005**: WHEN 모델 목록 가져오기가 성공하면, 시스템은 드롭다운에 모델 목록을 표시해야 한다.

**REQ-LLMUI-006**: WHEN 모델 목록 가져오기가 실패하면, 시스템은 에러 메시지를 표시하고 빈 목록을 처리해야 한다.

**REQ-LLMUI-007**: WHEN LM Studio 서버에 연결할 수 없으면, 시스템은 "서버 연결 불가" 메시지를 표시해야 한다.

### State-Driven Requirements (상태에 따른 수행)

**REQ-LLMUI-008**: IF 모델 목록을 가져오는 중이면, 시스템은 드롭다운을 비활성화하고 로딩 스피너를 표시해야 한다.

**REQ-LLMUI-009**: IF 가져온 모델 목록이 비어있으면, 시스템은 "사용 가능한 모델 없음" 메시지를 표시해야 한다.

**REQ-LLMUI-010**: IF LM Studio 프로바이더가 선택 해제되면, 시스템은 캐시된 모델 목록을 초기화해야 한다.

### Unwanted Requirements (금지 사항)

**REQ-LLMUI-011**: 모델 목록 가져오기는 UI 스레드를 차단해서는 안 된다.

**REQ-LLMUI-012**: 동적 모델 로딩은 다른 프로바이더(OpenAI, Gemini, Claude Code)의 동작에 영향을 주어서는 안 된다.

**REQ-LLMUI-013**: 모델 목록 가져오기 실패 시 전체 컴포넌트가 오류 상태가 되어서는 안 된다.

### Optional Requirements (선택 사항)

**REQ-LLMUI-014**: WHERE 가능하면, 시스템은 모델 목록을 세션 동안 캐싱하여 불필요한 API 호출을 줄여야 한다.

**REQ-LLMUI-015**: WHERE 가능하면, 시스템은 모델 목록을 자동으로 갱신하는 "새로고침" 버튼을 제공해야 한다.

## Technical Specification

### Architecture

현재 아키텍처:
```
TaskStageModelSelector
├── AVAILABLE_MODELS[lmstudio] → [] (빈 배열)
└── 모델 드롭다운 → 비어있음
```

개선 후 아키텍처:
```
TaskStageModelSelector
├── useState: models (동적 상태)
├── useState: isLoading (로딩 상태)
├── useState: error (에러 상태)
├── useEffect: provider가 lmstudio일 때 getProviderModels() 호출
└── 모델 드롭다운 → API에서 가져온 모델 목록
```

### Component Design

#### 1. TaskStageModelSelector Modification

**File**: `src/components/llm/TaskStageModelSelector.tsx`

**추가할 상태**:
```typescript
const [dynamicModels, setDynamicModels] = useState<Record<LLMProvider, string[]>>({
  lmstudio: [],
});
const [isLoadingModels, setIsLoadingModels] = useState(false);
const [modelLoadError, setModelLoadError] = useState<string | null>(null);
```

**추가할 useEffect**:
```typescript
useEffect(() => {
  const fetchModelsForProvider = async (provider: LLMProvider, projectId: string) => {
    if (provider !== 'lmstudio') {
      return; // LM Studio에만 동적 로딩 적용
    }

    setIsLoadingModels(true);
    setModelLoadError(null);

    try {
      const models = await getProviderModels(projectId, provider);
      setDynamicModels(prev => ({ ...prev, [provider]: models }));
    } catch (error) {
      setModelLoadError(error instanceof Error ? error.message : '모델 목록을 가져오지 못했습니다');
      setDynamicModels(prev => ({ ...prev, [provider]: [] }));
    } finally {
      setIsLoadingModels(false);
    }
  };

  if (localConfig?.provider && projectId) {
    fetchModelsForProvider(localConfig.provider, projectId);
  }
}, [localConfig?.provider, projectId]);
```

**모델 목록 계산 로직 수정**:
```typescript
const availableModels = localConfig
  ? (localConfig.provider === 'lmstudio'
      ? dynamicModels.lmstudio
      : AVAILABLE_MODELS[localConfig.provider]) || []
  : [];
```

#### 2. ColumnLLMSettingsModal Modification

**File**: `src/components/llm/ColumnLLMSettingsModal.tsx`

TaskStageModelSelector와 동일한 패턴 적용:
- 동적 모델 상태 추가
- useEffect로 모델 가져오기
- availableModels 계산 로직 수정

#### 3. Loading State UI

로딩 중일 때 표시:
```tsx
{isLoadingModels && localConfig?.provider === 'lmstudio' && (
  <div className="flex items-center gap-2 text-sm text-gray-400">
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      {/* 스피너 SVG */}
    </svg>
    <span>모델 목록을 가져오는 중...</span>
  </div>
)}
```

#### 4. Error State UI

에러 발생 시 표시:
```tsx
{modelLoadError && localConfig?.provider === 'lmstudio' && (
  <div className="text-sm text-amber-500 flex items-center gap-2">
    <svg className="h-4 w-4" viewBox="0 0 20 20">
      {/* 경고 아이콘 */}
    </svg>
    <span>{modelLoadError}</span>
  </div>
)}
```

### File Modifications

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/components/llm/TaskStageModelSelector.tsx` | 수정 | 동적 모델 로딩 상태, useEffect, UI 추가 |
| `src/components/llm/ColumnLLMSettingsModal.tsx` | 수정 | 동적 모델 로딩 상태, useEffect, UI 추가 |
| `src/types/llm.ts` | 유지 | lmstudio: [] 주석 유지 (동적 로딩임을 표시) |

### API Usage

**기존 API 함수** (이미 존재):
```typescript
// src/services/llmSettingsService.ts
export async function getProviderModels(
  projectId: string,
  provider: LLMProvider
): Promise<string[]>
```

**엔드포인트**: `GET /api/projects/:projectId/llm-settings/provider/:provider/models`

## Security Considerations

1. **API Key 보호**: 모델 목록 가져오기는 API 키 노출 없이 수행됨
2. **CORS 설정**: 이미 서버에서 처리됨

## Performance Considerations

1. **요청 디바운싱**: 프로바이더 변경 시에만 요청
2. **캐싱** (선택 사항): 세션 동안 모델 목록 캐싱
3. **타임아웃**: 서버에서 5초 타임아웃 적용됨

## Dependencies

### Internal
- `src/services/llmSettingsService.ts` - getProviderModels() 함수
- `src/types/llm.ts` - LLMProvider 타입 정의

### External
- 없음 (기존 API 활용)

### Related SPECs
- **SPEC-LLM-002**: 연결 테스트 로깅 (서버 로그 확인용)
- **SPEC-LLM-003**: LM Studio 프로바이더 리팩토링 (백엔드 API)

## Success Criteria

1. LM Studio 선택 시 모델 목록이 드롭다운에 표시됨
2. 로딩 상태가 사용자에게 명확히 표시됨
3. 에러 발생 시 적절한 메시지가 표시됨
4. 다른 프로바이더(OpenAI, Gemini, Claude Code) 동작에 영향 없음
5. 기존 기능 회귀 없음

## Traceability

| REQ ID | Component | Test Scenario |
|--------|-----------|---------------|
| REQ-LLMUI-001 | TaskStageModelSelector | TC-LLMUI-001 |
| REQ-LLMUI-001 | ColumnLLMSettingsModal | TC-LLMUI-002 |
| REQ-LLMUI-002 | Both Components | TC-LLMUI-003 |
| REQ-LLMUI-003 | Both Components | TC-LLMUI-004 |
| REQ-LLMUI-006 | Both Components | TC-LLMUI-005 |
| REQ-LLMUI-007 | Both Components | TC-LLMUI-006 |
