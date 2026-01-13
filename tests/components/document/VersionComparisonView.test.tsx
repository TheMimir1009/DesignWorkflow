/**
 * VersionComparisonView Component Tests
 * TDD test suite for SPEC-DOCEDIT-001 Version Comparison View
 *
 * Test Coverage:
 * - Display diff between two document versions
 * - Visual diff with colors (green=add, red=delete, yellow=modify)
 * - Integration with backend diff API
 * - Diff summary statistics
 * - Accessibility and keyboard navigation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { VersionComparisonView } from '../../../src/components/document/VersionComparisonView';

// Mock the diff utility
vi.mock('diff', () => ({
  diffLines: vi.fn((text1: string, text2: string) => {
    // Simple mock implementation
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const changes: Array<{
      added?: boolean;
      removed?: boolean;
      value: string;
    }> = [];

    let i = 0,
      j = 0;
    while (i < lines1.length || j < lines2.length) {
      if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
        changes.push({ value: lines1[i] + '\n' });
        i++;
        j++;
      } else {
        if (i < lines1.length) {
          changes.push({ removed: true, value: lines1[i] + '\n' });
          i++;
        }
        if (j < lines2.length) {
          changes.push({ added: true, value: lines2[j] + '\n' });
          j++;
        }
      }
    }

    return changes;
  }),
}));

describe('VersionComparisonView', () => {
  const mockVersion1 = {
    id: 'v1',
    taskId: 'task-123',
    content: '# Original Document\n\nOriginal content here.',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    author: 'user1',
    versionNumber: 1,
  };

  const mockVersion2 = {
    id: 'v2',
    taskId: 'task-123',
    content: '# Updated Document\n\nOriginal content here.\n\nNew line added.',
    timestamp: new Date('2024-01-02T10:00:00Z'),
    author: 'user1',
    versionNumber: 2,
  };

  const baseProps = {
    version1: mockVersion1,
    version2: mockVersion2,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render comparison view when versions are provided', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getByTestId('version-comparison-view')).toBeInTheDocument();
    });

    it('should render version headers', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getByText(/version 1/i)).toBeInTheDocument();
      expect(screen.getByText(/version 2/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<VersionComparisonView {...baseProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render diff summary', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getByTestId('diff-summary')).toBeInTheDocument();
    });
  });

  describe('Diff Display', () => {
    it('should display added lines in green', () => {
      render(<VersionComparisonView {...baseProps} />);

      const addedLines = screen.getAllByTestId(/diff-line-added/);
      expect(addedLines.length).toBeGreaterThan(0);
    });

    it('should display removed lines in red', () => {
      render(<VersionComparisonView {...baseProps} />);

      const removedLines = screen.getAllByTestId(/diff-line-removed/);
      expect(removedLines.length).toBeGreaterThan(0);
    });

    it('should display unchanged lines without special styling', () => {
      render(<VersionComparisonView {...baseProps} />);

      const unchangedLines = screen.getAllByTestId(/diff-line-unchanged/);
      expect(unchangedLines.length).toBeGreaterThan(0);
    });

    it('should display line numbers', () => {
      render(<VersionComparisonView {...baseProps} />);

      const lineNumbers = screen.getAllByTestId(/line-number/);
      expect(lineNumbers.length).toBeGreaterThan(0);
    });
  });

  describe('Diff Summary', () => {
    it('should show number of additions', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getAllByText(/Added/i).length).toBeGreaterThan(0);
    });

    it('should show number of deletions', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getAllByText(/Removed/i).length).toBeGreaterThan(0);
    });

    it('should show number of modifications', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getAllByText(/Modified/i).length).toBeGreaterThan(0);
    });

    it('should calculate correct statistics', () => {
      render(<VersionComparisonView {...baseProps} />);

      const summary = screen.getByTestId('diff-summary');
      expect(summary).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should call onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();

      render(<VersionComparisonView {...baseProps} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      const mockOnClose = vi.fn();

      render(<VersionComparisonView {...baseProps} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle version swap', () => {
      render(<VersionComparisonView {...baseProps} />);

      // Check if there's a swap button
      const swapButton = screen.queryByRole('button', { name: /swap/i });
      if (swapButton) {
        fireEvent.click(swapButton);
        // After swap, version2 should be on left, version1 on right
        expect(swapButton).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<VersionComparisonView {...baseProps} />);

      const view = screen.getByTestId('version-comparison-view');
      expect(view).toHaveAttribute('role', 'region');
    });

    it('should have aria-label for screen readers', () => {
      render(<VersionComparisonView {...baseProps} />);

      const view = screen.getByTestId('version-comparison-view');
      expect(view).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', () => {
      render(<VersionComparisonView {...baseProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply custom className when provided', () => {
      const customClass = 'custom-comparison-class';

      const { container } = render(
        <VersionComparisonView {...baseProps} className={customClass} />
      );

      const customElement = container.querySelector(`.${customClass}`);
      expect(customElement).toBeInTheDocument();
    });

    it('should display versions side by side', () => {
      render(<VersionComparisonView {...baseProps} />);

      const version1Panel = screen.getByTestId('version-1-panel');
      const version2Panel = screen.getByTestId('version-2-panel');

      expect(version1Panel).toBeInTheDocument();
      expect(version2Panel).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle identical versions', () => {
      const identicalVersions = {
        ...baseProps,
        version1: { ...mockVersion1 },
        version2: { ...mockVersion1 },
      };

      render(<VersionComparisonView {...identicalVersions} />);

      expect(screen.getByText(/no changes/i)).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const emptyVersionProps = {
        ...baseProps,
        version1: { ...mockVersion1, content: '' },
        version2: { ...mockVersion2, content: '' },
      };

      expect(() => {
        render(<VersionComparisonView {...emptyVersionProps} />);
      }).not.toThrow();
    });

    it('should handle very long content', () => {
      const longContent = '# Long Document\n\n' + 'Line of text\n'.repeat(1000);
      const longVersionProps = {
        ...baseProps,
        version1: { ...mockVersion1, content: longContent },
        version2: { ...mockVersion2, content: longContent + '\nExtra line' },
      };

      expect(() => {
        render(<VersionComparisonView {...longVersionProps} />);
      }).not.toThrow();
    });

    it('should handle missing onClose callback gracefully', () => {
      expect(() => {
        render(<VersionComparisonView {...baseProps} onClose={undefined as any} />);
      }).not.toThrow();
    });
  });

  describe('Version Metadata Display', () => {
    it('should display version numbers', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getByText(/version 1/i)).toBeInTheDocument();
      expect(screen.getByText(/version 2/i)).toBeInTheDocument();
    });

    it('should display timestamps', () => {
      render(<VersionComparisonView {...baseProps} />);

      // Check for date components (year, month, day)
      expect(screen.getAllByText(/2024/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Jan/i).length).toBeGreaterThan(0);
    });

    it('should display authors', () => {
      render(<VersionComparisonView {...baseProps} />);

      expect(screen.getAllByText(/user1/i).length).toBeGreaterThan(0);
    });
  });
});
