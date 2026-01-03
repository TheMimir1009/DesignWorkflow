/**
 * SystemCreateModal Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemCreateModal } from '../../../src/components/system/SystemCreateModal';

// Mock the systemStore
vi.mock('../../../src/store/systemStore', () => ({
  useSystemStore: vi.fn((selector) => {
    const mockCreateDocument = vi.fn().mockResolvedValue(undefined);
    const mockState = {
      createDocument: mockCreateDocument,
      documents: [{ id: 'mock-id', name: 'Mock Doc' }],
    };

    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  }),
}));

describe('SystemCreateModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCreated: vi.fn(),
    projectId: 'project-1',
    existingCategories: ['Core Mechanics', 'Character'],
    existingTags: ['combat', 'rpg', 'action'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<SystemCreateModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('system-create-modal')).not.toBeInTheDocument();
    });

    it('should render modal when open', () => {
      render(<SystemCreateModal {...defaultProps} />);

      expect(screen.getByTestId('system-create-modal')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display modal title', () => {
      render(<SystemCreateModal {...defaultProps} />);

      expect(screen.getByText('Create System Document')).toBeInTheDocument();
    });

    it('should render form fields', () => {
      render(<SystemCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByText(/tags/i)).toBeInTheDocument();
      expect(screen.getByText(/content/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<SystemCreateModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('should have create button disabled initially', () => {
      render(<SystemCreateModal {...defaultProps} />);

      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).toBeDisabled();
    });
  });

  describe('Form Interactions', () => {
    it('should enable create button when name and category filled', async () => {
      render(<SystemCreateModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      const categoryInput = screen.getByLabelText(/category/i);

      await userEvent.type(nameInput, 'Combat System');
      await userEvent.type(categoryInput, 'Core Mechanics');

      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).not.toBeDisabled();
    });

    it('should show category suggestions when typing', async () => {
      render(<SystemCreateModal {...defaultProps} />);

      const categoryInput = screen.getByLabelText(/category/i);
      await userEvent.click(categoryInput);
      await userEvent.type(categoryInput, 'Core');

      // Suggestions should appear
      expect(screen.getByText('Core Mechanics')).toBeInTheDocument();
    });

    it('should call onClose when cancel button clicked', async () => {
      render(<SystemCreateModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', async () => {
      render(<SystemCreateModal {...defaultProps} />);

      const backdrop = screen.getByTestId('system-create-modal');
      await userEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<SystemCreateModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have labeled form fields', () => {
      render(<SystemCreateModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute('id');

      const categoryInput = screen.getByLabelText(/category/i);
      expect(categoryInput).toHaveAttribute('id');
    });
  });
});
