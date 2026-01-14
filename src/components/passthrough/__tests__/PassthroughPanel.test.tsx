/**
 * PassthroughPanel Tests
 * TDD test suite for passthrough panel component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassthroughPanel } from '../PassthroughPanel';
import type {
  PassthroughPipeline,
  PassthroughPipelineStatus,
  PassthroughStage,
} from '../../../types';

// Mock child components for now
vi.mock('../PassthroughProgress', () => ({
  PassthroughProgress: () => <div data-testid="passthrough-progress">Progress</div>,
}));

vi.mock('../PassthroughStageCard', () => ({
  PassthroughStageCard: ({ stage, onClick }: any) => (
    <div data-testid={`stage-card-${stage.name}`} onClick={onClick}>
      {stage.name} - {stage.status}
    </div>
  ),
}));

vi.mock('../PassthroughControls', () => ({
  PassthroughControls: ({ onStart, onPause, onResume, onCancel, onRetry, status, loading }: any) => (
    <div data-testid="passthrough-controls">
      <button onClick={onStart} disabled={status !== 'idle' || loading}>
        Start
      </button>
      <button onClick={onPause} disabled={status !== 'running' || loading}>
        Pause
      </button>
      <button onClick={onResume} disabled={status !== 'paused' || loading}>
        Resume
      </button>
      <button onClick={onCancel} disabled={status === 'idle' || loading}>
        Cancel
      </button>
      <button onClick={onRetry} disabled={status !== 'failed' || loading}>
        Retry
      </button>
    </div>
  ),
}));

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

describe('PassthroughPanel', () => {
  const defaultProps = {
    pipeline: createMockPipeline('idle'),
    onStart: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onCancel: vi.fn(),
    onRetry: vi.fn(),
    onStageClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render panel container', () => {
      render(<PassthroughPanel {...defaultProps} />);

      expect(screen.getByTestId('passthrough-panel')).toBeInTheDocument();
    });

    it('should render progress component', () => {
      render(<PassthroughPanel {...defaultProps} />);

      expect(screen.getByTestId('passthrough-progress')).toBeInTheDocument();
    });

    it('should render controls component', () => {
      render(<PassthroughPanel {...defaultProps} />);

      expect(screen.getByTestId('passthrough-controls')).toBeInTheDocument();
    });

    it('should render stage cards for all stages', () => {
      render(<PassthroughPanel {...defaultProps} />);

      expect(screen.getByTestId('stage-card-design_doc')).toBeInTheDocument();
      expect(screen.getByTestId('stage-card-prd')).toBeInTheDocument();
      expect(screen.getByTestId('stage-card-prototype')).toBeInTheDocument();
    });

    it('should display panel title', () => {
      render(<PassthroughPanel {...defaultProps} />);

      expect(screen.getByText('Passthrough Pipeline')).toBeInTheDocument();
    });
  });

  describe('Idle Status', () => {
    it('should show idle status message', () => {
      render(<PassthroughPanel {...defaultProps} pipeline={createMockPipeline('idle')} />);

      expect(screen.getByText('Pipeline is ready to start')).toBeInTheDocument();
    });
  });

  describe('Running Status', () => {
    it('should show running status message', () => {
      const runningPipeline = createMockPipeline('running');
      runningPipeline.currentStage = 'design_doc';
      runningPipeline.stages[0].status = 'running';

      render(<PassthroughPanel {...defaultProps} pipeline={runningPipeline} />);

      expect(screen.getByText('Pipeline is running')).toBeInTheDocument();
    });

    it('should display progress percentage', () => {
      const runningPipeline = createMockPipeline('running');
      runningPipeline.currentStage = 'prd';
      runningPipeline.stages[0].status = 'completed';
      runningPipeline.stages[0].progress = 100;
      runningPipeline.stages[1].status = 'running';
      runningPipeline.stages[1].progress = 50;

      render(<PassthroughPanel {...defaultProps} pipeline={runningPipeline} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Paused Status', () => {
    it('should show paused status message', () => {
      const pausedPipeline = createMockPipeline('paused');
      pausedPipeline.currentStage = 'design_doc';
      pausedPipeline.stages[0].status = 'paused';

      render(<PassthroughPanel {...defaultProps} pipeline={pausedPipeline} />);

      expect(screen.getByText('Pipeline is paused')).toBeInTheDocument();
    });
  });

  describe('Completed Status', () => {
    it('should show completed status message', () => {
      const completedPipeline = createMockPipeline('completed');
      completedPipeline.stages[0].status = 'completed';
      completedPipeline.stages[1].status = 'completed';
      completedPipeline.stages[2].status = 'completed';

      render(<PassthroughPanel {...defaultProps} pipeline={completedPipeline} />);

      expect(screen.getByText('Pipeline completed successfully')).toBeInTheDocument();
    });

    it('should display success icon', () => {
      const completedPipeline = createMockPipeline('completed');
      completedPipeline.stages[0].status = 'completed';
      completedPipeline.stages[1].status = 'completed';
      completedPipeline.stages[2].status = 'completed';

      render(<PassthroughPanel {...defaultProps} pipeline={completedPipeline} />);

      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    });
  });

  describe('Failed Status', () => {
    it('should show failed status message', () => {
      const failedPipeline = createMockPipeline('failed');
      failedPipeline.currentStage = 'design_doc';
      failedPipeline.stages[0].status = 'failed';
      failedPipeline.stages[0].error = {
        message: 'LLM request failed',
        code: 'LLM_ERROR',
      };

      render(<PassthroughPanel {...defaultProps} pipeline={failedPipeline} />);

      expect(screen.getByText('Pipeline failed')).toBeInTheDocument();
      expect(screen.getByText('LLM request failed')).toBeInTheDocument();
    });

    it('should display error details', () => {
      const failedPipeline = createMockPipeline('failed');
      failedPipeline.currentStage = 'design_doc';
      failedPipeline.stages[0].status = 'failed';
      failedPipeline.stages[0].error = {
        message: 'Connection timeout',
        code: 'TIMEOUT_ERROR',
        stack: 'Error stack',
      };

      render(<PassthroughPanel {...defaultProps} pipeline={failedPipeline} />);

      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
      expect(screen.getByText('Error Code: TIMEOUT_ERROR')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when provided', () => {
      render(
        <PassthroughPanel
          {...defaultProps}
          error="Failed to load pipeline"
        />
      );

      expect(screen.getByText('Failed to load pipeline')).toBeInTheDocument();
    });

    it('should display error icon with error', () => {
      render(
        <PassthroughPanel
          {...defaultProps}
          error="Connection error"
        />
      );

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      render(<PassthroughPanel {...defaultProps} loading />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should disable controls when loading', () => {
      render(<PassthroughPanel {...defaultProps} loading />);

      // Check that the Start button is disabled (status is idle, but loading should override)
      const startButton = screen.getByRole('button', { name: /start/i });
      expect(startButton).toBeDisabled();
    });
  });

  describe('Callbacks', () => {
    it('should call onStart when start callback triggered', () => {
      render(<PassthroughPanel {...defaultProps} />);

      const startButton = screen.getByRole('button', { name: /start/i });
      startButton.click();

      expect(defaultProps.onStart).toHaveBeenCalled();
    });

    it('should call onPause when pause callback triggered', () => {
      const runningPipeline = createMockPipeline('running');
      render(<PassthroughPanel {...defaultProps} pipeline={runningPipeline} />);

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      pauseButton.click();

      expect(defaultProps.onPause).toHaveBeenCalled();
    });

    it('should call onResume when resume callback triggered', () => {
      const pausedPipeline = createMockPipeline('paused');
      render(<PassthroughPanel {...defaultProps} pipeline={pausedPipeline} />);

      const resumeButton = screen.getByRole('button', { name: /resume/i });
      resumeButton.click();

      expect(defaultProps.onResume).toHaveBeenCalled();
    });

    it('should call onCancel when cancel callback triggered', () => {
      const runningPipeline = createMockPipeline('running');
      render(<PassthroughPanel {...defaultProps} pipeline={runningPipeline} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      cancelButton.click();

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should call onRetry when retry callback triggered', () => {
      const failedPipeline = createMockPipeline('failed');
      render(<PassthroughPanel {...defaultProps} pipeline={failedPipeline} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.click();

      expect(defaultProps.onRetry).toHaveBeenCalled();
    });
  });

  describe('Stage Interaction', () => {
    it('should call onStageClick when stage card is clicked', () => {
      const runningPipeline = createMockPipeline('running');
      runningPipeline.currentStage = 'design_doc';
      runningPipeline.stages[0].status = 'running';

      render(<PassthroughPanel {...defaultProps} pipeline={runningPipeline} />);

      // The mock uses stage-card-{stage.name} format
      const stageCard = screen.getByTestId('stage-card-design_doc');
      stageCard.click();

      expect(defaultProps.onStageClick).toHaveBeenCalledWith('design_doc');
    });
  });
});
