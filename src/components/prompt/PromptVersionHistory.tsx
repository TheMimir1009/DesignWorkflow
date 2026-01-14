/**
 * PromptVersionHistory Component
 * Version history viewer with restore functionality
 */
import React, { useState, useMemo } from 'react';
import type { PromptVersion } from '../../types';

interface PromptVersionHistoryProps {
  /** Array of version history */
  versions: PromptVersion[];
  /** Current version number */
  currentVersion: number;
  /** Callback when version is restored */
  onRestore: (versionId: string, content: string) => void;
  /** Callback when version is selected for comparison */
  onVersionSelect?: (version: PromptVersion) => void;
  /** Whether to show loading state */
  isLoading?: boolean;
  /** Whether to show diff view */
  showDiff?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate content for preview
 */
function truncateContent(content: string, maxLength = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <svg
        className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No version history available</p>
    </div>
  );
};

/**
 * Version item component
 */
interface VersionItemProps {
  version: PromptVersion;
  isCurrent: boolean;
  onRestore: (versionId: string, content: string) => void;
  onSelect?: (version: PromptVersion) => void;
  showDiff: boolean;
}

const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isCurrent,
  onRestore,
  onSelect,
  showDiff,
}) => {
  const handleRestore = () => {
    onRestore(version.id, version.content);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(version);
    }
  };

  return (
    <div
      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
      data-testid={`version-item-${version.version}`}
      data-version-number={version.version}
    >
      {/* Version header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Version {version.version}
            </h4>
            {isCurrent && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Current
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(version.createdAt)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {onSelect && !isCurrent && (
            <button
              type="button"
              onClick={handleSelect}
              aria-label="Select for comparison"
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Compare"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          )}
          {!isCurrent && (
            <button
              type="button"
              onClick={handleRestore}
              aria-label="Restore version"
              className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              title="Restore this version"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded font-mono">
        {truncateContent(version.content)}
      </div>
    </div>
  );
};

export const PromptVersionHistory: React.FC<PromptVersionHistoryProps> = ({
  versions,
  currentVersion,
  onRestore,
  onVersionSelect,
  isLoading = false,
  showDiff = false,
  className = '',
}) => {
  // Sort versions by createdAt descending (newest first)
  const sortedVersions = useMemo(() => {
    return [...versions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [versions]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (versions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`prompt-version-history ${className}`} data-testid="prompt-version-history">
      {/* Header with count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Version History
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </div>

      {/* Version list */}
      <div className="space-y-3">
        {sortedVersions.map((version) => (
          <VersionItem
            key={version.id}
            version={version}
            isCurrent={version.version === currentVersion}
            onRestore={onRestore}
            onSelect={onVersionSelect}
            showDiff={showDiff}
          />
        ))}
      </div>
    </div>
  );
};
