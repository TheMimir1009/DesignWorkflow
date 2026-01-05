/**
 * SystemSidebar Component Tests
 * TDD test suite for collapsible system document sidebar
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemSidebar } from '../../../src/components/system/SystemSidebar';
import type { SystemDocument } from '../../../src/types';

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

// Test data factory - currently unused but kept for future tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _createMockSystem = (overrides: Partial<SystemDocument> = {}): SystemDocument => ({
  id: 'test-system-id',
  projectId: 'test-project-id',
  name: 'Test System',
  category: 'game-mechanic',
  tags: ['test', 'sample'],
  content: '# Test System\n\nContent here.',
  dependencies: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('SystemSidebar', () => {
  const mockFetchSystems = vi.fn();
  const mockToggleSelect = vi.fn();
  const mockSelectAll = vi.fn();
  const mockClearSelection = vi.fn();
  const mockOpenCreateModal = vi.fn();
  const mockOpenEditModal = vi.fn();
  const mockOpenDeleteConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSystemStore).mockImplementation(createStoreMock({
      systems: [],
      selectedSystemIds: [],
      isLoading: false,
      error: null,
      fetchSystems: mockFetchSystems,
      toggleSelect: mockToggleSelect,
      selectAll: mockSelectAll,
      clearSelection: mockClearSelection,
      openCreateModal: mockOpenCreateModal,
      openEditModal: mockOpenEditModal,
      openDeleteConfirm: mockOpenDeleteConfirm,
      getFilteredSystems: () => [],
      getSystemsByCategory: () => ({}),
    }));
  });

  describe('Rendering', () => {
    it('should render sidebar with toggle button', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      expect(screen.getByTestId('system-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    });

    it('should render "System Documents" header', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      expect(screen.getByText('System Documents')).toBeInTheDocument();
    });

    it('should render "Add" button', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });

  describe('Collapsible behavior', () => {
    it('should be expanded by default', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      const sidebar = screen.getByTestId('system-sidebar');
      expect(sidebar).not.toHaveClass('collapsed');
    });

    it('should collapse when toggle button is clicked', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      const toggleButton = screen.getByTestId('sidebar-toggle');
      fireEvent.click(toggleButton);

      const sidebar = screen.getByTestId('system-sidebar');
      expect(sidebar).toHaveClass('collapsed');
    });

    it('should expand when collapsed and toggle button is clicked', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      const toggleButton = screen.getByTestId('sidebar-toggle');
      fireEvent.click(toggleButton); // Collapse
      fireEvent.click(toggleButton); // Expand

      const sidebar = screen.getByTestId('system-sidebar');
      expect(sidebar).not.toHaveClass('collapsed');
    });
  });

  describe('Data fetching', () => {
    it('should fetch systems on mount', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      expect(mockFetchSystems).toHaveBeenCalledWith('test-project-id');
    });

    it('should refetch when projectId changes', () => {
      const { rerender } = render(<SystemSidebar projectId="project-1" />);

      expect(mockFetchSystems).toHaveBeenCalledWith('project-1');

      rerender(<SystemSidebar projectId="project-2" />);

      expect(mockFetchSystems).toHaveBeenCalledWith('project-2');
    });
  });

  describe('Loading state', () => {
    it('should show loading indicator when isLoading is true', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [],
        selectedSystemIds: [],
        isLoading: true,
        error: null,
        fetchSystems: mockFetchSystems,
        toggleSelect: mockToggleSelect,
        selectAll: mockSelectAll,
        clearSelection: mockClearSelection,
        openCreateModal: mockOpenCreateModal,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => [],
        getSystemsByCategory: () => ({}),
      }));

      render(<SystemSidebar projectId="test-project-id" />);

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error message when error exists', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [],
        selectedSystemIds: [],
        isLoading: false,
        error: 'Failed to load systems',
        fetchSystems: mockFetchSystems,
        toggleSelect: mockToggleSelect,
        selectAll: mockSelectAll,
        clearSelection: mockClearSelection,
        openCreateModal: mockOpenCreateModal,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => [],
        getSystemsByCategory: () => ({}),
      }));

      render(<SystemSidebar projectId="test-project-id" />);

      expect(screen.getByText('Failed to load systems')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty state message when no systems exist', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [],
        selectedSystemIds: [],
        isLoading: false,
        error: null,
        fetchSystems: mockFetchSystems,
        toggleSelect: mockToggleSelect,
        selectAll: mockSelectAll,
        clearSelection: mockClearSelection,
        openCreateModal: mockOpenCreateModal,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => [],
        getSystemsByCategory: () => ({}),
      }));

      render(<SystemSidebar projectId="test-project-id" />);

      expect(screen.getByText('No system documents')).toBeInTheDocument();
    });
  });

  describe('Add button', () => {
    it('should call openCreateModal when Add button is clicked', () => {
      render(<SystemSidebar projectId="test-project-id" />);

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      expect(mockOpenCreateModal).toHaveBeenCalled();
    });
  });
});
