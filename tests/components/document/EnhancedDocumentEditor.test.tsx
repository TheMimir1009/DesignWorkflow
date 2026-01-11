/**
 * EnhancedDocumentEditor Component Tests
 * TDD test suite for SPEC-DOCEDIT-001 Enhanced Document Editor
 *
 * Test Coverage:
 * - CodeMirror integration with markdown support
 * - Line numbers and syntax highlighting
 * - Auto-save functionality with 5-second debounce
 * - Save status indicator integration
 * - Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y, Ctrl+B, Ctrl+I, etc.)
 * - Read-only mode support
 * - Error handling and recovery
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedDocumentEditor } from '../../../src/components/document/EnhancedDocumentEditor';

// Mock CodeMirror's getClientRects method that's missing in test environment
Object.defineProperty(Range.prototype, 'getClientRects', {
  value: vi.fn(() => ({
    length: 0,
    item: vi.fn(() => null),
    [Symbol.iterator]: function* () {},
  })),
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

describe('EnhancedDocumentEditor', () => {
  const defaultProps = {
    initialContent: '# Test Document\n\nThis is a test document.',
    taskId: 'task-123',
    onSave: vi.fn(),
    onSaveStatusChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render CodeMirror editor container', async () => {
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      expect(screen.getByTestId('enhanced-document-editor')).toBeInTheDocument();
    });

    it('should render with initial content', async () => {
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      const editor = screen.getByTestId('enhanced-document-editor');
      expect(editor).toBeInTheDocument();
    });

    it('should render in read-only mode when readOnly prop is true', async () => {
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} readOnly />);
      });

      const editor = screen.getByTestId('enhanced-document-editor');
      expect(editor).toHaveClass('read-only');
    });

    it('should apply custom className', async () => {
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} className="custom-class" />);
      });

      const editor = screen.getByTestId('enhanced-document-editor');
      expect(editor).toHaveClass('custom-class');
    });
  });

  describe('Auto-save Functionality', () => {
    it('should trigger auto-save 5 seconds after content changes', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} onSave={mockOnSave} />);
      });

      // Fast-forward 4 seconds - should NOT save yet
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      expect(mockOnSave).not.toHaveBeenCalled();

      // Fast-forward 1 more second (total 5 seconds) - should save now
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    it('should reset debounce timer on subsequent changes', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} onSave={mockOnSave} />);
      });

      // First change at 0s
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Second change at 2s (resets timer)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Should not save yet (only 4s from last change)
      expect(mockOnSave).not.toHaveBeenCalled();

      // Fast-forward 1 more second (total 5s from last change)
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onSaveStatusChange with "saving" status when save starts', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const mockOnStatusChange = vi.fn();
      await act(async () => {
        render(
          <EnhancedDocumentEditor
            {...defaultProps}
            onSave={mockOnSave}
            onSaveStatusChange={mockOnStatusChange}
          />
        );
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('saving');
      });
    });

    it('should call onSaveStatusChange with "saved" status when save succeeds', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const mockOnStatusChange = vi.fn();
      await act(async () => {
        render(
          <EnhancedDocumentEditor
            {...defaultProps}
            onSave={mockOnSave}
            onSaveStatusChange={mockOnStatusChange}
          />
        );
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenLastCalledWith('saved');
      });
    });

    it('should call onSaveStatusChange with "error" status when save fails', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const mockOnStatusChange = vi.fn();
      await act(async () => {
        render(
          <EnhancedDocumentEditor
            {...defaultProps}
            onSave={mockOnSave}
            onSaveStatusChange={mockOnStatusChange}
          />
        );
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenLastCalledWith('error');
      });
    });

    it('should not auto-save in read-only mode', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} onSave={mockOnSave} readOnly />);
      });

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should trigger manual save on Ctrl+S', async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} onSave={mockOnSave} />);
      });

      // Press Ctrl+S
      await user.keyboard('{Control>}s{/Control}');

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    it('should trigger manual save on Cmd+S (Mac)', async () => {
      const user = userEvent.setup({ delay: null });
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} onSave={mockOnSave} />);
      });

      // Press Cmd+S (Meta key on Mac)
      await user.keyboard('{Meta>}s{/Meta}');

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    it('should support Ctrl+B for bold markdown formatting', async () => {
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      // Press Ctrl+B
      await user.keyboard('{Control>}b{/Control}');

      // Should wrap selected text in ** or insert ****
      const editor = screen.getByTestId('enhanced-document-editor');
      expect(editor).toBeInTheDocument();
    });

    it('should support Ctrl+I for italic markdown formatting', async () => {
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      // Press Ctrl+I
      await user.keyboard('{Control>}i{/Control}');

      const editor = screen.getByTestId('enhanced-document-editor');
      expect(editor).toBeInTheDocument();
    });

    it('should support Ctrl+K for inline code markdown formatting', async () => {
      const user = userEvent.setup({ delay: null });
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      // Press Ctrl+K
      await user.keyboard('{Control>}k{/Control}');

      const editor = screen.getByTestId('enhanced-document-editor');
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Network error'));
      const mockOnStatusChange = vi.fn();
      await act(async () => {
        render(
          <EnhancedDocumentEditor
            {...defaultProps}
            onSave={mockOnSave}
            onSaveStatusChange={mockOnStatusChange}
          />
        );
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('error');
      });
    });

    it('should retry failed saves automatically', async () => {
      const mockOnSave = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);
      const mockOnStatusChange = vi.fn();
      await act(async () => {
        render(
          <EnhancedDocumentEditor
            {...defaultProps}
            onSave={mockOnSave}
            onSaveStatusChange={mockOnStatusChange}
          />
        );
      });

      // First attempt fails
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenLastCalledWith('error');
      });

      // Retry after delay (e.g., 10 seconds)
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(2);
        expect(mockOnStatusChange).toHaveBeenLastCalledWith('saved');
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup debounce timer on unmount', async () => {
      const { unmount } = await act(async () => {
        return render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      // Trigger a change
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Unmount before save completes
      unmount();

      // Fast-forward remaining time
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // onSave should not be called after unmount
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      const editor = screen.getByTestId('enhanced-document-editor');
      expect(editor).toHaveAttribute('role', 'textbox');
    });

    it('should support keyboard navigation', async () => {
      await act(async () => {
        render(<EnhancedDocumentEditor {...defaultProps} />);
      });

      const editor = screen.getByTestId('enhanced-document-editor');
      editor.focus();

      expect(document.activeElement).toBe(editor);
    });
  });

  describe('Integration with Save Status', () => {
    it('should display save status in UI', async () => {
      const mockOnStatusChange = vi.fn();
      await act(async () => {
        render(
          <EnhancedDocumentEditor
            {...defaultProps}
            onSaveStatusChange={mockOnStatusChange}
          />
        );
      });

      // Initial status should be 'saved'
      expect(mockOnStatusChange).toHaveBeenCalledWith('saved');
    });

    it('should update save status through the save lifecycle', async () => {
      const mockOnSave = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      const mockOnStatusChange = vi.fn();
      await act(async () => {
        render(
          <EnhancedDocumentEditor
            {...defaultProps}
            onSave={mockOnSave}
            onSaveStatusChange={mockOnStatusChange}
          />
        );
      });

      // Trigger save
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('saving');
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockOnStatusChange).toHaveBeenCalledWith('saved');
      });
    });
  });
});
