/**
 * TaskCreateModal Component Tests
 * TDD test suite for task creation modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCreateModal } from '../../../src/components/task/TaskCreateModal';

// Mock the task store
const mockCreateTask = vi.fn();
const mockCloseCreateModal = vi.fn();

vi.mock('../../../src/store/taskStore', () => ({
  useTaskStore: vi.fn((selector) => {
    const state = {
      isCreateModalOpen: true,
      createTask: mockCreateTask,
      closeCreateModal: mockCloseCreateModal,
    };
    if (selector) {
      return selector(state);
    }
    return state;
  }),
}));

describe('TaskCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateTask.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      expect(screen.getByTestId('task-create-modal')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<TaskCreateModal isOpen={false} onClose={() => {}} projectId="project-1" />);

      expect(screen.queryByTestId('task-create-modal')).not.toBeInTheDocument();
    });

    it('should render modal title', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    it('should render title input field', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('should render feature list textarea', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      expect(screen.getByLabelText(/feature list/i)).toBeInTheDocument();
    });

    it('should render create and cancel buttons', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should update title on input', async () => {
      const user = userEvent.setup();
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New Feature');

      expect(titleInput).toHaveValue('New Feature');
    });

    it('should update feature list on input', async () => {
      const user = userEvent.setup();
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      const featureListInput = screen.getByLabelText(/feature list/i);
      await user.type(featureListInput, '# Feature Description');

      expect(featureListInput).toHaveValue('# Feature Description');
    });

    it('should call onClose when cancel button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<TaskCreateModal isOpen={true} onClose={handleClose} projectId="project-1" />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleClose).toHaveBeenCalled();
    });

    it('should call createTask and onClose when form is submitted', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<TaskCreateModal isOpen={true} onClose={handleClose} projectId="project-1" />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'New Feature');

      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'New Feature',
          projectId: 'project-1',
          featureList: '',
        });
      });

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('should include featureList in createTask call', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      render(<TaskCreateModal isOpen={true} onClose={handleClose} projectId="project-1" />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Feature Task');

      const featureListInput = screen.getByLabelText(/feature list/i);
      await user.type(featureListInput, '## Description\nSome content');

      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'Feature Task',
          projectId: 'project-1',
          featureList: '## Description\nSome content',
        });
      });
    });

    it('should clear form after successful creation', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      const { rerender } = render(
        <TaskCreateModal isOpen={true} onClose={handleClose} projectId="project-1" />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Task');

      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalled();
      });

      // Re-render with fresh modal
      rerender(<TaskCreateModal isOpen={true} onClose={handleClose} projectId="project-1" />);

      // Form should be cleared (component remounts with empty state)
      const newTitleInput = screen.getByLabelText(/title/i);
      expect(newTitleInput).toHaveValue('');
    });
  });

  describe('Validation', () => {
    it('should disable create button when title is empty', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).toBeDisabled();
    });

    it('should enable create button when title is provided', async () => {
      const user = userEvent.setup();
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Valid Title');

      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).not.toBeDisabled();
    });

    it('should show required indicator for title field', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      // Title label should have required indicator (asterisk)
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state while creating', async () => {
      mockCreateTask.mockImplementation(() => new Promise(() => {})); // Never resolves
      const user = userEvent.setup();
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Task');

      const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<TaskCreateModal isOpen={true} onClose={() => {}} projectId="project-1" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });
});
