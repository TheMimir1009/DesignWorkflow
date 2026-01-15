/**
 * Q&A 시스템 타입 정의
 * 질문-응답 처리 및 관리를 위한 타입
 */

import type { EntityId } from './index.js';

// 질문 유형
export type QuestionType = 'clarification' | 'feedback' | 'suggestion' | 'issue';

// 질문 상태
export type QuestionStatus = 'open' | 'answered' | 'closed';

// 질문 엔티티
export interface Question {
  readonly id: EntityId;
  readonly documentId: EntityId;
  readonly type: QuestionType;
  readonly content: string;
  readonly authorId: EntityId;
  readonly status: QuestionStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags: readonly string[];
}

// 답변 엔티티
export interface Answer {
  readonly id: EntityId;
  readonly questionId: EntityId;
  readonly content: string;
  readonly authorId: EntityId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isAccepted: boolean;
}

// Q&A 스레드 (질문 + 답변들)
export interface QAThread {
  readonly question: Question;
  readonly answers: readonly Answer[];
}

// 질문 필터 조건
export interface QuestionFilter {
  readonly documentId?: EntityId;
  readonly type?: QuestionType;
  readonly status?: QuestionStatus;
  readonly authorId?: EntityId;
  readonly tags?: readonly string[];
}

// 질문 생성 DTO
export interface CreateQuestionDTO {
  readonly documentId: EntityId;
  readonly type: QuestionType;
  readonly content: string;
  readonly tags: readonly string[];
}

// 답변 생성 DTO
export interface CreateAnswerDTO {
  readonly questionId: EntityId;
  readonly content: string;
}
