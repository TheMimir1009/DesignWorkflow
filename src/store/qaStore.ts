/**
<<<<<<< HEAD
 * QA Store - Zustand State Management
 * Centralized state management for Q&A sessions and questions
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Question, QASession, QAStore } from '../types/qa';
import * as qaService from '../services/qaService';

/**
 * QA store with Zustand
=======
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
>>>>>>> main
 */
export const useQAStore = create<QAStore>()(
  devtools(
    (set, get) => ({
      // Initial state
<<<<<<< HEAD
      questions: [],
      categories: [],
      currentSession: null,
      sessions: [],
      selectedCategoryId: null,
      isLoading: false,
      error: null,
      isModalOpen: false,

      // Actions
      loadQuestions: async () => {
        set({ isLoading: true, error: null }, false, 'loadQuestions/start');
        try {
          const questions = await qaService.getQuestions();
          set({
            questions,
            isLoading: false,
            error: null,
          }, false, 'loadQuestions/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'loadQuestions/error');
        }
      },

=======
      ...initialState,

      // Actions
>>>>>>> main
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
<<<<<<< HEAD
            error: error instanceof Error ? error.message : 'Unknown error',
=======
            error: error instanceof Error ? error.message : 'Failed to load categories',
>>>>>>> main
          }, false, 'loadCategories/error');
        }
      },

<<<<<<< HEAD
      startSession: async (taskId: string, projectId: string) => {
        set({ isLoading: true, error: null }, false, 'startSession/start');
        try {
          const session = await qaService.createSession({ taskId, projectId });
          const { sessions } = get();
          set({
            currentSession: session,
            sessions: [...sessions, session],
            isLoading: false,
            error: null,
          }, false, 'startSession/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
=======
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
>>>>>>> main
          }, false, 'startSession/error');
        }
      },

<<<<<<< HEAD
      updateAnswer: (questionId: string, answer: string) => {
        const { currentSession } = get();

        if (!currentSession) {
          return; // No current session, do nothing
        }

        const updatedSession: QASession = {
          ...currentSession,
          answers: {
            ...currentSession.answers,
            [questionId]: answer,
          },
          updatedAt: new Date().toISOString(),
        };

        set({ currentSession: updatedSession }, false, 'updateAnswer');
      },

      completeSession: async () => {
        const { currentSession } = get();

        if (!currentSession) {
          return; // No current session, do nothing
        }

        set({ isLoading: true, error: null }, false, 'completeSession/start');
        try {
          const completedSession = await qaService.completeSession(currentSession.id);
          const { sessions } = get();
          const updatedSessions = sessions.map((s) =>
            s.id === currentSession.id ? completedSession : s
          );
          set({
            currentSession: completedSession,
            sessions: updatedSessions,
            isLoading: false,
            error: null,
          }, false, 'completeSession/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'completeSession/error');
        }
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null }, false, 'loadSession/start');
        try {
          const session = await qaService.getSession(sessionId);
          set({
            currentSession: session,
            isLoading: false,
            error: null,
          }, false, 'loadSession/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'loadSession/error');
        }
      },

      selectCategory: (categoryId: string | null) => {
        set({ selectedCategoryId: categoryId }, false, 'selectCategory');
      },

      getQuestionsByCategory: (categoryId: string): Question[] => {
        const { questions } = get();
        return questions
          .filter((q) => q.categoryId === categoryId)
          .sort((a, b) => a.order - b.order);
      },

      calculateProgress: (): number => {
        const { currentSession, questions } = get();

        if (!currentSession || questions.length === 0) {
          return 0;
        }

        const requiredQuestions = questions.filter((q) => q.isRequired);

        if (requiredQuestions.length === 0) {
          return 0;
        }

        const answeredRequired = requiredQuestions.filter(
          (q) => currentSession.answers[q.id] && currentSession.answers[q.id].trim() !== ''
        );

        return Math.round((answeredRequired.length / requiredQuestions.length) * 100 * 100) / 100;
      },

      openModal: () => {
        set({ isModalOpen: true }, false, 'openModal');
      },

      closeModal: () => {
        set({ isModalOpen: false }, false, 'closeModal');
=======
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
>>>>>>> main
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },
    }),
    { name: 'QAStore' }
  )
);
