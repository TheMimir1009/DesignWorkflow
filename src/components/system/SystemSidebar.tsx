/**
 * SystemSidebar Component
 * E+A pattern sidebar for system documents with search, filtering, and CRUD operations
 */
import { useState, useEffect, useCallback } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { useProjectStore } from '../../store/projectStore';
import { SystemList } from './SystemList';
import { SystemCreateModal } from './SystemCreateModal';
import { SystemEditModal } from './SystemEditModal';
import { SystemPreview } from './SystemPreview';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { SystemDocument } from '../../types';

export interface SystemSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SystemSidebar({ isCollapsed = false, onToggleCollapse }: SystemSidebarProps) {
  const {
    documents,
    isLoading,
    error,
    searchQuery,
    selectedTags,
    expandedCategories,
    fetchDocuments,
    deleteDocument,
    setSearchQuery,
    toggleTag,
    toggleCategory,
    clearFilters,
    getFilteredDocuments,
    getAllTags,
  } = useSystemStore();

  const { currentProjectId, currentProject } = useProjectStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SystemDocument | null>(null);
  const [previewingDocument, setPreviewingDocument] = useState<SystemDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<SystemDocument | null>(null);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Fetch documents when project changes
  useEffect(() => {
    if (currentProjectId) {
      fetchDocuments(currentProjectId);
    }
  }, [currentProjectId, fetchDocuments]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);

  // Get computed data
  const filteredDocuments = getFilteredDocuments();
  const allTags = getAllTags();

  // Group filtered documents by category
  const documentsByCategory: Record<string, SystemDocument[]> = {};
  for (const doc of filteredDocuments) {
    if (!documentsByCategory[doc.category]) {
      documentsByCategory[doc.category] = [];
    }
    documentsByCategory[doc.category].push(doc);
  }

  // Sort documents within each category
  for (const category of Object.keys(documentsByCategory)) {
    documentsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
  }

  const handlePreview = useCallback((document: SystemDocument) => {
    setPreviewingDocument(document);
  }, []);

  const handleEdit = useCallback((document: SystemDocument) => {
    setEditingDocument(document);
  }, []);

  const handleDelete = useCallback((document: SystemDocument) => {
    setDeletingDocument(document);
  }, []);

  const handleConfirmDelete = async () => {
    if (deletingDocument && currentProjectId) {
      try {
        await deleteDocument(currentProjectId, deletingDocument.id);
      } catch {
        // Error handled by store
      }
      setDeletingDocument(null);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          aria-label="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <aside className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-white">System Documents</h2>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            aria-label="Collapse sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-4 py-3 space-y-2 border-b border-gray-700">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-8 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
            {localSearchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTagFilter(!showTagFilter)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                showTagFilter || selectedTags.length > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Tags
              {selectedTags.length > 0 && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                  {selectedTags.length}
                </span>
              )}
            </button>
            {(selectedTags.length > 0 || searchQuery) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Tag Filter Panel */}
          {showTagFilter && allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          {!currentProjectId ? (
            <div className="text-center text-gray-400 text-sm py-8">
              Select a project to view documents
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 text-sm py-8">{error}</div>
          ) : (
            <SystemList
              documentsByCategory={documentsByCategory}
              expandedCategories={expandedCategories}
              onToggleCategory={toggleCategory}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Add Button */}
        <div className="px-4 py-3 border-t border-gray-700">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!currentProjectId}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Document
          </button>
        </div>
      </aside>

      {/* Create Modal */}
      <SystemCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Modal */}
      <SystemEditModal
        isOpen={!!editingDocument}
        document={editingDocument}
        onClose={() => setEditingDocument(null)}
      />

      {/* Preview Modal */}
      {previewingDocument && (
        <SystemPreview
          document={previewingDocument}
          onClose={() => setPreviewingDocument(null)}
          onEdit={() => {
            setEditingDocument(previewingDocument);
            setPreviewingDocument(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingDocument}
        onClose={() => setDeletingDocument(null)}
        onConfirm={handleConfirmDelete}
        title="Delete System Document"
        message={`Are you sure you want to delete "${deletingDocument?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
