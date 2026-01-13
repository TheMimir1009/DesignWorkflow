/**
 * LLM Settings Store Tests
 * TDD test suite for LLM settings Zustand store
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useLLMSettingsStore } from '../../src/store/llmSettingsStore';
import * as llmSettingsService from '../../src/services/llmSettingsService';
import { createDefaultProjectLLMSettings } from '../../src/types/llm';

const TEST_PROJECT_ID = 'test-project-store';

// Mock the service
vi.mock('../../src/services/llmSettingsService');

describe('LLM Settings Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLLMSettingsStore.setState({
      settings: null,
      isLoading: false,
      error: null,
      testingProvider: null,
      connectionTestResults: new Map(),
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useLLMSettingsStore.getState();

      expect(state.settings).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.testingProvider).toBeNull();
      expect(state.connectionTestResults.size).toBe(0);
    });
  });

  describe('fetchSettings', () => {
    it('should fetch and store settings', async () => {
      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      vi.mocked(llmSettingsService.getLLMSettings).mockResolvedValueOnce(mockSettings);

      await act(async () => {
        await useLLMSettingsStore.getState().fetchSettings(TEST_PROJECT_ID);
      });

      const state = useLLMSettingsStore.getState();
      expect(state.settings).toEqual(mockSettings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state during fetch', async () => {
      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      let resolvePromise: (value: typeof mockSettings) => void;
      const promise = new Promise<typeof mockSettings>(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(llmSettingsService.getLLMSettings).mockReturnValueOnce(promise);

      // Start fetch but don't await
      const fetchPromise = useLLMSettingsStore.getState().fetchSettings(TEST_PROJECT_ID);

      // Check loading state
      expect(useLLMSettingsStore.getState().isLoading).toBe(true);

      // Resolve and complete
      await act(async () => {
        resolvePromise!(mockSettings);
        await fetchPromise;
      });

      expect(useLLMSettingsStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      vi.mocked(llmSettingsService.getLLMSettings).mockRejectedValueOnce(
        new Error('Network error')
      );

      await act(async () => {
        await useLLMSettingsStore.getState().fetchSettings(TEST_PROJECT_ID);
      });

      const state = useLLMSettingsStore.getState();
      expect(state.settings).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('updateProvider', () => {
    it('should update provider settings', async () => {
      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      mockSettings.providers[0].isEnabled = true;

      vi.mocked(llmSettingsService.updateProviderSettings).mockResolvedValueOnce(
        mockSettings.providers[0]
      );
      vi.mocked(llmSettingsService.getLLMSettings).mockResolvedValueOnce(mockSettings);

      await act(async () => {
        await useLLMSettingsStore.getState().updateProvider(TEST_PROJECT_ID, 'openai', {
          apiKey: 'sk-new-key',
          isEnabled: true,
        });
      });

      const state = useLLMSettingsStore.getState();
      expect(state.settings).toEqual(mockSettings);
      expect(state.isLoading).toBe(false);
    });

    it('should handle update error', async () => {
      vi.mocked(llmSettingsService.updateProviderSettings).mockRejectedValueOnce(
        new Error('Update failed')
      );

      await act(async () => {
        await useLLMSettingsStore.getState().updateProvider(TEST_PROJECT_ID, 'openai', {
          apiKey: 'sk-new-key',
        });
      });

      const state = useLLMSettingsStore.getState();
      expect(state.error).toBe('Update failed');
    });
  });

  describe('testConnection', () => {
    it('should test connection and store result', async () => {
      const mockResult = {
        success: true,
        latency: 150,
        models: ['gpt-4o'],
      };

      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      mockSettings.providers[0].connectionStatus = 'connected';

      vi.mocked(llmSettingsService.testProviderConnection).mockResolvedValueOnce(mockResult);
      vi.mocked(llmSettingsService.getLLMSettings).mockResolvedValueOnce(mockSettings);

      let result;
      await act(async () => {
        result = await useLLMSettingsStore.getState().testConnection(TEST_PROJECT_ID, 'openai');
      });

      expect(result).toEqual(mockResult);

      const state = useLLMSettingsStore.getState();
      expect(state.testingProvider).toBeNull();
      expect(state.connectionTestResults.get('openai')).toEqual(mockResult);
    });

    it('should set testing provider during test', async () => {
      let resolvePromise: (value: { success: boolean }) => void;
      const promise = new Promise<{ success: boolean }>(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(llmSettingsService.testProviderConnection).mockReturnValueOnce(promise);
      vi.mocked(llmSettingsService.getLLMSettings).mockResolvedValueOnce(
        createDefaultProjectLLMSettings(TEST_PROJECT_ID)
      );

      // Start test but don't await
      const testPromise = useLLMSettingsStore.getState().testConnection(TEST_PROJECT_ID, 'openai');

      // Check testing state
      expect(useLLMSettingsStore.getState().testingProvider).toBe('openai');

      // Resolve and complete
      await act(async () => {
        resolvePromise!({ success: true });
        await testPromise;
      });

      expect(useLLMSettingsStore.getState().testingProvider).toBeNull();
    });

    it('should handle connection test error', async () => {
      vi.mocked(llmSettingsService.testProviderConnection).mockRejectedValueOnce(
        new Error('Connection failed')
      );

      let result;
      await act(async () => {
        result = await useLLMSettingsStore.getState().testConnection(TEST_PROJECT_ID, 'openai');
      });

      expect(result).toEqual({
        success: false,
        status: 'error',
        error: 'Connection failed',
        timestamp: expect.any(String),
      });

      const state = useLLMSettingsStore.getState();
      expect(state.connectionTestResults.get('openai')).toEqual({
        success: false,
        status: 'error',
        error: 'Connection failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('updateTaskStageConfig', () => {
    it('should update task stage configuration', async () => {
      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      mockSettings.taskStageConfig.designDoc = {
        provider: 'openai',
        modelId: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      };

      vi.mocked(llmSettingsService.updateTaskStageConfig).mockResolvedValueOnce(
        mockSettings.taskStageConfig
      );
      vi.mocked(llmSettingsService.getLLMSettings).mockResolvedValueOnce(mockSettings);

      await act(async () => {
        await useLLMSettingsStore.getState().updateTaskStageConfig(TEST_PROJECT_ID, {
          designDoc: {
            provider: 'openai',
            modelId: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 4096,
            topP: 1.0,
          },
        });
      });

      const state = useLLMSettingsStore.getState();
      expect(state.settings?.taskStageConfig.designDoc?.provider).toBe('openai');
    });
  });

  describe('Helper methods', () => {
    beforeEach(() => {
      const mockSettings = createDefaultProjectLLMSettings(TEST_PROJECT_ID);
      mockSettings.providers[0].isEnabled = true; // Enable OpenAI
      mockSettings.taskStageConfig.designDoc = {
        provider: 'openai',
        modelId: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      };

      useLLMSettingsStore.setState({ settings: mockSettings });
    });

    it('should get provider settings', () => {
      const provider = useLLMSettingsStore.getState().getProviderSettings('openai');

      expect(provider).toBeDefined();
      expect(provider?.provider).toBe('openai');
    });

    it('should return undefined for unknown provider', () => {
      const provider = useLLMSettingsStore.getState().getProviderSettings(
        'unknown' as 'claude-code' | 'ollama' | 'lm-studio'
      );

      expect(provider).toBeUndefined();
    });

    it('should get enabled providers', () => {
      const enabled = useLLMSettingsStore.getState().getEnabledProviders();

      // OpenAI (manually enabled) + Claude Code (default enabled) + LMStudio (default enabled)
      expect(enabled).toHaveLength(3);
      expect(enabled.some(p => p.provider === 'openai')).toBe(true);
      expect(enabled.some(p => p.provider === 'claude-code')).toBe(true);
      expect(enabled.some(p => p.provider === 'lmstudio')).toBe(true);
    });

    it('should get stage config', () => {
      const config = useLLMSettingsStore.getState().getStageConfig('designDoc');

      expect(config).toBeDefined();
      expect(config?.provider).toBe('openai');
      expect(config?.modelId).toBe('gpt-4o');
    });

    it('should return null for unset stage config', () => {
      const config = useLLMSettingsStore.getState().getStageConfig('prd');

      expect(config).toBeNull();
    });
  });

  describe('clearSettings', () => {
    it('should clear all settings and state', () => {
      // Set some state first
      useLLMSettingsStore.setState({
        settings: createDefaultProjectLLMSettings(TEST_PROJECT_ID),
        isLoading: true,
        error: 'Some error',
        testingProvider: 'openai',
        connectionTestResults: new Map([['openai', { success: true }]]),
      });

      useLLMSettingsStore.getState().clearSettings();

      const state = useLLMSettingsStore.getState();
      expect(state.settings).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.testingProvider).toBeNull();
      expect(state.connectionTestResults.size).toBe(0);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useLLMSettingsStore.setState({ error: 'Some error' });

      useLLMSettingsStore.getState().clearError();

      expect(useLLMSettingsStore.getState().error).toBeNull();
    });
  });
});
