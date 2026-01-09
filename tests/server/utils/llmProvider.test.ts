/**
 * LLM Provider Factory Tests
 * TDD test suite for LLM provider creation and management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLLMProvider,
  createProviderById,
  getDefaultProvider,
  requiresApiKey,
  getDefaultEndpoint,
  OpenAIProvider,
  GeminiProvider,
  LMStudioProvider,
  ClaudeCodeProvider,
} from '../../../server/utils/llmProvider';
import type { LLMProviderSettings } from '../../../src/types/llm';

// Mock fetch for API tests
const originalFetch = global.fetch;

describe('LLM Provider Factory', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('createLLMProvider', () => {
    it('should create OpenAI provider', () => {
      const settings: LLMProviderSettings = {
        provider: 'openai',
        apiKey: 'sk-test-key',
        isEnabled: true,
        connectionStatus: 'untested',
      };

      const provider = createLLMProvider(settings);

      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.provider).toBe('openai');
    });

    it('should create Gemini provider', () => {
      const settings: LLMProviderSettings = {
        provider: 'gemini',
        apiKey: 'AIza-test-key',
        isEnabled: true,
        connectionStatus: 'untested',
      };

      const provider = createLLMProvider(settings);

      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.provider).toBe('gemini');
    });

    it('should create LMStudio provider', () => {
      const settings: LLMProviderSettings = {
        provider: 'lmstudio',
        apiKey: '',
        endpoint: 'http://localhost:1234/v1',
        isEnabled: true,
        connectionStatus: 'untested',
      };

      const provider = createLLMProvider(settings);

      expect(provider).toBeInstanceOf(LMStudioProvider);
      expect(provider.provider).toBe('lmstudio');
    });

    it('should create Claude Code provider', () => {
      const settings: LLMProviderSettings = {
        provider: 'claude-code',
        apiKey: '',
        isEnabled: true,
        connectionStatus: 'connected',
      };

      const provider = createLLMProvider(settings);

      expect(provider).toBeInstanceOf(ClaudeCodeProvider);
      expect(provider.provider).toBe('claude-code');
    });

    it('should throw error for unknown provider', () => {
      const settings = {
        provider: 'unknown-provider' as any,
        apiKey: '',
        isEnabled: true,
        connectionStatus: 'untested' as const,
      };

      expect(() => createLLMProvider(settings)).toThrow('Unknown provider');
    });
  });

  describe('createProviderById', () => {
    it('should create provider with API key', () => {
      const provider = createProviderById('openai', 'sk-test');

      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should create provider with custom endpoint', () => {
      const provider = createProviderById('lmstudio', undefined, 'http://custom:5000/v1');

      expect(provider).toBeInstanceOf(LMStudioProvider);
    });
  });

  describe('getDefaultProvider', () => {
    it('should return Claude Code provider', () => {
      const provider = getDefaultProvider();

      expect(provider).toBeInstanceOf(ClaudeCodeProvider);
      expect(provider.provider).toBe('claude-code');
    });
  });

  describe('requiresApiKey', () => {
    it('should return true for OpenAI', () => {
      expect(requiresApiKey('openai')).toBe(true);
    });

    it('should return true for Gemini', () => {
      expect(requiresApiKey('gemini')).toBe(true);
    });

    it('should return false for LMStudio', () => {
      expect(requiresApiKey('lmstudio')).toBe(false);
    });

    it('should return false for Claude Code', () => {
      expect(requiresApiKey('claude-code')).toBe(false);
    });
  });

  describe('getDefaultEndpoint', () => {
    it('should return OpenAI endpoint', () => {
      expect(getDefaultEndpoint('openai')).toBe('https://api.openai.com/v1');
    });

    it('should return Gemini endpoint', () => {
      expect(getDefaultEndpoint('gemini')).toBe('https://generativelanguage.googleapis.com/v1beta');
    });

    it('should return LMStudio endpoint', () => {
      expect(getDefaultEndpoint('lmstudio')).toBe('http://localhost:1234/v1');
    });

    it('should return undefined for Claude Code', () => {
      expect(getDefaultEndpoint('claude-code')).toBeUndefined();
    });
  });
});

describe('OpenAI Provider', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('generate', () => {
    it('should return error when API key not configured', async () => {
      const provider = new OpenAIProvider({ apiKey: '' });
      const result = await provider.generate('test prompt', {
        provider: 'openai',
        modelId: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API key not configured');
    });

    it('should make correct API call', async () => {
      const mockResponse = {
        id: 'test-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4o',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Generated content' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const provider = new OpenAIProvider({ apiKey: 'sk-test' });
      const result = await provider.generate('test prompt', {
        provider: 'openai',
        modelId: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      expect(result.success).toBe(true);
      expect(result.content).toBe('Generated content');
      expect(result.tokens?.input).toBe(10);
      expect(result.tokens?.output).toBe(5);
    });
  });

  describe('testConnection', () => {
    it('should return error when API key not configured', async () => {
      const provider = new OpenAIProvider({ apiKey: '' });
      const result = await provider.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('API key not configured');
    });

    it('should return success with models list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: 'gpt-4o', object: 'model', owned_by: 'openai' },
            { id: 'gpt-4o-mini', object: 'model', owned_by: 'openai' },
          ],
        }),
      });

      const provider = new OpenAIProvider({ apiKey: 'sk-test' });
      const result = await provider.testConnection();

      expect(result.success).toBe(true);
      expect(result.models).toContain('gpt-4o');
    });
  });

  describe('getAvailableModels', () => {
    it('should return static model list', async () => {
      const provider = new OpenAIProvider({ apiKey: '' });
      const models = await provider.getAvailableModels();

      expect(models).toContain('gpt-4o');
      expect(models).toContain('gpt-4o-mini');
      expect(models).toContain('gpt-4-turbo');
    });
  });
});

describe('Gemini Provider', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('generate', () => {
    it('should return error when API key not configured', async () => {
      const provider = new GeminiProvider({ apiKey: '' });
      const result = await provider.generate('test prompt', {
        provider: 'gemini',
        modelId: 'gemini-1.5-pro',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API key not configured');
    });

    it('should make correct API call', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Generated content' }],
              role: 'model',
            },
            finishReason: 'STOP',
            safetyRatings: [],
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const provider = new GeminiProvider({ apiKey: 'AIza-test' });
      const result = await provider.generate('test prompt', {
        provider: 'gemini',
        modelId: 'gemini-1.5-pro',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      expect(result.success).toBe(true);
      expect(result.content).toBe('Generated content');
    });
  });

  describe('getAvailableModels', () => {
    it('should return static model list', async () => {
      const provider = new GeminiProvider({ apiKey: '' });
      const models = await provider.getAvailableModels();

      expect(models).toContain('gemini-1.5-pro');
      expect(models).toContain('gemini-1.5-flash');
    });
  });
});

describe('LMStudio Provider', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('generate', () => {
    it('should make correct API call', async () => {
      const mockResponse = {
        id: 'test-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'local-model',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Local generated content' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const provider = new LMStudioProvider({ endpoint: 'http://localhost:1234/v1' });
      const result = await provider.generate('test prompt', {
        provider: 'lmstudio',
        modelId: 'llama-3.1-8b',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      });

      expect(result.success).toBe(true);
      expect(result.content).toBe('Local generated content');
    });
  });

  describe('testConnection', () => {
    it('should return helpful error when server not running', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('fetch failed'));

      const provider = new LMStudioProvider({ endpoint: 'http://localhost:1234/v1' });
      const result = await provider.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('LMStudio server not running');
    });

    it('should return success with models list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: 'llama-3.1-8b', object: 'model' },
            { id: 'qwen2.5-7b', object: 'model' },
          ],
        }),
      });

      const provider = new LMStudioProvider({ endpoint: 'http://localhost:1234/v1' });
      const result = await provider.testConnection();

      expect(result.success).toBe(true);
      expect(result.models).toContain('llama-3.1-8b');
    });
  });
});

describe('Claude Code Provider', () => {
  describe('getAvailableModels', () => {
    it('should return claude-3.5-sonnet', async () => {
      const provider = new ClaudeCodeProvider();
      const models = await provider.getAvailableModels();

      expect(models).toContain('claude-3.5-sonnet');
    });
  });
});
