/**
 * LLM 통합 타입 정의 테스트
 */

import { describe, it, expect } from 'vitest';
import type {
  LLMProvider,
  ModelId,
  MessageRole,
  ChatMessage,
  LLMRequestOptions,
  LLMResponse,
  TokenUsage,
  PromptTemplate,
  LLMJobRequest,
  LLMJobStatus,
  LLMJob,
  StreamingChunk,
  FunctionCall,
  FunctionDefinition,
} from './llm.js';

describe('LLM Integration Types', () => {
  describe('LLMProvider', () => {
    it('should accept valid LLM providers', () => {
      const openai: LLMProvider = 'openai';
      const anthropic: LLMProvider = 'anthropic';
      const google: LLMProvider = 'google';
      const cohere: LLMProvider = 'cohere';

      expect(openai).toBe('openai');
      expect(anthropic).toBe('anthropic');
      expect(google).toBe('google');
      expect(cohere).toBe('cohere');
    });
  });

  describe('ModelId', () => {
    it('should accept string as model ID', () => {
      const modelId: ModelId = 'gpt-4';
      expect(modelId).toBe('gpt-4');
    });
  });

  describe('MessageRole', () => {
    it('should accept valid message roles', () => {
      const system: MessageRole = 'system';
      const user: MessageRole = 'user';
      const assistant: MessageRole = 'assistant';

      expect(system).toBe('system');
      expect(user).toBe('user');
      expect(assistant).toBe('assistant');
    });
  });

  describe('ChatMessage', () => {
    it('should have required message properties', () => {
      const message: ChatMessage = {
        role: 'user',
        content: 'Hello, AI!',
        timestamp: new Date(),
      };

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, AI!');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should allow optional timestamp', () => {
      const message: ChatMessage = {
        role: 'system',
        content: 'You are a helpful assistant.',
      };

      expect(message.role).toBe('system');
      expect(message.timestamp).toBeUndefined();
    });
  });

  describe('LLMRequestOptions', () => {
    it('should have optional request parameters', () => {
      const options: LLMRequestOptions = {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40,
        stopSequences: ['END', 'STOP'],
        stream: true,
      };

      expect(options.temperature).toBe(0.7);
      expect(options.maxTokens).toBe(1000);
      expect(options.topP).toBe(0.9);
      expect(options.topK).toBe(40);
      expect(options.stopSequences).toContain('END');
      expect(options.stream).toBe(true);
    });

    it('should allow empty options', () => {
      const emptyOptions: LLMRequestOptions = {};
      expect(Object.keys(emptyOptions)).toHaveLength(0);
    });
  });

  describe('LLMResponse', () => {
    it('should have required response properties', () => {
      const usage: TokenUsage = {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      };

      const response: LLMResponse = {
        content: 'This is AI response',
        model: 'gpt-4',
        usage,
        finishReason: 'stop',
      };

      expect(response.content).toBe('This is AI response');
      expect(response.model).toBe('gpt-4');
      expect(response.usage.totalTokens).toBe(30);
      expect(response.finishReason).toBe('stop');
    });

    it('should support different finish reasons', () => {
      const usage: TokenUsage = {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      };

      const lengthResponse: LLMResponse = {
        content: 'Response',
        model: 'gpt-4',
        usage,
        finishReason: 'length',
      };

      const filterResponse: LLMResponse = {
        content: 'Response',
        model: 'gpt-4',
        usage,
        finishReason: 'content_filter',
      };

      expect(lengthResponse.finishReason).toBe('length');
      expect(filterResponse.finishReason).toBe('content_filter');
    });
  });

  describe('TokenUsage', () => {
    it('should track token usage', () => {
      const usage: TokenUsage = {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      };

      expect(usage.promptTokens).toBe(100);
      expect(usage.completionTokens).toBe(50);
      expect(usage.totalTokens).toBe(150);
    });
  });

  describe('PromptTemplate', () => {
    it('should have template properties', () => {
      const template: PromptTemplate = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Code Review Template',
        description: 'Template for code review prompts',
        systemMessage: 'You are a code reviewer.',
        userMessageTemplate: 'Review this code: {code}',
        variables: ['code'],
        defaultOptions: {
          temperature: 0.3,
          maxTokens: 500,
        },
      };

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Code Review Template');
      expect(template.systemMessage).toBe('You are a code reviewer.');
      expect(template.variables).toContain('code');
      expect(template.defaultOptions.temperature).toBe(0.3);
    });
  });

  describe('LLMJobRequest', () => {
    it('should have required job request properties', () => {
      const messages: readonly ChatMessage[] = [
        { role: 'system', content: 'System message' },
        { role: 'user', content: 'User message' },
      ];

      const options: LLMRequestOptions = {
        temperature: 0.7,
      };

      const request: LLMJobRequest = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        provider: 'openai',
        model: 'gpt-4',
        messages,
        options,
      };

      expect(request.id).toBeDefined();
      expect(request.provider).toBe('openai');
      expect(request.model).toBe('gpt-4');
      expect(request.messages).toHaveLength(2);
    });
  });

  describe('LLMJobStatus', () => {
    it('should accept valid job statuses', () => {
      const pending: LLMJobStatus = 'pending';
      const processing: LLMJobStatus = 'processing';
      const completed: LLMJobStatus = 'completed';
      const failed: LLMJobStatus = 'failed';

      expect(pending).toBe('pending');
      expect(processing).toBe('processing');
      expect(completed).toBe('completed');
      expect(failed).toBe('failed');
    });
  });

  describe('LLMJob', () => {
    it('should have required job properties', () => {
      const request: LLMJobRequest = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        provider: 'anthropic',
        model: 'claude-3',
        messages: [{ role: 'user', content: 'Hello' }],
        options: {},
      };

      const job: LLMJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'completed',
        request,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      expect(job.id).toBeDefined();
      expect(job.status).toBe('completed');
      expect(job.request).toEqual(request);
      expect(job.createdAt).toBeInstanceOf(Date);
    });

    it('should support failed jobs with error', () => {
      const request: LLMJobRequest = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        options: {},
      };

      const failedJob: LLMJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'failed',
        request,
        error: 'API rate limit exceeded',
        createdAt: new Date(),
      };

      expect(failedJob.status).toBe('failed');
      expect(failedJob.error).toBe('API rate limit exceeded');
      expect(failedJob.response).toBeUndefined();
    });
  });

  describe('StreamingChunk', () => {
    it('should have chunk properties', () => {
      const chunk: StreamingChunk = {
        content: 'Hello',
        done: false,
      };

      expect(chunk.content).toBe('Hello');
      expect(chunk.done).toBe(false);
    });

    it('should indicate final chunk', () => {
      const finalChunk: StreamingChunk = {
        content: '',
        done: true,
      };

      expect(finalChunk.done).toBe(true);
    });
  });

  describe('FunctionCall', () => {
    it('should have function call properties', () => {
      const functionCall: FunctionCall = {
        name: 'calculate',
        arguments: {
          a: 1,
          b: 2,
          operation: 'add',
        },
      };

      expect(functionCall.name).toBe('calculate');
      expect(functionCall.arguments.a).toBe(1);
    });
  });

  describe('FunctionDefinition', () => {
    it('should have function definition properties', () => {
      const definition: FunctionDefinition = {
        name: 'search',
        description: 'Search the web',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
          },
        },
      };

      expect(definition.name).toBe('search');
      expect(definition.description).toBe('Search the web');
      expect(definition.parameters).toBeDefined();
    });
  });
});
