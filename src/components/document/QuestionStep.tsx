/**
 * QuestionStep Component
 * Displays a single question with input and navigation
 */
import type { Question } from '../../types/qa';

/**
 * Props for QuestionStep
 */
export interface QuestionStepProps {
  /** The question to display */
  question: Question;
  /** Current answer value */
  answer: string;
  /** Callback when answer changes */
  onChange: (answer: string) => void;
  /** Callback when Next is clicked */
  onNext: () => void;
  /** Callback when Previous is clicked */
  onPrev: () => void;
  /** Whether this is the first question */
  isFirst: boolean;
  /** Whether this is the last question */
  isLast: boolean;
  /** Whether the current answer is valid */
  isValid: boolean;
}

/**
 * QuestionStep - Single question display with input
 */
export function QuestionStep({
  question,
  answer,
  onChange,
  onNext,
  onPrev,
  isFirst,
  isLast,
  isValid,
}: QuestionStepProps) {
  const characterCount = answer.length;
  const maxLength = question.maxLength || 2000;

  return (
    <div className="space-y-4">
      {/* Question header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-sm text-gray-600">{question.description}</p>
        )}
      </div>

      {/* Input field */}
      <div className="space-y-2">
        {question.inputType === 'textarea' && (
          <>
            <textarea
              value={answer}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || ''}
              maxLength={maxLength}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         resize-none text-gray-900 placeholder-gray-400"
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-500">
                {characterCount} / {maxLength}
              </span>
            </div>
          </>
        )}

        {question.inputType === 'text' && (
          <input
            type="text"
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || ''}
            maxLength={maxLength || undefined}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       text-gray-900 placeholder-gray-400"
          />
        )}

        {question.inputType === 'select' && question.options && (
          <select
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       text-gray-900 bg-white"
          >
            <option value="">Select an option...</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {question.inputType === 'multiselect' && question.options && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const selectedOptions = answer ? answer.split(',') : [];
              const isChecked = selectedOptions.includes(option);

              const handleChange = () => {
                const newSelected = isChecked
                  ? selectedOptions.filter((o) => o !== option)
                  : [...selectedOptions, option];
                onChange(newSelected.join(','));
              };

              return (
                <label
                  key={option}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500 rounded border-gray-300
                               focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <div>
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg
                         hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${
              isValid
                ? isLast
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLast ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
