/**
 * TemplatePreview Component Tests
 * TDD: Tests for template preview component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplatePreview } from '../../../src/components/template/TemplatePreview';
import type { Template } from '../../../src/types';

describe('TemplatePreview', () => {
  const mockTemplate: Template = {
    id: 'template-1',
    name: 'Test Template',
    category: 'qa-questions',
    description: 'A test template',
    content: '# {{title}}\n\n## Overview\n{{overview}}',
    variables: [
      {
        name: 'title',
        description: 'Document title',
        defaultValue: 'Default Title',
        required: true,
        type: 'text',
        options: null,
      },
      {
        name: 'overview',
        description: 'Overview text',
        defaultValue: null,
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
    template: mockTemplate,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render template name', () => {
      render(<TemplatePreview {...defaultProps} />);

      expect(screen.getByText('Test Template')).toBeInTheDocument();
    });

    it('should render variable form', () => {
      render(<TemplatePreview {...defaultProps} />);

      expect(screen.getByTestId('template-variable-form')).toBeInTheDocument();
    });

    it('should render generate preview button', () => {
      render(<TemplatePreview {...defaultProps} />);

      expect(screen.getByRole('button', { name: /generate preview/i })).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<TemplatePreview {...defaultProps} />);

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('variable form', () => {
    it('should show variable input fields', () => {
      render(<TemplatePreview {...defaultProps} />);

      expect(screen.getByLabelText(/document title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/overview text/i)).toBeInTheDocument();
    });
  });

  describe('preview generation', () => {
    it('should show preview result after generate button clicked', async () => {
      render(<TemplatePreview {...defaultProps} />);

      // Fill in variables
      const titleInput = screen.getByLabelText(/document title/i);
      await userEvent.type(titleInput, 'My Title');

      const overviewInput = screen.getByLabelText(/overview text/i);
      await userEvent.type(overviewInput, 'This is the overview.');

      // Click generate
      const generateButton = screen.getByRole('button', { name: /generate preview/i });
      await userEvent.click(generateButton);

      // Check preview contains substituted content
      await waitFor(() => {
        expect(screen.getByTestId('preview-result')).toBeInTheDocument();
      });
    });

    it('should substitute variables in preview', async () => {
      render(<TemplatePreview {...defaultProps} />);

      const titleInput = screen.getByLabelText(/document title/i);
      await userEvent.type(titleInput, 'Test Title');

      const generateButton = screen.getByRole('button', { name: /generate preview/i });
      await userEvent.click(generateButton);

      await waitFor(() => {
        const previewResult = screen.getByTestId('preview-result');
        expect(previewResult.textContent).toContain('Test Title');
      });
    });
  });

  describe('close behavior', () => {
    it('should call onClose when close button clicked', async () => {
      render(<TemplatePreview {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty template', () => {
    it('should handle template with no variables', () => {
      const noVarTemplate = {
        ...mockTemplate,
        content: '# Static Content',
        variables: [],
      };
      render(<TemplatePreview {...defaultProps} template={noVarTemplate} />);

      expect(screen.getByText(/no variables to fill/i)).toBeInTheDocument();
    });
  });

  describe('data-testid', () => {
    it('should have template-preview data-testid', () => {
      render(<TemplatePreview {...defaultProps} />);

      expect(screen.getByTestId('template-preview')).toBeInTheDocument();
    });
  });
});
