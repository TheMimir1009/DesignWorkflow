/**
 * DocumentEditor Component
 * TAG-DOC-002: Split-view markdown editor with preview
 *
 * Features:
 * - Split view: editor on left, preview on right
 * - Mode toggle: edit/preview modes
 * - Debounced onChange (300ms)
 * - Save and Approve action buttons
 * - Loading state indicator
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { MarkdownEditor } from '../common/MarkdownEditor';
import { DocumentPreview } from './DocumentPreview';
import { ReferenceDocButton, DocumentReferenceSidePanel, SideBySideView } from '../reference';

/**
 * Editor mode type
 */
export type EditorMode = 'edit' | 'preview';

/**
 * Props for DocumentEditor component
 */
export interface DocumentEditorProps {
  /** Current markdown content */
  content: string;
  /** Callback when content changes (debounced) */
  onChange: (content: string) => void;
  /** Callback when save button is clicked */
  onSave: () => void;
  /** Callback when approve button is clicked */
  onApprove: () => void;
  /** Whether the editor is in loading state */
  isLoading: boolean;
  /** Current editor mode */
  mode: EditorMode;
  /** Callback when mode changes */
  onModeChange?: (mode: EditorMode) => void;
}

/**
 * DocumentEditor provides a split-view markdown editing experience.
 *
 * In edit mode, shows editor on left and live preview on right.
 * In preview mode, shows full-width preview only.
 *
 * @example
 * ```tsx
 * <DocumentEditor
 *   content={content}
 *   onChange={handleChange}
 *   onSave={handleSave}
 *   onApprove={handleApprove}
 *   isLoading={false}
 *   mode="edit"
 * />
 * ```
 */
export function DocumentEditor({
  content,
  onChange,
  onSave,
  onApprove,
  isLoading,
  mode,
  onModeChange,
}: DocumentEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Debounced onChange handler
  const handleContentChange = useCallback(
    (newContent: string) => {
      setLocalContent(newContent);

      // Clear existing debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounce timer
      debounceRef.current = setTimeout(() => {
        onChange(newContent);
      }, 300);
    },
    [onChange]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleModeChange = (newMode: EditorMode) => {
    onModeChange?.(newMode);
  };

  return (
    <div className="flex flex-col h-full" data-testid="document-editor">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        {/* Mode toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => handleModeChange('edit')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'edit'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            aria-label="Edit mode"
          >
            Edit
          </button>
          <button
            onClick={() => handleModeChange('preview')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'preview'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            aria-label="Preview mode"
          >
            Preview
          </button>
        </div>

        {/* Reference Doc Button and Action buttons */}
        <div className="flex items-center gap-2">
          <ReferenceDocButton />
          <div className="w-px h-6 bg-gray-300" />
          {isLoading && (
            <div
              data-testid="loading-spinner"
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            />
          )}
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Save"
          >
            Save
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Approve"
          >
            Approve
          </button>
        </div>
      </div>

      {/* Editor/Preview container */}
      <div
        data-testid="editor-container"
        className={`flex-1 grid gap-4 p-4 overflow-hidden ${
          mode === 'edit' ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Editor panel (only in edit mode) */}
        {mode === 'edit' && (
          <div className="flex flex-col overflow-hidden">
            <div className="text-xs font-medium text-gray-500 mb-2">EDITOR</div>
            <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
              <MarkdownEditor
                value={localContent}
                onChange={handleContentChange}
                placeholder="Write your markdown content here..."
                className="h-full"
                rows={20}
                resize="none"
              />
            </div>
          </div>
        )}

        {/* Preview panel */}
        <div className="flex flex-col overflow-hidden">
          {mode === 'edit' && (
            <div className="text-xs font-medium text-gray-500 mb-2">PREVIEW</div>
          )}
          <div className="flex-1 overflow-auto border border-gray-200 rounded-md p-4 bg-white">
            <DocumentPreview content={localContent} />
          </div>
        </div>
      </div>

      {/* Document Reference Side Panel */}
      <DocumentReferenceSidePanel />

      {/* Side-by-side View (REQ-007) */}
      <SideBySideView currentContent={localContent} />
    </div>
  );
}
