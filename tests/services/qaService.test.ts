/**
 * QA Service Tests
 * TDD test suite for QA API communication layer
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getQuestions,
  getCategories,
  getQuestionsByCategory,
  createSession,
  updateSession,
  getSession,
  completeSession,
  API_BASE_URL,
} from '../../src/services/qaService';
import type { Question, QASession, QACategory, CreateQASessionDto, UpdateQASessionDto } from '../../src/types/qa';
import type { ApiResponse } from '../../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
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
    });
  });

  describe('getCategories', () => {
    it('should fetch all categories successfully', async () => {
      const mockCategories = [
        createMockCategory({ id: 'game-mechanic', order: 1 }),
        createMockCategory({ id: 'economy', order: 2 }),
      ];
      const mockResponse = createApiResponse(mockCategories);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getCategories();

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
    });
  });
});
