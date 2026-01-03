/**
 * System Document Service Tests
 * TDD test suite for systemDocService API communication layer
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SystemDocument } from '../../src/types/index.ts';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import service after mocking fetch
import * as systemDocService from '../../src/services/systemDocService.ts';

describe('systemDocService', () => {
  const mockProjectId = 'test-project-123';
  const mockSystemId = 'test-system-456';

  const mockSystemDocument: SystemDocument = {
    id: mockSystemId,
    projectId: mockProjectId,
    name: 'Combat System',
    category: 'Core Mechanics',
    tags: ['combat', 'action'],
    content: '# Combat System\n\nDescription here...',
    dependencies: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSystemDocuments', () => {
    it('should fetch all system documents for a project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockSystemDocument],
          error: null,
        }),
      });

      const result = await systemDocService.getSystemDocuments(mockProjectId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/projects/${mockProjectId}/systems`
      );
      expect(result).toEqual([mockSystemDocument]);
    });

    it('should throw error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(systemDocService.getSystemDocuments(mockProjectId))
        .rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw error on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: null,
          error: 'Project not found',
        }),
      });

      await expect(systemDocService.getSystemDocuments(mockProjectId))
        .rejects.toThrow('Project not found');
    });
  });

  describe('getSystemDocument', () => {
    it('should fetch a single system document by id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockSystemDocument,
          error: null,
        }),
      });

      const result = await systemDocService.getSystemDocument(mockProjectId, mockSystemId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/projects/${mockProjectId}/systems/${mockSystemId}`
      );
      expect(result).toEqual(mockSystemDocument);
    });

    it('should throw error when system document not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: null,
          error: 'System document not found',
        }),
      });

      await expect(systemDocService.getSystemDocument(mockProjectId, 'non-existent'))
        .rejects.toThrow('System document not found');
    });
  });

  describe('createSystemDocument', () => {
    it('should create a new system document', async () => {
      const createData = {
        name: 'New System',
        category: 'Core',
        tags: ['new'],
        content: 'Content here',
        dependencies: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockSystemDocument, ...createData },
          error: null,
        }),
      });

      const result = await systemDocService.createSystemDocument(mockProjectId, createData);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/projects/${mockProjectId}/systems`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        }
      );
      expect(result.name).toBe(createData.name);
    });

    it('should throw error on duplicate name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: null,
          error: 'A system document with this name already exists (duplicate)',
        }),
      });

      await expect(systemDocService.createSystemDocument(mockProjectId, {
        name: 'Duplicate',
        category: 'Core',
      })).rejects.toThrow('duplicate');
    });
  });

  describe('updateSystemDocument', () => {
    it('should update an existing system document', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedDoc = { ...mockSystemDocument, ...updateData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: updatedDoc,
          error: null,
        }),
      });

      const result = await systemDocService.updateSystemDocument(mockProjectId, mockSystemId, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/projects/${mockProjectId}/systems/${mockSystemId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should throw error when system document not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: null,
          error: 'System document not found',
        }),
      });

      await expect(systemDocService.updateSystemDocument(mockProjectId, 'non-existent', { name: 'Updated' }))
        .rejects.toThrow('System document not found');
    });
  });

  describe('deleteSystemDocument', () => {
    it('should delete a system document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { deleted: true },
          error: null,
        }),
      });

      await systemDocService.deleteSystemDocument(mockProjectId, mockSystemId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/projects/${mockProjectId}/systems/${mockSystemId}`,
        { method: 'DELETE' }
      );
    });

    it('should throw error when system document not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: null,
          error: 'System document not found',
        }),
      });

      await expect(systemDocService.deleteSystemDocument(mockProjectId, 'non-existent'))
        .rejects.toThrow('System document not found');
    });
  });

  describe('getCategories', () => {
    it('should fetch unique categories for a project', async () => {
      const categories = ['Combat', 'UI', 'Economy'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: categories,
          error: null,
        }),
      });

      const result = await systemDocService.getCategories(mockProjectId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/projects/${mockProjectId}/systems/categories`
      );
      expect(result).toEqual(categories);
    });
  });

  describe('getTags', () => {
    it('should fetch unique tags for a project', async () => {
      const tags = ['action', 'combat', 'economy'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: tags,
          error: null,
        }),
      });

      const result = await systemDocService.getTags(mockProjectId);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3001/api/projects/${mockProjectId}/systems/tags`
      );
      expect(result).toEqual(tags);
    });
  });
});
