/**
 * TemplateManager Component Tests
 * TDD: Tests for main template management page
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateManager } from '../../../src/components/template/TemplateManager';

// Mock the template store
const mockFetchTemplates = vi.fn().mockResolvedValue(undefined);
const mockCreateTemplate = vi.fn().mockResolvedValue(undefined);
const mockUpdateTemplate = vi.fn().mockResolvedValue(undefined);
const mockDeleteTemplate = vi.fn().mockResolvedValue(undefined);
const mockSetSelectedCategory = vi.fn();
const mockSetSearchQuery = vi.fn();

vi.mock('../../../src/store/templateStore', () => ({
  useTemplateStore: vi.fn((selector) => {
    const state = {
      templates: [
        {
          id: 'template-1',
          name: 'Q&A Template',
          category: 'qa-questions',
          description: 'Q&A template',
          content: '# {{title}}',
          variables: [],
          isDefault: false,
          projectId: 'project-1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'template-2',
          name: 'Doc Template',
          category: 'document-structure',
          description: 'Document template',
          content: '## {{section}}',
          variables: [],
          isDefault: true,
          projectId: null,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ],
      selectedCategory: null,
      searchQuery: '',
      isLoading: false,
      error: null,
      fetchTemplates: mockFetchTemplates,
      createTemplate: mockCreateTemplate,
      updateTemplate: mockUpdateTemplate,
      deleteTemplate: mockDeleteTemplate,
      setSelectedCategory: mockSetSelectedCategory,
      setSearchQuery: mockSetSearchQuery,
    };
    return selector ? selector(state) : state;
  }),
  selectFilteredTemplates: vi.fn(() => [
    {
      id: 'template-1',
      name: 'Q&A Template',
      category: 'qa-questions',
      description: 'Q&A template',
      content: '# {{title}}',
      variables: [],
      isDefault: false,
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'template-2',
      name: 'Doc Template',
      category: 'document-structure',
      description: 'Document template',
      content: '## {{section}}',
      variables: [],
      isDefault: true,
      projectId: null,
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ]),
}));

describe('TemplateManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      render(<TemplateManager />);

      expect(screen.getByText(/template management/i)).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<TemplateManager />);

      expect(screen.getByRole('button', { name: /new template/i })).toBeInTheDocument();
    });

    it('should render category filter tabs', () => {
      render(<TemplateManager />);

      // Find category tab buttons by their specific class
      const categoryTabs = screen.getAllByRole('button').filter(btn =>
        btn.className.includes('rounded-md') && btn.className.includes('px-4')
      );

      const tabTexts = categoryTabs.map(btn => btn.textContent);
      expect(tabTexts).toContain('All');
      expect(tabTexts).toContain('qa-questions');
      expect(tabTexts).toContain('document-structure');
      expect(tabTexts).toContain('prompts');
    });

    it('should render search input', () => {
      render(<TemplateManager />);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should render template list', () => {
      render(<TemplateManager />);

      expect(screen.getByTestId('template-list')).toBeInTheDocument();
    });
  });

  describe('data fetching', () => {
    it('should fetch templates on mount', () => {
      render(<TemplateManager />);

      expect(mockFetchTemplates).toHaveBeenCalled();
    });
  });

  describe('category filtering', () => {
    it('should call setSelectedCategory when category tab clicked', async () => {
      render(<TemplateManager />);

      // Find category tab buttons specifically
      const categoryTabs = screen.getAllByRole('button').filter(btn =>
        btn.className.includes('rounded-md') &&
        btn.className.includes('px-4') &&
        btn.textContent === 'qa-questions'
      );

      await userEvent.click(categoryTabs[0]);

      expect(mockSetSelectedCategory).toHaveBeenCalledWith('qa-questions');
    });

    it('should call setSelectedCategory with null when All tab clicked', async () => {
      render(<TemplateManager />);

      // Find the All tab
      const categoryTabs = screen.getAllByRole('button').filter(btn =>
        btn.className.includes('rounded-md') &&
        btn.className.includes('px-4') &&
        btn.textContent === 'All'
      );

      await userEvent.click(categoryTabs[0]);

      expect(mockSetSelectedCategory).toHaveBeenCalledWith(null);
    });
  });

  describe('search', () => {
    it('should call setSearchQuery when search input changes', async () => {
      render(<TemplateManager />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'test');

      expect(mockSetSearchQuery).toHaveBeenCalled();
    });
  });

  describe('create template', () => {
    it('should open create modal when new template button clicked', async () => {
      render(<TemplateManager />);

      const newButton = screen.getByRole('button', { name: /new template/i });
      await userEvent.click(newButton);

      await waitFor(() => {
        expect(screen.getByTestId('template-create-modal')).toBeInTheDocument();
      });
    });
  });

  describe('data-testid', () => {
    it('should have template-manager data-testid', () => {
      render(<TemplateManager />);

      expect(screen.getByTestId('template-manager')).toBeInTheDocument();
    });
  });
});
