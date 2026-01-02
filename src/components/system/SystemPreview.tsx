/**
 * SystemPreview Component
 * Displays a system document with markdown rendering
 */
import { useEffect, useId } from 'react';
import type { SystemDocument } from '../../types';

export interface SystemPreviewProps {
  document: SystemDocument;
  onClose: () => void;
  onEdit: () => void;
}

export function SystemPreview({ document, onClose, onEdit }: SystemPreviewProps) {
  const titleId = useId();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 id={titleId} className="text-xl font-semibold text-white">
              {document.name}
            </h2>
            <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
              {document.category}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Metadata */}
        <div className="px-6 py-3 border-b border-gray-700 bg-gray-850">
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {document.dependencies.length > 0 && (
            <div className="text-xs text-gray-400">
              Dependencies: {document.dependencies.length} document(s)
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Created: {new Date(document.createdAt).toLocaleDateString()}
            {' | '}
            Updated: {new Date(document.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {document.content ? (
            <div className="prose prose-invert prose-sm max-w-none">
              {/* Simple markdown rendering - can be enhanced with react-markdown */}
              <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
                {document.content}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500 italic">No content available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
