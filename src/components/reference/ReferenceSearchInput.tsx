/**
 * ReferenceSearchInput Component
 * Search input for filtering documents with debounce
 */
import { useState, useEffect, useRef } from 'react';
import { useReferenceDocStore } from '../../store/referenceDocStore';

/**
 * Props for ReferenceSearchInput
 */
export interface ReferenceSearchInputProps {
  /** Project ID for fetching documents after search */
  projectId: string;
}

/**
 * ReferenceSearchInput - Search input with 300ms debounce
 */
export function ReferenceSearchInput({ projectId }: ReferenceSearchInputProps) {
  const setSearchQuery = useReferenceDocStore((state) => state.setSearchQuery);
  const fetchDocuments = useReferenceDocStore((state) => state.fetchDocuments);
  const searchQuery = useReferenceDocStore((state) => state.searchQuery);

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state with store on initial render
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Handle input change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
      fetchDocuments(projectId);
    }, 300);
  };

  // Handle clear button
  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    fetchDocuments(projectId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={localQuery}
        onChange={handleChange}
        placeholder="문서 검색..."
        aria-label="문서 검색"
        className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />

      {/* Clear button */}
      {localQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          aria-label="검색어 지우기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
