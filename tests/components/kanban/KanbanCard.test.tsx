/**
 * KanbanCard Component Tests
 * TDD test suite for Kanban card drag-and-drop functionality
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanCard } from '../../../src/components/kanban/KanbanCard';
import type { Task } from '../../../src/types';

// Test data factory
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-task-id',
  projectId: 'test-project-id',
  title: 'Test Task Title',
  status: 'featurelist',
  featureList: 'Test feature list content',
  designDocument: null,
  prd: null,
  prototype: null,
  references: ['ref-1', 'ref-2'],
  qaAnswers: [],
  revisions: [],
  isArchived: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

describe('KanbanCard', () => {
  describe('Rendering', () => {
    it('should render task title', () => {
      const task = createMockTask({ title: 'My Task Title' });
      render(<KanbanCard task={task} />);

      expect(screen.getByText('My Task Title')).toBeInTheDocument();
    });

    it('should render with correct test id', () => {
      const task = createMockTask({ id: 'task-123' });
      render(<KanbanCard task={task} />);

      expect(screen.getByTestId('kanban-card-task-123')).toBeInTheDocument();
    });

    it('should display reference tags', () => {
      const task = createMockTask({
        references: ['Document A', 'Document B'],
      });
      render(<KanbanCard task={task} />);

      expect(screen.getByText('Document A')).toBeInTheDocument();
      expect(screen.getByText('Document B')).toBeInTheDocument();
    });

    it('should show maximum 3 reference tags with +N indicator', () => {
      const task = createMockTask({
        references: ['Ref 1', 'Ref 2', 'Ref 3', 'Ref 4', 'Ref 5'],
      });
      render(<KanbanCard task={task} />);

      expect(screen.getByText('Ref 1')).toBeInTheDocument();
      expect(screen.getByText('Ref 2')).toBeInTheDocument();
      expect(screen.getByText('Ref 3')).toBeInTheDocument();
      expect(screen.queryByText('Ref 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Ref 5')).not.toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not show +N indicator when 3 or fewer references', () => {
      const task = createMockTask({
        references: ['Ref 1', 'Ref 2', 'Ref 3'],
      });
      render(<KanbanCard task={task} />);

      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
    });

    it('should handle empty references array', () => {
      const task = createMockTask({ references: [] });
      render(<KanbanCard task={task} />);

      expect(screen.getByText('Test Task Title')).toBeInTheDocument();
      // Should not crash and should render the card
    });
  });

  describe('Document Status Icons', () => {
    it('should show feature list icon when featureList exists', () => {
      const task = createMockTask({ featureList: 'Some content' });
      render(<KanbanCard task={task} />);

      expect(screen.getByTestId('icon-featurelist')).toBeInTheDocument();
    });

    it('should show design icon when designDocument exists', () => {
      const task = createMockTask({ designDocument: 'Some design' });
      render(<KanbanCard task={task} />);

      expect(screen.getByTestId('icon-design')).toBeInTheDocument();
    });

    it('should show prd icon when prd exists', () => {
      const task = createMockTask({ prd: 'Some PRD' });
      render(<KanbanCard task={task} />);

      expect(screen.getByTestId('icon-prd')).toBeInTheDocument();
    });

    it('should show prototype icon when prototype exists', () => {
      const task = createMockTask({ prototype: 'Some prototype' });
      render(<KanbanCard task={task} />);

      expect(screen.getByTestId('icon-prototype')).toBeInTheDocument();
    });

    it('should show multiple document icons when multiple documents exist', () => {
      const task = createMockTask({
        featureList: 'Feature content',
        designDocument: 'Design content',
        prd: 'PRD content',
      });
      render(<KanbanCard task={task} />);

      expect(screen.getByTestId('icon-featurelist')).toBeInTheDocument();
      expect(screen.getByTestId('icon-design')).toBeInTheDocument();
      expect(screen.getByTestId('icon-prd')).toBeInTheDocument();
    });
  });

  describe('Dragging State', () => {
    it('should apply dragging styles when isDragging is true', () => {
      vi.mock('@dnd-kit/sortable', () => ({
        useSortable: vi.fn(() => ({
          attributes: {},
          listeners: {},
          setNodeRef: vi.fn(),
          transform: null,
          transition: null,
          isDragging: true,
        })),
      }));

      const task = createMockTask();
      render(<KanbanCard task={task} isDragging={true} />);

      const card = screen.getByTestId(`kanban-card-${task.id}`);
      expect(card).toHaveClass('opacity-50');
    });
  });

  describe('Generating State', () => {
    it('should show loading indicator when isGenerating is true', () => {
      const task = createMockTask();
      render(<KanbanCard task={task} isGenerating={true} />);

      expect(screen.getByTestId('generating-indicator')).toBeInTheDocument();
    });

    it('should not show loading indicator when isGenerating is false', () => {
      const task = createMockTask();
      render(<KanbanCard task={task} isGenerating={false} />);

      expect(screen.queryByTestId('generating-indicator')).not.toBeInTheDocument();
    });

    it('should apply generating styles when isGenerating is true', () => {
      const task = createMockTask();
      render(<KanbanCard task={task} isGenerating={true} />);

      const card = screen.getByTestId(`kanban-card-${task.id}`);
      expect(card).toHaveClass('animate-pulse');
    });
  });
});
