/**
 * SideBySideView Component
 * REQ-007: Display current document and reference document side by side
 *
 * Features:
 * - Left: Current editing document
 * - Right: Reference document with tab navigation
 * - Resizable split with drag divider
 * - ESC key or button to close
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useReferenceDocStore } from '../../store/referenceDocStore';
import { DocumentPreview } from '../document/DocumentPreview';

/**
 * Props for SideBySideView
 */
export interface SideBySideViewProps {
  /** Current document content being edited */
  currentContent: string;
}

/**
 * Tab type for reference document sections
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
 * SideBySideView - Side-by-side document comparison view
 */
export function SideBySideView({ currentContent }: SideBySideViewProps) {
  const isSideBySideOpen = useReferenceDocStore((state) => state.isSideBySideOpen);
  const selectedDocument = useReferenceDocStore((state) => state.selectedDocument);
  const splitRatio = useReferenceDocStore((state) => state.splitRatio);
  const closeSideBySide = useReferenceDocStore((state) => state.closeSideBySide);
  const setSplitRatio = useReferenceDocStore((state) => state.setSplitRatio);

  const [activeTab, setActiveTab] = useState<TabType>('featureList');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSideBySide();
      }
    };

    if (isSideBySideOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSideBySideOpen, closeSideBySide]);

  // Handle drag for split ratio
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(newRatio);
    },
    [isDragging, setSplitRatio]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Get content for current tab
  const getTabContent = (tab: TabType): string | null => {
    if (!selectedDocument) return null;
    switch (tab) {
      case 'featureList':
        return selectedDocument.featureList;
      case 'designDocument':
        return selectedDocument.designDocument;
      case 'prd':
        return selectedDocument.prd;
      case 'prototype':
        return selectedDocument.prototype;
      default:
        return null;
    }
  };

  // Check if tab has content
  const hasTabContent = (tab: TabType): boolean => {
    const content = getTabContent(tab);
    return content !== null && content !== '';
  };

  // Don't render if not open or no document selected
  if (!isSideBySideOpen || !selectedDocument) {
    return null;
  }

  const referenceContent = getTabContent(activeTab) || '';

  return (
    <div
      ref={containerRef}
      data-testid="side-by-side-view"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex bg-white"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 z-10">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">나란히 보기</span>
          <span className="text-xs text-gray-500">
            참조: {selectedDocument.title}
          </span>
        </div>
        <button
          type="button"
          onClick={closeSideBySide}
          aria-label="나란히 보기 닫기"
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          닫기
        </button>
      </div>

      {/* Main content area */}
      <div className="flex w-full h-full pt-12">
        {/* Left panel - Current document */}
        <div
          data-testid="left-panel"
          className="flex flex-col overflow-hidden border-r border-gray-200"
          style={{ width: `${splitRatio}%` }}
        >
          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
            현재 문서
          </div>
          <div className="flex-1 overflow-auto p-4">
            <DocumentPreview content={currentContent} />
          </div>
        </div>

        {/* Divider */}
        <div
          data-testid="split-divider"
          className={`w-1 cursor-col-resize hover:bg-blue-400 transition-colors ${
            isDragging ? 'bg-blue-500' : 'bg-gray-200'
          }`}
          onMouseDown={handleMouseDown}
        />

        {/* Right panel - Reference document */}
        <div
          data-testid="right-panel"
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - splitRatio}%` }}
        >
          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
            참조 문서 - {selectedDocument.title}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto bg-white">
            {tabs.map((tab) => {
              const hasContent = hasTabContent(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!hasContent}
                  aria-selected={isActive}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : hasContent
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Reference content */}
          <div className="flex-1 overflow-auto p-4">
            {referenceContent ? (
              <DocumentPreview content={referenceContent} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                이 문서 유형에는 내용이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
