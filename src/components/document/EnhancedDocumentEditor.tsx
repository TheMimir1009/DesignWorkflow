/**
 * EnhancedDocumentEditor Component
 * TAG-DOCEDIT-001: Enhanced markdown editor with CodeMirror integration
 *
 * Features:
 * - CodeMirror 6 editor with markdown language support
 * - Syntax highlighting and line numbers
 * - Auto-save with 5-second debounce
 * - Keyboard shortcuts (Ctrl+S, Ctrl+B, Ctrl+I, Ctrl+K, etc.)
 * - Save status indicator integration
 * - Error handling with automatic retry
 * - Read-only mode support
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language';
import { lineNumbers, highlightActiveLineGutter, keymap } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import type { SaveStatus } from './types';

// Re-export SaveStatus type for backward compatibility
export type { SaveStatus };

/**
 * Props for EnhancedDocumentEditor component
 */
export interface EnhancedDocumentEditorProps {
  /** Initial markdown content */
  initialContent: string;
  /** Task ID for version management */
  taskId: string;
  /** Callback when content should be saved */
  onSave: (content: string) => Promise<void>;
  /** Callback when save status changes */
  onSaveStatusChange: (status: SaveStatus) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether editor is in read-only mode */
  readOnly?: boolean;
}

/**
 * Retry configuration for failed saves
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  currentAttempt: number;
}

/**
 * EnhancedDocumentEditor provides a professional markdown editing experience
 * with CodeMirror 6 integration, auto-save, and keyboard shortcuts.
 *
 * @example
 * ```tsx
 * <EnhancedDocumentEditor
 *   initialContent="# Hello World"
 *   taskId="task-123"
 *   onSave={handleSave}
 *   onSaveStatusChange={handleStatusChange}
 * />
 * ```
 */
export function EnhancedDocumentEditor({
  initialContent,
  taskId, // eslint-disable-line @typescript-eslint/no-unused-vars -- Reserved for future use
  onSave,
  onSaveStatusChange,
  className = '',
  readOnly = false,
}: EnhancedDocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string>('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryConfigRef = useRef<RetryConfig>({
    maxRetries: 3,
    retryDelay: 10000,
    currentAttempt: 0,
  });
  const editorViewRef = useRef<EditorView | null>(null);
  const contentRef = useRef(content);

  // Update content ref when content changes
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  /**
   * Update save status and notify parent component
   */
  const updateSaveStatus = useCallback(
    (status: SaveStatus, error?: string) => {
      setSaveStatus(status);
      onSaveStatusChange(status);
      if (error) {
        setErrorMessage(error);
      }
    },
    [onSaveStatusChange]
  );

  /**
   * Perform save operation with retry logic
   */
  const performSave = useCallback(
    async (contentToSave: string): Promise<void> => {
      try {
        updateSaveStatus('saving');
        await onSave(contentToSave);
        updateSaveStatus('saved');
        setLastSavedTime(new Date());
        setErrorMessage('');
        retryConfigRef.current.currentAttempt = 0;
      } catch (error) {
        const retryConfig = retryConfigRef.current;
        const isLastAttempt = retryConfig.currentAttempt >= retryConfig.maxRetries;

        updateSaveStatus('error', error instanceof Error ? error.message : 'Save failed');

        if (!isLastAttempt) {
          retryConfig.currentAttempt++;
          setTimeout(() => {
            performSave(contentToSave);
          }, retryConfig.retryDelay);
        }
      }
    },
    [onSave, updateSaveStatus]
  );

  /**
   * Debounced save handler
   */
  const scheduleSave = useCallback(
    (newContent: string) => {
      if (readOnly) return;

      updateSaveStatus('unsaved');

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSave(newContent);
      }, 5000);
    },
    [readOnly, updateSaveStatus, performSave]
  );

  /**
   * Handle content changes from CodeMirror
   */
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      scheduleSave(newContent);
    },
    [scheduleSave]
  );

  /**
   * Manual save handler (triggered by Ctrl+S)
   */
  const handleManualSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    performSave(contentRef.current);
  }, [performSave]);

  /**
   * Insert markdown formatting around selection
   */
  const insertMarkdownFormatting = useCallback(
    (view: EditorView, prefix: string, suffix: string) => {
      const { from, to } = view.state.selection.main;
      const selectedText = view.state.sliceDoc(from, to);
      const insertion = `${prefix}${selectedText}${suffix}`;
      view.dispatch({
        changes: {
          from,
          to,
          insert: insertion,
        },
        selection: {
          anchor: from + prefix.length,
          head: to + prefix.length,
        },
      });
    },
    []
  );

  /**
   * Insert code block
   */
  const insertCodeBlock = useCallback((view: EditorView) => {
    const { from } = view.state.selection.main;
    const insertion = '```\n\n```';
    view.dispatch({
      changes: {
        from,
        insert: insertion,
      },
      selection: {
        anchor: from + 5,
        head: from + 5,
      },
    });
  }, []);

  /**
   * Keyboard shortcut extensions
   */
  const keyboardExtensions = useCallback(() => {
    if (readOnly) return [];

    return [
      keymap.of([
        {
          key: 'Mod-s',
          run: () => {
            handleManualSave();
            return true;
          },
        },
        {
          key: 'Mod-b',
          run: (view) => {
            insertMarkdownFormatting(view, '**', '**');
            return true;
          },
        },
        {
          key: 'Mod-i',
          run: (view) => {
            insertMarkdownFormatting(view, '*', '*');
            return true;
          },
        },
        {
          key: 'Mod-k',
          run: (view) => {
            insertMarkdownFormatting(view, '`', '`');
            return true;
          },
        },
        {
          key: 'Mod-Shift-k',
          run: (view) => {
            insertCodeBlock(view);
            return true;
          },
        },
      ]),
    ];
  }, [readOnly, handleManualSave, insertMarkdownFormatting, insertCodeBlock]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  /**
   * Update content when initialContent prop changes
   */
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <div
      data-testid="enhanced-document-editor"
      className={`enhanced-document-editor ${className} ${readOnly ? 'read-only' : ''}`}
      role="textbox"
      aria-label="Enhanced markdown document editor"
    >
      <CodeMirror
        value={content}
        height="100%"
        extensions={[
          markdown({ codeLanguages: languages }),
          lineNumbers(),
          highlightActiveLineGutter(),
          oneDark,
          EditorView.theme({
            '&': {
              height: '100%',
            },
            '&.cm-focused': {
              outline: 'none',
            },
          }),
          ...keyboardExtensions(),
          EditorView.lineWrapping,
          readOnly ? EditorState.readOnly.of(true) : [],
        ]}
        onChange={handleContentChange}
        readOnly={readOnly}
        onCreateEditor={(view) => {
          editorViewRef.current = view;
        }}
      />
      <SaveStatusIndicator
        status={saveStatus}
        lastSavedTime={lastSavedTime}
        errorMessage={errorMessage}
      />
    </div>
  );
}
