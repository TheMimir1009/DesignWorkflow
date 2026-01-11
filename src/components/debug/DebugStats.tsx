/**
 * Debug Stats Component (SPEC-DEBUG-001 TAG-004 TASK-009)
 *
 * Displays statistics summary for LLM calls
 */

import { useDebugStore } from '../../store/debugStore';

export function DebugStats() {
  const { stats } = useDebugStore();

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCost = (cost: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(cost);
  };

  return (
    <div className="flex flex-wrap gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">Total Requests:</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(stats.totalRequests)}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">Success:</span>
        <span className="font-medium text-green-600 dark:text-green-400">{formatNumber(stats.successCount)}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">Failed:</span>
        <span className="font-medium text-red-600 dark:text-red-400">{formatNumber(stats.errorCount)}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">Tokens:</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(stats.totalTokens)}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">Cost:</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{formatCost(stats.totalCost)}</span>
      </div>
    </div>
  );
}
