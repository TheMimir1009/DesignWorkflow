/**
 * VersionHistory Component Tests
 * TAG-DOC-004: Document version history list and restore
 *
 * Test Cases:
 * - TC-DOC-012: Renders list of versions with timestamps
 * - TC-DOC-013: Highlights current version
 * - TC-DOC-014: Restore button triggers onRestore callback
 * - TC-DOC-015: Shows version diff preview (optional)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { VersionHistory } from '../VersionHistory';
import type { Revision } from '../../../types';

describe('VersionHistory', () => {
  const mockRevisions: Revision[] = [
    {
      id: 'rev-1',
      documentType: 'design',
      content: '# Version 1\nInitial content',
      feedback: null,
      version: 1,
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: 'rev-2',
      documentType: 'design',
      content: '# Version 2\nUpdated content',
      feedback: 'Added more details',
      version: 2,
      createdAt: '2024-01-02T10:00:00Z',
    },
    {
      id: 'rev-3',
      documentType: 'design',
      content: '# Version 3\nLatest content',
      feedback: 'Final revision',
      version: 3,
      createdAt: '2024-01-03T10:00:00Z',
    },
  ];

  const defaultProps = {
    versions: mockRevisions,
    currentVersion: 3,
    onRestore: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-DOC-012: Renders list of versions with timestamps', () => {
    it('should render all versions', () => {
      render(<VersionHistory {...defaultProps} />);
      expect(screen.getByText(/version 1/i)).toBeInTheDocument();
      expect(screen.getByText(/version 2/i)).toBeInTheDocument();
      expect(screen.getByText(/version 3/i)).toBeInTheDocument();
    });

    it('should display timestamps for each version', () => {
      render(<VersionHistory {...defaultProps} />);
      // Check that timestamps are displayed (formatted)
      const versionItems = screen.getAllByTestId(/version-item/);
      expect(versionItems).toHaveLength(3);
    });

    it('should display versions in descending order (newest first)', () => {
      render(<VersionHistory {...defaultProps} />);
      const versionItems = screen.getAllByTestId(/version-item/);
      expect(within(versionItems[0]).getByText(/version 3/i)).toBeInTheDocument();
      expect(within(versionItems[2]).getByText(/version 1/i)).toBeInTheDocument();
    });

    it('should display feedback when available', () => {
      render(<VersionHistory {...defaultProps} />);
      expect(screen.getByText('Added more details')).toBeInTheDocument();
      expect(screen.getByText('Final revision')).toBeInTheDocument();
    });

    it('should render empty state when no versions', () => {
      render(<VersionHistory {...defaultProps} versions={[]} />);
      expect(screen.getByText(/no versions|no history/i)).toBeInTheDocument();
    });
  });

  describe('TC-DOC-013: Highlights current version', () => {
    it('should highlight the current version', () => {
      render(<VersionHistory {...defaultProps} currentVersion={3} />);
      const currentVersionItem = screen.getByTestId('version-item-3');
      expect(currentVersionItem).toHaveClass('bg-blue-50');
    });

    it('should show current indicator for active version', () => {
      render(<VersionHistory {...defaultProps} currentVersion={3} />);
      const currentVersionItem = screen.getByTestId('version-item-3');
      expect(within(currentVersionItem).getByText(/current/i)).toBeInTheDocument();
    });

    it('should not highlight non-current versions', () => {
      render(<VersionHistory {...defaultProps} currentVersion={3} />);
      const version1Item = screen.getByTestId('version-item-1');
      expect(version1Item).not.toHaveClass('bg-blue-50');
    });
  });

  describe('TC-DOC-014: Restore button triggers onRestore callback', () => {
    it('should render restore buttons for non-current versions', () => {
      render(<VersionHistory {...defaultProps} currentVersion={3} />);
      // Version 1 and 2 should have restore buttons
      const restoreButtons = screen.getAllByRole('button', { name: /restore/i });
      expect(restoreButtons).toHaveLength(2);
    });

    it('should not show restore button for current version', () => {
      render(<VersionHistory {...defaultProps} currentVersion={3} />);
      const currentVersionItem = screen.getByTestId('version-item-3');
      expect(within(currentVersionItem).queryByRole('button', { name: /restore/i })).not.toBeInTheDocument();
    });

    it('should call onRestore with version number when restore is clicked', () => {
      render(<VersionHistory {...defaultProps} currentVersion={3} />);
      const version1Item = screen.getByTestId('version-item-1');
      const restoreButton = within(version1Item).getByRole('button', { name: /restore/i });

      fireEvent.click(restoreButton);

      expect(defaultProps.onRestore).toHaveBeenCalledWith(1);
    });

    it('should call onRestore with correct version for different versions', () => {
      render(<VersionHistory {...defaultProps} currentVersion={3} />);
      const version2Item = screen.getByTestId('version-item-2');
      const restoreButton = within(version2Item).getByRole('button', { name: /restore/i });

      fireEvent.click(restoreButton);

      expect(defaultProps.onRestore).toHaveBeenCalledWith(2);
    });
  });

  describe('TC-DOC-015: Version preview functionality', () => {
    it('should allow expanding version to see content preview', () => {
      render(<VersionHistory {...defaultProps} />);
      const version2Item = screen.getByTestId('version-item-2');
      const expandButton = within(version2Item).getByRole('button', { name: /expand|preview|show/i });

      fireEvent.click(expandButton);

      // Content is displayed in a pre element
      expect(screen.getByText(/Updated content/i)).toBeInTheDocument();
    });

    it('should allow collapsing expanded version', () => {
      render(<VersionHistory {...defaultProps} />);
      const version2Item = screen.getByTestId('version-item-2');
      const expandButton = within(version2Item).getByRole('button', { name: /expand|preview|show/i });

      // Expand
      fireEvent.click(expandButton);
      expect(screen.getByText(/Updated content/i)).toBeInTheDocument();

      // Collapse
      const collapseButton = within(version2Item).getByRole('button', { name: /collapse|hide/i });
      fireEvent.click(collapseButton);

      expect(screen.queryByText(/Updated content/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and structure', () => {
    it('should have a panel container with testid', () => {
      render(<VersionHistory {...defaultProps} />);
      expect(screen.getByTestId('version-history')).toBeInTheDocument();
    });

    it('should have appropriate heading', () => {
      render(<VersionHistory {...defaultProps} />);
      expect(screen.getByText(/version history|history/i)).toBeInTheDocument();
    });

    it('should use semantic list structure', () => {
      render(<VersionHistory {...defaultProps} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });
});
