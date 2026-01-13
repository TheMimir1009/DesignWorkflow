/**
 * KanbanCard Tests
 * TDD test suite for archive button functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanCard } from '../KanbanCard';
import type { Task } from '../../../types';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => null,
    },
  },
}));

const createMockTask = (status: Task['status'] = 'prototype'): Task => ({
  id: 'task-123',
  projectId: 'project-123',
  title: 'Test Task',
  status,
  featureList: 'Feature list content',
  designDocument: 'Design document content',
  prd: 'PRD content',
  prototype: 'Prototype content',
  references: ['ref-1', 'ref-2'],
  qaAnswers: [],
  revisions: [],
  isArchived: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('KanbanCard - Archive Button', () => {
  const defaultProps = {
    task: createMockTask('prototype'),
    onArchive: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render archive button for prototype tasks', () => {
    render(<KanbanCard {...defaultProps} />);

    expect(screen.getByTestId('archive-button')).toBeInTheDocument();
  });

  it('should not render archive button for non-prototype tasks', () => {
    render(<KanbanCard {...defaultProps} task={createMockTask('design')} />);

    expect(screen.queryByTestId('archive-button')).not.toBeInTheDocument();
  });

  it('should not render archive button for featurelist tasks', () => {
    render(<KanbanCard {...defaultProps} task={createMockTask('featurelist')} />);

    expect(screen.queryByTestId('archive-button')).not.toBeInTheDocument();
  });

  it('should not render archive button for prd tasks', () => {
    render(<KanbanCard {...defaultProps} task={createMockTask('prd')} />);

    expect(screen.queryByTestId('archive-button')).not.toBeInTheDocument();
  });

  it('should call onArchive when archive button is clicked', () => {
    render(<KanbanCard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('archive-button'));

    expect(defaultProps.onArchive).toHaveBeenCalledWith('task-123');
  });

  it('should stop event propagation when archive button is clicked', () => {
    const stopPropagation = vi.fn();
    const originalEvent = Event.prototype.stopPropagation;
    Event.prototype.stopPropagation = stopPropagation;

    render(<KanbanCard {...defaultProps} />);

    fireEvent.click(screen.getByTestId('archive-button'));

    expect(stopPropagation).toHaveBeenCalled();
    Event.prototype.stopPropagation = originalEvent;
  });

  it('should render task title', () => {
    render(<KanbanCard {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render document icons for existing documents', () => {
    render(<KanbanCard {...defaultProps} />);

    expect(screen.getByTestId('icon-featurelist')).toBeInTheDocument();
    expect(screen.getByTestId('icon-design')).toBeInTheDocument();
    expect(screen.getByTestId('icon-prd')).toBeInTheDocument();
    expect(screen.getByTestId('icon-prototype')).toBeInTheDocument();
  });

  it('should display archive button tooltip', () => {
    render(<KanbanCard {...defaultProps} />);

    const archiveButton = screen.getByTestId('archive-button');
    expect(archiveButton).toHaveAttribute('title', 'Archive task');
  });
});
