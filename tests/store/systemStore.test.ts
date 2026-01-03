/**
 * System Store Tests
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
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
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

      expect(filtered).toHaveLength(2);
    });

    it('should filter by category', () => {
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
    });
  });
});
