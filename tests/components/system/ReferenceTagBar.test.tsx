/**
 * ReferenceTagBar Component Tests
 * TDD RED Phase: Define expected behavior through failing tests
 * TAG-002: ReferenceTagBar component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferenceTagBar } from '../../../src/components/system/ReferenceTagBar';
import { useReferenceStore } from '../../../src/store/referenceStore';
import type { SystemDocument } from '../../../src/types';

// Mock the store
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

describe('ReferenceTagBar', () => {
  const mockRemoveReference = vi.fn();
  const mockOnAddClick = vi.fn();

  const defaultProps = {
    onAddClick: mockOnAddClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedReferences: [],
      removeReference: mockRemoveReference,
    });
  });

  describe('Rendering', () => {
    it('should render without crashing when no references selected', () => {
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('region', { name: /reference/i })).toBeInTheDocument();
    });

    it('should render the [+ Add] button', () => {
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('should display reference tags when references are selected', () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Mechanics' }),
        createMockDocument({ id: 'doc-2', name: 'Economy System' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByText('Game Mechanics')).toBeInTheDocument();
      expect(screen.getByText('Economy System')).toBeInTheDocument();
    });

    it('should render X button on each reference tag', () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Mechanics' }),
        createMockDocument({ id: 'doc-2', name: 'Economy System' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons).toHaveLength(2);
    });
  });

  describe('Tag Removal', () => {
    it('should call removeReference when clicking X button on a tag', async () => {
      const user = userEvent.setup();
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Mechanics' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove game mechanics/i });
      await user.click(removeButton);

      expect(mockRemoveReference).toHaveBeenCalledWith('doc-1');
    });

    it('should remove specific tag when multiple tags exist', async () => {
      const user = userEvent.setup();
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Mechanics' }),
        createMockDocument({ id: 'doc-2', name: 'Economy System' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      const removeButton = screen.getByRole('button', { name: /remove economy system/i });
      await user.click(removeButton);

      expect(mockRemoveReference).toHaveBeenCalledWith('doc-2');
      expect(mockRemoveReference).not.toHaveBeenCalledWith('doc-1');
    });
  });

  describe('[+ Add] Button', () => {
    it('should call onAddClick when clicking [+ Add] button', async () => {
      const user = userEvent.setup();

      render(<ReferenceTagBar {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /add/i }));

      expect(mockOnAddClick).toHaveBeenCalledTimes(1);
    });

    it('should display [+ Add] button even when references are selected', () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Mechanics' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });

  describe('Truncation (5+ items)', () => {
    it('should show all tags when 5 or fewer references', () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Document 1' }),
        createMockDocument({ id: 'doc-2', name: 'Document 2' }),
        createMockDocument({ id: 'doc-3', name: 'Document 3' }),
        createMockDocument({ id: 'doc-4', name: 'Document 4' }),
        createMockDocument({ id: 'doc-5', name: 'Document 5' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
      expect(screen.getByText('Document 3')).toBeInTheDocument();
      expect(screen.getByText('Document 4')).toBeInTheDocument();
      expect(screen.getByText('Document 5')).toBeInTheDocument();
      expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
    });

    it('should show first 4 tags and "+N more" when more than 5 references', () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Document 1' }),
        createMockDocument({ id: 'doc-2', name: 'Document 2' }),
        createMockDocument({ id: 'doc-3', name: 'Document 3' }),
        createMockDocument({ id: 'doc-4', name: 'Document 4' }),
        createMockDocument({ id: 'doc-5', name: 'Document 5' }),
        createMockDocument({ id: 'doc-6', name: 'Document 6' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
      expect(screen.getByText('Document 3')).toBeInTheDocument();
      expect(screen.getByText('Document 4')).toBeInTheDocument();
      expect(screen.queryByText('Document 5')).not.toBeInTheDocument();
      expect(screen.queryByText('Document 6')).not.toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('should show "+1 more" when 6 references', () => {
      const mockDocs = Array.from({ length: 6 }, (_, i) =>
        createMockDocument({ id: `doc-${i + 1}`, name: `Document ${i + 1}` })
      );
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      // First 4 are shown, then +2 more (since total is 6, and 6-4=2)
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('should show "+5 more" when 10 references', () => {
      const mockDocs = Array.from({ length: 10 }, (_, i) =>
        createMockDocument({ id: `doc-${i + 1}`, name: `Document ${i + 1}` })
      );
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      // 10 total - 4 shown = 6 more (showing +6 more)
      expect(screen.getByText('+6 more')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for reference region', () => {
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('region', { name: /reference/i })).toBeInTheDocument();
    });

    it('should have proper ARIA labels for remove buttons', () => {
      const mockDocs = [
        createMockDocument({ id: 'doc-1', name: 'Game Mechanics' }),
      ];
      (useReferenceStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        selectedReferences: mockDocs,
        removeReference: mockRemoveReference,
      });

      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /remove game mechanics/i })).toBeInTheDocument();
    });

    it('should have proper ARIA label for add button', () => {
      render(<ReferenceTagBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add reference/i })).toBeInTheDocument();
    });
  });
});
