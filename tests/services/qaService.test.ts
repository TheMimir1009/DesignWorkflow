/**
 * Q&A Service Tests
 * TDD tests for frontend Q&A API service
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getQuestions,
  getCategories,
  saveQAAnswers,
  getQASession,
  triggerDesignGeneration,
} from '../../src/services/qaService';
import type { QACategory, QASessionAnswer } from '../../src/types/qa';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Q&A Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
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
    });
  });

  describe('getCategories', () => {
    it('should fetch all available categories', async () => {
      const mockCategories = [
        { id: 'economy', name: 'Economy System', description: 'Economy systems' },
        { id: 'game_mechanic', name: 'Game Mechanics', description: 'Gameplay' },
        { id: 'growth', name: 'Growth & Progression', description: 'Progression' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockCategories, error: null }),
      });

      const result = await getCategories();

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
    });
  });
});
