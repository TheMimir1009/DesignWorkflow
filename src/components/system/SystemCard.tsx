/**
 * SystemCard Component
 * Displays a single system document with actions
 */
import type { SystemDocument } from '../../types';

export interface SystemCardProps {
  document: SystemDocument;
  onPreview: (document: SystemDocument) => void;
  onEdit: (document: SystemDocument) => void;
  onDelete: (document: SystemDocument) => void;
}

export function SystemCard({ document, onPreview, onEdit, onDelete }: SystemCardProps) {
  const displayedTags = document.tags.slice(0, 3);
  const remainingTagsCount = document.tags.length - 3;

  return (
    <div className="group flex items-center justify-between py-2 px-3 hover:bg-gray-700 rounded-md transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-200 truncate">{document.name}</span>
        </div>
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {displayedTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 bg-gray-600 text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
            {remainingTagsCount > 0 && (
              <span className="text-xs text-gray-400">+{remainingTagsCount}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onPreview(document)}
          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded transition-colors"
          aria-label={`Preview ${document.name}`}
          title="Preview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onEdit(document)}
          className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-gray-600 rounded transition-colors"
          aria-label={`Edit ${document.name}`}
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(document)}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition-colors"
          aria-label={`Delete ${document.name}`}
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
