/**
 * LLM 통합 타입 정의
 * AI 언어 모델과의 통신을 위한 타입
 */

import type { EntityId } from './index.js';

// 지원되는 LLM 공급자
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'cohere';

// 모델 ID 타입
export type ModelId = string;

// 메시지 역할
export type MessageRole = 'system' | 'user' | 'assistant';

// 채팅 메시지
export interface ChatMessage {
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp?: Date;
}

// LLM 요청 옵션
export interface LLMRequestOptions {
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly stopSequences?: readonly string[];
  readonly stream?: boolean;
}

// LLM 응답
export interface LLMResponse {
  readonly content: string;
  readonly model: ModelId;
  readonly usage: TokenUsage;
  readonly finishReason: 'stop' | 'length' | 'content_filter';
}

// 토큰 사용량
export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

// LLM 프롬프트 템플릿
export interface PromptTemplate {
  readonly id: EntityId;
  readonly name: string;
  readonly description: string;
  readonly systemMessage: string;
  readonly userMessageTemplate: string;
  readonly variables: readonly string[];
  readonly defaultOptions: LLMRequestOptions;
}

// LLM 작업 요청
export interface LLMJobRequest {
  readonly id: EntityId;
  readonly provider: LLMProvider;
  readonly model: ModelId;
  readonly messages: readonly ChatMessage[];
  readonly options: LLMRequestOptions;
}

// LLM 작업 상태
export type LLMJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// LLM 작업 결과
export interface LLMJob {
  readonly id: EntityId;
  readonly status: LLMJobStatus;
  readonly request: LLMJobRequest;
  readonly response?: LLMResponse;
  readonly error?: string;
  readonly createdAt: Date;
  readonly completedAt?: Date;
}

// 스트리밍 청크
export interface StreamingChunk {
  readonly content: string;
  readonly done: boolean;
}

// 함수 호출 정의
export interface FunctionCall {
  readonly name: string;
  readonly arguments: Record<string, unknown>;
}

// 함수 정의
export interface FunctionDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}
