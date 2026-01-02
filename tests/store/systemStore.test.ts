/**
 * System Store Tests
 * TDD test suite for Zustand system document state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { SystemDocument } from '../../src/types/index.ts';

// Mock the systemDocService
vi.mock('../../src/services/systemDocService.ts', () => ({
  getSystemDocuments: vi.fn(),
  createSystemDocument: vi.fn(),
  updateSystemDocument: vi.fn(),
  deleteSystemDocument: vi.fn(),
  getCategories: vi.fn(),
  getTags: vi.fn(),
  searchSystemDocuments: vi.fn(),
}));

// Import after mocking
import { useSystemStore } from '../../src/store/systemStore.ts';
import * as systemDocService from '../../src/services/systemDocService.ts';

describe('System Store', () => {
  const projectId = 'test-project-id';

  const mockDocuments: SystemDocument[] = [
    {
      id: 'doc-1',
      projectId,
      name: 'Character System',
      category: 'System',
      tags: ['core', 'player'],
      content: '# Character System',
      dependencies: [],
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
    },
    {
      id: 'doc-2',
      projectId,
      name: 'Economy Rules',
      category: 'Economy',
      tags: ['economy', 'core'],
      content: '# Economy Rules',
      dependencies: ['doc-1'],
      createdAt: '2026-01-02T11:00:00.000Z',
      updatedAt: '2026-01-02T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    // Reset store state
    useSystemStore.setState({
      documents: [],
      selectedDocumentIds: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedTags: [],
      selectedCategory: null,
      expandedCategories: [],
      previewDocumentId: null,
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useSystemStore.getState();

      expect(state.documents).toEqual([]);
      expect(state.selectedDocumentIds).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.searchQuery).toBe('');
      expect(state.selectedTags).toEqual([]);
      expect(state.selectedCategory).toBeNull();
      expect(state.expandedCategories).toEqual([]);
      expect(state.previewDocumentId).toBeNull();
    });
  });

  describe('fetchDocuments', () => {
    it('should fetch documents and update state', async () => {
      vi.mocked(systemDocService.getSystemDocuments).mockResolvedValueOnce(mockDocuments);

      await act(async () => {
        await useSystemStore.getState().fetchDocuments(projectId);
      });

      const state = useSystemStore.getState();
      expect(state.documents).toEqual(mockDocuments);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (docs: SystemDocument[]) => void;
      const fetchPromise = new Promise<SystemDocument[]>((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(systemDocService.getSystemDocuments).mockReturnValueOnce(fetchPromise);

      act(() => {
        useSystemStore.getState().fetchDocuments(projectId);
      });

      expect(useSystemStore.getState().isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockDocuments);
        await fetchPromise;
      });

      expect(useSystemStore.getState().isLoading).toBe(false);
    });

    it('should set error state on failure', async () => {
      vi.mocked(systemDocService.getSystemDocuments).mockRejectedValueOnce(
        new Error('Network error')
      );

      await act(async () => {
        await useSystemStore.getState().fetchDocuments(projectId);
      });

      const state = useSystemStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('createDocument', () => {
    it('should create document and add to state', async () => {
      const newDoc = mockDocuments[0];
      vi.mocked(systemDocService.createSystemDocument).mockResolvedValueOnce(newDoc);

      await act(async () => {
        await useSystemStore.getState().createDocument(projectId, {
          name: newDoc.name,
          category: newDoc.category,
          tags: newDoc.tags,
          content: newDoc.content,
        });
      });

      const state = useSystemStore.getState();
      expect(state.documents).toContainEqual(newDoc);
      expect(state.error).toBeNull();
    });

    it('should expand category of newly created document', async () => {
      const newDoc = mockDocuments[0];
      vi.mocked(systemDocService.createSystemDocument).mockResolvedValueOnce(newDoc);

      await act(async () => {
        await useSystemStore.getState().createDocument(projectId, {
          name: newDoc.name,
          category: newDoc.category,
        });
      });

      const state = useSystemStore.getState();
      expect(state.expandedCategories).toContain(newDoc.category);
    });
  });

  describe('updateDocument', () => {
    it('should update document in state', async () => {
      // Set initial state with documents
      useSystemStore.setState({ documents: mockDocuments });

      const updatedDoc = { ...mockDocuments[0], name: 'Updated Character System' };
      vi.mocked(systemDocService.updateSystemDocument).mockResolvedValueOnce(updatedDoc);

      await act(async () => {
        await useSystemStore.getState().updateDocument(projectId, mockDocuments[0].id, {
          name: 'Updated Character System',
        });
      });

      const state = useSystemStore.getState();
      expect(state.documents.find(d => d.id === mockDocuments[0].id)?.name).toBe('Updated Character System');
    });
  });

  describe('deleteDocument', () => {
    it('should remove document from state', async () => {
      useSystemStore.setState({ documents: mockDocuments });
      vi.mocked(systemDocService.deleteSystemDocument).mockResolvedValueOnce();

      await act(async () => {
        await useSystemStore.getState().deleteDocument(projectId, mockDocuments[0].id);
      });

      const state = useSystemStore.getState();
      expect(state.documents.find(d => d.id === mockDocuments[0].id)).toBeUndefined();
      expect(state.documents).toHaveLength(1);
    });

    it('should clear preview if deleted document was being previewed', async () => {
      useSystemStore.setState({
        documents: mockDocuments,
        previewDocumentId: mockDocuments[0].id,
      });
      vi.mocked(systemDocService.deleteSystemDocument).mockResolvedValueOnce();

      await act(async () => {
        await useSystemStore.getState().deleteDocument(projectId, mockDocuments[0].id);
      });

      expect(useSystemStore.getState().previewDocumentId).toBeNull();
    });
  });

  describe('Filter Actions', () => {
    describe('setSearchQuery', () => {
      it('should update search query', () => {
        act(() => {
          useSystemStore.getState().setSearchQuery('character');
        });

        expect(useSystemStore.getState().searchQuery).toBe('character');
      });
    });

    describe('toggleTag', () => {
      it('should add tag to selectedTags', () => {
        act(() => {
          useSystemStore.getState().toggleTag('core');
        });

        expect(useSystemStore.getState().selectedTags).toContain('core');
      });

      it('should remove tag from selectedTags if already selected', () => {
        useSystemStore.setState({ selectedTags: ['core', 'player'] });

        act(() => {
          useSystemStore.getState().toggleTag('core');
        });

        expect(useSystemStore.getState().selectedTags).not.toContain('core');
        expect(useSystemStore.getState().selectedTags).toContain('player');
      });
    });

    describe('setSelectedCategory', () => {
      it('should update selected category', () => {
        act(() => {
          useSystemStore.getState().setSelectedCategory('System');
        });

        expect(useSystemStore.getState().selectedCategory).toBe('System');
      });

      it('should clear category when set to null', () => {
        useSystemStore.setState({ selectedCategory: 'System' });

        act(() => {
          useSystemStore.getState().setSelectedCategory(null);
        });

        expect(useSystemStore.getState().selectedCategory).toBeNull();
      });
    });

    describe('clearFilters', () => {
      it('should reset all filter states', () => {
        useSystemStore.setState({
          searchQuery: 'test',
          selectedTags: ['core', 'player'],
          selectedCategory: 'System',
        });

        act(() => {
          useSystemStore.getState().clearFilters();
        });

        const state = useSystemStore.getState();
        expect(state.searchQuery).toBe('');
        expect(state.selectedTags).toEqual([]);
        expect(state.selectedCategory).toBeNull();
      });
    });
  });

  describe('UI Actions', () => {
    describe('toggleCategory', () => {
      it('should add category to expandedCategories', () => {
        act(() => {
          useSystemStore.getState().toggleCategory('System');
        });

        expect(useSystemStore.getState().expandedCategories).toContain('System');
      });

      it('should remove category from expandedCategories if already expanded', () => {
        useSystemStore.setState({ expandedCategories: ['System', 'Economy'] });

        act(() => {
          useSystemStore.getState().toggleCategory('System');
        });

        expect(useSystemStore.getState().expandedCategories).not.toContain('System');
        expect(useSystemStore.getState().expandedCategories).toContain('Economy');
      });
    });

    describe('setPreviewDocument', () => {
      it('should set preview document id', () => {
        act(() => {
          useSystemStore.getState().setPreviewDocument('doc-1');
        });

        expect(useSystemStore.getState().previewDocumentId).toBe('doc-1');
      });

      it('should clear preview when set to null', () => {
        useSystemStore.setState({ previewDocumentId: 'doc-1' });

        act(() => {
          useSystemStore.getState().setPreviewDocument(null);
        });

        expect(useSystemStore.getState().previewDocumentId).toBeNull();
      });
    });

    describe('clearDocuments', () => {
      it('should reset documents and all related state', () => {
        useSystemStore.setState({
          documents: mockDocuments,
          selectedDocumentIds: ['doc-1'],
          searchQuery: 'test',
          selectedTags: ['core'],
          selectedCategory: 'System',
          expandedCategories: ['System'],
          previewDocumentId: 'doc-1',
        });

        act(() => {
          useSystemStore.getState().clearDocuments();
        });

        const state = useSystemStore.getState();
        expect(state.documents).toEqual([]);
        expect(state.selectedDocumentIds).toEqual([]);
        expect(state.searchQuery).toBe('');
        expect(state.selectedTags).toEqual([]);
        expect(state.selectedCategory).toBeNull();
        expect(state.expandedCategories).toEqual([]);
        expect(state.previewDocumentId).toBeNull();
      });
    });
  });

  describe('Computed Getters', () => {
    beforeEach(() => {
      useSystemStore.setState({ documents: mockDocuments });
    });

    describe('getFilteredDocuments', () => {
      it('should return all documents when no filters are applied', () => {
        const result = useSystemStore.getState().getFilteredDocuments();
        expect(result).toEqual(mockDocuments);
      });

      it('should filter by search query in name', () => {
        useSystemStore.setState({ searchQuery: 'character' });
        const result = useSystemStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Character System');
      });

      it('should filter by search query in tags', () => {
        useSystemStore.setState({ searchQuery: 'economy' });
        const result = useSystemStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Economy Rules');
      });

      it('should filter by selected tags (AND logic)', () => {
        useSystemStore.setState({ selectedTags: ['core'] });
        let result = useSystemStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(2);

        useSystemStore.setState({ selectedTags: ['core', 'player'] });
        result = useSystemStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Character System');
      });

      it('should filter by selected category', () => {
        useSystemStore.setState({ selectedCategory: 'Economy' });
        const result = useSystemStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Economy');
      });

      it('should combine all filters', () => {
        useSystemStore.setState({
          searchQuery: 'rules',
          selectedTags: ['core'],
          selectedCategory: 'Economy',
        });
        const result = useSystemStore.getState().getFilteredDocuments();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Economy Rules');
      });
    });

    describe('getCategories', () => {
      it('should return unique categories sorted alphabetically', () => {
        const result = useSystemStore.getState().getCategories();
        expect(result).toEqual(['Economy', 'System']);
      });
    });

    describe('getAllTags', () => {
      it('should return unique tags sorted alphabetically', () => {
        const result = useSystemStore.getState().getAllTags();
        expect(result).toEqual(['core', 'economy', 'player']);
      });
    });

    describe('getDocumentsByCategory', () => {
      it('should return documents grouped by category', () => {
        const result = useSystemStore.getState().getDocumentsByCategory();
        expect(result).toHaveProperty('System');
        expect(result).toHaveProperty('Economy');
        expect(result.System).toHaveLength(1);
        expect(result.Economy).toHaveLength(1);
      });
    });
  });
});
