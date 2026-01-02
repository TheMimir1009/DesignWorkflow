/**
 * System Document Service Tests
 * TDD test suite for system document API communication layer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SystemDocument, ApiResponse } from '../../src/types/index.ts';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocking
import {
  getSystemDocuments,
  getSystemDocument,
  createSystemDocument,
  updateSystemDocument,
  deleteSystemDocument,
  getCategories,
  getTags,
  searchSystemDocuments,
} from '../../src/services/systemDocService.ts';

describe('System Document Service', () => {
  const projectId = 'test-project-id';

  const mockDocument: SystemDocument = {
    id: 'doc-1',
    projectId,
    name: 'Test Document',
    category: 'System',
    tags: ['test', 'sample'],
    content: '# Test Content',
    dependencies: [],
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
  };

  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getSystemDocuments', () => {
    it('should fetch all system documents for a project', async () => {
      const mockResponse: ApiResponse<SystemDocument[]> = {
        success: true,
        data: [mockDocument],
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSystemDocuments(projectId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems`)
      );
      expect(result).toEqual([mockDocument]);
    });

    it('should throw error on unsuccessful response', async () => {
      const mockResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Failed to get documents',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getSystemDocuments(projectId)).rejects.toThrow('Failed to get documents');
    });

    it('should throw error on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getSystemDocuments(projectId)).rejects.toThrow();
    });
  });

  describe('getSystemDocument', () => {
    it('should fetch a single system document by id', async () => {
      const mockResponse: ApiResponse<SystemDocument> = {
        success: true,
        data: mockDocument,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSystemDocument(projectId, mockDocument.id);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems/${mockDocument.id}`)
      );
      expect(result).toEqual(mockDocument);
    });

    it('should throw error when document not found', async () => {
      const mockResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Document not found',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getSystemDocument(projectId, 'non-existent')).rejects.toThrow('Document not found');
    });
  });

  describe('createSystemDocument', () => {
    it('should create a new system document', async () => {
      const createData = {
        name: 'New Document',
        category: 'System',
        tags: ['new'],
        content: '# New Content',
      };

      const createdDoc = { ...mockDocument, ...createData };
      const mockResponse: ApiResponse<SystemDocument> = {
        success: true,
        data: createdDoc,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createSystemDocument(projectId, createData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems`),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        })
      );
      expect(result).toEqual(createdDoc);
    });

    it('should throw error on validation failure', async () => {
      const mockResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Name is required',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createSystemDocument(projectId, { name: '', category: 'System' }))
        .rejects.toThrow('Name is required');
    });
  });

  describe('updateSystemDocument', () => {
    it('should update an existing system document', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedDoc = { ...mockDocument, ...updateData };
      const mockResponse: ApiResponse<SystemDocument> = {
        success: true,
        data: updatedDoc,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateSystemDocument(projectId, mockDocument.id, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems/${mockDocument.id}`),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(updatedDoc);
    });
  });

  describe('deleteSystemDocument', () => {
    it('should delete a system document', async () => {
      const mockResponse: ApiResponse<{ deleted: boolean }> = {
        success: true,
        data: { deleted: true },
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await deleteSystemDocument(projectId, mockDocument.id);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems/${mockDocument.id}`),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('getCategories', () => {
    it('should fetch all categories for a project', async () => {
      const categories = ['Economy', 'System', 'UI'];
      const mockResponse: ApiResponse<string[]> = {
        success: true,
        data: categories,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getCategories(projectId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems/categories`)
      );
      expect(result).toEqual(categories);
    });
  });

  describe('getTags', () => {
    it('should fetch all tags for a project', async () => {
      const tags = ['core', 'economy', 'player'];
      const mockResponse: ApiResponse<string[]> = {
        success: true,
        data: tags,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getTags(projectId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems/tags`)
      );
      expect(result).toEqual(tags);
    });
  });

  describe('searchSystemDocuments', () => {
    it('should search system documents with query', async () => {
      const mockResponse: ApiResponse<SystemDocument[]> = {
        success: true,
        data: [mockDocument],
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await searchSystemDocuments(projectId, 'test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/systems/search?q=test`)
      );
      expect(result).toEqual([mockDocument]);
    });

    it('should encode search query properly', async () => {
      const mockResponse: ApiResponse<SystemDocument[]> = {
        success: true,
        data: [],
        error: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await searchSystemDocuments(projectId, 'hello world');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=hello%20world')
      );
    });
  });
});
