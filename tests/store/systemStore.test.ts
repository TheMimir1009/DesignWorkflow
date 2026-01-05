/**
 * System Store Tests
 * TDD test suite for System Document Zustand state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { SystemDocument } from '../../src/types';

// Mock the systemDocService module
vi.mock('../../src/services/systemDocService', () => ({
  getSystems: vi.fn(),
  getSystem: vi.fn(),
  createSystem: vi.fn(),
  updateSystem: vi.fn(),
  deleteSystem: vi.fn(),
}));

// Import after mocking
import * as systemDocService from '../../src/services/systemDocService';
import { useSystemStore } from '../../src/store/systemStore';

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

describe('systemStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    useSystemStore.setState({
      systems: [],
      selectedSystemIds: [],
      categoryFilter: null,
      tagFilter: [],
      searchQuery: '',
      isLoading: false,
      error: null,
      // Modal state
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteConfirmOpen: false,
      selectedSystem: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useSystemStore.getState();

      expect(state.systems).toEqual([]);
      expect(state.selectedSystemIds).toEqual([]);
      expect(state.categoryFilter).toBeNull();
      expect(state.tagFilter).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchSystems', () => {
    it('should fetch and set systems successfully', async () => {
      const mockSystems = [
        createMockSystem({ id: 'system-1', name: 'System 1' }),
        createMockSystem({ id: 'system-2', name: 'System 2' }),
      ];
      vi.mocked(systemDocService.getSystems).mockResolvedValueOnce(mockSystems);

      await act(async () => {
        await useSystemStore.getState().fetchSystems('test-project-id');
      });

      const state = useSystemStore.getState();
      expect(state.systems).toEqual(mockSystems);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      vi.mocked(systemDocService.getSystems).mockImplementation(() => {
        expect(useSystemStore.getState().isLoading).toBe(true);
        return Promise.resolve([]);
      });

      await act(async () => {
        await useSystemStore.getState().fetchSystems('test-project-id');
      });

      expect(useSystemStore.getState().isLoading).toBe(false);
    });

    it('should set error state when fetch fails', async () => {
      vi.mocked(systemDocService.getSystems).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useSystemStore.getState().fetchSystems('test-project-id');
      });

      const state = useSystemStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error on successful fetch', async () => {
      useSystemStore.setState({ error: 'Previous error' });
      vi.mocked(systemDocService.getSystems).mockResolvedValueOnce([]);

      await act(async () => {
        await useSystemStore.getState().fetchSystems('test-project-id');
      });

      expect(useSystemStore.getState().error).toBeNull();
    });
  });

  describe('createSystem', () => {
    it('should create a new system successfully', async () => {
      const newSystem = createMockSystem({
        id: 'new-system-id',
        projectId: 'test-project-id',
        name: 'New System',
      });
      vi.mocked(systemDocService.createSystem).mockResolvedValueOnce(newSystem);

      await act(async () => {
        await useSystemStore.getState().createSystem('test-project-id', {
          name: 'New System',
          category: 'game-mechanic',
        });
      });

      const state = useSystemStore.getState();
      expect(state.systems).toContainEqual(newSystem);
      expect(state.error).toBeNull();
    });

    it('should add system to existing systems', async () => {
      const existingSystem = createMockSystem({ id: 'existing-system', name: 'Existing' });
      useSystemStore.setState({ systems: [existingSystem] });

      const newSystem = createMockSystem({ id: 'new-system', name: 'New System' });
      vi.mocked(systemDocService.createSystem).mockResolvedValueOnce(newSystem);

      await act(async () => {
        await useSystemStore.getState().createSystem('test-project-id', {
          name: 'New System',
          category: 'game-mechanic',
        });
      });

      const state = useSystemStore.getState();
      expect(state.systems).toHaveLength(2);
      expect(state.systems).toContainEqual(existingSystem);
      expect(state.systems).toContainEqual(newSystem);
    });

    it('should set error when create fails', async () => {
      vi.mocked(systemDocService.createSystem).mockRejectedValueOnce(new Error('Create failed'));

      await act(async () => {
        await useSystemStore.getState().createSystem('test-project-id', {
          name: 'New System',
          category: 'game-mechanic',
        });
      });

      const state = useSystemStore.getState();
      expect(state.error).toBe('Create failed');
    });
  });

  describe('updateSystem', () => {
    it('should update system successfully', async () => {
      const mockSystem = createMockSystem({ id: 'system-1', name: 'Original Name' });
      useSystemStore.setState({ systems: [mockSystem] });

      const updatedSystem = createMockSystem({
        id: 'system-1',
        name: 'Updated Name',
        content: 'Updated content',
      });
      vi.mocked(systemDocService.updateSystem).mockResolvedValueOnce(updatedSystem);

      await act(async () => {
        await useSystemStore.getState().updateSystem('system-1', {
          name: 'Updated Name',
          content: 'Updated content',
        });
      });

      const state = useSystemStore.getState();
      expect(state.systems[0].name).toBe('Updated Name');
      expect(state.systems[0].content).toBe('Updated content');
    });

    it('should set error when update fails', async () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ systems: [mockSystem] });

      vi.mocked(systemDocService.updateSystem).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        await useSystemStore.getState().updateSystem('system-1', { name: 'New Name' });
      });

      const state = useSystemStore.getState();
      expect(state.error).toBe('Update failed');
    });
  });

  describe('deleteSystem', () => {
    it('should delete system successfully', async () => {
      const system1 = createMockSystem({ id: 'system-1', name: 'System 1' });
      const system2 = createMockSystem({ id: 'system-2', name: 'System 2' });
      useSystemStore.setState({ systems: [system1, system2] });

      vi.mocked(systemDocService.deleteSystem).mockResolvedValueOnce();

      await act(async () => {
        await useSystemStore.getState().deleteSystem('system-1');
      });

      const state = useSystemStore.getState();
      expect(state.systems).toHaveLength(1);
      expect(state.systems[0].id).toBe('system-2');
    });

    it('should perform optimistic delete', async () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ systems: [mockSystem] });

      let systemsAfterOptimistic: SystemDocument[] = [];
      vi.mocked(systemDocService.deleteSystem).mockImplementation(async () => {
        systemsAfterOptimistic = useSystemStore.getState().systems;
      });

      await act(async () => {
        await useSystemStore.getState().deleteSystem('system-1');
      });

      // System should be removed immediately (optimistic update)
      expect(systemsAfterOptimistic).toHaveLength(0);
    });

    it('should rollback on delete failure', async () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ systems: [mockSystem] });

      vi.mocked(systemDocService.deleteSystem).mockRejectedValueOnce(new Error('Delete failed'));

      await act(async () => {
        await useSystemStore.getState().deleteSystem('system-1');
      });

      const state = useSystemStore.getState();
      // System should be restored after failure
      expect(state.systems).toHaveLength(1);
      expect(state.systems[0].id).toBe('system-1');
      expect(state.error).toBe('Delete failed');
    });
  });

  describe('selection actions', () => {
    it('should toggle system selection', () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ systems: [mockSystem] });

      act(() => {
        useSystemStore.getState().toggleSelect('system-1');
      });

      expect(useSystemStore.getState().selectedSystemIds).toContain('system-1');

      act(() => {
        useSystemStore.getState().toggleSelect('system-1');
      });

      expect(useSystemStore.getState().selectedSystemIds).not.toContain('system-1');
    });

    it('should select all systems', () => {
      const systems = [
        createMockSystem({ id: 'system-1' }),
        createMockSystem({ id: 'system-2' }),
        createMockSystem({ id: 'system-3' }),
      ];
      useSystemStore.setState({ systems });

      act(() => {
        useSystemStore.getState().selectAll();
      });

      const state = useSystemStore.getState();
      expect(state.selectedSystemIds).toHaveLength(3);
      expect(state.selectedSystemIds).toContain('system-1');
      expect(state.selectedSystemIds).toContain('system-2');
      expect(state.selectedSystemIds).toContain('system-3');
    });

    it('should clear all selections', () => {
      useSystemStore.setState({ selectedSystemIds: ['system-1', 'system-2'] });

      act(() => {
        useSystemStore.getState().clearSelection();
      });

      expect(useSystemStore.getState().selectedSystemIds).toEqual([]);
    });
  });

  describe('filter actions', () => {
    it('should set category filter', () => {
      act(() => {
        useSystemStore.getState().setCategoryFilter('economy');
      });

      expect(useSystemStore.getState().categoryFilter).toBe('economy');
    });

    it('should clear category filter', () => {
      useSystemStore.setState({ categoryFilter: 'economy' });

      act(() => {
        useSystemStore.getState().setCategoryFilter(null);
      });

      expect(useSystemStore.getState().categoryFilter).toBeNull();
    });

    it('should set tag filter', () => {
      act(() => {
        useSystemStore.getState().setTagFilter(['tag1', 'tag2']);
      });

      expect(useSystemStore.getState().tagFilter).toEqual(['tag1', 'tag2']);
    });

    it('should set search query', () => {
      act(() => {
        useSystemStore.getState().setSearchQuery('test query');
      });

      expect(useSystemStore.getState().searchQuery).toBe('test query');
    });
  });

  describe('getFilteredSystems', () => {
    it('should return all systems when no filters applied', () => {
      const systems = [
        createMockSystem({ id: 'system-1', name: 'System 1' }),
        createMockSystem({ id: 'system-2', name: 'System 2' }),
      ];
      useSystemStore.setState({ systems });

      const filtered = useSystemStore.getState().getFilteredSystems();

      expect(filtered).toHaveLength(2);
    });

    it('should filter by category', () => {
      const systems = [
        createMockSystem({ id: 'system-1', category: 'economy' }),
        createMockSystem({ id: 'system-2', category: 'game-mechanic' }),
        createMockSystem({ id: 'system-3', category: 'economy' }),
      ];
      useSystemStore.setState({ systems, categoryFilter: 'economy' });

      const filtered = useSystemStore.getState().getFilteredSystems();

      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.category === 'economy')).toBe(true);
    });

    it('should filter by tags', () => {
      const systems = [
        createMockSystem({ id: 'system-1', tags: ['tag1', 'tag2'] }),
        createMockSystem({ id: 'system-2', tags: ['tag2', 'tag3'] }),
        createMockSystem({ id: 'system-3', tags: ['tag4'] }),
      ];
      useSystemStore.setState({ systems, tagFilter: ['tag2'] });

      const filtered = useSystemStore.getState().getFilteredSystems();

      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.tags.includes('tag2'))).toBe(true);
    });

    it('should filter by search query', () => {
      const systems = [
        createMockSystem({ id: 'system-1', name: 'Economy System' }),
        createMockSystem({ id: 'system-2', name: 'Combat System' }),
        createMockSystem({ id: 'system-3', name: 'Economy Rules' }),
      ];
      useSystemStore.setState({ systems, searchQuery: 'economy' });

      const filtered = useSystemStore.getState().getFilteredSystems();

      expect(filtered).toHaveLength(2);
      expect(filtered.every(s => s.name.toLowerCase().includes('economy'))).toBe(true);
    });

    it('should apply multiple filters', () => {
      const systems = [
        createMockSystem({ id: 'system-1', name: 'Economy Base', category: 'economy', tags: ['core'] }),
        createMockSystem({ id: 'system-2', name: 'Economy Extra', category: 'economy', tags: ['extra'] }),
        createMockSystem({ id: 'system-3', name: 'Combat Base', category: 'combat', tags: ['core'] }),
      ];
      useSystemStore.setState({ systems, categoryFilter: 'economy', tagFilter: ['core'] });

      const filtered = useSystemStore.getState().getFilteredSystems();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('system-1');
    });
  });

  describe('getSystemsByCategory', () => {
    it('should group systems by category', () => {
      const systems = [
        createMockSystem({ id: 'system-1', category: 'economy' }),
        createMockSystem({ id: 'system-2', category: 'combat' }),
        createMockSystem({ id: 'system-3', category: 'economy' }),
      ];
      useSystemStore.setState({ systems });

      const grouped = useSystemStore.getState().getSystemsByCategory();

      expect(grouped['economy']).toHaveLength(2);
      expect(grouped['combat']).toHaveLength(1);
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      useSystemStore.setState({ error: 'Some error' });

      act(() => {
        useSystemStore.getState().clearError();
      });

      expect(useSystemStore.getState().error).toBeNull();
    });
  });

  describe('modal state management', () => {
    it('should have initial modal state closed', () => {
      const state = useSystemStore.getState();

      expect(state.isCreateModalOpen).toBe(false);
      expect(state.isEditModalOpen).toBe(false);
      expect(state.isDeleteConfirmOpen).toBe(false);
      expect(state.selectedSystem).toBeNull();
    });

    it('should open create modal', () => {
      act(() => {
        useSystemStore.getState().openCreateModal();
      });

      const state = useSystemStore.getState();
      expect(state.isCreateModalOpen).toBe(true);
    });

    it('should close create modal', () => {
      useSystemStore.setState({ isCreateModalOpen: true });

      act(() => {
        useSystemStore.getState().closeCreateModal();
      });

      const state = useSystemStore.getState();
      expect(state.isCreateModalOpen).toBe(false);
    });

    it('should open edit modal with selected system', () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ systems: [mockSystem] });

      act(() => {
        useSystemStore.getState().openEditModal(mockSystem);
      });

      const state = useSystemStore.getState();
      expect(state.isEditModalOpen).toBe(true);
      expect(state.selectedSystem).toEqual(mockSystem);
    });

    it('should close edit modal and clear selected system', () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ isEditModalOpen: true, selectedSystem: mockSystem });

      act(() => {
        useSystemStore.getState().closeEditModal();
      });

      const state = useSystemStore.getState();
      expect(state.isEditModalOpen).toBe(false);
      expect(state.selectedSystem).toBeNull();
    });

    it('should open delete confirm with selected system', () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ systems: [mockSystem] });

      act(() => {
        useSystemStore.getState().openDeleteConfirm(mockSystem);
      });

      const state = useSystemStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(true);
      expect(state.selectedSystem).toEqual(mockSystem);
    });

    it('should close delete confirm and clear selected system', () => {
      const mockSystem = createMockSystem({ id: 'system-1' });
      useSystemStore.setState({ isDeleteConfirmOpen: true, selectedSystem: mockSystem });

      act(() => {
        useSystemStore.getState().closeDeleteConfirm();
      });

      const state = useSystemStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(false);
      expect(state.selectedSystem).toBeNull();
    });
  });
});
