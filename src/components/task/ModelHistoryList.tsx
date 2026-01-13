/**
 * ModelHistoryList Component (SPEC-MODELHISTORY-001)
 * Displays AI model usage history for a task
 */
import { useState } from 'react';
import type { GenerationHistoryEntry } from '../../types';
import { getProviderDisplayName, getProviderIcon } from '../../types/llm';

interface ModelHistoryListProps {
  history: GenerationHistoryEntry[];
  className?: string;
}

/**
 * Format date for display
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get document type display name
 */
function getDocumentTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    design: 'Design Document',
    prd: 'PRD',
    prototype: 'Prototype',
  };
  return typeMap[type] || type;
}

/**
 * Get action display name
 */
function getActionDisplayName(action: string): string {
  const actionMap: Record<string, string> = {
    create: '생성',
    modify: '수정',
  };
  return actionMap[action] || action;
}

/**
 * Get badge classes for action type
 */
function getActionBadgeClasses(action: string): string {
  if (action === 'create') {
    return 'bg-green-100 text-green-800';
  }
  return 'bg-yellow-100 text-yellow-800';
}

/**
 * Get badge classes for document type
 */
function getDocTypeBadgeClasses(type: string): string {
  const colorMap: Record<string, string> = {
    design: 'bg-purple-100 text-purple-800',
    prd: 'bg-orange-100 text-orange-800',
    prototype: 'bg-blue-100 text-blue-800',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Format token count with commas
 */
function formatTokenCount(count: number): string {
  return count.toLocaleString();
}

/**
 * Component to display AI model usage history
 */
export function ModelHistoryList({ history, className = '' }: ModelHistoryListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Sort history by createdAt descending (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const hasHistory = sortedHistory.length > 0;

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-medium text-gray-900">AI 생성 히스토리</span>
          {hasHistory && (
            <span className="text-sm text-gray-500">({sortedHistory.length})</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {!hasHistory ? (
            <p className="text-gray-500 text-sm text-center py-4">
              생성 이력이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  {/* Header row: Date + Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {formatDateTime(entry.createdAt)}
                    </span>
                    <div className="flex gap-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDocTypeBadgeClasses(entry.documentType)}`}>
                        {getDocumentTypeDisplayName(entry.documentType)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getActionBadgeClasses(entry.action)}`}>
                        {getActionDisplayName(entry.action)}
                      </span>
                    </div>
                  </div>

                  {/* Provider + Model row */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg" role="img" aria-label={entry.provider}>
                      {getProviderIcon(entry.provider)}
                    </span>
                    <span className="font-medium text-gray-900">
                      {getProviderDisplayName(entry.provider)}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-sm text-gray-600 font-mono">
                      {entry.model}
                    </span>
                  </div>

                  {/* Token usage (if available) */}
                  {entry.tokens && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="mr-3">
                        📥 Input: {formatTokenCount(entry.tokens.input)}
                      </span>
                      <span>
                        📤 Output: {formatTokenCount(entry.tokens.output)}
                      </span>
                    </div>
                  )}

                  {/* Feedback (if available, for modifications) */}
                  {entry.feedback && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      <span className="font-medium">수정 요청: </span>
                      <span className="text-gray-800">
                        {entry.feedback.length > 100
                          ? `${entry.feedback.substring(0, 100)}...`
                          : entry.feedback}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
