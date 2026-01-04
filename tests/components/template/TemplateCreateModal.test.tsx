/**
 * TemplateCreateModal Component Tests
 * TDD: Tests for template creation modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateCreateModal } from '../../../src/components/template/TemplateCreateModal';

// Mock the template store
vi.mock('../../../src/store/templateStore', () => ({
  useTemplateStore: vi.fn((selector) => {
    const state = {
      createTemplate: vi.fn().mockResolvedValue(undefined),
      templates: [],
    };
    return selector ? selector(state) : state;
  }),
}));

describe('TemplateCreateModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<TemplateCreateModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal title', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByText(/create template/i)).toBeInTheDocument();
    });
  });

  describe('form fields', () => {
    it('should render category select', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    it('should render name input', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('should render description input', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should render content textarea', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    });

    it('should render variable editor', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByTestId('template-variable-editor')).toBeInTheDocument();
    });
  });

  describe('category options', () => {
    it('should have qa-questions option', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toContainHTML('qa-questions');
    });

    it('should have document-structure option', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toContainHTML('document-structure');
    });

    it('should have prompts option', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toContainHTML('prompts');
    });
  });

  describe('form interactions', () => {
    it('should call onClose when cancel button clicked', async () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', async () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const backdrop = screen.getByTestId('template-create-modal');
      await userEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should disable save button when name is empty', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /create/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when required fields are filled', async () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      const categorySelect = screen.getByLabelText(/category/i);

      await userEvent.type(nameInput, 'Test Template');
      await userEvent.selectOptions(categorySelect, 'qa-questions');

      const saveButton = screen.getByRole('button', { name: /create/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('should call onSave with form data when submitted', async () => {
      render(<TemplateCreateModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      const categorySelect = screen.getByLabelText(/category/i);
      const descInput = screen.getByLabelText(/description/i);

      await userEvent.type(nameInput, 'Test Template');
      await userEvent.selectOptions(categorySelect, 'qa-questions');
      await userEvent.type(descInput, 'Test description');

      const saveButton = screen.getByRole('button', { name: /create/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalled();
      });
    });
  });

  describe('data-testid', () => {
    it('should have template-create-modal data-testid', () => {
      render(<TemplateCreateModal {...defaultProps} />);

      expect(screen.getByTestId('template-create-modal')).toBeInTheDocument();
    });
  });
});
