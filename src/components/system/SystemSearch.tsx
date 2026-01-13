/**
 * SystemSearch Component
 * Search input for system documents with 300ms debounce
 */
import { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '../../store/systemStore';

/**
 * SystemSearch - Search input with debounce for system documents
 */
export function SystemSearch() {
  const searchQuery = useSystemStore((state) => state.searchQuery);
  const setSearchQuery = useSystemStore((state) => state.setSearchQuery);

  const [localValue, setLocalValue] = useState(searchQuery);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value with store value
  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  const handleClear = () => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLocalValue('');
    setSearchQuery('');
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div data-testid="system-search" className="relative">
      {/* Search Icon */}
      <div data-testid="search-icon" className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search systems..."
        aria-label="Search system documents"
        className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {/* Clear Button */}
      {searchQuery && (
        <button
          data-testid="clear-search"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2 flex items-center"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
