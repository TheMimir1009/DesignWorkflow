/**
 * TemplateCard Component
 * Card display for a template with actions
 */
import type { Template } from '../../types';

export interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  /** Whether the card is currently selected */
  isSelected?: boolean;
}

/**
 * Card component for displaying a template
 */
export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onPreview,
  isSelected = false,
}: TemplateCardProps) {
  const variableCount = template.variables.length;
  const variableText = variableCount === 1 ? 'variable' : 'variables';

  return (
    <div
      data-testid="template-card"
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {template.name}
            </h3>
            {template.isDefault && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Default
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {template.category}
          </p>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={onPreview}
            aria-label={`Preview ${template.name}`}
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
            aria-label={`Edit ${template.name}`}
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
            aria-label={`Delete ${template.name}`}
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

      {/* Variable count badge */}
      <div className="mt-3 flex items-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
          {variableCount} {variableText}
        </span>
      </div>
    </div>
  );
}
