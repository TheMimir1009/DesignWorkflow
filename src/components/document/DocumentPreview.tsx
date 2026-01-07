/**
 * DocumentPreview Component
 * TAG-DOC-001: Read-only markdown rendering component
 *
 * Uses react-markdown with remark-gfm plugin for GitHub Flavored Markdown support
 * including tables, task lists, strikethrough, and autolinks.
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Props for DocumentPreview component
 */
export interface DocumentPreviewProps {
  /** Markdown content to render */
  content: string;
  /** Optional CSS class name for custom styling */
  className?: string;
}

/**
 * DocumentPreview renders markdown content in read-only mode.
 *
 * Features:
 * - GitHub Flavored Markdown (GFM) support
 * - Tables, task lists, strikethrough, autolinks
 * - Code blocks with syntax highlighting ready
 * - XSS safe rendering
 *
 * @example
 * ```tsx
 * <DocumentPreview
 *   content="# Title\n\nSome **bold** text"
 *   className="max-w-prose"
 * />
 * ```
 */
export function DocumentPreview({
  content,
  className = '',
}: DocumentPreviewProps) {
  return (
    <div
      data-testid="document-preview"
      className={`prose prose-slate max-w-none ${className}`.trim()}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
