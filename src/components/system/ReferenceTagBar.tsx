/**
 * ReferenceTagBar Component
 * Displays selected reference documents as tags with removal and add functionality
 * TAG-002: ReferenceTagBar component
 */
import { useReferenceStore } from '../../store/referenceStore';

export interface ReferenceTagBarProps {
  onAddClick: () => void;
}

const MAX_VISIBLE_TAGS = 4;
const TRUNCATION_THRESHOLD = 5;

export function ReferenceTagBar({ onAddClick }: ReferenceTagBarProps) {
  const { selectedReferences, removeReference } = useReferenceStore();

  const shouldTruncate = selectedReferences.length > TRUNCATION_THRESHOLD;
  const visibleReferences = shouldTruncate
    ? selectedReferences.slice(0, MAX_VISIBLE_TAGS)
    : selectedReferences;
  const hiddenCount = shouldTruncate ? selectedReferences.length - MAX_VISIBLE_TAGS : 0;

  return (
    <div
      role="region"
      aria-label="Selected references"
      className="flex items-center gap-2 flex-wrap"
    >
      {visibleReferences.map((doc) => (
        <span
          key={doc.id}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-white text-sm rounded-full"
        >
          <span>{doc.name}</span>
          <button
            type="button"
            onClick={() => removeReference(doc.id)}
            aria-label={`Remove ${doc.name}`}
            className="ml-1 p-0.5 hover:bg-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-3.5 h-3.5"
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
        </span>
      ))}

      {hiddenCount > 0 && (
        <span className="text-gray-400 text-sm">
          +{hiddenCount} more
        </span>
      )}

      <button
        type="button"
        onClick={onAddClick}
        aria-label="Add reference"
        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Add</span>
      </button>
    </div>
  );
}
