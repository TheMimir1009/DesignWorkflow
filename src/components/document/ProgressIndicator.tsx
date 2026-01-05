/**
 * ProgressIndicator Component
 * Visual progress indicator for Q&A steps
 */

/**
 * Props for ProgressIndicator
 */
export interface ProgressIndicatorProps {
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Array of completed step indices */
  completedSteps: number[];
  /** Callback when step is clicked */
  onStepClick?: (step: number) => void;
}

/**
 * ProgressIndicator - Shows Q&A progress
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
}: ProgressIndicatorProps) {
  const progressPercent = totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;

  return (
    <div className="mb-6">
      {/* Step counter */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm font-medium text-gray-900">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4"
      >
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 justify-center">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;

          let testId = `step-indicator-${index}`;
          if (isCurrent) testId = 'step-indicator-current';
          else if (isCompleted) testId = `step-indicator-completed-${index}`;

          return (
            <button
              key={index}
              type="button"
              data-testid={testId}
              onClick={() => onStepClick?.(index)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                transition-colors cursor-pointer
                ${
                  isCurrent
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }
              `}
            >
              {isCompleted && !isCurrent ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
