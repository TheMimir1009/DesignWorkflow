/**
 * SystemCreateModal Component Tests
 * TDD test suite for system document creation modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemCreateModal } from '../../../src/components/system/SystemCreateModal';

// Mock systemStore
vi.mock('../../../src/store/systemStore', () => ({
  useSystemStore: vi.fn(),
}));

import { useSystemStore } from '../../../src/store/systemStore';

// Helper to create store mock that works with selectors
const createStoreMock = (storeState: Record<string, unknown>) => {
  return (selector?: (state: Record<string, unknown>) => unknown) => {
    if (typeof selector === 'function') {
      return selector(storeState);
    }
    return storeState;
  };
};

describe('SystemCreateModal', () => {
  const mockCreateSystem = vi.fn();
  const mockCloseCreateModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSystemStore).mockImplementation(createStoreMock({
      createSystem: mockCreateSystem,
      closeCreateModal: mockCloseCreateModal,
      isCreateModalOpen: true,
    }));
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<SystemCreateModal isOpen={false} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.queryByTestId('system-create-modal')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.getByTestId('system-create-modal')).toBeInTheDocument();
    });

    it('should render "Create System Document" header', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.getByText('Create System Document')).toBeInTheDocument();
    });

    it('should render name input field', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('should render category select field', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    it('should render tags input field', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    it('should render content textarea', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    });

    it('should render Cancel and Create buttons', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable Create button when name is empty', () => {
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).toBeDisabled();
    });

    it('should disable Create button when category is not selected', async () => {
      const user = userEvent.setup();
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      await user.type(screen.getByLabelText(/name/i), 'Test System');

      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).toBeDisabled();
    });

    it('should enable Create button when name and category are provided', async () => {
      const user = userEvent.setup();
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      await user.type(screen.getByLabelText(/name/i), 'Test System');
      await user.selectOptions(screen.getByLabelText(/category/i), 'economy');

      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call createSystem with correct data on submit', async () => {
      mockCreateSystem.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();

      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      await user.type(screen.getByLabelText(/name/i), 'New Economy System');
      await user.selectOptions(screen.getByLabelText(/category/i), 'economy');
      await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2');
      await user.type(screen.getByLabelText(/content/i), '# Content\n\nDescription here.');

      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockCreateSystem).toHaveBeenCalledWith('test-project', {
          name: 'New Economy System',
          category: 'economy',
          tags: ['tag1', 'tag2'],
          content: '# Content\n\nDescription here.',
        });
      });
    });

    it('should close modal after successful creation', async () => {
      mockCreateSystem.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();

      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      await user.type(screen.getByLabelText(/name/i), 'Test System');
      await user.selectOptions(screen.getByLabelText(/category/i), 'economy');
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockCloseCreateModal).toHaveBeenCalled();
      });
    });

    it('should reset form after successful creation', async () => {
      mockCreateSystem.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();

      const { rerender } = render(
        <SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />
      );

      await user.type(screen.getByLabelText(/name/i), 'Test System');
      await user.selectOptions(screen.getByLabelText(/category/i), 'economy');
      await user.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockCloseCreateModal).toHaveBeenCalled();
      });

      // Reopen modal - form should be reset
      rerender(
        <SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue('');
    });

    it('should show loading state while creating', async () => {
      mockCreateSystem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();

      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      await user.type(screen.getByLabelText(/name/i), 'Test System');
      await user.selectOptions(screen.getByLabelText(/category/i), 'economy');
      await user.click(screen.getByRole('button', { name: /create/i }));

      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });
  });

  describe('Cancel action', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockCloseCreateModal).toHaveBeenCalled();
    });

    it('should reset form when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />
      );

      await user.type(screen.getByLabelText(/name/i), 'Test System');
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Reopen modal
      rerender(
        <SystemCreateModal isOpen={true} onClose={mockCloseCreateModal} projectId="test-project" />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue('');
    });
  });
});
