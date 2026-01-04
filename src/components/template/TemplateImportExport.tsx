/**
 * TemplateImportExport Component
 * Import/Export templates as JSON
 */
import { useRef, useState } from 'react';
import type { Template, CreateTemplateDto } from '../../types';

export interface TemplateImportExportProps {
  template: Template | null;
  onImport: (data: CreateTemplateDto) => void;
}

/**
 * Component for importing and exporting templates
 */
export function TemplateImportExport({
  template,
  onImport,
}: TemplateImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    if (!template) return;

    const exportData = {
      name: template.name,
      category: template.category,
      description: template.description,
      content: template.content,
      variables: template.variables,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Basic validation
      if (!data.name || !data.category) {
        throw new Error('Invalid template format: missing required fields');
      }

      // Validate category
      const validCategories = ['qa-questions', 'document-structure', 'prompts'];
      if (!validCategories.includes(data.category)) {
        throw new Error('Invalid template format: invalid category');
      }

      const importData: CreateTemplateDto = {
        name: data.name,
        category: data.category,
        description: data.description || '',
        content: data.content || '',
        variables: data.variables || [],
      };

      onImport(importData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON file');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div data-testid="template-import-export" className="flex items-center gap-2">
      {/* Export Button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={!template}
        aria-label="Export template"
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        Export
      </button>

      {/* Import Button */}
      <button
        type="button"
        onClick={handleImportClick}
        aria-label="Import template"
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Import
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
