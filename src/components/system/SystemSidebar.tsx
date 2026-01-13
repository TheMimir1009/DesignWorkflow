/**
 * SystemSidebar Component
 * Collapsible sidebar for system document management
 */
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore, selectFilteredDocuments } from '../../store/systemStore';
import { SystemList } from './SystemList';
import { SystemPreview } from './SystemPreview';
import { SystemCreateModal } from './SystemCreateModal';
import { SystemEditModal } from './SystemEditModal';

export interface SystemSidebarProps {
  projectId: string | null;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * System document sidebar with E+A pattern (Expand + Action)
 */
export function SystemSidebar({ projectId, isExpanded, onToggle }: SystemSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategoryLocal] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);

  // Store state and actions
  const {
    documents,
    categories,
    allTags,
    isLoading,
    fetchDocuments,
    setSelectedCategory,
    toggleTag,
    setSearchQuery: setStoreSearchQuery,
    clearFilters,
  } = useSystemStore();

  const filteredDocuments = useSystemStore(useShallow(selectFilteredDocuments));

  // Fetch documents when project changes
  useEffect(() => {
    if (projectId) {
      fetchDocuments(projectId);
    }
  }, [projectId, fetchDocuments]);

  // Sync local search with store
  useEffect(() => {
    setStoreSearchQuery(searchQuery);
  }, [searchQuery, setStoreSearchQuery]);

  // Sync local category with store
  useEffect(() => {
    setSelectedCategory(selectedCategory);
  }, [selectedCategory, setSelectedCategory]);

  // Handle tag toggle
  const handleToggleTag = (tag: string) => {
    toggleTag(tag);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle clear filters
  const handleClearFilters = () => {
    clearFilters();
    setSearchQuery('');
    setSelectedCategoryLocal(null);
    setSelectedTags([]);
  };

  // Find documents by ID
  const editingDocument = documents.find((d) => d.id === editingDocumentId) || null;
  const previewDocument = documents.find((d) => d.id === previewDocumentId) || null;

  // Disabled state when no project selected
  const isDisabled = !projectId;

  return (
    <>
      <aside
        data-testid="system-sidebar"
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-12'
        }`}
      >
        {/* Header with toggle */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          {isExpanded && (
            <h2 className="font-semibold text-gray-900 truncate">System Documents</h2>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Search and Add */}
            <div className="p-3 space-y-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    disabled={isDisabled}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={isDisabled}
                  aria-label="Add document"
                  className="p-1.5 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="p-3 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Category
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategoryLocal(e.target.value || null)}
                  disabled={isDisabled}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="p-3 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      disabled={isDisabled}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {(selectedCategory || selectedTags.length > 0 || searchQuery) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-3">
              {isDisabled ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Select a project to view documents</p>
                </div>
              ) : (
                <SystemList
                  documents={filteredDocuments}
                  isLoading={isLoading}
                  onEdit={(id) => setEditingDocumentId(id)}
                  onDelete={(id) => setEditingDocumentId(id)}
                  onPreview={(id) => setPreviewDocumentId(id)}
                />
              )}
            </div>
          </>
        )}
      </aside>

      {/* Modals */}
      {projectId && (
        <>
          <SystemCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreated={() => {}}
            projectId={projectId}
            existingCategories={categories}
            existingTags={allTags}
          />

          <SystemEditModal
            document={editingDocument}
            isOpen={!!editingDocumentId}
            onClose={() => setEditingDocumentId(null)}
            onUpdated={() => {}}
            onDeleted={() => {}}
            projectId={projectId}
            existingCategories={categories}
            existingTags={allTags}
          />

          <SystemPreview
            systemDoc={previewDocument}
            isOpen={!!previewDocumentId}
            onClose={() => setPreviewDocumentId(null)}
          />
        </>
      )}
    </>
=======
import { useEffect, useState } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { SystemList } from './SystemList';
import { SystemFilter } from './SystemFilter';
import { SystemSearch } from './SystemSearch';

/**
 * Props for SystemSidebar component
 */
export interface SystemSidebarProps {
  /** Project ID to load systems for */
  projectId: string;
}

/**
 * SystemSidebar - Collapsible sidebar for system documents
 */
export function SystemSidebar({ projectId }: SystemSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isLoading = useSystemStore((state) => state.isLoading);
  const error = useSystemStore((state) => state.error);
  const systems = useSystemStore((state) => state.systems);
  const fetchSystems = useSystemStore((state) => state.fetchSystems);
  const openCreateModal = useSystemStore((state) => state.openCreateModal);

  // Fetch systems on mount and when projectId changes
  useEffect(() => {
    fetchSystems(projectId);
  }, [projectId, fetchSystems]);

  return (
    <div
      data-testid="system-sidebar"
      className={`
        flex flex-col bg-gray-50 border-l border-gray-200 transition-all duration-300
        ${isCollapsed ? 'collapsed w-12' : 'w-80'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {!isCollapsed && (
          <>
            <h2 className="font-semibold text-gray-900 text-sm">System Documents</h2>
            <button
              onClick={openCreateModal}
              className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </>
        )}
        <button
          data-testid="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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

      {/* Content (only visible when expanded) */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <SystemSearch />
          </div>

          {/* Filter */}
          <div className="p-3 border-b border-gray-200">
            <SystemFilter />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Loading State */}
            {isLoading && (
              <div data-testid="loading-indicator" className="flex items-center justify-center p-4">
                <svg
                  className="animate-spin h-6 w-6 text-blue-600"
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
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
            )}

            {/* Empty State */}
            {!isLoading && !error && systems.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500 text-sm">
                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>No system documents</p>
                <button
                  onClick={openCreateModal}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Create your first system
                </button>
              </div>
            )}

            {/* System List */}
            {!isLoading && !error && systems.length > 0 && <SystemList />}
          </div>
        </div>
      )}
    </div>
>>>>>>> main
  );
}
