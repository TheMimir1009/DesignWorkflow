/**
 * PassthroughProgress Tests
 * TDD test suite for passthrough progress component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassthroughProgress } from '../PassthroughProgress';
import type {
  PassthroughPipeline,
  PassthroughPipelineStatus,
  PassthroughStage,
} from '../../../types';

const createMockStage = (
  name: PassthroughStage['name'],
  status: PassthroughStage['status'] = 'pending',
  error: PassthroughStage['error'] = null
): PassthroughStage => ({
  id: `stage-${name}`,
  name,
  displayName: name === 'design_doc' ? 'Design Document' : name === 'prd' ? 'PRD' : 'Prototype',
  status,
  startedAt: status === 'running' || status === 'completed' || status === 'failed' || status === 'cancelled' ? '2024-01-01T00:00:00.000Z' : null,
  completedAt: status === 'completed' || status === 'failed' ? '2024-01-01T01:00:00.000Z' : null,
  error,
  progress: status === 'completed' ? 100 : status === 'running' ? 50 : 0,
});

const createMockPipeline = (
  status: PassthroughPipelineStatus = 'idle'
): PassthroughPipeline => ({
  id: 'pipeline-123',
  taskId: 'task-123',
  qaSessionId: 'qa-session-123',
  status,
  currentStage: null,
  stages: [
    createMockStage('design_doc'),
    createMockStage('prd'),
    createMockStage('prototype'),
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  startedAt: null,
  completedAt: null,
});

describe('PassthroughProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render progress container', () => {
      const pipeline = createMockPipeline('idle');
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('passthrough-progress')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      const pipeline = createMockPipeline('running');
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('should render progress fill with correct width', () => {
      const pipeline = createMockPipeline('running');
      pipeline.stages[0].progress = 50;
      render(<PassthroughProgress pipeline={pipeline} />);

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '17%' });
    });
  });

  describe('Progress Display', () => {
    it('should display 0% progress when idle', () => {
      const pipeline = createMockPipeline('idle');
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display 33% progress when first stage running', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'running';
      pipeline.stages[0].progress = 100;
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should display 66% progress when second stage running', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'prd';
      pipeline.stages[0].status = 'completed';
      pipeline.stages[0].progress = 100;
      pipeline.stages[1].status = 'running';
      pipeline.stages[1].progress = 100;
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('should display 100% progress when completed', () => {
      const pipeline = createMockPipeline('completed');
      pipeline.stages[0].status = 'completed';
      pipeline.stages[0].progress = 100;
      pipeline.stages[1].status = 'completed';
      pipeline.stages[1].progress = 100;
      pipeline.stages[2].status = 'completed';
      pipeline.stages[2].progress = 100;
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Current Stage Indicator', () => {
    it('should display current stage name when running', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getAllByText(/Design Document/i)).toHaveLength(2);
    });

    it('should display "Generating Design Document..." when design_doc running', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByText('Generating Design Document...')).toBeInTheDocument();
    });

    it('should display "Generating PRD..." when prd running', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'prd';
      pipeline.stages[0].status = 'completed';
      pipeline.stages[1].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByText('Generating PRD...')).toBeInTheDocument();
    });

    it('should display "Generating Prototype..." when prototype running', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'prototype';
      pipeline.stages[0].status = 'completed';
      pipeline.stages[1].status = 'completed';
      pipeline.stages[2].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByText('Generating Prototype...')).toBeInTheDocument();
    });

    it('should not display current stage when idle', () => {
      const pipeline = createMockPipeline('idle');
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    });

    it('should not display current stage when completed', () => {
      const pipeline = createMockPipeline('completed');
      pipeline.stages[0].status = 'completed';
      pipeline.stages[1].status = 'completed';
      pipeline.stages[2].status = 'completed';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    });
  });

  describe('Stage Status Indicators', () => {
    it('should display pending status for pending stages', () => {
      const pipeline = createMockPipeline('idle');
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('stage-indicator-design_doc-pending')).toBeInTheDocument();
      expect(screen.getByTestId('stage-indicator-prd-pending')).toBeInTheDocument();
      expect(screen.getByTestId('stage-indicator-prototype-pending')).toBeInTheDocument();
    });

    it('should display running status for current stage', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('stage-indicator-design_doc-running')).toBeInTheDocument();
    });

    it('should display completed status for completed stages', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'prd';
      pipeline.stages[0].status = 'completed';
      pipeline.stages[1].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('stage-indicator-design_doc-completed')).toBeInTheDocument();
    });

    it('should display failed status for failed stages', () => {
      const pipeline = createMockPipeline('failed');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'failed';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('stage-indicator-design_doc-failed')).toBeInTheDocument();
    });

    it('should display paused status for paused stages', () => {
      const pipeline = createMockPipeline('paused');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'paused';
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('stage-indicator-design_doc-paused')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('should apply blue color to running stage', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      const indicator = screen.getByTestId('stage-indicator-design_doc-running');
      expect(indicator).toHaveClass('text-blue-600');
    });

    it('should apply green color to completed stages', () => {
      const pipeline = createMockPipeline('running');
      pipeline.stages[0].status = 'completed';
      render(<PassthroughProgress pipeline={pipeline} />);

      const indicator = screen.getByTestId('stage-indicator-design_doc-completed');
      expect(indicator).toHaveClass('text-green-600');
    });

    it('should apply red color to failed stages', () => {
      const pipeline = createMockPipeline('failed');
      pipeline.stages[0].status = 'failed';
      render(<PassthroughProgress pipeline={pipeline} />);

      const indicator = screen.getByTestId('stage-indicator-design_doc-failed');
      expect(indicator).toHaveClass('text-red-600');
    });

    it('should apply gray color to pending stages', () => {
      const pipeline = createMockPipeline('idle');
      render(<PassthroughProgress pipeline={pipeline} />);

      const indicator = screen.getByTestId('stage-indicator-design_doc-pending');
      expect(indicator).toHaveClass('text-gray-400');
    });
  });

  describe('Animation', () => {
    it('should show pulse animation on running stage', () => {
      const pipeline = createMockPipeline('running');
      pipeline.currentStage = 'design_doc';
      pipeline.stages[0].status = 'running';
      render(<PassthroughProgress pipeline={pipeline} />);

      const indicator = screen.getByTestId('stage-indicator-design_doc-running');
      expect(indicator).toHaveClass('animate-pulse');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for progress bar', () => {
      const pipeline = createMockPipeline('running');
      pipeline.stages[0].progress = 50;
      render(<PassthroughProgress pipeline={pipeline} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-label', 'Pipeline progress: 17%');
    });

    it('should have roleprogressbar for progress bar', () => {
      const pipeline = createMockPipeline('running');
      pipeline.stages[0].progress = 50;
      render(<PassthroughProgress pipeline={pipeline} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });

    it('should have aria-valuenow for progress bar', () => {
      const pipeline = createMockPipeline('running');
      pipeline.stages[0].progress = 50;
      render(<PassthroughProgress pipeline={pipeline} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '17');
    });

    it('should have aria-valuemin and aria-valuemax for progress bar', () => {
      const pipeline = createMockPipeline('running');
      pipeline.stages[0].progress = 50;
      render(<PassthroughProgress pipeline={pipeline} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined currentStage gracefully', () => {
      const pipeline = createMockPipeline('idle');
      pipeline.currentStage = null;
      render(<PassthroughProgress pipeline={pipeline} />);

      expect(screen.getByTestId('passthrough-progress')).toBeInTheDocument();
    });

    it('should handle negative progress', () => {
      const pipeline = createMockPipeline('idle');
      pipeline.stages[0].progress = -10;
      render(<PassthroughProgress pipeline={pipeline} />);

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });

    it('should handle progress over 100', () => {
      const pipeline = createMockPipeline('completed');
      pipeline.stages[0].progress = 150;
      pipeline.stages[1].progress = 150;
      pipeline.stages[2].progress = 150;
      render(<PassthroughProgress pipeline={pipeline} />);

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });
  });
});
