/**
 * Debug Console Main Component (SPEC-DEBUG-001 TAG-004 TASK-006)
 *
 * Main LLM Debug Console component
 * REQ-E-001: Display Debug Console when menu is clicked
 * REQ-U-001: Only accessible in development mode
 */

import { isDebugConsoleAccessible } from '../../utils/accessControl';
import { useDebugStore } from '../../store/debugStore';
import { DebugHeader } from './DebugHeader';
import { DebugFilters } from './DebugFilters';
import { DebugStats } from './DebugStats';
import { LogList } from './LogList';
import { LogDetailModal } from './LogDetailModal';

export function DebugConsole() {
  // REQ-W-001: System must not display Debug Console in production
  // Hooks must be called unconditionally at the top level
  const { logs } = useDebugStore();

  if (!isDebugConsoleAccessible()) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <DebugHeader />
      <DebugFilters />
      <DebugStats />

      {logs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
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
              Debug Console Ready
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              LLM API logs will appear here when you make requests
            </p>
          </div>
        </div>
      ) : (
        <LogList />
      )}

      <LogDetailModal />
    </div>
  );
}
