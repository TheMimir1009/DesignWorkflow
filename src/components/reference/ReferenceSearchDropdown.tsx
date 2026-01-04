/**
 * ReferenceSearchDropdown Component
 * Dropdown for searching and selecting reference documents
 * SPEC-REFERENCE-001: Reference System Selection
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { useReferenceStore } from '../../store/referenceStore';
import { useSystemStore } from '../../store/systemStore';
import type { SystemDocument } from '../../types';

export interface ReferenceSearchDropdownProps {
  projectId: string | null;
}

/**
 * Group documents by category
 */
function groupByCategory(documents: SystemDocument[]): Record<string, SystemDocument[]> {
  return documents.reduce((groups, doc) => {
    const category = doc.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(doc);
    return groups;
  }, {} as Record<string, SystemDocument[]>);
}

/**
 * Dropdown component for searching and selecting reference documents
 */
export function ReferenceSearchDropdown({ projectId }: ReferenceSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { toggleReference, isReferenceSelected } = useReferenceStore();
  const { documents } = useSystemStore();

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) {
      return documents;
    }

    const query = searchQuery.toLowerCase();
    return documents.filter((doc) => {
      const nameMatch = doc.name.toLowerCase().includes(query);
      const tagMatch = doc.tags.some((tag) => tag.toLowerCase().includes(query));
      const categoryMatch = doc.category.toLowerCase().includes(query);
      return nameMatch || tagMatch || categoryMatch;
    });
  }, [documents, searchQuery]);

  // Group filtered documents by category
  const groupedDocuments = useMemo(() => {
    return groupByCategory(filteredDocuments);
  }, [filteredDocuments]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedDocuments).sort();
  }, [groupedDocuments]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDisabled = !projectId;

  return (
    <div
      ref={dropdownRef}
      data-testid="reference-search-dropdown"
      className="relative w-full"
    >
      {/* Search input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClick={() => setIsOpen(true)}
        onFocus={() => setIsOpen(true)}
        placeholder="Search documents..."
        disabled={isDisabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="reference-listbox"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />

      {/* Dropdown list */}
      {isOpen && !isDisabled && (
        <div
          data-testid="reference-dropdown-list"
          id="reference-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredDocuments.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No documents found
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div key={category}>
                {/* Category header */}
                <div className="sticky top-0 px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                  {category}
                </div>

                {/* Documents in category */}
                {groupedDocuments[category].map((doc) => {
                  const isSelected = isReferenceSelected(doc.id);

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      data-testid={`reference-item-${doc.id}`}
                      onClick={() => toggleReference(doc.id)}
                      role="option"
                      aria-selected={isSelected}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Checkmark indicator */}
                      <span className="w-4 h-4 flex items-center justify-center">
                        {isSelected && (
                          <svg
                            data-testid="checkmark-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>

                      {/* Document info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {doc.name}
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{doc.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
