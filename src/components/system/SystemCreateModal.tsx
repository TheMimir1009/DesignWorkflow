/**
 * SystemCreateModal Component
 * Modal for creating new system documents
 */
import { useState, useEffect } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { MarkdownEditor } from '../common/MarkdownEditor';

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

interface SystemCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

/**
 * Modal component for creating new system documents
 */
export function SystemCreateModal({ isOpen, onClose, projectId }: SystemCreateModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createSystem = useSystemStore((state) => state.createSystem);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('');
      setTagsInput('');
      setContent('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category) {
      return;
    }

    setIsCreating(true);

    try {
      // Parse tags from comma-separated input
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await createSystem(projectId, {
        name: name.trim(),
        category,
        tags,
        content,
      });

      setName('');
      setCategory('');
      setTagsInput('');
      setContent('');
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setCategory('');
    setTagsInput('');
    setContent('');
    onClose();
  };

  const isValid = name.trim().length > 0 && category.length > 0;

  return (
    <div
      data-testid="system-create-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        role="dialog"
        aria-labelledby="create-system-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id="create-system-title" className="text-lg font-semibold text-gray-900">
            Create System Document
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
                autoFocus
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
