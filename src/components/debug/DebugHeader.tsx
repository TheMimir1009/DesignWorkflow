/**
 * Debug Header Component (SPEC-DEBUG-001 TAG-004 TASK-007)
 *
 * Header with clear and export buttons
 */

import { useDebugStore } from '../../store/debugStore';

export function DebugHeader() {
  const { logs, clearLogs, exportLogs } = useDebugStore();

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      clearLogs();
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    exportLogs(format);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Debug Console
      </h2>

      <div className="flex gap-2">
        {logs.length > 0 && (
          <>
            <button
              onClick={() => handleExport('json')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Export JSON
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Export CSV
            </button>

            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
