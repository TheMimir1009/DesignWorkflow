/**
 * SystemEditModal Component
 * Modal for editing existing system documents
 */
import { useState, useEffect, useId } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { MarkdownEditor } from '../common/MarkdownEditor';
import { TagInput } from '../common/TagInput';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { SystemDocument } from '../../types';

export interface SystemEditModalProps {
  document: SystemDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
  projectId: string;
  existingCategories: string[];
  existingTags: string[];
}

/**
 * Modal component for editing system documents
 */
export function SystemEditModal({
  document,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
  projectId,
  existingCategories,
  existingTags,
}: SystemEditModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const titleId = useId();
  const updateDocument = useSystemStore((state) => state.updateDocument);
  const deleteDocument = useSystemStore((state) => state.deleteDocument);

  // Initialize form with document data
  useEffect(() => {
    if (document && isOpen) {
      setName(document.name);
      setCategory(document.category);
      setTags([...document.tags]);
      setContent(document.content);
      setHasUnsavedChanges(false);
    }
  }, [document, isOpen]);

  // Track changes
  useEffect(() => {
    if (document) {
      const changed =
        name !== document.name ||
        category !== document.category ||
        content !== document.content ||
        JSON.stringify(tags) !== JSON.stringify(document.tags);
      setHasUnsavedChanges(changed);
    }
  }, [name, category, tags, content, document]);

  if (!isOpen || !document) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await updateDocument(projectId, document.id, {
        name: name.trim(),
        category: category.trim(),
        tags,
        content,
      });
      onUpdated();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    onClose();
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(projectId, document.id);
      setShowDeleteConfirm(false);
      onDeleted();
      onClose();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const isValid = name.trim().length > 0 && category.trim().length > 0;

  // Filter category suggestions
  const filteredCategories = existingCategories.filter((c) =>
    c.toLowerCase().includes(category.toLowerCase())
  );

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <div
        data-testid="system-edit-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleBackdropClick}
      >
        <div
          role="dialog"
          aria-labelledby={titleId}
          className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Edit System Document
            </h2>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="edit-system-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-system-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter document name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div className="relative">
                <label htmlFor="edit-system-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit-system-category"
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
                <label htmlFor="edit-system-content" className="block text-sm font-medium text-gray-700 mb-1">
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
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete System Document"
        message={`Are you sure you want to delete "${document.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Unsaved Changes Warning */}
      <ConfirmDialog
        isOpen={showUnsavedWarning}
        onClose={() => setShowUnsavedWarning(false)}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
      />
    </>
  );
}
