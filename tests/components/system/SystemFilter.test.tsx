/**
 * SystemFilter Component Tests
 * TDD test suite for system document filter controls
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemFilter } from '../../../src/components/system/SystemFilter';

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

describe('SystemFilter', () => {
  const mockSetCategoryFilter = vi.fn();
  const mockSetTagFilter = vi.fn();
  const mockClearSelection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSystemStore).mockImplementation(createStoreMock({
      systems: [
        { id: '1', category: 'economy', tags: ['core', 'balance'] },
        { id: '2', category: 'combat', tags: ['core', 'skills'] },
        { id: '3', category: 'economy', tags: ['trade'] },
      ],
      categoryFilter: null,
      tagFilter: [],
      setCategoryFilter: mockSetCategoryFilter,
      setTagFilter: mockSetTagFilter,
      clearSelection: mockClearSelection,
    }));
  });

  describe('Rendering', () => {
    it('should render filter container', () => {
      render(<SystemFilter />);

      expect(screen.getByTestId('system-filter')).toBeInTheDocument();
    });

    it('should render category dropdown', () => {
      render(<SystemFilter />);

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    it('should render tag chips area', () => {
      render(<SystemFilter />);

      expect(screen.getByTestId('tag-chips')).toBeInTheDocument();
    });

    it('should render clear filters button', () => {
      render(<SystemFilter />);

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    it('should show "All Categories" as default option', () => {
      render(<SystemFilter />);

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toHaveValue('');
    });

    it('should show unique categories from systems', () => {
      render(<SystemFilter />);

      const categorySelect = screen.getByLabelText(/category/i);

      expect(categorySelect).toContainHTML('economy');
      expect(categorySelect).toContainHTML('combat');
    });

    it('should call setCategoryFilter when category is selected', async () => {
      const user = userEvent.setup();
      render(<SystemFilter />);

      await user.selectOptions(screen.getByLabelText(/category/i), 'economy');

      expect(mockSetCategoryFilter).toHaveBeenCalledWith('economy');
    });

    it('should call setCategoryFilter with null when "All Categories" is selected', async () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [],
        categoryFilter: 'economy',
        tagFilter: [],
        setCategoryFilter: mockSetCategoryFilter,
        setTagFilter: mockSetTagFilter,
        clearSelection: mockClearSelection,
      }));

      const user = userEvent.setup();
      render(<SystemFilter />);

      await user.selectOptions(screen.getByLabelText(/category/i), '');

      expect(mockSetCategoryFilter).toHaveBeenCalledWith(null);
    });

    it('should reflect current category filter in dropdown', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [{ id: '1', category: 'economy', tags: [] }],
        categoryFilter: 'economy',
        tagFilter: [],
        setCategoryFilter: mockSetCategoryFilter,
        setTagFilter: mockSetTagFilter,
        clearSelection: mockClearSelection,
      }));

      render(<SystemFilter />);

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toHaveValue('economy');
    });
  });

  describe('Tag Chips', () => {
    it('should show unique tags from systems as chips', () => {
      render(<SystemFilter />);

      expect(screen.getByText('core')).toBeInTheDocument();
      expect(screen.getByText('balance')).toBeInTheDocument();
      expect(screen.getByText('skills')).toBeInTheDocument();
      expect(screen.getByText('trade')).toBeInTheDocument();
    });

    it('should highlight selected tags', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [{ id: '1', category: 'economy', tags: ['core', 'balance'] }],
        categoryFilter: null,
        tagFilter: ['core'],
        setCategoryFilter: mockSetCategoryFilter,
        setTagFilter: mockSetTagFilter,
        clearSelection: mockClearSelection,
      }));

      render(<SystemFilter />);

      const coreChip = screen.getByTestId('tag-chip-core');
      const balanceChip = screen.getByTestId('tag-chip-balance');

      expect(coreChip).toHaveClass('selected');
      expect(balanceChip).not.toHaveClass('selected');
    });

    it('should toggle tag selection when chip is clicked', async () => {
      const user = userEvent.setup();
      render(<SystemFilter />);

      await user.click(screen.getByTestId('tag-chip-core'));

      expect(mockSetTagFilter).toHaveBeenCalledWith(['core']);
    });

    it('should remove tag from filter when selected chip is clicked', async () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [{ id: '1', category: 'economy', tags: ['core', 'balance'] }],
        categoryFilter: null,
        tagFilter: ['core', 'balance'],
        setCategoryFilter: mockSetCategoryFilter,
        setTagFilter: mockSetTagFilter,
        clearSelection: mockClearSelection,
      }));

      const user = userEvent.setup();
      render(<SystemFilter />);

      await user.click(screen.getByTestId('tag-chip-core'));

      expect(mockSetTagFilter).toHaveBeenCalledWith(['balance']);
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters when Clear button is clicked', async () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [],
        categoryFilter: 'economy',
        tagFilter: ['core'],
        setCategoryFilter: mockSetCategoryFilter,
        setTagFilter: mockSetTagFilter,
        clearSelection: mockClearSelection,
      }));

      const user = userEvent.setup();
      render(<SystemFilter />);

      await user.click(screen.getByRole('button', { name: /clear/i }));

      expect(mockSetCategoryFilter).toHaveBeenCalledWith(null);
      expect(mockSetTagFilter).toHaveBeenCalledWith([]);
    });

    it('should disable Clear button when no filters are active', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [],
        categoryFilter: null,
        tagFilter: [],
        setCategoryFilter: mockSetCategoryFilter,
        setTagFilter: mockSetTagFilter,
        clearSelection: mockClearSelection,
      }));

      render(<SystemFilter />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeDisabled();
    });

    it('should enable Clear button when filters are active', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [],
        categoryFilter: 'economy',
        tagFilter: [],
        setCategoryFilter: mockSetCategoryFilter,
        setTagFilter: mockSetTagFilter,
        clearSelection: mockClearSelection,
      }));

      render(<SystemFilter />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).not.toBeDisabled();
    });
  });
});
