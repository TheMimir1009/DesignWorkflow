/**
 * SystemCard Component
 * Card displaying a single system document with selection and actions
 */
import type { SystemDocument } from '../../types';

/**
 * Props for SystemCard component
 */
export interface SystemCardProps {
  /** System document data */
  system: SystemDocument;
  /** Whether the card is selected */
  isSelected?: boolean;
  /** Callback when selection is toggled */
  onToggleSelect?: (systemId: string) => void;
  /** Callback when edit is clicked */
  onEdit?: (system: SystemDocument) => void;
  /** Callback when delete is clicked */
  onDelete?: (system: SystemDocument) => void;
}

/**
 * Maximum number of tags to display
 */
const MAX_VISIBLE_TAGS = 3;

/**
 * SystemCard - Card component for system document display
 */
export function SystemCard({
  system,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
}: SystemCardProps) {
  const visibleTags = system.tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingCount = system.tags.length - MAX_VISIBLE_TAGS;

  const handleCheckboxChange = () => {
    onToggleSelect?.(system.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(system);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(system);
  };

  return (
    <div
      data-testid={`system-card-${system.id}`}
      className={`
        p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow
        ${isSelected ? 'selected ring-2 ring-blue-500 border-blue-500' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with name and actions */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 text-sm truncate">{system.name}</h4>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                data-testid="edit-button"
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
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
                data-testid="delete-button"
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

          {/* Category badge */}
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {system.category}
            </span>
          </div>

          {/* Tags */}
          {system.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
