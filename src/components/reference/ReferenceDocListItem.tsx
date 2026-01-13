/**
 * ReferenceDocListItem Component
 * Individual document item in the list
 */
import type { CompletedDocumentSummary } from '../../types';

/**
 * Props for ReferenceDocListItem
 */
export interface ReferenceDocListItemProps {
  /** Document summary data */
  document: CompletedDocumentSummary;
  /** Click handler */
  onClick: () => void;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Document type badge component
 */
function DocTypeBadge({
  type,
  hasDoc,
}: {
  type: 'design' | 'prd' | 'prototype';
  hasDoc: boolean;
}) {
  if (!hasDoc) return null;

  const labels = {
    design: 'Design',
    prd: 'PRD',
    prototype: 'Proto',
  };

  const colors = {
    design: 'bg-purple-100 text-purple-700',
    prd: 'bg-green-100 text-green-700',
    prototype: 'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${colors[type]}`}>
      {labels[type]}
    </span>
  );
}

/**
 * ReferenceDocListItem - Single document item
 */
export function ReferenceDocListItem({ document, onClick }: ReferenceDocListItemProps) {
  const displayDate = document.archivedAt
    ? formatDate(document.archivedAt)
    : formatDate(document.updatedAt);

  const statusLabel = document.status === 'archived' ? '아카이브' : '완료';
  const statusColor =
    document.status === 'archived'
      ? 'bg-gray-100 text-gray-600'
      : 'bg-blue-100 text-blue-600';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      aria-label={`${document.title} 문서 보기`}
    >
      {/* Title and status */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
          {document.title}
        </h3>
        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Document type badges */}
      <div className="flex items-center gap-1 mb-2">
        <DocTypeBadge type="design" hasDoc={document.hasDesignDoc} />
        <DocTypeBadge type="prd" hasDoc={document.hasPrd} />
        <DocTypeBadge type="prototype" hasDoc={document.hasPrototype} />
      </div>

      {/* References and date */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1 overflow-hidden">
          {document.references.length > 0 && (
            <>
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="truncate">{document.references.slice(0, 2).join(', ')}</span>
              {document.references.length > 2 && (
                <span className="shrink-0">+{document.references.length - 2}</span>
              )}
            </>
          )}
        </div>
        <span className="shrink-0">{displayDate}</span>
      </div>
    </button>
  );
}
