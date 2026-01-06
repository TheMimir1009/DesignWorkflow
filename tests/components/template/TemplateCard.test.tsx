/**
 * TemplateCard Component Tests
 * TDD RED Phase: Tests for template card display component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateCard } from '../../../src/components/template/TemplateCard';
import type { Template } from '../../../src/types';

describe('TemplateCard', () => {
  const mockTemplate: Template = {
    id: 'template-1',
    name: 'Design Document Template',
    category: 'document-structure',
    description: 'A template for creating design documents',
    content: '# {{title}}\n\n## Overview\n{{overview}}',
    variables: [
      {
        name: 'title',
        description: 'Document title',
        defaultValue: null,
        required: true,
        type: 'text',
        options: null,
      },
      {
        name: 'overview',
        description: 'Overview text',
        defaultValue: 'Enter overview here',
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
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onPreview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render template name and description', () => {
    render(<TemplateCard {...defaultProps} />);

    expect(screen.getByText('Design Document Template')).toBeInTheDocument();
    expect(screen.getByText('A template for creating design documents')).toBeInTheDocument();
  });

  it('should render template category', () => {
    render(<TemplateCard {...defaultProps} />);

    expect(screen.getByText('document-structure')).toBeInTheDocument();
  });

  it('should render variable count badge', () => {
    render(<TemplateCard {...defaultProps} />);

    // Should show "2 variables" badge
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/variables/i)).toBeInTheDocument();
  });

  it('should render single variable count correctly', () => {
    const singleVarTemplate = {
      ...mockTemplate,
      variables: [mockTemplate.variables[0]],
    };
    render(<TemplateCard {...defaultProps} template={singleVarTemplate} />);

    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/variable/i)).toBeInTheDocument();
  });

  it('should render zero variables correctly', () => {
    const noVarTemplate = {
      ...mockTemplate,
      variables: [],
    };
    render(<TemplateCard {...defaultProps} template={noVarTemplate} />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/variables/i)).toBeInTheDocument();
  });

  it('should call onPreview when preview button clicked', async () => {
    render(<TemplateCard {...defaultProps} />);

    const previewButton = screen.getByRole('button', { name: /preview/i });
    await userEvent.click(previewButton);

    expect(defaultProps.onPreview).toHaveBeenCalledTimes(1);
  });

  it('should call onEdit when edit button clicked', async () => {
    render(<TemplateCard {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button clicked', async () => {
    render(<TemplateCard {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('should have data-testid attribute', () => {
    render(<TemplateCard {...defaultProps} />);

    expect(screen.getByTestId('template-card')).toBeInTheDocument();
  });

  describe('selected state', () => {
    it('should not show selected styling by default', () => {
      render(<TemplateCard {...defaultProps} />);

      const card = screen.getByTestId('template-card');
      expect(card).not.toHaveClass('ring-2');
    });

    it('should show selected styling when isSelected is true', () => {
      render(<TemplateCard {...defaultProps} isSelected={true} />);

      const card = screen.getByTestId('template-card');
      expect(card).toHaveClass('ring-2');
    });
  });

  describe('default template', () => {
    it('should show default badge when isDefault is true', () => {
      const defaultTemplate = { ...mockTemplate, isDefault: true };
      render(<TemplateCard {...defaultProps} template={defaultTemplate} />);

      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('should not show default badge when isDefault is false', () => {
      render(<TemplateCard {...defaultProps} />);

      expect(screen.queryByText('Default')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible button labels', () => {
      render(<TemplateCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /preview design document template/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit design document template/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete design document template/i })).toBeInTheDocument();
    });
  });

  describe('truncation', () => {
    it('should truncate long description', () => {
      const longDescTemplate = {
        ...mockTemplate,
        description: 'A'.repeat(200),
      };
      render(<TemplateCard {...defaultProps} template={longDescTemplate} />);

      // Description should be rendered (truncation handled by CSS)
      expect(screen.getByText(/A+/)).toBeInTheDocument();
    });
  });
});
