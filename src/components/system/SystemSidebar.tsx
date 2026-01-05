/**
 * SystemSidebar Component
 * Collapsible sidebar for system document management
 */
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
  );
}
