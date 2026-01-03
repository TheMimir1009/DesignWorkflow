/**
 * TaskDeleteConfirm Component Tests
 * TDD test suite for task deletion confirmation dialog
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDeleteConfirm } from '../../../src/components/task/TaskDeleteConfirm';
import type { Task } from '../../../src/types';

// Test data factory
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  projectId: 'project-1',
  title: 'Test Task to Delete',
  status: 'featurelist',
  featureList: 'Feature list content',
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

describe('TaskDeleteConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      expect(screen.getByTestId('task-delete-confirm')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={false}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      expect(screen.queryByTestId('task-delete-confirm')).not.toBeInTheDocument();
    });

    it('should render confirmation title', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      expect(screen.getByText(/delete task/i)).toBeInTheDocument();
    });

    it('should display task title in confirmation message', () => {
      const task = createMockTask({ title: 'Important Feature Task' });
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      expect(screen.getByText(/important feature task/i)).toBeInTheDocument();
    });

    it('should render warning message', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it('should render delete and cancel buttons', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const task = createMockTask();
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={handleClose}
          task={task}
          onConfirm={() => {}}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it('should call onConfirm when delete button is clicked', async () => {
      const task = createMockTask();
      const handleConfirm = vi.fn();
      const user = userEvent.setup();

      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={handleConfirm}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(handleConfirm).toHaveBeenCalled();
    });

    it('should call onClose after successful deletion', async () => {
      const task = createMockTask();
      const handleClose = vi.fn();
      const handleConfirm = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={handleClose}
          task={task}
          onConfirm={handleConfirm}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state while deleting', async () => {
      const task = createMockTask();
      const handleConfirm = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
      const user = userEvent.setup();

      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={handleConfirm}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });

    it('should disable buttons while deleting', async () => {
      const task = createMockTask();
      const handleConfirm = vi.fn().mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={handleConfirm}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper alertdialog role', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to title', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have aria-describedby pointing to description', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveAttribute('aria-describedby');
    });
  });

  describe('Visual Warning', () => {
    it('should have warning icon or styling', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      // Check for warning indicator (could be icon, color, or aria role)
      const warningElement = screen.getByTestId('warning-icon');
      expect(warningElement).toBeInTheDocument();
    });

    it('should have destructive styling on delete button', () => {
      const task = createMockTask();
      render(
        <TaskDeleteConfirm
          isOpen={true}
          onClose={() => {}}
          task={task}
          onConfirm={() => {}}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      // Check for red/danger styling
      expect(deleteButton).toHaveClass('bg-red-600');
    });
  });
});
