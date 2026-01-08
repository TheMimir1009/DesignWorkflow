/**
 * ArchiveCard Component
 * Displays a single archived task with restore and delete actions
 */
import type { Archive } from '../../types';

/**
 * Props for ArchiveCard component
 */
export interface ArchiveCardProps {
  archive: Archive;
  onRestore: (archiveId: string) => void;
  onDelete: (archiveId: string) => void;
  onSelect: (archiveId: string) => void;
  isSelected?: boolean;
}

/**
 * Document status icon component
 */
function DocumentIcon({
  type,
  exists,
}: {
  type: 'featurelist' | 'design' | 'prd' | 'prototype';
  exists: boolean;
}) {
  if (!exists) return null;

  const iconMap = {
    featurelist: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
    design: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
    prd: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
          clipRule="evenodd"
        />
        <path d="M7 15h2v2H7v-2z" />
      </svg>
    ),
    prototype: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <span
      data-testid={`icon-${type}`}
      className="text-gray-400"
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      {iconMap[type]}
    </span>
  );
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
  });
}

/**
 * ArchiveCard - Displays archived task information with actions
 */
export function ArchiveCard({
  archive,
  onRestore,
  onDelete,
  onSelect,
  isSelected = false,
}: ArchiveCardProps) {
  const { task } = archive;

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRestore(archive.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(archive.id);
  };

  const handleSelect = () => {
    onSelect(archive.id);
  };

  return (
    <div
      data-testid={`archive-card-${archive.id}`}
      onClick={handleSelect}
      className={`
        p-4 bg-gray-800 rounded-lg border border-gray-700
        hover:border-gray-600 transition-colors cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-white text-sm">{task.title}</h3>
        <span className="text-xs text-gray-500">
          Archived: {formatDate(archive.archivedAt)}
        </span>
      </div>

      {/* Document Icons */}
      <div className="flex gap-2 mb-3">
        <DocumentIcon type="featurelist" exists={Boolean(task.featureList)} />
        <DocumentIcon type="design" exists={Boolean(task.designDocument)} />
        <DocumentIcon type="prd" exists={Boolean(task.prd)} />
        <DocumentIcon type="prototype" exists={Boolean(task.prototype)} />
      </div>

      {/* References count */}
      {task.references.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          {task.references.length} references
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRestore}
          className="flex-1 px-3 py-1.5 text-sm bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors"
        >
          Restore
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="flex-1 px-3 py-1.5 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
