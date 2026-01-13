/**
 * SystemEditModal Component
 * Modal for editing existing system documents
 */
<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { MarkdownEditor } from '../common/MarkdownEditor';
import type { SystemDocument } from '../../types';

/**
 * Available categories for system documents
 */
const CATEGORIES = [
  { value: 'game-mechanic', label: 'Game Mechanic' },
  { value: 'economy', label: 'Economy' },
  { value: 'combat', label: 'Combat' },
  { value: 'narrative', label: 'Narrative' },
  { value: 'progression', label: 'Progression' },
  { value: 'social', label: 'Social' },
  { value: 'core', label: 'Core' },
  { value: 'other', label: 'Other' },
];

interface SystemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: SystemDocument | null;
>>>>>>> main
}

/**
 * Modal component for editing system documents
 */
<<<<<<< HEAD
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
=======
export function SystemEditModal({ isOpen, onClose, system }: SystemEditModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateSystem = useSystemStore((state) => state.updateSystem);

  // Populate form when system changes or modal opens
  useEffect(() => {
    if (system && isOpen) {
      setName(system.name);
      setCategory(system.category);
      setTagsInput(system.tags.join(', '));
      setContent(system.content);
    }
  }, [system, isOpen]);

  if (!isOpen || !system) {
>>>>>>> main
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

<<<<<<< HEAD
    if (!name.trim() || !category.trim()) {
=======
    if (!name.trim() || !category) {
>>>>>>> main
      return;
    }

    setIsSaving(true);

    try {
<<<<<<< HEAD
      await updateDocument(projectId, document.id, {
        name: name.trim(),
        category: category.trim(),
        tags,
        content,
      });
      onUpdated();
=======
      // Parse tags from comma-separated input
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await updateSystem(system.id, {
        name: name.trim(),
        category,
        tags,
        content,
      });

>>>>>>> main
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

<<<<<<< HEAD
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
=======
  const handleCancel = () => {
    // Reset to original values
    if (system) {
      setName(system.name);
      setCategory(system.category);
      setTagsInput(system.tags.join(', '));
      setContent(system.content);
    }
    onClose();
  };

  const isValid = name.trim().length > 0 && category.length > 0;

  return (
    <div
      data-testid="system-edit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        role="dialog"
        aria-labelledby="edit-system-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id="edit-system-title" className="text-lg font-semibold text-gray-900">
            Edit System Document
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
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
                placeholder="Enter system name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="system-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="system-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="system-tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                id="system-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Enter tags separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Separate tags with commas (e.g., core, balance, v1.0)</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="system-content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Describe the system in markdown format..."
                ariaLabel="Content"
                rows={8}
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
              disabled={!isValid || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
>>>>>>> main
  );
}
