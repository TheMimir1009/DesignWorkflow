/**
 * QuestionItem Component
 * Renders a single question with appropriate input type
 */
import type { Question } from '../../types/qa';

interface QuestionItemProps {
  question: Question;
  answer: string;
  onChange: (questionId: string, answer: string) => void;
  showValidation?: boolean;
}

/**
 * Question item component for Q&A forms
 */
export function QuestionItem({
  question,
  answer,
  onChange,
  showValidation = false,
}: QuestionItemProps) {
  const hasError = showValidation && question.isRequired && !answer.trim();
  const inputId = `question-${question.id}`;
  const errorId = `question-${question.id}-error`;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange(question.id, e.target.value);
  };

  const commonInputProps = {
    id: inputId,
    name: question.id,
    value: answer,
    onChange: handleChange,
    'aria-required': question.isRequired,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
    className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`,
  };

  const renderInput = () => {
    switch (question.inputType) {
      case 'text':
        return <input type="text" {...commonInputProps} />;

      case 'textarea':
        return <textarea {...commonInputProps} rows={4} />;

      case 'select':
        return (
          <select {...commonInputProps}>
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select {...commonInputProps} multiple>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return <textarea {...commonInputProps} rows={4} />;
    }
  };

  return (
    <div className="mb-6" data-testid={`question-item-${question.id}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-900 mb-1">
        <span className="flex items-start gap-1">
          <span>{question.text}</span>
          {question.isRequired && <span className="text-red-500">*</span>}
        </span>
      </label>

      {question.helpText && (
        <p className="text-sm text-gray-500 mb-2">{question.helpText}</p>
      )}

      {renderInput()}

      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
          This field is required
        </p>
      )}
    </div>
  );
}
