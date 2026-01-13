/**
 * useDebugShortcut Hook (SPEC-DEBUG-002 TASK-002)
 *
 * Keyboard shortcut hook for toggling Debug Console
 * REQ-E-001: Toggle Debug Console with keyboard shortcut
 * REQ-W-002: Prevent input field interference
 */

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import type {
  DebugShortcutConfig,
  UseDebugShortcutReturn,
  ShortcutDisplay,
} from '../types/debug';

/**
 * Detect if current platform is macOS
 */
function isMacOS(): boolean {
  return typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/**
 * Get platform-specific shortcut display
 */
export function getShortcutDisplay(): ShortcutDisplay {
  const isMac = isMacOS();
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';
  return {
    key: 'D',
    modifierKey,
    fullShortcut: `${modifierKey}+Shift+D`,
  };
}

/**
 * Check if active element is an input field
 * REQ-W-002: Prevent shortcut when typing in input fields
 */
function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) {
    return false;
  }

  const tagName = activeElement.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea';

  // Check contenteditable (both attribute and property)
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true' ||
    (activeElement as HTMLElement).isContentEditable;

  return isInput || isContentEditable;
}

/**
 * Build default configuration based on platform
 * macOS: Cmd + Shift + D (avoid Chrome DevTools conflicts)
 * Windows/Linux: Ctrl + Shift + D
 */
function getDefaultConfig(): DebugShortcutConfig {
  const isMac = isMacOS();
  return {
    key: 'd',
    modifiers: {
      ctrl: !isMac, // Windows/Linux use Ctrl
      meta: isMac,  // macOS uses Cmd
      alt: false,
      shift: true,  // Shift key 추가
    },
    enabled: true,
  };
}

/**
 * Check if keyboard event matches shortcut configuration
 */
function matchesShortcut(
  event: KeyboardEvent,
  config: DebugShortcutConfig
): boolean {
  // Check key match (case-insensitive)
  const keyMatch = event.key.toLowerCase() === config.key.toLowerCase();

  // Check Alt (always required)
  if (config.modifiers.alt !== event.altKey) {
    return false;
  }

  // Check Shift
  if (config.modifiers.shift !== event.shiftKey) {
    return false;
  }

  // Check Ctrl and Meta
  // On macOS: Meta is Cmd, Ctrl is Ctrl
  // On Windows/Linux: Ctrl is the primary modifier
  // We accept either Ctrl or Meta if the config specifies either for the platform
  const wantsCtrlOrMeta = config.modifiers.ctrl || config.modifiers.meta;
  const hasCtrlOrMeta = event.ctrlKey || event.metaKey;

  if (wantsCtrlOrMeta) {
    if (!hasCtrlOrMeta) {
      return false;
    }
    // On macOS, if config wants Meta, require Meta (Cmd)
    // On other platforms, if config wants Ctrl, require Ctrl
    if (isMacOS() && config.modifiers.meta && !event.metaKey) {
      return false;
    }
    if (!isMacOS() && config.modifiers.ctrl && !event.ctrlKey) {
      return false;
    }
  } else {
    // If config doesn't want Ctrl/Meta, make sure neither is pressed
    if (event.ctrlKey || event.metaKey) {
      return false;
    }
  }

  return keyMatch;
}

/**
 * Hook for handling Debug Console keyboard shortcut
 *
 * @param toggleFn - Function to call when shortcut is triggered
 * @param config - Shortcut configuration (optional)
 * @returns Hook control interface
 */
export function useDebugShortcut(
  toggleFn: () => void,
  config: Partial<DebugShortcutConfig> = {}
): UseDebugShortcutReturn {
  const toggleFnRef = useRef(toggleFn);
  const [isListening, setIsListening] = useState(false);
  const isManuallyStoppedRef = useRef(false);

  // Keep toggleFn ref updated
  useEffect(() => {
    toggleFnRef.current = toggleFn;
  }, [toggleFn]);

  // Build full configuration with platform-specific defaults
  const fullConfig = useMemo<DebugShortcutConfig>(() => {
    return {
      ...getDefaultConfig(),
      ...config,
      modifiers: {
        ...getDefaultConfig().modifiers,
        ...config.modifiers,
      },
    };
  }, [config]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!fullConfig.enabled) {
      return;
    }

    // REQ-W-002: Don't trigger when input field is focused
    if (isInputFocused()) {
      return;
    }

    // Check if event matches shortcut
    if (matchesShortcut(event, fullConfig)) {
      event.preventDefault();
      toggleFnRef.current();
    }
  }, [fullConfig]);

  // Register event listener
  const register = useCallback(() => {
    if (isListening) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    setIsListening(true);
    isManuallyStoppedRef.current = false;
  }, [isListening, handleKeyDown]);

  // Unregister event listener
  const unregister = useCallback(() => {
    window.removeEventListener('keydown', handleKeyDown);
    setIsListening(false);
    isManuallyStoppedRef.current = true;
  }, [handleKeyDown]);

  // Auto-register on mount, cleanup on unmount
  useEffect(() => {
    // Don't auto-register if manually stopped
    if (isManuallyStoppedRef.current) {
      return;
    }

    if (fullConfig.enabled) {
      window.addEventListener('keydown', handleKeyDown);
      // Update state to reflect listener status
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsListening(true);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        setIsListening(false);
      };
    }
  }, [fullConfig.enabled, handleKeyDown]);

  return {
    isSupported: true, // All modern browsers support keyboard events
    isListening,
    register,
    unregister,
  };
}

/**
 * Hook that returns the current shortcut display string
 * Useful for showing hints in UI
 */
export function useShortcutDisplay(): ShortcutDisplay {
  // Platform won't change during session, but return as hook for consistency
  return getShortcutDisplay();
}
