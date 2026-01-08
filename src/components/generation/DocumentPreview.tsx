/**
 * GenerationDocumentPreview Component
 * Markdown preview for generated documents with copy/download functionality
 *
 * Requirements:
 * - REQ-UI-007: Render generated document preview
 * - REQ-UI-008: Support copy to clipboard
 * - REQ-UI-009: Support document download
 */
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type DocumentType = 'design-document' | 'prd' | 'prototype' | 'feature-analysis';

interface GenerationDocumentPreviewProps {
  /** Document content (markdown or HTML for prototype) */
  content: string;
  /** Document title */
  title?: string;
  /** Type of document */
  documentType?: DocumentType;
  /** Show download button */
  showDownload?: boolean;
  /** Filename for download */
  filename?: string;
  /** Maximum height with scroll */
  maxHeight?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get display label for document type
 */
function getDocumentTypeLabel(type?: DocumentType): string {
  switch (type) {
    case 'design-document':
      return 'Design Document';
    case 'prd':
      return 'PRD';
    case 'prototype':
      return 'Prototype';
    case 'feature-analysis':
      return 'Feature Analysis';
    default:
      return 'Document';
  }
}

/**
 * Document preview component with copy and download functionality
 */
export function GenerationDocumentPreview({
  content,
  title,
  documentType,
  showDownload = true,
  filename = 'document.md',
  maxHeight,
  className = '',
}: GenerationDocumentPreviewProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  /**
   * Copy content to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  }, [content]);

  /**
   * Download content as file
   */
  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [content, filename]);

  // Empty content state
  if (!content || content.trim() === '') {
    return (
      <div
        data-testid="generation-document-preview"
        className={`border rounded-lg p-6 text-center text-gray-500 ${className}`}
      >
        No content available
      </div>
    );
  }

  const isPrototype = documentType === 'prototype';

  return (
    <div
      data-testid="generation-document-preview"
      aria-label={title ? `${title} preview` : `${getDocumentTypeLabel(documentType)} preview`}
      className={`border rounded-lg overflow-hidden ${className}`}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          {title && <h3 className="font-medium text-gray-900">{title}</h3>}
          {documentType && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {getDocumentTypeLabel(documentType)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-50"
            aria-label="Copy to clipboard"
          >
            {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'error' ? 'Failed' : 'Copy'}
          </button>

          {/* Download button */}
          {showDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-50"
              aria-label="Download document"
            >
              Download
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        data-testid="preview-content"
        className={`p-4 ${isPrototype ? '' : 'prose prose-sm max-w-none'}`}
      >
        {isPrototype ? (
          <iframe
            srcDoc={content}
            title="Prototype preview"
            sandbox="allow-scripts"
            className="w-full h-96 border rounded"
          />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default GenerationDocumentPreview;
