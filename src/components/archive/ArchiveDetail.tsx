/**
 * ArchiveDetail Component
 * Displays detailed view of an archived task with all documents
 */
import type { Archive } from '../../types';

/**
 * Props for ArchiveDetail component
 */
export interface ArchiveDetailProps {
  archive: Archive | null;
  onRestore: (archiveId: string) => void;
  onDelete: (archiveId: string) => void;
  onClose: () => void;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Document section component
 */
function DocumentSection({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-700 px-4 py-2">
        <h4 className="text-sm font-medium text-gray-200">{title}</h4>
      </div>
      <div className="p-4 bg-gray-800/50">
        {content ? (
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            {content}
          </pre>
        ) : (
          <p className="text-sm text-gray-500 italic">No content</p>
        )}
      </div>
    </div>
  );
}

/**
 * ArchiveDetail - Detailed view of archived task
 */
export function ArchiveDetail({
  archive,
  onRestore,
  onDelete,
  onClose,
}: ArchiveDetailProps) {
  if (!archive) {
    return null;
  }

  const { task } = archive;

  const handleRestore = () => {
    onRestore(archive.id);
  };

  const handleDelete = () => {
    onDelete(archive.id);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">{task.title}</h2>
          <p className="text-sm text-gray-400">
            Archived: {formatDate(archive.archivedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* References */}
        {task.references.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">References</h4>
            <div className="flex flex-wrap gap-2">
              {task.references.map((ref, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300"
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <DocumentSection title="Feature List" content={task.featureList} />
        <DocumentSection title="Design Document" content={task.designDocument} />
        <DocumentSection title="PRD" content={task.prd} />
        <DocumentSection title="Prototype" content={task.prototype} />
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 p-4 border-t border-gray-700">
        <button
          type="button"
          onClick={handleRestore}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Restore Task
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Permanently
        </button>
      </div>
    </div>
  );
}
