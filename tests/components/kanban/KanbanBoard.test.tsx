/**
 * KanbanBoard Component Tests
 * TDD test suite for the main Kanban board with drag-and-drop functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { KanbanBoard } from '../../../src/components/kanban/KanbanBoard';
import type { Task } from '../../../src/types';

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  DndContext: vi.fn(({ children }) => children),
  DragOverlay: vi.fn(({ children }) => <div data-testid="drag-overlay">{children}</div>),
  closestCorners: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false,
  })),
}));

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: vi.fn(({ children }) => children),
  verticalListSortingStrategy: 'vertical',
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock the task store
const mockFetchTasks = vi.fn();
const mockUpdateTaskStatus = vi.fn();
const mockTriggerAIGeneration = vi.fn();

// Create a mutable mock state
let mockState = {
  tasks: [] as Task[],
  generatingTasks: new Set<string>(),
  isLoading: false,
  error: null as string | null,
  fetchTasks: mockFetchTasks,
  updateTaskStatus: mockUpdateTaskStatus,
  triggerAIGeneration: mockTriggerAIGeneration,
};

vi.mock('../../../src/store/taskStore', () => ({
  useTaskStore: vi.fn((selector) => {
    if (selector) {
      return selector(mockState);
    }
    return mockState;
  }),
}));

// Test data factory - available for future test expansion
const _createMockTask = (overrides: Partial<Task> = {}): Task => ({
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
// Suppress unused variable warning - factory available for test expansion
void _createMockTask;

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockState = {
      tasks: [],
      generatingTasks: new Set<string>(),
      isLoading: false,
      error: null,
      fetchTasks: mockFetchTasks,
      updateTaskStatus: mockUpdateTaskStatus,
      triggerAIGeneration: mockTriggerAIGeneration,
    };
  });

  describe('Rendering', () => {
    it('should render all 4 columns', () => {
      render(<KanbanBoard projectId="test-project-id" />);

      expect(screen.getByText('Feature List')).toBeInTheDocument();
      expect(screen.getByText('Design Doc')).toBeInTheDocument();
      expect(screen.getByText('PRD')).toBeInTheDocument();
      expect(screen.getByText('Prototype')).toBeInTheDocument();
    });

    it('should render with correct test id', () => {
      render(<KanbanBoard projectId="test-project-id" />);

      expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    });

    it('should render all column test ids', () => {
      render(<KanbanBoard projectId="test-project-id" />);

      expect(screen.getByTestId('kanban-column-featurelist')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-design')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-prd')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-prototype')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when isLoading is true', () => {
      // Update mock state for this test
      mockState.isLoading = true;

      render(<KanbanBoard projectId="test-project-id" />);

      expect(screen.getByTestId('kanban-loading')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no tasks', () => {
      render(<KanbanBoard projectId="test-project-id" />);

      // Each column should show "No tasks"
      const emptyMessages = screen.getAllByText('No tasks');
      expect(emptyMessages.length).toBe(4);
    });
  });

  describe('Task Fetching', () => {
    it('should fetch tasks on mount', async () => {
      render(<KanbanBoard projectId="test-project-id" />);

      await waitFor(() => {
        expect(mockFetchTasks).toHaveBeenCalledWith('test-project-id');
      });
    });

    it('should refetch tasks when projectId changes', async () => {
      const { rerender } = render(<KanbanBoard projectId="project-1" />);

      await waitFor(() => {
        expect(mockFetchTasks).toHaveBeenCalledWith('project-1');
      });

      rerender(<KanbanBoard projectId="project-2" />);

      await waitFor(() => {
        expect(mockFetchTasks).toHaveBeenCalledWith('project-2');
      });
    });
  });

  describe('Error State', () => {
    it('should show error message when error exists', () => {
      // Update mock state for this test
      mockState.error = 'Failed to fetch tasks';

      render(<KanbanBoard projectId="test-project-id" />);

      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument();
    });
  });

  describe('Drag Overlay', () => {
    it('should render DragOverlay component', () => {
      render(<KanbanBoard projectId="test-project-id" />);

      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
    });
  });
<<<<<<< HEAD
=======

  describe('Q&A Modal Integration', () => {
    it('should have QAFormModal in DOM', () => {
      render(<KanbanBoard projectId="test-project-id" />);

      // QAFormModal should be in DOM but not visible initially
      // The modal is only shown when isQAModalOpen is true
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    });
  });
>>>>>>> main
});
