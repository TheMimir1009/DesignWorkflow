/**
 * ReferenceDocList Tests
 * TDD test suite for document list component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceDocList } from '../ReferenceDocList';
import { useReferenceDocStore } from '../../../store/referenceDocStore';
import type { CompletedDocumentSummary } from '../../../types';

// Mock the store
vi.mock('../../../store/referenceDocStore', () => ({
  useReferenceDocStore: vi.fn(),
}));

const mockedStore = vi.mocked(useReferenceDocStore);

describe('ReferenceDocList', () => {
  const mockOnSelectDocument = vi.fn();

  const mockDocuments: CompletedDocumentSummary[] = [
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
      title: 'Task 2',
      status: 'archived',
      references: ['ref-2', 'ref-3'],
      hasDesignDoc: true,
      hasPrd: false,
      hasPrototype: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
      archivedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  const defaultState = {
    documents: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedStore.mockImplementation((selector) => {
      return selector ? selector(defaultState as ReturnType<typeof useReferenceDocStore>) : defaultState;
    });
  });

  describe('Loading state', () => {
    it('should show loading skeleton when loading', () => {
      mockedStore.mockImplementation((selector) => {
        const state = { ...defaultState, isLoading: true };
        return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
      });

      render(<ReferenceDocList projectId="project-1" onSelectDocument={mockOnSelectDocument} />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error message when error exists', () => {
      mockedStore.mockImplementation((selector) => {
        const state = { ...defaultState, error: 'Failed to load documents' };
        return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
      });

      render(<ReferenceDocList projectId="project-1" onSelectDocument={mockOnSelectDocument} />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to load documents')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty message when no documents and no filters', () => {
      render(<ReferenceDocList projectId="project-1" onSelectDocument={mockOnSelectDocument} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText(/완료된 문서가 없습니다/i)).toBeInTheDocument();
    });

    it('should show search empty message when no documents with filters', () => {
      mockedStore.mockImplementation((selector) => {
        const state = { ...defaultState, searchQuery: 'test' };
        return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
      });

      render(<ReferenceDocList projectId="project-1" onSelectDocument={mockOnSelectDocument} />);

      expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument();
    });
  });

  describe('Document list', () => {
    it('should render document items when documents exist', () => {
      mockedStore.mockImplementation((selector) => {
        const state = { ...defaultState, documents: mockDocuments };
        return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
      });

      render(<ReferenceDocList projectId="project-1" onSelectDocument={mockOnSelectDocument} />);

      expect(screen.getByTestId('document-list')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('should call onSelectDocument when item is clicked', () => {
      mockedStore.mockImplementation((selector) => {
        const state = { ...defaultState, documents: mockDocuments };
        return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
      });

      render(<ReferenceDocList projectId="project-1" onSelectDocument={mockOnSelectDocument} />);

      fireEvent.click(screen.getByText('Task 1'));

      expect(mockOnSelectDocument).toHaveBeenCalledWith('task-1');
    });
  });
});
