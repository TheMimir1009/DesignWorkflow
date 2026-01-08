/**
 * GenerationProgress Component
 * Progress indicator for AI document generation
 *
 * Requirements:
 * - REQ-UI-001: Display generation progress
 * - REQ-UI-002: Show current generation step
 * - REQ-UI-003: Support determinate and indeterminate progress
 */

interface GenerationProgressProps {
  /** Whether generation is in progress */
  isLoading: boolean;
  /** Current step description */
  currentStep?: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Array of step labels */
  steps?: string[];
  /** Current step index (0-based) */
  currentStepIndex?: number;
  /** Total number of steps */
  totalSteps?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Progress indicator component for document generation
 */
export function GenerationProgress({
  isLoading,
  currentStep,
  progress,
  steps,
  currentStepIndex,
  totalSteps,
  className = '',
}: GenerationProgressProps) {
  if (!isLoading) {
    return null;
  }

  const clampedProgress = progress !== undefined ? clamp(progress, 0, 100) : undefined;
  const isDeterminate = clampedProgress !== undefined;

  // Get step label from steps array or currentStep
  const stepLabel = steps && currentStepIndex !== undefined
    ? steps[currentStepIndex]
    : currentStep;

  return (
    <div
      data-testid="generation-progress"
      className={`flex flex-col items-center gap-3 p-4 ${className}`}
    >
      {/* Spinner */}
      <div
        data-testid="generation-spinner"
        className={`w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full ${
          !isDeterminate ? 'animate-spin' : ''
        }`}
        style={isDeterminate ? {
          background: `conic-gradient(#2563eb ${clampedProgress}%, #e5e7eb ${clampedProgress}%)`,
          borderRadius: '50%'
        } : undefined}
      />

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-label="Generation progress"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden"
      >
        {isDeterminate ? (
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${clampedProgress}%` }}
          />
        ) : (
          <div className="h-full bg-blue-600 animate-pulse w-1/2" />
        )}
      </div>

      {/* Status announcement for screen readers */}
      <div role="status" className="sr-only">
        {stepLabel || 'Processing...'}
      </div>

      {/* Step count */}
      {currentStepIndex !== undefined && totalSteps !== undefined && (
        <p className="text-sm text-gray-600">
          Step {currentStepIndex} of {totalSteps}
        </p>
      )}

      {/* Current step label */}
      {stepLabel && (
        <p className="text-sm text-gray-700 text-center">
          {stepLabel}
        </p>
      )}
    </div>
  );
}

export default GenerationProgress;
