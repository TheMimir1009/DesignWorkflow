/**
 * TemplateVariableForm Component Tests
 * TDD: Tests for dynamic variable input form
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateVariableForm } from '../../../src/components/template/TemplateVariableForm';
import type { TemplateVariable } from '../../../src/types';

describe('TemplateVariableForm', () => {
  const mockVariables: TemplateVariable[] = [
    {
      name: 'title',
      description: 'Document title',
      defaultValue: null,
      required: true,
      type: 'text',
      options: null,
    },
    {
      name: 'content',
      description: 'Main content',
      defaultValue: 'Default content here',
      required: false,
      type: 'textarea',
      options: null,
    },
    {
      name: 'category',
      description: 'Select category',
      defaultValue: 'general',
      required: true,
      type: 'select',
      options: ['general', 'technical', 'business'],
    },
    {
      name: 'count',
      description: 'Item count',
      defaultValue: '10',
      required: false,
      type: 'number',
      options: null,
    },
  ];

  const defaultProps = {
    variables: mockVariables,
    values: {} as Record<string, string>,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('field rendering', () => {
    it('should render text input for text type', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/document title/i);
      expect(titleInput).toHaveAttribute('type', 'text');
    });

    it('should render textarea for textarea type', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const contentInput = screen.getByLabelText(/main content/i);
      expect(contentInput.tagName.toLowerCase()).toBe('textarea');
    });

    it('should render select for select type', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/select category/i);
      expect(categorySelect.tagName.toLowerCase()).toBe('select');
    });

    it('should render number input for number type', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const countInput = screen.getByLabelText(/item count/i);
      expect(countInput).toHaveAttribute('type', 'number');
    });

    it('should render select options correctly', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/select category/i);
      const options = categorySelect.querySelectorAll('option');

      expect(options).toHaveLength(4); // 3 options + 1 placeholder
      expect(screen.getByRole('option', { name: 'general' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'technical' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'business' })).toBeInTheDocument();
    });
  });

  describe('required indicator', () => {
    it('should show required indicator for required fields', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      // Title is required
      const titleLabel = screen.getByText(/document title/i);
      expect(titleLabel.parentElement).toHaveTextContent('*');
    });

    it('should not show required indicator for optional fields', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      // Content is optional - check that it does not have asterisk outside the label
      const contentLabel = screen.getByText(/main content/i);
      expect(contentLabel.textContent).not.toContain('*');
    });
  });

  describe('default values', () => {
    it('should use default values when values prop is empty', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      // Default value should be shown in content textarea placeholder or value
      const contentInput = screen.getByLabelText(/main content/i);
      expect(contentInput).toHaveAttribute('placeholder', 'Default content here');
    });

    it('should use provided values over defaults', () => {
      const propsWithValues = {
        ...defaultProps,
        values: { content: 'Custom content' },
      };
      render(<TemplateVariableForm {...propsWithValues} />);

      const contentInput = screen.getByLabelText(/main content/i);
      expect(contentInput).toHaveValue('Custom content');
    });
  });

  describe('onChange handling', () => {
    it('should call onChange when text input changes', async () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/document title/i);
      await userEvent.type(titleInput, 'X');

      expect(defaultProps.onChange).toHaveBeenCalled();
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0];
      expect(lastCall.title).toBe('X');
    });

    it('should call onChange when textarea changes', async () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const contentInput = screen.getByLabelText(/main content/i);
      await userEvent.type(contentInput, 'New content');

      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('should call onChange when select changes', async () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/select category/i);
      await userEvent.selectOptions(categorySelect, 'technical');

      expect(defaultProps.onChange).toHaveBeenCalled();
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0];
      expect(lastCall.category).toBe('technical');
    });

    it('should call onChange when number input changes', async () => {
      render(<TemplateVariableForm {...defaultProps} />);

      const countInput = screen.getByLabelText(/item count/i);
      await userEvent.type(countInput, '5');

      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should render empty message when no variables', () => {
      render(<TemplateVariableForm {...defaultProps} variables={[]} />);

      expect(screen.getByText(/no variables to fill/i)).toBeInTheDocument();
    });
  });

  describe('data-testid', () => {
    it('should have template-variable-form data-testid', () => {
      render(<TemplateVariableForm {...defaultProps} />);

      expect(screen.getByTestId('template-variable-form')).toBeInTheDocument();
    });
  });
});
