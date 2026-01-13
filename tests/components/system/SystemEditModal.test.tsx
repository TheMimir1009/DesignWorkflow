/**
 * SystemEditModal Component Tests
<<<<<<< HEAD
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
=======
 * TDD test suite for system document edit modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
>>>>>>> main
import userEvent from '@testing-library/user-event';
import { SystemEditModal } from '../../../src/components/system/SystemEditModal';
import type { SystemDocument } from '../../../src/types';

<<<<<<< HEAD
// Mock the systemStore
vi.mock('../../../src/store/systemStore', () => ({
  useSystemStore: vi.fn((selector) => {
    const mockUpdateDocument = vi.fn().mockResolvedValue(undefined);
    const mockDeleteDocument = vi.fn().mockResolvedValue(undefined);
    const mockState = {
      updateDocument: mockUpdateDocument,
      deleteDocument: mockDeleteDocument,
    };

    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  }),
}));

describe('SystemEditModal', () => {
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
    isOpen: true,
    onClose: vi.fn(),
    onUpdated: vi.fn(),
    onDeleted: vi.fn(),
    projectId: 'project-1',
    existingCategories: ['Core Mechanics', 'Character'],
    existingTags: ['combat', 'rpg', 'action'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
=======
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
>>>>>>> main
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
<<<<<<< HEAD
      render(<SystemEditModal {...defaultProps} isOpen={false} />);
=======
      const system = createMockSystem();
      render(<SystemEditModal isOpen={false} onClose={mockCloseEditModal} system={system} />);
>>>>>>> main

      expect(screen.queryByTestId('system-edit-modal')).not.toBeInTheDocument();
    });

<<<<<<< HEAD
    it('should not render when document is null', () => {
      render(<SystemEditModal {...defaultProps} document={null} />);

      expect(screen.queryByTestId('system-edit-modal')).not.toBeInTheDocument();
    });

    it('should render modal when open with document', () => {
      render(<SystemEditModal {...defaultProps} />);

      expect(screen.getByTestId('system-edit-modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display modal title', () => {
      render(<SystemEditModal {...defaultProps} />);
=======
    it('should render when isOpen is true', () => {
      const system = createMockSystem();
      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);

      expect(screen.getByTestId('system-edit-modal')).toBeInTheDocument();
    });

    it('should render "Edit System Document" header', () => {
      const system = createMockSystem();
      render(<SystemEditModal isOpen={true} onClose={mockCloseEditModal} system={system} />);
>>>>>>> main

      expect(screen.getByText('Edit System Document')).toBeInTheDocument();
    });

<<<<<<< HEAD
    it('should pre-fill form with document data', () => {
      render(<SystemEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveValue('Combat System');

      const categoryInput = screen.getByLabelText(/category/i);
      expect(categoryInput).toHaveValue('Core Mechanics');
    });

    it('should render delete button', () => {
      render(<SystemEditModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<SystemEditModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should enable save button when form is valid', () => {
      render(<SystemEditModal {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should disable save button when name is empty', async () => {
      render(<SystemEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show category suggestions on focus', async () => {
      render(<SystemEditModal {...defaultProps} />);

      const categoryInput = screen.getByLabelText(/category/i);
      await userEvent.click(categoryInput);

      // Suggestions should appear (filter shows categories matching current value)
      // Core Mechanics is current value, so it should match
      expect(screen.getAllByText('Core Mechanics').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Delete Functionality', () => {
    it('should show confirm dialog when delete clicked', async () => {
      render(<SystemEditModal {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);

      // Confirm dialog should appear
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });
  });

  describe('Unsaved Changes', () => {
    it('should show warning when closing with unsaved changes', async () => {
      render(<SystemEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Modified Name');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      // Warning dialog should appear - match dialog title
      expect(screen.getByRole('heading', { name: /unsaved changes/i })).toBeInTheDocument();
    });

    it('should close without warning when no changes', async () => {
      render(<SystemEditModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<SystemEditModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have labeled form fields', () => {
      render(<SystemEditModal {...defaultProps} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
=======
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
>>>>>>> main
    });
  });
});
