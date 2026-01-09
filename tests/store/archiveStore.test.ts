/**
 * Archive Store Tests
 * TDD test suite for Zustand archive store
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { Archive, Task } from '../../src/types';
import { useArchiveStore } from '../../src/store/archiveStore';
import * as archiveService from '../../src/services/archiveService';

// Mock archiveService
vi.mock('../../src/services/archiveService');

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

describe('archiveStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useArchiveStore.setState({
      archives: [],
      selectedArchiveId: null,
      isLoading: false,
      error: null,
      searchQuery: '',
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchArchives', () => {
    it('should fetch and store archives', async () => {
      vi.mocked(archiveService.getArchives).mockResolvedValue([mockArchive]);

      await act(async () => {
        await useArchiveStore.getState().fetchArchives(mockProjectId);
      });

      const state = useArchiveStore.getState();
      expect(state.archives).toHaveLength(1);
      expect(state.archives[0].id).toBe(mockArchiveId);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: Archive[]) => void;
      const pendingPromise = new Promise<Archive[]>((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(archiveService.getArchives).mockReturnValue(pendingPromise);

      act(() => {
        useArchiveStore.getState().fetchArchives(mockProjectId);
      });

      // Check loading state is true during fetch
      expect(useArchiveStore.getState().isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!([mockArchive]);
        await pendingPromise;
      });

      expect(useArchiveStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      vi.mocked(archiveService.getArchives).mockRejectedValue(
        new Error('Network error')
      );

      await act(async () => {
        await useArchiveStore.getState().fetchArchives(mockProjectId);
      });

      const state = useArchiveStore.getState();
      expect(state.archives).toHaveLength(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('archiveTask', () => {
    it('should archive a task and add to archives', async () => {
      vi.mocked(archiveService.archiveTask).mockResolvedValue(mockArchive);

      await act(async () => {
        await useArchiveStore.getState().archiveTask(mockProjectId, mockTaskId);
      });

      const state = useArchiveStore.getState();
      expect(state.archives).toHaveLength(1);
      expect(state.archives[0].id).toBe(mockArchiveId);
      expect(state.error).toBeNull();
    });

    it('should handle archive error', async () => {
      vi.mocked(archiveService.archiveTask).mockRejectedValue(
        new Error('Only prototype tasks can be archived')
      );

      await act(async () => {
        await useArchiveStore.getState().archiveTask(mockProjectId, mockTaskId);
      });

      const state = useArchiveStore.getState();
      expect(state.archives).toHaveLength(0);
      expect(state.error).toBe('Only prototype tasks can be archived');
    });
  });

  describe('restoreArchive', () => {
    it('should restore archive and remove from archives', async () => {
      // Setup initial state with archive
      useArchiveStore.setState({ archives: [mockArchive] });

      vi.mocked(archiveService.restoreArchive).mockResolvedValue(mockTask);

      await act(async () => {
        await useArchiveStore.getState().restoreArchive(mockProjectId, mockArchiveId);
      });

      const state = useArchiveStore.getState();
      expect(state.archives).toHaveLength(0);
      expect(state.error).toBeNull();
    });

    it('should handle restore error', async () => {
      useArchiveStore.setState({ archives: [mockArchive] });

      vi.mocked(archiveService.restoreArchive).mockRejectedValue(
        new Error('Archive not found')
      );

      await act(async () => {
        await useArchiveStore.getState().restoreArchive(mockProjectId, mockArchiveId);
      });

      const state = useArchiveStore.getState();
      // Archive should remain since restore failed
      expect(state.archives).toHaveLength(1);
      expect(state.error).toBe('Archive not found');
    });
  });

  describe('deleteArchive', () => {
    it('should delete archive and remove from list', async () => {
      useArchiveStore.setState({ archives: [mockArchive] });

      vi.mocked(archiveService.deleteArchive).mockResolvedValue(undefined);

      await act(async () => {
        await useArchiveStore.getState().deleteArchive(mockProjectId, mockArchiveId);
      });

      const state = useArchiveStore.getState();
      expect(state.archives).toHaveLength(0);
      expect(state.error).toBeNull();
    });

    it('should handle delete error and rollback', async () => {
      useArchiveStore.setState({ archives: [mockArchive] });

      vi.mocked(archiveService.deleteArchive).mockRejectedValue(
        new Error('Delete failed')
      );

      await act(async () => {
        await useArchiveStore.getState().deleteArchive(mockProjectId, mockArchiveId);
      });

      const state = useArchiveStore.getState();
      // Archive should be restored after rollback
      expect(state.archives).toHaveLength(1);
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('selectArchive', () => {
    it('should select an archive', () => {
      act(() => {
        useArchiveStore.getState().selectArchive(mockArchiveId);
      });

      expect(useArchiveStore.getState().selectedArchiveId).toBe(mockArchiveId);
    });

    it('should deselect when passing null', () => {
      useArchiveStore.setState({ selectedArchiveId: mockArchiveId });

      act(() => {
        useArchiveStore.getState().selectArchive(null);
      });

      expect(useArchiveStore.getState().selectedArchiveId).toBeNull();
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      act(() => {
        useArchiveStore.getState().setSearchQuery('test query');
      });

      expect(useArchiveStore.getState().searchQuery).toBe('test query');
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useArchiveStore.setState({ error: 'Some error' });

      act(() => {
        useArchiveStore.getState().clearError();
      });

      expect(useArchiveStore.getState().error).toBeNull();
    });
  });

  describe('getFilteredArchives', () => {
    it('should filter archives by search query', () => {
      const archive1: Archive = {
        ...mockArchive,
        id: 'archive-1',
        task: { ...mockTask, title: 'User Authentication' },
      };
      const archive2: Archive = {
        ...mockArchive,
        id: 'archive-2',
        task: { ...mockTask, title: 'Payment System' },
      };
      const archive3: Archive = {
        ...mockArchive,
        id: 'archive-3',
        task: { ...mockTask, title: 'User Profile' },
      };

      useArchiveStore.setState({
        archives: [archive1, archive2, archive3],
        searchQuery: 'User',
      });

      const filtered = useArchiveStore.getState().getFilteredArchives();

      expect(filtered).toHaveLength(2);
      expect(filtered.map((a) => a.id)).toContain('archive-1');
      expect(filtered.map((a) => a.id)).toContain('archive-3');
    });

    it('should return all archives when search query is empty', () => {
      useArchiveStore.setState({
        archives: [mockArchive],
        searchQuery: '',
      });

      const filtered = useArchiveStore.getState().getFilteredArchives();

      expect(filtered).toHaveLength(1);
    });

    it('should be case-insensitive', () => {
      const archive: Archive = {
        ...mockArchive,
        task: { ...mockTask, title: 'User Authentication' },
      };

      useArchiveStore.setState({
        archives: [archive],
        searchQuery: 'user',
      });

      const filtered = useArchiveStore.getState().getFilteredArchives();

      expect(filtered).toHaveLength(1);
    });
  });
});
