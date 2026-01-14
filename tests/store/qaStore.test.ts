/**
 * QA Store Tests
 * TDD test suite for QA Zustand state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import type { Question, QASession, QACategory } from '../../src/types/qa';

// Mock the qaService module
vi.mock('../../src/services/qaService', () => ({
  getQuestions: vi.fn(),
  getCategories: vi.fn(),
  createSession: vi.fn(),
  updateSession: vi.fn(),
  completeSession: vi.fn(),
  getSession: vi.fn(),
}));

// Import after mocking
import * as qaService from '../../src/services/qaService';
import { useQAStore } from '../../src/store/qaStore';

// Test data factories
const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'q-1',
  categoryId: 'game-mechanic',
  order: 1,
  text: 'What is the core gameplay loop?',
  helpText: 'Describe the main actions players repeat',
  isRequired: true,
  inputType: 'textarea',
  options: null,
  ...overrides,
});

const createMockCategory = (overrides: Partial<QACategory> = {}): QACategory => ({
  id: 'game-mechanic',
  name: 'Game Mechanics',
  description: 'Core gameplay mechanics and systems',
  order: 1,
  questionCount: 5,
  ...overrides,
});

const createMockSession = (overrides: Partial<QASession> = {}): QASession => ({
  id: 'session-1',
  taskId: 'task-1',
  projectId: 'project-1',
  answers: {},
  completedCategories: [],
  isComplete: false,
  progress: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('qaStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    useQAStore.setState({
      questions: [],
      categories: [],
      currentSession: null,
      sessions: [],
      selectedCategoryId: null,
      isLoading: false,
      error: null,
      isModalOpen: false,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useQAStore.getState();

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

  describe('loadQuestions', () => {
    it('should fetch and set questions successfully', async () => {
      const mockQuestions = [
        createMockQuestion({ id: 'q-1', order: 1 }),
        createMockQuestion({ id: 'q-2', order: 2 }),
      ];
      vi.mocked(qaService.getQuestions).mockResolvedValueOnce(mockQuestions);

      await act(async () => {
        await useQAStore.getState().loadQuestions();
      });

      const state = useQAStore.getState();
      expect(state.questions).toEqual(mockQuestions);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state while fetching', async () => {
      vi.mocked(qaService.getQuestions).mockImplementation(() => {
        expect(useQAStore.getState().isLoading).toBe(true);
        return Promise.resolve([]);
      });

      await act(async () => {
        await useQAStore.getState().loadQuestions();
      });

      expect(useQAStore.getState().isLoading).toBe(false);
    });

    it('should set error state when fetch fails', async () => {
      vi.mocked(qaService.getQuestions).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useQAStore.getState().loadQuestions();
      });

      const state = useQAStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadCategories', () => {
    it('should fetch and set categories successfully', async () => {
      const mockCategories = [
        createMockCategory({ id: 'game-mechanic', order: 1 }),
        createMockCategory({ id: 'economy', order: 2 }),
      ];
      vi.mocked(qaService.getCategories).mockResolvedValueOnce(mockCategories);

      await act(async () => {
        await useQAStore.getState().loadCategories();
      });

      const state = useQAStore.getState();
      expect(state.categories).toEqual(mockCategories);
      expect(state.error).toBeNull();
    });

    it('should set error state when fetch fails', async () => {
      vi.mocked(qaService.getCategories).mockRejectedValueOnce(new Error('Failed to load categories'));

      await act(async () => {
        await useQAStore.getState().loadCategories();
      });

      const state = useQAStore.getState();
      expect(state.error).toBe('Failed to load categories');
    });
  });

  describe('startSession', () => {
    it('should create a new session successfully', async () => {
      const mockSession = createMockSession({
        id: 'new-session',
        taskId: 'task-1',
        projectId: 'project-1',
      });
      vi.mocked(qaService.createSession).mockResolvedValueOnce(mockSession);

      await act(async () => {
        await useQAStore.getState().startSession('task-1', 'project-1');
      });

      const state = useQAStore.getState();
      expect(state.currentSession).toEqual(mockSession);
      expect(state.sessions).toContainEqual(mockSession);
      expect(state.error).toBeNull();
    });

    it('should set error state when session creation fails', async () => {
      vi.mocked(qaService.createSession).mockRejectedValueOnce(new Error('Failed to create session'));

      await act(async () => {
        await useQAStore.getState().startSession('task-1', 'project-1');
      });

      const state = useQAStore.getState();
      expect(state.error).toBe('Failed to create session');
      expect(state.currentSession).toBeNull();
    });
  });

  describe('updateAnswer', () => {
    it('should update answer in current session optimistically', () => {
      const mockSession = createMockSession({ id: 'session-1', answers: {} });
      useQAStore.setState({ currentSession: mockSession });

      act(() => {
        useQAStore.getState().updateAnswer('q-1', 'My answer');
      });

      const state = useQAStore.getState();
      expect(state.currentSession?.answers['q-1']).toBe('My answer');
    });

    it('should update existing answer', () => {
      const mockSession = createMockSession({
        id: 'session-1',
        answers: { 'q-1': 'Old answer' },
      });
      useQAStore.setState({ currentSession: mockSession });

      act(() => {
        useQAStore.getState().updateAnswer('q-1', 'New answer');
      });

      const state = useQAStore.getState();
      expect(state.currentSession?.answers['q-1']).toBe('New answer');
    });

    it('should not modify state when no current session', () => {
      useQAStore.setState({ currentSession: null });

      act(() => {
        useQAStore.getState().updateAnswer('q-1', 'Answer');
      });

      expect(useQAStore.getState().currentSession).toBeNull();
    });
  });

  describe('completeSession', () => {
    it('should complete session successfully', async () => {
      const mockSession = createMockSession({
        id: 'session-1',
        answers: { 'q-1': 'Answer 1' },
      });
      useQAStore.setState({ currentSession: mockSession });

      const completedSession = createMockSession({
        ...mockSession,
        isComplete: true,
        progress: 100,
      });
      vi.mocked(qaService.completeSession).mockResolvedValueOnce(completedSession);

      await act(async () => {
        await useQAStore.getState().completeSession();
      });

      const state = useQAStore.getState();
      expect(state.currentSession?.isComplete).toBe(true);
      expect(state.currentSession?.progress).toBe(100);
    });

    it('should not complete when no current session', async () => {
      useQAStore.setState({ currentSession: null });

      await act(async () => {
        await useQAStore.getState().completeSession();
      });

      expect(qaService.completeSession).not.toHaveBeenCalled();
    });

    it('should set error state when completion fails', async () => {
      const mockSession = createMockSession({ id: 'session-1' });
      useQAStore.setState({ currentSession: mockSession });

      vi.mocked(qaService.completeSession).mockRejectedValueOnce(new Error('Completion failed'));

      await act(async () => {
        await useQAStore.getState().completeSession();
      });

      const state = useQAStore.getState();
      expect(state.error).toBe('Completion failed');
    });
  });

  describe('loadSession', () => {
    it('should load session by id', async () => {
      const mockSession = createMockSession({ id: 'session-1' });
      vi.mocked(qaService.getSession).mockResolvedValueOnce(mockSession);

      await act(async () => {
        await useQAStore.getState().loadSession('session-1');
      });

      const state = useQAStore.getState();
      expect(state.currentSession).toEqual(mockSession);
    });

    it('should set error when session not found', async () => {
      vi.mocked(qaService.getSession).mockRejectedValueOnce(new Error('Session not found'));

      await act(async () => {
        await useQAStore.getState().loadSession('non-existent');
      });

      const state = useQAStore.getState();
      expect(state.error).toBe('Session not found');
    });
  });

  describe('selectCategory', () => {
    it('should set selected category id', () => {
      act(() => {
        useQAStore.getState().selectCategory('game-mechanic');
      });

      expect(useQAStore.getState().selectedCategoryId).toBe('game-mechanic');
    });

    it('should clear selected category when null', () => {
      useQAStore.setState({ selectedCategoryId: 'game-mechanic' });

      act(() => {
        useQAStore.getState().selectCategory(null);
      });

      expect(useQAStore.getState().selectedCategoryId).toBeNull();
    });
  });

  describe('getQuestionsByCategory', () => {
    it('should return questions filtered by category', () => {
      const questions = [
        createMockQuestion({ id: 'q-1', categoryId: 'game-mechanic' }),
        createMockQuestion({ id: 'q-2', categoryId: 'economy' }),
        createMockQuestion({ id: 'q-3', categoryId: 'game-mechanic' }),
      ];
      useQAStore.setState({ questions });

      const result = useQAStore.getState().getQuestionsByCategory('game-mechanic');

      expect(result).toHaveLength(2);
      expect(result.every(q => q.categoryId === 'game-mechanic')).toBe(true);
    });

    it('should return empty array when no questions match', () => {
      const questions = [createMockQuestion({ id: 'q-1', categoryId: 'game-mechanic' })];
      useQAStore.setState({ questions });

      const result = useQAStore.getState().getQuestionsByCategory('economy');

      expect(result).toEqual([]);
    });

    it('should return questions sorted by order', () => {
      const questions = [
        createMockQuestion({ id: 'q-3', categoryId: 'game-mechanic', order: 3 }),
        createMockQuestion({ id: 'q-1', categoryId: 'game-mechanic', order: 1 }),
        createMockQuestion({ id: 'q-2', categoryId: 'game-mechanic', order: 2 }),
      ];
      useQAStore.setState({ questions });

      const result = useQAStore.getState().getQuestionsByCategory('game-mechanic');

      expect(result[0].order).toBe(1);
      expect(result[1].order).toBe(2);
      expect(result[2].order).toBe(3);
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 when no current session', () => {
      useQAStore.setState({ currentSession: null, questions: [] });

      const progress = useQAStore.getState().calculateProgress();

      expect(progress).toBe(0);
    });

    it('should return 0 when no questions', () => {
      const mockSession = createMockSession({ answers: {} });
      useQAStore.setState({ currentSession: mockSession, questions: [] });

      const progress = useQAStore.getState().calculateProgress();

      expect(progress).toBe(0);
    });

    it('should calculate progress based on required questions answered', () => {
      const questions = [
        createMockQuestion({ id: 'q-1', isRequired: true }),
        createMockQuestion({ id: 'q-2', isRequired: true }),
        createMockQuestion({ id: 'q-3', isRequired: false }),
        createMockQuestion({ id: 'q-4', isRequired: true }),
      ];
      const mockSession = createMockSession({
        answers: { 'q-1': 'Answer 1', 'q-2': 'Answer 2' },
      });
      useQAStore.setState({ currentSession: mockSession, questions });

      const progress = useQAStore.getState().calculateProgress();

      // 2 of 3 required questions answered = 66.67%
      expect(progress).toBeCloseTo(66.67, 0);
    });

    it('should return 100 when all required questions answered', () => {
      const questions = [
        createMockQuestion({ id: 'q-1', isRequired: true }),
        createMockQuestion({ id: 'q-2', isRequired: true }),
      ];
      const mockSession = createMockSession({
        answers: { 'q-1': 'Answer 1', 'q-2': 'Answer 2' },
      });
      useQAStore.setState({ currentSession: mockSession, questions });

      const progress = useQAStore.getState().calculateProgress();

      expect(progress).toBe(100);
    });
  });

  describe('modal state management', () => {
    it('should have initial modal state closed', () => {
      expect(useQAStore.getState().isModalOpen).toBe(false);
    });

    it('should open modal', () => {
      act(() => {
        useQAStore.getState().openModal();
      });

      expect(useQAStore.getState().isModalOpen).toBe(true);
    });

    it('should close modal', () => {
      useQAStore.setState({ isModalOpen: true });

      act(() => {
        useQAStore.getState().closeModal();
      });

      expect(useQAStore.getState().isModalOpen).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      useQAStore.setState({ error: 'Some error' });

      act(() => {
        useQAStore.getState().clearError();
      });

      expect(useQAStore.getState().error).toBeNull();
    });
  });
});
