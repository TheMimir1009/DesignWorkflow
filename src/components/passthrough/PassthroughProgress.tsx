/**
 * PassthroughProgress Component
 * Displays pipeline progress with stage indicators
 */
import React from 'react';
import type { PassthroughPipeline } from '../../types';

/**
 * Props for PassthroughProgress component
 */
export interface PassthroughProgressProps {
  /** Current pipeline data */
  pipeline: PassthroughPipeline;
}

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
 * Get display name for stage
 */
function getStageDisplayName(stageName: string): string {
  const names: Record<string, string> = {
    design_doc: 'Design Document',
    prd: 'PRD',
    prototype: 'Prototype',
  };
  return names[stageName] || stageName;
}

/**
 * Get current stage display text
 */
function getCurrentStageText(pipeline: PassthroughPipeline): string | null {
  if (!pipeline.currentStage) return null;

  const stageNames: Record<string, string> = {
    design_doc: 'Generating Design Document...',
    prd: 'Generating PRD...',
    prototype: 'Generating Prototype...',
  };

  return stageNames[pipeline.currentStage] || `Processing ${pipeline.currentStage}...`;
}

/**
 * Get status icon for stage
 */
function getStageIcon(status: string): React.ReactNode {
  switch (status) {
    case 'pending':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="3" />
        </svg>
      );
    case 'running':
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    case 'completed':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'failed':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'paused':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Get status color class
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-gray-400';
    case 'running':
      return 'text-blue-600';
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'paused':
      return 'text-yellow-600';
    default:
      return 'text-gray-400';
  }
}

/**
 * PassthroughProgress - Progress display component
 */
export function PassthroughProgress({ pipeline }: PassthroughProgressProps) {
  const progress = Math.max(0, Math.min(100, calculateProgress(pipeline)));
  const currentStageText = getCurrentStageText(pipeline);

  return (
    <div data-testid="passthrough-progress" className="mb-6">
      {/* Progress Bar */}
      <div
        data-testid="progress-bar"
        className="w-full bg-gray-200 rounded-full h-2 mb-2"
        role="progressbar"
        aria-label={`Pipeline progress: ${progress}%`}
        aria-valuenow={progress.toString()}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          data-testid="progress-fill"
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Text and Current Stage */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
        {currentStageText && (
          <span className="text-sm text-gray-600">{currentStageText}</span>
        )}
      </div>

      {/* Stage Indicators */}
      <div className="flex items-center justify-between mt-4">
        {pipeline.stages.map((stage) => (
          <div
            key={stage.id}
            data-testid={`stage-indicator-${stage.name}-${stage.status}`}
            className={`flex items-center space-x-1 ${getStatusColor(stage.status)} ${stage.status === 'running' ? 'animate-pulse' : ''}`}
          >
            {getStageIcon(stage.status)}
            <span className="text-xs font-medium">{getStageDisplayName(stage.name)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
