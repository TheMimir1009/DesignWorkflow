/**
<<<<<<< HEAD
 * QA Service Tests
 * TDD test suite for QA API communication layer
=======
 * Q&A Service Tests
 * TDD tests for frontend Q&A API service
>>>>>>> main
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getQuestions,
  getCategories,
<<<<<<< HEAD
  getQuestionsByCategory,
  createSession,
  updateSession,
  getSession,
  completeSession,
  API_BASE_URL,
} from '../../src/services/qaService';
import type { Question, QASession, QACategory, CreateQASessionDto, UpdateQASessionDto } from '../../src/types/qa';
import type { ApiResponse } from '../../src/types';
=======
  saveQAAnswers,
  getQASession,
  triggerDesignGeneration,
} from '../../src/services/qaService';
import type { QACategory, QASessionAnswer } from '../../src/types/qa';
>>>>>>> main

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

<<<<<<< HEAD
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

const createApiResponse = <T>(data: T, success = true, error: string | null = null): ApiResponse<T> => ({
  success,
  data,
  error,
});

describe('qaService', () => {
=======
describe('Q&A Service', () => {
>>>>>>> main
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
<<<<<<< HEAD
    vi.resetAllMocks();
  });

  describe('API_BASE_URL', () => {
    it('should be defined as http://localhost:3001', () => {
      expect(API_BASE_URL).toBe('http://localhost:3001');
    });
  });

  describe('getQuestions', () => {
    it('should fetch all questions successfully', async () => {
      const mockQuestions = [
        createMockQuestion({ id: 'q-1', order: 1 }),
        createMockQuestion({ id: 'q-2', order: 2 }),
      ];
      const mockResponse = createApiResponse(mockQuestions);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getQuestions();

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/questions`);
      expect(result).toEqual(mockQuestions);
    });

    it('should return empty array when no questions exist', async () => {
      const mockResponse = createApiResponse<Question[]>([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getQuestions();

      expect(result).toEqual([]);
    });

    it('should throw error when API returns unsuccessful response', async () => {
      const mockResponse = createApiResponse<Question[] | null>(null, false, 'Server error');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getQuestions()).rejects.toThrow('Server error');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getQuestions()).rejects.toThrow('Network error');
=======
    vi.clearAllMocks();
  });

  describe('getQuestions', () => {
    it('should fetch questions for a category', async () => {
      const mockTemplate = {
        id: 'game_mechanic',
        category: 'game_mechanic',
        categoryName: 'Game Mechanics',
        categoryDescription: 'Core gameplay mechanics',
        version: '1.0.0',
        questions: [
          {
            id: 'gm-001',
            order: 1,
            text: 'What is the core gameplay loop?',
            description: 'Describe the main actions',
            inputType: 'textarea',
            required: true,
            placeholder: null,
            maxLength: 2000,
            options: null,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockTemplate, error: null }),
      });

      const result = await getQuestions('game_mechanic');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/questions/game_mechanic'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTemplate);
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, data: null, error: 'Invalid category' }),
      });

      await expect(getQuestions('invalid' as QACategory)).rejects.toThrow();
>>>>>>> main
    });
  });

  describe('getCategories', () => {
<<<<<<< HEAD
    it('should fetch all categories successfully', async () => {
      const mockCategories = [
        createMockCategory({ id: 'game-mechanic', order: 1 }),
        createMockCategory({ id: 'economy', order: 2 }),
      ];
      const mockResponse = createApiResponse(mockCategories);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
=======
    it('should fetch all available categories', async () => {
      const mockCategories = [
        { id: 'economy', name: 'Economy System', description: 'Economy systems' },
        { id: 'game_mechanic', name: 'Game Mechanics', description: 'Gameplay' },
        { id: 'growth', name: 'Growth & Progression', description: 'Progression' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockCategories, error: null }),
>>>>>>> main
      });

      const result = await getCategories();

<<<<<<< HEAD
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/questions/categories`);
      expect(result).toEqual(mockCategories);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getCategories()).rejects.toThrow('Network error');
    });
  });

  describe('getQuestionsByCategory', () => {
    it('should fetch questions by category successfully', async () => {
      const mockQuestions = [
        createMockQuestion({ id: 'q-1', categoryId: 'game-mechanic' }),
        createMockQuestion({ id: 'q-2', categoryId: 'game-mechanic' }),
      ];
      const mockResponse = createApiResponse(mockQuestions);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getQuestionsByCategory('game-mechanic');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/questions/game-mechanic`);
      expect(result).toEqual(mockQuestions);
    });

    it('should return empty array when category has no questions', async () => {
      const mockResponse = createApiResponse<Question[]>([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getQuestionsByCategory('empty-category');

      expect(result).toEqual([]);
    });
  });

  describe('createSession', () => {
    it('should create a new session successfully', async () => {
      const createDto: CreateQASessionDto = {
        taskId: 'task-1',
        projectId: 'project-1',
      };

      const createdSession = createMockSession({
        id: 'new-session',
        taskId: 'task-1',
        projectId: 'project-1',
      });
      const mockResponse = createApiResponse(createdSession);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createSession(createDto);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/qa-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createDto),
      });
      expect(result).toEqual(createdSession);
    });

    it('should throw error when session creation fails', async () => {
      const createDto: CreateQASessionDto = {
        taskId: 'task-1',
        projectId: 'project-1',
      };

      const mockResponse = createApiResponse<QASession | null>(null, false, 'Failed to create session');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(createSession(createDto)).rejects.toThrow('Failed to create session');
    });
  });

  describe('updateSession', () => {
    it('should update session answers successfully', async () => {
      const updateDto: UpdateQASessionDto = {
        answers: { 'q-1': 'My answer' },
      };

      const updatedSession = createMockSession({
        id: 'session-1',
        answers: { 'q-1': 'My answer' },
        updatedAt: '2025-01-02T00:00:00.000Z',
      });
      const mockResponse = createApiResponse(updatedSession);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await updateSession('session-1', updateDto);

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/qa-sessions/session-1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateDto),
      });
      expect(result.answers['q-1']).toBe('My answer');
    });

    it('should throw error when session not found', async () => {
      const updateDto: UpdateQASessionDto = { answers: {} };
      const mockResponse = createApiResponse<QASession | null>(null, false, 'Session not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(updateSession('non-existent', updateDto)).rejects.toThrow('Session not found');
    });
  });

  describe('getSession', () => {
    it('should fetch session by id successfully', async () => {
      const mockSession = createMockSession({ id: 'session-1' });
      const mockResponse = createApiResponse(mockSession);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSession('session-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/qa-sessions/session-1`);
      expect(result).toEqual(mockSession);
    });

    it('should throw error when session not found', async () => {
      const mockResponse = createApiResponse<QASession | null>(null, false, 'Session not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(getSession('non-existent')).rejects.toThrow('Session not found');
    });
  });

  describe('completeSession', () => {
    it('should complete session successfully', async () => {
      const completedSession = createMockSession({
        id: 'session-1',
        isComplete: true,
        progress: 100,
      });
      const mockResponse = createApiResponse(completedSession);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await completeSession('session-1');

      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/qa-sessions/session-1/complete`, {
        method: 'POST',
      });
      expect(result.isComplete).toBe(true);
      expect(result.progress).toBe(100);
    });

    it('should throw error when session not found', async () => {
      const mockResponse = createApiResponse<QASession | null>(null, false, 'Session not found');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(completeSession('non-existent')).rejects.toThrow('Session not found');
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(completeSession('session-1')).rejects.toThrow();
=======
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/questions'),
        expect.any(Object)
      );
      expect(result).toHaveLength(3);
    });
  });

  describe('saveQAAnswers', () => {
    it('should save Q&A answers for a task', async () => {
      const mockSession = {
        id: 'session-001',
        taskId: 'task-001',
        category: 'game_mechanic',
        status: 'in_progress',
        currentStep: 1,
        answers: [],
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { sessionId: 'session-001', session: mockSession },
          error: null,
        }),
      });

      const answers: QASessionAnswer[] = [
        { questionId: 'gm-001', answer: 'Test answer', answeredAt: '2024-01-01T00:00:00Z' },
      ];

      const result = await saveQAAnswers('task-001', 'game_mechanic', answers, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/task-001/qa'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.sessionId).toBe('session-001');
    });

    it('should mark session as complete when isComplete is true', async () => {
      const mockSession = {
        id: 'session-001',
        taskId: 'task-001',
        category: 'economy',
        status: 'completed',
        currentStep: 3,
        answers: [],
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-01T01:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { sessionId: 'session-001', session: mockSession },
          error: null,
        }),
      });

      const result = await saveQAAnswers('task-001', 'economy', [], 3, true);

      expect(result.session.status).toBe('completed');
    });
  });

  describe('getQASession', () => {
    it('should fetch Q&A session for a task', async () => {
      const mockSession = {
        id: 'session-001',
        taskId: 'task-001',
        category: 'game_mechanic',
        status: 'in_progress',
        currentStep: 2,
        answers: [
          { questionId: 'gm-001', answer: 'Test', answeredAt: '2024-01-01T00:00:00Z' },
        ],
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSession, error: null }),
      });

      const result = await getQASession('task-001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/task-001/qa'),
        expect.any(Object)
      );
      expect(result).toEqual(mockSession);
    });

    it('should return null for task without session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ success: false, data: null, error: 'Not found' }),
      });

      const result = await getQASession('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('triggerDesignGeneration', () => {
    it('should trigger design generation for a task', async () => {
      const mockResult = {
        message: 'Design document generated successfully',
        task: {
          id: 'task-001',
          status: 'design',
          designDocument: 'Generated design',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResult, error: null }),
      });

      const result = await triggerDesignGeneration('task-001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/task-001/generate-design'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.message).toBe('Design document generated successfully');
    });

    it('should throw error when task not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ success: false, data: null, error: 'Task not found' }),
      });

      await expect(triggerDesignGeneration('non-existent')).rejects.toThrow();
>>>>>>> main
    });
  });
});
