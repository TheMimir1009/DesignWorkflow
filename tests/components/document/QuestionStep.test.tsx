/**
 * QuestionStep Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionStep } from '../../../src/components/document/QuestionStep';
import type { Question } from '../../../src/types/qa';

describe('QuestionStep', () => {
  const mockQuestion: Question = {
    id: 'gm-001',
    order: 1,
    text: 'What is the core gameplay loop?',
    description: 'Describe the main actions players repeat',
    inputType: 'textarea',
    required: true,
    placeholder: 'Enter your answer here',
    maxLength: 2000,
    options: null,
  };

  const defaultProps = {
    question: mockQuestion,
    answer: '',
    onChange: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    isFirst: false,
    isLast: false,
    isValid: true,
  };

  it('should render question text', () => {
    render(<QuestionStep {...defaultProps} />);

    expect(screen.getByText('What is the core gameplay loop?')).toBeInTheDocument();
  });

  it('should render question description', () => {
    render(<QuestionStep {...defaultProps} />);

    expect(screen.getByText('Describe the main actions players repeat')).toBeInTheDocument();
  });

  it('should render textarea for textarea inputType', () => {
    render(<QuestionStep {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('should call onChange when input changes', () => {
    const onChange = vi.fn();
    render(<QuestionStep {...defaultProps} onChange={onChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'My answer' } });

    expect(onChange).toHaveBeenCalledWith('My answer');
  });

  it('should display current answer', () => {
    render(<QuestionStep {...defaultProps} answer="My existing answer" />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('My existing answer');
  });

  it('should show required indicator', () => {
    render(<QuestionStep {...defaultProps} />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should not show required indicator for optional questions', () => {
    const optionalQuestion = { ...mockQuestion, required: false };
    render(<QuestionStep {...defaultProps} question={optionalQuestion} />);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should hide Previous button when isFirst is true', () => {
    render(<QuestionStep {...defaultProps} isFirst={true} />);

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
  });

  it('should show Complete button when isLast is true', () => {
    render(<QuestionStep {...defaultProps} isLast={true} />);

    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
  });

  it('should call onNext when Next button is clicked', () => {
    const onNext = vi.fn();
    render(<QuestionStep {...defaultProps} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onNext).toHaveBeenCalled();
  });

  it('should call onPrev when Previous button is clicked', () => {
    const onPrev = vi.fn();
    render(<QuestionStep {...defaultProps} onPrev={onPrev} />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));

    expect(onPrev).toHaveBeenCalled();
  });

  it('should disable Next button when isValid is false', () => {
    render(<QuestionStep {...defaultProps} isValid={false} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should render select input for select inputType', () => {
    const selectQuestion: Question = {
      ...mockQuestion,
      inputType: 'select',
      options: ['Option 1', 'Option 2', 'Option 3'],
    };
    render(<QuestionStep {...defaultProps} question={selectQuestion} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should show character count for textarea', () => {
    render(<QuestionStep {...defaultProps} answer="Hello" />);

    expect(screen.getByText('5 / 2000')).toBeInTheDocument();
  });
});
