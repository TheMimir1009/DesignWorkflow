/**
 * Tests for Prompt Store
 * RED phase: Write failing tests first
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePromptStore } from '../promptStore';
import type { PromptTemplate, PromptCategory } from '../../types';

// Mock the promptService
vi.mock('../../services/promptService', () => ({
  getPrompts: vi.fn(),
  getPrompt: vi.fn(),
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
  resetPrompt: vi.fn(),
  deletePrompt: vi.fn(),
  getPromptVersions: vi.fn(),
  getCategories: vi.fn(),
}));

import * as promptService from '../../services/promptService';

const mockGetPrompts = promptService.getPrompts as ReturnType<typeof vi.fn>;
const mockCreatePrompt = promptService.createPrompt as ReturnType<typeof vi.fn>;
const mockUpdatePrompt = promptService.updatePrompt as ReturnType<typeof vi.fn>;
const mockResetPrompt = promptService.resetPrompt as ReturnType<typeof vi.fn>;
const mockDeletePrompt = promptService.deletePrompt as ReturnType<typeof vi.fn>;

describe('PromptStore', () => {
  const mockPrompt: PromptTemplate = {
    id: 'prompt-1',
    name: 'Test Prompt',
    category: 'document-generation',
    description: 'Test description',
    content: 'Test content',
    variables: [],
    isModified: false,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    defaultContent: 'Test content',
  };

  beforeEach(() => {
    // Reset store state before each test
    usePromptStore.setState({
      prompts: [],
      selectedPromptId: null,
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = usePromptStore.getState();

      expect(state.prompts).toEqual([]);
      expect(state.selectedPromptId).toBeNull();
      expect(state.selectedCategory).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.searchQuery).toBe('');
    });

    it('should provide getFilteredPrompts() getter', () => {
      const state = usePromptStore.getState();
      expect(state.getFilteredPrompts()).toEqual([]);
    });
  });

  describe('fetchPrompts', () => {
    it('should fetch prompts and update state', async () => {
      const mockPrompts = [mockPrompt];
      mockGetPrompts.mockResolvedValue(mockPrompts);

      await usePromptStore.getState().fetchPrompts();

      const state = usePromptStore.getState();
      expect(state.prompts).toEqual(mockPrompts);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockGetPrompts).toHaveBeenCalledWith(undefined);
    });

    it('should fetch prompts with category filter', async () => {
      mockGetPrompts.mockResolvedValue([mockPrompt]);

      await usePromptStore.getState().fetchPrompts('document-generation');

      expect(mockGetPrompts).toHaveBeenCalledWith('document-generation');
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch');
      mockGetPrompts.mockRejectedValue(error);

      await usePromptStore.getState().fetchPrompts();

      const state = usePromptStore.getState();
      expect(state.prompts).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });

    it('should set loading state during fetch', async () => {
      mockGetPrompts.mockImplementation(
        () =>
          new Promise(resolve => {
            const state = usePromptStore.getState();
            expect(state.isLoading).toBe(true);
            resolve([mockPrompt]);
          })
      );

      await usePromptStore.getState().fetchPrompts();
    });
  });

  describe('createPrompt', () => {
    it('should create prompt and add to state', async () => {
      mockCreatePrompt.mockResolvedValue(mockPrompt);

      await usePromptStore.getState().createPrompt({
        name: 'New Prompt',
        category: 'utility',
        description: 'Test',
        content: 'Content',
        variables: [],
      });

      const state = usePromptStore.getState();
      expect(state.prompts).toContainEqual(mockPrompt);
      expect(state.isLoading).toBe(false);
    });

    it('should handle create errors', async () => {
      const error = new Error('Creation failed');
      mockCreatePrompt.mockRejectedValue(error);

      await usePromptStore.getState().createPrompt({
        name: 'New',
        category: 'utility',
        description: 'Test',
        content: 'Content',
        variables: [],
      });

      const state = usePromptStore.getState();
      expect(state.error).toBe('Creation failed');
    });
  });

  describe('updatePrompt', () => {
    it('should update prompt in state', async () => {
      const updatedPrompt: PromptTemplate = {
        ...mockPrompt,
        name: 'Updated Name',
        version: 2,
      };

      usePromptStore.setState({ prompts: [mockPrompt] });
      mockUpdatePrompt.mockResolvedValue(updatedPrompt);

      await usePromptStore.getState().updatePrompt('prompt-1', {
        name: 'Updated Name',
      });

      const state = usePromptStore.getState();
      expect(state.prompts[0].name).toBe('Updated Name');
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockUpdatePrompt.mockRejectedValue(error);

      await usePromptStore.getState().updatePrompt('prompt-1', {
        name: 'Updated',
      });

      const state = usePromptStore.getState();
      expect(state.error).toBe('Update failed');
    });
  });

  describe('resetPrompt', () => {
    it('should reset prompt to default content', async () => {
      const modifiedPrompt: PromptTemplate = {
        ...mockPrompt,
        isModified: true,
        content: 'Modified content',
      };

      const resetPrompt: PromptTemplate = {
        ...mockPrompt,
        isModified: false,
        content: mockPrompt.defaultContent,
      };

      usePromptStore.setState({ prompts: [modifiedPrompt] });
      mockResetPrompt.mockResolvedValue(resetPrompt);

      await usePromptStore.getState().resetPrompt('prompt-1');

      const state = usePromptStore.getState();
      expect(state.prompts[0].isModified).toBe(false);
      expect(state.prompts[0].content).toBe(mockPrompt.defaultContent);
    });
  });

  describe('deletePrompt', () => {
    it('should delete prompt from state', async () => {
      usePromptStore.setState({ prompts: [mockPrompt], selectedPromptId: 'prompt-1' });
      mockDeletePrompt.mockResolvedValue(undefined);

      await usePromptStore.getState().deletePrompt('prompt-1');

      const state = usePromptStore.getState();
      expect(state.prompts).toHaveLength(0);
      expect(state.selectedPromptId).toBeNull();
    });

    it('should clear selected prompt if deleted', async () => {
      const otherPrompt: PromptTemplate = {
        ...mockPrompt,
        id: 'prompt-2',
      };

      usePromptStore.setState({ prompts: [mockPrompt, otherPrompt], selectedPromptId: 'prompt-1' });
      mockDeletePrompt.mockResolvedValue(undefined);

      await usePromptStore.getState().deletePrompt('prompt-1');

      expect(usePromptStore.getState().selectedPromptId).toBeNull();
    });

    it('should keep other selected prompt if different one deleted', async () => {
      const otherPrompt: PromptTemplate = {
        ...mockPrompt,
        id: 'prompt-2',
      };

      usePromptStore.setState({ prompts: [mockPrompt, otherPrompt], selectedPromptId: 'prompt-2' });
      mockDeletePrompt.mockResolvedValue(undefined);

      await usePromptStore.getState().deletePrompt('prompt-1');

      expect(usePromptStore.getState().selectedPromptId).toBe('prompt-2');
    });
  });

  describe('setSelectedPromptId', () => {
    it('should set selected prompt id', () => {
      usePromptStore.getState().setSelectedPromptId('prompt-1');

      expect(usePromptStore.getState().selectedPromptId).toBe('prompt-1');
    });

    it('should clear selected prompt id', () => {
      usePromptStore.setState({ selectedPromptId: 'prompt-1' });

      usePromptStore.getState().setSelectedPromptId(null);

      expect(usePromptStore.getState().selectedPromptId).toBeNull();
    });
  });

  describe('setSelectedCategory', () => {
    it('should set selected category', () => {
      usePromptStore.getState().setSelectedCategory('document-generation');

      expect(usePromptStore.getState().selectedCategory).toBe('document-generation');
    });

    it('should clear selected category', () => {
      usePromptStore.setState({ selectedCategory: 'analysis' });

      usePromptStore.getState().setSelectedCategory(null);

      expect(usePromptStore.getState().selectedCategory).toBeNull();
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      usePromptStore.getState().setSearchQuery('test query');

      expect(usePromptStore.getState().searchQuery).toBe('test query');
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      usePromptStore.setState({
        selectedCategory: 'document-generation',
        searchQuery: 'test',
      });

      usePromptStore.getState().clearFilters();

      expect(usePromptStore.getState().selectedCategory).toBeNull();
      expect(usePromptStore.getState().searchQuery).toBe('');
    });
  });

  describe('getSelectedPrompt', () => {
    it('should return selected prompt', () => {
      usePromptStore.setState({ prompts: [mockPrompt], selectedPromptId: 'prompt-1' });

      const selected = usePromptStore.getState().getSelectedPrompt();

      expect(selected).toEqual(mockPrompt);
    });

    it('should return undefined if no prompt selected', () => {
      usePromptStore.setState({ prompts: [mockPrompt], selectedPromptId: null });

      const selected = usePromptStore.getState().getSelectedPrompt();

      expect(selected).toBeUndefined();
    });

    it('should return undefined if selected prompt not found', () => {
      usePromptStore.setState({ prompts: [mockPrompt], selectedPromptId: 'non-existent' });

      const selected = usePromptStore.getState().getSelectedPrompt();

      expect(selected).toBeUndefined();
    });
  });

  describe('getFilteredPrompts()', () => {
    const prompts: PromptTemplate[] = [
      {
        ...mockPrompt,
        id: '1',
        name: 'Document Prompt',
        category: 'document-generation',
        description: 'For documents',
      },
      {
        ...mockPrompt,
        id: '2',
        name: 'Code Prompt',
        category: 'code-operation',
        description: 'For code',
      },
      {
        ...mockPrompt,
        id: '3',
        name: 'Analysis Prompt',
        category: 'analysis',
        description: 'For analysis',
      },
    ];

    it('should return all prompts when no filters', () => {
      usePromptStore.setState({ prompts });

      const filtered = usePromptStore.getState().getFilteredPrompts();

      expect(filtered).toHaveLength(3);
    });

    it('should filter by category', () => {
      usePromptStore.setState({ prompts, selectedCategory: 'document-generation' });

      const filtered = usePromptStore.getState().getFilteredPrompts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('document-generation');
    });

    it('should filter by search query in name', () => {
      usePromptStore.setState({ prompts, searchQuery: 'Document' });

      const filtered = usePromptStore.getState().getFilteredPrompts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toContain('Document');
    });

    it('should filter by search query in description', () => {
      usePromptStore.setState({ prompts, searchQuery: 'analysis' });

      const filtered = usePromptStore.getState().getFilteredPrompts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toContain('analysis');
    });

    it('should combine category and search filters', () => {
      usePromptStore.setState({
        prompts,
        selectedCategory: 'code-operation',
        searchQuery: 'Code',
      });

      const filtered = usePromptStore.getState().getFilteredPrompts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should be case-insensitive for search', () => {
      usePromptStore.setState({ prompts, searchQuery: 'DOCUMENT' });

      const filtered = usePromptStore.getState().getFilteredPrompts();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Document Prompt');
    });
  });
});
