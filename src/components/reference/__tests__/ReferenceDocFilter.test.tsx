/**
 * ReferenceDocFilter Tests
 * TDD test suite for document type filter
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceDocFilter } from '../ReferenceDocFilter';
import { useReferenceDocStore } from '../../../store/referenceDocStore';

// Mock the store
vi.mock('../../../store/referenceDocStore', () => ({
  useReferenceDocStore: vi.fn(),
}));

const mockedStore = vi.mocked(useReferenceDocStore);

describe('ReferenceDocFilter', () => {
  const mockToggleFilter = vi.fn();
  const mockClearFilters = vi.fn();
  const mockFetchDocuments = vi.fn();

  const defaultState = {
    filters: [],
    toggleFilter: mockToggleFilter,
    clearFilters: mockClearFilters,
    fetchDocuments: mockFetchDocuments,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedStore.mockImplementation((selector) => {
      return selector ? selector(defaultState as ReturnType<typeof useReferenceDocStore>) : defaultState;
    });
  });

  it('should render all filter buttons', () => {
    render(<ReferenceDocFilter projectId="project-1" />);

    expect(screen.getByRole('button', { name: /design doc/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /prd/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /prototype/i })).toBeInTheDocument();
  });

  it('should show inactive state for filters by default', () => {
    render(<ReferenceDocFilter projectId="project-1" />);

    const designButton = screen.getByRole('button', { name: /design doc/i });
    expect(designButton).toHaveAttribute('aria-pressed', 'false');
    expect(designButton).toHaveClass('bg-gray-100');
  });

  it('should show active state for selected filters', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, filters: ['design'] };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<ReferenceDocFilter projectId="project-1" />);

    const designButton = screen.getByRole('button', { name: /design doc/i });
    expect(designButton).toHaveAttribute('aria-pressed', 'true');
    expect(designButton).toHaveClass('bg-blue-100');
  });

  it('should call toggleFilter and fetchDocuments when filter is clicked', () => {
    render(<ReferenceDocFilter projectId="project-1" />);

    fireEvent.click(screen.getByRole('button', { name: /design doc/i }));

    expect(mockToggleFilter).toHaveBeenCalledWith('design');
    expect(mockFetchDocuments).toHaveBeenCalledWith('project-1');
  });

  it('should not show clear button when no filters are active', () => {
    render(<ReferenceDocFilter projectId="project-1" />);

    expect(screen.queryByLabelText(/필터 초기화/i)).not.toBeInTheDocument();
  });

  it('should show clear button when filters are active', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, filters: ['design'] };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<ReferenceDocFilter projectId="project-1" />);

    expect(screen.getByText(/초기화/i)).toBeInTheDocument();
  });

  it('should call clearFilters and fetchDocuments when clear button is clicked', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, filters: ['design', 'prd'] };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<ReferenceDocFilter projectId="project-1" />);

    fireEvent.click(screen.getByText(/초기화/i));

    expect(mockClearFilters).toHaveBeenCalled();
    expect(mockFetchDocuments).toHaveBeenCalledWith('project-1');
  });

  it('should support multiple active filters', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, filters: ['design', 'prd'] };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<ReferenceDocFilter projectId="project-1" />);

    expect(screen.getByRole('button', { name: /design doc/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /prd/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /prototype/i })).toHaveAttribute('aria-pressed', 'false');
  });
});
