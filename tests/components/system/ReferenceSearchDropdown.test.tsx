/**
 * ReferenceSearchDropdown Component Tests
 * TDD test suite for search dropdown with debounce and reference selection
 * TAG-004: ReferenceSearchDropdown component
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferenceSearchDropdown } from '../../../src/components/system/ReferenceSearchDropdown';
import { useSystemStore } from '../../../src/store/systemStore';
import { useReferenceStore } from '../../../src/store/referenceStore';
import type { SystemDocument } from '../../../src/types';

// Mock the stores
vi.mock('../../../src/store/systemStore', () => ({
  useSystemStore: vi.fn(),
}));

vi.mock('../../../src/store/referenceStore', () => ({
  useReferenceStore: vi.fn(),
}));

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

describe('ReferenceSearchDropdown', () => {
  const mockSearchDocuments = vi.fn();
  const mockAddReference = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    (useSystemStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      documents: [],
      searchDocuments: mockSearchDocuments,
    });

    (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedReferences: [],
      addReference: mockAddReference,
    });

    mockSearchDocuments.mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render search input when isOpen is true', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      expect(screen.getByPlaceholderText(/시스템 문서 검색/i)).toBeInTheDocument();
    });

    it('should not render anything when isOpen is false', () => {
      render(<ReferenceSearchDropdown {...defaultProps} isOpen={false} />);

      expect(screen.queryByPlaceholderText(/시스템 문서 검색/i)).not.toBeInTheDocument();
    });

    it('should render with dropdown container', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should auto-focus search input when opened', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/시스템 문서 검색/i)).toHaveFocus();
      });
    });
  });

  describe('Search Input with Debounce', () => {
    it('should update input value when typing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');

      expect(input).toHaveValue('game');
    });

    it('should not call searchDocuments immediately on input', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'g');

      // Search should not be called immediately
      expect(mockSearchDocuments).not.toHaveBeenCalledWith('g');
    });

    it('should call searchDocuments after 300ms debounce', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');

      // Before debounce completes
      expect(mockSearchDocuments).not.toHaveBeenCalledWith('game');

      // Advance timers by 300ms
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockSearchDocuments).toHaveBeenCalledWith('game');
      });
    });

    it('should cancel previous debounce when typing new characters', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);

      // Type first character
      await user.type(input, 'g');
      vi.advanceTimersByTime(200);

      // Type more characters before debounce completes
      await user.type(input, 'ame');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        // Should only be called with final value, not intermediate
        expect(mockSearchDocuments).toHaveBeenCalledWith('game');
        expect(mockSearchDocuments).not.toHaveBeenCalledWith('g');
      });
    });
  });

  describe('Search Results Display', () => {
    it('should display filtered results from searchDocuments', async () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Design' }),
        createMockDocument({ id: 'doc-2', name: 'Game Mechanics' }),
      ];
      mockSearchDocuments.mockReturnValue(mockDocs);

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Game Design')).toBeInTheDocument();
        expect(screen.getByText('Game Mechanics')).toBeInTheDocument();
      });
    });

    it('should display "검색 결과 없음" when no matches found', async () => {
      mockSearchDocuments.mockReturnValue([]);

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'nonexistent');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/검색 결과 없음/i)).toBeInTheDocument();
      });
    });

    it('should display document category in results', async () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Design', category: 'design' }),
      ];
      mockSearchDocuments.mockReturnValue(mockDocs);

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('design')).toBeInTheDocument();
      });
    });
  });

  describe('Reference Selection', () => {
    it('should call addReference when clicking on a result item', async () => {
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Game Design' });
      mockSearchDocuments.mockReturnValue([mockDoc]);

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Game Design')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Game Design'));

      expect(mockAddReference).toHaveBeenCalledWith(mockDoc);
    });

    it('should close dropdown after selecting a reference', async () => {
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Game Design' });
      mockSearchDocuments.mockReturnValue([mockDoc]);

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Game Design')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Game Design'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should indicate already selected documents', async () => {
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Game Design' });
      mockSearchDocuments.mockReturnValue([mockDoc]);

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/선택됨/i)).toBeInTheDocument();
      });
    });

    it('should not call addReference for already selected documents', async () => {
      const mockDoc = createMockDocument({ id: 'doc-1', name: 'Game Design' });
      mockSearchDocuments.mockReturnValue([mockDoc]);

      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: [mockDoc],
        addReference: mockAddReference,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Game Design')).toBeInTheDocument();
      });

      // Click on already selected item
      await user.click(screen.getByText('Game Design'));

      expect(mockAddReference).not.toHaveBeenCalled();
    });
  });

  describe('Close Behavior', () => {
    it('should close on ESC key press', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close on outside click', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ReferenceSearchDropdown {...defaultProps} />
        </div>
      );

      await user.click(screen.getByTestId('outside'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside the dropdown', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.click(input);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role for dropdown', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have proper label for search input', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('should have proper list role for results', async () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Design' }),
      ];
      mockSearchDocuments.mockReturnValue(mockDocs);

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      await user.type(input, 'game');
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should apply Tailwind CSS classes', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('bg-gray-800');
    });

    it('should have proper styling for search input', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/시스템 문서 검색/i);
      expect(input).toHaveClass('bg-gray-700');
    });
  });
});
