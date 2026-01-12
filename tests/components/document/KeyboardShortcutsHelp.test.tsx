/**
 * KeyboardShortcutsHelp Component Tests
 * TDD test suite for SPEC-DOCEDIT-001 Keyboard Shortcuts Help
 *
 * Test Coverage:
 * - Display modal with shortcut list
 * - Keyboard shortcuts: Ctrl+S, Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+Shift+K
 * - Modal open/close functionality
 * - Accessibility attributes
 * - Platform-specific key displays (Mac vs Windows/Linux)
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardShortcutsHelp } from '../../../src/components/document/KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByTestId('keyboard-shortcuts-help')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<KeyboardShortcutsHelp {...baseProps} isOpen={false} />);

      expect(screen.queryByTestId('keyboard-shortcuts-help')).not.toBeInTheDocument();
    });

    it('should render modal title', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts Display', () => {
    it('should display Ctrl+S shortcut for save', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/Save document/i)).toBeInTheDocument();
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0);
      expect(screen.getAllByText('S').length).toBeGreaterThan(0);
    });

    it('should display Ctrl+B shortcut for bold', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/Bold text/i)).toBeInTheDocument();
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0);
      expect(screen.getAllByText('B').length).toBeGreaterThan(0);
    });

    it('should display Ctrl+I shortcut for italic', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/Italic text/i)).toBeInTheDocument();
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0);
      expect(screen.getAllByText('I').length).toBeGreaterThan(0);
    });

    it('should display Ctrl+K shortcut for inline code', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/Inline code/i)).toBeInTheDocument();
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0);
      expect(screen.getAllByText('K').length).toBeGreaterThan(0);
    });

    it('should display Ctrl+Shift+K shortcut for code block', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/Code block/i)).toBeInTheDocument();
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Shift').length).toBeGreaterThan(0);
      expect(screen.getAllByText('K').length).toBeGreaterThan(0);
    });

    it('should display Tab shortcut for indent', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/Increase indent/i)).toBeInTheDocument();
      expect(screen.getAllByText('Tab').length).toBeGreaterThan(0);
    });

    it('should display Shift+Tab shortcut for outdent', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      expect(screen.getByText(/Decrease indent/i)).toBeInTheDocument();
      expect(screen.getAllByText('Shift').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tab').length).toBeGreaterThan(0);
    });
  });

  describe('Platform-Specific Keys', () => {
    it('should display Cmd key on Mac platform', () => {
      // Mock navigator.platform to return Mac
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });

      render(<KeyboardShortcutsHelp {...baseProps} />);

      // Should show Cmd instead of Ctrl on Mac
      const cmdKeys = screen.getAllByText(/Cmd/);
      expect(cmdKeys.length).toBeGreaterThan(0);
    });

    it('should display Ctrl key on Windows platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
      });

      render(<KeyboardShortcutsHelp {...baseProps} />);

      // Should show Ctrl on Windows
      const ctrlKeys = screen.getAllByText(/Ctrl/);
      expect(ctrlKeys.length).toBeGreaterThan(0);
    });

    it('should display Ctrl key on Linux platform', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Linux x86_64',
        writable: true,
      });

      render(<KeyboardShortcutsHelp {...baseProps} />);

      // Should show Ctrl on Linux
      const ctrlKeys = screen.getAllByText(/Ctrl/);
      expect(ctrlKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Modal Interaction', () => {
    it('should call onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();

      render(<KeyboardShortcutsHelp {...baseProps} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      const mockOnClose = vi.fn();

      render(<KeyboardShortcutsHelp {...baseProps} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const mockOnClose = vi.fn();

      render(<KeyboardShortcutsHelp {...baseProps} onClose={mockOnClose} />);

      // Click on modal overlay (backdrop)
      const modalOverlay = screen.getByTestId('keyboard-shortcuts-help');
      fireEvent.click(modalOverlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      const modal = screen.getByTestId('keyboard-shortcuts-help');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-label for modal', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      const modal = screen.getByTestId('keyboard-shortcuts-help');
      expect(modal).toHaveAttribute('aria-label');
    });

    it('should trap focus within modal', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveFocus();
    });

    it('should be accessible via keyboard', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });

      // Tab key should navigate within modal
      fireEvent.keyDown(closeButton, { key: 'Tab', code: 'Tab' });

      // Should still be in modal
      expect(screen.getByTestId('keyboard-shortcuts-help')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className when provided', () => {
      const customClass = 'custom-modal-class';

      const { container } = render(
        <KeyboardShortcutsHelp {...baseProps} className={customClass} />
      );

      const modal = container.querySelector(`.${customClass}`);
      expect(modal).toBeInTheDocument();
    });

    it('should display shortcuts in a list or grid format', () => {
      render(<KeyboardShortcutsHelp {...baseProps} />);

      const shortcutsList = screen.getByTestId('shortcuts-list');
      expect(shortcutsList).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onClose callback gracefully', () => {
      expect(() => {
        render(<KeyboardShortcutsHelp {...baseProps} onClose={undefined as any} />);
      }).not.toThrow();
    });

    it('should handle rapid open/close transitions', () => {
      const { rerender } = render(<KeyboardShortcutsHelp {...baseProps} />);

      // Rapid open/close
      rerender(<KeyboardShortcutsHelp {...baseProps} isOpen={false} />);
      rerender(<KeyboardShortcutsHelp {...baseProps} isOpen={true} />);
      rerender(<KeyboardShortcutsHelp {...baseProps} isOpen={false} />);

      expect(screen.queryByTestId('keyboard-shortcuts-help')).not.toBeInTheDocument();
    });
  });
});
