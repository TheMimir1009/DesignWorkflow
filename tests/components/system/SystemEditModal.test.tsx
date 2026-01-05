/**
 * SystemEditModal Component Tests
 * TDD test suite for system document edit modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemEditModal } from '../../../src/components/system/SystemEditModal';
import type { SystemDocument } from '../../../src/types';

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

describe('SystemEditModal', () => {
  const mockUpdateSystem = vi.fn();
  const mockCloseEditModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSystemStore).mockImplementation(createStoreMock({
      updateSystem: mockUpdateSystem,
      closeEditModal: mockCloseEditModal,
    }));
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const system = createMockSystem();
      render(<SystemEditModal isOpen={false} onClose={mockCloseEditModal} system={system} />);

      expect(screen.queryByTestId('system-edit-modal')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      const system = createMockSystem();
      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      expect(screen.getByTestId('system-edit-modal')).toBeInTheDocument();
    });

    it('should render "Edit System Document" header', () => {
      const system = createMockSystem();
      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      expect(screen.getByText('Edit System Document')).toBeInTheDocument();
    });

    it('should populate form with system data', () => {
      const system = createMockSystem({
        name: 'Economy System',
        category: 'economy',
        tags: ['core', 'balance'],
        content: '# Economy\n\nDescription.',
      });

      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      expect(screen.getByLabelText(/name/i)).toHaveValue('Economy System');
      expect(screen.getByLabelText(/category/i)).toHaveValue('economy');
      expect(screen.getByLabelText(/tags/i)).toHaveValue('core, balance');
      expect(screen.getByLabelText(/content/i)).toHaveValue('# Economy\n\nDescription.');
    });
  });

  describe('Form Validation', () => {
    it('should disable Save button when name is empty', async () => {
      const user = userEvent.setup();
      const system = createMockSystem();
      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable Save button when form is valid', () => {
      const system = createMockSystem();
      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call updateSystem with correct data on submit', async () => {
      mockUpdateSystem.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      const system = createMockSystem({ id: 'system-123' });

      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockUpdateSystem).toHaveBeenCalledWith('system-123', expect.objectContaining({
          name: 'Updated Name',
        }));
      });
    });

    it('should close modal after successful update', async () => {
      mockUpdateSystem.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();
      const system = createMockSystem();

      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockCloseEditModal).toHaveBeenCalled();
      });
    });

    it('should show loading state while saving', async () => {
      mockUpdateSystem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      const system = createMockSystem();

      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });

  describe('Cancel action', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const system = createMockSystem();

      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockCloseEditModal).toHaveBeenCalled();
    });

    it('should discard changes when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const system = createMockSystem({ name: 'Original Name' });

      const { rerender } = render(
        <SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />
      );

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Changed Name');

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Reopen modal
      rerender(
        <SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue('Original Name');
    });
  });
});
