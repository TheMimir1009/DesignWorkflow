/**
 * TemplateVariableEditor Component
 * Editor for managing template variables
 */
import type { TemplateVariable, TemplateVariableType } from '../../types';

export interface TemplateVariableEditorProps {
  variables: TemplateVariable[];
  onChange: (variables: TemplateVariable[]) => void;
}

const VARIABLE_TYPES: TemplateVariableType[] = ['text', 'textarea', 'select', 'number'];

/**
 * Editor component for template variables
 */
export function TemplateVariableEditor({
  variables,
  onChange,
}: TemplateVariableEditorProps) {
  const handleAddVariable = () => {
    const newVariable: TemplateVariable = {
      name: '',
      description: '',
      defaultValue: null,
      required: false,
      type: 'text',
      options: null,
    };
    onChange([...variables, newVariable]);
  };

  const handleDeleteVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index);
    onChange(newVariables);
  };

  const handleUpdateVariable = (index: number, field: keyof TemplateVariable, value: unknown) => {
    const newVariables = [...variables];
    newVariables[index] = {
      ...newVariables[index],
      [field]: value,
    };
    onChange(newVariables);
  };

  const handleOptionsChange = (index: number, optionsString: string) => {
    const options = optionsString
      .split(',')
      .map(opt => opt.trim())
      .filter(opt => opt.length > 0);
    handleUpdateVariable(index, 'options', options.length > 0 ? options : null);
  };

  const getOptionsString = (options: string[] | null): string => {
    return options ? options.join(', ') : '';
  };

  return (
    <div data-testid="template-variable-editor" className="space-y-4">
      {/* Variable list */}
      {variables.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No variables defined. Add a variable to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {variables.map((variable, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              {/* Row 1: Name and Delete button */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Variable Name
                  </label>
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) => handleUpdateVariable(index, 'name', e.target.value)}
                    placeholder="variable_name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteVariable(index)}
                  aria-label={`Delete ${variable.name || 'variable'}`}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={variable.description}
                  onChange={(e) => handleUpdateVariable(index, 'description', e.target.value)}
                  placeholder="Enter description"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 3: Type and Required */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Type
                  </label>
                  <select
                    value={variable.type}
                    onChange={(e) => handleUpdateVariable(index, 'type', e.target.value as TemplateVariableType)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {VARIABLE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id={`required-${index}`}
                    checked={variable.required}
                    onChange={(e) => handleUpdateVariable(index, 'required', e.target.checked)}
                    aria-label="Required"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`required-${index}`} className="text-sm text-gray-600">
                    Required
                  </label>
                </div>
              </div>

              {/* Row 4: Default Value */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Default Value
                </label>
                <input
                  type="text"
                  value={variable.defaultValue || ''}
                  onChange={(e) => handleUpdateVariable(index, 'defaultValue', e.target.value || null)}
                  placeholder="Enter default value (optional)"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 5: Options (only for select type) */}
              {variable.type === 'select' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={getOptionsString(variable.options)}
                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                    placeholder="option1, option2, option3"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add variable button */}
      <button
        type="button"
        onClick={handleAddVariable}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add Variable
      </button>
    </div>
  );
}
