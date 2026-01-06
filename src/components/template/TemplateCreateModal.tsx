/**
 * TemplateCreateModal Component
 * Modal for creating new templates
 */
import { useState, useId } from 'react';
import type { TemplateCategory, TemplateVariable, CreateTemplateDto } from '../../types';
import { TemplateVariableEditor } from './TemplateVariableEditor';
import { suggestVariables } from '../../utils/templateParser';

export interface TemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTemplateDto) => void;
}

const CATEGORIES: TemplateCategory[] = ['qa-questions', 'document-structure', 'prompts'];

/**
 * Modal component for creating new templates
 */
export function TemplateCreateModal({
  isOpen,
  onClose,
  onSave,
}: TemplateCreateModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory | ''>('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateTemplateDto = {
        name: name.trim(),
        category: category as TemplateCategory,
        description: description.trim(),
        content,
        variables,
      };

      onSave(data);
      handleReset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setCategory('');
    setDescription('');
    setContent('');
    setVariables([]);
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Auto-suggest variables from content
    const suggested = suggestVariables(newContent);
    // Merge with existing variables, keeping user modifications
    const existingNames = new Set(variables.map(v => v.name));
    const newVariables = suggested.filter(v => !existingNames.has(v.name));
    if (newVariables.length > 0) {
      setVariables([...variables, ...newVariables]);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const isValid = name.trim().length > 0 && category !== '';

  return (
    <div
      data-testid="template-create-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-labelledby={titleId}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            Create Template
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {/* Category */}
            <div>
              <label htmlFor="template-category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="template-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="template-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                id="template-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter template description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="template-content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="template-content"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter template content. Use {{variable_name}} for variables."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>

            {/* Variable Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables
              </label>
              <TemplateVariableEditor
                variables={variables}
                onChange={setVariables}
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
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
