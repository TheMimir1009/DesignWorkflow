/**
 * Q&A Types Test Suite
 * Tests for Q&A system type definitions and validation
 */
import { describe, it, expect } from 'vitest';
import type {
  QACategory,
  QAInputType,
  Question,
  QuestionTemplate,
  QASession,
  QASessionAnswer,
  QACompletionResult,
  QASessionStatus,
} from '../../src/types/qa';

describe('Q&A Types', () => {
  describe('QACategory', () => {
    it('should accept valid category values', () => {
      const categories: QACategory[] = ['game_mechanic', 'economy', 'growth'];
      expect(categories).toHaveLength(3);
      categories.forEach((cat) => {
        expect(['game_mechanic', 'economy', 'growth']).toContain(cat);
      });
    });
  });

  describe('QAInputType', () => {
    it('should accept valid input type values', () => {
      const inputTypes: QAInputType[] = ['text', 'textarea', 'select', 'multiselect'];
      expect(inputTypes).toHaveLength(4);
    });
  });

  describe('Question', () => {
    it('should have required properties', () => {
      const question: Question = {
        id: 'gm-001',
        order: 1,
        text: 'What is the core gameplay loop?',
        description: 'Describe the main actions players repeat',
        inputType: 'textarea',
        required: true,
        placeholder: 'Example placeholder',
        maxLength: 1000,
        options: null,
      };

      expect(question.id).toBe('gm-001');
      expect(question.order).toBe(1);
      expect(question.text).toBe('What is the core gameplay loop?');
      expect(question.description).toBe('Describe the main actions players repeat');
      expect(question.inputType).toBe('textarea');
      expect(question.required).toBe(true);
      expect(question.placeholder).toBe('Example placeholder');
      expect(question.maxLength).toBe(1000);
      expect(question.options).toBeNull();
    });

    it('should support select type with options', () => {
      const question: Question = {
        id: 'ec-004',
        order: 4,
        text: 'Is there a monetization model?',
        description: 'Select the monetization approach',
        inputType: 'select',
        required: false,
        placeholder: null,
        maxLength: null,
        options: ['Free-to-play', 'Premium', 'Subscription'],
      };

      expect(question.inputType).toBe('select');
      expect(question.options).toEqual(['Free-to-play', 'Premium', 'Subscription']);
    });
  });

  describe('QuestionTemplate', () => {
    it('should have required properties', () => {
      const template: QuestionTemplate = {
        id: 'game_mechanic',
        category: 'game_mechanic',
        categoryName: 'Game Mechanics',
        categoryDescription: 'Core gameplay mechanics',
        version: '1.0.0',
        questions: [],
      };

      expect(template.id).toBe('game_mechanic');
      expect(template.category).toBe('game_mechanic');
      expect(template.categoryName).toBe('Game Mechanics');
      expect(template.categoryDescription).toBe('Core gameplay mechanics');
      expect(template.version).toBe('1.0.0');
      expect(template.questions).toEqual([]);
    });
  });

  describe('QASession', () => {
    it('should have required properties', () => {
      const session: QASession = {
        id: 'session-001',
        taskId: 'task-001',
        category: 'game_mechanic',
        status: 'in_progress',
        currentStep: 0,
        answers: [],
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: null,
      };

      expect(session.id).toBe('session-001');
      expect(session.taskId).toBe('task-001');
      expect(session.category).toBe('game_mechanic');
      expect(session.status).toBe('in_progress');
      expect(session.currentStep).toBe(0);
      expect(session.answers).toEqual([]);
      expect(session.startedAt).toBe('2024-01-01T00:00:00Z');
      expect(session.completedAt).toBeNull();
    });

    it('should support completed status', () => {
      const session: QASession = {
        id: 'session-002',
        taskId: 'task-002',
        category: 'economy',
        status: 'completed',
        currentStep: 5,
        answers: [],
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-01T01:00:00Z',
      };

      expect(session.status).toBe('completed');
      expect(session.completedAt).toBe('2024-01-01T01:00:00Z');
    });
  });

  describe('QASessionAnswer', () => {
    it('should have required properties', () => {
      const answer: QASessionAnswer = {
        questionId: 'gm-001',
        answer: 'Players explore, collect, and build',
        answeredAt: '2024-01-01T00:30:00Z',
      };

      expect(answer.questionId).toBe('gm-001');
      expect(answer.answer).toBe('Players explore, collect, and build');
      expect(answer.answeredAt).toBe('2024-01-01T00:30:00Z');
    });
  });

  describe('QASessionStatus', () => {
    it('should accept valid status values', () => {
      const statuses: QASessionStatus[] = ['not_started', 'in_progress', 'completed', 'cancelled'];
      expect(statuses).toHaveLength(4);
    });
  });

  describe('QACompletionResult', () => {
    it('should have required properties', () => {
      const result: QACompletionResult = {
        sessionId: 'session-001',
        taskId: 'task-001',
        category: 'game_mechanic',
        answers: [
          {
            questionId: 'gm-001',
            answer: 'Core loop description',
            answeredAt: '2024-01-01T00:30:00Z',
          },
        ],
        completedAt: '2024-01-01T01:00:00Z',
        summary: 'Q&A session completed successfully',
      };

      expect(result.sessionId).toBe('session-001');
      expect(result.taskId).toBe('task-001');
      expect(result.category).toBe('game_mechanic');
      expect(result.answers).toHaveLength(1);
      expect(result.completedAt).toBe('2024-01-01T01:00:00Z');
      expect(result.summary).toBe('Q&A session completed successfully');
    });
  });
});
