/**
 * DocumentViewerModal Component
 * Modal to view task documents (Feature List, Design Document, PRD, Prototype)
 */
import { useState } from 'react';
import type { Task } from '../../types';

/**
 * Props for DocumentViewerModal
 */
export interface DocumentViewerModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Task to display documents for */
  task: Task;
}

/**
 * Document tab types
 */
type DocumentTab = 'featurelist' | 'design' | 'prd' | 'prototype';

/**
 * Tab configuration
 */
const TABS: { id: DocumentTab; label: string; field: keyof Task }[] = [
  { id: 'featurelist', label: 'Feature List', field: 'featureList' },
  { id: 'design', label: 'Design Document', field: 'designDocument' },
  { id: 'prd', label: 'PRD', field: 'prd' },
  { id: 'prototype', label: 'Prototype', field: 'prototype' },
];

/**
 * Empty state component
 */
function EmptyState({ documentType }: { documentType: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="text-lg font-medium">No {documentType} Generated</p>
      <p className="text-sm text-gray-400 mt-1">
        Move the task to the next stage to generate this document
      </p>
    </div>
  );
}

/**
 * Document content display component
 */
function DocumentContent({ content, documentType }: { content: string | null; documentType: string }) {
  if (!content) {
    return <EmptyState documentType={documentType} />;
  }

  return (
    <div className="prose prose-sm max-w-none">
      <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto max-h-[60vh]">
        {content}
      </pre>
    </div>
  );
}

/**
 * Copy button component
 */
function CopyButton({ content }: { content: string | null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!content) return null;

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

/**
 * DocumentViewerModal - Modal to view task documents
 */
export function DocumentViewerModal({ isOpen, onClose, task }: DocumentViewerModalProps) {
  const [activeTab, setActiveTab] = useState<DocumentTab>('featurelist');

  if (!isOpen) return null;

  const currentContent = task[TABS.find((t) => t.id === activeTab)?.field || 'featureList'] as string | null;

  // Check if document exists for a tab
  const hasDocument = (tabId: DocumentTab): boolean => {
    switch (tabId) {
      case 'featurelist':
        return Boolean(task.featureList);
      case 'design':
        return Boolean(task.designDocument);
      case 'prd':
        return Boolean(task.prd);
      case 'prototype':
        return Boolean(task.prototype);
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        data-testid="modal-backdrop"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        data-testid="document-viewer-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 bg-gray-50 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {tab.label}
              {hasDocument(tab.id) && (
                <span className={`w-2 h-2 rounded-full ${activeTab === tab.id ? 'bg-blue-500' : 'bg-green-500'}`} />
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-end px-6 py-2 border-b border-gray-100">
          <CopyButton content={currentContent} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          <DocumentContent
            content={currentContent}
            documentType={TABS.find((t) => t.id === activeTab)?.label || ''}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Status: <strong className="text-gray-700 capitalize">{task.status}</strong></span>
            {task.references.length > 0 && (
              <span>References: <strong className="text-gray-700">{task.references.length}</strong></span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewerModal;
