/**
 * QA Store - Zustand State Management
 * Centralized state management for Q&A sessions and questions
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Question, QASession, QAStore } from '../types/qa';
import * as qaService from '../services/qaService';

/**
 * QA store with Zustand
 */
export const useQAStore = create<QAStore>()(
  devtools(
    (set, get) => ({
      // Initial state
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
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'loadCategories/error');
        }
      },

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
          }, false, 'startSession/error');
        }
      },

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
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },
    }),
    { name: 'QAStore' }
  )
);
