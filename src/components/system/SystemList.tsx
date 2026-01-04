/**
 * SystemList Component
 * List display for system documents grouped by category
 * SPEC-REFERENCE-001: Enhanced with selectable mode for reference selection
 */
import { useState } from 'react';
import type { SystemDocument } from '../../types';
import { SystemCard } from './SystemCard';

export interface SystemListProps {
  documents: SystemDocument[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  isLoading?: boolean;
  /** Enable selection mode for reference picking */
  selectable?: boolean;
  /** Set of currently selected document IDs */
  selectedIds?: Set<string>;
  /** Callback when a document selection is toggled */
  onToggleSelect?: (id: string) => void;
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
 * System document list with category grouping
 */
export function SystemList({
  documents,
  onEdit,
  onDelete,
  onPreview,
  isLoading = false,
  selectable = false,
  selectedIds = new Set(),
  onToggleSelect,
}: SystemListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div data-testid="system-list-loading" className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div
        data-testid="system-list-empty"
        className="text-center py-8 text-gray-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm">No system documents found</p>
        <p className="text-xs text-gray-400 mt-1">
          Create a new document to get started
        </p>
      </div>
    );
  }

  const groupedDocuments = groupByCategory(documents);
  const sortedCategories = Object.keys(groupedDocuments).sort();

  return (
    <div data-testid="system-list" className="space-y-4">
      {sortedCategories.map((category) => {
        const isCollapsed = collapsedCategories.has(category);
        const categoryDocs = groupedDocuments[category];

        return (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category header */}
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="font-medium text-sm text-gray-700">
                {category}
                <span className="ml-2 text-gray-400">({categoryDocs.length})</span>
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  isCollapsed ? '' : 'rotate-180'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Category content */}
            {!isCollapsed && (
              <div className="p-4 space-y-3">
                {categoryDocs.map((doc) => (
                  <SystemCard
                    key={doc.id}
                    document={doc}
                    onEdit={() => onEdit(doc.id)}
                    onDelete={() => onDelete(doc.id)}
                    onPreview={() => onPreview(doc.id)}
                    selectable={selectable}
                    isSelected={selectedIds.has(doc.id)}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
