/**
 * PromptVariablePanel Component
 * Panel for displaying and inserting prompt template variables
 */
import React, { useState, useMemo } from 'react';
import type { PromptVariable } from '../../types';

interface PromptVariablePanelProps {
  /** Array of prompt variables */
  variables: PromptVariable[];
  /** Callback when variable is inserted */
  onInsert: (variableTemplate: string) => void;
  /** Search query for filtering variables */
  searchQuery?: string;
  /** Whether to use compact layout */
  compact?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Get type badge color based on variable type
 */
function getTypeColor(type: PromptVariable['type']): string {
  const colors = {
    string: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    array: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    object: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };
  return colors[type] || colors.string;
}

/**
 * Variable item component
 */
interface VariableItemProps {
  variable: PromptVariable;
  onInsert: (template: string) => void;
  compact: boolean;
}

const VariableItem: React.FC<VariableItemProps> = ({ variable, onInsert, compact }) => {
  const [expanded, setExpanded] = useState(!compact);

  const handleInsert = () => {
    onInsert(`{{${variable.name}}}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`{{${variable.name}}}`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleExpanded = () => setExpanded(!expanded);

  const template = `{{${variable.name}}}`;

  return (
    <div
      className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors ${compact ? 'compact' : ''}`}
      data-required={variable.required}
    >
      {/* Variable header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
              {template}
            </code>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(variable.type)}`}>
              {variable.type}
            </span>
            {variable.required && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{variable.description}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {!compact && (
            <button
              type="button"
              onClick={toggleExpanded}
              aria-label={expanded ? 'Collapse' : 'Expand'}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={expanded ? 'Show less' : 'Show more'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy variable template"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Copy to clipboard"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleInsert}
            aria-label="Insert variable"
            className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Insert variable"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && variable.example && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">Example: </span>
          <code className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {variable.example}
          </code>
        </div>
      )}
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <svg
        className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No variables defined</p>
    </div>
  );
};

export const PromptVariablePanel: React.FC<PromptVariablePanelProps> = ({
  variables,
  onInsert,
  searchQuery = '',
  compact = false,
  className = '',
}) => {
  // Filter variables by search query
  const filteredVariables = useMemo(() => {
    if (!searchQuery) return variables;
    const query = searchQuery.toLowerCase();
    return variables.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query)
    );
  }, [variables, searchQuery]);

  const requiredCount = variables.filter((v) => v.required).length;

  if (variables.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`prompt-variable-panel ${className}`} data-testid="prompt-variable-panel">
      {/* Header with count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Variables
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {variables.length} {variables.length === 1 ? 'variable' : 'variables'}
          {requiredCount > 0 && ` (${requiredCount} required)`}
        </span>
      </div>

      {/* Variable list */}
      <div className="space-y-2">
        {filteredVariables.map((variable) => (
          <VariableItem
            key={variable.name}
            variable={variable}
            onInsert={onInsert}
            compact={compact}
          />
        ))}

        {filteredVariables.length === 0 && searchQuery && (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            No variables match "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
