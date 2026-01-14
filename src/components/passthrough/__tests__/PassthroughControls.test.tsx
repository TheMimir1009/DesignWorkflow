/**
 * PassthroughControls Tests
 * TDD test suite for passthrough controls component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassthroughControls } from '../PassthroughControls';
import type { PipelineStatus } from '../../../types';

describe('PassthroughControls', () => {
  const defaultProps = {
    status: 'idle' as PipelineStatus,
    onStart: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onCancel: vi.fn(),
    onRetry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render controls container', () => {
      render(<PassthroughControls {...defaultProps} />);

      expect(screen.getByTestId('passthrough-controls')).toBeInTheDocument();
    });

    it('should render all control buttons', () => {
      render(<PassthroughControls {...defaultProps} />);

      expect(screen.getByTestId('button-start')).toBeInTheDocument();
      expect(screen.getByTestId('button-pause')).toBeInTheDocument();
      expect(screen.getByTestId('button-resume')).toBeInTheDocument();
      expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('button-retry')).toBeInTheDocument();
    });
  });

  describe('Start Button', () => {
    it('should be enabled when status is idle', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton).not.toBeDisabled();
    });

    it('should be disabled when status is running', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton).toBeDisabled();
    });

    it('should be disabled when status is paused', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton).toBeDisabled();
    });

    it('should be disabled when status is completed', () => {
      render(<PassthroughControls {...defaultProps} status="completed" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton).toBeDisabled();
    });

    it('should be disabled when status is failed', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton).toBeDisabled();
    });

    it('should call onStart when clicked', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const startButton = screen.getByTestId('button-start');
      startButton.click();

      expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
    });

    it('should display "Start Pipeline" text', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      expect(screen.getByText('Start Pipeline')).toBeInTheDocument();
    });
  });

  describe('Pause Button', () => {
    it('should be enabled when status is running', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).not.toBeDisabled();
    });

    it('should be disabled when status is idle', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).toBeDisabled();
    });

    it('should be disabled when status is paused', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).toBeDisabled();
    });

    it('should be disabled when status is completed', () => {
      render(<PassthroughControls {...defaultProps} status="completed" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).toBeDisabled();
    });

    it('should be disabled when status is failed', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).toBeDisabled();
    });

    it('should call onPause when clicked', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const pauseButton = screen.getByTestId('button-pause');
      pauseButton.click();

      expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
    });

    it('should display "Pause" text', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      expect(screen.getByText('Pause')).toBeInTheDocument();
    });
  });

  describe('Resume Button', () => {
    it('should be enabled when status is paused', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton).not.toBeDisabled();
    });

    it('should be disabled when status is idle', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton).toBeDisabled();
    });

    it('should be disabled when status is running', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton).toBeDisabled();
    });

    it('should be disabled when status is completed', () => {
      render(<PassthroughControls {...defaultProps} status="completed" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton).toBeDisabled();
    });

    it('should be disabled when status is failed', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton).toBeDisabled();
    });

    it('should call onResume when clicked', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const resumeButton = screen.getByTestId('button-resume');
      resumeButton.click();

      expect(defaultProps.onResume).toHaveBeenCalledTimes(1);
    });

    it('should display "Resume" text', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      expect(screen.getByText('Resume')).toBeInTheDocument();
    });
  });

  describe('Cancel Button', () => {
    it('should be enabled when status is running', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).not.toBeDisabled();
    });

    it('should be enabled when status is paused', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).not.toBeDisabled();
    });

    it('should be enabled when status is failed', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).not.toBeDisabled();
    });

    it('should be disabled when status is idle', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).toBeDisabled();
    });

    it('should be disabled when status is completed', () => {
      render(<PassthroughControls {...defaultProps} status="completed" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).toBeDisabled();
    });

    it('should call onCancel when clicked', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const cancelButton = screen.getByTestId('button-cancel');
      cancelButton.click();

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should display "Cancel" text', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('should be enabled when status is failed', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton).not.toBeDisabled();
    });

    it('should be disabled when status is idle', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton).toBeDisabled();
    });

    it('should be disabled when status is running', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton).toBeDisabled();
    });

    it('should be disabled when status is paused', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton).toBeDisabled();
    });

    it('should be disabled when status is completed', () => {
      render(<PassthroughControls {...defaultProps} status="completed" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton).toBeDisabled();
    });

    it('should call onRetry when clicked', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const retryButton = screen.getByTestId('button-retry');
      retryButton.click();

      expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
    });

    it('should display "Retry" text', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('should apply primary button style to start button', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton).toHaveClass('bg-blue-600');
    });

    it('should apply warning button style to pause button', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).toHaveClass('bg-yellow-600');
    });

    it('should apply success button style to resume button', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton).toHaveClass('bg-green-600');
    });

    it('should apply danger button style to cancel button', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).toHaveClass('bg-red-600');
    });

    it('should apply info button style to retry button', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton).toHaveClass('bg-purple-600');
    });

    it('should apply opacity-50 to disabled buttons', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).toHaveClass('opacity-50');
    });
  });

  describe('Loading State', () => {
    it('should disable all buttons when loading', () => {
      render(<PassthroughControls {...defaultProps} status="idle" loading />);

      expect(screen.getByTestId('button-start')).toBeDisabled();
      expect(screen.getByTestId('button-pause')).toBeDisabled();
      expect(screen.getByTestId('button-resume')).toBeDisabled();
      expect(screen.getByTestId('button-cancel')).toBeDisabled();
      expect(screen.getByTestId('button-retry')).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      render(<PassthroughControls {...defaultProps} status="idle" loading />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should display play icon on start button', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should display pause icon on pause button', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should display resume icon on resume button', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should display cancel icon on cancel button', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton.querySelector('svg')).toBeInTheDocument();
    });

    it('should display retry icon on retry button', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on start button', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const startButton = screen.getByTestId('button-start');
      expect(startButton).toHaveAttribute('aria-label', 'Start pipeline');
    });

    it('should have proper aria-label on pause button', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const pauseButton = screen.getByTestId('button-pause');
      expect(pauseButton).toHaveAttribute('aria-label', 'Pause pipeline');
    });

    it('should have proper aria-label on resume button', () => {
      render(<PassthroughControls {...defaultProps} status="paused" />);

      const resumeButton = screen.getByTestId('button-resume');
      expect(resumeButton).toHaveAttribute('aria-label', 'Resume pipeline');
    });

    it('should have proper aria-label on cancel button', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).toHaveAttribute('aria-label', 'Cancel pipeline');
    });

    it('should have proper aria-label on retry button', () => {
      render(<PassthroughControls {...defaultProps} status="failed" />);

      const retryButton = screen.getByTestId('button-retry');
      expect(retryButton).toHaveAttribute('aria-label', 'Retry pipeline');
    });
  });

  describe('Prevent Multiple Clicks', () => {
    it('should only call onStart once when clicked multiple times', () => {
      render(<PassthroughControls {...defaultProps} status="idle" />);

      const startButton = screen.getByTestId('button-start');
      startButton.click();
      startButton.click();
      startButton.click();

      expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Layout', () => {
    it('should render buttons in correct order', () => {
      render(<PassthroughControls {...defaultProps} status="running" />);

      const container = screen.getByTestId('passthrough-controls');
      const buttons = container.querySelectorAll('button');

      expect(buttons[0]).toHaveAttribute('data-testid', 'button-start');
      expect(buttons[1]).toHaveAttribute('data-testid', 'button-pause');
      expect(buttons[2]).toHaveAttribute('data-testid', 'button-resume');
      expect(buttons[3]).toHaveAttribute('data-testid', 'button-cancel');
      expect(buttons[4]).toHaveAttribute('data-testid', 'button-retry');
    });

    it('should apply flex layout to container', () => {
      render(<PassthroughControls {...defaultProps} />);

      const container = screen.getByTestId('passthrough-controls');
      expect(container).toHaveClass('flex');
    });
  });
});
