/**
 * LLM Settings Store Tests
 * Test coverage for duplicate request prevention and testing state handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLLMSettingsStore } from './llmSettingsStore';
import type { LLMProvider, ConnectionTestResult } from '../types/llm';

// Mock the service module
vi.mock('../services/llmSettingsService', () => ({
  getLLMSettings: vi.fn(),
  updateProviderSettings: vi.fn(),
  testProviderConnection: vi.fn(),
  updateTaskStageConfig: vi.fn(),
}));

const mockService = await import('../services/llmSettingsService');

describe('LLM Settings Store - Duplicate Request Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { resetStore } = useLLMSettingsStore.getState();
    resetStore?.();
  });

  afterEach(() => {
    const { clearSettings } = useLLMSettingsStore.getState();
    clearSettings();
  });

  it('should prevent duplicate connection test requests for same provider', async () => {
    const projectId = 'test-project';
    const provider: LLMProvider = 'openai';
    const mockResult: ConnectionTestResult = {
      success: true,
      status: 'connected',
      latency: 100,
      timestamp: new Date().toISOString(),
    };

    vi.mocked(mockService.testProviderConnection).mockResolvedValue(mockResult);
    vi.mocked(mockService.getLLMSettings).mockResolvedValue({
      projectId,
      providers: [
        {
          provider,
          apiKey: 'test-key',
          isEnabled: true,
          connectionStatus: 'testing',
        },
      ],
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
    });

    const { result } = renderHook(() => useLLMSettingsStore());

    // Start first test
    act(() => {
      result.current.testConnection(projectId, provider);
    });

    // Try to start second test immediately (should be prevented)
    act(() => {
      result.current.testConnection(projectId, provider);
    });

    // Should only call service once
    await waitFor(() => {
      expect(mockService.testProviderConnection).toHaveBeenCalledTimes(1);
    });
  });

  it('should allow testing different providers simultaneously', async () => {
    const projectId = 'test-project';
    const provider1: LLMProvider = 'openai';
    const provider2: LLMProvider = 'gemini';
    const mockResult: ConnectionTestResult = {
      success: true,
      status: 'connected',
      latency: 100,
      timestamp: new Date().toISOString(),
    };

    vi.mocked(mockService.testProviderConnection).mockResolvedValue(mockResult);
    vi.mocked(mockService.getLLMSettings).mockResolvedValue({
      projectId,
      providers: [
        {
          provider: provider1,
          apiKey: 'test-key',
          isEnabled: true,
          connectionStatus: 'connected',
        },
        {
          provider: provider2,
          apiKey: 'test-key',
          isEnabled: true,
          connectionStatus: 'connected',
        },
      ],
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
    });

    const { result } = renderHook(() => useLLMSettingsStore());

    // Test both providers
    act(() => {
      result.current.testConnection(projectId, provider1);
      result.current.testConnection(projectId, provider2);
    });

    // Should call service twice (once per provider)
    await waitFor(() => {
      expect(mockService.testProviderConnection).toHaveBeenCalledTimes(2);
    });
  });
});

describe('LLM Settings Store - Testing State Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { clearSettings } = useLLMSettingsStore.getState();
    clearSettings();
  });

  afterEach(() => {
    const { clearSettings } = useLLMSettingsStore.getState();
    clearSettings();
  });

  it('should set testingProvider when test starts', async () => {
    const projectId = 'test-project';
    const provider: LLMProvider = 'openai';
    const mockResult: ConnectionTestResult = {
      success: true,
      status: 'connected',
      latency: 100,
      timestamp: new Date().toISOString(),
    };

    // Make test take some time
    vi.mocked(mockService.testProviderConnection).mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve(mockResult), 100);
        })
    );

    const { result } = renderHook(() => useLLMSettingsStore());

    act(() => {
      result.current.testConnection(projectId, provider);
    });

    // Check that testingProvider is set
    await waitFor(() => {
      expect(result.current.testingProvider).toBe(provider);
    });
  });

  it('should clear testingProvider when test completes', async () => {
    const projectId = 'test-project';
    const provider: LLMProvider = 'openai';
    const mockResult: ConnectionTestResult = {
      success: true,
      status: 'connected',
      latency: 100,
      timestamp: new Date().toISOString(),
    };

    vi.mocked(mockService.testProviderConnection).mockResolvedValue(mockResult);
    vi.mocked(mockService.getLLMSettings).mockResolvedValue({
      projectId,
      providers: [
        {
          provider,
          apiKey: 'test-key',
          isEnabled: true,
          connectionStatus: 'connected',
        },
      ],
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
    });

    const { result } = renderHook(() => useLLMSettingsStore());

    act(() => {
      result.current.testConnection(projectId, provider);
    });

    // Wait for test to complete
    await waitFor(() => {
      expect(result.current.testingProvider).toBeNull();
    });
  });
});
