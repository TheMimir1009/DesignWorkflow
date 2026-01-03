/**
 * KanbanColumn Component Tests
 * TDD test suite for Kanban column drop zone
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanColumn } from '../../../src/components/kanban/KanbanColumn';
import type { Task } from '../../../src/types';
import type { KanbanColumnDef } from '../../../src/types/kanban';

// Test data factories
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-task-id',
  projectId: 'test-project-id',
  title: 'Test Task Title',
  status: 'featurelist',
  featureList: 'Test feature list content',
  designDocument: null,
  prd: null,
  prototype: null,
  references: [],
  qaAnswers: [],
  revisions: [],
  isArchived: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const mockColumn: KanbanColumnDef = {
  id: 'featurelist',
  title: 'Feature List',
  triggerAI: false,
};

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false,
  })),
}));

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: vi.fn(({ children }) => children),
  verticalListSortingStrategy: 'vertical',
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

describe('KanbanColumn', () => {
  describe('Rendering', () => {
    it('should render column with title', () => {
      render(
        <KanbanColumn
          column={mockColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('Feature List')).toBeInTheDocument();
    });

    it('should render with correct test id', () => {
      render(
        <KanbanColumn
          column={mockColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByTestId('kanban-column-featurelist')).toBeInTheDocument();
    });

    it('should display task count in header', () => {
      const tasks = [
        createMockTask({ id: 'task-1' }),
        createMockTask({ id: 'task-2' }),
        createMockTask({ id: 'task-3' }),
      ];

      render(
        <KanbanColumn
          column={mockColumn}
          tasks={tasks}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render all tasks', () => {
      const tasks = [
        createMockTask({ id: 'task-1', title: 'Task One' }),
        createMockTask({ id: 'task-2', title: 'Task Two' }),
      ];

      render(
        <KanbanColumn
          column={mockColumn}
          tasks={tasks}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('Task One')).toBeInTheDocument();
      expect(screen.getByText('Task Two')).toBeInTheDocument();
    });

    it('should show empty state when no tasks', () => {
      render(
        <KanbanColumn
          column={mockColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('No tasks')).toBeInTheDocument();
    });

    it('should show zero count when no tasks', () => {
      render(
        <KanbanColumn
          column={mockColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Drop Zone', () => {
    it('should render as a drop zone', () => {
      render(
        <KanbanColumn
          column={mockColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      const column = screen.getByTestId('kanban-column-featurelist');
      expect(column).toBeInTheDocument();
    });
  });

  describe('Generating State', () => {
    it('should pass isGenerating to cards for generating tasks', () => {
      const tasks = [
        createMockTask({ id: 'task-1', title: 'Generating Task' }),
        createMockTask({ id: 'task-2', title: 'Normal Task' }),
      ];

      render(
        <KanbanColumn
          column={mockColumn}
          tasks={tasks}
          generatingTasks={new Set(['task-1'])}
        />
      );

      // Card with generating state should show indicator
      expect(screen.getByTestId('generating-indicator')).toBeInTheDocument();
    });
  });

  describe('Different Column Types', () => {
    it('should render design column', () => {
      const designColumn: KanbanColumnDef = {
        id: 'design',
        title: 'Design Doc',
        triggerAI: true,
      };

      render(
        <KanbanColumn
          column={designColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('Design Doc')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-design')).toBeInTheDocument();
    });

    it('should render PRD column', () => {
      const prdColumn: KanbanColumnDef = {
        id: 'prd',
        title: 'PRD',
        triggerAI: true,
      };

      render(
        <KanbanColumn
          column={prdColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('PRD')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-prd')).toBeInTheDocument();
    });

    it('should render prototype column', () => {
      const prototypeColumn: KanbanColumnDef = {
        id: 'prototype',
        title: 'Prototype',
        triggerAI: true,
      };

      render(
        <KanbanColumn
          column={prototypeColumn}
          tasks={[]}
          generatingTasks={new Set()}
        />
      );

      expect(screen.getByText('Prototype')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-prototype')).toBeInTheDocument();
    });
  });
});
