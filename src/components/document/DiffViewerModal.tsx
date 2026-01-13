/**
 * DiffViewerModal Component
 * TAG-DOCEDIT-003: Version comparison modal with diff visualization
 *
 * Features:
 * - Display version comparison between two document versions
 * - Color-coded diff display (green for additions, red for deletions)
 * - Summary statistics (additions, deletions, modifications)
 * - Modal with backdrop and keyboard close support
 * - Scrollable content for large diffs
 * - Accessible ARIA attributes
 */
import { useEffect, useRef } from 'react';
import { generateDocumentDiff } from '../../../server/utils/diffGenerator';
import type { DocumentVersion } from '../../../server/utils/versionStorage';

/**
 * Props for DiffViewerModal component
 */
export interface DiffViewerModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** First (older) version to compare */
  version1: DocumentVersion;
  /** Second (newer) version to compare */
  version2: DocumentVersion;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString();
}

/**
 * DiffViewerModal displays a comparison between two document versions
 * with color-coded changes and summary statistics.
 *
 * @example
 * ```tsx
 * <DiffViewerModal
 *   isOpen={true}
 *   version1={version1}
 *   version2={version2}
 *   onClose={handleClose}
 * />
 * ```
 */
export function DiffViewerModal({
  isOpen,
  version1,
  version2,
  onClose,
}: DiffViewerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Generate diff between versions
  const diffResult = generateDocumentDiff(version1, version2);

  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="diff-viewer-modal"
      className="diff-viewer-modal fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Version comparison: v${version1.versionNumber} vs v${version2.versionNumber}`}
    >
      {/* Backdrop */}
      <div
        data-testid="diff-modal-backdrop"
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        data-testid="diff-modal-content"
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col m-4 overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Version Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">
              Comparing Version {version1.versionNumber} → Version {version2.versionNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Version Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Version {version1.versionNumber}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(version1.timestamp)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {version1.changeDescription || <span>No description</span>}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Version {version2.versionNumber}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(version2.timestamp)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {version2.changeDescription || <span>No description</span>}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Author: {version2.author}
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-green-600 font-semibold">{diffResult.summary.additions}</span>
              <span className="text-gray-600 ml-1">Additions</span>
            </div>
            <div>
              <span className="text-red-600 font-semibold">{diffResult.summary.deletions}</span>
              <span className="text-gray-600 ml-1">Deletions</span>
            </div>
            <div>
              <span className="text-yellow-600 font-semibold">{diffResult.summary.modifications}</span>
              <span className="text-gray-600 ml-1">Modifications</span>
            </div>
          </div>
        </div>

        {/* Diff Changes */}
        <div
          data-testid="diff-changes"
          className="flex-1 overflow-auto p-6 bg-gray-900"
        >
          {diffResult.changes.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No changes detected between versions
            </div>
          ) : (
            <pre className="text-sm font-mono">
              {diffResult.changes.map((change, index) => (
                <div
                  key={index}
                  data-testid={`diff-${change.type}`}
                  className={`diff-${change.type} ${
                    change.type === 'addition'
                      ? 'bg-green-900 text-green-100'
                      : change.type === 'deletion'
                      ? 'bg-red-900 text-red-100 line-through'
                      : 'bg-yellow-900 text-yellow-100'
                  }`}
                >
                  {change.value.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex} className="px-2 py-0.5">
                      {line}
                    </div>
                  ))}
                </div>
              ))}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
