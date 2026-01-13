/**
 * Log Item Component (SPEC-DEBUG-001 TAG-004 TASK-011)
 *
 * Individual log entry in the list
 */

import type { LLMCallLog } from '../../types/debug';
import { DebugStatusIcon } from './DebugStatusIcon';

interface LogItemProps {
  log: LLMCallLog;
  onClick: () => void;
}

export function LogItem({ log, onClick }: LogItemProps) {
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return '-';
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
  };

  const formatTokens = (tokens?: number): string => {
    if (!tokens) return '-';
    return tokens.toLocaleString();
  };

  const formatCost = (cost?: number): string => {
    if (!cost) return '$0';
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div className="w-16 text-xs text-gray-500 dark:text-gray-400 font-mono">
        {formatTime(log.timestamp)}
      </div>

      <div className="w-10">
        <DebugStatusIcon status={log.status} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {log.model}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {log.provider}
        </div>
      </div>

      <div className="w-20 text-right">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {formatTokens(log.totalTokens)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          tokens
        </div>
      </div>

      <div className="w-16 text-right">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {formatCost(log.cost)}
        </div>
      </div>

      <div className="w-20 text-right text-xs text-gray-500 dark:text-gray-400">
        {formatDuration(log.duration)}
      </div>
    </div>
  );
}
