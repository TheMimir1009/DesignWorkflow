/**
 * ReferenceDocDetail Component
 * Detail view of a completed document with tabs
 */
import { useState } from 'react';
import type { CompletedDocumentDetail } from '../../types';
import { DocumentPreview } from '../document/DocumentPreview';
import { useReferenceDocStore } from '../../store/referenceDocStore';

/**
 * Props for ReferenceDocDetail
 */
export interface ReferenceDocDetailProps {
  /** Document detail data */
  document: CompletedDocumentDetail;
  /** Handler for back button */
  onBack: () => void;
}

/**
 * Tab type
 */
type TabType = 'featureList' | 'designDocument' | 'prd' | 'prototype';

/**
 * Tab configuration
 */
const tabs: { id: TabType; label: string }[] = [
  { id: 'featureList', label: 'Feature List' },
  { id: 'designDocument', label: 'Design Doc' },
  { id: 'prd', label: 'PRD' },
  { id: 'prototype', label: 'Prototype' },
];

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * ReferenceDocDetail - Document detail view with tabs
 */
export function ReferenceDocDetail({ document, onBack }: ReferenceDocDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('featureList');
  const openSideBySide = useReferenceDocStore((state) => state.openSideBySide);
  const selectDocument = useReferenceDocStore((state) => state.selectDocument);

  const handleSideBySide = () => {
    selectDocument(document);
    openSideBySide();
  };

  // Get content for current tab
  const getContent = (tab: TabType): string | null => {
    switch (tab) {
      case 'featureList':
        return document.featureList;
      case 'designDocument':
        return document.designDocument;
      case 'prd':
        return document.prd;
      case 'prototype':
        return document.prototype;
      default:
        return null;
    }
  };

  const content = getContent(activeTab);

  // Check which tabs have content
  const hasContent = (tab: TabType): boolean => {
    const tabContent = getContent(tab);
    return tabContent !== null && tabContent !== '';
  };

  const statusLabel = document.status === 'archived' ? '아카이브' : '완료';
  const statusColor =
    document.status === 'archived'
      ? 'bg-gray-100 text-gray-600'
      : 'bg-blue-100 text-blue-600';

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {/* Header with back and side-by-side buttons */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="목록으로 돌아가기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            뒤로
          </button>
          <button
            type="button"
            onClick={handleSideBySide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            aria-label="나란히 보기"
            data-testid="side-by-side-button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            나란히 보기
          </button>
        </div>

        {/* Title and status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>생성: {formatDate(document.createdAt)}</span>
          <span>수정: {formatDate(document.updatedAt)}</span>
          {document.archivedAt && (
            <span>아카이브: {formatDate(document.archivedAt)}</span>
          )}
        </div>

        {/* References */}
        {document.references.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {document.references.map((ref, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {ref}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const hasTabContent = hasContent(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              disabled={!hasTabContent}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : hasTabContent
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" role="tabpanel">
        {content ? (
          <DocumentPreview content={content} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            이 문서 유형에는 내용이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
