/**
 * TemplateEditModal Component Tests
 * TDD: Tests for template editing modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateEditModal } from '../../../src/components/template/TemplateEditModal';
import type { Template } from '../../../src/types';

describe('TemplateEditModal', () => {
  const mockTemplate: Template = {
    id: 'template-1',
    name: 'Test Template',
    category: 'qa-questions',
    description: 'A test template',
    content: '# {{title}}\n\n{{content}}',
    variables: [
      {
        name: 'title',
        description: 'Title',
        defaultValue: null,
        required: true,
        type: 'text',
        options: null,
      },
      {
        name: 'content',
        description: 'Content',
        defaultValue: '',
        required: false,
        type: 'textarea',
        options: null,
      },
    ],
    isDefault: false,
    projectId: 'project-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const defaultProps = {
    isOpen: true,
    template: mockTemplate,
    onClose: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<TemplateEditModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<TemplateEditModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal title', () => {
      render(<TemplateEditModal {...defaultProps} />);

      expect(screen.getByText(/edit template/i)).toBeInTheDocument();
    });
  });

  describe('form pre-population', () => {
    it('should pre-populate name field', () => {
      render(<TemplateEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveValue('Test Template');
    });

    it('should pre-populate category field', () => {
      render(<TemplateEditModal {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/category/i);
      expect(categorySelect).toHaveValue('qa-questions');
    });

    it('should pre-populate description field', () => {
      render(<TemplateEditModal {...defaultProps} />);

      const descInput = screen.getByLabelText(/description/i);
      expect(descInput).toHaveValue('A test template');
    });

    it('should pre-populate content field', () => {
      render(<TemplateEditModal {...defaultProps} />);

      const contentInput = document.getElementById('edit-template-content') as HTMLTextAreaElement;
      expect(contentInput).toHaveValue('# {{title}}\n\n{{content}}');
    });

    it('should pre-populate variables', () => {
      render(<TemplateEditModal {...defaultProps} />);

      // Variable names should be visible
      expect(screen.getByDisplayValue('title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('content')).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should call onClose when cancel button clicked', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop clicked', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const backdrop = screen.getByTestId('template-edit-modal');
      await userEvent.click(backdrop);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('should call onSave with updated data when submitted', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Updated Template');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalled();
      });
    });

    it('should disable save button when name is empty', async () => {
      render(<TemplateEditModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.clear(nameInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('data-testid', () => {
    it('should have template-edit-modal data-testid', () => {
      render(<TemplateEditModal {...defaultProps} />);

      expect(screen.getByTestId('template-edit-modal')).toBeInTheDocument();
    });
  });
});
