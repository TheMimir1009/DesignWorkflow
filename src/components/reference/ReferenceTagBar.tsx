/**
 * ReferenceTagBar Component
 * Displays selected reference documents as removable tags
 * SPEC-REFERENCE-001: Reference System Selection
 */
import { useReferenceStore } from '../../store/referenceStore';
import { useSystemStore } from '../../store/systemStore';

export interface ReferenceTagBarProps {
  projectId: string | null;
  onSaveAsDefault: () => void;
}

/**
 * Tag bar that displays selected reference documents
 * Allows removal of individual references or clearing all
 */
export function ReferenceTagBar({ projectId, onSaveAsDefault }: ReferenceTagBarProps) {
  const { selectedReferences, removeReference, clearReferences } = useReferenceStore();
  const { documents } = useSystemStore();

  // Disabled state when no project selected
  if (!projectId) {
    return (
      <div
        data-testid="reference-tag-bar"
        className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <span className="text-sm text-gray-400">Select a project to manage references</span>
      </div>
    );
  }

  // Get document details for selected references
  const selectedDocuments = selectedReferences.map((refId) => {
    const doc = documents.find((d) => d.id === refId);
    return {
      id: refId,
      name: doc?.name ?? 'Unknown',
      exists: !!doc,
    };
  });

  const referenceCount = selectedReferences.length;

  // Empty state
  if (referenceCount === 0) {
    return (
      <div
        data-testid="reference-tag-bar"
        className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <span className="text-sm text-gray-500">No references selected</span>
      </div>
    );
  }

  return (
    <div
      data-testid="reference-tag-bar"
      className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
    >
      {/* Reference count badge */}
      <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
        {referenceCount}
      </span>

      {/* Reference tags */}
      <div className="flex flex-wrap gap-1.5">
        {selectedDocuments.map((doc) => (
          <span
            key={doc.id}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
              doc.exists
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {doc.name}
            <button
              type="button"
              onClick={() => removeReference(doc.id)}
              aria-label={`Remove ${doc.name}`}
              className="p-0.5 hover:bg-blue-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {/* Clear all button */}
      <button
        type="button"
        onClick={clearReferences}
        aria-label="Clear all references"
        className="ml-auto px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
      >
        Clear all
      </button>

      {/* Save as default button (for later TASK-008) */}
      <button
        type="button"
        onClick={onSaveAsDefault}
        aria-label="Save as default"
        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        Save as default
      </button>
    </div>
  );
}
