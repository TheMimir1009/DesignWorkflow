/**
 * GenerationError Component
 * Error display with retry functionality for AI generation
 *
 * Requirements:
 * - REQ-UI-004: Display error messages
 * - REQ-UI-005: Provide retry mechanism
 * - REQ-UI-006: Show error details when available
 */
import { useState } from 'react';

type ErrorType = 'timeout' | 'network' | 'generic';

interface GenerationErrorProps {
  /** Error message to display */
  message: string;
  /** Detailed error information */
  details?: string;
  /** Error type for styling */
  errorType?: ErrorType;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Callback for dismiss action */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Error display component with retry functionality
 */
export function GenerationError({
  message,
  details,
  errorType = 'generic',
  onRetry,
  onDismiss,
  className = '',
}: GenerationErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!message) {
    return null;
  }

  return (
    <div
      data-testid="generation-error"
      className={`rounded-lg border p-4 ${className}`}
    >
      <div
        role="alert"
        aria-live="assertive"
        data-error-type={errorType}
        className={`flex items-start gap-3 ${
          errorType === 'timeout' ? 'bg-yellow-50 border-yellow-200' :
          errorType === 'network' ? 'bg-red-50 border-red-200' :
          'bg-red-50 border-red-200'
        }`}
      >
        {/* Error icon */}
        <div data-testid="error-icon" className="flex-shrink-0 mt-0.5">
          <svg
            className={`w-5 h-5 ${
              errorType === 'timeout' ? 'text-yellow-600' : 'text-red-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Error content */}
        <div className="flex-1">
          <p className={`font-medium ${
            errorType === 'timeout' ? 'text-yellow-800' : 'text-red-800'
          }`}>
            {message}
          </p>

          {/* Details toggle and content */}
          {details && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className={`text-sm underline ${
                  errorType === 'timeout' ? 'text-yellow-700' : 'text-red-700'
                }`}
                aria-expanded={showDetails}
                aria-controls="error-details"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
              <div
                id="error-details"
                className={`mt-2 text-sm ${
                  errorType === 'timeout' ? 'text-yellow-700' : 'text-red-700'
                } ${showDetails ? '' : 'hidden'}`}
                style={{ visibility: showDetails ? 'visible' : 'hidden' }}
              >
                {details}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  errorType === 'timeout'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerationError;
