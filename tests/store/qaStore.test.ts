/**
 * Q&A Store Tests
 * TDD tests for Zustand Q&A state management
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useQAStore } from '../../src/store/qaStore';
import type { QACategory, Question, QASession, QuestionTemplate } from '../../src/types/qa';

// Mock the qaService
vi.mock('../../src/services/qaService', () => ({
  getQuestions: vi.fn(),
  getCategories: vi.fn(),
  saveQAAnswers: vi.fn(),
  getQASession: vi.fn(),
  triggerDesignGeneration: vi.fn(),
}));

import * as qaService from '../../src/services/qaService';

describe('Q&A Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useQAStore.setState({
      currentSession: null,
      questions: [],
      categories: [],
      currentStep: 0,
      answers: {},
      isLoading: false,
      error: null,
      selectedCategory: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useQAStore.getState();

      expect(state.currentSession).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.categories).toEqual([]);
      expect(state.currentStep).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.selectedCategory).toBeNull();
    });
  });

  describe('loadCategories', () => {
    it('should load categories from API', async () => {
      const mockCategories = [
        { id: 'economy', name: 'Economy System', description: 'Economy' },
        { id: 'game_mechanic', name: 'Game Mechanics', description: 'Gameplay' },
        { id: 'growth', name: 'Growth', description: 'Progression' },
      ];

      vi.mocked(qaService.getCategories).mockResolvedValueOnce(mockCategories);

      await useQAStore.getState().loadCategories();

      const state = useQAStore.getState();
      expect(state.categories).toHaveLength(3);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle API error', async () => {
      vi.mocked(qaService.getCategories).mockRejectedValueOnce(new Error('API Error'));

      await useQAStore.getState().loadCategories();

      const state = useQAStore.getState();
      expect(state.error).toBe('API Error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadQuestions', () => {
    it('should load questions for a category', async () => {
      const mockTemplate: QuestionTemplate = {
        id: 'game_mechanic',
        category: 'game_mechanic',
        categoryName: 'Game Mechanics',
        categoryDescription: 'Core gameplay',
        version: '1.0.0',
        questions: [
          {
            id: 'gm-001',
            order: 1,
            text: 'What is the core loop?',
            description: null,
            inputType: 'textarea',
            required: true,
            placeholder: null,
            maxLength: 2000,
            options: null,
          },
        ],
      };

      vi.mocked(qaService.getQuestions).mockResolvedValueOnce(mockTemplate);

      await useQAStore.getState().loadQuestions('game_mechanic');

      const state = useQAStore.getState();
      expect(state.questions).toHaveLength(1);
      expect(state.selectedCategory).toBe('game_mechanic');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('startSession', () => {
    it('should start a new Q&A session', async () => {
      const mockTemplate: QuestionTemplate = {
        id: 'economy',
        category: 'economy',
        categoryName: 'Economy',
        categoryDescription: 'Economy system',
        version: '1.0.0',
        questions: [
          {
            id: 'ec-001',
            order: 1,
            text: 'What currencies?',
            description: null,
            inputType: 'textarea',
            required: true,
            placeholder: null,
            maxLength: 2000,
            options: null,
          },
        ],
      };

      vi.mocked(qaService.getQuestions).mockResolvedValueOnce(mockTemplate);
      vi.mocked(qaService.getQASession).mockResolvedValueOnce(null);

      await useQAStore.getState().startSession('task-001', 'economy');

      const state = useQAStore.getState();
      expect(state.selectedCategory).toBe('economy');
      expect(state.questions).toHaveLength(1);
      expect(state.currentStep).toBe(0);
    });

    it('should resume existing session', async () => {
      const mockSession: QASession = {
        id: 'session-001',
        taskId: 'task-001',
        category: 'game_mechanic',
        status: 'in_progress',
        currentStep: 2,
        answers: [
          { questionId: 'gm-001', answer: 'Core loop', answeredAt: '2024-01-01T00:00:00Z' },
          { questionId: 'gm-002', answer: 'Actions', answeredAt: '2024-01-01T00:01:00Z' },
        ],
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: null,
      };

      const mockTemplate: QuestionTemplate = {
        id: 'game_mechanic',
        category: 'game_mechanic',
        categoryName: 'Game Mechanics',
        categoryDescription: 'Core gameplay',
        version: '1.0.0',
        questions: [
          { id: 'gm-001', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
          { id: 'gm-002', order: 2, text: 'Q2', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
          { id: 'gm-003', order: 3, text: 'Q3', description: null, inputType: 'textarea', required: false, placeholder: null, maxLength: 2000, options: null },
        ],
      };

      vi.mocked(qaService.getQASession).mockResolvedValueOnce(mockSession);
      vi.mocked(qaService.getQuestions).mockResolvedValueOnce(mockTemplate);

      await useQAStore.getState().startSession('task-001', 'game_mechanic');

      const state = useQAStore.getState();
      expect(state.currentSession).toEqual(mockSession);
      expect(state.currentStep).toBe(2);
      expect(state.answers['gm-001']).toBe('Core loop');
      expect(state.answers['gm-002']).toBe('Actions');
    });
  });

  describe('setAnswer', () => {
    it('should update answer for a question', () => {
      useQAStore.getState().setAnswer('gm-001', 'My answer');

      const state = useQAStore.getState();
      expect(state.answers['gm-001']).toBe('My answer');
    });

    it('should update existing answer', () => {
      useQAStore.setState({ answers: { 'gm-001': 'Old answer' } });
      useQAStore.getState().setAnswer('gm-001', 'New answer');

      const state = useQAStore.getState();
      expect(state.answers['gm-001']).toBe('New answer');
    });
  });

  describe('nextStep', () => {
    it('should advance to next step', () => {
      useQAStore.setState({
        questions: [
          { id: 'q1', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
          { id: 'q2', order: 2, text: 'Q2', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
        ],
        currentStep: 0,
      });

      useQAStore.getState().nextStep();

      expect(useQAStore.getState().currentStep).toBe(1);
    });

    it('should not exceed total steps', () => {
      useQAStore.setState({
        questions: [
          { id: 'q1', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
        ],
        currentStep: 0,
      });

      useQAStore.getState().nextStep();
      useQAStore.getState().nextStep();

      expect(useQAStore.getState().currentStep).toBe(1);
    });
  });

  describe('prevStep', () => {
    it('should go back to previous step', () => {
      useQAStore.setState({ currentStep: 2 });

      useQAStore.getState().prevStep();

      expect(useQAStore.getState().currentStep).toBe(1);
    });

    it('should not go below zero', () => {
      useQAStore.setState({ currentStep: 0 });

      useQAStore.getState().prevStep();

      expect(useQAStore.getState().currentStep).toBe(0);
    });
  });

  describe('completeSession', () => {
    it('should complete session and trigger design generation', async () => {
      const mockSaveResponse = {
        sessionId: 'session-001',
        session: {
          id: 'session-001',
          taskId: 'task-001',
          category: 'game_mechanic' as QACategory,
          status: 'completed' as const,
          currentStep: 3,
          answers: [],
          startedAt: '2024-01-01T00:00:00Z',
          completedAt: '2024-01-01T01:00:00Z',
        },
      };

      const mockGenerateResponse = {
        message: 'Design generated',
        task: { id: 'task-001', status: 'design', designDocument: 'Doc' },
      };

      vi.mocked(qaService.saveQAAnswers).mockResolvedValueOnce(mockSaveResponse);
      vi.mocked(qaService.triggerDesignGeneration).mockResolvedValueOnce(mockGenerateResponse);

      useQAStore.setState({
        selectedCategory: 'game_mechanic',
        questions: [
          { id: 'gm-001', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
        ],
        answers: { 'gm-001': 'My answer' },
        currentStep: 1,
      });

      const result = await useQAStore.getState().completeSession('task-001');

      expect(qaService.saveQAAnswers).toHaveBeenCalled();
      expect(qaService.triggerDesignGeneration).toHaveBeenCalledWith('task-001');
      expect(result).toEqual(mockGenerateResponse);
    });
  });

  describe('resetSession', () => {
    it('should reset all session state', () => {
      useQAStore.setState({
        currentSession: { id: 'test' } as QASession,
        questions: [{ id: 'q1' }] as Question[],
        currentStep: 5,
        answers: { q1: 'answer' },
        selectedCategory: 'economy',
      });

      useQAStore.getState().resetSession();

      const state = useQAStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.currentStep).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.selectedCategory).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return current question', () => {
      useQAStore.setState({
        questions: [
          { id: 'q1', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
          { id: 'q2', order: 2, text: 'Q2', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
        ],
        currentStep: 1,
      });

      const question = useQAStore.getState().getCurrentQuestion();

      expect(question?.id).toBe('q2');
    });

    it('should return undefined for empty questions', () => {
      useQAStore.setState({ questions: [], currentStep: 0 });

      const question = useQAStore.getState().getCurrentQuestion();

      expect(question).toBeUndefined();
    });
  });

  describe('isCurrentStepValid', () => {
    it('should return true when required question is answered', () => {
      useQAStore.setState({
        questions: [
          { id: 'q1', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
        ],
        currentStep: 0,
        answers: { q1: 'My answer' },
      });

      expect(useQAStore.getState().isCurrentStepValid()).toBe(true);
    });

    it('should return false when required question is not answered', () => {
      useQAStore.setState({
        questions: [
          { id: 'q1', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: true, placeholder: null, maxLength: 2000, options: null },
        ],
        currentStep: 0,
        answers: {},
      });

      expect(useQAStore.getState().isCurrentStepValid()).toBe(false);
    });

    it('should return true for optional questions', () => {
      useQAStore.setState({
        questions: [
          { id: 'q1', order: 1, text: 'Q1', description: null, inputType: 'textarea', required: false, placeholder: null, maxLength: 2000, options: null },
        ],
        currentStep: 0,
        answers: {},
      });

      expect(useQAStore.getState().isCurrentStepValid()).toBe(true);
    });
  });
});
