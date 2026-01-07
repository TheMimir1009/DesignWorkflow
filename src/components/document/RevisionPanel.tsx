/**
 * RevisionPanel Component
 * TAG-DOC-003: AI revision request input panel
 *
 * Features:
 * - Textarea for revision feedback input
 * - Submit button with validation
 * - Loading state display
 * - Error message for empty submission
 */
import { useState, useCallback } from 'react';

/**
 * Props for RevisionPanel component
 */
export interface RevisionPanelProps {
  /** Callback when feedback is submitted */
  onSubmit: (feedback: string) => void;
  /** Whether the panel is in loading state */
  isLoading: boolean;
  /** Whether the panel is disabled */
  disabled?: boolean;
}

/**
 * RevisionPanel provides an interface for requesting AI-powered revisions.
 *
 * Users can enter feedback or revision instructions, which are validated
 * before being submitted. Shows loading state during processing.
 *
 * @example
 * ```tsx
 * <RevisionPanel
 *   onSubmit={(feedback) => handleRevisionRequest(feedback)}
 *   isLoading={isGenerating}
 *   disabled={!canEdit}
 * />
 * ```
 */
export function RevisionPanel({
  onSubmit,
  isLoading,
  disabled = false,
}: RevisionPanelProps) {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFeedbackChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedback(e.target.value);
      // Clear error when user starts typing
      if (error) {
        setError(null);
      }
    },
    [error]
  );

  const handleSubmit = useCallback(() => {
    const trimmedFeedback = feedback.trim();

    if (!trimmedFeedback) {
      setError('Please enter feedback before submitting');
      return;
    }

    onSubmit(trimmedFeedback);
    setFeedback('');
    setError(null);
  }, [feedback, onSubmit]);

  const isDisabled = isLoading || disabled;

  return (
    <div
      data-testid="revision-panel"
      className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700">Request Revision</h3>
        {isLoading && (
          <div
            data-testid="loading-indicator"
            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          />
        )}
      </div>

      <textarea
        value={feedback}
        onChange={handleFeedbackChange}
        disabled={isDisabled}
        placeholder="Enter your revision request or feedback..."
        aria-label="Revision feedback"
        rows={4}
        className={`w-full px-3 py-2 border rounded-md shadow-sm resize-y font-sans text-sm
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          focus:outline-none focus:ring-2
        `}
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Submit revision request"
        >
          {isLoading ? 'Processing...' : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}
