/**
 * SystemSidebar Component
 * Sidebar displaying system documents with checkbox selection and category collapse
 * TAG-005: SystemSidebar extension
 * TAG-006: SystemSidebar advanced features (search, tag filter, preview, collapse mode)
 */
import { useState, useCallback, useMemo } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { useReferenceStore } from '../../store/referenceStore';
import type { SystemDocument } from '../../types';

/**
 * SystemSidebar Props interface
 */
interface SystemSidebarProps {
  /** Callback when user clicks preview button on a document */
  onPreviewDocument?: (doc: SystemDocument) => void;
  /** Project ID for saving default references */
  projectId?: string;
}

/**
 * SystemSidebar Component
 * Displays system documents organized by category with advanced features:
 * - Search filtering
 * - Tag filtering
 * - Document preview button
 * - Collapsible sidebar mode
 * - Save as default references (TAG-008)
 */
export function SystemSidebar({ onPreviewDocument, projectId }: SystemSidebarProps) {
  const { documents, getDocumentsByCategory, searchDocuments, filterByTags } = useSystemStore();
  const { selectedReferences, addReference, removeReference, saveAsDefault } = useReferenceStore();

  // UI State
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get all documents from categories
  const documentsByCategory = getDocumentsByCategory();
  const allCategories = Object.keys(documentsByCategory);

  // Get unique tags from all documents
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach((doc) => {
      doc.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [documents]);

  // Filter documents based on search and tags
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Apply search filter
    if (searchQuery.trim()) {
      result = searchDocuments(searchQuery);
    }

    // Apply tag filter
    if (selectedTags.size > 0) {
      result = filterByTags(Array.from(selectedTags));
    }

    return result;
  }, [documents, searchQuery, selectedTags, searchDocuments, filterByTags]);

  // Group filtered documents by category
  const filteredDocumentsByCategory = useMemo(() => {
    const grouped: Record<string, SystemDocument[]> = {};
    filteredDocuments.forEach((doc) => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = [];
      }
      grouped[doc.category].push(doc);
    });
    return grouped;
  }, [filteredDocuments]);

  // Get categories from filtered documents or all categories
  const categories = useMemo(() => {
    if (searchQuery.trim() || selectedTags.size > 0) {
      return Object.keys(filteredDocumentsByCategory);
    }
    return allCategories;
  }, [searchQuery, selectedTags, filteredDocumentsByCategory, allCategories]);

  // Get documents to display for a category
  const getDocsForCategory = useCallback(
    (category: string) => {
      if (searchQuery.trim() || selectedTags.size > 0) {
        return filteredDocumentsByCategory[category] || [];
      }
      return documentsByCategory[category] || [];
    },
    [searchQuery, selectedTags, filteredDocumentsByCategory, documentsByCategory]
  );

  // Check if a document is selected
  const isDocumentSelected = useCallback(
    (docId: string) => {
      return selectedReferences.some((ref) => ref.id === docId);
    },
    [selectedReferences]
  );

  // Get selected count for a category
  const getSelectedCountForCategory = useCallback(
    (categoryDocs: SystemDocument[]) => {
      return categoryDocs.filter((doc) => isDocumentSelected(doc.id)).length;
    },
    [isDocumentSelected]
  );

  // Toggle category collapse
  const toggleCategory = useCallback((category: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // Handle checkbox toggle
  const handleCheckboxChange = useCallback(
    (doc: SystemDocument, isCurrentlySelected: boolean) => {
      if (isCurrentlySelected) {
        removeReference(doc.id);
      } else {
        addReference(doc);
      }
    },
    [addReference, removeReference]
  );

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle tag toggle
  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  }, []);

  // Handle preview button click
  const handlePreviewClick = useCallback(
    (doc: SystemDocument) => {
      if (onPreviewDocument) {
        onPreviewDocument(doc);
      }
    },
    [onPreviewDocument]
  );

  // Handle sidebar collapse toggle
  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Handle save as default
  const handleSaveAsDefault = useCallback(() => {
    if (projectId) {
      saveAsDefault(projectId);
    }
  }, [projectId, saveAsDefault]);

  const isEmpty = categories.length === 0;

  return (
    <aside
      role="complementary"
      aria-label="System documents sidebar"
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 border-r border-gray-700 h-full overflow-y-auto transition-all duration-200`}
    >
      <div className="p-4">
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-white">시스템 문서</h2>
          )}
          <button
            type="button"
            onClick={handleCollapseToggle}
            aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Search Input - only visible when expanded */}
        {!isCollapsed && (
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="검색어 지우기"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
        )}

        {/* Tag Filters - only visible when expanded */}
        {!isCollapsed && uniqueTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                aria-label={tag}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedTags.has(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Save as Default Button - TAG-008 */}
        {!isCollapsed && projectId && (
          <button
            type="button"
            onClick={handleSaveAsDefault}
            className="w-full mb-4 py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
          >
            기본값으로 저장
          </button>
        )}

        {isEmpty ? (
          !isCollapsed && <p className="text-gray-400 text-sm">문서가 없습니다</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => {
              const docs = getDocsForCategory(category);
              const isCollapseCategory = collapsedCategories.has(category);
              const selectedCount = getSelectedCountForCategory(docs);
              const totalCount = docs.length;

              return (
                <div key={category} className="border-b border-gray-700 pb-2">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-1">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      aria-label={`Toggle ${category}`}
                      aria-expanded={!isCollapseCategory}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isCollapseCategory ? '-rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      {!isCollapsed && <span className="font-medium capitalize">{category}</span>}
                    </button>
                    {!isCollapsed && selectedCount > 0 && (
                      <span className="text-xs text-blue-400">
                        {selectedCount}/{totalCount}
                      </span>
                    )}
                  </div>

                  {/* Document List - Conditionally rendered */}
                  {!isCollapseCategory && !isCollapsed && (
                    <ul className="space-y-1 pl-6" aria-hidden={isCollapseCategory}>
                      {docs.map((doc) => {
                        const isSelected = isDocumentSelected(doc.id);
                        return (
                          <li
                            key={doc.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded transition-colors hover:bg-gray-800 ${
                              isSelected ? 'bg-blue-900/30' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`doc-${doc.id}`}
                              checked={isSelected}
                              onChange={() => handleCheckboxChange(doc, isSelected)}
                              aria-label={doc.name}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                            />
                            <label
                              htmlFor={`doc-${doc.id}`}
                              className="text-sm text-gray-300 truncate cursor-pointer flex-1"
                            >
                              {doc.name}
                            </label>
                            {onPreviewDocument && (
                              <button
                                type="button"
                                onClick={() => handlePreviewClick(doc)}
                                aria-label={`${doc.name} 미리보기`}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
