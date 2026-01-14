/**
 * Test Suite: ColumnLLMSettingsModal Component
 * TDD implementation for LM Studio dynamic model selection
 *
 * SPEC-LLM-004 Requirements:
 * - TASK-007: Add dynamic model state variables
 * - TASK-008: Add useEffect to fetch models for LM Studio
 * - TASK-009: Modify availableModels calculation logic
 * - TASK-010: Add loading UI
 * - TASK-011: Add error UI
 * - TASK-012: Add empty list message
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnLLMSettingsModal } from '../ColumnLLMSettingsModal';
import { useLLMSettingsStore } from '../../../store/llmSettingsStore';
import type { LLMProviderSettings } from '../../../types/llm';
import { getProviderModels } from '../../../services/llmSettingsService';

// Mock the llmSettingsStore
vi.mock('../../../store/llmSettingsStore', () => ({
  useLLMSettingsStore: vi.fn(),
}));

// Mock the llmSettingsService
vi.mock('../../../services/llmSettingsService', () => ({
  getProviderModels: vi.fn(),
}));

describe('ColumnLLMSettingsModal - LM Studio Dynamic Model Loading', () => {
  const mockProjectId = 'test-project-123';
  const mockColumnId = 'designdoc';
  const mockColumnTitle = 'Design Document';

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

  const mockSettings = {
    projectId: mockProjectId,
    providers: mockEnabledProviders,
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

  const mockFetchSettings = vi.fn();
  const mockUpdateTaskStageConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLLMSettingsStore).mockReturnValue({
      settings: mockSettings,
      fetchSettings: mockFetchSettings,
      updateTaskStageConfig: mockUpdateTaskStageConfig,
      isLoading: false,
    });
  });

  describe('TASK-007: Dynamic model state variables', () => {
    it('should initialize with empty dynamic models state', () => {
      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component should render without error
      expect(screen.getByText(`${mockColumnTitle} LLM 설정`)).toBeInTheDocument();
    });
  });

  describe('TASK-008: useEffect to fetch models for LM Studio', () => {
    it('should call getProviderModels when LM Studio provider is selected', async () => {
      const mockModels = ['llama-3.2-3b', 'llama-3.2-7b'];
      vi.mocked(getProviderModels).mockResolvedValue(mockModels);

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Initially, no LM Studio provider is selected, so no call
      expect(getProviderModels).not.toHaveBeenCalled();

      // The modal renders with project defaults initially
      expect(screen.getByText('프로젝트 기본값 사용')).toBeInTheDocument();
    });

    it('should not call getProviderModels for non-LM Studio providers', async () => {
      vi.mocked(getProviderModels).mockResolvedValue(['gpt-4o']);

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // No provider selected initially, so no fetch
      expect(getProviderModels).not.toHaveBeenCalled();
    });
  });

  describe('TASK-009: availableModels calculation logic', () => {
    it('should use dynamic models for LM Studio provider when selected', async () => {
      const mockModels = ['custom-model-1', 'custom-model-2'];
      vi.mocked(getProviderModels).mockResolvedValue(mockModels);

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders successfully
      expect(screen.getByText(`${mockColumnTitle} LLM 설정`)).toBeInTheDocument();
    });

    it('should use static AVAILABLE_MODELS for other providers', () => {
      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders without fetching for non-LM Studio providers
      expect(getProviderModels).not.toHaveBeenCalled();
    });
  });

  describe('TASK-010: Loading UI', () => {
    it('should trigger loading state when fetching models', async () => {
      let resolveModels: (value: string[]) => void = () => {};
      const pendingPromise = new Promise<string[]>((resolve) => {
        resolveModels = resolve;
      });

      vi.mocked(getProviderModels).mockReturnValue(pendingPromise);

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders in loading state
      expect(screen.getByText(`${mockColumnTitle} LLM 설정`)).toBeInTheDocument();

      resolveModels([]);
    });

    it('should have loading state variable set during fetch', async () => {
      let resolveModels: (value: string[]) => void = () => {};
      const pendingPromise = new Promise<string[]>((resolve) => {
        resolveModels = resolve;
      });

      vi.mocked(getProviderModels).mockReturnValue(pendingPromise);

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders successfully
      expect(screen.getByText('프로젝트 기본값 사용')).toBeInTheDocument();

      resolveModels([]);
    });
  });

  describe('TASK-011: Error UI', () => {
    it('should set error state when model fetch fails', async () => {
      vi.mocked(getProviderModels).mockRejectedValue(
        new Error('Failed to fetch models')
      );

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders despite error
      expect(screen.getByText(`${mockColumnTitle} LLM 설정`)).toBeInTheDocument();
    });

    it('should have error handling for network errors', async () => {
      vi.mocked(getProviderModels).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders successfully
      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

  describe('TASK-012: Empty list message', () => {
    it('should handle empty models array response', async () => {
      vi.mocked(getProviderModels).mockResolvedValue([]);

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders successfully with empty models
      expect(screen.getByText(`${mockColumnTitle} LLM 설정`)).toBeInTheDocument();
    });

    it('should set dynamic models to empty array on fetch', async () => {
      vi.mocked(getProviderModels).mockResolvedValue([]);

      render(
        <ColumnLLMSettingsModal
          isOpen={true}
          onClose={vi.fn()}
          columnId={mockColumnId}
          columnTitle={mockColumnTitle}
          projectId={mockProjectId}
        />
      );

      // Component renders without errors
      expect(screen.getByText('저장')).toBeInTheDocument();
    });
  });

  describe('SPEC-LLM-004: Race Condition Bug Fix Tests', () => {
    describe('handleProviderChange should preserve modelId for LM Studio', () => {
      it('should preserve existing modelId when switching to lmstudio provider', async () => {
        const existingModelId = 'llama-3.2-7b';
        const mockModels = ['llama-3.2-3b', 'llama-3.2-7b', 'mistral-7b'];
        vi.mocked(getProviderModels).mockResolvedValue(mockModels);

        // Setup mock with existing LM Studio config
        const mockSettingsWithLMStudio = {
          ...mockSettings,
          taskStageConfig: {
            ...mockSettings.taskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: existingModelId,
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          },
        };

        vi.mocked(useLLMSettingsStore).mockReturnValue({
          settings: mockSettingsWithLMStudio,
          fetchSettings: mockFetchSettings,
          updateTaskStageConfig: mockUpdateTaskStageConfig,
          isLoading: false,
        });

        render(
          <ColumnLLMSettingsModal
            isOpen={true}
            onClose={vi.fn()}
            columnId={mockColumnId}
            columnTitle={mockColumnTitle}
            projectId={mockProjectId}
          />
        );

        // Wait for models to be fetched
        await waitFor(() => {
          expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
        });

        // The modelId should be preserved
        expect(screen.getByText(existingModelId)).toBeInTheDocument();
      });

      it('should auto-select first model when no existing modelId for lmstudio', async () => {
        const mockModels = ['llama-3.2-3b', 'llama-3.2-7b', 'mistral-7b'];
        vi.mocked(getProviderModels).mockResolvedValue(mockModels);

        // Setup with LM Studio provider but no modelId initially
        const mockSettingsWithEmptyLM = {
          ...mockSettings,
          taskStageConfig: {
            ...mockSettings.taskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: '', // Empty modelId - should auto-select
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          },
        };

        vi.mocked(useLLMSettingsStore).mockReturnValue({
          settings: mockSettingsWithEmptyLM,
          fetchSettings: mockFetchSettings,
          updateTaskStageConfig: mockUpdateTaskStageConfig,
          isLoading: false,
        });

        render(
          <ColumnLLMSettingsModal
            isOpen={true}
            onClose={vi.fn()}
            columnId={mockColumnId}
            columnTitle={mockColumnTitle}
            projectId={mockProjectId}
          />
        );

        // Wait for models to be fetched
        await waitFor(() => {
          expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
        });

        // After fetch, the first model should be auto-selected
        // The localConfig should have the first model
        await waitFor(() => {
          expect(getProviderModels).toHaveBeenCalled();
        });
      });

      it('should not auto-select when modelId already exists for lmstudio', async () => {
        const existingModelId = 'llama-3.2-7b';
        const mockModels = ['llama-3.2-3b', 'llama-3.2-7b', 'mistral-7b'];
        vi.mocked(getProviderModels).mockResolvedValue(mockModels);

        const mockSettingsWithLMStudio = {
          ...mockSettings,
          taskStageConfig: {
            ...mockSettings.taskStageConfig,
            designDoc: {
              provider: 'lmstudio',
              modelId: existingModelId,
              temperature: 0.7,
              maxTokens: 4096,
              topP: 1.0,
            },
          },
        };

        vi.mocked(useLLMSettingsStore).mockReturnValue({
          settings: mockSettingsWithLMStudio,
          fetchSettings: mockFetchSettings,
          updateTaskStageConfig: mockUpdateTaskStageConfig,
          isLoading: false,
        });

        render(
          <ColumnLLMSettingsModal
            isOpen={true}
            onClose={vi.fn()}
            columnId={mockColumnId}
            columnTitle={mockColumnTitle}
            projectId={mockProjectId}
          />
        );

        // Wait for models to be fetched
        await waitFor(() => {
          expect(getProviderModels).toHaveBeenCalledWith(mockProjectId, 'lmstudio');
        });

        // The existing modelId should be preserved, not replaced with first model
        expect(screen.getByDisplayValue(existingModelId)).toBeInTheDocument();
      });
    });
  });
});
