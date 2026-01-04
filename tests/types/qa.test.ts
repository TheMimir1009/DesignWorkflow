/**
 * QA Types Tests
 * TDD test suite for Q&A system type definitions
 */
import { describe, it, expect } from 'vitest';
import type {
  Question,
  QASession,
  QACategory,
  QAStore,
  QAStoreState,
  QAStoreActions,
  CreateQASessionDto,
  UpdateQASessionDto,
} from '../../src/types/qa';

describe('QA Types', () => {
  describe('Question interface', () => {
    it('should have required properties', () => {
      const question: Question = {
        id: 'q-1',
        categoryId: 'game-mechanic',
        order: 1,
        text: 'What is the core gameplay loop?',
        helpText: 'Describe the main actions players repeat',
        isRequired: true,
        inputType: 'textarea',
        options: null,
      };

      expect(question.id).toBe('q-1');
      expect(question.categoryId).toBe('game-mechanic');
      expect(question.order).toBe(1);
      expect(question.text).toBe('What is the core gameplay loop?');
      expect(question.helpText).toBe('Describe the main actions players repeat');
      expect(question.isRequired).toBe(true);
      expect(question.inputType).toBe('textarea');
      expect(question.options).toBeNull();
    });

    it('should support different input types', () => {
      const textQuestion: Question = {
        id: 'q-2',
        categoryId: 'game-mechanic',
        order: 2,
        text: 'Game title?',
        helpText: null,
        isRequired: true,
        inputType: 'text',
        options: null,
      };

      const selectQuestion: Question = {
        id: 'q-3',
        categoryId: 'game-mechanic',
        order: 3,
        text: 'Target platform?',
        helpText: 'Select primary platform',
        isRequired: true,
        inputType: 'select',
        options: ['PC', 'Console', 'Mobile'],
      };

      expect(textQuestion.inputType).toBe('text');
      expect(selectQuestion.inputType).toBe('select');
      expect(selectQuestion.options).toEqual(['PC', 'Console', 'Mobile']);
    });
  });

  describe('QACategory interface', () => {
    it('should have required properties', () => {
      const category: QACategory = {
        id: 'game-mechanic',
        name: 'Game Mechanics',
        description: 'Core gameplay mechanics and systems',
        order: 1,
        questionCount: 5,
      };

      expect(category.id).toBe('game-mechanic');
      expect(category.name).toBe('Game Mechanics');
      expect(category.description).toBe('Core gameplay mechanics and systems');
      expect(category.order).toBe(1);
      expect(category.questionCount).toBe(5);
    });
  });

  describe('QASession interface', () => {
    it('should have required properties', () => {
      const session: QASession = {
        id: 'session-1',
        taskId: 'task-1',
        projectId: 'project-1',
        answers: {
          'q-1': 'Players collect resources and build structures',
          'q-2': 'Adventure Game',
        },
        completedCategories: ['game-mechanic'],
        isComplete: false,
        progress: 40,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      expect(session.id).toBe('session-1');
      expect(session.taskId).toBe('task-1');
      expect(session.projectId).toBe('project-1');
      expect(session.answers['q-1']).toBe('Players collect resources and build structures');
      expect(session.completedCategories).toContain('game-mechanic');
      expect(session.isComplete).toBe(false);
      expect(session.progress).toBe(40);
    });

    it('should track completion status', () => {
      const completedSession: QASession = {
        id: 'session-2',
        taskId: 'task-2',
        projectId: 'project-1',
        answers: {
          'q-1': 'Answer 1',
          'q-2': 'Answer 2',
          'q-3': 'Answer 3',
        },
        completedCategories: ['game-mechanic', 'economy', 'growth'],
        isComplete: true,
        progress: 100,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      };

      expect(completedSession.isComplete).toBe(true);
      expect(completedSession.progress).toBe(100);
      expect(completedSession.completedCategories).toHaveLength(3);
    });
  });

  describe('QAStoreState interface', () => {
    it('should have all required state properties', () => {
      const state: QAStoreState = {
        questions: [],
        categories: [],
        currentSession: null,
        sessions: [],
        selectedCategoryId: null,
        isLoading: false,
        error: null,
        isModalOpen: false,
      };

      expect(state.questions).toEqual([]);
      expect(state.categories).toEqual([]);
      expect(state.currentSession).toBeNull();
      expect(state.sessions).toEqual([]);
      expect(state.selectedCategoryId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isModalOpen).toBe(false);
    });
  });

  describe('QAStoreActions interface', () => {
    it('should define all action signatures', () => {
      // Type checking test - verify actions interface structure
      const mockActions: QAStoreActions = {
        loadQuestions: async () => {},
        loadCategories: async () => {},
        startSession: async () => {},
        updateAnswer: () => {},
        completeSession: async () => {},
        loadSession: async () => {},
        selectCategory: () => {},
        getQuestionsByCategory: () => [],
        calculateProgress: () => 0,
        openModal: () => {},
        closeModal: () => {},
        clearError: () => {},
      };

      expect(typeof mockActions.loadQuestions).toBe('function');
      expect(typeof mockActions.loadCategories).toBe('function');
      expect(typeof mockActions.startSession).toBe('function');
      expect(typeof mockActions.updateAnswer).toBe('function');
      expect(typeof mockActions.completeSession).toBe('function');
      expect(typeof mockActions.loadSession).toBe('function');
      expect(typeof mockActions.selectCategory).toBe('function');
      expect(typeof mockActions.getQuestionsByCategory).toBe('function');
      expect(typeof mockActions.calculateProgress).toBe('function');
      expect(typeof mockActions.openModal).toBe('function');
      expect(typeof mockActions.closeModal).toBe('function');
      expect(typeof mockActions.clearError).toBe('function');
    });
  });

  describe('QAStore type', () => {
    it('should combine state and actions', () => {
      // Type checking test - verify QAStore combines both interfaces
      const mockStore: QAStore = {
        // State
        questions: [],
        categories: [],
        currentSession: null,
        sessions: [],
        selectedCategoryId: null,
        isLoading: false,
        error: null,
        isModalOpen: false,
        // Actions
        loadQuestions: async () => {},
        loadCategories: async () => {},
        startSession: async () => {},
        updateAnswer: () => {},
        completeSession: async () => {},
        loadSession: async () => {},
        selectCategory: () => {},
        getQuestionsByCategory: () => [],
        calculateProgress: () => 0,
        openModal: () => {},
        closeModal: () => {},
        clearError: () => {},
      };

      // Verify it has both state and action properties
      expect('questions' in mockStore).toBe(true);
      expect('loadQuestions' in mockStore).toBe(true);
    });
  });

  describe('CreateQASessionDto interface', () => {
    it('should have required properties for session creation', () => {
      const createDto: CreateQASessionDto = {
        taskId: 'task-1',
        projectId: 'project-1',
      };

      expect(createDto.taskId).toBe('task-1');
      expect(createDto.projectId).toBe('project-1');
    });
  });

  describe('UpdateQASessionDto interface', () => {
    it('should have optional properties for session update', () => {
      const updateDto: UpdateQASessionDto = {
        answers: { 'q-1': 'Updated answer' },
      };

      expect(updateDto.answers).toEqual({ 'q-1': 'Updated answer' });
    });

    it('should allow updating multiple fields', () => {
      const updateDto: UpdateQASessionDto = {
        answers: { 'q-1': 'Answer 1', 'q-2': 'Answer 2' },
        completedCategories: ['game-mechanic'],
      };

      expect(updateDto.answers).toBeDefined();
      expect(updateDto.completedCategories).toEqual(['game-mechanic']);
    });
  });
});
