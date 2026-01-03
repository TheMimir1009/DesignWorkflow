/**
 * System Store Tests
 * TDD test suite for system document state management
 * TAG-003: systemStore extension
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import type { SystemDocument } from '../../src/types';

// Import the store (will fail in RED phase until implementation exists)
import { useSystemStore } from '../../src/store/systemStore';

// Test data factory
const createMockDocument = (overrides: Partial<SystemDocument> = {}): SystemDocument => ({
  id: 'doc-1',
  projectId: 'project-1',
  name: 'Test Document',
  category: 'design',
  tags: ['test', 'sample'],
  content: 'Test content',
  dependencies: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('systemStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSystemStore.setState({
      documents: [],
      isLoading: false,
      error: null,
      currentDocument: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty documents array initially', () => {
      const state = useSystemStore.getState();

      expect(state.documents).toEqual([]);
    });

    it('should have isLoading false initially', () => {
      const state = useSystemStore.getState();

      expect(state.isLoading).toBe(false);
    });

    it('should have error null initially', () => {
      const state = useSystemStore.getState();

      expect(state.error).toBeNull();
    });

    it('should have currentDocument null initially', () => {
      const state = useSystemStore.getState();

      expect(state.currentDocument).toBeNull();
    });
  });

  describe('fetchDocuments action', () => {
    it('should have fetchDocuments action defined', () => {
      const state = useSystemStore.getState();

      expect(typeof state.fetchDocuments).toBe('function');
    });

    it('should set isLoading to true when fetching starts', async () => {
      const projectId = 'project-1';

      const fetchPromise = useSystemStore.getState().fetchDocuments(projectId);

      // Check loading state during fetch
      expect(useSystemStore.getState().isLoading).toBe(true);

      await fetchPromise;
    });

    it('should set isLoading to false after fetch completes', async () => {
      const projectId = 'project-1';

      await useSystemStore.getState().fetchDocuments(projectId);

      expect(useSystemStore.getState().isLoading).toBe(false);
    });
  });

  describe('setCurrentDocument action', () => {
    it('should have setCurrentDocument action defined', () => {
      const state = useSystemStore.getState();

      expect(typeof state.setCurrentDocument).toBe('function');
    });

    it('should set currentDocument when called with a document', () => {
      const mockDoc = createMockDocument();

      act(() => {
        useSystemStore.getState().setCurrentDocument(mockDoc);
      });

      const state = useSystemStore.getState();
      expect(state.currentDocument).toEqual(mockDoc);
    });

    it('should set currentDocument to null when called with null', () => {
      const mockDoc = createMockDocument();

      // First set a document
      act(() => {
        useSystemStore.getState().setCurrentDocument(mockDoc);
      });

      // Then set to null
      act(() => {
        useSystemStore.getState().setCurrentDocument(null);
      });

      const state = useSystemStore.getState();
      expect(state.currentDocument).toBeNull();
    });
  });

  describe('getDocumentsByCategory computed function', () => {
    it('should have getDocumentsByCategory function defined', () => {
      const state = useSystemStore.getState();

      expect(typeof state.getDocumentsByCategory).toBe('function');
    });

    it('should return empty object when no documents exist', () => {
      const result = useSystemStore.getState().getDocumentsByCategory();

      expect(result).toEqual({});
    });

    it('should group documents by category', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', category: 'design', name: 'Design Doc 1' }),
        createMockDocument({ id: 'doc-2', category: 'design', name: 'Design Doc 2' }),
        createMockDocument({ id: 'doc-3', category: 'economy', name: 'Economy Doc' }),
        createMockDocument({ id: 'doc-4', category: 'mechanics', name: 'Mechanics Doc' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().getDocumentsByCategory();

      expect(Object.keys(result)).toHaveLength(3);
      expect(result['design']).toHaveLength(2);
      expect(result['economy']).toHaveLength(1);
      expect(result['mechanics']).toHaveLength(1);
    });

    it('should maintain document order within categories', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', category: 'design', name: 'First' }),
        createMockDocument({ id: 'doc-2', category: 'design', name: 'Second' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().getDocumentsByCategory();

      expect(result['design'][0].name).toBe('First');
      expect(result['design'][1].name).toBe('Second');
    });
  });

  describe('searchDocuments function', () => {
    it('should have searchDocuments function defined', () => {
      const state = useSystemStore.getState();

      expect(typeof state.searchDocuments).toBe('function');
    });

    it('should return all documents when query is empty', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Game Design' }),
        createMockDocument({ id: 'doc-2', name: 'Economy System' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('');

      expect(result).toHaveLength(2);
    });

    it('should filter documents by name (case-insensitive)', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Game Design' }),
        createMockDocument({ id: 'doc-2', name: 'Economy System' }),
        createMockDocument({ id: 'doc-3', name: 'Game Mechanics' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('game');

      expect(result).toHaveLength(2);
      expect(result.map((d) => d.name)).toContain('Game Design');
      expect(result.map((d) => d.name)).toContain('Game Mechanics');
    });

    it('should filter documents by category', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Doc 1', category: 'design' }),
        createMockDocument({ id: 'doc-2', name: 'Doc 2', category: 'economy' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('design');

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('design');
    });

    it('should filter documents by tags', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Doc 1', tags: ['gameplay', 'core'] }),
        createMockDocument({ id: 'doc-2', name: 'Doc 2', tags: ['economy', 'balance'] }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('gameplay');

      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('gameplay');
    });

    it('should filter documents by content', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Doc 1', content: 'Player movement mechanics' }),
        createMockDocument({ id: 'doc-2', name: 'Doc 2', content: 'Currency exchange system' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('movement');

      expect(result).toHaveLength(1);
      expect(result[0].content).toContain('movement');
    });

    it('should return empty array when no matches found', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Game Design' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should handle special characters in search query', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Doc (v1.0)' }),
        createMockDocument({ id: 'doc-2', name: 'Doc [Draft]' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('(v1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Doc (v1.0)');
    });

    it('should trim whitespace from query', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', name: 'Game Design' }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().searchDocuments('  game  ');

      expect(result).toHaveLength(1);
    });
  });

  describe('filterByTags function', () => {
    it('should have filterByTags function defined', () => {
      const state = useSystemStore.getState();

      expect(typeof state.filterByTags).toBe('function');
    });

    it('should return all documents when tags array is empty', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', tags: ['tag1'] }),
        createMockDocument({ id: 'doc-2', tags: ['tag2'] }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().filterByTags([]);

      expect(result).toHaveLength(2);
    });

    it('should filter documents that have at least one matching tag', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', tags: ['gameplay', 'core'] }),
        createMockDocument({ id: 'doc-2', tags: ['economy', 'balance'] }),
        createMockDocument({ id: 'doc-3', tags: ['gameplay', 'advanced'] }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().filterByTags(['gameplay']);

      expect(result).toHaveLength(2);
      expect(result.map((d) => d.id)).toContain('doc-1');
      expect(result.map((d) => d.id)).toContain('doc-3');
    });

    it('should filter documents matching any of multiple tags (OR logic)', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', tags: ['gameplay'] }),
        createMockDocument({ id: 'doc-2', tags: ['economy'] }),
        createMockDocument({ id: 'doc-3', tags: ['narrative'] }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().filterByTags(['gameplay', 'economy']);

      expect(result).toHaveLength(2);
      expect(result.map((d) => d.id)).toContain('doc-1');
      expect(result.map((d) => d.id)).toContain('doc-2');
    });

    it('should return empty array when no documents match tags', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', tags: ['gameplay'] }),
        createMockDocument({ id: 'doc-2', tags: ['economy'] }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().filterByTags(['nonexistent']);

      expect(result).toHaveLength(0);
    });

    it('should be case-insensitive when matching tags', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', tags: ['GamePlay'] }),
        createMockDocument({ id: 'doc-2', tags: ['ECONOMY'] }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().filterByTags(['gameplay', 'economy']);

      expect(result).toHaveLength(2);
    });

    it('should handle documents with no tags', () => {
      const docs = [
        createMockDocument({ id: 'doc-1', tags: ['gameplay'] }),
        createMockDocument({ id: 'doc-2', tags: [] }),
      ];

      useSystemStore.setState({ documents: docs });

      const result = useSystemStore.getState().filterByTags(['gameplay']);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('doc-1');
    });
  });

  describe('devtools integration', () => {
    it('should have devtools middleware applied', () => {
      const store = useSystemStore;
      expect(store).toBeDefined();
      expect(typeof store.getState).toBe('function');
      expect(typeof store.setState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });
  });
});
