/**
 * SystemSidebar Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemSidebar } from '../../../src/components/system/SystemSidebar';
import type { SystemDocument } from '../../../src/types';

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
    category: 'Character',
    tags: ['progression'],
    content: '# Level System',
    dependencies: [],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

// Mock the systemStore
vi.mock('../../../src/store/systemStore', () => ({
  useSystemStore: vi.fn((selector) => {
    const mockState = {
      documents: mockDocuments,
      categories: ['Core Mechanics', 'Character'],
      allTags: ['combat', 'action', 'progression'],
      isLoading: false,
      fetchDocuments: vi.fn(),
      setSelectedCategory: vi.fn(),
      toggleTag: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
      createDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
    };

    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  }),
  selectFilteredDocuments: vi.fn(() => mockDocuments),
}));

describe('SystemSidebar', () => {
  const defaultProps = {
    projectId: 'project-1',
    isExpanded: true,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sidebar element', () => {
      render(<SystemSidebar {...defaultProps} />);

      expect(screen.getByTestId('system-sidebar')).toBeInTheDocument();
    });

    it('should render collapsed state when not expanded', () => {
      render(<SystemSidebar {...defaultProps} isExpanded={false} />);

      const sidebar = screen.getByTestId('system-sidebar');
      expect(sidebar).toHaveClass('w-12');
    });

    it('should render expanded state when expanded', () => {
      render(<SystemSidebar {...defaultProps} isExpanded={true} />);

      const sidebar = screen.getByTestId('system-sidebar');
      expect(sidebar).toHaveClass('w-80');
    });

    it('should display header text when expanded', () => {
      render(<SystemSidebar {...defaultProps} />);

      expect(screen.getByText('System Documents')).toBeInTheDocument();
    });

    it('should not display header text when collapsed', () => {
      render(<SystemSidebar {...defaultProps} isExpanded={false} />);

      expect(screen.queryByText('System Documents')).not.toBeInTheDocument();
    });
  });

  describe('Toggle Button', () => {
    it('should call onToggle when toggle button clicked', async () => {
      render(<SystemSidebar {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      await userEvent.click(toggleButton);

      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
    });

    it('should show expand label when collapsed', () => {
      render(<SystemSidebar {...defaultProps} isExpanded={false} />);

      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });

    it('should show collapse label when expanded', () => {
      render(<SystemSidebar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should render search input when expanded', () => {
      render(<SystemSidebar {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument();
    });

    it('should not render search input when collapsed', () => {
      render(<SystemSidebar {...defaultProps} isExpanded={false} />);

      expect(screen.queryByPlaceholderText(/search documents/i)).not.toBeInTheDocument();
    });
  });

  describe('Add Button', () => {
    it('should render add document button when expanded', () => {
      render(<SystemSidebar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add document/i })).toBeInTheDocument();
    });
  });

  describe('No Project Selected', () => {
    it('should show message when no project selected', () => {
      render(<SystemSidebar {...defaultProps} projectId={null} />);

      expect(screen.getByText(/select a project to view documents/i)).toBeInTheDocument();
    });

    it('should disable search when no project selected', () => {
      render(<SystemSidebar {...defaultProps} projectId={null} />);

      const searchInput = screen.getByPlaceholderText(/search documents/i);
      expect(searchInput).toBeDisabled();
    });

    it('should disable add button when no project selected', () => {
      render(<SystemSidebar {...defaultProps} projectId={null} />);

      const addButton = screen.getByRole('button', { name: /add document/i });
      expect(addButton).toBeDisabled();
    });
  });

  describe('Filters', () => {
    it('should render category filter when categories exist', () => {
      render(<SystemSidebar {...defaultProps} />);

      expect(screen.getByText(/category/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render tag filters when tags exist', () => {
      render(<SystemSidebar {...defaultProps} />);

      expect(screen.getByText(/tags/i)).toBeInTheDocument();
      // Tags appear as filter buttons and in cards, so use getAllByText
      expect(screen.getAllByText('combat').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('action').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible toggle button', () => {
      render(<SystemSidebar {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should have accessible add button', () => {
      render(<SystemSidebar {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add document/i });
      expect(addButton).toBeInTheDocument();
    });
  });
});
