/**
 * TemplateVariableForm Component
 * Dynamic form for inputting template variable values
 */
import type { TemplateVariable } from '../../types';

export interface TemplateVariableFormProps {
  variables: TemplateVariable[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

/**
 * Dynamic form component for template variables
 */
export function TemplateVariableForm({
  variables,
  values,
  onChange,
}: TemplateVariableFormProps) {
  const handleChange = (name: string, value: string) => {
    onChange({
      ...values,
      [name]: value,
    });
  };

  if (variables.length === 0) {
    return (
      <div
        data-testid="template-variable-form"
        className="text-center py-4 text-gray-500 text-sm"
      >
        No variables to fill in this template.
      </div>
    );
  }

  return (
    <div data-testid="template-variable-form" className="space-y-4">
      {variables.map((variable) => (
        <div key={variable.name}>
          <label
            htmlFor={`var-${variable.name}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {variable.description}
            {variable.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>

          {/* Text input */}
          {variable.type === 'text' && (
            <input
              id={`var-${variable.name}`}
              type="text"
              value={values[variable.name] || ''}
              onChange={(e) => handleChange(variable.name, e.target.value)}
              placeholder={variable.defaultValue || `Enter ${variable.name}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}

          {/* Textarea */}
          {variable.type === 'textarea' && (
            <textarea
              id={`var-${variable.name}`}
              value={values[variable.name] || ''}
              onChange={(e) => handleChange(variable.name, e.target.value)}
              placeholder={variable.defaultValue || `Enter ${variable.name}`}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}

          {/* Select */}
          {variable.type === 'select' && variable.options && (
            <select
              id={`var-${variable.name}`}
              value={values[variable.name] || ''}
              onChange={(e) => handleChange(variable.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select {variable.name}...</option>
              {variable.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {/* Number input */}
          {variable.type === 'number' && (
            <input
              id={`var-${variable.name}`}
              type="number"
              value={values[variable.name] || ''}
              onChange={(e) => handleChange(variable.name, e.target.value)}
              placeholder={variable.defaultValue || `Enter ${variable.name}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      ))}
    </div>
  );
}
