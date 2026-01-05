/**
 * Q&A Store - Zustand State Management
 * Centralized state management for Q&A system
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  QACategory,
  Question,
  QASession,
  QASessionAnswer,
} from '../types/qa';
import * as qaService from '../services/qaService';
import type { CategoryDefinition, GenerateDesignResponse } from '../services/qaService';

/**
 * Q&A store state interface
 */
export interface QAStoreState {
  currentSession: QASession | null;
  questions: Question[];
  categories: CategoryDefinition[];
  currentStep: number;
  answers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  selectedCategory: QACategory | null;
}

/**
 * Q&A store actions interface
 */
export interface QAStoreActions {
  loadCategories: () => Promise<void>;
  loadQuestions: (category: QACategory) => Promise<void>;
  startSession: (taskId: string, category: QACategory) => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeSession: (taskId: string) => Promise<GenerateDesignResponse>;
  resetSession: () => void;
  getCurrentQuestion: () => Question | undefined;
  isCurrentStepValid: () => boolean;
  clearError: () => void;
}

/**
 * Combined Q&A store type
 */
export type QAStore = QAStoreState & QAStoreActions;

/**
 * Initial state
 */
const initialState: QAStoreState = {
  currentSession: null,
  questions: [],
  categories: [],
  currentStep: 0,
  answers: {},
  isLoading: false,
  error: null,
  selectedCategory: null,
};

/**
 * Q&A Store with Zustand
 */
export const useQAStore = create<QAStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      loadCategories: async () => {
        set({ isLoading: true, error: null }, false, 'loadCategories/start');
        try {
          const categories = await qaService.getCategories();
          set({
            categories,
            isLoading: false,
            error: null,
          }, false, 'loadCategories/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load categories',
          }, false, 'loadCategories/error');
        }
      },

      loadQuestions: async (category: QACategory) => {
        set({ isLoading: true, error: null }, false, 'loadQuestions/start');
        try {
          const template = await qaService.getQuestions(category);
          set({
            questions: template.questions,
            selectedCategory: category,
            isLoading: false,
            error: null,
          }, false, 'loadQuestions/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load questions',
          }, false, 'loadQuestions/error');
        }
      },

      startSession: async (taskId: string, category: QACategory) => {
        set({ isLoading: true, error: null }, false, 'startSession/start');
        try {
          // Check for existing session
          const existingSession = await qaService.getQASession(taskId);

          // Load questions for the category
          const template = await qaService.getQuestions(category);

          if (existingSession && existingSession.category === category) {
            // Resume existing session
            const answersMap: Record<string, string> = {};
            existingSession.answers.forEach((a) => {
              answersMap[a.questionId] = a.answer;
            });

            set({
              currentSession: existingSession,
              questions: template.questions,
              selectedCategory: category,
              currentStep: existingSession.currentStep,
              answers: answersMap,
              isLoading: false,
              error: null,
            }, false, 'startSession/resume');
          } else {
            // Start new session
            set({
              currentSession: null,
              questions: template.questions,
              selectedCategory: category,
              currentStep: 0,
              answers: {},
              isLoading: false,
              error: null,
            }, false, 'startSession/new');
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to start session',
          }, false, 'startSession/error');
        }
      },

      setAnswer: (questionId: string, answer: string) => {
        const { answers } = get();
        set({
          answers: { ...answers, [questionId]: answer },
        }, false, 'setAnswer');
      },

      nextStep: () => {
        const { currentStep, questions } = get();
        if (currentStep < questions.length) {
          set({ currentStep: currentStep + 1 }, false, 'nextStep');
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 }, false, 'prevStep');
        }
      },

      completeSession: async (taskId: string) => {
        const { selectedCategory, answers, currentStep } = get();

        if (!selectedCategory) {
          throw new Error('No category selected');
        }

        set({ isLoading: true, error: null }, false, 'completeSession/start');

        try {
          // Convert answers to session format
          const sessionAnswers: QASessionAnswer[] = Object.entries(answers).map(
            ([questionId, answer]) => ({
              questionId,
              answer,
              answeredAt: new Date().toISOString(),
            })
          );

          // Save session as complete
          await qaService.saveQAAnswers(
            taskId,
            selectedCategory,
            sessionAnswers,
            currentStep,
            true
          );

          // Trigger design generation
          const result = await qaService.triggerDesignGeneration(taskId);

          set({ isLoading: false }, false, 'completeSession/success');

          return result;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to complete session',
          }, false, 'completeSession/error');
          throw error;
        }
      },

      resetSession: () => {
        set({
          currentSession: null,
          questions: [],
          currentStep: 0,
          answers: {},
          selectedCategory: null,
          error: null,
        }, false, 'resetSession');
      },

      getCurrentQuestion: () => {
        const { questions, currentStep } = get();
        return questions[currentStep];
      },

      isCurrentStepValid: () => {
        const { questions, currentStep, answers } = get();
        const question = questions[currentStep];

        if (!question) {
          return false;
        }

        if (!question.required) {
          return true;
        }

        const answer = answers[question.id];
        return Boolean(answer && answer.trim().length > 0);
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },
    }),
    { name: 'QAStore' }
  )
);
