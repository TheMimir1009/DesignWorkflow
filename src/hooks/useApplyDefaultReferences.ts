/**
 * useApplyDefaultReferences Hook
 * Auto-applies default references when project changes
 * SPEC-REFERENCE-001: Reference System Selection
 */
import { useEffect, useRef } from 'react';
import { useReferenceStore } from '../store/referenceStore';
import type { Project } from '../types';

/**
 * Hook that automatically applies default references when the project changes
 * @param project - The current project (or null if no project selected)
 */
export function useApplyDefaultReferences(project: Project | null): void {
  const { applyDefaultReferences, clearReferences } = useReferenceStore();
  const previousProjectIdRef = useRef<string | null>(null);

  useEffect(() => {
    // If project becomes null, clear all references
    if (!project) {
      if (previousProjectIdRef.current !== null) {
        clearReferences();
      }
      previousProjectIdRef.current = null;
      return;
    }

    // Only apply default references if the project id has changed
    if (project.id !== previousProjectIdRef.current) {
      applyDefaultReferences(project.defaultReferences);
      previousProjectIdRef.current = project.id;
    }
  }, [project, applyDefaultReferences, clearReferences]);
}
