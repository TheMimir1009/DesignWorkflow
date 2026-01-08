/**
 * Test Suite: GenerationProgress Component
 * TDD implementation for generation progress indicator
 *
 * Requirements covered:
 * - REQ-UI-001: Display generation progress
 * - REQ-UI-002: Show current generation step
 * - REQ-UI-003: Support determinate and indeterminate progress
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationProgress } from '../GenerationProgress';

describe('GenerationProgress', () => {
  describe('basic rendering', () => {
    it('should render progress indicator when loading', () => {
      render(<GenerationProgress isLoading={true} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should not render when not loading', () => {
      render(<GenerationProgress isLoading={false} />);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should display current step label', () => {
      render(
        <GenerationProgress
          isLoading={true}
          currentStep="Generating design document"
        />
      );
      // Multiple elements may have this text (visible + sr-only)
      const elements = screen.getAllByText('Generating design document');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('progress states', () => {
    it('should show indeterminate progress when no percentage provided', () => {
      render(<GenerationProgress isLoading={true} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
    });

    it('should show determinate progress when percentage provided', () => {
      render(<GenerationProgress isLoading={true} progress={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should clamp progress to 0-100 range', () => {
      render(<GenerationProgress isLoading={true} progress={150} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });

    it('should handle negative progress values', () => {
      render(<GenerationProgress isLoading={true} progress={-10} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('step progression', () => {
    it('should display step count when provided', () => {
      render(
        <GenerationProgress
          isLoading={true}
          currentStepIndex={2}
          totalSteps={5}
        />
      );
      expect(screen.getByText(/step 2.*5/i)).toBeInTheDocument();
    });

    it('should show step labels when multiple steps provided', () => {
      const steps = ['Analyzing', 'Generating', 'Formatting'];
      render(
        <GenerationProgress
          isLoading={true}
          steps={steps}
          currentStepIndex={1}
        />
      );
      // Multiple elements may have this text (visible + sr-only)
      const elements = screen.getAllByText('Generating');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('visual feedback', () => {
    it('should have animated spinner for indeterminate state', () => {
      render(<GenerationProgress isLoading={true} />);
      expect(screen.getByTestId('generation-spinner')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <GenerationProgress
          isLoading={true}
          className="custom-progress"
        />
      );
      const container = screen.getByTestId('generation-progress');
      expect(container).toHaveClass('custom-progress');
    });
  });

  describe('accessibility', () => {
    it('should have appropriate aria labels', () => {
      render(
        <GenerationProgress
          isLoading={true}
          currentStep="Processing"
        />
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label');
    });

    it('should announce step changes to screen readers', () => {
      render(
        <GenerationProgress
          isLoading={true}
          currentStep="Generating document"
        />
      );
      const announcement = screen.getByRole('status');
      expect(announcement).toBeInTheDocument();
    });
  });
});
