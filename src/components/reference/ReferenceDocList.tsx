/**
 * ReferenceDocList Component
 * List of completed documents with loading and empty states
 */
import { useReferenceDocStore } from '../../store/referenceDocStore';
import { ReferenceDocListItem } from './ReferenceDocListItem';

/**
 * Props for ReferenceDocList
 */
export interface ReferenceDocListProps {
  /** Project ID */
  projectId: string;
  /** Handler when a document is selected */
  onSelectDocument: (taskId: string) => void;
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-0" data-testid="loading-skeleton">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 border-b border-gray-100 animate-pulse">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex gap-1 mb-2">
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-10" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" data-testid="empty-state">
      <svg
        className="w-12 h-12 text-gray-300 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="text-sm text-gray-500">
        {hasFilters ? '검색 결과가 없습니다' : '완료된 문서가 없습니다'}
      </p>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ error }: { error: string }) {
  return (
    <div className="p-4 text-center" data-testid="error-state">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}

/**
 * ReferenceDocList - Document list with loading/empty/error states
 */
export function ReferenceDocList({ onSelectDocument }: ReferenceDocListProps) {
  const documents = useReferenceDocStore((state) => state.documents);
  const isLoading = useReferenceDocStore((state) => state.isLoading);
  const error = useReferenceDocStore((state) => state.error);
  const searchQuery = useReferenceDocStore((state) => state.searchQuery);
  const filters = useReferenceDocStore((state) => state.filters);

  const hasFilters = Boolean(searchQuery || filters.length > 0);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Empty state
  if (documents.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  // Document list
  return (
    <div className="divide-y divide-gray-100" data-testid="document-list">
      {documents.map((doc) => (
        <ReferenceDocListItem
          key={doc.taskId}
          document={doc}
          onClick={() => onSelectDocument(doc.taskId)}
        />
      ))}
    </div>
  );
}
