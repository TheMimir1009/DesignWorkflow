/**
 * PromptCard Component Tests
 * Tests for individual prompt template card component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptCard } from '../PromptCard';
import type { PromptTemplate } from '../../../types';

describe('PromptCard', () => {
  const mockPrompt: PromptTemplate = {
    id: 'prompt-1',
    name: 'Test Prompt',
    category: 'document-generation',
    description: 'A test prompt for document generation',
    content: 'Test content with {{variable}}',
    variables: [
      {
        name: 'variable',
        type: 'string',
        description: 'A test variable',
        required: true,
        example: 'example value',
      },
    ],
    isModified: false,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    defaultContent: 'Default content',
  };

  it('should render prompt name and description', () => {
    const onSelect = vi.fn();
    render(<PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={false} />);

    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('A test prompt for document generation')).toBeInTheDocument();
  });

  it('should render category badge', () => {
    const onSelect = vi.fn();
    render(<PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={false} />);

    expect(screen.getByText('document-generation')).toBeInTheDocument();
  });

  it('should render variable count', () => {
    const onSelect = vi.fn();
    render(<PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={false} />);

    expect(screen.getByText(/1 variable/i)).toBeInTheDocument();
  });

  it('should show modified indicator when isModified is true', () => {
    const modifiedPrompt = { ...mockPrompt, isModified: true };
    const onSelect = vi.fn();
    render(<PromptCard prompt={modifiedPrompt} onSelect={onSelect} isSelected={false} />);

    expect(screen.getByText(/modified/i)).toBeInTheDocument();
  });

  it('should not show modified indicator when isModified is false', () => {
    const onSelect = vi.fn();
    render(<PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={false} />);

    expect(screen.queryByText(/modified/i)).not.toBeInTheDocument();
  });

  it('should render version number', () => {
    const onSelect = vi.fn();
    render(<PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={false} />);

    expect(screen.getByText(/v1/i)).toBeInTheDocument();
  });

  it('should apply selected styling when isSelected is true', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={true} />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('selected');
  });

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={false} />);

    fireEvent.click(screen.getByText('Test Prompt'));
    expect(onSelect).toHaveBeenCalledWith('prompt-1');
  });

  it('should call onSelect on keyboard Enter key', () => {
    const onSelect = vi.fn();
    render(<PromptCard prompt={mockPrompt} onSelect={onSelect} isSelected={false} />);

    const card = screen.getByText('Test Prompt').closest('div');
    if (card) {
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith('prompt-1');
    }
  });

  it('should render with multiple variables', () => {
    const promptWithMultipleVars: PromptTemplate = {
      ...mockPrompt,
      variables: [
        ...mockPrompt.variables,
        {
          name: 'variable2',
          type: 'array',
          description: 'Another variable',
          required: false,
          example: 'example2',
        },
      ],
    };
    const onSelect = vi.fn();
    render(<PromptCard prompt={promptWithMultipleVars} onSelect={onSelect} isSelected={false} />);

    expect(screen.getByText(/2 variables/i)).toBeInTheDocument();
  });

  it('should render with zero variables', () => {
    const promptWithNoVars: PromptTemplate = {
      ...mockPrompt,
      variables: [],
    };
    const onSelect = vi.fn();
    render(<PromptCard prompt={promptWithNoVars} onSelect={onSelect} isSelected={false} />);

    expect(screen.getByText(/0 variables/i)).toBeInTheDocument();
  });
});
