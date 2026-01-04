/**
 * TemplateList Component
 * List display for templates grouped by category
 */
import { useState, useMemo } from 'react';
import type { Template, TemplateCategory } from '../../types';
import { TemplateCard } from './TemplateCard';

export interface TemplateListProps {
  templates: Template[];
  selectedCategory: TemplateCategory | null;
  onSelectTemplate: (id: string) => void;
  onEditTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Group templates by category
 */
function groupByCategory(templates: Template[]): Record<string, Template[]> {
  return templates.reduce((groups, template) => {
    const category = template.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(template);
    return groups;
  }, {} as Record<string, Template[]>);
}

/**
 * Template list with category grouping
 */
export function TemplateList({
  templates,
  selectedCategory,
  onSelectTemplate,
  onEditTemplate,
  onDeleteTemplate,
  isLoading = false,
}: TemplateListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Filter templates by selected category
  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) {
      return templates;
    }
    return templates.filter(t => t.category === selectedCategory);
  }, [templates, selectedCategory]);

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
      <div data-testid="template-list-loading" className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredTemplates.length === 0) {
    return (
      <div
        data-testid="template-list-empty"
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
        <p className="text-sm">No templates found</p>
        <p className="text-xs text-gray-400 mt-1">
          Create a new template to get started
        </p>
      </div>
    );
  }

  const groupedTemplates = groupByCategory(filteredTemplates);
  const sortedCategories = Object.keys(groupedTemplates).sort();

  return (
    <div data-testid="template-list" className="space-y-4">
      {sortedCategories.map((category) => {
        const isCollapsed = collapsedCategories.has(category);
        const categoryTemplates = groupedTemplates[category];

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
                <span className="ml-2 text-gray-400">({categoryTemplates.length})</span>
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
                {categoryTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={() => onSelectTemplate(template.id)}
                    onEdit={() => onEditTemplate(template.id)}
                    onDelete={() => onDeleteTemplate(template.id)}
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
