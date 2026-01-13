/**
 * KeyboardShortcutsHelp Component
 * TAG-DOCEDIT-004: Modal dialog displaying keyboard shortcuts
 *
 * Features:
 * - Display available keyboard shortcuts
 * - Platform-specific key displays (Cmd for Mac, Ctrl for Windows/Linux)
 * - Modal dialog with close functionality
 * - Keyboard accessibility (Escape to close)
 * - Focus trapping within modal
 */
import { useEffect, useRef } from 'react';

/**
 * Keyboard shortcut definition
 */
interface Shortcut {
  action: string;
  keys: string[];
  description: string;
}

/**
 * Props for KeyboardShortcutsHelp component
 */
export interface KeyboardShortcutsHelpProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * List of available keyboard shortcuts
 */
const SHORTCUTS: Shortcut[] = [
  { action: 'save', keys: ['Mod', 'S'], description: 'Save document' },
  { action: 'bold', keys: ['Mod', 'B'], description: 'Bold text' },
  { action: 'italic', keys: ['Mod', 'I'], description: 'Italic text' },
  { action: 'code', keys: ['Mod', 'K'], description: 'Inline code' },
  { action: 'code-block', keys: ['Mod', 'Shift', 'K'], description: 'Code block' },
  { action: 'indent', keys: ['Tab'], description: 'Increase indent' },
  { action: 'outdent', keys: ['Shift', 'Tab'], description: 'Decrease indent' },
];

/**
 * Get platform-specific modifier key
 * Returns 'Cmd' for Mac, 'Ctrl' for Windows/Linux
 */
function getModifierKey(): string {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Ctrl';
}

/**
 * Format shortcut keys for display with platform-specific modifiers
 */
function formatShortcutKeys(keys: string[]): string {
  return keys
    .map((key) => {
      if (key === 'Mod') {
        return getModifierKey();
      }
      return key;
    })
    .join(' + ');
}

/**
 * KeyboardShortcutsHelp displays a modal with available keyboard shortcuts
 *
 * @example
 * ```tsx
 * <KeyboardShortcutsHelp
 *   isOpen={showShortcuts}
 *   onClose={() => setShowShortcuts(false)}
 * />
 * ```
 */
export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  className = '',
}: KeyboardShortcutsHelpProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Handle Escape key to close modal
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  /**
   * Trap focus within modal
   */
  useEffect(() => {
    if (!isOpen || !closeButtonRef.current) return;

    // Focus close button when modal opens
    closeButtonRef.current.focus();

    // Trap focus within modal
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modifierKey = getModifierKey();

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      data-testid="keyboard-shortcuts-help"
      className={`keyboard-shortcuts-help modal-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts help"
      onClick={handleBackdropClick}
      ref={modalRef}
    >
      <div className="modal-backdrop" />
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Keyboard Shortcuts</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts help"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div data-testid="shortcuts-list" className="shortcuts-list">
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.action} className="shortcut-item">
                <div className="shortcut-description">{shortcut.description}</div>
                <div className="shortcut-keys">
                  {shortcut.keys.map((key, index) => (
                    <kbd key={index} className="shortcut-key">
                      {key === 'Mod' ? modifierKey : key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <div className="platform-note">
            {modifierKey === 'Cmd' ? 'Press' : 'Press'} {modifierKey}{' '}
            {modifierKey === 'Cmd' ? 'instead of Ctrl on Mac' : 'on Windows/Linux'}
          </div>
        </div>
      </div>
    </div>
  );
}
