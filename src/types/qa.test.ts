/**
 * Q&A 시스템 타입 정의 테스트
 */

import { describe, it, expect } from 'vitest';
import type {
  QuestionType,
  QuestionStatus,
  Question,
  Answer,
  QAThread,
  QuestionFilter,
  CreateQuestionDTO,
  CreateAnswerDTO,
} from './qa.js';

describe('Q&A System Types', () => {
  describe('QuestionType', () => {
    it('should accept valid question types', () => {
      const clarification: QuestionType = 'clarification';
      const feedback: QuestionType = 'feedback';
      const suggestion: QuestionType = 'suggestion';
      const issue: QuestionType = 'issue';

      expect(clarification).toBe('clarification');
      expect(feedback).toBe('feedback');
      expect(suggestion).toBe('suggestion');
      expect(issue).toBe('issue');
    });
  });

  describe('QuestionStatus', () => {
    it('should accept valid question statuses', () => {
      const open: QuestionStatus = 'open';
      const answered: QuestionStatus = 'answered';
      const closed: QuestionStatus = 'closed';

      expect(open).toBe('open');
      expect(answered).toBe('answered');
      expect(closed).toBe('closed');
    });
  });

  describe('Question', () => {
    it('should have required question properties', () => {
      const question: Question = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        documentId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'clarification',
        content: 'What is the meaning of this?',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['urgent', 'design'],
      };

      expect(question.id).toBeDefined();
      expect(question.documentId).toBeDefined();
      expect(question.type).toBe('clarification');
      expect(question.content).toBe('What is the meaning of this?');
      expect(question.authorId).toBeDefined();
      expect(question.status).toBe('open');
      expect(question.tags).toContain('urgent');
    });
  });

  describe('Answer', () => {
    it('should have required answer properties', () => {
      const answer: Answer = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        questionId: '550e8400-e29b-41d4-a716-446655440001',
        content: 'This is the answer',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAccepted: false,
      };

      expect(answer.id).toBeDefined();
      expect(answer.questionId).toBeDefined();
      expect(answer.content).toBe('This is the answer');
      expect(answer.authorId).toBeDefined();
      expect(answer.isAccepted).toBe(false);
    });

    it('should support accepted answers', () => {
      const acceptedAnswer: Answer = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        questionId: '550e8400-e29b-41d4-a716-446655440001',
        content: 'Accepted answer',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAccepted: true,
      };

      expect(acceptedAnswer.isAccepted).toBe(true);
    });
  });

  describe('QAThread', () => {
    it('should contain question and answers', () => {
      const question: Question = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        documentId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'clarification',
        content: 'Question?',
        authorId: '550e8400-e29b-41d4-a716-446655440002',
        status: 'answered',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };

      const answers: readonly Answer[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          questionId: question.id,
          content: 'Answer 1',
          authorId: '550e8400-e29b-41d4-a716-446655440004',
          createdAt: new Date(),
          updatedAt: new Date(),
          isAccepted: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          questionId: question.id,
          content: 'Answer 2',
          authorId: '550e8400-e29b-41d4-a716-446655440006',
          createdAt: new Date(),
          updatedAt: new Date(),
          isAccepted: false,
        },
      ];

      const thread: QAThread = {
        question,
        answers,
      };

      expect(thread.question).toEqual(question);
      expect(thread.answers).toHaveLength(2);
      expect(thread.answers[0].isAccepted).toBe(true);
    });
  });

  describe('QuestionFilter', () => {
    it('should support filtering by various criteria', () => {
      const filter1: QuestionFilter = {
        documentId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'clarification',
      };

      const filter2: QuestionFilter = {
        status: 'open',
        tags: ['urgent', 'bug'],
      };

      const filter3: QuestionFilter = {
        authorId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(filter1.documentId).toBeDefined();
      expect(filter1.type).toBe('clarification');
      expect(filter2.status).toBe('open');
      expect(filter2.tags).toContain('urgent');
      expect(filter3.authorId).toBeDefined();
    });

    it('should allow empty filter', () => {
      const emptyFilter: QuestionFilter = {};
      expect(Object.keys(emptyFilter)).toHaveLength(0);
    });
  });

  describe('CreateQuestionDTO', () => {
    it('should have required fields for question creation', () => {
      const dto: CreateQuestionDTO = {
        documentId: '550e8400-e29b-41d4-a716-446655440000',
        type: 'feedback',
        content: 'This needs improvement',
        tags: ['improvement', 'ui'],
      };

      expect(dto.documentId).toBeDefined();
      expect(dto.type).toBe('feedback');
      expect(dto.content).toBe('This needs improvement');
      expect(dto.tags).toContain('improvement');
    });
  });

  describe('CreateAnswerDTO', () => {
    it('should have required fields for answer creation', () => {
      const dto: CreateAnswerDTO = {
        questionId: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Here is the answer',
      };

      expect(dto.questionId).toBeDefined();
      expect(dto.content).toBe('Here is the answer');
    });
  });
});
