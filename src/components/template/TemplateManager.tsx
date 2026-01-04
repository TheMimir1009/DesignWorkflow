/**
 * TemplateManager Component
 * Main template management page
 */
import { useEffect, useState } from 'react';
import type { Template, TemplateCategory, CreateTemplateDto, UpdateTemplateDto } from '../../types';
import { useTemplateStore, selectFilteredTemplates } from '../../store/templateStore';
import { TemplateList } from './TemplateList';
import { TemplateCreateModal } from './TemplateCreateModal';
import { TemplateEditModal } from './TemplateEditModal';
import { TemplatePreview } from './TemplatePreview';
import { TemplateImportExport } from './TemplateImportExport';
import { ConfirmDialog } from '../common/ConfirmDialog';

const CATEGORIES: (TemplateCategory | null)[] = [null, 'qa-questions', 'document-structure', 'prompts'];

/**
 * Main template management page component
 */
export function TemplateManager() {
  const templates = useTemplateStore(selectFilteredTemplates);
  const selectedCategory = useTemplateStore((state) => state.selectedCategory);
  const searchQuery = useTemplateStore((state) => state.searchQuery);
  const isLoading = useTemplateStore((state) => state.isLoading);
  const fetchTemplates = useTemplateStore((state) => state.fetchTemplates);
  const createTemplate = useTemplateStore((state) => state.createTemplate);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);
  const deleteTemplate = useTemplateStore((state) => state.deleteTemplate);
  const setSelectedCategory = useTemplateStore((state) => state.setSelectedCategory);
  const setSearchQuery = useTemplateStore((state) => state.setSearchQuery);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateSave = async (data: CreateTemplateDto) => {
    await createTemplate(data);
    setIsCreateModalOpen(false);
  };

  const handleEditSave = async (templateId: string, data: UpdateTemplateDto) => {
    await updateTemplate(templateId, data);
    setEditingTemplate(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingTemplate) {
      await deleteTemplate(deletingTemplate.id);
      setDeletingTemplate(null);
    }
  };

  const handleImport = async (data: CreateTemplateDto) => {
    await createTemplate(data);
  };

  const handleSelectTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setPreviewingTemplate(template);
    }
  };

  const handleEditTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setEditingTemplate(template);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setDeletingTemplate(template);
    }
  };

  const getCategoryLabel = (category: TemplateCategory | null): string => {
    return category || 'All';
  };

  return (
    <div data-testid="template-manager" className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
        <div className="flex items-center gap-3">
          <TemplateImportExport
            template={previewingTemplate}
            onImport={handleImport}
          />
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Template
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-4 flex items-center gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category || 'all'}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Template List */}
      <TemplateList
        templates={templates}
        selectedCategory={selectedCategory}
        onSelectTemplate={handleSelectTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        isLoading={isLoading}
      />

      {/* Create Modal */}
      <TemplateCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
      />

      {/* Edit Modal */}
      <TemplateEditModal
        isOpen={!!editingTemplate}
        template={editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSave={handleEditSave}
      />

      {/* Preview Panel */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="max-w-2xl w-full mx-4">
            <TemplatePreview
              template={previewingTemplate}
              onClose={() => setPreviewingTemplate(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTemplate}
        title="Delete Template"
        message={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTemplate(null)}
      />
    </div>
  );
}
