/**
 * Archive Service Tests
 * TDD: RED Phase - Write failing tests first
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Archive, Task } from '../../types';
import {
  getArchives,
  getArchive,
  archiveTask,
  restoreArchive,
  deleteArchive,
  API_BASE_URL,
} from '../archiveService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test data
const mockProjectId = 'test-project-123';
const mockTaskId = 'test-task-456';
const mockArchiveId = 'test-archive-789';

const mockTask: Task = {
  id: mockTaskId,
  projectId: mockProjectId,
  title: 'Test Task',
  status: 'prototype',
  featureList: 'Feature list content',
  designDocument: 'Design document content',
  prd: 'PRD content',
  prototype: 'Prototype content',
  references: ['ref-1', 'ref-2'],
  qaAnswers: [],
  revisions: [],
  isArchived: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockArchive: Archive = {
  id: mockArchiveId,
  taskId: mockTaskId,
  projectId: mockProjectId,
  task: { ...mockTask, isArchived: true },
  archivedAt: '2024-01-02T00:00:00.000Z',
};

describe('archiveService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getArchives', () => {
    it('should fetch archives for a project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [mockArchive],
            error: null,
          }),
      });

      const result = await getArchives(mockProjectId);

      expect(result).toEqual([mockArchive]);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${mockProjectId}/archives`
      );
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getArchives(mockProjectId)).rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw error when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            data: null,
            error: 'Project not found',
          }),
      });

      await expect(getArchives(mockProjectId)).rejects.toThrow('Project not found');
    });
  });

  describe('getArchive', () => {
    it('should fetch a single archive', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockArchive,
            error: null,
          }),
      });

      const result = await getArchive(mockProjectId, mockArchiveId);

      expect(result).toEqual(mockArchive);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${mockProjectId}/archives/${mockArchiveId}`
      );
    });

    it('should throw error when archive not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            data: null,
            error: 'Archive not found',
          }),
      });

      await expect(getArchive(mockProjectId, mockArchiveId)).rejects.toThrow(
        'Archive not found'
      );
    });
  });

  describe('archiveTask', () => {
    it('should archive a task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockArchive,
            error: null,
          }),
      });

      const result = await archiveTask(mockProjectId, mockTaskId);

      expect(result).toEqual(mockArchive);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${mockProjectId}/tasks/${mockTaskId}/archive`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should throw error when task is not prototype', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            data: null,
            error: 'Only prototype tasks can be archived',
          }),
      });

      await expect(archiveTask(mockProjectId, mockTaskId)).rejects.toThrow(
        'Only prototype tasks can be archived'
      );
    });
  });

  describe('restoreArchive', () => {
    it('should restore an archive', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockTask,
            error: null,
          }),
      });

      const result = await restoreArchive(mockProjectId, mockArchiveId);

      expect(result).toEqual(mockTask);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${mockProjectId}/archives/${mockArchiveId}/restore`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should throw error when archive not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            data: null,
            error: 'Archive not found',
          }),
      });

      await expect(restoreArchive(mockProjectId, mockArchiveId)).rejects.toThrow(
        'Archive not found'
      );
    });
  });

  describe('deleteArchive', () => {
    it('should delete an archive', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { deleted: true },
            error: null,
          }),
      });

      await deleteArchive(mockProjectId, mockArchiveId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${mockProjectId}/archives/${mockArchiveId}`,
        {
          method: 'DELETE',
        }
      );
    });

    it('should throw error when archive not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            data: null,
            error: 'Archive not found',
          }),
      });

      await expect(deleteArchive(mockProjectId, mockArchiveId)).rejects.toThrow(
        'Archive not found'
      );
    });
  });
});
