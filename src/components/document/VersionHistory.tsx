/**
 * VersionHistory Component
 * TAG-DOC-004: Document version history list and restore
 *
 * Features:
 * - List of versions with timestamps
 * - Current version highlighting
 * - Restore functionality for previous versions
 * - Expandable content preview
 */
import { useState, useCallback } from 'react';
import type { Revision } from '../../types';

/**
 * Props for VersionHistory component
 */
export interface VersionHistoryProps {
  /** Array of revision records */
  versions: Revision[];
  /** Currently active version number */
  currentVersion: number;
  /** Callback when restore button is clicked */
  onRestore: (version: number) => void;
}

/**
 * Format ISO date string to readable format
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * VersionHistory displays a list of document versions with restore capability.
 *
 * Shows versions in descending order (newest first), highlights the current
 * version, and allows restoring to previous versions.
 *
 * @example
 * ```tsx
 * <VersionHistory
 *   versions={revisions}
 *   currentVersion={3}
 *   onRestore={(version) => handleRestore(version)}
 * />
 * ```
 */
export function VersionHistory({
  versions,
  currentVersion,
  onRestore,
}: VersionHistoryProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

  // Sort versions in descending order (newest first)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  const toggleExpand = useCallback((version: number) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  }, []);

  const handleRestore = useCallback(
    (version: number) => {
      onRestore(version);
    },
    [onRestore]
  );

  if (versions.length === 0) {
    return (
      <div
        data-testid="version-history"
        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <h3 className="text-sm font-medium text-gray-700 mb-2">Version History</h3>
        <p className="text-sm text-gray-500">No history available</p>
      </div>
    );
  }

  return (
    <div
      data-testid="version-history"
      className="border border-gray-200 rounded-lg bg-white overflow-hidden"
    >
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Version History</h3>
      </div>

      <ul role="list" className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {sortedVersions.map((revision) => {
          const isCurrent = revision.version === currentVersion;
          const isExpanded = expandedVersions.has(revision.version);

          return (
            <li
              key={revision.id}
              data-testid={`version-item-${revision.version}`}
              className={`p-4 ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      Version {revision.version}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(revision.createdAt)}
                  </p>
                  {revision.feedback && (
                    <p className="text-sm text-gray-600 mt-1">{revision.feedback}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleExpand(revision.version)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                    aria-label={isExpanded ? 'Hide preview' : 'Show preview'}
                  >
                    {isExpanded ? 'Hide' : 'Preview'}
                  </button>
                  {!isCurrent && (
                    <button
                      onClick={() => handleRestore(revision.version)}
                      className="px-2 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                      aria-label={`Restore to version ${revision.version}`}
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded content preview */}
              {isExpanded && (
                <div className="mt-3 p-3 bg-gray-100 rounded-md">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
                    {revision.content}
                  </pre>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
