/**
 * SystemCard Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemCard } from '../../../src/components/system/SystemCard';
import type { SystemDocument } from '../../../src/types';

describe('SystemCard', () => {
  const mockDocument: SystemDocument = {
    id: 'system-1',
    projectId: 'project-1',
    name: 'Combat System',
    category: 'Core Mechanics',
    tags: ['combat', 'action'],
    content: '# Combat System',
    dependencies: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const defaultProps = {
    document: mockDocument,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onPreview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render document name and category', () => {
    render(<SystemCard {...defaultProps} />);

    expect(screen.getByText('Combat System')).toBeInTheDocument();
    expect(screen.getByText('Core Mechanics')).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(<SystemCard {...defaultProps} />);

    expect(screen.getByText('combat')).toBeInTheDocument();
    expect(screen.getByText('action')).toBeInTheDocument();
  });

  it('should call onPreview when preview button clicked', async () => {
    render(<SystemCard {...defaultProps} />);

    const previewButton = screen.getByRole('button', { name: /preview/i });
    await userEvent.click(previewButton);

    expect(defaultProps.onPreview).toHaveBeenCalledTimes(1);
  });

  it('should call onEdit when edit button clicked', async () => {
    render(<SystemCard {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button clicked', async () => {
    render(<SystemCard {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('should not render tags section when no tags', () => {
    const docWithoutTags = { ...mockDocument, tags: [] };
    render(<SystemCard {...defaultProps} document={docWithoutTags} />);

    expect(screen.queryByText('combat')).not.toBeInTheDocument();
  });

  describe('selectable mode', () => {
    const selectableProps = {
      ...defaultProps,
      selectable: true,
      isSelected: false,
      onToggleSelect: vi.fn(),
    };

    it('should render checkbox when selectable is true', () => {
      render(<SystemCard {...selectableProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should not render checkbox when selectable is false', () => {
      render(<SystemCard {...defaultProps} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should show checkbox as checked when isSelected is true', () => {
      render(<SystemCard {...selectableProps} isSelected={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should show checkbox as unchecked when isSelected is false', () => {
      render(<SystemCard {...selectableProps} isSelected={false} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should call onToggleSelect when checkbox is clicked', async () => {
      const mockToggleSelect = vi.fn();
      render(<SystemCard {...selectableProps} onToggleSelect={mockToggleSelect} />);

      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);

      expect(mockToggleSelect).toHaveBeenCalledWith('system-1');
    });

    it('should not call onToggleSelect when checkbox is clicked but onToggleSelect is not provided', async () => {
      render(<SystemCard {...defaultProps} selectable={true} isSelected={false} />);

      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);

      // Should not throw error
    });

    it('should have proper aria-label for checkbox', () => {
      render(<SystemCard {...selectableProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleName(/select combat system/i);
    });

    it('should show selected styling when isSelected is true', () => {
      const { container } = render(<SystemCard {...selectableProps} isSelected={true} />);

      const card = container.querySelector('[data-testid="system-card"]');
      expect(card).toHaveClass('ring-2');
    });
  });
});
