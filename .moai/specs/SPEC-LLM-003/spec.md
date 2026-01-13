---
spec_id: SPEC-LLM-003
title: LM Studio Provider Refactoring
category: llm
priority: medium
status: draft
created_at: 2026-01-12
updated_at: 2026-01-12
author: alfred
version: 1.0.0
---

# SPEC-LLM-003: LM Studio Provider Refactoring

## Overview

**Description**: LM Studio 프로바이더를 리팩토링하여 모델 목록 표시 문제를 해결하고 기본 클래스와의 일관성을 확보

**Purpose**: LM Studio 프로바이더에서 모델 목록이 표시되지 않는 문제를 해결하고, BaseHTTPProvider의 testConnection(projectId) 기능을 활용하여 SPEC-LLM-002의 연결 테스트 로깅을 지원

**Scope**: LMStudioProvider 간소화, BaseHTTPProvider에 requiresAuth 플래그 추가, getAvailableModels() 재구현

## Background

### Current State

LM Studio 프로바이더는 다음과 같은 문제가 있음:

1. **testConnection() 오버라이드**: BaseHTTPProvider의 testConnection(projectId?)를 오버라이드하여 SPEC-LLM-002 로깅 기능이 작동하지 않음
2. **순환 참조**: getAvailableModels()가 자신의 testConnection()을 호출하여 무한 루프 가능성
3. **코드 중복**: makeLocalRequest()가 기본 클래스의 makeRequest()와 거의 동일한 코드 중복
4. **모델 목록 미표시**: UI에서 LM Studio 선택 시 모델 목록이 비어있음

### Problem Statement

사용자가 LM Studio를 선택했을 때 모델 목록을 확인할 수 없음:
- `/models` 엔드포인트 호출이 올바르게 처리되지 않음
- 연결 테스트 로그가 기록되지 않음 (SPEC-LLM-002 미준수)
- 코드 중복으로 유지보수 어려움

### Solution Approach

1. BaseHTTPProvider에 requiresAuth 플래그 추가
2. LMStudioProvider에서 testConnection() 오버라이드 제거
3. getAvailableModels()를 /models 엔드포인트 직접 호출로 재구현
4. makeLocalRequest() 삭제하고 기본 클래스의 makeRequest() 사용

## Requirements (EARS Format)

### Ubiquitous Requirements (항상 적용)

**REQ-LMSTUDIO-001**: LMStudioProvider는 BaseHTTPProvider의 testConnection(projectId?) 메서드를 사용해야 한다.

**REQ-LMSTUDIO-002**: LMStudioProvider는 getAvailableModels() 메서드를 통해 사용 가능한 모델 목록을 반환해야 한다.

**REQ-LMSTUDIO-003**: LM Studio는 API 키 인증이 필요 없는 프로바이더로 처리되어야 한다.

### Event-Driven Requirements (이벤트 발생 시 수행)

**REQ-LMSTUDIO-004**: 사용자가 LM Studio 프로바이더를 선택하면, 시스템은 /models 엔드포인트를 호출하여 모델 목록을 표시해야 한다.

**REQ-LMSTUDIO-005**: 연결 테스트가 요청되면, 시스템은 BaseHTTPProvider의 testConnection(projectId)를 호출하고 로그를 기록해야 한다.

### State-Driven Requirements (상태에 따른 수행)

**REQ-LMSTUDIO-006**: LM Studio 서버가 실행 중인 상태에서는, getAvailableModels()가 로드된 모델 목록을 반환해야 한다.

**REQ-LMSTUDIO-007**: LM Studio 서버가 중지된 상태에서는, getAvailableModels()가 빈 배열을 반환해야 한다.

### Unwanted Requirements (금지 사항)

**REQ-LMSTUDIO-008**: LMStudioProvider는 testConnection()을 오버라이드해서는 안 된다.

**REQ-LMSTUDIO-009**: LMStudioProvider는 makeLocalRequest()와 같은 중복 코드를 포함해서는 안 된다.

**REQ-LMSTUDIO-010**: getAvailableModels()는 testConnection()을 호출해서는 안 된다.

## Technical Specification

### Architecture

현재 LM Studio 프로바이더 구조:
```
LMStudioProvider
├── testConnection()      (오버라이드 - 삭제 예정)
├── getAvailableModels()  (testConnection 호출 - 수정 예정)
├── makeLocalRequest()    (중복 코드 - 삭제 예정)
└── generate()            (makeLocalRequest 사용 - 수정 예정)
```

리팩토링 후 구조:
```
LMStudioProvider
├── requiresAuth = false  (새로 추가)
├── getAvailableModels()  (/models 직접 호출)
└── generate()            (기본 makeRequest 사용)
      ↑
      └── BaseHTTPProvider.testConnection(projectId?) 사용
```

### Component Design

#### 1. BaseHTTPProvider Modification

**File**: `server/utils/llmProviders/base.ts`

```typescript
export abstract class BaseHTTPProvider implements LLMProviderInterface {
  // ... 기존 코드 ...

  protected requiresAuth: boolean = true;  // 새로 추가

  constructor(config: ProviderConfig, defaultEndpoint: string) {
    this.apiKey = config.apiKey || '';
    this.endpoint = config.endpoint || defaultEndpoint;
    this.logger = config.logger || new LLMLogger();
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig };
    this.requiresAuth = config.requiresAuth ?? true;  // 새로 추가
  }

  protected async makeRequest<T>(...) {
    // ...
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.requiresAuth && { 'Authorization': `Bearer ${this.apiKey}` }),  // 수정
      },
      // ...
    });
  }
}
```

#### 2. LMStudioProvider Refactoring

**File**: `server/utils/llmProviders/lmstudio.ts`

**삭제**:
- testConnection() 메서드 (95-141줄)
- makeLocalRequest() 메서드 (156-251줄)

**수정**:
```typescript
export class LMStudioProvider extends BaseHTTPProvider {
  readonly provider = 'lmstudio' as const;
  protected requiresAuth = false;  // 인증 불필요

  constructor(config: ProviderConfig) {
    super(config, config.endpoint || LMSTUDIO_DEFAULT_ENDPOINT);
    this.apiKey = config.apiKey || 'lm-studio';
  }

  async generate(prompt: string, config: LLMModelConfig): Promise<LLMResult> {
    try {
      // 기본 클래스의 makeRequest 사용 (makeLocalRequest 삭제)
      const response = await this.makeRequest<LMStudioChatCompletionResponse>(
        `${this.endpoint}/chat/completions`,
        {
          model: config.modelId || 'local-model',
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: config.topP,
        },
        config
      );

      const content = response.choices[0]?.message?.content || '';

      return {
        success: true,
        content,
        rawOutput: JSON.stringify(response),
        provider: this.provider,
        model: config.modelId || response.model,
        tokens: response.usage ? {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
        } : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.provider,
        model: config.modelId,
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as LMStudioModelsResponse;
      return data.data?.map(m => m.id) || [];
    } catch {
      return [];
    }
  }
}
```

### File Modifications

| 파일 | 작업 | 설명 |
|------|------|------|
| `server/utils/llmProviders/base.ts` | 수정 | requiresAuth 플래그 추가, makeRequest() Authorization 헤더 조건부 처리 |
| `server/utils/llmProviders/lmstudio.ts` | 수정 | testConnection() 삭제, getAvailableModels() 재구현, makeLocalRequest() 삭제 |

### API Endpoints

**GET /api/projects/:projectId/llm-settings/provider/lmstudio/models**

LM Studio 서버의 `/models` 엔드포인트를 호출하여 사용 가능한 모델 목록 반환.

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "provider": "lmstudio",
    "models": [
      "lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF",
      "lmstudio-community/Mistral-7B-Instruct-v0.3-GGUF"
    ]
  }
}
```

## Security Considerations

1. **API Key 보호**: LM Studio는 로컬 서버이므로 API 키가 필요 없음
2. **CORS 설정**: 로컬 서버 접근을 위한 CORS 허용 필요

## Performance Considerations

1. **타임아웃**: /models 엔드포인트 호출에 5초 타임아웃 적용
2. **캐싱**: 모델 목록은 세션 동안 캐싱 고려 (선택 사항)

## Dependencies

### Internal
- `server/utils/llmProviders/base.ts` - BaseHTTPProvider
- `server/routes/llmSettings.ts` - LLM Settings API

### External
- LM Studio 로컬 서버 (기본: http://localhost:1234/v1)

## Success Criteria

1. LM Studio 선택 시 모델 목록이 정상 표시됨
2. 연결 테스트 로그가 기록됨 (SPEC-LLM-002 준수)
3. 코드 중복이 제거됨 (약 160줄 → 70줄)
4. 기존 기능 회귀 없음
