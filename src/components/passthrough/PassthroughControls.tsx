/**
 * PassthroughControls Component
 * Control buttons for pipeline management
 */
import React from 'react';
import type { PipelineStatus } from '../../types';

/**
 * Props for PassthroughControls component
 */
export interface PassthroughControlsProps {
  /** Current pipeline status */
  status: PipelineStatus;
  /** Whether controls are in loading state */
  loading?: boolean;
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
}

/**
 * Button configuration
 */
interface ButtonConfig {
  testId: string;
  label: string;
  ariaLabel: string;
  icon: React.ReactNode;
  bgColor: string;
  enabled: (status: PipelineStatus) => boolean;
  action: keyof Pick<PassthroughControlsProps, 'onStart' | 'onPause' | 'onResume' | 'onCancel' | 'onRetry'>;
}

/**
 * Play icon
 */
function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Pause icon
 */
function PauseIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Resume icon
 */
function ResumeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Cancel icon
 */
function CancelIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Retry icon
 */
function RetryIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Button configurations
 */
const buttonConfigs: ButtonConfig[] = [
  {
    testId: 'button-start',
    label: 'Start Pipeline',
    ariaLabel: 'Start pipeline',
    icon: <PlayIcon />,
    bgColor: 'bg-blue-600 hover:bg-blue-700',
    enabled: (status) => status === 'idle',
    action: 'onStart',
  },
  {
    testId: 'button-pause',
    label: 'Pause',
    ariaLabel: 'Pause pipeline',
    icon: <PauseIcon />,
    bgColor: 'bg-yellow-600 hover:bg-yellow-700',
    enabled: (status) => status === 'running',
    action: 'onPause',
  },
  {
    testId: 'button-resume',
    label: 'Resume',
    ariaLabel: 'Resume pipeline',
    icon: <ResumeIcon />,
    bgColor: 'bg-green-600 hover:bg-green-700',
    enabled: (status) => status === 'paused',
    action: 'onResume',
  },
  {
    testId: 'button-cancel',
    label: 'Cancel',
    ariaLabel: 'Cancel pipeline',
    icon: <CancelIcon />,
    bgColor: 'bg-red-600 hover:bg-red-700',
    enabled: (status) => status === 'running' || status === 'paused' || status === 'failed',
    action: 'onCancel',
  },
  {
    testId: 'button-retry',
    label: 'Retry',
    ariaLabel: 'Retry pipeline',
    icon: <RetryIcon />,
    bgColor: 'bg-purple-600 hover:bg-purple-700',
    enabled: (status) => status === 'failed',
    action: 'onRetry',
  },
];

/**
 * PassthroughControls - Control buttons component
 */
export function PassthroughControls({
  status,
  loading = false,
  onStart,
  onPause,
  onResume,
  onCancel,
  onRetry,
}: PassthroughControlsProps) {
  const clickedActionRef = React.useRef<ButtonConfig['action'] | null>(null);

  const handleClick = (action: ButtonConfig['action'], callback: () => void) => {
    if (loading) return;
    // Prevent multiple clicks on the same action
    if (clickedActionRef.current === action) return;
    clickedActionRef.current = action;
    callback();
  };

  const callbacks = {
    onStart,
    onPause,
    onResume,
    onCancel,
    onRetry,
  };

  return (
    <div data-testid="passthrough-controls" className="flex flex-wrap gap-3">
      {/* Loading Spinner */}
      {loading && (
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"
        />
      )}

      {/* Control Buttons */}
      {buttonConfigs.map((config) => {
        const isEnabled = config.enabled(status) && !loading;
        const callback = callbacks[config.action];

        return (
          <button
            key={config.testId}
            data-testid={config.testId}
            onClick={() => handleClick(config.action, callback)}
            disabled={!isEnabled}
            aria-label={config.ariaLabel}
            className={`${config.bgColor} ${isEnabled ? '' : 'opacity-50 cursor-not-allowed'} text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors`}
          >
            {config.icon}
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
