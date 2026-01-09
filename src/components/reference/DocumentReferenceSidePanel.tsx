/**
 * DocumentReferenceSidePanel Component
 * Side panel for browsing completed documents
 */
import { useEffect, useCallback } from 'react';
import { useReferenceDocStore } from '../../store/referenceDocStore';
import { ReferenceSearchInput } from './ReferenceSearchInput';
import { ReferenceDocFilter } from './ReferenceDocFilter';
import { ReferenceDocList } from './ReferenceDocList';
import { ReferenceDocDetail } from './ReferenceDocDetail';

/**
 * Props for DocumentReferenceSidePanel
 */
export interface DocumentReferenceSidePanelProps {
  /** Project ID to load documents for */
  projectId: string;
}

/**
 * DocumentReferenceSidePanel - Slide-in panel for document reference
 *
 * Features:
 * - Slide animation from right
 * - Close with X button, overlay click, or ESC key
 * - Search and filter documents
 * - View document details
 */
export function DocumentReferenceSidePanel({ projectId }: DocumentReferenceSidePanelProps) {
  const isPanelOpen = useReferenceDocStore((state) => state.isPanelOpen);
  const closePanel = useReferenceDocStore((state) => state.closePanel);
  const fetchDocuments = useReferenceDocStore((state) => state.fetchDocuments);
  const fetchDocumentDetail = useReferenceDocStore((state) => state.fetchDocumentDetail);
  const clearSelection = useReferenceDocStore((state) => state.clearSelection);
  const selectedDocument = useReferenceDocStore((state) => state.selectedDocument);

  // Fetch documents when panel opens
  useEffect(() => {
    if (isPanelOpen) {
      fetchDocuments(projectId);
    }
  }, [isPanelOpen, projectId, fetchDocuments]);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPanelOpen) {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel]);

  // Handle document selection from list
  const handleSelectDocument = useCallback(
    (taskId: string) => {
      fetchDocumentDetail(projectId, taskId);
    },
    [projectId, fetchDocumentDetail]
  );

  // Handle back from detail view
  const handleBack = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Don't render if panel is closed
  if (!isPanelOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        data-testid="panel-overlay"
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        className="fixed inset-y-0 right-0 z-50 flex flex-col"
      >
        <div
          data-testid="side-panel"
          className="w-[400px] max-w-full h-full bg-white shadow-xl transition-transform duration-300 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="panel-title" className="text-lg font-semibold text-gray-900">
              참조 문서
            </h2>
            <button
              type="button"
              onClick={closePanel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          {selectedDocument ? (
            /* Detail View */
            <ReferenceDocDetail document={selectedDocument} onBack={handleBack} />
          ) : (
            /* List View */
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <ReferenceSearchInput projectId={projectId} />
              </div>

              {/* Filter */}
              <div className="px-4 py-2 border-b border-gray-200">
                <ReferenceDocFilter projectId={projectId} />
              </div>

              {/* Document List */}
              <div className="flex-1 overflow-y-auto">
                <ReferenceDocList
                  projectId={projectId}
                  onSelectDocument={handleSelectDocument}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
