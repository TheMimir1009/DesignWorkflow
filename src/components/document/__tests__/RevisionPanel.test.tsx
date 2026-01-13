/**
 * RevisionPanel Component Tests
 * TAG-DOC-003: AI revision request input panel
 *
 * Test Cases:
 * - TC-DOC-008: Renders textarea for feedback input
 * - TC-DOC-009: Submit button triggers onSubmit callback
 * - TC-DOC-010: Disabled when loading
 * - TC-DOC-011: Validates non-empty feedback before submit
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RevisionPanel } from '../RevisionPanel';

describe('RevisionPanel', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isLoading: false,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-DOC-008: Renders textarea for feedback input', () => {
    it('should render a textarea for feedback', () => {
      render(<RevisionPanel {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should have placeholder text', () => {
      render(<RevisionPanel {...defaultProps} />);
      expect(
        screen.getByPlaceholderText(/revision|feedback|request/i)
      ).toBeInTheDocument();
    });

    it('should allow user to type feedback', () => {
      render(<RevisionPanel {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Please add more details' } });
      expect(textarea).toHaveValue('Please add more details');
    });
  });

  describe('TC-DOC-009: Submit button triggers onSubmit callback', () => {
    it('should render a submit button', () => {
      render(<RevisionPanel {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /submit|request|send/i })
      ).toBeInTheDocument();
    });

    it('should call onSubmit with feedback when button is clicked', () => {
      render(<RevisionPanel {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit|request|send/i });

      fireEvent.change(textarea, { target: { value: 'Add more examples' } });
      fireEvent.click(submitButton);

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('Add more examples');
    });

    it('should clear textarea after successful submission', () => {
      render(<RevisionPanel {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit|request|send/i });

      fireEvent.change(textarea, { target: { value: 'Test feedback' } });
      fireEvent.click(submitButton);

      expect(textarea).toHaveValue('');
    });
  });

  describe('TC-DOC-010: Disabled when loading', () => {
    it('should disable textarea when loading', () => {
      render(<RevisionPanel {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      render(<RevisionPanel {...defaultProps} isLoading={true} />);
      expect(
        screen.getByRole('button', { name: /submit|request|send/i })
      ).toBeDisabled();
    });

    it('should show loading indicator when loading', () => {
      render(<RevisionPanel {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should disable all inputs when disabled prop is true', () => {
      render(<RevisionPanel {...defaultProps} disabled={true} />);
      expect(screen.getByRole('textbox')).toBeDisabled();
      expect(
        screen.getByRole('button', { name: /submit|request|send/i })
      ).toBeDisabled();
    });
  });

  describe('TC-DOC-011: Validates non-empty feedback before submit', () => {
    it('should not call onSubmit when feedback is empty', () => {
      render(<RevisionPanel {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: /submit|request|send/i });

      fireEvent.click(submitButton);

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should show error message for empty submission', () => {
      render(<RevisionPanel {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: /submit|request|send/i });

      fireEvent.click(submitButton);

      expect(screen.getByText(/feedback|required|empty/i)).toBeInTheDocument();
    });

    it('should not call onSubmit when feedback is only whitespace', () => {
      render(<RevisionPanel {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit|request|send/i });

      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.click(submitButton);

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should clear error message when user starts typing', () => {
      render(<RevisionPanel {...defaultProps} />);
      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit|request|send/i });

      // Trigger error
      fireEvent.click(submitButton);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Start typing
      fireEvent.change(textarea, { target: { value: 'New content' } });

      // Error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Panel styling and accessibility', () => {
    it('should have proper aria-label on textarea', () => {
      render(<RevisionPanel {...defaultProps} />);
      expect(
        screen.getByRole('textbox', { name: /revision|feedback/i })
      ).toBeInTheDocument();
    });

    it('should render panel container with testid', () => {
      render(<RevisionPanel {...defaultProps} />);
      expect(screen.getByTestId('revision-panel')).toBeInTheDocument();
    });
  });
});
