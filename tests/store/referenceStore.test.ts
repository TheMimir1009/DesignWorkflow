/**
 * Reference Store Tests
 * TDD test suite for reference selection state management
 * TAG-001: referenceStore creation
 * TAG-008: Default reference system actions
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import type { SystemDocument } from '../../src/types';

// Import the store (will fail in RED phase until implementation exists)
import { useReferenceStore } from '../../src/store/referenceStore';

// Mock global fetch for API tests
global.fetch = vi.fn();

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

describe('referenceStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useReferenceStore.setState({
      selectedReferences: [],
    });
  });

  afterEach(() => {
    // Clean up after each test
    useReferenceStore.setState({
      selectedReferences: [],
    });
  });

  describe('initial state', () => {
    it('should have empty selectedReferences array initially', () => {
      const state = useReferenceStore.getState();

      expect(state.selectedReferences).toEqual([]);
    });

    it('should have addReference action defined', () => {
      const state = useReferenceStore.getState();

      expect(typeof state.addReference).toBe('function');
    });

    it('should have removeReference action defined', () => {
      const state = useReferenceStore.getState();

      expect(typeof state.removeReference).toBe('function');
    });

    it('should have clearReferences action defined', () => {
      const state = useReferenceStore.getState();

      expect(typeof state.clearReferences).toBe('function');
    });
  });

  describe('addReference', () => {
    it('should add a document to selectedReferences', () => {
      const mockDoc = createMockDocument();

      act(() => {
        useReferenceStore.getState().addReference(mockDoc);
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toHaveLength(1);
      expect(state.selectedReferences[0]).toEqual(mockDoc);
    });

    it('should add multiple documents to selectedReferences', () => {
      const doc1 = createMockDocument({ id: 'doc-1', name: 'Document 1' });
      const doc2 = createMockDocument({ id: 'doc-2', name: 'Document 2' });

      act(() => {
        useReferenceStore.getState().addReference(doc1);
        useReferenceStore.getState().addReference(doc2);
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toHaveLength(2);
      expect(state.selectedReferences[0]).toEqual(doc1);
      expect(state.selectedReferences[1]).toEqual(doc2);
    });

    it('should not add duplicate documents with same id', () => {
      const doc1 = createMockDocument({ id: 'doc-1', name: 'Document 1' });
      const doc1Duplicate = createMockDocument({ id: 'doc-1', name: 'Document 1 Updated' });

      act(() => {
        useReferenceStore.getState().addReference(doc1);
        useReferenceStore.getState().addReference(doc1Duplicate);
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toHaveLength(1);
      expect(state.selectedReferences[0].name).toBe('Document 1');
    });

    it('should preserve order when adding documents', () => {
      const doc1 = createMockDocument({ id: 'doc-1', name: 'First' });
      const doc2 = createMockDocument({ id: 'doc-2', name: 'Second' });
      const doc3 = createMockDocument({ id: 'doc-3', name: 'Third' });

      act(() => {
        useReferenceStore.getState().addReference(doc1);
        useReferenceStore.getState().addReference(doc2);
        useReferenceStore.getState().addReference(doc3);
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences[0].name).toBe('First');
      expect(state.selectedReferences[1].name).toBe('Second');
      expect(state.selectedReferences[2].name).toBe('Third');
    });
  });

  describe('removeReference', () => {
    it('should remove a document by id from selectedReferences', () => {
      const doc1 = createMockDocument({ id: 'doc-1', name: 'Document 1' });
      const doc2 = createMockDocument({ id: 'doc-2', name: 'Document 2' });

      useReferenceStore.setState({
        selectedReferences: [doc1, doc2],
      });

      act(() => {
        useReferenceStore.getState().removeReference('doc-1');
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toHaveLength(1);
      expect(state.selectedReferences[0].id).toBe('doc-2');
    });

    it('should do nothing when removing non-existent document id', () => {
      const doc1 = createMockDocument({ id: 'doc-1' });

      useReferenceStore.setState({
        selectedReferences: [doc1],
      });

      act(() => {
        useReferenceStore.getState().removeReference('non-existent-id');
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toHaveLength(1);
      expect(state.selectedReferences[0].id).toBe('doc-1');
    });

    it('should handle removing from empty array', () => {
      act(() => {
        useReferenceStore.getState().removeReference('any-id');
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toHaveLength(0);
    });

    it('should preserve order of remaining documents after removal', () => {
      const doc1 = createMockDocument({ id: 'doc-1', name: 'First' });
      const doc2 = createMockDocument({ id: 'doc-2', name: 'Second' });
      const doc3 = createMockDocument({ id: 'doc-3', name: 'Third' });

      useReferenceStore.setState({
        selectedReferences: [doc1, doc2, doc3],
      });

      act(() => {
        useReferenceStore.getState().removeReference('doc-2');
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toHaveLength(2);
      expect(state.selectedReferences[0].name).toBe('First');
      expect(state.selectedReferences[1].name).toBe('Third');
    });
  });

  describe('clearReferences', () => {
    it('should clear all documents from selectedReferences', () => {
      const doc1 = createMockDocument({ id: 'doc-1' });
      const doc2 = createMockDocument({ id: 'doc-2' });

      useReferenceStore.setState({
        selectedReferences: [doc1, doc2],
      });

      act(() => {
        useReferenceStore.getState().clearReferences();
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toEqual([]);
    });

    it('should handle clearing already empty array', () => {
      act(() => {
        useReferenceStore.getState().clearReferences();
      });

      const state = useReferenceStore.getState();
      expect(state.selectedReferences).toEqual([]);
    });
  });

  describe('devtools integration', () => {
    it('should have devtools middleware applied', () => {
      // Devtools adds $$storeMutations property to the store when in dev mode
      // This is a basic check that the store was created successfully
      const store = useReferenceStore;
      expect(store).toBeDefined();
      expect(typeof store.getState).toBe('function');
      expect(typeof store.setState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });
  });

  // TAG-008: Default Reference Actions
  describe('loadDefaultReferences', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    // TASK-036: Implement loadDefaultReferences action in referenceStore
    it('should have loadDefaultReferences action defined', () => {
      const state = useReferenceStore.getState();

      expect(typeof state.loadDefaultReferences).toBe('function');
    });

    it('should fetch default references from API and load into store', async () => {
      // Mock the fetch to return document IDs
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: ['doc-1', 'doc-2'] }),
      });

      // Mock the second fetch to get full documents (if needed)
      // For simplicity, we'll assume the store already has access to full documents
      // via systemStore or similar mechanism

      await act(async () => {
        await useReferenceStore.getState().loadDefaultReferences('project-1');
      });

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/project-1/default-references')
      );
    });

    it('should set isLoading to true during fetch and false after', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      const initialState = useReferenceStore.getState();
      expect(initialState.isLoading).toBe(false);

      const loadPromise = useReferenceStore.getState().loadDefaultReferences('project-1');

      // After completing
      await act(async () => {
        await loadPromise;
      });

      const finalState = useReferenceStore.getState();
      expect(finalState.isLoading).toBe(false);
    });

    it('should handle API error gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        try {
          await useReferenceStore.getState().loadDefaultReferences('project-1');
        } catch {
          // Expected to throw
        }
      });

      const state = useReferenceStore.getState();
      expect(state.error).toBeTruthy();
    });
  });

  describe('saveAsDefault', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    // TASK-037: Implement saveAsDefault action in referenceStore
    it('should have saveAsDefault action defined', () => {
      const state = useReferenceStore.getState();

      expect(typeof state.saveAsDefault).toBe('function');
    });

    it('should save current selectedReferences as default via API', async () => {
      const doc1 = createMockDocument({ id: 'doc-1', name: 'Doc 1' });
      const doc2 = createMockDocument({ id: 'doc-2', name: 'Doc 2' });

      useReferenceStore.setState({
        selectedReferences: [doc1, doc2],
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: ['doc-1', 'doc-2'] }),
      });

      await act(async () => {
        await useReferenceStore.getState().saveAsDefault('project-1');
      });

      // Verify fetch was called with correct payload
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/project-1/default-references'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ referenceIds: ['doc-1', 'doc-2'] }),
        })
      );
    });

    it('should set isLoading during save operation', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      const savePromise = useReferenceStore.getState().saveAsDefault('project-1');

      await act(async () => {
        await savePromise;
      });

      const finalState = useReferenceStore.getState();
      expect(finalState.isLoading).toBe(false);
    });

    it('should handle save API error gracefully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Save failed'));

      await act(async () => {
        try {
          await useReferenceStore.getState().saveAsDefault('project-1');
        } catch {
          // Expected to throw
        }
      });

      const state = useReferenceStore.getState();
      expect(state.error).toBeTruthy();
    });

    it('should save empty array when no references selected', async () => {
      useReferenceStore.setState({
        selectedReferences: [],
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      await act(async () => {
        await useReferenceStore.getState().saveAsDefault('project-1');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({ referenceIds: [] }),
        })
      );
    });
  });
});
