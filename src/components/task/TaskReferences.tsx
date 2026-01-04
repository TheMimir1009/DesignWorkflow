/**
 * TaskReferences Component
 * Display and manage task reference links
 */

interface TaskReferencesProps {
  references: string[];
  onRemove?: (refId: string) => void;
  onAdd?: () => void;
  maxDisplay?: number;
  readonly?: boolean;
}

/**
 * Check if a string is a valid URL
 */
function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Link icon SVG component
 */
function LinkIcon() {
  return (
    <svg
      data-testid="link-icon"
      className="h-4 w-4 text-gray-400 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </svg>
  );
}

/**
 * Document icon SVG component
 */
function DocumentIcon() {
  return (
    <svg
      data-testid="document-icon"
      className="h-4 w-4 text-gray-400 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

/**
 * Remove icon SVG component
 */
function RemoveIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

/**
 * Plus icon SVG component
 */
function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

/**
 * Component for displaying and managing task references
 */
export function TaskReferences({
  references,
  onRemove,
  onAdd,
  maxDisplay,
  readonly = false,
}: TaskReferencesProps) {
  const displayedReferences = maxDisplay
    ? references.slice(0, maxDisplay)
    : references;
  const remainingCount = maxDisplay
    ? Math.max(0, references.length - maxDisplay)
    : 0;

  const showRemoveButtons = !readonly && onRemove;
  const showAddButton = !readonly && onAdd;

  return (
    <div data-testid="task-references" className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-700">References</h4>
          {references.length > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              {references.length}
            </span>
          )}
        </div>
        {showAddButton && (
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add reference"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          >
            <PlusIcon />
            Add
          </button>
        )}
      </div>

      {references.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No references</p>
      ) : (
        <ul role="list" className="space-y-1">
          {displayedReferences.map((ref) => (
            <li
              key={ref}
              className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded-md group"
            >
              {isUrl(ref) ? <LinkIcon /> : <DocumentIcon />}
              <div className="flex-1 min-w-0">
                {isUrl(ref) ? (
                  <a
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block"
                  >
                    {ref}
                  </a>
                ) : (
                  <span className="text-sm text-gray-700 truncate block">
                    {ref}
                  </span>
                )}
              </div>
              {showRemoveButtons && (
                <button
                  type="button"
                  onClick={() => onRemove(ref)}
                  aria-label={`Remove ${ref}`}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RemoveIcon />
                </button>
              )}
            </li>
          ))}
          {remainingCount > 0 && (
            <li className="py-1.5 px-2 text-sm text-gray-500">
              +{remainingCount} more
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
