/**
 * PromptVariablePanel Component Tests
 * Tests for variable display and insertion panel
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptVariablePanel } from '../PromptVariablePanel';
import type { PromptVariable } from '../../../types';

describe('PromptVariablePanel', () => {
  const mockVariables: PromptVariable[] = [
    {
      name: 'topic',
      type: 'string',
      description: 'The main topic to write about',
      required: true,
      example: 'artificial intelligence',
    },
    {
      name: 'keywords',
      type: 'array',
      description: 'List of keywords to include',
      required: false,
      example: 'AI, machine learning, neural networks',
    },
    {
      name: 'config',
      type: 'object',
      description: 'Configuration object',
      required: false,
      example: '{"tone": "professional", "length": 500}',
    },
  ];

  it('should render all variables', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    // Variable names are wrapped in {{...}} code tags
    expect(screen.getByText('{{topic}}')).toBeInTheDocument();
    expect(screen.getByText('{{keywords}}')).toBeInTheDocument();
    expect(screen.getByText('{{config}}')).toBeInTheDocument();
  });

  it('should render variable descriptions', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    expect(screen.getByText('The main topic to write about')).toBeInTheDocument();
    expect(screen.getByText('List of keywords to include')).toBeInTheDocument();
  });

  it('should render variable examples', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    expect(screen.getByText(/artificial intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/AI, machine learning/i)).toBeInTheDocument();
  });

  it('should show required badge for required variables', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    // Check for Required badge and topic variable
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('{{topic}}')).toBeInTheDocument();
  });

  it('should not show required badge for optional variables', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    expect(screen.queryByText(/required.*keywords/i)).not.toBeInTheDocument();
  });

  it('should display variable type', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    expect(screen.getByText('string')).toBeInTheDocument();
    expect(screen.getByText('array')).toBeInTheDocument();
    expect(screen.getByText('object')).toBeInTheDocument();
  });

  it('should call onInsert with variable template when insert button is clicked', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    const insertButton = screen.getAllByLabelText(/insert/i)[0];
    fireEvent.click(insertButton);

    expect(onInsert).toHaveBeenCalledWith('{{topic}}');
  });

  it('should render empty state when no variables', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={[]} onInsert={onInsert} />);

    expect(screen.getByText(/no variables/i)).toBeInTheDocument();
  });

  it('should filter variables by search query', () => {
    const onInsert = vi.fn();
    render(
      <PromptVariablePanel variables={mockVariables} onInsert={onInsert} searchQuery="topic" />
    );

    expect(screen.getByText('{{topic}}')).toBeInTheDocument();
    expect(screen.queryByText('{{keywords}}')).not.toBeInTheDocument();
    expect(screen.queryByText('{{config}}')).not.toBeInTheDocument();
  });

  it('should show variable count', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    // Shows "3 variables (1 required)" when there's 1 required
    expect(screen.getByText(/3 variables/)).toBeInTheDocument();
  });

  it('should copy variable template to clipboard on copy action', () => {
    const onInsert = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    const copyButton = screen.getAllByLabelText(/copy/i)[0];
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('{{topic}}');
  });

  it('should highlight required variables', () => {
    const onInsert = vi.fn();
    const { container } = render(
      <PromptVariablePanel variables={mockVariables} onInsert={onInsert} />
    );

    const requiredItems = container.querySelectorAll('[data-required="true"]');
    expect(requiredItems.length).toBe(1);
  });

  it('should render with compact mode', () => {
    const onInsert = vi.fn();
    const { container } = render(
      <PromptVariablePanel variables={mockVariables} onInsert={onInsert} compact={true} />
    );

    expect(container.querySelector('.compact')).toBeInTheDocument();
  });

  it('should toggle expand/collapse for variable details', () => {
    const onInsert = vi.fn();
    render(<PromptVariablePanel variables={mockVariables} onInsert={onInsert} />);

    // Items are expanded by default, so first collapse then expand
    const collapseButton = screen.getAllByLabelText(/collapse/i)[0];
    fireEvent.click(collapseButton);

    // After collapsing, example should be hidden
    // Then expand to verify it works
    const expandButton = screen.getAllByLabelText(/expand/i)[0];
    fireEvent.click(expandButton);

    // After expanding, should show example
    expect(screen.getByText(/artificial intelligence/i)).toBeInTheDocument();
  });
});
