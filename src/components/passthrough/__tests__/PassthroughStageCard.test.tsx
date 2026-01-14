/**
 * PassthroughStageCard Tests
 * TDD test suite for passthrough stage card component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassthroughStageCard } from '../PassthroughStageCard';
import type { PassthroughStage, StageStatus } from '../../../types';

const createMockStage = (
  name: PassthroughStage['name'] = 'design_doc',
  status: StageStatus = 'pending'
): PassthroughStage => ({
  name,
  status,
  startedAt: null,
  completedAt: null,
  error: null,
  retryCount: 0,
});

describe('PassthroughStageCard', () => {
  const defaultProps = {
    stage: createMockStage('design_doc', 'pending'),
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render stage card container', () => {
      render(<PassthroughStageCard {...defaultProps} />);

      expect(screen.getByTestId('stage-card')).toBeInTheDocument();
    });

    it('should display stage name', () => {
      render(<PassthroughStageCard {...defaultProps} />);

      expect(screen.getByText('Design Document')).toBeInTheDocument();
    });

    it('should display "PRD" for prd stage', () => {
      const prdStage = createMockStage('prd', 'pending');
      render(<PassthroughStageCard {...defaultProps} stage={prdStage} />);

      expect(screen.getByText('PRD')).toBeInTheDocument();
    });

    it('should display "Prototype" for prototype stage', () => {
      const prototypeStage = createMockStage('prototype', 'pending');
      render(<PassthroughStageCard {...defaultProps} stage={prototypeStage} />);

      expect(screen.getByText('Prototype')).toBeInTheDocument();
    });
  });

  describe('Status Icons', () => {
    it('should display pending icon for pending status', () => {
      const pendingStage = createMockStage('design_doc', 'pending');
      render(<PassthroughStageCard {...defaultProps} stage={pendingStage} />);

      expect(screen.getByTestId('status-icon-pending')).toBeInTheDocument();
    });

    it('should display running icon with animation for running status', () => {
      const runningStage = createMockStage('design_doc', 'running');
      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      const icon = screen.getByTestId('status-icon-running');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('animate-spin');
    });

    it('should display completed icon for completed status', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      expect(screen.getByTestId('status-icon-completed')).toBeInTheDocument();
    });

    it('should display failed icon for failed status', () => {
      const failedStage = createMockStage('design_doc', 'failed');
      render(<PassthroughStageCard {...defaultProps} stage={failedStage} />);

      expect(screen.getByTestId('status-icon-failed')).toBeInTheDocument();
    });

    it('should display paused icon for paused status', () => {
      const pausedStage = createMockStage('design_doc', 'paused');
      render(<PassthroughStageCard {...defaultProps} stage={pausedStage} />);

      expect(screen.getByTestId('status-icon-paused')).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('should apply gray color for pending status', () => {
      const pendingStage = createMockStage('design_doc', 'pending');
      render(<PassthroughStageCard {...defaultProps} stage={pendingStage} />);

      const icon = screen.getByTestId('status-icon-pending');
      expect(icon).toHaveClass('text-gray-400');
    });

    it('should apply blue color for running status', () => {
      const runningStage = createMockStage('design_doc', 'running');
      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      const icon = screen.getByTestId('status-icon-running');
      expect(icon).toHaveClass('text-blue-600');
    });

    it('should apply green color for completed status', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      const icon = screen.getByTestId('status-icon-completed');
      expect(icon).toHaveClass('text-green-600');
    });

    it('should apply red color for failed status', () => {
      const failedStage = createMockStage('design_doc', 'failed');
      render(<PassthroughStageCard {...defaultProps} stage={failedStage} />);

      const icon = screen.getByTestId('status-icon-failed');
      expect(icon).toHaveClass('text-red-600');
    });

    it('should apply yellow color for paused status', () => {
      const pausedStage = createMockStage('design_doc', 'paused');
      render(<PassthroughStageCard {...defaultProps} stage={pausedStage} />);

      const icon = screen.getByTestId('status-icon-paused');
      expect(icon).toHaveClass('text-yellow-600');
    });
  });

  describe('Execution Time Display', () => {
    it('should not display time when stage has not started', () => {
      const pendingStage = createMockStage('design_doc', 'pending');
      render(<PassthroughStageCard {...defaultProps} stage={pendingStage} />);

      expect(screen.queryByTestId('execution-time')).not.toBeInTheDocument();
    });

    it('should display execution time when completed', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      completedStage.startedAt = '2024-01-01T00:00:00.000Z';
      completedStage.completedAt = '2024-01-01T00:00:05.500Z';

      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      expect(screen.getByText('5.5s')).toBeInTheDocument();
    });

    it('should display elapsed time while running', () => {
      const runningStage = createMockStage('design_doc', 'running');
      runningStage.startedAt = '2024-01-01T00:00:00.000Z';

      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      expect(screen.getByTestId('execution-time')).toBeInTheDocument();
    });

    it('should format time in milliseconds when less than 1 second', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      completedStage.startedAt = '2024-01-01T00:00:00.000Z';
      completedStage.completedAt = '2024-01-01T00:00:00.500Z';

      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      expect(screen.getByText('500ms')).toBeInTheDocument();
    });

    it('should format time in seconds when less than 1 minute', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      completedStage.startedAt = '2024-01-01T00:00:00.000Z';
      completedStage.completedAt = '2024-01-01T00:00:45.000Z';

      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    it('should format time in minutes when greater than 1 minute', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      completedStage.startedAt = '2024-01-01T00:00:00.000Z';
      completedStage.completedAt = '2024-01-01T00:02:30.000Z';

      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      expect(screen.getByText('2m 30s')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should not display error when stage has no error', () => {
      const pendingStage = createMockStage('design_doc', 'pending');
      render(<PassthroughStageCard {...defaultProps} stage={pendingStage} />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should display error message when stage failed', () => {
      const failedStage = createMockStage('design_doc', 'failed');
      failedStage.error = {
        message: 'LLM request failed',
        code: 'LLM_ERROR',
      };

      render(<PassthroughStageCard {...defaultProps} stage={failedStage} />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('LLM request failed')).toBeInTheDocument();
    });

    it('should display error code when available', () => {
      const failedStage = createMockStage('design_doc', 'failed');
      failedStage.error = {
        message: 'Connection timeout',
        code: 'TIMEOUT_ERROR',
      };

      render(<PassthroughStageCard {...defaultProps} stage={failedStage} />);

      expect(screen.getByText(/Error Code: TIMEOUT_ERROR/)).toBeInTheDocument();
    });

    it('should display retry count when available', () => {
      const failedStage = createMockStage('design_doc', 'failed');
      failedStage.error = {
        message: 'Request failed',
        code: 'REQUEST_FAILED',
      };
      failedStage.retryCount = 2;

      render(<PassthroughStageCard {...defaultProps} stage={failedStage} />);

      expect(screen.getByText(/Retry 2\/3/i)).toBeInTheDocument();
    });
  });

  describe('Document Link', () => {
    it('should not display document link when stage not completed', () => {
      const runningStage = createMockStage('design_doc', 'running');
      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      expect(screen.queryByTestId('document-link')).not.toBeInTheDocument();
    });

    it('should display document link when stage completed', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      expect(screen.getByTestId('document-link')).toBeInTheDocument();
    });

    it('should link to correct document path', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      const link = screen.getByTestId('document-link');
      expect(link).toHaveAttribute('href', expect.stringContaining('design_doc'));
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(<PassthroughStageCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByTestId('stage-card');
      card.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be clickable when not completed', () => {
      const runningStage = createMockStage('design_doc', 'running');
      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not be clickable when completed (has document link instead)', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Card Styling', () => {
    it('should apply border style for current stage', () => {
      const runningStage = createMockStage('design_doc', 'running');
      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).toHaveClass('border-blue-500');
    });

    it('should apply gray border for pending stages', () => {
      const pendingStage = createMockStage('design_doc', 'pending');
      render(<PassthroughStageCard {...defaultProps} stage={pendingStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).toHaveClass('border-gray-200');
    });

    it('should apply green border for completed stages', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).toHaveClass('border-green-200');
    });

    it('should apply red border for failed stages', () => {
      const failedStage = createMockStage('design_doc', 'failed');
      render(<PassthroughStageCard {...defaultProps} stage={failedStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).toHaveClass('border-red-200');
    });
  });

  describe('Accessibility', () => {
    it('should have role button when clickable', () => {
      const runningStage = createMockStage('design_doc', 'running');
      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should have aria-label describing stage and status', () => {
      const runningStage = createMockStage('design_doc', 'running');
      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      const card = screen.getByTestId('stage-card');
      expect(card).toHaveAttribute('aria-label', 'Design Document stage: running');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null startedAt gracefully', () => {
      const completedStage = createMockStage('design_doc', 'completed');
      completedStage.startedAt = null;
      completedStage.completedAt = '2024-01-01T00:00:05.000Z';

      render(<PassthroughStageCard {...defaultProps} stage={completedStage} />);

      expect(screen.getByTestId('stage-card')).toBeInTheDocument();
    });

    it('should handle null completedAt gracefully', () => {
      const runningStage = createMockStage('design_doc', 'running');
      runningStage.startedAt = '2024-01-01T00:00:00.000Z';
      runningStage.completedAt = null;

      render(<PassthroughStageCard {...defaultProps} stage={runningStage} />);

      expect(screen.getByTestId('stage-card')).toBeInTheDocument();
    });

    it('should handle missing error object gracefully', () => {
      const failedStage = createMockStage('design_doc', 'failed');
      failedStage.error = null;

      render(<PassthroughStageCard {...defaultProps} stage={failedStage} />);

      expect(screen.getByTestId('stage-card')).toBeInTheDocument();
    });
  });
});
