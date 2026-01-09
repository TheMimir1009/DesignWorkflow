/**
 * Reference Document Store Tests
 * TDD test suite for reference document state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useReferenceDocStore, type DocumentTypeFilter } from '../referenceDocStore';
import * as referenceDocService from '../../services/referenceDocService';
import type { CompletedDocumentSummary, CompletedDocumentDetail } from '../../types';

// Mock the service
vi.mock('../../services/referenceDocService');
const mockedService = vi.mocked(referenceDocService);

describe('referenceDocStore', () => {
  const projectId = 'project-123';

  const mockSummaries: CompletedDocumentSummary[] = [
    {
      taskId: 'task-1',
      title: 'Task 1',
      status: 'prototype',
      references: ['ref-1'],
      hasDesignDoc: true,
      hasPrd: true,
      hasPrototype: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      taskId: 'task-2',
      title: 'Task 2 with Design',
      status: 'archived',
      references: ['ref-2'],
      hasDesignDoc: true,
      hasPrd: false,
      hasPrototype: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
      archivedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  const mockDetail: CompletedDocumentDetail = {
    taskId: 'task-1',
    title: 'Task 1',
    status: 'prototype',
    references: ['ref-1'],
    featureList: '# Feature List',
    designDocument: '# Design Document',
    prd: '# PRD',
    prototype: null,
    qaAnswers: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    const store = useReferenceDocStore.getState();
    store.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      expect(result.current.isPanelOpen).toBe(false);
      expect(result.current.documents).toEqual([]);
      expect(result.current.selectedDocument).toBeNull();
      expect(result.current.searchQuery).toBe('');
      expect(result.current.filters).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSideBySideOpen).toBe(false);
      expect(result.current.splitRatio).toBe(50);
    });
  });

  describe('openPanel / closePanel', () => {
    it('should open panel', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.openPanel();
      });

      expect(result.current.isPanelOpen).toBe(true);
    });

    it('should close panel and reset selection', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.openPanel();
        result.current.selectDocument(mockDetail);
      });

      expect(result.current.isPanelOpen).toBe(true);
      expect(result.current.selectedDocument).toEqual(mockDetail);

      act(() => {
        result.current.closePanel();
      });

      expect(result.current.isPanelOpen).toBe(false);
      expect(result.current.selectedDocument).toBeNull();
    });
  });

  describe('fetchDocuments', () => {
    it('should fetch documents successfully', async () => {
      mockedService.getCompletedDocuments.mockResolvedValueOnce(mockSummaries);

      const { result } = renderHook(() => useReferenceDocStore());

      await act(async () => {
        await result.current.fetchDocuments(projectId);
      });

      expect(result.current.documents).toEqual(mockSummaries);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: CompletedDocumentSummary[]) => void;
      const promise = new Promise<CompletedDocumentSummary[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockedService.getCompletedDocuments.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.fetchDocuments(projectId);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockSummaries);
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      mockedService.getCompletedDocuments.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useReferenceDocStore());

      await act(async () => {
        await result.current.fetchDocuments(projectId);
      });

      expect(result.current.documents).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('should pass search and filter options to service', async () => {
      mockedService.getCompletedDocuments.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setSearchQuery('test');
        result.current.toggleFilter('design');
      });

      await act(async () => {
        await result.current.fetchDocuments(projectId);
      });

      expect(mockedService.getCompletedDocuments).toHaveBeenCalledWith(projectId, {
        search: 'test',
        documentType: ['design'],
      });
    });
  });

  describe('fetchDocumentDetail', () => {
    it('should fetch document detail successfully', async () => {
      mockedService.getCompletedDocumentDetail.mockResolvedValueOnce(mockDetail);

      const { result } = renderHook(() => useReferenceDocStore());

      await act(async () => {
        await result.current.fetchDocumentDetail(projectId, 'task-1');
      });

      expect(result.current.selectedDocument).toEqual(mockDetail);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch detail error', async () => {
      mockedService.getCompletedDocumentDetail.mockRejectedValueOnce(
        new Error('Not found')
      );

      const { result } = renderHook(() => useReferenceDocStore());

      await act(async () => {
        await result.current.fetchDocumentDetail(projectId, 'task-1');
      });

      expect(result.current.selectedDocument).toBeNull();
      expect(result.current.error).toBe('Not found');
    });
  });

  describe('selectDocument / clearSelection', () => {
    it('should select document', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.selectDocument(mockDetail);
      });

      expect(result.current.selectedDocument).toEqual(mockDetail);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.selectDocument(mockDetail);
        result.current.clearSelection();
      });

      expect(result.current.selectedDocument).toBeNull();
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setSearchQuery('search term');
      });

      expect(result.current.searchQuery).toBe('search term');
    });

    it('should clear search query', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setSearchQuery('search term');
        result.current.setSearchQuery('');
      });

      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('toggleFilter / clearFilters', () => {
    it('should toggle filter on', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.toggleFilter('design');
      });

      expect(result.current.filters).toContain('design');
    });

    it('should toggle filter off', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.toggleFilter('design');
        result.current.toggleFilter('design');
      });

      expect(result.current.filters).not.toContain('design');
    });

    it('should support multiple filters', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.toggleFilter('design');
        result.current.toggleFilter('prd');
      });

      expect(result.current.filters).toContain('design');
      expect(result.current.filters).toContain('prd');
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.toggleFilter('design');
        result.current.toggleFilter('prd');
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual([]);
    });
  });

  describe('setError / clearError', () => {
    it('should set error', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setError('Test error');
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.openPanel();
        result.current.setSearchQuery('test');
        result.current.toggleFilter('design');
        result.current.setError('error');
        result.current.openSideBySide();
        result.current.setSplitRatio(70);
        result.current.reset();
      });

      expect(result.current.isPanelOpen).toBe(false);
      expect(result.current.documents).toEqual([]);
      expect(result.current.selectedDocument).toBeNull();
      expect(result.current.searchQuery).toBe('');
      expect(result.current.filters).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSideBySideOpen).toBe(false);
      expect(result.current.splitRatio).toBe(50);
    });
  });

  describe('openSideBySide / closeSideBySide', () => {
    it('should open side-by-side view and close panel', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.openPanel();
        result.current.openSideBySide();
      });

      expect(result.current.isSideBySideOpen).toBe(true);
      expect(result.current.isPanelOpen).toBe(false);
    });

    it('should close side-by-side view', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.openSideBySide();
        result.current.closeSideBySide();
      });

      expect(result.current.isSideBySideOpen).toBe(false);
    });
  });

  describe('setSplitRatio', () => {
    it('should set split ratio', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setSplitRatio(60);
      });

      expect(result.current.splitRatio).toBe(60);
    });

    it('should clamp split ratio to minimum 20', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setSplitRatio(10);
      });

      expect(result.current.splitRatio).toBe(20);
    });

    it('should clamp split ratio to maximum 80', () => {
      const { result } = renderHook(() => useReferenceDocStore());

      act(() => {
        result.current.setSplitRatio(90);
      });

      expect(result.current.splitRatio).toBe(80);
    });
  });
});
