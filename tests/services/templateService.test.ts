/**
 * Template Service Tests
 * TDD test suite for template service API communication
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getCategories,
  applyTemplate,
  previewTemplate,
  API_BASE_URL,
} from '../../src/services/templateService.ts';
import type { Template, ApiResponse } from '../../src/types/index.ts';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockTemplate: Template = {
  id: 'template-1',
  name: 'Test Template',
  category: 'prompts',
  description: 'Test description',
  content: '# {{title}}\n\n{{content}}',
  variables: [
    { name: 'title', description: 'Title', defaultValue: null, required: true, type: 'text', options: null },
    { name: 'content', description: 'Content', defaultValue: '', required: false, type: 'textarea', options: null },
  ],
  isDefault: false,
  projectId: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Template Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTemplates', () => {
    it('should fetch all templates', async () => {
      const mockResponse: ApiResponse<Template[]> = {
        success: true,
        data: [mockTemplate],
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const templates = await getTemplates();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/templates`);
      expect(templates).toEqual([mockTemplate]);
    });

    it('should fetch templates with category filter', async () => {
      const mockResponse: ApiResponse<Template[]> = {
        success: true,
        data: [mockTemplate],
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getTemplates('prompts');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/templates?category=prompts`);
    });

    it('should fetch templates with projectId filter', async () => {
      const mockResponse: ApiResponse<Template[]> = {
        success: true,
        data: [mockTemplate],
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getTemplates(undefined, 'project-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/templates?projectId=project-1`);
    });

    it('should throw error on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getTemplates()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw error when API returns error', async () => {
      const mockResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Server error',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getTemplates()).rejects.toThrow('Server error');
    });
  });

  describe('getTemplate', () => {
    it('should fetch a single template by ID', async () => {
      const mockResponse: ApiResponse<Template> = {
        success: true,
        data: mockTemplate,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const template = await getTemplate('template-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/templates/template-1`);
      expect(template).toEqual(mockTemplate);
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const mockResponse: ApiResponse<Template> = {
        success: true,
        data: mockTemplate,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const createData = {
        name: 'Test Template',
        category: 'prompts' as const,
        description: 'Test description',
        content: '# {{title}}\n\n{{content}}',
      };

      const template = await createTemplate(createData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/templates`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        })
      );
      expect(template).toEqual(mockTemplate);
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing template', async () => {
      const updatedTemplate = { ...mockTemplate, name: 'Updated Name' };
      const mockResponse: ApiResponse<Template> = {
        success: true,
        data: updatedTemplate,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const updateData = { name: 'Updated Name' };
      const template = await updateTemplate('template-1', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/templates/template-1`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })
      );
      expect(template.name).toBe('Updated Name');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      const mockResponse: ApiResponse<{ deleted: boolean }> = {
        success: true,
        data: { deleted: true },
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await deleteTemplate('template-1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/templates/template-1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getCategories', () => {
    it('should fetch available categories', async () => {
      const mockResponse: ApiResponse<string[]> = {
        success: true,
        data: ['qa-questions', 'document-structure', 'prompts'],
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const categories = await getCategories();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/templates/categories`);
      expect(categories).toEqual(['qa-questions', 'document-structure', 'prompts']);
    });
  });

  describe('applyTemplate', () => {
    it('should apply template with variable values', async () => {
      const mockResponse: ApiResponse<{ content: string; appliedAt: string }> = {
        success: true,
        data: {
          content: '# My Title\n\nMy content',
          appliedAt: '2024-01-01T00:00:00.000Z',
        },
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await applyTemplate('template-1', {
        title: 'My Title',
        content: 'My content',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/templates/template-1/apply`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variableValues: { title: 'My Title', content: 'My content' } }),
        })
      );
      expect(result.content).toBe('# My Title\n\nMy content');
    });
  });

  describe('previewTemplate', () => {
    it('should preview template with default values', async () => {
      const mockResponse: ApiResponse<{ content: string }> = {
        success: true,
        data: { content: '# [title]\n\n' },
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await previewTemplate('template-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/templates/template-1/preview`);
      expect(result.content).toBe('# [title]\n\n');
    });
  });
});
