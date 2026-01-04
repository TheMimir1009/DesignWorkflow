/**
 * ReferenceSearchDropdown Component Tests
 * SPEC-REFERENCE-001: Reference System Selection
 *
 * Tests for the dropdown that allows searching and selecting reference documents
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferenceSearchDropdown } from '../../../src/components/reference/ReferenceSearchDropdown';
import { useReferenceStore } from '../../../src/store/referenceStore';
import { useSystemStore } from '../../../src/store/systemStore';
import type { SystemDocument } from '../../../src/types';

// Mock the stores
vi.mock('../../../src/store/referenceStore');
vi.mock('../../../src/store/systemStore');

describe('ReferenceSearchDropdown', () => {
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
      name: 'Economy System',
      category: 'Core Mechanics',
      tags: ['economy'],
      content: '# Economy System',
      dependencies: [],
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'system-3',
      projectId: 'project-1',
      name: 'UI System',
      category: 'Interface',
      tags: ['ui'],
      content: '# UI System',
      dependencies: [],
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  const mockToggleReference = vi.fn();
  const mockIsReferenceSelected = vi.fn();

  const defaultProps = {
    projectId: 'project-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useReferenceStore).mockReturnValue({
      selectedReferences: [],
      removeReference: vi.fn(),
      clearReferences: vi.fn(),
      setSelectedReferences: vi.fn(),
      addReference: vi.fn(),
      toggleReference: mockToggleReference,
      applyDefaultReferences: vi.fn(),
      isReferenceSelected: mockIsReferenceSelected.mockReturnValue(false),
    });

    vi.mocked(useSystemStore).mockReturnValue({
      documents: mockDocuments,
      selectedDocumentIds: [],
      isLoading: false,
      error: null,
      categories: ['Core Mechanics', 'Interface'],
      allTags: ['combat', 'action', 'economy', 'ui'],
      selectedCategory: null,
      selectedTags: [],
      searchQuery: '',
      filteredDocuments: mockDocuments,
      fetchDocuments: vi.fn(),
      createDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
      setSelectedCategory: vi.fn(),
      toggleTag: vi.fn(),
      setSearchQuery: vi.fn(),
      clearFilters: vi.fn(),
    });
  });

  describe('rendering', () => {
    it('should render search input', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should render with testid', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      expect(screen.getByTestId('reference-search-dropdown')).toBeInTheDocument();
    });

    it('should show dropdown when clicking on input', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);

      expect(screen.getByTestId('reference-dropdown-list')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should filter documents by search query', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);
      await userEvent.type(input, 'Combat');

      expect(screen.getByText('Combat System')).toBeInTheDocument();
      expect(screen.queryByText('Economy System')).not.toBeInTheDocument();
      expect(screen.queryByText('UI System')).not.toBeInTheDocument();
    });

    it('should show no results message when no documents match', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);
      await userEvent.type(input, 'NonExistent');

      expect(screen.getByText(/no documents found/i)).toBeInTheDocument();
    });

    it('should search in document name and tags', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);
      await userEvent.type(input, 'economy');

      expect(screen.getByText('Economy System')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('should call toggleReference when document is clicked', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);

      const documentOption = screen.getByText('Combat System');
      await userEvent.click(documentOption);

      expect(mockToggleReference).toHaveBeenCalledWith('system-1');
    });

    it('should show checkmark for selected documents', async () => {
      mockIsReferenceSelected.mockImplementation((id: string) => id === 'system-1');

      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1'],
        removeReference: vi.fn(),
        clearReferences: vi.fn(),
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: mockToggleReference,
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: mockIsReferenceSelected,
      });

      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);

      // Check for checkmark indicator on selected item
      const combatItem = screen.getByTestId('reference-item-system-1');
      expect(within(combatItem).getByTestId('checkmark-icon')).toBeInTheDocument();
    });

    it('should not show checkmark for unselected documents', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);

      const economyItem = screen.getByTestId('reference-item-system-2');
      expect(within(economyItem).queryByTestId('checkmark-icon')).not.toBeInTheDocument();
    });
  });

  describe('dropdown behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <ReferenceSearchDropdown {...defaultProps} />
          <button data-testid="outside-element">Outside</button>
        </div>
      );

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);

      expect(screen.getByTestId('reference-dropdown-list')).toBeInTheDocument();

      await userEvent.click(screen.getByTestId('outside-element'));

      expect(screen.queryByTestId('reference-dropdown-list')).not.toBeInTheDocument();
    });

    it('should show all documents when dropdown opens without search', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);

      expect(screen.getByText('Combat System')).toBeInTheDocument();
      expect(screen.getByText('Economy System')).toBeInTheDocument();
      expect(screen.getByText('UI System')).toBeInTheDocument();
    });
  });

  describe('category grouping', () => {
    it('should group documents by category', async () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      const input = screen.getByPlaceholderText(/search/i);
      await userEvent.click(input);

      expect(screen.getByText('Core Mechanics')).toBeInTheDocument();
      expect(screen.getByText('Interface')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when no projectId provided', () => {
      render(<ReferenceSearchDropdown projectId={null} />);

      const input = screen.getByPlaceholderText(/search/i);
      expect(input).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria labels', () => {
      render(<ReferenceSearchDropdown {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});
