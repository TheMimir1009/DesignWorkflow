/**
 * Tests for Prompt Service
 * RED phase: Write failing tests first
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  resetPrompt,
  deletePrompt,
  getPromptVersions,
  getCategories,
} from '../promptService';
import type { PromptTemplate, PromptCategory, PromptVersion } from '../../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock response helper
function mockSuccessResponse<T>(data: T): Response {
  return {
    ok: true,
    json: async () => ({
      success: true,
      data,
      error: null,
    }),
  } as Response;
}

function mockErrorResponse(error: string, status: number = 400): Response {
  return {
    ok: status < 400,
    status,
    json: async () => ({
      success: false,
      data: null,
      error,
    }),
  } as Response;
}

describe('PromptService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  describe('getPrompts', () => {
    it('should fetch all prompts without filters', async () => {
      const mockPrompts: PromptTemplate[] = [
        {
          id: '1',
          name: 'Test Prompt',
          category: 'document-generation',
          description: 'Test',
          content: 'Content',
          variables: [],
          isModified: false,
          version: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          defaultContent: 'Content',
        },
      ];

      mockFetch.mockResolvedValue(mockSuccessResponse(mockPrompts));

      const result = await getPrompts();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts'
      );
      expect(result).toEqual(mockPrompts);
    });

    it('should fetch prompts with category filter', async () => {
      const mockPrompts: PromptTemplate[] = [];
      mockFetch.mockResolvedValue(mockSuccessResponse(mockPrompts));

      await getPrompts('document-generation');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts?category=document-generation'
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse('Failed to fetch', 500));

      await expect(getPrompts()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getPrompt', () => {
    it('should fetch a single prompt by id', async () => {
      const mockPrompt: PromptTemplate = {
        id: 'prompt-1',
        name: 'Single Prompt',
        category: 'analysis',
        description: 'Test',
        content: 'Content',
        variables: [],
        isModified: false,
        version: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        defaultContent: 'Content',
      };

      mockFetch.mockResolvedValue(mockSuccessResponse(mockPrompt));

      const result = await getPrompt('prompt-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts/prompt-1'
      );
      expect(result).toEqual(mockPrompt);
    });

    it('should throw error when prompt not found', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse('Prompt not found', 404));

      await expect(getPrompt('non-existent')).rejects.toThrow('Prompt not found');
    });
  });

  describe('createPrompt', () => {
    it('should create a new prompt', async () => {
      const createDto = {
        name: 'New Prompt',
        category: 'utility' as PromptCategory,
        description: 'A new prompt',
        content: 'Prompt content',
        variables: [],
      };

      const mockCreated: PromptTemplate = {
        id: 'new-id',
        ...createDto,
        isModified: false,
        version: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        defaultContent: createDto.content,
      };

      mockFetch.mockResolvedValue(mockSuccessResponse(mockCreated));

      const result = await createPrompt(createDto);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createDto),
        }
      );
      expect(result).toEqual(mockCreated);
    });

    it('should throw error on validation failure', async () => {
      const invalidDto = {
        name: '',
        category: 'invalid' as PromptCategory,
        description: '',
        content: '',
        variables: [],
      };

      mockFetch.mockResolvedValue(
        mockErrorResponse('Validation failed', 400)
      );

      await expect(createPrompt(invalidDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('updatePrompt', () => {
    it('should update an existing prompt', async () => {
      const updateDto = {
        name: 'Updated Name',
        content: 'Updated content',
      };

      const mockUpdated: PromptTemplate = {
        id: 'prompt-1',
        name: 'Updated Name',
        category: 'document-generation',
        description: 'Test',
        content: 'Updated content',
        variables: [],
        isModified: true,
        version: 2,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T01:00:00.000Z',
        defaultContent: 'Original content',
      };

      mockFetch.mockResolvedValue(mockSuccessResponse(mockUpdated));

      const result = await updatePrompt('prompt-1', updateDto);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts/prompt-1',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateDto),
        }
      );
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('resetPrompt', () => {
    it('should reset prompt to default content', async () => {
      const mockReset: PromptTemplate = {
        id: 'prompt-1',
        name: 'Test Prompt',
        category: 'utility',
        description: 'Test',
        content: 'Default content',
        variables: [],
        isModified: false,
        version: 3,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T02:00:00.000Z',
        defaultContent: 'Default content',
      };

      mockFetch.mockResolvedValue(mockSuccessResponse(mockReset));

      const result = await resetPrompt('prompt-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts/prompt-1/reset',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockReset);
      expect(result.isModified).toBe(false);
    });
  });

  describe('deletePrompt', () => {
    it('should delete a prompt', async () => {
      mockFetch.mockResolvedValue(
        mockSuccessResponse({ id: 'prompt-1', deleted: true })
      );

      await deletePrompt('prompt-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts/prompt-1',
        {
          method: 'DELETE',
        }
      );
    });

    it('should throw error when prompt not found', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse('Prompt not found', 404));

      await expect(deletePrompt('non-existent')).rejects.toThrow(
        'Prompt not found'
      );
    });
  });

  describe('getPromptVersions', () => {
    it('should fetch version history for a prompt', async () => {
      const mockVersions: PromptVersion[] = [
        {
          id: 'prompt-1-v1',
          promptId: 'prompt-1',
          version: 1,
          content: 'v1 content',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'prompt-1-v2',
          promptId: 'prompt-1',
          version: 2,
          content: 'v2 content',
          createdAt: '2024-01-01T01:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValue(mockSuccessResponse(mockVersions));

      const result = await getPromptVersions('prompt-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts/prompt-1/versions'
      );
      expect(result).toEqual(mockVersions);
    });

    it('should throw error when prompt not found', async () => {
      mockFetch.mockResolvedValue(mockErrorResponse('Prompt not found', 404));

      await expect(getPromptVersions('non-existent')).rejects.toThrow(
        'Prompt not found'
      );
    });
  });

  describe('getCategories', () => {
    it('should fetch all available categories', async () => {
      const mockCategories: PromptCategory[] = [
        'document-generation',
        'code-operation',
        'analysis',
        'utility',
      ];

      mockFetch.mockResolvedValue(mockSuccessResponse(mockCategories));

      const result = await getCategories();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/prompts/categories'
      );
      expect(result).toEqual(mockCategories);
    });
  });
});
