/**
 * QuestionList Component
 * Renders a list of questions with progress tracking
 */
import { useMemo } from 'react';
import type { Question } from '../../types/qa';
import { QuestionItem } from './QuestionItem';

interface QuestionListProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  showValidation?: boolean;
  showProgress?: boolean;
  categoryId?: string;
}

/**
 * Question list component for Q&A forms
 */
export function QuestionList({
  questions,
  answers,
  onAnswerChange,
  showValidation = false,
  showProgress = false,
  categoryId,
}: QuestionListProps) {
  // Filter questions by category if specified
  const filteredQuestions = useMemo(() => {
    if (!categoryId) {
      return questions;
    }
    return questions.filter((q) => q.categoryId === categoryId);
  }, [questions, categoryId]);

  // Sort questions by order
  const sortedQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => a.order - b.order);
  }, [filteredQuestions]);

  // Calculate progress
  const progress = useMemo(() => {
    const requiredQuestions = sortedQuestions.filter((q) => q.isRequired);
    if (requiredQuestions.length === 0) {
      return 0;
    }
    const answeredRequired = requiredQuestions.filter(
      (q) => answers[q.id] && answers[q.id].trim() !== ''
    );
    return Math.round((answeredRequired.length / requiredQuestions.length) * 100);
  }, [sortedQuestions, answers]);

  if (sortedQuestions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No questions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {sortedQuestions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          answer={answers[question.id] || ''}
          onChange={onAnswerChange}
          showValidation={showValidation}
        />
      ))}
    </div>
  );
}
