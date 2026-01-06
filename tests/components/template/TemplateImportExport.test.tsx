/**
 * TemplateImportExport Component Tests
 * TDD: Tests for import/export functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateImportExport } from '../../../src/components/template/TemplateImportExport';
import type { Template } from '../../../src/types';

describe('TemplateImportExport', () => {
  const mockTemplate: Template = {
    id: 'template-1',
    name: 'Test Template',
    category: 'qa-questions',
    description: 'A test template',
    content: '# {{title}}',
    variables: [{ name: 'title', description: 'Title', defaultValue: null, required: true, type: 'text', options: null }],
    isDefault: false,
    projectId: 'project-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const defaultProps = {
    template: mockTemplate,
    onImport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('export functionality', () => {
    it('should render export button', () => {
      render(<TemplateImportExport {...defaultProps} />);

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should trigger download when export button clicked', async () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      render(<TemplateImportExport {...defaultProps} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('import functionality', () => {
    it('should render import button', () => {
      render(<TemplateImportExport {...defaultProps} />);

      expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
    });

    it('should have hidden file input', () => {
      render(<TemplateImportExport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('should accept JSON files only', () => {
      render(<TemplateImportExport {...defaultProps} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', '.json');
    });
  });

  // Note: File import testing with invalid JSON is difficult in jsdom
  // because File.text() is not fully implemented
  // Integration tests should cover this functionality

  describe('no template for export', () => {
    it('should disable export when no template provided', () => {
      render(<TemplateImportExport {...defaultProps} template={null} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeDisabled();
    });
  });

  describe('data-testid', () => {
    it('should have template-import-export data-testid', () => {
      render(<TemplateImportExport {...defaultProps} />);

      expect(screen.getByTestId('template-import-export')).toBeInTheDocument();
    });
  });
});
