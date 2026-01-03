/**
 * SystemPreview Component
 * Modal component for previewing system documents with markdown rendering
 * TAG-007: SystemPreview component
 */
import { useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useReferenceStore } from '../../store/referenceStore';
import type { SystemDocument } from '../../types';

/**
 * SystemPreview Props interface
 */
interface SystemPreviewProps {
  /** Document to preview, null to hide modal */
  document: SystemDocument | null;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Loading state for content */
  isLoading?: boolean;
}

/**
 * SystemPreview Component
 * Modal displaying system document content with:
 * - Markdown rendering via react-markdown
 * - "Add to References" button
 * - Loading spinner state
 * - Close on ESC, backdrop click, or X button
 */
export function SystemPreview({
  document,
  onClose,
  isLoading = false,
}: SystemPreviewProps) {
  const { selectedReferences, addReference } = useReferenceStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // Check if document is already in references
  const isAlreadyAdded = document
    ? selectedReferences.some((ref) => ref.id === document.id)
    : false;

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (document) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [document, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle add to references
  const handleAddToReferences = useCallback(() => {
    if (document && !isAlreadyAdded) {
      addReference(document);
    }
  }, [document, isAlreadyAdded, addReference]);

  // Don't render if no document
  if (!document) {
    return null;
  }

  const modalTitleId = `modal-title-${document.id}`;

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2
            id={modalTitleId}
            className="text-lg font-semibold text-white truncate"
          >
            {document.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div
              role="status"
              aria-label="로딩 중"
              className="flex items-center justify-center h-32"
            >
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{document.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            type="button"
            onClick={handleAddToReferences}
            disabled={isAlreadyAdded}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isAlreadyAdded
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAlreadyAdded ? '이미 추가됨' : '참조에 추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
