/**
 * Debug Filters Component (SPEC-DEBUG-001 TAG-004 TASK-008)
 *
 * Filter controls for debug logs
 */

import { useDebugStore } from '../../store/debugStore';
import type { DebugFilters } from '../../types/debug';

export function DebugFilters() {
  const { filters, setFilters, logs } = useDebugStore();

  // Get unique models from logs
  const models = Array.from(new Set(logs.map((log) => log.model))).sort();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value as DebugFilters['status'] });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ model: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <select
        value={filters.status}
        onChange={handleStatusChange}
        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Status</option>
        <option value="success">Success</option>
        <option value="error">Error</option>
        <option value="pending">Pending</option>
      </select>

      <select
        value={filters.model}
        onChange={handleModelChange}
        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={models.length === 0}
      >
        <option value="all">All Models</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={filters.search}
        onChange={handleSearchChange}
        placeholder="Search logs..."
        className="flex-1 min-w-[200px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
