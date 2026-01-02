/**
 * System Document Management Integration Tests
 * Tests for the complete system document flow including API, Store, and UI interactions
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSystemStore } from '../../src/store/systemStore';
import * as systemDocService from '../../src/services/systemDocService';
import type { SystemDocument } from '../../src/types';

// Mock the service layer
vi.mock('../../src/services/systemDocService');

const mockSystemDocService = vi.mocked(systemDocService);

describe('System Document Integration Tests', () => {
  const projectId = 'project-123';

  const mockDocument: SystemDocument = {
    id: 'sys-1',
    name: 'Test Document',
    category: 'System',
    tags: ['core', 'rules'],
    content: '# Test Content',
    dependencies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSystemStore.getState().clearDocuments();
    useSystemStore.getState().clearFilters();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Complete CRUD Flow', () => {
    it('should fetch documents and update store state', async () => {
      const documents = [mockDocument];
      mockSystemDocService.getSystemDocuments.mockResolvedValueOnce(documents);

      const store = useSystemStore.getState();
      await store.fetchDocuments(projectId);

      expect(mockSystemDocService.getSystemDocuments).toHaveBeenCalledWith(projectId);
      expect(useSystemStore.getState().documents).toEqual(documents);
      expect(useSystemStore.getState().isLoading).toBe(false);
      expect(useSystemStore.getState().error).toBeNull();
    });

    it('should create document and add to store', async () => {
      const createData = {
        name: 'New Document',
        category: 'Content',
        tags: ['new'],
        content: '# New',
        dependencies: [],
      };

      const createdDocument: SystemDocument = {
        ...createData,
        id: 'sys-new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockSystemDocService.createSystemDocument.mockResolvedValueOnce(createdDocument);

      const store = useSystemStore.getState();
      await store.createDocument(projectId, createData);

      expect(mockSystemDocService.createSystemDocument).toHaveBeenCalledWith(projectId, createData);
      expect(useSystemStore.getState().documents).toContainEqual(createdDocument);
    });

    it('should update document and reflect changes in store', async () => {
      // First, set initial state with a document
      useSystemStore.setState({ documents: [mockDocument] });

      const updateData = {
        name: 'Updated Document',
        category: 'UI',
      };

      const updatedDocument: SystemDocument = {
        ...mockDocument,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      mockSystemDocService.updateSystemDocument.mockResolvedValueOnce(updatedDocument);

      const store = useSystemStore.getState();
      await store.updateDocument(projectId, mockDocument.id, updateData);

      expect(mockSystemDocService.updateSystemDocument).toHaveBeenCalledWith(
        projectId,
        mockDocument.id,
        updateData
      );

      const storeDoc = useSystemStore.getState().documents.find(d => d.id === mockDocument.id);
      expect(storeDoc?.name).toBe('Updated Document');
      expect(storeDoc?.category).toBe('UI');
    });

    it('should delete document and remove from store', async () => {
      // First, set initial state with a document
      useSystemStore.setState({ documents: [mockDocument] });

      mockSystemDocService.deleteSystemDocument.mockResolvedValueOnce();

      const store = useSystemStore.getState();
      await store.deleteDocument(projectId, mockDocument.id);

      expect(mockSystemDocService.deleteSystemDocument).toHaveBeenCalledWith(
        projectId,
        mockDocument.id
      );
      expect(useSystemStore.getState().documents).not.toContainEqual(mockDocument);
      expect(useSystemStore.getState().documents.length).toBe(0);
    });
  });

  describe('Filter and Search Flow', () => {
    const documents: SystemDocument[] = [
      {
        id: 'sys-1',
        name: 'Combat System',
        category: 'System',
        tags: ['core', 'combat'],
        content: '# Combat',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sys-2',
        name: 'Character Design',
        category: 'Content',
        tags: ['art', 'character'],
        content: '# Character',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sys-3',
        name: 'UI Guidelines',
        category: 'UI',
        tags: ['core', 'ui'],
        content: '# UI',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    beforeEach(() => {
      useSystemStore.setState({ documents });
    });

    it('should filter documents by search query', () => {
      const store = useSystemStore.getState();
      store.setSearchQuery('combat');

      const filtered = useSystemStore.getState().getFilteredDocuments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Combat System');
    });

    it('should filter documents by tag', () => {
      const store = useSystemStore.getState();
      store.toggleTag('core');

      const filtered = useSystemStore.getState().getFilteredDocuments();
      expect(filtered.length).toBe(2);
      expect(filtered.map(d => d.name)).toContain('Combat System');
      expect(filtered.map(d => d.name)).toContain('UI Guidelines');
    });

    it('should filter by multiple tags (intersection)', () => {
      const store = useSystemStore.getState();
      store.toggleTag('core');
      store.toggleTag('combat');

      const filtered = useSystemStore.getState().getFilteredDocuments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Combat System');
    });

    it('should filter by category', () => {
      const store = useSystemStore.getState();
      store.setSelectedCategory('Content');

      const filtered = useSystemStore.getState().getFilteredDocuments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Character Design');
    });

    it('should combine search and tag filters', () => {
      const store = useSystemStore.getState();
      store.setSearchQuery('system');
      store.toggleTag('core');

      const filtered = useSystemStore.getState().getFilteredDocuments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Combat System');
    });

    it('should clear all filters', () => {
      const store = useSystemStore.getState();
      store.setSearchQuery('test');
      store.toggleTag('core');
      store.setSelectedCategory('System');

      store.clearFilters();

      const state = useSystemStore.getState();
      expect(state.searchQuery).toBe('');
      expect(state.selectedTags).toEqual([]);
      expect(state.selectedCategory).toBeNull();

      const filtered = state.getFilteredDocuments();
      expect(filtered.length).toBe(3);
    });
  });

  describe('Category Management Flow', () => {
    const documents: SystemDocument[] = [
      {
        id: 'sys-1',
        name: 'Doc 1',
        category: 'System',
        tags: [],
        content: '',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sys-2',
        name: 'Doc 2',
        category: 'Content',
        tags: [],
        content: '',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'sys-3',
        name: 'Doc 3',
        category: 'System',
        tags: [],
        content: '',
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    beforeEach(() => {
      useSystemStore.setState({ documents });
    });

    it('should get all unique categories', () => {
      const categories = useSystemStore.getState().getCategories();
      expect(categories).toContain('System');
      expect(categories).toContain('Content');
      expect(categories.length).toBe(2);
    });

    it('should group documents by category', () => {
      const byCategory = useSystemStore.getState().getDocumentsByCategory();
      expect(byCategory['System'].length).toBe(2);
      expect(byCategory['Content'].length).toBe(1);
    });

    it('should toggle category expansion', () => {
      const store = useSystemStore.getState();

      // Initially expanded
      store.toggleCategory('System');
      expect(useSystemStore.getState().expandedCategories).toContain('System');

      // Toggle to collapse
      store.toggleCategory('System');
      expect(useSystemStore.getState().expandedCategories).not.toContain('System');
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle fetch error and update store error state', async () => {
      const errorMessage = 'Network error';
      mockSystemDocService.getSystemDocuments.mockRejectedValueOnce(new Error(errorMessage));

      const store = useSystemStore.getState();
      await store.fetchDocuments(projectId);

      expect(useSystemStore.getState().error).toBe(errorMessage);
      expect(useSystemStore.getState().isLoading).toBe(false);
    });

    it('should handle create error', async () => {
      const errorMessage = 'Validation failed';
      mockSystemDocService.createSystemDocument.mockRejectedValueOnce(new Error(errorMessage));

      const store = useSystemStore.getState();

      await expect(
        store.createDocument(projectId, {
          name: 'Test',
          category: 'System',
          tags: [],
          content: '',
          dependencies: [],
        })
      ).rejects.toThrow(errorMessage);
    });

    it('should handle update error', async () => {
      useSystemStore.setState({ documents: [mockDocument] });

      const errorMessage = 'Update failed';
      mockSystemDocService.updateSystemDocument.mockRejectedValueOnce(new Error(errorMessage));

      const store = useSystemStore.getState();

      await expect(
        store.updateDocument(projectId, mockDocument.id, { name: 'Updated' })
      ).rejects.toThrow(errorMessage);
    });

    it('should handle delete error', async () => {
      useSystemStore.setState({ documents: [mockDocument] });

      const errorMessage = 'Delete failed';
      mockSystemDocService.deleteSystemDocument.mockRejectedValueOnce(new Error(errorMessage));

      const store = useSystemStore.getState();

      await expect(
        store.deleteDocument(projectId, mockDocument.id)
      ).rejects.toThrow(errorMessage);

      // Document should still be in store
      expect(useSystemStore.getState().documents).toContainEqual(mockDocument);
    });
  });

  describe('Preview State Management', () => {
    it('should set preview document ID', () => {
      const store = useSystemStore.getState();
      store.setPreviewDocument('sys-1');

      expect(useSystemStore.getState().previewDocumentId).toBe('sys-1');
    });

    it('should clear preview document', () => {
      useSystemStore.setState({ previewDocumentId: 'sys-1' });

      const store = useSystemStore.getState();
      store.setPreviewDocument(null);

      expect(useSystemStore.getState().previewDocumentId).toBeNull();
    });
  });
});
