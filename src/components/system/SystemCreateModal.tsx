/**
 * SystemCreateModal Component
 * Modal for creating new system documents
 */
import { useState, useId } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { MarkdownEditor } from '../common/MarkdownEditor';
import { TagInput } from '../common/TagInput';

export interface SystemCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (systemId: string) => void;
  projectId: string;
  existingCategories: string[];
  existingTags: string[];
}

/**
 * Modal component for creating new system documents
 */
export function SystemCreateModal({
  isOpen,
  onClose,
  onCreated,
  projectId,
  existingCategories,
  existingTags,
}: SystemCreateModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const titleId = useId();
  const createDocument = useSystemStore((state) => state.createDocument);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      await createDocument(projectId, {
        name: name.trim(),
        category: category.trim(),
        tags,
        content,
        dependencies: [],
      });

      // Reset form
      setName('');
      setCategory('');
      setTags([]);
      setContent('');

      // Get the newest document ID from store
      const state = useSystemStore.getState();
      const newestDoc = state.documents[0];
      if (newestDoc) {
        onCreated(newestDoc.id);
      }
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setCategory('');
    setTags([]);
    setContent('');
    onClose();
  };

  const isValid = name.trim().length > 0 && category.trim().length > 0;

  // Filter category suggestions
  const filteredCategories = existingCategories.filter((c) =>
    c.toLowerCase().includes(category.toLowerCase())
  );

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      data-testid="system-create-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-labelledby={titleId}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            Create System Document
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="system-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="system-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter document name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="relative">
              <label htmlFor="system-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                id="system-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onFocus={() => setShowCategorySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                placeholder="Enter or select category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showCategorySuggestions && filteredCategories.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {filteredCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCategory(c);
                        setShowCategorySuggestions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                suggestions={existingTags}
                placeholder="Add tags..."
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="system-content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write document content in markdown..."
                ariaLabel="Document Content"
                rows={10}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
