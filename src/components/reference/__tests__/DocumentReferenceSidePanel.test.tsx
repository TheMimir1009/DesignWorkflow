/**
 * DocumentReferenceSidePanel Tests
 * TDD test suite for document reference side panel component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentReferenceSidePanel } from '../DocumentReferenceSidePanel';
import { useReferenceDocStore } from '../../../store/referenceDocStore';
import type { CompletedDocumentDetail } from '../../../types';

// Mock the store
vi.mock('../../../store/referenceDocStore', () => ({
  useReferenceDocStore: vi.fn(),
}));

const mockedStore = vi.mocked(useReferenceDocStore);

// Mock child components
vi.mock('../ReferenceSearchInput', () => ({
  ReferenceSearchInput: () => <div data-testid="mock-search-input" />,
}));

vi.mock('../ReferenceDocFilter', () => ({
  ReferenceDocFilter: () => <div data-testid="mock-doc-filter" />,
}));

vi.mock('../ReferenceDocList', () => ({
  ReferenceDocList: ({ onSelectDocument }: { onSelectDocument: (taskId: string) => void }) => (
    <div data-testid="mock-doc-list" onClick={() => onSelectDocument('task-1')} />
  ),
}));

vi.mock('../ReferenceDocDetail', () => ({
  ReferenceDocDetail: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="mock-doc-detail">
      <button onClick={onBack} data-testid="back-button">Back</button>
    </div>
  ),
}));

describe('DocumentReferenceSidePanel', () => {
  const mockClosePanel = vi.fn();
  const mockFetchDocuments = vi.fn();
  const mockFetchDocumentDetail = vi.fn();
  const mockClearSelection = vi.fn();

  const defaultState = {
    isPanelOpen: false,
    closePanel: mockClosePanel,
    fetchDocuments: mockFetchDocuments,
    fetchDocumentDetail: mockFetchDocumentDetail,
    clearSelection: mockClearSelection,
    selectedDocument: null,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedStore.mockImplementation((selector) => {
      return selector ? selector(defaultState as ReturnType<typeof useReferenceDocStore>) : defaultState;
    });
  });

  it('should not render when panel is closed', () => {
    render(<DocumentReferenceSidePanel projectId="project-1" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when panel is open', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should display panel title', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    expect(screen.getByText(/참조 문서/i)).toBeInTheDocument();
  });

  it('should show close button', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    expect(screen.getByRole('button', { name: /닫기/i })).toBeInTheDocument();
  });

  it('should call closePanel when close button is clicked', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    fireEvent.click(screen.getByRole('button', { name: /닫기/i }));

    expect(mockClosePanel).toHaveBeenCalled();
  });

  it('should call closePanel when overlay is clicked', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    fireEvent.click(screen.getByTestId('panel-overlay'));

    expect(mockClosePanel).toHaveBeenCalled();
  });

  it('should call closePanel when ESC key is pressed', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockClosePanel).toHaveBeenCalled();
  });

  it('should show search and filter in list view', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    expect(screen.getByTestId('mock-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('mock-doc-filter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-doc-list')).toBeInTheDocument();
  });

  it('should show detail view when document is selected', () => {
    const mockDocument: CompletedDocumentDetail = {
      taskId: 'task-1',
      title: 'Test Task',
      status: 'prototype',
      references: [],
      featureList: '',
      designDocument: null,
      prd: null,
      prototype: null,
      qaAnswers: [],
      createdAt: '',
      updatedAt: '',
    };

    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true, selectedDocument: mockDocument };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    expect(screen.getByTestId('mock-doc-detail')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-doc-list')).not.toBeInTheDocument();
  });

  it('should call fetchDocuments when panel opens', async () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    await waitFor(() => {
      expect(mockFetchDocuments).toHaveBeenCalledWith('project-1');
    });
  });

  it('should call fetchDocumentDetail when document is selected from list', async () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    fireEvent.click(screen.getByTestId('mock-doc-list'));

    await waitFor(() => {
      expect(mockFetchDocumentDetail).toHaveBeenCalledWith('project-1', 'task-1');
    });
  });

  it('should call clearSelection when back button is clicked in detail view', () => {
    const mockDocument: CompletedDocumentDetail = {
      taskId: 'task-1',
      title: 'Test Task',
      status: 'prototype',
      references: [],
      featureList: '',
      designDocument: null,
      prd: null,
      prototype: null,
      qaAnswers: [],
      createdAt: '',
      updatedAt: '',
    };

    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true, selectedDocument: mockDocument };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    fireEvent.click(screen.getByTestId('back-button'));

    expect(mockClearSelection).toHaveBeenCalled();
  });

  it('should have slide animation class', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, isPanelOpen: true };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<DocumentReferenceSidePanel projectId="project-1" />);

    const panel = screen.getByTestId('side-panel');
    expect(panel).toHaveClass('transition-transform');
  });
});
