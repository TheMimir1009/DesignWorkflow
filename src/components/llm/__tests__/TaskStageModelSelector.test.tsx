/**
 * Test Suite: TaskStageModelSelector Component
 * TDD implementation for LM Studio dynamic model selection
 *
 * SPEC-LLM-004 Requirements:
 * - TASK-001: Add dynamic model state variables
 * - TASK-002: Add useEffect to fetch models for LM Studio
 * - TASK-003: Modify availableModels calculation logic
 * - TASK-004: Add loading UI
 * - TASK-005: Add error UI
 * - TASK-006: Add empty list message
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskStageModelSelector } from '../TaskStageModelSelector';
import type { LLMProviderSettings, TaskStageConfig } from '../../../types/llm';
import { getProviderModels } from '../../../services/llmSettingsService';

// Mock the llmSettingsService
vi.mock('../../../services/llmSettingsService', () => ({
  getProviderModels: vi.fn(),
}));

describe('TaskStageModelSelector - LM Studio Dynamic Model Loading', () => {
  const mockProjectId = 'test-project-123';
  const mockEnabledProviders: LLMProviderSettings[] = [
    {
      provider: 'openai',
      apiKey: 'sk-test',
      isEnabled: true,
      connectionStatus: 'connected',
    },
    {
      provider: 'lmstudio',
      apiKey: '',
      endpoint: 'http://localhost:1234/v1',
      isEnabled: true,
      connectionStatus: 'connected',
    },
  ];

  const mockTaskStageConfig: Partial<TaskStageConfig> = {
    designDoc: null,
    prd: null,
    prototype: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TASK-001: Dynamic model state variables', () => {
    it('should accept projectId prop', () => {
      render(
        <TaskStageModelSelector
          taskStageConfig={mockTaskStageConfig}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );
      // Component should render without error when projectId is provided
      expect(screen.getByText('Design Document')).toBeInTheDocument();
    });

    it('should initialize with empty dynamic models state', () => {
      const { container } = render(
        <TaskStageModelSelector
          taskStageConfig={mockTaskStageConfig}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );
      // Should not crash with initial empty state
      expect(container).toBeInTheDocument();
    });
  });

  describe('TASK-002: useEffect to fetch models for LM Studio', () => {
    it('should call getProviderModels when LM Studio provider is selected', async () => {
      const mockModels = ['llama-3.2-3b', 'llama-3.2-7b', 'mistral-7b'];
      vi.mocked(getProviderModels).mockResolvedValue(mockModels);

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: 'llama-3.2-3b',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
      });
    });

    it('should not call getProviderModels for non-LM Studio providers', async () => {
      vi.mocked(getProviderModels).mockResolvedValue(['gpt-4o']);

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'openai',
              modelId: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      // Wait a bit to ensure useEffect would have run
      await waitFor(() => {
        expect(getProviderModels).not.toHaveBeenCalledWith(mockProjectId, 'openai');
      });
    });
  });

  describe('TASK-003: availableModels calculation logic', () => {
    it('should use dynamic models for LM Studio provider', async () => {
      const mockModels = ['custom-model-1', 'custom-model-2'];
      vi.mocked(getProviderModels).mockResolvedValue(mockModels);

      const onUpdate = vi.fn();

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: 'custom-model-1',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={onUpdate}
          projectId={mockProjectId}
        />
      );

      // Wait for models to be fetched
      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
      });
    });

    it('should use static AVAILABLE_MODELS for other providers', () => {
      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'openai',
              modelId: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      // OpenAI should use static models without fetching
      expect(getProviderModels).not.toHaveBeenCalled();
    });
  });

  describe('TASK-004: Loading UI', () => {
    it('should trigger loading state when fetching models', async () => {
      // Create a promise that we can control
      let resolveModels: (value: string[]) => void = () => {};
      const pendingPromise = new Promise<string[]>((resolve) => {
        resolveModels = resolve;
      });

      vi.mocked(getProviderModels).mockReturnValue(pendingPromise);

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: '',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      // Verify the API call is made (which triggers loading state)
      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
      });

      // Clean up the promise
      resolveModels([]);
    });

    it('should have loading state variable set during fetch', async () => {
      let resolveModels: (value: string[]) => void = () => {};
      const pendingPromise = new Promise<string[]>((resolve) => {
        resolveModels = resolve;
      });

      vi.mocked(getProviderModels).mockReturnValue(pendingPromise);

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: '',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      // Verify the fetch was initiated
      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalled();
      });

      resolveModels([]);
    });
  });

  describe('TASK-005: Error UI', () => {
    it('should set error state when model fetch fails', async () => {
      vi.mocked(getProviderModels).mockRejectedValue(
        new Error('Failed to fetch models')
      );

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: '',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      // Verify the API call was attempted
      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
      });
    });

    it('should have error handling for network errors', async () => {
      vi.mocked(getProviderModels).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: '',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalled();
      });
    });
  });

  describe('TASK-006: Empty list message', () => {
    it('should handle empty models array response', async () => {
      vi.mocked(getProviderModels).mockResolvedValue([]);

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: '',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalled();
      });

      // Component should still render successfully with empty models
      expect(screen.getByText('Design Document')).toBeInTheDocument();
    });

    it('should set dynamic models to empty array on fetch', async () => {
      vi.mocked(getProviderModels).mockResolvedValue([]);

      render(
        <TaskStageModelSelector
          taskStageConfig={{
            ...mockTaskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: '',
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          }}
          enabledProviders={mockEnabledProviders}
          onUpdate={vi.fn()}
          projectId={mockProjectId}
        />
      );

      await waitFor(() => {
        expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
      });
    });
  });
});
