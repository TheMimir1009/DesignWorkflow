/**
 * PassthroughPanel Component
 * Main container for passthrough pipeline UI
 */
import React from 'react';
import type { PassthroughPipeline, PassthroughPipelineStatus, PassthroughStageName } from '../../types';
import { PassthroughProgress } from './PassthroughProgress';
import { PassthroughStageCard } from './PassthroughStageCard';
import { PassthroughControls } from './PassthroughControls';

/**
 * Calculate progress from stages
 */
function calculateProgress(pipeline: PassthroughPipeline): number {
  const totalStages = pipeline.stages.length;
  if (totalStages === 0) return 0;

  const totalProgress = pipeline.stages.reduce((sum, stage) => sum + stage.progress, 0);
  return Math.round(totalProgress / totalStages);
}

/**
 * Props for PassthroughPanel component
 */
export interface PassthroughPanelProps {
  /** Current pipeline data */
  pipeline: PassthroughPipeline | null;
  /** Whether panel is in loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Callback to start pipeline */
  onStart: () => void;
  /** Callback to pause pipeline */
  onPause: () => void;
  /** Callback to resume pipeline */
  onResume: () => void;
  /** Callback to cancel pipeline */
  onCancel: () => void;
  /** Callback to retry failed pipeline */
  onRetry: () => void;
  /** Callback when stage is clicked */
  onStageClick: (stage: PassthroughStageName) => void;
}

/**
 * Get status message based on pipeline status
 */
function getStatusMessage(status: PassthroughPipelineStatus): string {
  switch (status) {
    case 'idle':
      return 'Pipeline is ready to start';
    case 'running':
      return 'Pipeline is running';
    case 'paused':
      return 'Pipeline is paused';
    case 'completed':
      return 'Pipeline completed successfully';
    case 'failed':
      return 'Pipeline failed';
    default:
      return '';
  }
}

/**
 * Get display name for stage
 */
function getStageDisplayName(stage: PassthroughStageName): string {
  const names: Record<PassthroughStageName, string> = {
    design_doc: 'Design Document',
    prd: 'PRD',
    prototype: 'Prototype',
  };
  return names[stage] || stage;
}

/**
 * PassthroughPanel - Main container component
 */
export function PassthroughPanel({
  pipeline,
  loading = false,
  error,
  onStart,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onStageClick,
}: PassthroughPanelProps) {
  const status = pipeline?.status ?? 'idle';
  const progress = pipeline ? calculateProgress(pipeline) : 0;
  const currentStageError = pipeline?.currentStage
    ? pipeline.stages.find((s) => s.name === pipeline.currentStage)?.error
    : null;

  return (
    <div data-testid="passthrough-panel" className="passthrough-panel p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Passthrough Pipeline</h2>
        {loading && (
          <div data-testid="loading-spinner" className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <svg
            data-testid="error-icon"
            className="w-5 h-5 text-red-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Progress */}
      {pipeline && <PassthroughProgress pipeline={pipeline} />}

      {/* Status Message */}
      {pipeline && (
        <div className="mb-4">
          <p className="text-gray-700">{getStatusMessage(status)}</p>
          {status === 'running' && (
            <p className="text-2xl font-bold text-blue-600">{progress}%</p>
          )}
        </div>
      )}

      {/* Success Icon */}
      {status === 'completed' && (
        <div className="mb-4 flex items-center">
          <svg
            data-testid="success-icon"
            className="w-12 h-12 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Error Display for Failed Status */}
      {status === 'failed' && currentStageError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="font-semibold text-red-800 mb-2">Stage Error:</p>
          <p className="text-red-700">{currentStageError.message}</p>
          {currentStageError.code && (
            <p className="text-sm text-red-600 mt-1">
              Error Code: {currentStageError.code}
            </p>
          )}
        </div>
      )}

      {/* Stage Cards */}
      {pipeline && (
        <div className="space-y-4 mb-6">
          {pipeline.stages.map((stage) => (
            <PassthroughStageCard
              key={stage.id}
              stage={stage}
              onClick={() => onStageClick(stage.name)}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <PassthroughControls
        status={status}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onCancel={onCancel}
        onRetry={onRetry}
        loading={loading}
      />
    </div>
  );
}
