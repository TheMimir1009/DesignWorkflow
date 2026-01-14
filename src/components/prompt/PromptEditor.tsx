/**
 * PromptEditor Component
 * CodeMirror-based editor for prompt template content with markdown and variable support
 */
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';

interface PromptEditorProps {
  /** Current editor content */
  content: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Default content for comparison */
  defaultContent?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Whether the editor is read-only */
  readonly?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Editor mode (markdown or text) */
  mode?: 'markdown' | 'text';
  /** Whether to highlight variables */
  highlightVariables?: boolean;
  /** Whether to show line count */
  showLineCount?: boolean;
  /** Undo callback */
  onUndo?: () => void;
  /** Redo callback */
  onRedo?: () => void;
  /** Reset to default callback */
  onReset?: () => void;
  /** CSS class name */
  className?: string;
}

/**
 * Count lines in text content
 */
function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

/**
 * Check if content is modified from default
 */
function isModified(content: string, defaultContent?: string): boolean {
  if (!defaultContent) return false;
  return content !== defaultContent;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  content,
  onChange,
  defaultContent,
  disabled = false,
  readonly = false,
  placeholder = 'Enter prompt content...',
  mode = 'markdown',
  highlightVariables = true,
  showLineCount = false,
  onUndo,
  onRedo,
  onReset,
  className = '',
}) => {
  const lineCount = countLines(content);
  const modified = isModified(content, defaultContent);

  // CodeMirror extensions based on mode
  const extensions = mode === 'markdown'
    ? [markdown()]
    : [];

  return (
    <div className={`prompt-editor ${className}`} data-testid="prompt-editor">
      {/* Toolbar with actions */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          {showLineCount && (
            <span
              className="text-xs text-gray-500 dark:text-gray-400"
              data-testid="line-count"
            >
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          )}
          {modified && (
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              Modified
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={disabled}
              aria-label="Undo"
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
          )}
          {onRedo && (
            <button
              type="button"
              onClick={onRedo}
              disabled={disabled}
              aria-label="Redo"
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          )}
          {onReset && defaultContent && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              aria-label="Reset to default"
              className="p-1.5 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
              title="Reset to default"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* CodeMirror editor */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
        <CodeMirror
          value={content}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled || readonly}
          extensions={extensions}
          className="text-sm"
          minHeight="200px"
          maxHeight="500px"
        />
      </div>

      {/* Help text for variables */}
      {highlightVariables && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Use {'{{variable}}'} syntax for template variables
        </div>
      )}
    </div>
  );
};
