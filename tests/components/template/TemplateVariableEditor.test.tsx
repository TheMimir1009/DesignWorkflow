/**
 * TemplateVariableEditor Component Tests
 * TDD RED Phase: Tests for variable editing component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateVariableEditor } from '../../../src/components/template/TemplateVariableEditor';
import type { TemplateVariable } from '../../../src/types';

describe('TemplateVariableEditor', () => {
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
      defaultValue: 'Default content',
      required: false,
      type: 'textarea',
      options: null,
    },
    {
      name: 'category',
      description: 'Category selection',
      defaultValue: 'general',
      required: true,
      type: 'select',
      options: ['general', 'technical', 'business'],
    },
  ];

  const defaultProps = {
    variables: mockVariables,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('variable list display', () => {
    it('should render all variables', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      expect(screen.getByDisplayValue('title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('content')).toBeInTheDocument();
      expect(screen.getByDisplayValue('category')).toBeInTheDocument();
    });

    it('should display variable descriptions', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      expect(screen.getByDisplayValue('Document title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Main content')).toBeInTheDocument();
    });

    it('should display variable types', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const typeSelects = screen.getAllByRole('combobox');
      const typeTexts = typeSelects.map(sel => (sel as HTMLSelectElement).value);

      expect(typeTexts).toContain('text');
      expect(typeTexts).toContain('textarea');
      expect(typeTexts).toContain('select');
    });

    it('should show required checkbox state', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox', { name: /required/i });
      // title is required (first variable)
      expect(checkboxes[0]).toBeChecked();
      // content is not required (second variable)
      expect(checkboxes[1]).not.toBeChecked();
    });
  });

  describe('add variable', () => {
    it('should render add variable button', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument();
    });

    it('should call onChange with new variable when add button clicked', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add variable/i });
      await userEvent.click(addButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith([
        ...mockVariables,
        expect.objectContaining({
          name: '',
          description: '',
          defaultValue: null,
          required: false,
          type: 'text',
          options: null,
        }),
      ]);
    });
  });

  describe('delete variable', () => {
    it('should render delete button for each variable', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(3);
    });

    it('should call onChange with variable removed when delete clicked', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await userEvent.click(deleteButtons[0]); // Delete first variable

      expect(defaultProps.onChange).toHaveBeenCalledWith([
        mockVariables[1],
        mockVariables[2],
      ]);
    });
  });

  describe('edit variable name', () => {
    it('should call onChange when name is changed', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('title');
      await userEvent.type(nameInput, 'X');

      expect(defaultProps.onChange).toHaveBeenCalled();
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0];
      expect(lastCall[0].name).toBe('titleX');
    });
  });

  describe('edit variable description', () => {
    it('should call onChange when description is changed', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const descInput = screen.getByDisplayValue('Document title');
      await userEvent.clear(descInput);
      await userEvent.type(descInput, 'New description');

      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('edit variable type', () => {
    it('should call onChange when type is changed', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const typeSelects = screen.getAllByRole('combobox');
      await userEvent.selectOptions(typeSelects[0], 'textarea');

      expect(defaultProps.onChange).toHaveBeenCalled();
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0];
      expect(lastCall[0].type).toBe('textarea');
    });
  });

  describe('edit variable required', () => {
    it('should call onChange when required is toggled', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const requiredCheckboxes = screen.getAllByRole('checkbox', { name: /required/i });
      await userEvent.click(requiredCheckboxes[0]); // Toggle first variable's required

      expect(defaultProps.onChange).toHaveBeenCalled();
      const lastCall = defaultProps.onChange.mock.calls[defaultProps.onChange.mock.calls.length - 1][0];
      expect(lastCall[0].required).toBe(false);
    });
  });

  describe('edit default value', () => {
    it('should render default value input', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      expect(screen.getByDisplayValue('Default content')).toBeInTheDocument();
    });

    it('should call onChange when default value is changed', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const defaultInput = screen.getByDisplayValue('Default content');
      await userEvent.clear(defaultInput);
      await userEvent.type(defaultInput, 'New default');

      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('select type options', () => {
    it('should render options input for select type', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      // Options should be visible for the select type variable
      expect(screen.getByDisplayValue('general, technical, business')).toBeInTheDocument();
    });

    it('should call onChange when options are changed', async () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      const optionsInput = screen.getByDisplayValue('general, technical, business');
      await userEvent.clear(optionsInput);
      await userEvent.type(optionsInput, 'a, b, c');

      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should render empty message when no variables', () => {
      render(<TemplateVariableEditor {...defaultProps} variables={[]} />);

      expect(screen.getByText(/no variables defined/i)).toBeInTheDocument();
    });

    it('should still show add button when empty', () => {
      render(<TemplateVariableEditor {...defaultProps} variables={[]} />);

      expect(screen.getByRole('button', { name: /add variable/i })).toBeInTheDocument();
    });
  });

  describe('data-testid', () => {
    it('should have template-variable-editor data-testid', () => {
      render(<TemplateVariableEditor {...defaultProps} />);

      expect(screen.getByTestId('template-variable-editor')).toBeInTheDocument();
    });
  });
});
