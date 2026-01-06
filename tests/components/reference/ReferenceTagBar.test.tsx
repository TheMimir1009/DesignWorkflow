/**
 * ReferenceTagBar Component Tests
 * SPEC-REFERENCE-001: Reference System Selection
 *
 * Tests for the tag bar that displays selected references and allows removal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferenceTagBar } from '../../../src/components/reference/ReferenceTagBar';
import { useReferenceStore } from '../../../src/store/referenceStore';
import { useSystemStore } from '../../../src/store/systemStore';
import type { SystemDocument } from '../../../src/types';

// Mock the stores
vi.mock('../../../src/store/referenceStore');
vi.mock('../../../src/store/systemStore');

describe('ReferenceTagBar', () => {
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

  const mockRemoveReference = vi.fn();
  const mockClearReferences = vi.fn();
  const mockOnSaveAsDefault = vi.fn();

  const defaultProps = {
    projectId: 'project-1',
    onSaveAsDefault: mockOnSaveAsDefault,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation - no references selected
    vi.mocked(useReferenceStore).mockReturnValue({
      selectedReferences: [],
      removeReference: mockRemoveReference,
      clearReferences: mockClearReferences,
      setSelectedReferences: vi.fn(),
      addReference: vi.fn(),
      toggleReference: vi.fn(),
      applyDefaultReferences: vi.fn(),
      isReferenceSelected: vi.fn().mockReturnValue(false),
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
    it('should render empty state when no references selected', () => {
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByText(/no references selected/i)).toBeInTheDocument();
    });

    it('should render selected reference tags', () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1', 'system-2'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByText('Combat System')).toBeInTheDocument();
      expect(screen.getByText('Economy System')).toBeInTheDocument();
    });

    it('should display reference count', () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1', 'system-2', 'system-3'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByText(/3/)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call removeReference when remove button clicked on tag', async () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove combat system/i });
      await userEvent.click(removeButton);

      expect(mockRemoveReference).toHaveBeenCalledWith('system-1');
    });

    it('should call clearReferences when clear all button clicked', async () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1', 'system-2'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await userEvent.click(clearButton);

      expect(mockClearReferences).toHaveBeenCalledTimes(1);
    });

    it('should not show clear all button when no references selected', () => {
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
    });

    it('should call onSaveAsDefault when save as default button is clicked', async () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save as default/i });
      await userEvent.click(saveButton);

      expect(mockOnSaveAsDefault).toHaveBeenCalledTimes(1);
    });

    it('should show save as default button when references are selected', () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /save as default/i })).toBeInTheDocument();
    });
  });

  describe('missing documents handling', () => {
    it('should handle references to non-existent documents gracefully', () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1', 'non-existent-id'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      // Should show existing document
      expect(screen.getByText('Combat System')).toBeInTheDocument();
      // Should show unknown for non-existent
      expect(screen.getByText(/unknown/i)).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when no projectId provided', () => {
      render(<ReferenceTagBar projectId={null} onSaveAsDefault={mockOnSaveAsDefault} />);

      expect(screen.getByText(/select a project/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria labels for tag remove buttons', () => {
      vi.mocked(useReferenceStore).mockReturnValue({
        selectedReferences: ['system-1'],
        removeReference: mockRemoveReference,
        clearReferences: mockClearReferences,
        setSelectedReferences: vi.fn(),
        addReference: vi.fn(),
        toggleReference: vi.fn(),
        applyDefaultReferences: vi.fn(),
        isReferenceSelected: vi.fn().mockReturnValue(true),
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /remove combat system/i })).toBeInTheDocument();
    });

    it('should have proper testid for the component', () => {
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByTestId('reference-tag-bar')).toBeInTheDocument();
    });
  });
});
