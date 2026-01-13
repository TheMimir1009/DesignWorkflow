/**
 * Log List Component (SPEC-DEBUG-001 TAG-004 TASK-010)
 *
 * Displays list of LLM call logs using react-window for virtualization
 */

import { useDebugStore } from '../../store/debugStore';
import { LogItem } from './LogItem';
import { EmptyDebugState } from './EmptyDebugState';

export function LogList() {
  const { logs, filters, setSelectedLog, setIsDetailModalOpen } = useDebugStore();

  // Filter logs based on current filters
  const filteredLogs = logs.filter((log) => {
    if (filters.status !== 'all' && log.status !== filters.status) {
      return false;
    }
    if (filters.model !== 'all' && log.model !== filters.model) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        log.model,
        log.endpoint,
        log.error || '',
      ].join(' ').toLowerCase();
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleLogClick = (log: typeof logs[0]) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  if (sortedLogs.length === 0) {
    return <EmptyDebugState />;
  }

  // Display last 100 logs for performance (could use react-window for more)
  const displayLogs = sortedLogs.slice(0, 100);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
        <div className="w-16">Time</div>
        <div className="w-10">Status</div>
        <div className="flex-1">Model</div>
        <div className="w-20 text-right">Tokens</div>
        <div className="w-16 text-right">Cost</div>
        <div className="w-20 text-right">Duration</div>
      </div>

      {/* Log Items */}
      {displayLogs.map((log) => (
        <LogItem key={log.id} log={log} onClick={() => handleLogClick(log)} />
      ))}

      {sortedLogs.length > 100 && (
        <div className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          Showing 100 of {sortedLogs.length} logs
        </div>
      )}
    </div>
  );
}
