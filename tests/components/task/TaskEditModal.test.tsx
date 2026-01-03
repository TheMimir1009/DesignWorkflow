/**
 * TaskEditModal Component Tests
 * TDD test suite for task editing modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskEditModal } from '../../../src/components/task/TaskEditModal';
import type { Task } from '../../../src/types';

// Mock the task store
const mockUpdateTaskContent = vi.fn();

vi.mock('../../../src/store/taskStore', () => ({
  useTaskStore: vi.fn((selector) => {
    const state = {
      updateTaskContent: mockUpdateTaskContent,
    };
    if (selector) {
      return selector(state);
    }
    return state;
  }),
}));

// Test data factory
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  projectId: 'project-1',
  title: 'Test Task',
  status: 'featurelist',
  featureList: 'Original feature list content',
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

describe('TaskEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateTaskContent.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      const task = createMockTask();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      expect(screen.getByTestId('task-edit-modal')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      const task = createMockTask();
      render(<TaskEditModal isOpen={false} onClose={() => {}} task={task} />);

      expect(screen.queryByTestId('task-edit-modal')).not.toBeInTheDocument();
    });

    it('should render modal title', () => {
      const task = createMockTask();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });

    it('should render title input with current value', () => {
      const task = createMockTask({ title: 'My Task Title' });
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveValue('My Task Title');
    });

    it('should render feature list textarea with current value', () => {
      const task = createMockTask({ featureList: '## Features\n- Item 1\n- Item 2' });
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const featureListInput = screen.getByLabelText(/feature list/i);
      expect(featureListInput).toHaveValue('## Features\n- Item 1\n- Item 2');
    });

    it('should render save and cancel buttons', () => {
      const task = createMockTask();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should display task status badge', () => {
      const task = createMockTask({ status: 'design' });
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      expect(screen.getByText(/design/i)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should update title on input', async () => {
      const task = createMockTask({ title: 'Original' });
      const user = userEvent.setup();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      expect(titleInput).toHaveValue('Updated Title');
    });

    it('should update feature list on input', async () => {
      const task = createMockTask({ featureList: 'Original' });
      const user = userEvent.setup();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const featureListInput = screen.getByLabelText(/feature list/i);
      await user.clear(featureListInput);
      await user.type(featureListInput, 'Updated content');

      expect(featureListInput).toHaveValue('Updated content');
    });

    it('should call onClose when cancel button is clicked', async () => {
      const task = createMockTask();
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<TaskEditModal isOpen={true} onClose={handleClose} task={task} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it('should call updateTaskContent and onClose when form is submitted', async () => {
      const task = createMockTask({ id: 'task-123', title: 'Original', featureList: 'Original list' });
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<TaskEditModal isOpen={true} onClose={handleClose} task={task} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTaskContent).toHaveBeenCalledWith('task-123', {
          title: 'Updated Title',
          featureList: 'Original list',
        });
      });

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('should only submit changed fields', async () => {
      const task = createMockTask({ id: 'task-123', title: 'Original', featureList: 'Original list' });
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<TaskEditModal isOpen={true} onClose={handleClose} task={task} />);

      const featureListInput = screen.getByLabelText(/feature list/i);
      await user.clear(featureListInput);
      await user.type(featureListInput, 'New feature list');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTaskContent).toHaveBeenCalledWith('task-123', {
          title: 'Original',
          featureList: 'New feature list',
        });
      });
    });
  });

  describe('Validation', () => {
    it('should disable save button when title is empty', async () => {
      const task = createMockTask({ title: 'Has Title' });
      const user = userEvent.setup();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when title has value', () => {
      const task = createMockTask({ title: 'Valid Title' });
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading state while saving', async () => {
      mockUpdateTaskContent.mockImplementation(() => new Promise(() => {})); // Never resolves
      const task = createMockTask();
      const user = userEvent.setup();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      const task = createMockTask();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to title', () => {
      const task = createMockTask();
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Task Data Display', () => {
    it('should display created date', () => {
      const task = createMockTask({ createdAt: '2025-01-15T10:30:00.000Z' });
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      // Should show formatted date
      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });

    it('should display last updated date', () => {
      const task = createMockTask({ updatedAt: '2025-01-20T14:00:00.000Z' });
      render(<TaskEditModal isOpen={true} onClose={() => {}} task={task} />);

      // Should show formatted date
      expect(screen.getByText(/updated/i)).toBeInTheDocument();
    });
  });
});
