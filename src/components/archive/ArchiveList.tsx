/**
 * ArchiveList Component
 * Displays a searchable list of archived tasks
 */
import type { Archive } from '../../types';
import { ArchiveCard } from './ArchiveCard';

/**
 * Props for ArchiveList component
 */
export interface ArchiveListProps {
  archives: Archive[];
  selectedArchiveId: string | null;
  searchQuery: string;
  isLoading: boolean;
  onRestore: (archiveId: string) => void;
  onDelete: (archiveId: string) => void;
  onSelect: (archiveId: string) => void;
  onSearchChange: (query: string) => void;
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <div
      data-testid="loading-spinner"
      className="flex items-center justify-center py-12"
    >
      <svg
        className="animate-spin h-8 w-8 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="w-16 h-16 text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-400 mb-2">
        No archived tasks
      </h3>
      <p className="text-sm text-gray-500">
        Completed prototype tasks will appear here when archived.
      </p>
    </div>
  );
}

/**
 * ArchiveList - Searchable list of archived tasks
 */
export function ArchiveList({
  archives,
  selectedArchiveId,
  searchQuery,
  isLoading,
  onRestore,
  onDelete,
  onSelect,
  onSearchChange,
}: ArchiveListProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Archives</h2>
          <span className="text-sm text-gray-400">
            {archives.length} archived tasks
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search archives..."
            className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Archive List */}
      {archives.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {archives.map((archive) => (
            <ArchiveCard
              key={archive.id}
              archive={archive}
              isSelected={archive.id === selectedArchiveId}
              onRestore={onRestore}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
