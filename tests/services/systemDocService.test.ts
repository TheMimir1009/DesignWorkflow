/**
 * System Document Service Tests
<<<<<<< HEAD
 * TDD test suite for systemDocService API communication layer
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SystemDocument } from '../../src/types/index.ts';
=======
 * TDD test suite for System Document API communication layer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSystems,
  getSystem,
  createSystem,
  updateSystem,
  deleteSystem,
  API_BASE_URL,
} from '../../src/services/systemDocService';
import type { SystemDocument, ApiResponse } from '../../src/types';
>>>>>>> main

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

<<<<<<< HEAD
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
=======
// Test data factories
const createMockSystem = (overrides: Partial<SystemDocument> = {}): SystemDocument => ({
  id: 'test-system-id',
  projectId: 'test-project-id',
  name: 'Test System',
  category: 'game-mechanic',
  tags: ['test', 'sample'],
  content: '# Test System\n\nContent here.',
  dependencies: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const createApiResponse = <T>(data: T, success = true, error: string | null = null): ApiResponse<T> => ({
  success,
  data,
  error,
});

// DTO types for create and update
interface CreateSystemDto {
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

interface UpdateSystemDto {
  name?: string;
  category?: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

describe('systemDocService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('API_BASE_URL', () => {
    it('should be defined as http://localhost:3001', () => {
      expect(API_BASE_URL).toBe('http://localhost:3001');
    });
  });

  describe('getSystems', () => {
    it('should fetch all systems for a project successfully', async () => {
      const mockSystems = [
        createMockSystem({ id: 'system-1', name: 'System 1' }),
        createMockSystem({ id: 'system-2', name: 'System 2' }),
      ];
      const mockResponse = createApiResponse(mockSystems);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSystems('test-project-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/test-project-id/systems`
      );
      expect(result).toEqual(mockSystems);
    });

    it('should return empty array when no systems exist', async () => {
      const mockResponse = createApiResponse<SystemDocument[]>([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSystems('empty-project-id');

      expect(result).toEqual([]);
    });

    it('should throw error when API returns unsuccessful response', async () => {
      const mockResponse = createApiResponse<SystemDocument[] | null>(null, false, 'Server error');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getSystems('test-project-id')).rejects.toThrow('Server error');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getSystems('test-project-id')).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getSystems('test-project-id')).rejects.toThrow();
    });
  });

  describe('getSystem', () => {
    it('should fetch a single system by id successfully', async () => {
      const mockSystem = createMockSystem({ id: 'system-1', name: 'Single System' });
      const mockResponse = createApiResponse(mockSystem);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSystem('system-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/systems/system-1`);
      expect(result).toEqual(mockSystem);
    });

    it('should throw error when system not found', async () => {
      const mockResponse = createApiResponse<SystemDocument | null>(null, false, 'System not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getSystem('non-existent-id')).rejects.toThrow('System not found');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getSystem('system-1')).rejects.toThrow('Network error');
    });
  });

  describe('createSystem', () => {
    it('should create a new system successfully', async () => {
      const createDto: CreateSystemDto = {
        name: 'New System',
        category: 'economy',
        tags: ['new', 'economy'],
        content: '# New System\n\nNew content.',
        dependencies: [],
      };

      const createdSystem = createMockSystem({
        id: 'new-system-id',
        name: 'New System',
        category: 'economy',
        tags: ['new', 'economy'],
        content: '# New System\n\nNew content.',
      });
      const mockResponse = createApiResponse(createdSystem);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createSystem('test-project-id', createDto);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/test-project-id/systems`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createDto),
        }
      );
      expect(result.id).toBe('new-system-id');
      expect(result.name).toBe('New System');
    });

    it('should create system with minimal data (name and category only)', async () => {
      const createDto: CreateSystemDto = {
        name: 'Minimal System',
        category: 'core',
      };

      const createdSystem = createMockSystem({
        id: 'minimal-system-id',
        name: 'Minimal System',
        category: 'core',
        tags: [],
        content: '',
        dependencies: [],
      });
      const mockResponse = createApiResponse(createdSystem);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createSystem('test-project-id', createDto);

      expect(result.name).toBe('Minimal System');
      expect(result.category).toBe('core');
    });

    it('should throw error when project not found', async () => {
      const createDto: CreateSystemDto = {
        name: 'New System',
        category: 'economy',
      };

      const mockResponse = createApiResponse<SystemDocument | null>(null, false, 'Project not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createSystem('non-existent-project', createDto)).rejects.toThrow('Project not found');
    });

    it('should throw error when fetch fails', async () => {
      const createDto: CreateSystemDto = {
        name: 'New System',
        category: 'economy',
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createSystem('test-project-id', createDto)).rejects.toThrow('Network error');
    });
  });

  describe('updateSystem', () => {
    it('should update system successfully', async () => {
      const updateDto: UpdateSystemDto = {
        name: 'Updated Name',
        content: '# Updated Content\n\nNew content here.',
      };

      const updatedSystem = createMockSystem({
        id: 'system-1',
        name: 'Updated Name',
        content: '# Updated Content\n\nNew content here.',
        updatedAt: '2025-01-02T00:00:00.000Z',
      });
      const mockResponse = createApiResponse(updatedSystem);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateSystem('system-1', updateDto);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/systems/system-1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDto),
      });
      expect(result.name).toBe('Updated Name');
      expect(result.content).toBe('# Updated Content\n\nNew content here.');
    });

    it('should update system tags', async () => {
      const updateDto: UpdateSystemDto = {
        tags: ['tag1', 'tag2', 'tag3'],
      };

      const updatedSystem = createMockSystem({
        id: 'system-1',
        tags: ['tag1', 'tag2', 'tag3'],
      });
      const mockResponse = createApiResponse(updatedSystem);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateSystem('system-1', updateDto);

      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should throw error when system not found', async () => {
      const updateDto: UpdateSystemDto = { name: 'Updated' };
      const mockResponse = createApiResponse<SystemDocument | null>(null, false, 'System not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(updateSystem('non-existent-id', updateDto)).rejects.toThrow('System not found');
    });

    it('should throw error when fetch fails', async () => {
      const updateDto: UpdateSystemDto = { name: 'Updated' };
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(updateSystem('system-1', updateDto)).rejects.toThrow('Network error');
    });
  });

  describe('deleteSystem', () => {
    it('should delete system successfully', async () => {
      const mockResponse = createApiResponse({ deleted: true });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await deleteSystem('system-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/systems/system-1`, {
        method: 'DELETE',
      });
    });

    it('should throw error when system not found', async () => {
      const mockResponse = createApiResponse<{ deleted: boolean } | null>(
        null,
        false,
        'System not found'
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(deleteSystem('non-existent-id')).rejects.toThrow('System not found');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteSystem('system-1')).rejects.toThrow('Network error');
    });

    it('should throw error when response is not ok', async () => {
>>>>>>> main
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

<<<<<<< HEAD
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
=======
      await expect(deleteSystem('system-1')).rejects.toThrow();
>>>>>>> main
    });
  });
});
