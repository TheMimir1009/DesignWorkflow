/**
 * SystemEditModal Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemEditModal } from '../../../src/components/system/SystemEditModal';
import type { SystemDocument } from '../../../src/types';

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
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<SystemEditModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('system-edit-modal')).not.toBeInTheDocument();
    });

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

      expect(screen.getByText('Edit System Document')).toBeInTheDocument();
    });

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
    });
  });
});
