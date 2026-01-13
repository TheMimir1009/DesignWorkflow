/**
 * useBeforeUnload Hook
 * TAG-DOC-005: Warns user about unsaved changes before leaving the page
 *
 * Adds/removes beforeunload event listener based on unsavedChanges flag.
 * Displays browser's native confirmation dialog when user tries to leave
 * with unsaved changes.
 */
import { useEffect, useCallback } from 'react';

/**
 * Hook that warns users about unsaved changes before leaving the page.
 *
 * @param unsavedChanges - Whether there are unsaved changes
 * @param message - Optional custom message (note: most browsers ignore custom messages)
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const [isDirty, setIsDirty] = useState(false);
 *
 *   useBeforeUnload(isDirty);
 *
 *   return <textarea onChange={() => setIsDirty(true)} />;
 * }
 * ```
 */
export function useBeforeUnload(
  unsavedChanges: boolean,
  message: string = 'You have unsaved changes. Are you sure you want to leave?'
): void {
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        // Modern browsers ignore custom messages but require returnValue
        event.preventDefault();
        // For older browsers
        event.returnValue = message;
        return message;
      }
    },
    [unsavedChanges, message]
  );

  useEffect(() => {
    if (unsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges, handleBeforeUnload]);
}
