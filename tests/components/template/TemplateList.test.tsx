/**
 * TemplateList Component Tests
 * TDD RED Phase: Tests for template list with category grouping
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateList } from '../../../src/components/template/TemplateList';
import type { Template, TemplateCategory } from '../../../src/types';

describe('TemplateList', () => {
  const mockTemplates: Template[] = [
    {
      id: 'template-1',
      name: 'Q&A Template 1',
      category: 'qa-questions',
      description: 'First Q&A template',
      content: '# {{title}}',
      variables: [{ name: 'title', description: 'Title', defaultValue: null, required: true, type: 'text', options: null }],
      isDefault: false,
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'template-2',
      name: 'Q&A Template 2',
      category: 'qa-questions',
      description: 'Second Q&A template',
      content: '## {{subtitle}}',
      variables: [{ name: 'subtitle', description: 'Subtitle', defaultValue: null, required: true, type: 'text', options: null }],
      isDefault: false,
      projectId: 'project-1',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'template-3',
      name: 'Document Structure Template',
      category: 'document-structure',
      description: 'A document structure template',
      content: '# Document\n{{content}}',
      variables: [{ name: 'content', description: 'Content', defaultValue: null, required: true, type: 'textarea', options: null }],
      isDefault: true,
      projectId: null,
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-03T00:00:00.000Z',
    },
    {
      id: 'template-4',
      name: 'Prompt Template',
      category: 'prompts',
      description: 'A prompt template',
      content: 'You are {{role}}',
      variables: [{ name: 'role', description: 'Role', defaultValue: 'assistant', required: false, type: 'text', options: null }],
      isDefault: false,
      projectId: 'project-1',
      createdAt: '2024-01-04T00:00:00.000Z',
      updatedAt: '2024-01-04T00:00:00.000Z',
    },
  ];

  const defaultProps = {
    templates: mockTemplates,
    selectedCategory: null as TemplateCategory | null,
    onSelectTemplate: vi.fn(),
    onEditTemplate: vi.fn(),
    onDeleteTemplate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to get category header buttons
  const getCategoryHeaders = () => {
    return screen.getAllByRole('button').filter(btn =>
      btn.className.includes('w-full')
    );
  };

  describe('category grouping', () => {
    it('should group templates by category', () => {
      render(<TemplateList {...defaultProps} />);

      const categoryHeaders = getCategoryHeaders();
      const categoryTexts = categoryHeaders.map(btn => btn.textContent);

      // All categories should be present
      expect(categoryTexts.some(text => text?.includes('qa-questions'))).toBe(true);
      expect(categoryTexts.some(text => text?.includes('document-structure'))).toBe(true);
      expect(categoryTexts.some(text => text?.includes('prompts'))).toBe(true);
    });

    it('should display correct count for each category', () => {
      render(<TemplateList {...defaultProps} />);

      const categoryHeaders = getCategoryHeaders();

      // qa-questions has 2 templates
      const qaHeader = categoryHeaders.find(btn => btn.textContent?.includes('qa-questions'));
      expect(qaHeader).toHaveTextContent('(2)');
      // document-structure has 1 template
      const docHeader = categoryHeaders.find(btn => btn.textContent?.includes('document-structure'));
      expect(docHeader).toHaveTextContent('(1)');
      // prompts has 1 template
      const promptsHeader = categoryHeaders.find(btn => btn.textContent?.includes('prompts'));
      expect(promptsHeader).toHaveTextContent('(1)');
    });

    it('should sort categories alphabetically', () => {
      render(<TemplateList {...defaultProps} />);

      const categoryButtons = screen.getAllByRole('button').filter(btn =>
        btn.className.includes('w-full')
      );

      // document-structure, prompts, qa-questions (alphabetical order)
      const texts = categoryButtons.map(btn => btn.textContent);
      expect(texts[0]).toContain('document-structure');
      expect(texts[1]).toContain('prompts');
      expect(texts[2]).toContain('qa-questions');
    });
  });

  describe('collapse/expand', () => {
    it('should expand all categories by default', () => {
      render(<TemplateList {...defaultProps} />);

      // All templates should be visible
      expect(screen.getByText('Q&A Template 1')).toBeInTheDocument();
      expect(screen.getByText('Q&A Template 2')).toBeInTheDocument();
      expect(screen.getByText('Document Structure Template')).toBeInTheDocument();
      expect(screen.getByText('Prompt Template')).toBeInTheDocument();
    });

    it('should collapse category when header clicked', async () => {
      render(<TemplateList {...defaultProps} />);

      // Click qa-questions category header
      const categoryHeaders = getCategoryHeaders();
      const qaHeader = categoryHeaders.find(btn => btn.textContent?.includes('qa-questions'));
      await userEvent.click(qaHeader!);

      // Templates in that category should be hidden
      expect(screen.queryByText('Q&A Template 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Q&A Template 2')).not.toBeInTheDocument();

      // Other templates should still be visible
      expect(screen.getByText('Document Structure Template')).toBeInTheDocument();
      expect(screen.getByText('Prompt Template')).toBeInTheDocument();
    });

    it('should expand collapsed category when clicked again', async () => {
      render(<TemplateList {...defaultProps} />);

      const categoryHeaders = getCategoryHeaders();
      const qaHeader = categoryHeaders.find(btn => btn.textContent?.includes('qa-questions'));

      // Collapse
      await userEvent.click(qaHeader!);
      expect(screen.queryByText('Q&A Template 1')).not.toBeInTheDocument();

      // Expand
      await userEvent.click(qaHeader!);
      expect(screen.getByText('Q&A Template 1')).toBeInTheDocument();
    });
  });

  describe('template card rendering', () => {
    it('should render TemplateCard for each template', () => {
      render(<TemplateList {...defaultProps} />);

      const cards = screen.getAllByTestId('template-card');
      expect(cards).toHaveLength(4);
    });

    it('should call onSelectTemplate when preview button clicked', async () => {
      render(<TemplateList {...defaultProps} />);

      const previewButtons = screen.getAllByRole('button', { name: /preview/i });
      await userEvent.click(previewButtons[0]);

      expect(defaultProps.onSelectTemplate).toHaveBeenCalled();
    });

    it('should call onEditTemplate with template id', async () => {
      render(<TemplateList {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await userEvent.click(editButtons[0]);

      expect(defaultProps.onEditTemplate).toHaveBeenCalled();
    });

    it('should call onDeleteTemplate with template id', async () => {
      render(<TemplateList {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await userEvent.click(deleteButtons[0]);

      expect(defaultProps.onDeleteTemplate).toHaveBeenCalled();
    });
  });

  describe('filtering by category', () => {
    it('should show only templates from selected category', () => {
      render(<TemplateList {...defaultProps} selectedCategory="qa-questions" />);

      expect(screen.getByText('Q&A Template 1')).toBeInTheDocument();
      expect(screen.getByText('Q&A Template 2')).toBeInTheDocument();
      expect(screen.queryByText('Document Structure Template')).not.toBeInTheDocument();
      expect(screen.queryByText('Prompt Template')).not.toBeInTheDocument();
    });

    it('should show all templates when selectedCategory is null', () => {
      render(<TemplateList {...defaultProps} selectedCategory={null} />);

      expect(screen.getByText('Q&A Template 1')).toBeInTheDocument();
      expect(screen.getByText('Document Structure Template')).toBeInTheDocument();
      expect(screen.getByText('Prompt Template')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton when isLoading is true', () => {
      render(<TemplateList {...defaultProps} templates={[]} isLoading={true} />);

      expect(screen.getByTestId('template-list-loading')).toBeInTheDocument();
    });

    it('should not show templates when loading', () => {
      render(<TemplateList {...defaultProps} isLoading={true} />);

      expect(screen.queryByTestId('template-card')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no templates', () => {
      render(<TemplateList {...defaultProps} templates={[]} />);

      expect(screen.getByTestId('template-list-empty')).toBeInTheDocument();
      expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
    });

    it('should show empty message when filtered category has no templates', () => {
      const propsWithFilter = {
        ...defaultProps,
        templates: mockTemplates.filter(t => t.category !== 'prompts'),
        selectedCategory: 'prompts' as TemplateCategory,
      };
      render(<TemplateList {...propsWithFilter} />);

      expect(screen.getByTestId('template-list-empty')).toBeInTheDocument();
    });
  });

  describe('data-testid', () => {
    it('should have template-list data-testid', () => {
      render(<TemplateList {...defaultProps} />);

      expect(screen.getByTestId('template-list')).toBeInTheDocument();
    });
  });
});
