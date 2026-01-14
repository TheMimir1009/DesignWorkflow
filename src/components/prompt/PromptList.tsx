/**
 * PromptList Component
 * List view of prompt templates with category grouping and filtering
 */
import React, { useMemo } from 'react';
import { PromptCard } from './PromptCard';
import type { PromptTemplate, PromptCategory } from '../../types';

interface PromptListProps {
  /** All available prompts */
  prompts: PromptTemplate[];
  /** Currently selected prompt ID */
  selectedPromptId: string | null;
  /** Category filter for filtering prompts */
  selectedCategory: PromptCategory | null;
  /** Callback when a prompt is selected */
  onSelect: (promptId: string) => void;
  /** Whether to group prompts by category */
  groupByCategory?: boolean;
  /** Whether the list is in loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
}

/**
 * Category display names for headings
 */
const categoryNames: Record<PromptCategory, string> = {
  'document-generation': 'Document Generation',
  'code-operation': 'Code Operation',
  'analysis': 'Analysis',
  'utility': 'Utility',
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        data-testid="empty-state-icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        No prompts found
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Try adjusting your filters or create a new prompt template.
      </p>
    </div>
  );
};

/**
 * Error state component
 */
const ErrorState: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="text-center py-12" data-testid="error-state">
      <svg
        className="mx-auto h-12 w-12 text-red-400 dark:text-red-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        Error loading prompts
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
};

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  selectedPromptId,
  selectedCategory,
  onSelect,
  groupByCategory = false,
  isLoading = false,
  error = null,
}) => {
  // Filter prompts by selected category
  const filteredPrompts = useMemo(() => {
    if (!selectedCategory) {
      return prompts;
    }
    return prompts.filter((p) => p.category === selectedCategory);
  }, [prompts, selectedCategory]);

  // Sort prompts by createdAt descending (newest first)
  const sortedPrompts = useMemo(() => {
    return [...filteredPrompts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredPrompts]);

  // Group prompts by category if enabled
  const groupedPrompts = useMemo(() => {
    if (!groupByCategory) {
      return null;
    }

    const groups: Record<string, PromptTemplate[]> = {};
    sortedPrompts.forEach((prompt) => {
      if (!groups[prompt.category]) {
        groups[prompt.category] = [];
      }
      groups[prompt.category].push(prompt);
    });

    return groups;
  }, [sortedPrompts, groupByCategory]);

  // Render loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Render error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Render empty state
  if (sortedPrompts.length === 0) {
    return <EmptyState />;
  }

  // Render ungrouped list
  if (!groupByCategory || !groupedPrompts) {
    return (
      <div className="space-y-3" data-testid="prompt-list">
        {sortedPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onSelect={onSelect}
            isSelected={selectedPromptId === prompt.id}
          />
        ))}
      </div>
    );
  }

  // Render grouped list
  return (
    <div className="space-y-6" data-testid="prompt-list">
      {Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
        <div key={category} data-testid={`category-group-${category}`}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-1">
            {categoryNames[category as PromptCategory] || category}
          </h3>
          <div className="space-y-3">
            {categoryPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onSelect={onSelect}
                isSelected={selectedPromptId === prompt.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
