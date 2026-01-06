/**
 * TemplatePreview Component
 * Preview template with variable substitution
 */
import { useState } from 'react';
import type { Template } from '../../types';
import { TemplateVariableForm } from './TemplateVariableForm';
import { substituteVariables } from '../../utils/templateParser';

export interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
}

/**
 * Component for previewing templates with variable substitution
 */
export function TemplatePreview({
  template,
  onClose,
}: TemplatePreviewProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const handleGeneratePreview = () => {
    // Apply default values for empty fields
    const finalValues: Record<string, string> = {};
    for (const variable of template.variables) {
      const userValue = values[variable.name];
      if (userValue) {
        finalValues[variable.name] = userValue;
      } else if (variable.defaultValue) {
        finalValues[variable.name] = variable.defaultValue;
      }
    }

    const result = substituteVariables(template.content, finalValues);
    setPreviewContent(result);
  };

  return (
    <div data-testid="template-preview" className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Variable Form */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Fill Variables</h3>
        <TemplateVariableForm
          variables={template.variables}
          values={values}
          onChange={setValues}
        />
      </div>

      {/* Generate Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleGeneratePreview}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Generate Preview
        </button>
      </div>

      {/* Preview Result */}
      {previewContent !== null && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Preview Result</h3>
          <div
            data-testid="preview-result"
            className="p-4 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm whitespace-pre-wrap overflow-auto max-h-64"
          >
            {previewContent}
          </div>
        </div>
      )}
    </div>
  );
}
