/**
 * SystemList Component
 * Displays system documents grouped by category with accordion functionality
 */
import type { SystemDocument } from '../../types';
import { SystemCard } from './SystemCard';

export interface SystemListProps {
  documentsByCategory: Record<string, SystemDocument[]>;
  expandedCategories: string[];
  onToggleCategory: (category: string) => void;
  onPreview: (document: SystemDocument) => void;
  onEdit: (document: SystemDocument) => void;
  onDelete: (document: SystemDocument) => void;
}

export function SystemList({
  documentsByCategory,
  expandedCategories,
  onToggleCategory,
  onPreview,
  onEdit,
  onDelete,
}: SystemListProps) {
  const categories = Object.keys(documentsByCategory).sort();

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg
          className="w-12 h-12 text-gray-500 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-400 text-sm">No system documents found</p>
        <p className="text-gray-500 text-xs mt-1">Add your first system document</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const documents = documentsByCategory[category];
        const isExpanded = expandedCategories.includes(category);

        return (
          <div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onToggleCategory(category)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-200">{category}</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                {documents.length}
              </span>
            </button>

            {isExpanded && (
              <div className="bg-gray-850 divide-y divide-gray-700/50">
                {documents.map((document) => (
                  <SystemCard
                    key={document.id}
                    document={document}
                    onPreview={onPreview}
                    onEdit={onEdit}
                    onDelete={onDelete}
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
