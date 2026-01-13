/**
 * DocumentEditor Component Tests
 * TAG-DOC-002: Split-view markdown editor with preview
 *
 * Test Cases:
 * - TC-DOC-005: Switches between edit/preview modes
 * - TC-DOC-006: Updates preview in real-time (debounced 300ms)
 * - TC-DOC-007: Maintains scroll position on mode switch
 * - TC-DOC-018: Shows split view in edit mode
 * - TC-DOC-019: Shows full preview in preview mode
 * - TC-DOC-020: Shows loading indicator when isLoading=true
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DocumentEditor } from '../DocumentEditor';

describe('DocumentEditor', () => {
  const defaultProps = {
    content: '# Test Content',
    onChange: vi.fn(),
    onSave: vi.fn(),
    onApprove: vi.fn(),
    isLoading: false,
    mode: 'edit' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-DOC-005: Switches between edit/preview modes', () => {
    it('should render mode toggle buttons', () => {
      render(<DocumentEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    });

    it('should highlight active mode button in edit mode', () => {
      render(<DocumentEditor {...defaultProps} mode="edit" />);
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toHaveClass('bg-blue-500');
    });

    it('should highlight active mode button in preview mode', () => {
      render(<DocumentEditor {...defaultProps} mode="preview" />);
      const previewButton = screen.getByRole('button', { name: /preview/i });
      expect(previewButton).toHaveClass('bg-blue-500');
    });
  });

  describe('TC-DOC-018: Shows split view in edit mode', () => {
    it('should show editor and preview side by side in edit mode', () => {
      render(<DocumentEditor {...defaultProps} mode="edit" />);
      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });

    it('should have two columns in edit mode', () => {
      render(<DocumentEditor {...defaultProps} mode="edit" />);
      const container = screen.getByTestId('editor-container');
      expect(container).toHaveClass('grid-cols-2');
    });
  });

  describe('TC-DOC-019: Shows full preview in preview mode', () => {
    it('should show only preview in preview mode', () => {
      render(<DocumentEditor {...defaultProps} mode="preview" />);
      expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument();
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });

    it('should have single column in preview mode', () => {
      render(<DocumentEditor {...defaultProps} mode="preview" />);
      const container = screen.getByTestId('editor-container');
      expect(container).toHaveClass('grid-cols-1');
    });
  });

  describe('TC-DOC-006: Updates preview in real-time (debounced 300ms)', () => {
    it('should call onChange when editor content changes', async () => {
      vi.useFakeTimers();
      render(<DocumentEditor {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      // Should not have called onChange yet (within debounce window)
      expect(defaultProps.onChange).not.toHaveBeenCalled();

      // Advance timers to trigger debounce
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(defaultProps.onChange).toHaveBeenCalledWith('New content');
      vi.useRealTimers();
    });

    it('should debounce onChange calls', async () => {
      vi.useFakeTimers();
      render(<DocumentEditor {...defaultProps} />);

      const textarea = screen.getByRole('textbox');

      // Type multiple characters quickly
      fireEvent.change(textarea, { target: { value: '# Test Contenta' } });
      fireEvent.change(textarea, { target: { value: '# Test Contentab' } });
      fireEvent.change(textarea, { target: { value: '# Test Contentabc' } });

      // Should not have called onChange yet (within debounce window)
      expect(defaultProps.onChange).not.toHaveBeenCalled();

      // Advance past debounce time
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Now onChange should be called once with the final value
      expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
      expect(defaultProps.onChange).toHaveBeenCalledWith('# Test Contentabc');
      vi.useRealTimers();
    });
  });

  describe('TC-DOC-020: Shows loading indicator when isLoading=true', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<DocumentEditor {...defaultProps} isLoading={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should disable save button when loading', () => {
      render(<DocumentEditor {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    });

    it('should disable approve button when loading', () => {
      render(<DocumentEditor {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: /approve/i })).toBeDisabled();
    });

    it('should not show loading spinner when isLoading is false', () => {
      render(<DocumentEditor {...defaultProps} isLoading={false} />);
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('should render save and approve buttons', () => {
      render(<DocumentEditor {...defaultProps} />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    });

    it('should call onSave when save button is clicked', () => {
      render(<DocumentEditor {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should call onApprove when approve button is clicked', () => {
      render(<DocumentEditor {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /approve/i }));
      expect(defaultProps.onApprove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content display', () => {
    it('should display content in editor textarea', () => {
      render(<DocumentEditor {...defaultProps} content="# Test Heading" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('# Test Heading');
    });

    it('should render content in preview', () => {
      render(<DocumentEditor {...defaultProps} content="# Test Heading" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Heading');
    });
  });

  describe('Mode change callback', () => {
    it('should call onModeChange when edit button is clicked', () => {
      const onModeChange = vi.fn();
      render(
        <DocumentEditor {...defaultProps} mode="preview" onModeChange={onModeChange} />
      );

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      expect(onModeChange).toHaveBeenCalledWith('edit');
    });

    it('should call onModeChange when preview button is clicked', () => {
      const onModeChange = vi.fn();
      render(
        <DocumentEditor {...defaultProps} mode="edit" onModeChange={onModeChange} />
      );

      fireEvent.click(screen.getByRole('button', { name: /preview/i }));
      expect(onModeChange).toHaveBeenCalledWith('preview');
    });

    it('should work without onModeChange callback', () => {
      // Should not throw when onModeChange is not provided
      render(<DocumentEditor {...defaultProps} />);

      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /preview/i }));
      }).not.toThrow();
    });
  });
});
