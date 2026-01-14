/**
 * PassthroughStageCard Component
 * Displays status card for a single pipeline stage
 */
import React from 'react';
import type { PassthroughStage } from '../../types';

/**
 * Props for PassthroughStageCard component
 */
export interface PassthroughStageCardProps {
  /** Stage data to display */
  stage: PassthroughStage;
  /** Callback when card is clicked */
  onClick?: () => void;
}

/**
 * Get display name for stage
 */
function getStageDisplayName(name: string): string {
  const names: Record<string, string> = {
    design_doc: 'Design Document',
    prd: 'PRD',
    prototype: 'Prototype',
  };
  return names[name] || name;
}

/**
 * Get status icon
 */
function getStatusIcon(status: string): React.ReactNode {
  switch (status) {
    case 'pending':
      return (
        <svg
          data-testid="status-icon-pending"
          className="w-5 h-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <circle cx="10" cy="10" r="3" />
        </svg>
      );
    case 'running':
      return (
        <svg
          data-testid="status-icon-running"
          className="w-5 h-5 text-blue-600 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
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
        <svg
          data-testid="status-icon-completed"
          className="w-5 h-5 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'failed':
      return (
        <svg
          data-testid="status-icon-failed"
          className="w-5 h-5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'paused':
      return (
        <svg
          data-testid="status-icon-paused"
          className="w-5 h-5 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
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
 * Get border color class
 */
function getBorderColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'border-gray-200';
    case 'running':
      return 'border-blue-500';
    case 'completed':
      return 'border-green-200';
    case 'failed':
      return 'border-red-200';
    case 'paused':
      return 'border-yellow-200';
    default:
      return 'border-gray-200';
  }
}

/**
 * Format execution time
 */
function formatExecutionTime(startedAt: string | null, completedAt: string | null): string | null {
  if (!startedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const diff = end - start;

  if (diff < 1000) {
    return `${diff}ms`;
  } else if (diff < 10000) {
    // Show decimal seconds for less than 10 seconds
    return `${(diff / 1000).toFixed(1)}s`;
  } else if (diff < 60000) {
    return `${Math.round(diff / 1000)}s`;
  } else {
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.round((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * PassthroughStageCard - Stage status card component
 */
export function PassthroughStageCard({ stage, onClick }: PassthroughStageCardProps) {
  const isClickable = stage.status !== 'completed' && onClick;
  const executionTime = formatExecutionTime(stage.startedAt, stage.completedAt);

  return (
    <div
      data-testid="stage-card"
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={`${getStageDisplayName(stage.name)} stage: ${stage.status}`}
      className={`p-4 border rounded-lg ${getBorderColor(stage.status)} ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        {/* Stage Name and Status Icon */}
        <div className="flex items-center space-x-3">
          {getStatusIcon(stage.status)}
          <h3 className="font-semibold text-gray-900">{getStageDisplayName(stage.name)}</h3>
        </div>

        {/* Execution Time */}
        {(stage.status === 'running' || stage.status === 'completed') && executionTime && (
          <div data-testid="execution-time" className="text-sm text-gray-600">
            {stage.status === 'completed' ? executionTime : `Running: ${executionTime}`}
          </div>
        )}
      </div>

      {/* Error Display */}
      {stage.status === 'failed' && stage.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p data-testid="error-message" className="text-sm text-red-800 font-medium">
            {stage.error.message}
          </p>
          {stage.error.code && (
            <p className="text-xs text-red-600 mt-1">Error Code: {stage.error.code}</p>
          )}
          {stage.retryCount > 0 && (
            <p className="text-xs text-red-600 mt-1">Retry {stage.retryCount}/3</p>
          )}
        </div>
      )}

      {/* Document Link for Completed Stages */}
      {stage.status === 'completed' && (
        <div className="mt-3">
          <a
            data-testid="document-link"
            href={`/documents/${stage.name}`}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            View Document
          </a>
        </div>
      )}
    </div>
  );
}
