/**
 * SystemList Component Tests
 * TDD test suite for system document list with category grouping
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemList } from '../../../src/components/system/SystemList';
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

// Test data factory
const createMockSystem = (overrides: Partial<SystemDocument> = {}): SystemDocument => ({
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

describe('SystemList', () => {
  const mockToggleSelect = vi.fn();
  const mockOpenEditModal = vi.fn();
  const mockOpenDeleteConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSystemStore).mockImplementation(createStoreMock({
      systems: [],
      selectedSystemIds: [],
      isLoading: false,
      error: null,
      toggleSelect: mockToggleSelect,
      openEditModal: mockOpenEditModal,
      openDeleteConfirm: mockOpenDeleteConfirm,
      getFilteredSystems: () => [],
      getSystemsByCategory: () => ({}),
    }));
  });

  describe('Rendering', () => {
    it('should render empty state when no systems exist', () => {
      render(<SystemList />);

      expect(screen.getByText('No system documents found')).toBeInTheDocument();
    });

    it('should render systems list when systems exist', () => {
      const mockSystems = [
        createMockSystem({ id: 'system-1', name: 'System 1' }),
        createMockSystem({ id: 'system-2', name: 'System 2' }),
      ];

      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: mockSystems,
        selectedSystemIds: [],
        isLoading: false,
        error: null,
        toggleSelect: mockToggleSelect,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => mockSystems,
        getSystemsByCategory: () => ({ 'game-mechanic': mockSystems }),
      }));

      render(<SystemList />);

      expect(screen.getByText('System 1')).toBeInTheDocument();
      expect(screen.getByText('System 2')).toBeInTheDocument();
    });
  });

  describe('Category grouping', () => {
    it('should group systems by category', () => {
      const mockSystems = [
        createMockSystem({ id: 'system-1', name: 'Economy 1', category: 'economy' }),
        createMockSystem({ id: 'system-2', name: 'Combat 1', category: 'combat' }),
        createMockSystem({ id: 'system-3', name: 'Economy 2', category: 'economy' }),
      ];

      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: mockSystems,
        selectedSystemIds: [],
        isLoading: false,
        error: null,
        toggleSelect: mockToggleSelect,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => mockSystems,
        getSystemsByCategory: () => ({
          economy: [mockSystems[0], mockSystems[2]],
          combat: [mockSystems[1]],
        }),
      }));

      render(<SystemList />);

      // Should show category headers (use heading role to avoid matching category badges)
      const headings = screen.getAllByRole('heading', { level: 3 });
      const headingTexts = headings.map(h => h.textContent);
      expect(headingTexts).toContain('economy');
      expect(headingTexts).toContain('combat');
    });

    it('should show systems count per category', () => {
      const mockSystems = [
        createMockSystem({ id: 'system-1', category: 'economy' }),
        createMockSystem({ id: 'system-2', category: 'economy' }),
      ];

      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: mockSystems,
        selectedSystemIds: [],
        isLoading: false,
        error: null,
        toggleSelect: mockToggleSelect,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => mockSystems,
        getSystemsByCategory: () => ({
          economy: mockSystems,
        }),
      }));

      render(<SystemList />);

      // Should show count indicator
      expect(screen.getByText('(2)')).toBeInTheDocument();
    });
  });

  describe('Selection state', () => {
    it('should pass selected state to SystemCard', () => {
      const mockSystems = [
        createMockSystem({ id: 'system-1', name: 'System 1' }),
        createMockSystem({ id: 'system-2', name: 'System 2' }),
      ];

      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: mockSystems,
        selectedSystemIds: ['system-1'],
        isLoading: false,
        error: null,
        toggleSelect: mockToggleSelect,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => mockSystems,
        getSystemsByCategory: () => ({ 'game-mechanic': mockSystems }),
      }));

      render(<SystemList />);

      const card1 = screen.getByTestId('system-card-system-1');
      const card2 = screen.getByTestId('system-card-system-2');

      expect(card1).toHaveClass('selected');
      expect(card2).not.toHaveClass('selected');
    });
  });

  describe('Filtered results', () => {
    it('should show filtered systems when filter is applied', () => {
      const mockSystems = [
        createMockSystem({ id: 'system-1', name: 'Economy System', category: 'economy' }),
        createMockSystem({ id: 'system-2', name: 'Combat System', category: 'combat' }),
      ];

      const filteredSystems = [mockSystems[0]];

      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: mockSystems,
        selectedSystemIds: [],
        isLoading: false,
        error: null,
        toggleSelect: mockToggleSelect,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => filteredSystems,
        getSystemsByCategory: () => ({ economy: filteredSystems }),
      }));

      render(<SystemList />);

      expect(screen.getByText('Economy System')).toBeInTheDocument();
      expect(screen.queryByText('Combat System')).not.toBeInTheDocument();
    });

    it('should show "No results" when filter returns no systems', () => {
      vi.mocked(useSystemStore).mockImplementation(createStoreMock({
        systems: [createMockSystem()],
        selectedSystemIds: [],
        isLoading: false,
        error: null,
        toggleSelect: mockToggleSelect,
        openEditModal: mockOpenEditModal,
        openDeleteConfirm: mockOpenDeleteConfirm,
        getFilteredSystems: () => [],
        getSystemsByCategory: () => ({}),
      }));

      render(<SystemList />);

      expect(screen.getByText('No matching systems found')).toBeInTheDocument();
    });
  });
});
