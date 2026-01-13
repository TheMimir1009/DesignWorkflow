/**
 * SystemCard Component
<<<<<<< HEAD
 * Card display for a system document with actions
 * SPEC-REFERENCE-001: Enhanced with selectable mode for reference selection
 */
import type { SystemDocument } from '../../types';

export interface SystemCardProps {
  document: SystemDocument;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  /** Enable selection checkbox */
  selectable?: boolean;
  /** Whether the card is currently selected */
  isSelected?: boolean;
  /** Callback when selection is toggled */
  onToggleSelect?: (id: string) => void;
}

/**
 * Card component for displaying a system document
 * Supports selectable mode for reference document selection
 */
export function SystemCard({
  document,
  onEdit,
  onDelete,
  onPreview,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}: SystemCardProps) {
  const handleCheckboxChange = () => {
    onToggleSelect?.(document.id);
=======
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
>>>>>>> main
  };

  return (
    <div
<<<<<<< HEAD
      data-testid="system-card"
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Checkbox for selectable mode */}
        {selectable && (
          <div className="flex items-center mr-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              aria-label={`Select ${document.name}`}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {document.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {document.category}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={onPreview}
            aria-label={`Preview ${document.name}`}
            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Eye icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${document.name}`}
            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Pencil icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${document.name}`}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {/* Trash icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tags */}
      {document.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {document.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
=======
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
>>>>>>> main
    </div>
  );
}
