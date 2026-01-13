/**
 * System Store Tests
<<<<<<< HEAD
 * TDD test suite for Zustand system document state management
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { SystemDocument } from '../../src/types/index.ts';

// Mock the service
vi.mock('../../src/services/systemDocService.ts', () => ({
  getSystemDocuments: vi.fn(),
  getSystemDocument: vi.fn(),
  createSystemDocument: vi.fn(),
  updateSystemDocument: vi.fn(),
  deleteSystemDocument: vi.fn(),
  getCategories: vi.fn(),
  getTags: vi.fn(),
}));

// Import store and mocked service
import { useSystemStore, selectFilteredDocuments } from '../../src/store/systemStore.ts';
import * as systemDocService from '../../src/services/systemDocService.ts';

describe('systemStore', () => {
  const mockProjectId = 'test-project-123';

  const mockSystemDocument: SystemDocument = {
    id: 'system-1',
    projectId: mockProjectId,
    name: 'Combat System',
    category: 'Core Mechanics',
    tags: ['combat', 'action'],
    content: '# Combat System\n\nDescription here...',
    dependencies: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockSystemDocument2: SystemDocument = {
    id: 'system-2',
    projectId: mockProjectId,
    name: 'UI System',
    category: 'Interface',
    tags: ['ui', 'display'],
    content: '# UI System',
    dependencies: [],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  };

  beforeEach(() => {
    // Reset store to initial state
    useSystemStore.setState({
      documents: [],
      selectedDocumentIds: [],
      selectedCategory: null,
      selectedTags: [],
      searchQuery: '',
      isLoading: false,
      error: null,
      categories: [],
      allTags: [],
    });
    vi.clearAllMocks();
=======
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
>>>>>>> main
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
<<<<<<< HEAD
      const { result } = renderHook(() => useSystemStore());

      expect(result.current.documents).toEqual([]);
      expect(result.current.selectedDocumentIds).toEqual([]);
      expect(result.current.selectedCategory).toBeNull();
      expect(result.current.selectedTags).toEqual([]);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.categories).toEqual([]);
      expect(result.current.allTags).toEqual([]);
    });
  });

  describe('fetchDocuments', () => {
    it('should fetch documents and update state', async () => {
      const mockDocuments = [mockSystemDocument, mockSystemDocument2];
      vi.mocked(systemDocService.getSystemDocuments).mockResolvedValueOnce(mockDocuments);
      vi.mocked(systemDocService.getCategories).mockResolvedValueOnce(['Core Mechanics', 'Interface']);
      vi.mocked(systemDocService.getTags).mockResolvedValueOnce(['action', 'combat', 'display', 'ui']);

      const { result } = renderHook(() => useSystemStore());

      await act(async () => {
        await result.current.fetchDocuments(mockProjectId);
      });

      // Documents are sorted by createdAt descending (newest first)
      expect(result.current.documents).toHaveLength(2);
      expect(result.current.documents[0].id).toBe(mockSystemDocument2.id); // Newer
      expect(result.current.documents[1].id).toBe(mockSystemDocument.id); // Older
      expect(result.current.categories).toEqual(['Core Mechanics', 'Interface']);
      expect(result.current.allTags).toEqual(['action', 'combat', 'display', 'ui']);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      vi.mocked(systemDocService.getSystemDocuments).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      );
      vi.mocked(systemDocService.getCategories).mockResolvedValueOnce([]);
      vi.mocked(systemDocService.getTags).mockResolvedValueOnce([]);

      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.fetchDocuments(mockProjectId);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set error state on fetch failure', async () => {
      vi.mocked(systemDocService.getSystemDocuments).mockRejectedValueOnce(new Error('Fetch failed'));

      const { result } = renderHook(() => useSystemStore());

      await act(async () => {
        await result.current.fetchDocuments(mockProjectId);
      });

      expect(result.current.error).toBe('Fetch failed');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('createDocument', () => {
    it('should create document and add to state', async () => {
      const createData = { name: 'New System', category: 'Core' };
      const createdDoc = { ...mockSystemDocument, ...createData, id: 'new-system-id' };
      vi.mocked(systemDocService.createSystemDocument).mockResolvedValueOnce(createdDoc);

      const { result } = renderHook(() => useSystemStore());

      await act(async () => {
        await result.current.createDocument(mockProjectId, createData);
      });

      expect(result.current.documents).toContainEqual(createdDoc);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state on create failure', async () => {
      vi.mocked(systemDocService.createSystemDocument).mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useSystemStore());

      await act(async () => {
        await result.current.createDocument(mockProjectId, { name: 'Test', category: 'Core' });
      });

      expect(result.current.error).toBe('Create failed');
    });
  });

  describe('updateDocument', () => {
    it('should update document in state', async () => {
      // Set initial state with a document
      useSystemStore.setState({ documents: [mockSystemDocument] });

      const updateData = { name: 'Updated Name' };
      const updatedDoc = { ...mockSystemDocument, ...updateData };
      vi.mocked(systemDocService.updateSystemDocument).mockResolvedValueOnce(updatedDoc);

      const { result } = renderHook(() => useSystemStore());

      await act(async () => {
        await result.current.updateDocument(mockProjectId, mockSystemDocument.id, updateData);
      });

      expect(result.current.documents[0].name).toBe('Updated Name');
    });
  });

  describe('deleteDocument', () => {
    it('should remove document from state', async () => {
      // Set initial state with documents
      useSystemStore.setState({ documents: [mockSystemDocument, mockSystemDocument2] });
      vi.mocked(systemDocService.deleteSystemDocument).mockResolvedValueOnce();

      const { result } = renderHook(() => useSystemStore());

      await act(async () => {
        await result.current.deleteDocument(mockProjectId, mockSystemDocument.id);
      });

      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0].id).toBe(mockSystemDocument2.id);
    });

    it('should clear selectedDocumentIds if deleted document was selected', async () => {
      useSystemStore.setState({
        documents: [mockSystemDocument],
        selectedDocumentIds: [mockSystemDocument.id],
      });
      vi.mocked(systemDocService.deleteSystemDocument).mockResolvedValueOnce();

      const { result } = renderHook(() => useSystemStore());

      await act(async () => {
        await result.current.deleteDocument(mockProjectId, mockSystemDocument.id);
      });

      expect(result.current.selectedDocumentIds).not.toContain(mockSystemDocument.id);
    });
  });

  describe('setSelectedCategory', () => {
    it('should set selected category', () => {
      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.setSelectedCategory('Core Mechanics');
      });

      expect(result.current.selectedCategory).toBe('Core Mechanics');
    });

    it('should clear selected category when null is passed', () => {
      useSystemStore.setState({ selectedCategory: 'Core' });

      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.setSelectedCategory(null);
      });

      expect(result.current.selectedCategory).toBeNull();
    });
  });

  describe('toggleTag', () => {
    it('should add tag when not selected', () => {
      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.toggleTag('combat');
      });

      expect(result.current.selectedTags).toContain('combat');
    });

    it('should remove tag when already selected', () => {
      useSystemStore.setState({ selectedTags: ['combat', 'action'] });

      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.toggleTag('combat');
      });

      expect(result.current.selectedTags).not.toContain('combat');
      expect(result.current.selectedTags).toContain('action');
    });
  });

  describe('setSearchQuery', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.setSearchQuery('combat');
      });

      expect(result.current.searchQuery).toBe('combat');
    });
  });

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      useSystemStore.setState({
        selectedCategory: 'Core',
        selectedTags: ['combat'],
        searchQuery: 'test',
      });

      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.selectedCategory).toBeNull();
      expect(result.current.selectedTags).toEqual([]);
      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('selectFilteredDocuments (direct selector usage)', () => {
    beforeEach(() => {
      useSystemStore.setState({
        documents: [mockSystemDocument, mockSystemDocument2],
      });
    });

    it('should return all documents when no filters are applied', () => {
      const state = useSystemStore.getState();
      const filtered = selectFilteredDocuments(state);
=======
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
>>>>>>> main

      expect(filtered).toHaveLength(2);
    });

    it('should filter by category', () => {
<<<<<<< HEAD
      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.setSelectedCategory('Core Mechanics');
      });

      const state = useSystemStore.getState();
      const filtered = selectFilteredDocuments(state);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].category).toBe('Core Mechanics');
    });

    it('should filter by tags (AND logic)', () => {
      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.toggleTag('combat');
      });

      const state = useSystemStore.getState();
      const filtered = selectFilteredDocuments(state);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(mockSystemDocument.id);
    });

    it('should filter by search query (name)', () => {
      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.setSearchQuery('Combat');
      });

      const state = useSystemStore.getState();
      const filtered = selectFilteredDocuments(state);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toContain('Combat');
    });

    it('should filter by search query (content)', () => {
      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.setSearchQuery('Description');
      });

      const state = useSystemStore.getState();
      const filtered = selectFilteredDocuments(state);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].content).toContain('Description');
    });

    it('should combine multiple filters', () => {
      // Add another document with same category but different tags
      const anotherDoc: SystemDocument = {
        ...mockSystemDocument,
        id: 'system-3',
        name: 'Economy System',
        category: 'Core Mechanics',
        tags: ['economy'],
      };
      useSystemStore.setState({
        documents: [mockSystemDocument, mockSystemDocument2, anotherDoc],
      });

      const { result } = renderHook(() => useSystemStore());

      act(() => {
        result.current.setSelectedCategory('Core Mechanics');
        result.current.toggleTag('combat');
      });

      const state = useSystemStore.getState();
      const filtered = selectFilteredDocuments(state);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(mockSystemDocument.id);
=======
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
>>>>>>> main
    });
  });
});
