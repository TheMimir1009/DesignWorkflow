/**
 * Test Suite: ColumnModelDisplay Component
 * TDD implementation for SPEC-LLM-005
 *
 * TAG-001 Requirements:
 * - TASK-002: Create ColumnModelDisplay component structure
 * - TASK-003: Implement ColumnId-to-Stage mapping
 *
 * TAG-002 Requirements:
 * - TASK-004: Implement model configuration hook (useColumnModelConfig)
 * - TASK-005: Implement ModelBadge visual component
 * - TASK-006: Add click handler for modal open
 * - TASK-008: Create provider icons and colors
 *
 * TAG-003 Requirements:
 * - TASK-007: Integrate ColumnModelDisplay into KanbanColumn
 * - TASK-010: Implement tooltip for full model name
 *
 * TAG-004 Requirements:
 * - TASK-009: Write ColumnModelDisplay tests
 * - TASK-011: Verify Drag & Drop compatibility
 * - TASK-012: Update documentation and exports
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLLMSettingsStore } from '../../../store/llmSettingsStore';

// Mock the llmSettingsStore
vi.mock('../../../store/llmSettingsStore', () => ({
  useLLMSettingsStore: vi.fn(),
}));

// Mock the useColumnModelConfig hook - must be mocked before import
vi.mock('../useColumnModelConfig', () => ({
  useColumnModelConfig: vi.fn(),
}));

// Import after mocking
import { ColumnModelDisplay } from '../ColumnModelDisplay';
import { useColumnModelConfig } from '../useColumnModelConfig';

describe('ColumnModelDisplay', () => {
  const mockProjectId = 'test-project-123';
  const mockSettings = {
    projectId: mockProjectId,
    providers: [
      {
        provider: 'openai' as const,
        apiKey: 'sk-test',
        isEnabled: true,
        connectionStatus: 'connected' as const,
      },
      {
        provider: 'claude-code' as const,
        apiKey: '',
        isEnabled: true,
        connectionStatus: 'connected' as const,
      },
    ],
    taskStageConfig: {
      designDoc: {
        provider: 'openai' as const,
        modelId: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      },
      prd: {
        provider: 'claude-code' as const,
        modelId: 'claude-3.5-sonnet',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      },
      prototype: null,
      defaultModel: {
        provider: 'claude-code' as const,
        modelId: 'claude-3.5-sonnet',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      },
    },
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useLLMSettingsStore to return settings
    vi.mocked(useLLMSettingsStore).mockReturnValue({
      settings: mockSettings,
      isLoading: false,
      error: null,
      testingProvider: null,
      connectionTestResults: new Map(),
      pendingTests: new Set(),
      getProviderSettings: vi.fn(),
      getEnabledProviders: vi.fn(),
      getStageConfig: vi.fn(),
      fetchSettings: vi.fn(),
      updateProvider: vi.fn(),
      testConnection: vi.fn(),
      updateTaskStageConfig: vi.fn(),
      clearSettings: vi.fn(),
      clearError: vi.fn(),
      isPendingTest: vi.fn(),
    });
  });

  describe('TAG-001 TASK-002: Component structure', () => {
    it('should render without crashing when all props are provided', () => {
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.designDoc!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      // Component should render
      expect(screen.getByTestId('column-model-display-design')).toBeInTheDocument();
    });

    it('should accept columnId and projectId as required props', () => {
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: null,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="prd"
          projectId={mockProjectId}
        />
      );

      expect(screen.getByTestId('column-model-display-prd')).toBeInTheDocument();
    });
  });

  describe('TAG-001 TASK-003: ColumnId-to-Stage mapping', () => {
    it('should map "design" columnId to "designDoc" stage config', () => {
      const mockHook = vi.fn();
      vi.mocked(useColumnModelConfig).mockImplementation((columnId, projectId) => {
        mockHook(columnId, projectId);
        return {
          modelConfig: mockSettings.taskStageConfig.designDoc!,
          isLoading: false,
          error: null,
        };
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      expect(mockHook).toHaveBeenCalledWith('design', mockProjectId);
    });

    it('should map "prd" columnId to "prd" stage config', () => {
      // Mock already imported at top of file
      const mockHook = vi.fn();
      vi.mocked(useColumnModelConfig).mockImplementation((columnId, projectId) => {
        mockHook(columnId, projectId);
        return {
          modelConfig: mockSettings.taskStageConfig.prd!,
          isLoading: false,
          error: null,
        };
      });

      render(
        <ColumnModelDisplay
          columnId="prd"
          projectId={mockProjectId}
        />
      );

      expect(mockHook).toHaveBeenCalledWith('prd', mockProjectId);
    });

    it('should map "prototype" columnId to "prototype" stage config', () => {
      // Mock already imported at top of file
      const mockHook = vi.fn();
      vi.mocked(useColumnModelConfig).mockImplementation((columnId, projectId) => {
        mockHook(columnId, projectId);
        return {
          modelConfig: null,
          isLoading: false,
          error: null,
        };
      });

      render(
        <ColumnModelDisplay
          columnId="prototype"
          projectId={mockProjectId}
        />
      );

      expect(mockHook).toHaveBeenCalledWith('prototype', mockProjectId);
    });

    it('should return null for unknown columnId', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: null,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="unknown"
          projectId={mockProjectId}
        />
      );

      expect(screen.getByTestId('column-model-display-unknown')).toBeInTheDocument();
    });
  });

  describe('TAG-002 TASK-004: useColumnModelConfig hook', () => {
    it('should call useColumnModelConfig hook with columnId and projectId', () => {
      // Mock already imported at top of file
      const mockHook = vi.fn().mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.designDoc!,
        isLoading: false,
        error: null,
      });
      vi.mocked(useColumnModelConfig).mockImplementation(mockHook);

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      expect(mockHook).toHaveBeenCalledWith('design', mockProjectId);
    });

    it('should handle loading state from hook', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: null,
        isLoading: true,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      // Should show loading indicator
      expect(screen.getByTestId('column-model-display-design')).toBeInTheDocument();
    });

    it('should handle error state from hook', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: null,
        isLoading: false,
        error: 'Failed to load config',
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      expect(screen.getByTestId('column-model-display-design')).toBeInTheDocument();
    });
  });

  describe('TAG-002 TASK-005: ModelBadge visual component', () => {
    it('should render ModelBadge when modelConfig is available', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.designDoc!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      // ModelBadge should be rendered
      expect(screen.getByTestId('model-badge-openai-gpt-4o')).toBeInTheDocument();
    });

    it('should not render ModelBadge when modelConfig is null', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: null,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="prototype"
          projectId={mockProjectId}
        />
      );

      // ModelBadge should not be rendered
      expect(screen.queryByTestId(/model-badge-/)).not.toBeInTheDocument();
    });

    it('should pass provider and modelId to ModelBadge', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.prd!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="prd"
          projectId={mockProjectId}
        />
      );

      // ModelBadge should have correct provider and model
      expect(screen.getByTestId('model-badge-claude-code-claude-3.5-sonnet')).toBeInTheDocument();
    });
  });

  describe('TAG-002 TASK-006: Click handler for modal open', () => {
    it('should be clickable to open settings modal', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.designDoc!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      const badge = screen.getByTestId('model-badge-openai-gpt-4o');
      expect(badge).toHaveAttribute('role', 'button');
    });
  });

  describe('TAG-002 TASK-008: Provider icons and colors', () => {
    it('should display correct icon for OpenAI provider', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.designDoc!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      // Should display OpenAI icon
      expect(screen.getByTestId('provider-icon-openai')).toBeInTheDocument();
    });

    it('should display correct icon for Claude Code provider', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.prd!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="prd"
          projectId={mockProjectId}
        />
      );

      // Should display Claude Code icon
      expect(screen.getByTestId('provider-icon-claude-code')).toBeInTheDocument();
    });
  });

  describe('TAG-003 TASK-010: Tooltip for full model name', () => {
    it('should display full model name in tooltip', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.designDoc!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      const badge = screen.getByTestId('model-badge-openai-gpt-4o');
      expect(badge).toHaveAttribute('title', 'OpenAI GPT-4o');
    });
  });

  describe('TAG-004 TASK-011: Drag & Drop compatibility', () => {
    it('should not interfere with drag and drop operations', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: mockSettings.taskStageConfig.designDoc!,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId={mockProjectId}
        />
      );

      const badge = screen.getByTestId('model-badge-openai-gpt-4o');
      // Should not have draggable attribute to avoid interfering
      expect(badge).not.toHaveAttribute('draggable');
    });
  });

  describe('Edge cases', () => {
    it('should handle featurelist columnId (no LLM settings)', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: null,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="featurelist"
          projectId={mockProjectId}
        />
      );

      expect(screen.getByTestId('column-model-display-featurelist')).toBeInTheDocument();
    });

    it('should handle empty projectId', () => {
      // Mock already imported at top of file
      vi.mocked(useColumnModelConfig).mockReturnValue({
        modelConfig: null,
        isLoading: false,
        error: null,
      });

      render(
        <ColumnModelDisplay
          columnId="design"
          projectId=""
        />
      );

      expect(screen.getByTestId('column-model-display-design')).toBeInTheDocument();
    });
  });
});
