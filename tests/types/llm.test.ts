/**
 * LLM Type Tests
 * TDD test suite for LLM provider types and utility functions
 */
import { describe, it, expect } from 'vitest';
import {
  type LLMModelConfig,
  type LLMProviderSettings,
  type TaskStageConfig,
  type ProjectLLMSettings,
  LLM_PROVIDERS,
  AVAILABLE_MODELS,
  DEFAULT_MODEL_PARAMS,
  isValidProvider,
  isValidConnectionStatus,
  createDefaultModelConfig,
  createDefaultProviderSettings,
  createDefaultTaskStageConfig,
  createDefaultProjectLLMSettings,
  getProviderDisplayName,
  getProviderIcon,
} from '../../src/types/llm';

describe('LLM Types', () => {
  describe('LLM_PROVIDERS', () => {
    it('should have exactly 4 providers', () => {
      expect(LLM_PROVIDERS).toHaveLength(4);
    });

    it('should include all required providers', () => {
      expect(LLM_PROVIDERS).toContain('openai');
      expect(LLM_PROVIDERS).toContain('gemini');
      expect(LLM_PROVIDERS).toContain('claude-code');
      expect(LLM_PROVIDERS).toContain('lmstudio');
    });
  });

  describe('AVAILABLE_MODELS', () => {
    it('should have models for OpenAI', () => {
      expect(AVAILABLE_MODELS.openai).toBeDefined();
      expect(AVAILABLE_MODELS.openai.length).toBeGreaterThan(0);
      expect(AVAILABLE_MODELS.openai).toContain('gpt-4o');
    });

    it('should have models for Gemini', () => {
      expect(AVAILABLE_MODELS.gemini).toBeDefined();
      expect(AVAILABLE_MODELS.gemini.length).toBeGreaterThan(0);
      expect(AVAILABLE_MODELS.gemini).toContain('gemini-1.5-pro');
    });

    it('should have models for Claude Code', () => {
      expect(AVAILABLE_MODELS['claude-code']).toBeDefined();
      expect(AVAILABLE_MODELS['claude-code'].length).toBeGreaterThan(0);
    });

    it('should have empty array for LMStudio (dynamic models)', () => {
      expect(AVAILABLE_MODELS.lmstudio).toBeDefined();
      expect(AVAILABLE_MODELS.lmstudio).toEqual([]);
    });
  });

  describe('DEFAULT_MODEL_PARAMS', () => {
    it('should have valid default temperature', () => {
      expect(DEFAULT_MODEL_PARAMS.temperature).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_MODEL_PARAMS.temperature).toBeLessThanOrEqual(2);
    });

    it('should have valid default maxTokens', () => {
      expect(DEFAULT_MODEL_PARAMS.maxTokens).toBeGreaterThan(0);
    });

    it('should have valid default topP', () => {
      expect(DEFAULT_MODEL_PARAMS.topP).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_MODEL_PARAMS.topP).toBeLessThanOrEqual(1);
    });
  });

  describe('isValidProvider', () => {
    it('should return true for valid providers', () => {
      expect(isValidProvider('openai')).toBe(true);
      expect(isValidProvider('gemini')).toBe(true);
      expect(isValidProvider('claude-code')).toBe(true);
      expect(isValidProvider('lmstudio')).toBe(true);
    });

    it('should return false for invalid providers', () => {
      expect(isValidProvider('invalid')).toBe(false);
      expect(isValidProvider('')).toBe(false);
      expect(isValidProvider('gpt-4')).toBe(false);
    });
  });

  describe('isValidConnectionStatus', () => {
    it('should return true for valid statuses', () => {
      expect(isValidConnectionStatus('connected')).toBe(true);
      expect(isValidConnectionStatus('disconnected')).toBe(true);
      expect(isValidConnectionStatus('error')).toBe(true);
      expect(isValidConnectionStatus('untested')).toBe(true);
    });

    it('should return false for invalid statuses', () => {
      expect(isValidConnectionStatus('invalid')).toBe(false);
      expect(isValidConnectionStatus('')).toBe(false);
    });
  });

  describe('createDefaultModelConfig', () => {
    it('should create config with default parameters', () => {
      const config = createDefaultModelConfig('openai', 'gpt-4o');

      expect(config.provider).toBe('openai');
      expect(config.modelId).toBe('gpt-4o');
      expect(config.temperature).toBe(DEFAULT_MODEL_PARAMS.temperature);
      expect(config.maxTokens).toBe(DEFAULT_MODEL_PARAMS.maxTokens);
      expect(config.topP).toBe(DEFAULT_MODEL_PARAMS.topP);
    });

    it('should allow custom parameters', () => {
      const config = createDefaultModelConfig('gemini', 'gemini-1.5-pro', {
        temperature: 0.9,
        maxTokens: 8192,
      });

      expect(config.temperature).toBe(0.9);
      expect(config.maxTokens).toBe(8192);
      expect(config.topP).toBe(DEFAULT_MODEL_PARAMS.topP);
    });
  });

  describe('createDefaultProviderSettings', () => {
    it('should create settings for OpenAI', () => {
      const settings = createDefaultProviderSettings('openai');

      expect(settings.provider).toBe('openai');
      expect(settings.apiKey).toBe('');
      expect(settings.endpoint).toBeUndefined();
      expect(settings.isEnabled).toBe(false);
      expect(settings.connectionStatus).toBe('untested');
    });

    it('should create settings for LMStudio with default endpoint', () => {
      const settings = createDefaultProviderSettings('lmstudio');

      expect(settings.provider).toBe('lmstudio');
      expect(settings.endpoint).toBe('http://localhost:1234/v1');
      expect(settings.apiKey).toBe('');
    });

    it('should create settings for Claude Code as enabled by default', () => {
      const settings = createDefaultProviderSettings('claude-code');

      expect(settings.provider).toBe('claude-code');
      expect(settings.isEnabled).toBe(true);
      expect(settings.connectionStatus).toBe('connected');
    });
  });

  describe('createDefaultTaskStageConfig', () => {
    it('should create config with Claude Code as default', () => {
      const config = createDefaultTaskStageConfig();

      expect(config.defaultModel.provider).toBe('claude-code');
      expect(config.designDoc).toBeNull();
      expect(config.prd).toBeNull();
      expect(config.prototype).toBeNull();
    });
  });

  describe('createDefaultProjectLLMSettings', () => {
    it('should create settings with projectId', () => {
      const settings = createDefaultProjectLLMSettings('project-123');

      expect(settings.projectId).toBe('project-123');
      expect(settings.providers).toHaveLength(4);
      expect(settings.taskStageConfig).toBeDefined();
      expect(settings.updatedAt).toBeDefined();
    });

    it('should have all providers initialized', () => {
      const settings = createDefaultProjectLLMSettings('project-123');

      const providerIds = settings.providers.map(p => p.provider);
      expect(providerIds).toContain('openai');
      expect(providerIds).toContain('gemini');
      expect(providerIds).toContain('claude-code');
      expect(providerIds).toContain('lmstudio');
    });

    it('should have only Claude Code enabled by default', () => {
      const settings = createDefaultProjectLLMSettings('project-123');

      const enabledProviders = settings.providers.filter(p => p.isEnabled);
      expect(enabledProviders).toHaveLength(1);
      expect(enabledProviders[0].provider).toBe('claude-code');
    });
  });

  describe('getProviderDisplayName', () => {
    it('should return correct display names', () => {
      expect(getProviderDisplayName('openai')).toBe('OpenAI');
      expect(getProviderDisplayName('gemini')).toBe('Google Gemini');
      expect(getProviderDisplayName('claude-code')).toBe('Claude Code');
      expect(getProviderDisplayName('lmstudio')).toBe('LMStudio');
    });
  });

  describe('getProviderIcon', () => {
    it('should return icon strings for all providers', () => {
      expect(getProviderIcon('openai')).toBeDefined();
      expect(getProviderIcon('gemini')).toBeDefined();
      expect(getProviderIcon('claude-code')).toBeDefined();
      expect(getProviderIcon('lmstudio')).toBeDefined();
    });
  });

  describe('Type Interfaces', () => {
    it('should create valid LLMModelConfig', () => {
      const config: LLMModelConfig = {
        provider: 'openai',
        modelId: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      };

      expect(config.provider).toBe('openai');
      expect(config.modelId).toBe('gpt-4o');
    });

    it('should create valid LLMProviderSettings', () => {
      const settings: LLMProviderSettings = {
        provider: 'openai',
        apiKey: 'sk-test',
        isEnabled: true,
        connectionStatus: 'connected',
      };

      expect(settings.provider).toBe('openai');
      expect(settings.apiKey).toBe('sk-test');
    });

    it('should create valid TaskStageConfig', () => {
      const config: TaskStageConfig = {
        designDoc: null,
        prd: null,
        prototype: null,
        defaultModel: {
          provider: 'claude-code',
          modelId: 'claude-3.5-sonnet',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1.0,
        },
      };

      expect(config.defaultModel.provider).toBe('claude-code');
    });

    it('should create valid ProjectLLMSettings', () => {
      const settings: ProjectLLMSettings = {
        projectId: 'test-project',
        providers: [],
        taskStageConfig: {
          designDoc: null,
          prd: null,
          prototype: null,
          defaultModel: {
            provider: 'claude-code',
            modelId: 'claude-3.5-sonnet',
            temperature: 0.7,
            maxTokens: 4096,
            topP: 1.0,
          },
        },
        updatedAt: new Date().toISOString(),
      };

      expect(settings.projectId).toBe('test-project');
    });
  });
});
