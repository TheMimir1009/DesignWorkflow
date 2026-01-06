/**
 * QuestionList Component Tests
 * TDD test suite for Q&A question list component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionList } from '../../../src/components/qa/QuestionList';
import type { Question } from '../../../src/types/qa';

// Test data factory
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

describe('QuestionList', () => {
  const mockQuestions: Question[] = [
    createMockQuestion({ id: 'q-1', order: 1, text: 'Question 1' }),
    createMockQuestion({ id: 'q-2', order: 2, text: 'Question 2', isRequired: false }),
    createMockQuestion({ id: 'q-3', order: 3, text: 'Question 3' }),
  ];

  const defaultProps = {
    questions: mockQuestions,
    answers: {},
    onAnswerChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all questions', () => {
      render(<QuestionList {...defaultProps} />);

      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
      expect(screen.getByText('Question 3')).toBeInTheDocument();
    });

    it('should render questions in order', () => {
      render(<QuestionList {...defaultProps} />);

      const questions = screen.getAllByTestId(/question-item/);
      expect(questions).toHaveLength(3);
    });

    it('should render empty state when no questions', () => {
      render(<QuestionList {...defaultProps} questions={[]} />);

      expect(screen.getByText('No questions available')).toBeInTheDocument();
    });

    it('should display answers for each question', () => {
      const answers = {
        'q-1': 'Answer 1',
        'q-2': 'Answer 2',
      };
      render(<QuestionList {...defaultProps} answers={answers} />);

      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes[0]).toHaveValue('Answer 1');
      expect(textboxes[1]).toHaveValue('Answer 2');
      expect(textboxes[2]).toHaveValue('');
    });

    it('should render progress bar', () => {
      render(<QuestionList {...defaultProps} showProgress={true} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should calculate progress based on required questions', () => {
      const answers = { 'q-1': 'Answer 1' }; // 1 of 2 required answered
      render(<QuestionList {...defaultProps} answers={answers} showProgress={true} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should show 100% progress when all required answered', () => {
      const answers = { 'q-1': 'Answer 1', 'q-3': 'Answer 3' }; // All required
      render(<QuestionList {...defaultProps} answers={answers} showProgress={true} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Interaction', () => {
    it('should call onAnswerChange when answer changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<QuestionList {...defaultProps} onAnswerChange={handleChange} />);

      const textareas = screen.getAllByRole('textbox');
      await user.type(textareas[0], 'X');

      expect(handleChange).toHaveBeenCalledWith('q-1', 'X');
    });

    it('should propagate answer changes correctly', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<QuestionList {...defaultProps} onAnswerChange={handleChange} />);

      const textareas = screen.getAllByRole('textbox');
      await user.type(textareas[1], 'Y');

      expect(handleChange).toHaveBeenCalledWith('q-2', 'Y');
    });
  });

  describe('Validation', () => {
    it('should show validation errors when showValidation is true', () => {
      render(<QuestionList {...defaultProps} showValidation={true} />);

      // Should show 2 errors for q-1 and q-3 (required and empty)
      const errorMessages = screen.getAllByText('This field is required');
      expect(errorMessages).toHaveLength(2);
    });

    it('should not show validation errors when showValidation is false', () => {
      render(<QuestionList {...defaultProps} showValidation={false} />);

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('should not show validation errors for answered questions', () => {
      const answers = { 'q-1': 'Answer 1' };
      render(<QuestionList {...defaultProps} answers={answers} showValidation={true} />);

      // Should only show 1 error for q-3
      const errorMessages = screen.getAllByText('This field is required');
      expect(errorMessages).toHaveLength(1);
    });
  });

  describe('Filtering', () => {
    it('should filter questions by category when categoryId provided', () => {
      const mixedQuestions = [
        createMockQuestion({ id: 'q-1', categoryId: 'game-mechanic', text: 'GM Question' }),
        createMockQuestion({ id: 'q-2', categoryId: 'economy', text: 'EC Question' }),
        createMockQuestion({ id: 'q-3', categoryId: 'game-mechanic', text: 'GM Question 2' }),
      ];
      render(
        <QuestionList
          {...defaultProps}
          questions={mixedQuestions}
          categoryId="game-mechanic"
        />
      );

      expect(screen.getByText('GM Question')).toBeInTheDocument();
      expect(screen.getByText('GM Question 2')).toBeInTheDocument();
      expect(screen.queryByText('EC Question')).not.toBeInTheDocument();
    });

    it('should show all questions when no categoryId filter', () => {
      const mixedQuestions = [
        createMockQuestion({ id: 'q-1', categoryId: 'game-mechanic', text: 'GM Question' }),
        createMockQuestion({ id: 'q-2', categoryId: 'economy', text: 'EC Question' }),
      ];
      render(<QuestionList {...defaultProps} questions={mixedQuestions} />);

      expect(screen.getByText('GM Question')).toBeInTheDocument();
      expect(screen.getByText('EC Question')).toBeInTheDocument();
    });
  });
});
