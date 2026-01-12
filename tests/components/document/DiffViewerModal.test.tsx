/**
 * DiffViewerModal Component Tests
 * TDD test suite for SPEC-DOCEDIT-001 Diff Viewer Modal
 *
 * Test Coverage:
 * - Display version comparison between two document versions
 * - Render diff changes with color coding (green for additions, red for deletions)
 * - Display summary statistics (additions, deletions, modifications)
 * - Modal open/close functionality
 * - Display version metadata (version numbers, timestamps, authors)
 * - Handle empty diffs (no changes)
 * - Accessibility and keyboard navigation
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiffViewerModal } from '../../../src/components/document/DiffViewerModal';
import type { DocumentVersion } from '../../../server/utils/versionStorage';

describe('DiffViewerModal', () => {
  const mockVersion1: DocumentVersion = {
    id: 'v1-id',
    taskId: 'task-123',
    content: '# Original Document\n\nThis is the original content.',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    author: 'user@example.com',
    versionNumber: 1,
    changeDescription: 'Initial version',
  };

  const mockVersion2: DocumentVersion = {
    id: 'v2-id',
    taskId: 'task-123',
    content: '# Updated Document\n\nThis is the updated content.\n\nNew section added.',
    timestamp: new Date('2024-01-02T10:00:00Z'),
    author: 'user@example.com',
    versionNumber: 2,
    changeDescription: 'Added new section',
  };

  const defaultProps = {
    isOpen: true,
    version1: mockVersion1,
    version2: mockVersion2,
    onClose: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByTestId('diff-viewer-modal')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<DiffViewerModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('diff-viewer-modal')).not.toBeInTheDocument();
    });

    it('should display version comparison header', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByText(/Version Comparison/i)).toBeInTheDocument();
    });

    it('should display both version numbers', () => {
      render(<DiffViewerModal {...defaultProps} />);

      // Version numbers appear in the comparison text and individual headers
      expect(screen.getByText(/Comparing Version 1 → Version 2/i)).toBeInTheDocument();
    });

    it('should display version timestamps', () => {
      render(<DiffViewerModal {...defaultProps} />);

      // Timestamps are formatted by toLocaleString() - check for year
      // There should be multiple elements with 2024 (one for each timestamp)
      const timestamps = screen.getAllByText(/2024/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('should display version authors', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
    });

    it('should display close button', () => {
      render(<DiffViewerModal {...defaultProps} />);

      // Use aria-label for specific close button
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });
  });

  describe('Diff Display', () => {
    it('should display changes summary section', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByText(/Summary/i)).toBeInTheDocument();
    });

    it('should display additions count', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByText(/Additions/i)).toBeInTheDocument();
    });

    it('should display deletions count', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByText(/Deletions/i)).toBeInTheDocument();
    });

    it('should display modifications count', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByText(/Modifications/i)).toBeInTheDocument();
    });

    it('should display diff changes section', () => {
      render(<DiffViewerModal {...defaultProps} />);

      expect(screen.getByTestId('diff-changes')).toBeInTheDocument();
    });

    it('should render additions in green', () => {
      render(<DiffViewerModal {...defaultProps} />);

      const additions = screen.getAllByTestId(/diff-addition/);
      expect(additions.length).toBeGreaterThan(0);
      additions.forEach((element) => {
        expect(element).toHaveClass('diff-addition');
      });
    });

    it('should render deletions in red with strikethrough', () => {
      render(<DiffViewerModal {...defaultProps} />);

      const deletions = screen.getAllByTestId(/diff-deletion/);
      expect(deletions.length).toBeGreaterThan(0);
      deletions.forEach((element) => {
        expect(element).toHaveClass('diff-deletion');
      });
    });

    it('should display message when no changes detected', () => {
      const noChangeProps = {
        ...defaultProps,
        version2: { ...mockVersion2, content: mockVersion1.content },
      };

      render(<DiffViewerModal {...noChangeProps} />);

      expect(screen.getByText(/No changes detected/i)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<DiffViewerModal {...defaultProps} onClose={mockOnClose} />);

      // Use aria-label for specific close button
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close on Escape key press', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<DiffViewerModal {...defaultProps} onClose={mockOnClose} />);

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close on backdrop click', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<DiffViewerModal {...defaultProps} onClose={mockOnClose} />);

      const backdrop = screen.getByTestId('diff-modal-backdrop');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DiffViewerModal {...defaultProps} />);

      const modal = screen.getByTestId('diff-viewer-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('should trap focus within modal', () => {
      render(<DiffViewerModal {...defaultProps} />);

      // Focus should be on the close button with aria-label
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toHaveFocus();
    });

    it('should have descriptive aria-label', () => {
      render(<DiffViewerModal {...defaultProps} />);

      const modal = screen.getByTestId('diff-viewer-modal');
      expect(modal).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Version comparison')
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content in versions', () => {
      const emptyContentProps = {
        ...defaultProps,
        version1: { ...mockVersion1, content: '' },
        version2: { ...mockVersion2, content: '' },
      };

      render(<DiffViewerModal {...emptyContentProps} />);

      expect(screen.getByText(/No changes detected/i)).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'Line\n'.repeat(1000);
      const longContentProps = {
        ...defaultProps,
        version2: { ...mockVersion2, content: longContent },
      };

      render(<DiffViewerModal {...longContentProps} />);

      const diffContainer = screen.getByTestId('diff-changes');
      expect(diffContainer).toHaveClass('overflow-auto');
    });

    it('should handle missing change descriptions', () => {
      const noDescProps = {
        ...defaultProps,
        version1: { ...mockVersion1, changeDescription: undefined },
        version2: { ...mockVersion2, changeDescription: undefined },
      };

      render(<DiffViewerModal {...noDescProps} />);

      const descriptions = screen.getAllByText(/No description/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should apply correct CSS classes', () => {
      render(<DiffViewerModal {...defaultProps} />);

      const modal = screen.getByTestId('diff-viewer-modal');
      expect(modal).toHaveClass('diff-viewer-modal');
    });

    it('should have scrollable content area', () => {
      render(<DiffViewerModal {...defaultProps} />);

      const content = screen.getByTestId('diff-modal-content');
      expect(content).toHaveClass('overflow-auto');
    });
  });
});
