/**
 * VersionComparisonView Component
 * TAG-DOCEDIT-005: Visual diff comparison between document versions
 *
 * Features:
 * - Display side-by-side comparison of two document versions
 * - Color-coded diff display (green=add, red=delete, yellow=modify)
 * - Integration with backend diff API
 * - Diff summary statistics
 * - Keyboard accessibility (Escape to close)
 */
import { useEffect, useState, useMemo, useRef } from 'react';
import { diffLines } from 'diff';

/**
 * Document version interface
 */
export interface DocumentVersion {
  id: string;
  taskId: string;
  content: string;
  timestamp: Date;
  author: string;
  versionNumber: number;
  changeDescription?: string;
  parentVersionId?: string;
}

/**
 * Diff change type
 */
type ChangeType = 'added' | 'removed' | 'unchanged';

/**
 * Diff line with change information
 */
interface DiffLine {
  type: ChangeType;
  lineNumber1: number | null;
  lineNumber2: number | null;
  content: string;
}

/**
 * Diff summary statistics
 */
interface DiffSummary {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
}

/**
 * Props for VersionComparisonView component
 */
export interface VersionComparisonViewProps {
  /** First version to compare */
  version1: DocumentVersion;
  /** Second version to compare */
  version2: DocumentVersion;
  /** Callback when comparison should close */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Calculate diff between two versions
 */
function calculateDiff(
  content1: string,
  content2: string
): { lines: DiffLine[]; summary: DiffSummary } {
  const changes = diffLines(content1, content2);

  const lines: DiffLine[] = [];
  let line1 = 1;
  let line2 = 1;

  const summary: DiffSummary = {
    additions: 0,
    deletions: 0,
    modifications: 0,
    unchanged: 0,
  };

  changes.forEach((change) => {
    const type: ChangeType = change.added
      ? 'added'
      : change.removed
        ? 'removed'
        : 'unchanged';

    const contentLines = change.value.split('\n').filter((line) => line !== '');

    contentLines.forEach((lineContent) => {
      if (type === 'added') {
        lines.push({
          type: 'added',
          lineNumber1: null,
          lineNumber2: line2++,
          content: lineContent,
        });
        summary.additions++;
      } else if (type === 'removed') {
        lines.push({
          type: 'removed',
          lineNumber1: line1++,
          lineNumber2: null,
          content: lineContent,
        });
        summary.deletions++;
      } else {
        lines.push({
          type: 'unchanged',
          lineNumber1: line1++,
          lineNumber2: line2++,
          content: lineContent,
        });
        summary.unchanged++;
      }
    });
  });

  return { lines, summary };
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * VersionComparisonView displays a visual comparison between two document versions
 *
 * @example
 * ```tsx
 * <VersionComparisonView
 *   version1={version1}
 *   version2={version2}
 *   onClose={() => setShowComparison(false)}
 * />
 * ```
 */
export function VersionComparisonView({
  version1,
  version2,
  onClose,
  className = '',
}: VersionComparisonViewProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate diff
  const { lines, summary } = useMemo(
    () => calculateDiff(version1.content, version2.content),
    [version1.content, version2.content]
  );

  // Check if versions are identical
  const isIdentical = useMemo(
    () => summary.additions === 0 && summary.deletions === 0,
    [summary]
  );

  /**
   * Handle Escape key to close
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  /**
   * Focus close button on mount
   */
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  /**
   * Render a single diff line
   */
  const renderDiffLine = (line: DiffLine, index: number) => {
    const lineTestId =
      line.type === 'added'
        ? 'diff-line-added'
        : line.type === 'removed'
          ? 'diff-line-removed'
          : 'diff-line-unchanged';

    const lineClass =
      line.type === 'added'
        ? 'diff-line-added'
        : line.type === 'removed'
          ? 'diff-line-removed'
          : 'diff-line-unchanged';

    return (
      <div
        key={index}
        data-testid={lineTestId}
        className={`diff-line ${lineClass}`}
      >
        <span data-testid="line-number-1" className="line-number-1">
          {line.lineNumber1 ?? ''}
        </span>
        <span data-testid="line-number-2" className="line-number-2">
          {line.lineNumber2 ?? ''}
        </span>
        <span className="line-content">{line.content || '\u00A0'}</span>
      </div>
    );
  };

  const totalChanges = summary.additions + summary.deletions + summary.modifications;

  return (
    <div
      data-testid="version-comparison-view"
      className={`version-comparison-view ${className}`}
      role="region"
      aria-label="Version comparison view"
    >
      <div className="comparison-header">
        <h2 className="comparison-title">Version Comparison</h2>
        <button
          ref={closeButtonRef}
          type="button"
          className="close-button"
          onClick={onClose}
          aria-label="Close version comparison"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="comparison-panels">
        <div data-testid="version-1-panel" className="version-panel version-1">
          <div className="version-info">
            <h3>Version {version1.versionNumber}</h3>
            <div className="version-meta">
              <span className="version-date">{formatDate(version1.timestamp)}</span>
              <span className="version-author">{version1.author}</span>
            </div>
          </div>
        </div>

        <div className="version-divider" />

        <div data-testid="version-2-panel" className="version-panel version-2">
          <div className="version-info">
            <h3>Version {version2.versionNumber}</h3>
            <div className="version-meta">
              <span className="version-date">{formatDate(version2.timestamp)}</span>
              <span className="version-author">{version2.author}</span>
            </div>
          </div>
        </div>
      </div>

      {isIdentical ? (
        <div className="diff-identical">
          <p data-testid="no-changes-message">No changes detected between versions</p>
        </div>
      ) : (
        <>
          <div data-testid="diff-summary" className="diff-summary">
            <div className="summary-stat">
              <span className="stat-label">Added</span>
              <span className="stat-value stat-added">{summary.additions}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Removed</span>
              <span className="stat-value stat-removed">{summary.deletions}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Modified</span>
              <span className="stat-value stat-modified">{summary.modifications}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Changes</span>
              <span className="stat-value">{totalChanges}</span>
            </div>
          </div>

          <div className="diff-content">{lines.map(renderDiffLine)}</div>
        </>
      )}
    </div>
  );
}

// Re-export types for convenience
export type { DocumentVersion };
