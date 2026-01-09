/**
 * ReferenceSearchInput Tests
 * TDD test suite for search input with debounce
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReferenceSearchInput } from '../ReferenceSearchInput';
import { useReferenceDocStore } from '../../../store/referenceDocStore';

// Mock the store
vi.mock('../../../store/referenceDocStore', () => ({
  useReferenceDocStore: vi.fn(),
}));

const mockedStore = vi.mocked(useReferenceDocStore);

describe('ReferenceSearchInput', () => {
  const mockSetSearchQuery = vi.fn();
  const mockFetchDocuments = vi.fn();

  const defaultState = {
    setSearchQuery: mockSetSearchQuery,
    fetchDocuments: mockFetchDocuments,
    searchQuery: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockedStore.mockImplementation((selector) => {
      return selector ? selector(defaultState as ReturnType<typeof useReferenceDocStore>) : defaultState;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input', () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/문서 검색/i)).toBeInTheDocument();
  });

  it('should have search icon', () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    expect(screen.getByRole('textbox').parentElement?.querySelector('svg')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    expect(screen.getByLabelText(/문서 검색/i)).toBeInTheDocument();
  });

  it('should update local value on input', () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(input).toHaveValue('test query');
  });

  it('should debounce search call for 300ms', async () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not call yet
    expect(mockSetSearchQuery).not.toHaveBeenCalled();
    expect(mockFetchDocuments).not.toHaveBeenCalled();

    // Advance time by 299ms
    await act(async () => {
      vi.advanceTimersByTime(299);
    });

    expect(mockSetSearchQuery).not.toHaveBeenCalled();

    // Advance time to 300ms
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
    expect(mockFetchDocuments).toHaveBeenCalledWith('project-1');
  });

  it('should reset debounce on subsequent inputs', async () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'te' } });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.change(input, { target: { value: 'test' } });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Should not have called yet
    expect(mockSetSearchQuery).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Now it should call with final value
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(1);
    expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
  });

  it('should show clear button when input has value', () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    const input = screen.getByRole('textbox');

    // Initially no clear button
    expect(screen.queryByLabelText(/검색어 지우기/i)).not.toBeInTheDocument();

    // After typing
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByLabelText(/검색어 지우기/i)).toBeInTheDocument();
  });

  it('should clear input and trigger fetch on clear button click', () => {
    render(<ReferenceSearchInput projectId="project-1" />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText(/검색어 지우기/i);
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    expect(mockFetchDocuments).toHaveBeenCalledWith('project-1');
  });

  it('should sync with store search query', () => {
    mockedStore.mockImplementation((selector) => {
      const state = { ...defaultState, searchQuery: 'existing query' };
      return selector ? selector(state as ReturnType<typeof useReferenceDocStore>) : state;
    });

    render(<ReferenceSearchInput projectId="project-1" />);

    expect(screen.getByRole('textbox')).toHaveValue('existing query');
  });
});
