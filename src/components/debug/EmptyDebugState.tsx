/**
 * Empty Debug State Component (SPEC-DEBUG-001 TAG-004 TASK-013)
 *
 * Shown when no logs are available
 * REQ-W-004: System should not show empty screen without guidance
 */

export function EmptyDebugState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <svg
        className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>

      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No Logs Yet
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
        LLM API call logs will appear here. Make an API call to see debugging information.
      </p>
    </div>
  );
}
