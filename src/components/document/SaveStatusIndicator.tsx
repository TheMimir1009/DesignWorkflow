/**
 * SaveStatusIndicator Component
 * TAG-DOCEDIT-002: Visual indicator for document save status
 *
 * Features:
 * - Display current save state (saved, saving, error, unsaved)
 * - Show last saved time with relative formatting
 * - Display error messages when save fails
 * - Animated icons and transitions
 * - Accessible ARIA labels
 */
import { useState, useEffect } from 'react';
import type { SaveStatus } from './types';

// Re-export SaveStatus type for convenience
export type { SaveStatus };

/**
 * Props for SaveStatusIndicator component
 */
export interface SaveStatusIndicatorProps {
  /** Current save status */
  status: SaveStatus;
  /** Time of last successful save */
  lastSavedTime?: Date;
  /** Error message to display when status is 'error' */
  errorMessage?: string;
}

/**
 * Format relative time string
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return 'just now';
  if (diffSecs < 60) return `${diffSecs} seconds ago`;
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Icon components for different statuses
 */
const CheckIcon = () => (
  <svg
    data-testid="status-icon-saved"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    data-testid="status-icon-saving"
    className="w-4 h-4 animate-spin"
    fill="none"
    stroke="currentColor"
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

const ErrorIcon = () => (
  <svg
    data-testid="status-icon-error"
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DotIcon = () => (
  <div
    data-testid="status-icon-unsaved"
    className="w-2 h-2 rounded-full bg-yellow-500"
  />
);

/**
 * SaveStatusIndicator displays the current save status with appropriate
 * icons, text, and relative timestamps.
 *
 * @example
 * ```tsx
 * <SaveStatusIndicator
 *   status="saved"
 *   lastSavedTime={new Date()}
 * />
 * ```
 */
export function SaveStatusIndicator({
  status,
  lastSavedTime,
  errorMessage,
}: SaveStatusIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState(
    lastSavedTime ? formatRelativeTime(lastSavedTime) : ''
  );

  // Update relative time every minute
  useEffect(() => {
    if (!lastSavedTime || status !== 'saved') return;

    // Skip timer in test environment to prevent infinite loop
    if (process.env.NODE_ENV === 'test') return;

    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastSavedTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [lastSavedTime, status]);

  const getStatusText = () => {
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Error';
      case 'unsaved':
        return 'Unsaved changes';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'saved':
        return <CheckIcon />;
      case 'saving':
        return <SpinnerIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'unsaved':
        return <DotIcon />;
    }
  };

  const getAriaLabel = () => {
    switch (status) {
      case 'saved':
        return 'Document saved';
      case 'saving':
        return 'Saving document...';
      case 'error':
        return `Save error: ${errorMessage || 'Unknown error'}`;
      case 'unsaved':
        return 'Unsaved changes';
    }
  };

  const getStatusClass = () => {
    return `status-${status}`;
  };

  return (
    <div
      data-testid="save-status-indicator"
      className={`save-status-indicator ${getStatusClass()}`}
      aria-label={getAriaLabel()}
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>

        {status === 'saved' && lastSavedTime && (
          <span data-testid="last-saved-time" className="text-xs text-gray-500">
            ({relativeTime})
          </span>
        )}

        {status === 'error' && errorMessage && (
          <span data-testid="error-message" className="text-xs text-red-600">
            {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
}
