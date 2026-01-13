/**
 * SystemList Component Tests
<<<<<<< HEAD
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemList } from '../../../src/components/system/SystemList';
import type { SystemDocument } from '../../../src/types';

describe('SystemList', () => {
  const mockDocuments: SystemDocument[] = [
    {
      id: 'system-1',
      projectId: 'project-1',
      name: 'Combat System',
      category: 'Core Mechanics',
      tags: ['combat', 'action'],
      content: '# Combat System',
      dependencies: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'system-2',
      projectId: 'project-1',
      name: 'Level System',
      category: 'Core Mechanics',
      tags: ['progression'],
      content: '# Level System',
      dependencies: [],
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'system-3',
      projectId: 'project-1',
      name: 'Character Stats',
      category: 'Character',
      tags: ['stats'],
      content: '# Character Stats',
      dependencies: [],
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  const defaultProps = {
    documents: mockDocuments,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onPreview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading skeleton when isLoading is true', () => {
      render(<SystemList {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('system-list-loading')).toBeInTheDocument();
    });

    it('should render empty state when no documents', () => {
      render(<SystemList {...defaultProps} documents={[]} />);

      expect(screen.getByTestId('system-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No system documents found')).toBeInTheDocument();
    });

    it('should render document list grouped by category', () => {
      render(<SystemList {...defaultProps} />);

      expect(screen.getByTestId('system-list')).toBeInTheDocument();
      // Check category headers exist (they have count in text)
      expect(screen.getByRole('button', { name: /core mechanics.*2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /character.*1/i })).toBeInTheDocument();
    });

    it('should display document count per category', () => {
      render(<SystemList {...defaultProps} />);

      expect(screen.getByText('(2)')).toBeInTheDocument(); // Core Mechanics has 2
      expect(screen.getByText('(1)')).toBeInTheDocument(); // Character has 1
    });

    it('should sort categories alphabetically', () => {
      render(<SystemList {...defaultProps} />);

      // Get all category header buttons
      const categoryButtons = screen.getAllByRole('button');
      // Filter to only category headers (they contain count text like "(2)")
      const categoryHeaders = categoryButtons.filter(btn => /\(\d+\)/.test(btn.textContent || ''));

      // Should be sorted: Character before Core Mechanics
      expect(categoryHeaders[0]).toHaveTextContent(/character/i);
      expect(categoryHeaders[1]).toHaveTextContent(/core mechanics/i);
    });
  });

  describe('Category Collapse', () => {
    it('should collapse category when header clicked', async () => {
      render(<SystemList {...defaultProps} />);

      // Both categories should show documents initially
      expect(screen.getByText('Combat System')).toBeInTheDocument();
      expect(screen.getByText('Character Stats')).toBeInTheDocument();

      // Click Core Mechanics category header
      const coreMechanicsHeader = screen.getByRole('button', { name: /core mechanics/i });
      await userEvent.click(coreMechanicsHeader);

      // Core Mechanics documents should be hidden
      expect(screen.queryByText('Combat System')).not.toBeInTheDocument();
      expect(screen.queryByText('Level System')).not.toBeInTheDocument();

      // Character documents should still be visible
      expect(screen.getByText('Character Stats')).toBeInTheDocument();
    });

    it('should expand collapsed category when header clicked again', async () => {
      render(<SystemList {...defaultProps} />);

      const coreMechanicsHeader = screen.getByRole('button', { name: /core mechanics/i });

      // Collapse
      await userEvent.click(coreMechanicsHeader);
      expect(screen.queryByText('Combat System')).not.toBeInTheDocument();

      // Expand
      await userEvent.click(coreMechanicsHeader);
      expect(screen.getByText('Combat System')).toBeInTheDocument();
    });
  });

  describe('Document Interactions', () => {
    it('should call onEdit when card edit button clicked', async () => {
      render(<SystemList {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await userEvent.click(editButtons[0]);

      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when card delete button clicked', async () => {
      render(<SystemList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await userEvent.click(deleteButtons[0]);

      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onPreview when card preview button clicked', async () => {
      render(<SystemList {...defaultProps} />);

      const previewButtons = screen.getAllByRole('button', { name: /preview/i });
      await userEvent.click(previewButtons[0]);

      expect(defaultProps.onPreview).toHaveBeenCalledTimes(1);
    });
  });

  describe('Selectable Mode', () => {
    it('should render checkboxes when selectable is true', () => {
      render(<SystemList {...defaultProps} selectable={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should not render checkboxes when selectable is false', () => {
      render(<SystemList {...defaultProps} selectable={false} />);

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('should show selected state for documents in selectedIds', () => {
      const selectedIds = new Set(['system-1']);
      render(<SystemList {...defaultProps} selectable={true} selectedIds={selectedIds} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox should be checked (Combat System is in selectedIds)
      expect(checkboxes.find(cb => (cb as HTMLInputElement).checked)).toBeTruthy();
    });

    it('should call onToggleSelect when checkbox is clicked', async () => {
      const mockToggleSelect = vi.fn();
      render(
        <SystemList
          {...defaultProps}
          selectable={true}
          selectedIds={new Set()}
          onToggleSelect={mockToggleSelect}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);

      expect(mockToggleSelect).toHaveBeenCalled();
=======
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
>>>>>>> main
    });
  });
});
