/**
 * MarkdownEditor Component
 * A simple textarea-based markdown editor for feature list and document editing
 */

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  rows?: number;
  resize?: 'vertical' | 'horizontal' | 'both' | 'none';
}

/**
 * Simple markdown editor component
 * Provides a textarea with markdown-friendly styling
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  ariaLabel,
  rows = 6,
  resize = 'vertical',
}: MarkdownEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      data-testid="markdown-editor"
      className={`markdown-editor ${className}`}
    >
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        rows={rows}
        style={{ resize }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
      />
    </div>
  );
}
