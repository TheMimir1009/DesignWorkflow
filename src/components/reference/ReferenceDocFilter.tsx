/**
 * ReferenceDocFilter Component
 * Filter checkboxes for document types
 */
import { useReferenceDocStore, type DocumentTypeFilter } from '../../store/referenceDocStore';

/**
 * Props for ReferenceDocFilter
 */
export interface ReferenceDocFilterProps {
  /** Project ID for fetching documents after filter change */
  projectId: string;
}

/**
 * Filter option configuration
 */
const filterOptions: { value: DocumentTypeFilter; label: string; icon: string }[] = [
  { value: 'design', label: 'Design Doc', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { value: 'prd', label: 'PRD', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { value: 'prototype', label: 'Prototype', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
];

/**
 * ReferenceDocFilter - Document type filter checkboxes
 */
export function ReferenceDocFilter({ projectId }: ReferenceDocFilterProps) {
  const filters = useReferenceDocStore((state) => state.filters);
  const toggleFilter = useReferenceDocStore((state) => state.toggleFilter);
  const clearFilters = useReferenceDocStore((state) => state.clearFilters);
  const fetchDocuments = useReferenceDocStore((state) => state.fetchDocuments);

  const handleToggleFilter = (filter: DocumentTypeFilter) => {
    toggleFilter(filter);
    fetchDocuments(projectId);
  };

  const handleClearFilters = () => {
    clearFilters();
    fetchDocuments(projectId);
  };

  const hasActiveFilters = filters.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterOptions.map((option) => {
        const isActive = filters.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggleFilter(option.value)}
            aria-pressed={isActive}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={option.icon}
              />
            </svg>
            {option.label}
          </button>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:underline"
          aria-label="필터 초기화"
        >
          초기화
        </button>
      )}
    </div>
  );
}
