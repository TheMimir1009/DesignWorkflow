/**
 * PromptList Component Tests
 * Tests for prompt list component with category grouping
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptList } from '../PromptList';
import type { PromptTemplate, PromptCategory } from '../../../types';

describe('PromptList', () => {
  const mockPrompts: PromptTemplate[] = [
    {
      id: 'prompt-1',
      name: 'Document Generator',
      category: 'document-generation',
      description: 'Generate documents from templates',
      content: 'Generate a document about {{topic}}',
      variables: [],
      isModified: false,
      version: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      defaultContent: 'Generate a document about {{topic}}',
    },
    {
      id: 'prompt-2',
      name: 'Code Refactor',
      category: 'code-operation',
      description: 'Refactor code for better quality',
      content: 'Refactor the following code',
      variables: [],
      isModified: true,
      version: 2,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      defaultContent: 'Refactor the following code',
    },
    {
      id: 'prompt-3',
      name: 'Data Analyzer',
      category: 'analysis',
      description: 'Analyze data patterns',
      content: 'Analyze the data',
      variables: [],
      isModified: false,
      version: 1,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      defaultContent: 'Analyze the data',
    },
    {
      id: 'prompt-4',
      name: 'Utility Helper',
      category: 'utility',
      description: 'Helper utility function',
      content: 'Help with utility tasks',
      variables: [],
      isModified: false,
      version: 1,
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
      defaultContent: 'Help with utility tasks',
    },
  ];

  it('should render all prompts when no category is selected', () => {
    const onSelect = vi.fn();
    render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Document Generator')).toBeInTheDocument();
    expect(screen.getByText('Code Refactor')).toBeInTheDocument();
    expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Utility Helper')).toBeInTheDocument();
  });

  it('should filter prompts by selected category', () => {
    const onSelect = vi.fn();
    render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId={null}
        selectedCategory="document-generation"
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Document Generator')).toBeInTheDocument();
    expect(screen.queryByText('Code Refactor')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Analyzer')).not.toBeInTheDocument();
    expect(screen.queryByText('Utility Helper')).not.toBeInTheDocument();
  });

  it('should group prompts by category', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
        groupByCategory={true}
      />
    );

    // Check for category groups by data-testid
    expect(container.querySelector('[data-testid="category-group-document-generation"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="category-group-code-operation"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="category-group-analysis"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="category-group-utility"]')).toBeInTheDocument();
  });

  it('should render empty state when no prompts match', () => {
    const onSelect = vi.fn();
    render(
      <PromptList
        prompts={[]}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText(/no prompts found/i)).toBeInTheDocument();
  });

  it('should render loading skeleton when loading is true', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromptList
        prompts={[]}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
        isLoading={true}
      />
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render error state when error is provided', () => {
    const onSelect = vi.fn();
    render(
      <PromptList
        prompts={[]}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
        error="Failed to load prompts"
      />
    );

    expect(screen.getByText(/failed to load prompts/i)).toBeInTheDocument();
  });

  it('should highlight selected prompt', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId="prompt-1"
        selectedCategory={null}
        onSelect={onSelect}
      />
    );

    // Check if the selected prompt card has the selected class
    const selectedCard = container.querySelector('[data-testid="prompt-card-prompt-1"]');
    expect(selectedCard?.className).toContain('selected');
  });

  it('should call onSelect when a prompt card is clicked', () => {
    const onSelect = vi.fn();
    render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText('Document Generator'));
    expect(onSelect).toHaveBeenCalledWith('prompt-1');
  });

  it('should render prompts in order by createdAt descending (newest first)', () => {
    const onSelect = vi.fn();
    render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
      />
    );

    const cards = screen.getAllByRole('button');
    // Utility Helper (latest) should come before Document Generator (oldest)
    const firstCard = cards[0];
    const lastCard = cards[cards.length - 1];

    expect(firstCard.textContent).toContain('Utility Helper');
    expect(lastCard.textContent).toContain('Document Generator');
  });

  it('should not group by category when groupByCategory is false', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId={null}
        selectedCategory={null}
        onSelect={onSelect}
        groupByCategory={false}
      />
    );

    // Check that no category groups exist
    expect(container.querySelector('[data-testid="category-group-document-generation"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="category-group-code-operation"]')).not.toBeInTheDocument();
  });

  it('should filter and group simultaneously', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromptList
        prompts={mockPrompts}
        selectedPromptId={null}
        selectedCategory="analysis"
        onSelect={onSelect}
        groupByCategory={true}
      />
    );

    // Check for the analysis category group
    expect(container.querySelector('[data-testid="category-group-analysis"]')).toBeInTheDocument();
    expect(screen.getByText('Data Analyzer')).toBeInTheDocument();
    expect(screen.queryByText('Document Generator')).not.toBeInTheDocument();
  });
});
