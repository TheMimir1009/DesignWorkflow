/**
 * SystemSearch Component Tests
 * TDD test suite for system document search with debounce
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemSearch } from '../../../src/components/system/SystemSearch';

// Mock systemStore
vi.mock('../../../src/store/systemStore', () => ({
  useSystemStore: vi.fn(),
}));

import { useSystemStore } from '../../../src/store/systemStore';

// Helper to create store mock that works with selectors
const createStoreMock = (storeState: Record<string, unknown>) => {
  return (selector?: (state: Record<string, unknown>) => unknown) => {
    if (typeof selector === 'function') {
      return selector(storeState);
    }
    return storeState;
  };
};

describe('SystemSearch', () => {
  const mockSetSearchQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.mocked(useSystemStore).mockImplementation(createStoreMock({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<SystemSearch />);

      expect(screen.getByTestId('system-search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<SystemSearch />);

      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should reflect current search query in input', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        searchQuery: 'existing query',
        setSearchQuery: mockSetSearchQuery,
      }));

      render(<SystemSearch />);

      expect(screen.getByPlaceholderText(/search/i)).toHaveValue('existing query');
    });
  });

  describe('Debounced Search', () => {
    it('should not call setSearchQuery immediately on input', async () => {
      render(<SystemSearch />);

      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockSetSearchQuery).not.toHaveBeenCalled();
    });

    it('should call setSearchQuery after 300ms debounce', async () => {
      render(<SystemSearch />);

      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'test' } });

      vi.advanceTimersByTime(300);

      expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
    });

    it('should reset debounce timer on new input', async () => {
      render(<SystemSearch />);

      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'te' } });

      vi.advanceTimersByTime(200);

      fireEvent.change(input, { target: { value: 'test' } });

      vi.advanceTimersByTime(200);

      expect(mockSetSearchQuery).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(mockSetSearchQuery).toHaveBeenCalledWith('test');
    });

    it('should only call setSearchQuery once for rapid typing', async () => {
      render(<SystemSearch />);

      const input = screen.getByPlaceholderText(/search/i);
      // Simulate rapid typing by firing multiple change events
      fireEvent.change(input, { target: { value: 'q' } });
      fireEvent.change(input, { target: { value: 'qu' } });
      fireEvent.change(input, { target: { value: 'qui' } });
      fireEvent.change(input, { target: { value: 'quic' } });
      fireEvent.change(input, { target: { value: 'quick' } });
      fireEvent.change(input, { target: { value: 'quick ' } });
      fireEvent.change(input, { target: { value: 'quick s' } });
      fireEvent.change(input, { target: { value: 'quick se' } });
      fireEvent.change(input, { target: { value: 'quick sea' } });
      fireEvent.change(input, { target: { value: 'quick sear' } });
      fireEvent.change(input, { target: { value: 'quick searc' } });
      fireEvent.change(input, { target: { value: 'quick search' } });

      vi.advanceTimersByTime(300);

      expect(mockSetSearchQuery).toHaveBeenCalledTimes(1);
      expect(mockSetSearchQuery).toHaveBeenCalledWith('quick search');
    });
  });

  describe('Clear Search', () => {
    it('should show clear button when search query exists', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        searchQuery: 'some query',
        setSearchQuery: mockSetSearchQuery,
      }));

      render(<SystemSearch />);

      expect(screen.getByTestId('clear-search')).toBeInTheDocument();
    });

    it('should not show clear button when search query is empty', () => {
      render(<SystemSearch />);

      expect(screen.queryByTestId('clear-search')).not.toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        searchQuery: 'some query',
        setSearchQuery: mockSetSearchQuery,
      }));

      render(<SystemSearch />);

      fireEvent.click(screen.getByTestId('clear-search'));

      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    });

    it('should clear input immediately without debounce', async () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        searchQuery: 'some query',
        setSearchQuery: mockSetSearchQuery,
      }));

      render(<SystemSearch />);

      fireEvent.click(screen.getByTestId('clear-search'));

      // Should be called immediately, not after debounce
      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
      expect(mockSetSearchQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria label', () => {
      render(<SystemSearch />);

      expect(screen.getByLabelText(/search system documents/i)).toBeInTheDocument();
    });

    it('should have proper role for clear button', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        searchQuery: 'query',
        setSearchQuery: mockSetSearchQuery,
      }));

      render(<SystemSearch />);

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });
  });
});
