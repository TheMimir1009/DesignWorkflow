/**
 * QuestionItem Component Tests
 * TDD test suite for Q&A question item component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionItem } from '../../../src/components/qa/QuestionItem';
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

describe('QuestionItem', () => {
  const defaultProps = {
    question: createMockQuestion(),
    answer: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render question text', () => {
      render(<QuestionItem {...defaultProps} />);

      expect(screen.getByText('What is the core gameplay loop?')).toBeInTheDocument();
    });

    it('should render help text when provided', () => {
      render(<QuestionItem {...defaultProps} />);

      expect(screen.getByText('Describe the main actions players repeat')).toBeInTheDocument();
    });

    it('should not render help text when null', () => {
      const question = createMockQuestion({ helpText: null });
      render(<QuestionItem {...defaultProps} question={question} />);

      expect(screen.queryByText('Describe the main actions players repeat')).not.toBeInTheDocument();
    });

    it('should render required indicator for required questions', () => {
      render(<QuestionItem {...defaultProps} />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not render required indicator for optional questions', () => {
      const question = createMockQuestion({ isRequired: false });
      render(<QuestionItem {...defaultProps} question={question} />);

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should render textarea for textarea input type', () => {
      render(<QuestionItem {...defaultProps} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
    });

    it('should render text input for text input type', () => {
      const question = createMockQuestion({ inputType: 'text' });
      render(<QuestionItem {...defaultProps} question={question} />);

      const input = screen.getByRole('textbox');
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render select for select input type', () => {
      const question = createMockQuestion({
        inputType: 'select',
        options: ['Option A', 'Option B', 'Option C'],
      });
      render(<QuestionItem {...defaultProps} question={question} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render options for select input type', () => {
      const question = createMockQuestion({
        inputType: 'select',
        options: ['Option A', 'Option B', 'Option C'],
      });
      render(<QuestionItem {...defaultProps} question={question} />);

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('should display provided answer value', () => {
      render(<QuestionItem {...defaultProps} answer="My test answer" />);

      expect(screen.getByRole('textbox')).toHaveValue('My test answer');
    });
  });

  describe('Interaction', () => {
    it('should call onChange when textarea value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<QuestionItem {...defaultProps} onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'New answer');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onChange with question id and new value', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<QuestionItem {...defaultProps} onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A');

      expect(handleChange).toHaveBeenCalledWith('q-1', 'A');
    });

    it('should call onChange when text input value changes', async () => {
      const handleChange = vi.fn();
      const question = createMockQuestion({ inputType: 'text' });
      const user = userEvent.setup();
      render(<QuestionItem {...defaultProps} question={question} onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'B');

      expect(handleChange).toHaveBeenCalledWith('q-1', 'B');
    });

    it('should call onChange when select value changes', async () => {
      const handleChange = vi.fn();
      const question = createMockQuestion({
        inputType: 'select',
        options: ['Option A', 'Option B'],
      });
      const user = userEvent.setup();
      render(<QuestionItem {...defaultProps} question={question} onChange={handleChange} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Option B');

      expect(handleChange).toHaveBeenCalledWith('q-1', 'Option B');
    });
  });

  describe('Validation', () => {
    it('should show validation error when isRequired and answer is empty', () => {
      render(<QuestionItem {...defaultProps} showValidation={true} />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should not show validation error when answer is provided', () => {
      render(<QuestionItem {...defaultProps} answer="Some answer" showValidation={true} />);

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('should not show validation error when not required', () => {
      const question = createMockQuestion({ isRequired: false });
      render(<QuestionItem {...defaultProps} question={question} showValidation={true} />);

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('should not show validation error when showValidation is false', () => {
      render(<QuestionItem {...defaultProps} showValidation={false} />);

      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<QuestionItem {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAccessibleName();
    });

    it('should have aria-required for required questions', () => {
      render(<QuestionItem {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid when validation error', () => {
      render(<QuestionItem {...defaultProps} showValidation={true} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
