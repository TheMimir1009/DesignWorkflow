/**
 * ReferenceSearchDropdown Component
 * Search dropdown for adding references with debounce and outside click handling
 * TAG-004: ReferenceSearchDropdown component
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { useReferenceStore } from '../../store/referenceStore';
import type { SystemDocument } from '../../types';

export interface ReferenceSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEBOUNCE_DELAY = 300;

export function ReferenceSearchDropdown({ isOpen, onClose }: ReferenceSearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchDocuments } = useSystemStore();
  const { selectedReferences, addReference } = useReferenceStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get search results
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }
    return searchDocuments(debouncedQuery);
  }, [debouncedQuery, searchDocuments]);

  // Check if document is already selected
  const isDocumentSelected = useCallback(
    (docId: string) => {
      return selectedReferences.some((ref) => ref.id === docId);
    },
    [selectedReferences]
  );

  // Handle document selection
  const handleSelectDocument = useCallback(
    (doc: SystemDocument) => {
      if (!isDocumentSelected(doc.id)) {
        addReference(doc);
      }
      onClose();
    },
    [addReference, isDocumentSelected, onClose]
  );

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Track previous isOpen state to detect open transition
  const prevIsOpenRef = useRef(isOpen);

  // Reset search when dropdown transitions from closed to open
  useEffect(() => {
    const wasClosedNowOpen = !prevIsOpenRef.current && isOpen;
    prevIsOpenRef.current = isOpen;

    if (wasClosedNowOpen) {
      // Schedule state reset for next tick to avoid synchronous setState in effect
      queueMicrotask(() => {
        setSearchQuery('');
        setDebouncedQuery('');
      });
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const showNoResults = debouncedQuery.trim() && searchResults.length === 0;

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Search documents"
      className="absolute z-50 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
    >
      <div className="p-3">
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          placeholder="시스템 문서 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <ul role="list" className="max-h-60 overflow-y-auto px-2 pb-2">
          {searchResults.map((doc) => {
            const isSelected = isDocumentSelected(doc.id);
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => handleSelectDocument(doc)}
                  disabled={isSelected}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-gray-700 cursor-not-allowed opacity-60'
                      : 'hover:bg-gray-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium truncate">{doc.name}</span>
                    {isSelected && (
                      <span className="text-xs text-green-400 ml-2">선택됨</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{doc.category}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* No Results Message */}
      {showNoResults && (
        <div className="px-3 pb-3 text-gray-400 text-sm">
          검색 결과 없음
        </div>
      )}
    </div>
  );
}
