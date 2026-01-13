/**
 * Test Suite: GenerationError Component
 * TDD implementation for error display with retry functionality
 *
 * Requirements covered:
 * - REQ-UI-004: Display error messages
 * - REQ-UI-005: Provide retry mechanism
 * - REQ-UI-006: Show error details when available
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GenerationError } from '../GenerationError';

describe('GenerationError', () => {
  describe('basic rendering', () => {
    it('should render error message', () => {
      render(<GenerationError message="Generation failed" />);
      expect(screen.getByText('Generation failed')).toBeInTheDocument();
    });

    it('should not render when no error', () => {
      render(<GenerationError message="" />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should have alert role for accessibility', () => {
      render(<GenerationError message="Error occurred" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('should render retry button when onRetry provided', () => {
      const handleRetry = vi.fn();
      render(
        <GenerationError
          message="Failed to generate"
          onRetry={handleRetry}
        />
      );
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', () => {
      const handleRetry = vi.fn();
      render(
        <GenerationError
          message="Failed"
          onRetry={handleRetry}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should not render retry button when onRetry not provided', () => {
      render(<GenerationError message="Error" />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('dismiss functionality', () => {
    it('should render dismiss button when onDismiss provided', () => {
      const handleDismiss = vi.fn();
      render(
        <GenerationError
          message="Error"
          onDismiss={handleDismiss}
        />
      );
      expect(screen.getByRole('button', { name: /dismiss|close/i })).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button clicked', () => {
      const handleDismiss = vi.fn();
      render(
        <GenerationError
          message="Error"
          onDismiss={handleDismiss}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /dismiss|close/i }));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('error details', () => {
    it('should show error details when provided', () => {
      render(
        <GenerationError
          message="Generation failed"
          details="Claude Code process timed out after 120s"
        />
      );
      expect(screen.getByText(/Claude Code process timed out/)).toBeInTheDocument();
    });

    it('should toggle details visibility', () => {
      render(
        <GenerationError
          message="Error"
          details="Detailed error information"
        />
      );

      // Details should be collapsed by default
      expect(screen.queryByText('Detailed error information')).not.toBeVisible();

      // Click to expand
      fireEvent.click(screen.getByRole('button', { name: /show details|details/i }));
      expect(screen.getByText('Detailed error information')).toBeVisible();
    });

    it('should not show details toggle when no details provided', () => {
      render(<GenerationError message="Simple error" />);
      expect(screen.queryByRole('button', { name: /details/i })).not.toBeInTheDocument();
    });
  });

  describe('error types', () => {
    it('should display timeout error styling', () => {
      render(
        <GenerationError
          message="Request timed out"
          errorType="timeout"
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('data-error-type', 'timeout');
    });

    it('should display network error styling', () => {
      render(
        <GenerationError
          message="Network error"
          errorType="network"
        />
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('data-error-type', 'network');
    });

    it('should display generic error styling by default', () => {
      render(<GenerationError message="Unknown error" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('data-error-type', 'generic');
    });
  });

  describe('styling', () => {
    it('should apply custom className', () => {
      render(
        <GenerationError
          message="Error"
          className="custom-error"
        />
      );
      const container = screen.getByTestId('generation-error');
      expect(container).toHaveClass('custom-error');
    });

    it('should have error icon', () => {
      render(<GenerationError message="Error" />);
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be focusable for keyboard navigation', () => {
      render(<GenerationError message="Error" onRetry={() => {}} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.focus();
      expect(retryButton).toHaveFocus();
    });

    it('should have appropriate aria-live attribute', () => {
      render(<GenerationError message="Error" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });
});
