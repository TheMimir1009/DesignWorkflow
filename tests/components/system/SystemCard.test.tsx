/**
 * SystemCard Component Tests
<<<<<<< HEAD
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
=======
 * TDD test suite for system document card display
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemCard } from '../../../src/components/system/SystemCard';
import type { SystemDocument } from '../../../src/types';

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

describe('SystemCard', () => {
  const mockOnToggleSelect = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
>>>>>>> main

  beforeEach(() => {
    vi.clearAllMocks();
  });

<<<<<<< HEAD
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
=======
  describe('Rendering', () => {
    it('should render system name', () => {
      const system = createMockSystem({ name: 'Economy System' });
      render(<SystemCard system={system} />);

      expect(screen.getByText('Economy System')).toBeInTheDocument();
    });

    it('should render with correct test id', () => {
      const system = createMockSystem({ id: 'system-123' });
      render(<SystemCard system={system} />);

      expect(screen.getByTestId('system-card-system-123')).toBeInTheDocument();
    });

    it('should display category badge', () => {
      const system = createMockSystem({ category: 'economy' });
      render(<SystemCard system={system} />);

      expect(screen.getByText('economy')).toBeInTheDocument();
    });

    it('should display tags', () => {
      const system = createMockSystem({ tags: ['core', 'balance'] });
      render(<SystemCard system={system} />);

      expect(screen.getByText('core')).toBeInTheDocument();
      expect(screen.getByText('balance')).toBeInTheDocument();
    });

    it('should display maximum 3 tags with +N indicator', () => {
      const system = createMockSystem({
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      });
      render(<SystemCard system={system} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
      expect(screen.queryByText('tag4')).not.toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should handle empty tags array', () => {
      const system = createMockSystem({ tags: [] });
      render(<SystemCard system={system} />);

      expect(screen.getByText('Test System')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should show checkbox for selection', () => {
      const system = createMockSystem();
      render(<SystemCard system={system} />);
>>>>>>> main

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

<<<<<<< HEAD
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
=======
    it('should show unchecked checkbox when not selected', () => {
      const system = createMockSystem();
      render(<SystemCard system={system} isSelected={false} />);
>>>>>>> main

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

<<<<<<< HEAD
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
=======
    it('should show checked checkbox when selected', () => {
      const system = createMockSystem();
      render(<SystemCard system={system} isSelected={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should call onToggleSelect when checkbox is clicked', () => {
      const system = createMockSystem({ id: 'system-123' });
      render(<SystemCard system={system} onToggleSelect={mockOnToggleSelect} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnToggleSelect).toHaveBeenCalledWith('system-123');
    });

    it('should apply selected styles when isSelected is true', () => {
      const system = createMockSystem();
      render(<SystemCard system={system} isSelected={true} />);

      const card = screen.getByTestId(`system-card-${system.id}`);
      expect(card).toHaveClass('selected');
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      const system = createMockSystem();
      render(<SystemCard system={system} onEdit={mockOnEdit} />);

      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(system);
    });

    it('should call onDelete when delete button is clicked', () => {
      const system = createMockSystem();
      render(<SystemCard system={system} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(system);
>>>>>>> main
    });
  });
});
