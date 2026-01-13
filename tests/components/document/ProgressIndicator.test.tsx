/**
 * ProgressIndicator Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressIndicator } from '../../../src/components/document/ProgressIndicator';

describe('ProgressIndicator', () => {
  const defaultProps = {
    currentStep: 0,
    totalSteps: 5,
    completedSteps: [],
    onStepClick: vi.fn(),
  };

  it('should display current step progress', () => {
    render(<ProgressIndicator {...defaultProps} currentStep={2} />);

    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('should render all step indicators', () => {
    render(<ProgressIndicator {...defaultProps} />);

    const steps = screen.getAllByTestId(/step-indicator/);
    expect(steps).toHaveLength(5);
  });

  it('should highlight completed steps', () => {
    render(
      <ProgressIndicator
        {...defaultProps}
        currentStep={3}
        completedSteps={[0, 1, 2]}
      />
    );

    // Steps 0, 1, 2 are completed, step 3 is current
    const completedSteps = screen.getAllByTestId(/step-indicator-completed/);
    expect(completedSteps.length).toBe(3);
  });

  it('should highlight current step differently', () => {
    render(<ProgressIndicator {...defaultProps} currentStep={2} />);

    const currentStep = screen.getByTestId('step-indicator-current');
    expect(currentStep).toHaveClass('bg-blue-500');
  });

  it('should call onStepClick when step is clicked', () => {
    const onStepClick = vi.fn();
    render(<ProgressIndicator {...defaultProps} onStepClick={onStepClick} />);

    const steps = screen.getAllByTestId(/step-indicator/);
    fireEvent.click(steps[2]);

    expect(onStepClick).toHaveBeenCalledWith(2);
  });

  it('should show progress bar', () => {
    render(<ProgressIndicator {...defaultProps} currentStep={2} totalSteps={5} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
  });
});
