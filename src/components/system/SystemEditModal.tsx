/**
 * SystemEditModal Component
 * Modal for editing existing system documents
 */
import { useState, useEffect, useRef, useId } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { useProjectStore } from '../../store/projectStore';
import type { SystemDocument } from '../../types';

export interface SystemEditModalProps {
  isOpen: boolean;
  document: SystemDocument | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const SUGGESTED_CATEGORIES = ['System', 'Content', 'UI', 'Economy', 'Growth', 'Narrative'];

export function SystemEditModal({ isOpen, document, onClose, onSuccess }: SystemEditModalProps) {
  const { updateDocument } = useSystemStore();
  const { currentProjectId } = useProjectStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const isValid = name.trim().length > 0 && name.length <= 100 && category.trim().length > 0;

  // Load document data when modal opens or document changes
  useEffect(() => {
    if (isOpen && document) {
      setName(document.name);
      setCategory(document.category);
      setTags([...document.tags]);
      setTagInput('');
      setContent(document.content);
      setError(null);
      setIsSubmitting(false);

      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    }
  }, [isOpen, document]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting || !currentProjectId || !document) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateDocument(currentProjectId, document.id, {
        name: name.trim(),
        category: category.trim(),
        tags,
        content,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !document) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 id={titleId} className="text-xl font-semibold text-white mb-6">
          Edit System Document
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="system-name" className="block text-sm font-medium text-gray-300 mb-2">
              Document Name *
            </label>
            <input
              ref={nameInputRef}
              id="system-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter document name"
            />
            {name.length > 100 && (
              <p className="mt-1 text-sm text-red-400">Must be 100 characters or less</p>
            )}
          </div>

          {/* Category Field */}
          <div className="mb-4">
            <label htmlFor="system-category" className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <input
              id="system-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter or select category"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-1 text-sm rounded border ${
                    category === cat
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Field */}
          <div className="mb-4">
            <label htmlFor="system-tags" className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            {tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                      className="hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              id="system-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Press Enter to add tags"
            />
          </div>

          {/* Content Field */}
          <div className="mb-6">
            <label htmlFor="system-content" className="block text-sm font-medium text-gray-300 mb-2">
              Content (Markdown)
            </label>
            <textarea
              id="system-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
              placeholder="# Document Title&#10;&#10;Document content here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
