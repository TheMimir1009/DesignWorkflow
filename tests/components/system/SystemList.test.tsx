/**
 * SystemList Component Tests
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
});
