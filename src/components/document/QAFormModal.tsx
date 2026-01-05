/**
 * QAFormModal Component
 * Main modal for Q&A form flow
 */
import { useEffect, useState, useCallback } from 'react';
import { useQAStore } from '../../store/qaStore';
import { CategorySelector } from './CategorySelector';
import { ProgressIndicator } from './ProgressIndicator';
import { QuestionStep } from './QuestionStep';
import type { QACategory } from '../../types/qa';

/**
 * Props for QAFormModal
 */
export interface QAFormModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Task ID for the Q&A session */
  taskId: string;
  /** Callback when Q&A is completed */
  onComplete: () => void;
  /** Initial category to select */
  initialCategory?: QACategory;
}

/**
 * QAFormModal - Main Q&A flow modal
 */
export function QAFormModal({
  isOpen,
  onClose,
  taskId,
  onComplete,
  initialCategory = 'game_mechanic',
}: QAFormModalProps) {
  const [showCategoryWarning, setShowCategoryWarning] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<QACategory | null>(null);

  // Store state
  const questions = useQAStore((state) => state.questions);
  const currentStep = useQAStore((state) => state.currentStep);
  const answers = useQAStore((state) => state.answers);
  const isLoading = useQAStore((state) => state.isLoading);
  const error = useQAStore((state) => state.error);
  const selectedCategory = useQAStore((state) => state.selectedCategory);

  // Store actions
  const startSession = useQAStore((state) => state.startSession);
  const setAnswer = useQAStore((state) => state.setAnswer);
  const nextStep = useQAStore((state) => state.nextStep);
  const prevStep = useQAStore((state) => state.prevStep);
  const completeSession = useQAStore((state) => state.completeSession);
  const resetSession = useQAStore((state) => state.resetSession);
  const isCurrentStepValid = useQAStore((state) => state.isCurrentStepValid);

  // Initialize session when modal opens
  useEffect(() => {
    if (isOpen && taskId) {
      startSession(taskId, initialCategory);
    }
  }, [isOpen, taskId, initialCategory, startSession]);

  // Get current question
  const currentQuestion = questions[currentStep];

  // Get completed steps
  const completedSteps = questions
    .map((q, index) => {
      const answer = answers[q.id];
      return answer && answer.trim().length > 0 ? index : -1;
    })
    .filter((index) => index >= 0);

  // Handle category change
  const handleCategoryChange = useCallback(
    (newCategory: QACategory) => {
      // Check if there are any answers
      const hasAnswers = Object.values(answers).some((a) => a && a.trim().length > 0);

      if (hasAnswers) {
        setPendingCategory(newCategory);
        setShowCategoryWarning(true);
      } else {
        startSession(taskId, newCategory);
      }
    },
    [answers, taskId, startSession]
  );

  // Confirm category change
  const confirmCategoryChange = useCallback(() => {
    if (pendingCategory) {
      startSession(taskId, pendingCategory);
      setShowCategoryWarning(false);
      setPendingCategory(null);
    }
  }, [pendingCategory, taskId, startSession]);

  // Cancel category change
  const cancelCategoryChange = useCallback(() => {
    setShowCategoryWarning(false);
    setPendingCategory(null);
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    resetSession();
    onClose();
  }, [resetSession, onClose]);

  // Handle complete
  const handleComplete = useCallback(async () => {
    try {
      await completeSession(taskId);
      onComplete();
      handleClose();
    } catch {
      // Error is handled by the store
    }
  }, [taskId, completeSession, onComplete, handleClose]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (currentStep === questions.length - 1) {
      handleComplete();
    } else {
      nextStep();
    }
  }, [currentStep, questions.length, nextStep, handleComplete]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto
                      bg-white rounded-xl shadow-2xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <h2 id="qa-modal-title" className="text-xl font-semibold text-gray-900">
              Design Questionnaire
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg
                         hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {/* Category selector */}
              <CategorySelector
                selected={selectedCategory || initialCategory}
                onChange={handleCategoryChange}
                disabled={isLoading}
              />

              {/* Progress indicator */}
              {questions.length > 0 && (
                <ProgressIndicator
                  currentStep={currentStep}
                  totalSteps={questions.length}
                  completedSteps={completedSteps}
                  onStepClick={(step) => {
                    // Allow jumping to completed steps or next step
                    if (step <= currentStep || completedSteps.includes(step - 1)) {
                      useQAStore.setState({ currentStep: step });
                    }
                  }}
                />
              )}

              {/* Current question */}
              {currentQuestion && (
                <QuestionStep
                  question={currentQuestion}
                  answer={answers[currentQuestion.id] || ''}
                  onChange={(value) => setAnswer(currentQuestion.id, value)}
                  onNext={handleNext}
                  onPrev={prevStep}
                  isFirst={currentStep === 0}
                  isLast={currentStep === questions.length - 1}
                  isValid={isCurrentStepValid()}
                />
              )}
            </>
          )}
        </div>

        {/* Category change warning modal */}
        {showCategoryWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/30"
              onClick={cancelCategoryChange}
            />
            <div className="relative z-10 bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Changing category will reset your answers
              </h3>
              <p className="text-gray-600 mb-4">
                You have existing answers that will be lost. Are you sure you want to continue?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelCategoryChange}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg
                             hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmCategoryChange}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg
                             hover:bg-red-600 transition-colors"
                >
                  Change Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
