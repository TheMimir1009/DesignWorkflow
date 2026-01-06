/**
 * QAFormModal Component
 * Modal container for Q&A form with progress tracking
 */
import { useEffect } from 'react';
import { useQAStore } from '../../store/qaStore';
import { CategorySelector } from './CategorySelector';
import { QuestionList } from './QuestionList';

interface QAFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  projectId: string;
}

/**
 * Modal component for Q&A form
 */
export function QAFormModal({ isOpen, onClose, taskId, projectId }: QAFormModalProps) {
  const questions = useQAStore((state) => state.questions);
  const categories = useQAStore((state) => state.categories);
  const currentSession = useQAStore((state) => state.currentSession);
  const selectedCategoryId = useQAStore((state) => state.selectedCategoryId);
  const isLoading = useQAStore((state) => state.isLoading);
  const loadQuestions = useQAStore((state) => state.loadQuestions);
  const loadCategories = useQAStore((state) => state.loadCategories);
  const startSession = useQAStore((state) => state.startSession);
  const updateAnswer = useQAStore((state) => state.updateAnswer);
  const completeSession = useQAStore((state) => state.completeSession);
  const selectCategory = useQAStore((state) => state.selectCategory);
  const calculateProgress = useQAStore((state) => state.calculateProgress);

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadQuestions();
      loadCategories();
      if (!currentSession) {
        startSession(taskId, projectId);
      }
    }
  }, [isOpen, taskId, projectId, loadQuestions, loadCategories, startSession, currentSession]);

  if (!isOpen) {
    return null;
  }

  const progress = calculateProgress();

  const handleComplete = async () => {
    await completeSession();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Filter questions by selected category
  const filteredQuestions = selectedCategoryId
    ? questions.filter((q) => q.categoryId === selectedCategoryId)
    : questions;

  return (
    <div
      data-testid="qa-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        role="dialog"
        aria-labelledby="qa-form-title"
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 id="qa-form-title" className="text-lg font-semibold text-gray-900">
              Q&A Session
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Progress: {progress}% complete
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {currentSession?.isComplete && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <>
              {/* Category Selector */}
              <div className="mb-6">
                <CategorySelector
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={selectCategory}
                  completedCategories={currentSession?.completedCategories || []}
                />
              </div>

              {/* Question List */}
              <QuestionList
                questions={filteredQuestions}
                answers={currentSession?.answers || {}}
                onAnswerChange={updateAnswer}
                showProgress={false}
                categoryId={selectedCategoryId || undefined}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
