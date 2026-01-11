/**
 * useDebugShortcut Hook Tests (SPEC-DEBUG-002 TASK-008)
 *
 * Unit tests for keyboard shortcut hook functionality
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebugShortcut, getShortcutDisplay, useShortcutDisplay } from '../useDebugShortcut';

describe('useDebugShortcut', () => {
  let toggleFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    toggleFn = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Platform Detection', () => {
    it('should detect macOS platform correctly', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });

      const display = getShortcutDisplay();
      expect(display.modifierKey).toBe('Cmd');
      expect(display.fullShortcut).toBe('Cmd+Shift+D');
    });

    it('should detect Windows platform correctly', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
      });

      const display = getShortcutDisplay();
      expect(display.modifierKey).toBe('Ctrl');
      expect(display.fullShortcut).toBe('Ctrl+Shift+D');
    });

    it('should detect Linux platform correctly', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Linux x86_64',
        writable: true,
      });

      const display = getShortcutDisplay();
      expect(display.modifierKey).toBe('Ctrl');
      expect(display.fullShortcut).toBe('Ctrl+Shift+D');
    });
  });

  describe('useShortcutDisplay Hook', () => {
    it('should return shortcut display info', () => {
      const { result } = renderHook(() => useShortcutDisplay());

      expect(result.current).toHaveProperty('key', 'D');
      expect(result.current).toHaveProperty('modifierKey');
      expect(result.current).toHaveProperty('fullShortcut');
      expect(['Ctrl', 'Cmd']).toContain(result.current.modifierKey);
    });
  });

  describe('Keyboard Event Handling', () => {
    it('should call toggleFn when shortcut is triggered', () => {
      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      // Simulate Ctrl+Shift+D (or Cmd+Shift+D on Mac)
      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).toHaveBeenCalledTimes(1);
    });

    it('should not trigger when only part of shortcut is pressed', () => {
      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      // Only Shift+D, missing Ctrl/Cmd
      const event = new KeyboardEvent('keydown', {
        key: 'd',
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).not.toHaveBeenCalled();
    });

    it('should be case-insensitive for key matching', () => {
      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      // Lowercase d should work
      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).toHaveBeenCalledTimes(1);
    });

    it('should prevent default behavior when triggered', () => {
      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Input Field Exclusion', () => {
    it('should not trigger when input field is focused', () => {
      // Create an input element and focus it
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).not.toHaveBeenCalled();

      // Cleanup
      input.remove();
      document.activeElement?.blur();
    });

    it('should not trigger when textarea is focused', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).not.toHaveBeenCalled();

      // Cleanup
      textarea.remove();
      document.activeElement?.blur();
    });

    it('should NOT trigger when contenteditable element is focused', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      document.body.appendChild(div);
      div.focus();

      // Verify div is focused
      expect(document.activeElement).toBe(div);

      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).not.toHaveBeenCalled();

      // Cleanup
      div.remove();
      document.activeElement?.blur();
    });
  });

  describe('Configuration', () => {
    it('should allow custom key configuration', () => {
      renderHook(() =>
        useDebugShortcut(toggleFn, { key: 'k', modifiers: { ctrl: true, shift: false } })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).toHaveBeenCalledTimes(1);
    });

    it('should allow custom modifiers configuration', () => {
      renderHook(() =>
        useDebugShortcut(toggleFn, {
          key: 'k',
          modifiers: { ctrl: true, shift: true, alt: false, meta: false },
        })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).toHaveBeenCalledTimes(1);
    });

    it('should not trigger when disabled', () => {
      renderHook(() =>
        useDebugShortcut(toggleFn, { enabled: false })
      );

      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(toggleFn).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle Management', () => {
    it('should register listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unregister listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should update toggleFn when it changes', () => {
      const firstToggleFn = vi.fn();
      const secondToggleFn = vi.fn();

      const { rerender } = renderHook(
        ({ fn }) => useDebugShortcut(fn),
        { initialProps: { fn: firstToggleFn } }
      );

      // Wait for hook to initialize
      act(() => {
        // Trigger with first function
        const event1 = new KeyboardEvent('keydown', {
          key: 'd',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
        });
        window.dispatchEvent(event1);
      });

      expect(firstToggleFn).toHaveBeenCalled();

      // Change function
      rerender({ fn: secondToggleFn });

      // Wait for effect to settle and trigger with new function
      act(() => {
        // Trigger with new function
        const event2 = new KeyboardEvent('keydown', {
          key: 'd',
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
        });
        window.dispatchEvent(event2);
      });

      // secondToggleFn should be called (might be called multiple times due to rerender effects)
      expect(secondToggleFn).toHaveBeenCalled();
    });
  });

  describe('Manual Registration Control', () => {
    it('should provide register function', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      const { result } = renderHook(() =>
        useDebugShortcut(toggleFn, { enabled: false })
      );

      // Initially should not be registered (disabled)
      addEventListenerSpy.mockClear();

      act(() => {
        result.current.register();
      });

      expect(addEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should provide unregister function', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { result } = renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      removeEventListenerSpy.mockClear();

      act(() => {
        result.current.unregister();
      });

      expect(removeEventListenerSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });

    it('should report listening status correctly', () => {
      const { result } = renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      // Should be listening after mount (async due to useEffect)
      act(() => {
        // Just wait for state update
      });

      expect(result.current.isListening).toBe(true);

      act(() => {
        result.current.unregister();
      });

      expect(result.current.isListening).toBe(false);
    });
  });

  describe('Return Value', () => {
    it('should return correct control interface', () => {
      const { result } = renderHook(() =>
        useDebugShortcut(toggleFn)
      );

      expect(result.current).toHaveProperty('isSupported', true);
      expect(result.current).toHaveProperty('isListening');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('unregister');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.unregister).toBe('function');
    });
  });
});
