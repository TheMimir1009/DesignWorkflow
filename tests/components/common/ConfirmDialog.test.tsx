/**
 * ConfirmDialog Component Tests
 * TDD RED Phase: Define expected behavior through failing tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../../../src/components/common/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render default button texts when not provided', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render custom button texts when provided', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmText="Delete"
          cancelText="Keep"
        />
      );

      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside the dialog', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      const backdrop = screen.getByTestId('dialog-backdrop');
      await user.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking inside the dialog', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      const dialogContent = screen.getByRole('dialog');
      await user.click(dialogContent);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('RequireInput Mode', () => {
    const requireInputProps = {
      ...defaultProps,
      requireInput: 'DELETE',
    };

    it('should render input field when requireInput is provided', () => {
      render(<ConfirmDialog {...requireInputProps} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText(/type "DELETE" to confirm/i)).toBeInTheDocument();
    });

    it('should disable confirm button when input does not match', () => {
      render(<ConfirmDialog {...requireInputProps} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when input matches exactly', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...requireInputProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'DELETE');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).not.toBeDisabled();
    });

    it('should not enable confirm button when input partially matches', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...requireInputProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'DELE');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should be case-sensitive for input matching', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...requireInputProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'delete');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should focus the cancel button by default', async () => {
      render(<ConfirmDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
      });
    });

    it('should focus the input when requireInput is provided', async () => {
      render(<ConfirmDialog {...defaultProps} requireInput="DELETE" />);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toHaveFocus();
      });
    });
  });
});
