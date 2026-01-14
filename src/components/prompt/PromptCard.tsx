/**
 * PromptCard Component
 * Individual prompt template card with selection and display functionality
 */
import React from 'react';
import type { PromptTemplate } from '../../types';

interface PromptCardProps {
  /** The prompt template to display */
  prompt: PromptTemplate;
  /** Callback when the card is selected */
  onSelect: (promptId: string) => void;
  /** Whether this card is currently selected */
  isSelected: boolean;
}

/**
 * Category color mapping for visual distinction
 */
const categoryColors: Record<string, string> = {
  'document-generation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'code-operation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'analysis': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'utility': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onSelect,
  isSelected,
}) => {
  const handleClick = () => {
    onSelect(prompt.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(prompt.id);
    }
  };

  const variableCount = prompt.variables.length;
  const categoryColor = categoryColors[prompt.category] || categoryColors['utility'];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        p-4 rounded-lg border-2 transition-all cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 selected'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
        }
      `}
      data-testid={`prompt-card-${prompt.id}`}
    >
      {/* Header with name and modified badge */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {prompt.name}
        </h3>
        <div className="flex items-center gap-2">
          {prompt.isModified && (
            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
              Modified
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            v{prompt.version}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {prompt.description}
      </p>

      {/* Footer with category and variable count */}
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded-full ${categoryColor}`}>
          {prompt.category}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {variableCount === 1 ? '1 variable' : `${variableCount} variables`}
        </span>
      </div>
    </div>
  );
};
