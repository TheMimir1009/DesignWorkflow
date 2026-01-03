/**
 * MarkdownEditor Component Tests
 * TDD test suite for a simple markdown editor component
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../../../src/components/common/MarkdownEditor';

describe('MarkdownEditor', () => {
  describe('Rendering', () => {
    it('should render with correct test id', () => {
      render(<MarkdownEditor value="" onChange={() => {}} />);

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    });

    it('should render textarea element', () => {
      render(<MarkdownEditor value="" onChange={() => {}} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with provided value', () => {
      render(<MarkdownEditor value="# Hello World" onChange={() => {}} />);

      expect(screen.getByRole('textbox')).toHaveValue('# Hello World');
    });

    it('should render with placeholder', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={() => {}}
          placeholder="Enter markdown here..."
        />
      );

      expect(screen.getByPlaceholderText('Enter markdown here...')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(
        <MarkdownEditor value="" onChange={() => {}} className="custom-class" />
      );

      expect(screen.getByTestId('markdown-editor')).toHaveClass('custom-class');
    });
  });

  describe('Interaction', () => {
    it('should call onChange when text is entered', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<MarkdownEditor value="" onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should pass new value to onChange', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<MarkdownEditor value="" onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'H');

      expect(handleChange).toHaveBeenCalledWith('H');
    });

    it('should be focusable', () => {
      render(<MarkdownEditor value="" onChange={() => {}} />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();

      expect(document.activeElement).toBe(textarea);
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<MarkdownEditor value="" onChange={() => {}} disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not call onChange when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<MarkdownEditor value="" onChange={handleChange} disabled />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label when provided', () => {
      render(
        <MarkdownEditor value="" onChange={() => {}} ariaLabel="Feature description" />
      );

      expect(screen.getByLabelText('Feature description')).toBeInTheDocument();
    });

    it('should have rows attribute for sizing', () => {
      render(<MarkdownEditor value="" onChange={() => {}} rows={10} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '10');
    });
  });

  describe('Resize Behavior', () => {
    it('should have resize vertical style by default', () => {
      render(<MarkdownEditor value="" onChange={() => {}} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveStyle({ resize: 'vertical' });
    });

    it('should allow resize none when specified', () => {
      render(<MarkdownEditor value="" onChange={() => {}} resize="none" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveStyle({ resize: 'none' });
    });
  });
});
