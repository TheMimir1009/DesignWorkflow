/**
 * PromptManagerPage Component
 * Main page for prompt template management integration
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { PromptList } from './PromptList';
import { PromptEditor } from './PromptEditor';
import { PromptVariablePanel } from './PromptVariablePanel';
import { PromptVersionHistory } from './PromptVersionHistory';
import { usePromptStore } from '../../store/promptStore';

/**
 * Main prompt management page component
 * Integrates all prompt management components into a cohesive UI
 */
export const PromptManagerPage: React.FC = () => {
  const {
    prompts,
    selectedPromptId,
    selectedCategory,
    isLoading,
    error,
    searchQuery,
    fetchPrompts,
    updatePrompt,
    resetPrompt,
    setSelectedPromptId,
    setSelectedCategory,
    setSearchQuery,
    getSelectedPrompt,
    getFilteredPrompts,
  } = usePromptStore();

  // Local state for editor content (debounced updates)
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorVariables, setEditorVariables] = useState<PromptTemplate['variables']>([]);
  const [editorDefaultContent, setEditorDefaultContent] = useState<string>('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Update local state when selected prompt changes
  useEffect(() => {
    const selectedPrompt = getSelectedPrompt();
    if (selectedPrompt) {
      setEditorContent(selectedPrompt.content);
      setEditorVariables(selectedPrompt.variables);
      setEditorDefaultContent(selectedPrompt.defaultContent);
      setShowVersionHistory(false);
    } else {
      setEditorContent('');
      setEditorVariables([]);
      setEditorDefaultContent('');
    }
  }, [selectedPromptId, prompts, getSelectedPrompt]);

  // Debounced update handler
  const handleEditorChange = useCallback((content: string) => {
    setEditorContent(content);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for update
    debounceTimerRef.current = setTimeout(() => {
      if (selectedPromptId) {
        updatePrompt(selectedPromptId, { content });
      }
    }, 500);
  }, [selectedPromptId, updatePrompt]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle prompt selection
  const handleSelectPrompt = useCallback((promptId: string) => {
    setSelectedPromptId(promptId);
  }, [setSelectedPromptId]);

  // Handle prompt reset
  const handleResetPrompt = useCallback(async () => {
    if (selectedPromptId) {
      await resetPrompt(selectedPromptId);
      // Refetch to get updated data
      await fetchPrompts();
    }
  }, [selectedPromptId, resetPrompt, fetchPrompts]);

  // Handle variable insertion
  const handleInsertVariable = useCallback((variableTemplate: string) => {
    // Insert at cursor position or append to end
    setEditorContent((prev) => {
      // For now, just append to the end
      // TODO: Implement cursor position insertion
      return prev + variableTemplate;
    });
  }, []);

  // Handle version restore
  const handleRestoreVersion = useCallback(async (versionId: string, content: string) => {
    if (selectedPromptId) {
      await updatePrompt(selectedPromptId, { content });
      // Refetch to get updated data
      await fetchPrompts();
    }
  }, [selectedPromptId, updatePrompt, fetchPrompts]);

  // Handle category filter change
  const handleCategoryChange = useCallback((category: PromptCategory | null) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  // Get filtered prompts for display
  const filteredPrompts = getFilteredPrompts();

  // Get selected prompt details
  const selectedPrompt = getSelectedPrompt();

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center" data-testid="error-state">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
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
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-manager-page" data-testid="prompt-manager-page">
      <div className="h-screen flex">
        {/* Left sidebar - Prompt list */}
        <div className="w-1/3 min-w-[300px] max-w-[450px] border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Prompt Templates
            </h1>
            {/* Search input */}
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              data-testid="search-input"
            />
          </div>

          {/* Category filters */}
          <div className="mb-4 flex flex-wrap gap-2" data-testid="category-filters">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleCategoryChange('document-generation')}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === 'document-generation'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Document Generation
            </button>
            <button
              onClick={() => handleCategoryChange('code-operation')}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === 'code-operation'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Code Operation
            </button>
            <button
              onClick={() => handleCategoryChange('analysis')}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === 'analysis'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => handleCategoryChange('utility')}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === 'utility'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Utility
            </button>
          </div>

          {/* Prompt list */}
          <PromptList
            prompts={filteredPrompts}
            selectedPromptId={selectedPromptId}
            selectedCategory={selectedCategory}
            onSelect={handleSelectPrompt}
            groupByCategory={false}
            isLoading={isLoading}
          />
        </div>

        {/* Right panel - Editor and details */}
        <div className="flex-1 overflow-y-auto">
          {selectedPrompt ? (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPrompt.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedPrompt.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300"
                  data-testid="toggle-history-button"
                >
                  {showVersionHistory ? 'Hide History' : 'Show History'}
                </button>
              </div>

              {/* Version history (conditional) */}
              {showVersionHistory && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  {/* Version history would be fetched and displayed here */}
                  <div data-testid="version-history-placeholder">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Version history feature coming soon
                    </p>
                  </div>
                </div>
              )}

              {/* Editor */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </h3>
                <PromptEditor
                  content={editorContent}
                  onChange={handleEditorChange}
                  defaultContent={editorDefaultContent}
                  onReset={handleResetPrompt}
                  placeholder="Enter prompt template content..."
                  mode="markdown"
                  highlightVariables={true}
                  showLineCount={true}
                />
              </div>

              {/* Variables panel */}
              {editorVariables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Variables
                  </h3>
                  <PromptVariablePanel
                    variables={editorVariables}
                    onInsert={handleInsertVariable}
                    compact={true}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="flex items-center justify-center h-full">
              <div className="text-center" data-testid="empty-selection-state">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No prompt selected
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select a prompt from the list to view and edit
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
