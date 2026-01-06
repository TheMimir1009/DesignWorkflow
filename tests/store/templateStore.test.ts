/**
 * Template Store Tests
 * TDD test suite for Zustand template store
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTemplateStore, selectFilteredTemplates } from '../../src/store/templateStore.ts';
import type { Template } from '../../src/types/index.ts';
import * as templateService from '../../src/services/templateService.ts';

// Mock template service
vi.mock('../../src/services/templateService.ts', () => ({
  getTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  getCategories: vi.fn(),
  applyTemplate: vi.fn(),
  previewTemplate: vi.fn(),
}));

const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Q&A Template 1',
    category: 'qa-questions',
    description: 'First Q&A template',
    content: '# {{title}}\n\n{{content}}',
    variables: [
      { name: 'title', description: 'Title', defaultValue: null, required: true, type: 'text', options: null },
      { name: 'content', description: 'Content', defaultValue: '', required: false, type: 'textarea', options: null },
    ],
    isDefault: false,
    projectId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'template-2',
    name: 'Document Template',
    category: 'document-structure',
    description: 'Document template',
    content: '# Document\n\n{{body}}',
    variables: [
      { name: 'body', description: 'Body', defaultValue: null, required: true, type: 'textarea', options: null },
    ],
    isDefault: true,
    projectId: null,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'template-3',
    name: 'Prompt Template',
    category: 'prompts',
    description: 'AI prompt template',
    content: 'Generate {{task}} for {{context}}',
    variables: [
      { name: 'task', description: 'Task', defaultValue: null, required: true, type: 'text', options: null },
      { name: 'context', description: 'Context', defaultValue: 'general', required: false, type: 'text', options: null },
    ],
    isDefault: false,
    projectId: 'project-1',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
];

describe('Template Store', () => {
  beforeEach(() => {
    // Reset store state
    useTemplateStore.setState({
      templates: [],
      selectedTemplateId: null,
      selectedCategory: null,
      isLoading: false,
      error: null,
      searchQuery: '',
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useTemplateStore.getState();

      expect(state.templates).toEqual([]);
      expect(state.selectedTemplateId).toBeNull();
      expect(state.selectedCategory).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.searchQuery).toBe('');
    });
  });

  describe('fetchTemplates', () => {
    it('should fetch templates and update state', async () => {
      vi.mocked(templateService.getTemplates).mockResolvedValue(mockTemplates);

      await useTemplateStore.getState().fetchTemplates();

      const state = useTemplateStore.getState();
      expect(state.templates).toHaveLength(3);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(templateService.getTemplates).toHaveBeenCalled();
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: Template[]) => void;
      const promise = new Promise<Template[]>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(templateService.getTemplates).mockReturnValue(promise);

      const fetchPromise = useTemplateStore.getState().fetchTemplates();

      expect(useTemplateStore.getState().isLoading).toBe(true);

      resolvePromise!(mockTemplates);
      await fetchPromise;

      expect(useTemplateStore.getState().isLoading).toBe(false);
    });

    it('should set error state on fetch failure', async () => {
      vi.mocked(templateService.getTemplates).mockRejectedValue(new Error('Network error'));

      await useTemplateStore.getState().fetchTemplates();

      const state = useTemplateStore.getState();
      expect(state.templates).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('should fetch templates with category filter', async () => {
      vi.mocked(templateService.getTemplates).mockResolvedValue([mockTemplates[0]]);

      await useTemplateStore.getState().fetchTemplates('qa-questions');

      expect(templateService.getTemplates).toHaveBeenCalledWith('qa-questions', undefined);
    });
  });

  describe('createTemplate', () => {
    it('should create template and add to store', async () => {
      const newTemplate: Template = {
        id: 'template-new',
        name: 'New Template',
        category: 'prompts',
        description: 'New description',
        content: 'New content',
        variables: [],
        isDefault: false,
        projectId: null,
        createdAt: '2024-01-04T00:00:00.000Z',
        updatedAt: '2024-01-04T00:00:00.000Z',
      };

      vi.mocked(templateService.createTemplate).mockResolvedValue(newTemplate);

      await useTemplateStore.getState().createTemplate({
        name: 'New Template',
        category: 'prompts',
        description: 'New description',
        content: 'New content',
      });

      const state = useTemplateStore.getState();
      expect(state.templates).toHaveLength(1);
      expect(state.templates[0].name).toBe('New Template');
      expect(state.error).toBeNull();
    });

    it('should set error on create failure', async () => {
      vi.mocked(templateService.createTemplate).mockRejectedValue(new Error('Create failed'));

      await useTemplateStore.getState().createTemplate({
        name: 'Test',
        category: 'prompts',
      });

      const state = useTemplateStore.getState();
      expect(state.error).toBe('Create failed');
    });
  });

  describe('updateTemplate', () => {
    beforeEach(() => {
      useTemplateStore.setState({ templates: mockTemplates });
    });

    it('should update template in store', async () => {
      const updatedTemplate = {
        ...mockTemplates[0],
        name: 'Updated Name',
        updatedAt: '2024-01-05T00:00:00.000Z',
      };

      vi.mocked(templateService.updateTemplate).mockResolvedValue(updatedTemplate);

      await useTemplateStore.getState().updateTemplate('template-1', { name: 'Updated Name' });

      const state = useTemplateStore.getState();
      const template = state.templates.find(t => t.id === 'template-1');
      expect(template?.name).toBe('Updated Name');
    });

    it('should set error on update failure', async () => {
      vi.mocked(templateService.updateTemplate).mockRejectedValue(new Error('Update failed'));

      await useTemplateStore.getState().updateTemplate('template-1', { name: 'Updated' });

      expect(useTemplateStore.getState().error).toBe('Update failed');
    });
  });

  describe('deleteTemplate', () => {
    beforeEach(() => {
      useTemplateStore.setState({ templates: mockTemplates });
    });

    it('should delete template from store', async () => {
      vi.mocked(templateService.deleteTemplate).mockResolvedValue(undefined);

      await useTemplateStore.getState().deleteTemplate('template-1');

      const state = useTemplateStore.getState();
      expect(state.templates).toHaveLength(2);
      expect(state.templates.find(t => t.id === 'template-1')).toBeUndefined();
    });

    it('should clear selected template if deleted', async () => {
      useTemplateStore.setState({ selectedTemplateId: 'template-1' });
      vi.mocked(templateService.deleteTemplate).mockResolvedValue(undefined);

      await useTemplateStore.getState().deleteTemplate('template-1');

      expect(useTemplateStore.getState().selectedTemplateId).toBeNull();
    });
  });

  describe('setSelectedTemplateId', () => {
    it('should set selected template ID', () => {
      useTemplateStore.getState().setSelectedTemplateId('template-1');
      expect(useTemplateStore.getState().selectedTemplateId).toBe('template-1');
    });

    it('should allow clearing selected template', () => {
      useTemplateStore.setState({ selectedTemplateId: 'template-1' });
      useTemplateStore.getState().setSelectedTemplateId(null);
      expect(useTemplateStore.getState().selectedTemplateId).toBeNull();
    });
  });

  describe('setSelectedCategory', () => {
    it('should set selected category', () => {
      useTemplateStore.getState().setSelectedCategory('qa-questions');
      expect(useTemplateStore.getState().selectedCategory).toBe('qa-questions');
    });

    it('should allow clearing selected category', () => {
      useTemplateStore.setState({ selectedCategory: 'prompts' });
      useTemplateStore.getState().setSelectedCategory(null);
      expect(useTemplateStore.getState().selectedCategory).toBeNull();
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      useTemplateStore.getState().setSearchQuery('test query');
      expect(useTemplateStore.getState().searchQuery).toBe('test query');
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      useTemplateStore.setState({
        selectedCategory: 'prompts',
        searchQuery: 'test',
      });

      useTemplateStore.getState().clearFilters();

      const state = useTemplateStore.getState();
      expect(state.selectedCategory).toBeNull();
      expect(state.searchQuery).toBe('');
    });
  });

  describe('selectFilteredTemplates', () => {
    beforeEach(() => {
      useTemplateStore.setState({ templates: mockTemplates });
    });

    it('should return all templates when no filters applied', () => {
      const filtered = selectFilteredTemplates(useTemplateStore.getState());
      expect(filtered).toHaveLength(3);
    });

    it('should filter by category', () => {
      useTemplateStore.setState({ selectedCategory: 'qa-questions' });
      const filtered = selectFilteredTemplates(useTemplateStore.getState());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('qa-questions');
    });

    it('should filter by search query in name', () => {
      useTemplateStore.setState({ searchQuery: 'Document' });
      const filtered = selectFilteredTemplates(useTemplateStore.getState());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toContain('Document');
    });

    it('should filter by search query in description', () => {
      useTemplateStore.setState({ searchQuery: 'AI prompt' });
      const filtered = selectFilteredTemplates(useTemplateStore.getState());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toContain('AI prompt');
    });

    it('should combine category and search filters', () => {
      useTemplateStore.setState({
        selectedCategory: 'prompts',
        searchQuery: 'Prompt',
      });
      const filtered = selectFilteredTemplates(useTemplateStore.getState());
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('template-3');
    });

    it('should return empty array when no matches', () => {
      useTemplateStore.setState({ searchQuery: 'nonexistent' });
      const filtered = selectFilteredTemplates(useTemplateStore.getState());
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getSelectedTemplate', () => {
    beforeEach(() => {
      useTemplateStore.setState({ templates: mockTemplates });
    });

    it('should return selected template', () => {
      useTemplateStore.setState({ selectedTemplateId: 'template-2' });
      const selected = useTemplateStore.getState().getSelectedTemplate();
      expect(selected?.id).toBe('template-2');
      expect(selected?.name).toBe('Document Template');
    });

    it('should return undefined when no template selected', () => {
      const selected = useTemplateStore.getState().getSelectedTemplate();
      expect(selected).toBeUndefined();
    });

    it('should return undefined when selected template not in list', () => {
      useTemplateStore.setState({ selectedTemplateId: 'nonexistent' });
      const selected = useTemplateStore.getState().getSelectedTemplate();
      expect(selected).toBeUndefined();
    });
  });
});
