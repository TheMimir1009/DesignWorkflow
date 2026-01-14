/**
 * PromptEditor Component Tests
 * Tests for prompt template editor with CodeMirror
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptEditor } from '../PromptEditor';

// Mock @uiw/react-codemirror
vi.mock('@uiw/react-codemirror', () => ({
  default: ({
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => {
    // Count lines for line count display
    const lines = value ? value.split('\n').length : 0;
    return (
      <div>
        <textarea
          data-testid="codemirror-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="cm-editor"
        />
        {/* Mock line count for testing */}
        <div data-testid="mock-line-count" data-lines={lines}>
          {lines} {lines === 1 ? 'line' : 'lines'}
        </div>
      </div>
    );
  },
}));

describe('PromptEditor', () => {
  it('should render editor with initial content', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content="Test content"
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument();
    expect(screen.getByTestId('codemirror-editor')).toHaveValue('Test content');
  });

  it('should call onChange when content changes', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content=""
        onChange={onChange}
      />
    );

    const editor = screen.getByTestId('codemirror-editor');
    fireEvent.change(editor, { target: { value: 'New content' } });

    expect(onChange).toHaveBeenCalledWith('New content');
  });

  it('should be disabled when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content="Test"
        onChange={onChange}
        disabled={true}
      />
    );

    expect(screen.getByTestId('codemirror-editor')).toBeDisabled();
  });

  it('should not be disabled when disabled prop is false', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content="Test"
        onChange={onChange}
        disabled={false}
      />
    );

    expect(screen.getByTestId('codemirror-editor')).not.toBeDisabled();
  });

  it('should display placeholder when content is empty', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content=""
        onChange={onChange}
        placeholder="Enter prompt content..."
      />
    );

    const editor = screen.getByTestId('codemirror-editor');
    expect(editor).toHaveAttribute('placeholder', 'Enter prompt content...');
  });

  it('should show variable syntax highlight', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content="Hello {{name}}, welcome to {{project}}"
        onChange={onChange}
        highlightVariables={true}
      />
    );

    expect(screen.getByTestId('codemirror-editor')).toHaveValue(
      'Hello {{name}}, welcome to {{project}}'
    );
  });

  it('should render markdown preview mode', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content="# Heading\n\nTest content"
        onChange={onChange}
        mode="markdown"
      />
    );

    expect(screen.getByTestId('codemirror-editor')).toBeInTheDocument();
  });

  it('should render in readonly mode', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content="Readonly content"
        onChange={onChange}
        readonly={true}
      />
    );

    // Readonly is handled by disabled prop in the mock
    const editor = screen.getByTestId('codemirror-editor');
    expect(editor).toBeDisabled();
  });

  it('should handle line count display', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content={`Line 1
Line 2
Line 3`}
        onChange={onChange}
        showLineCount={true}
      />
    );

    // Use getAllByText since both the component and mock show line count
    expect(screen.getAllByText('3 lines')).toHaveLength(2);
  });

  it('should handle undo callback', () => {
    const onChange = vi.fn();
    const onUndo = vi.fn();
    render(
      <PromptEditor
        content="Test"
        onChange={onChange}
        onUndo={onUndo}
      />
    );

    const undoButton = screen.getByLabelText('Undo');
    fireEvent.click(undoButton);

    expect(onUndo).toHaveBeenCalled();
  });

  it('should handle redo callback', () => {
    const onChange = vi.fn();
    const onRedo = vi.fn();
    render(
      <PromptEditor
        content="Test"
        onChange={onChange}
        onRedo={onRedo}
      />
    );

    const redoButton = screen.getByLabelText('Redo');
    fireEvent.click(redoButton);

    expect(onRedo).toHaveBeenCalled();
  });

  it('should handle reset callback', () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    render(
      <PromptEditor
        content="Modified content"
        onChange={onChange}
        onReset={onReset}
        defaultContent="Default content"
      />
    );

    const resetButton = screen.getByLabelText('Reset to default');
    fireEvent.click(resetButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('should show modified indicator when content differs from default', () => {
    const onChange = vi.fn();
    const { container } = render(
      <PromptEditor
        content="Modified content"
        onChange={onChange}
        defaultContent="Default content"
      />
    );

    // Look for the modified span with the specific class, not just text
    const modifiedSpan = container.querySelector('.text-orange-600.dark\\:text-orange-400');
    expect(modifiedSpan).toBeInTheDocument();
    expect(modifiedSpan).toHaveTextContent('Modified');
  });

  it('should not show modified indicator when content matches default', () => {
    const onChange = vi.fn();
    render(
      <PromptEditor
        content="Default content"
        onChange={onChange}
        defaultContent="Default content"
      />
    );

    expect(screen.queryByText(/modified/i)).not.toBeInTheDocument();
  });
});
