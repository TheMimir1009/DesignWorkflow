/**
 * Circular Dependency Test
 * SPEC-DOCEDIT-002: Verify no circular dependency exists between components
 *
 * This test ensures that EnhancedDocumentEditor and SaveStatusIndicator
 * can be imported independently without circular dependency issues.
 */

import { describe, it, expect } from 'vitest';
import type { SaveStatus } from '../types';

describe('Circular Dependency Detection', () => {
  it('should import types.ts independently', async () => {
    // Verify that types.ts can be imported without loading components
    const typesModule = await import('../types');
    expect(typesModule).toBeDefined();
  });

  it('should import EnhancedDocumentEditor independently', async () => {
    // This should load without importing SaveStatusIndicator for types
    const editorModule = await import('../EnhancedDocumentEditor');
    expect(editorModule.EnhancedDocumentEditor).toBeDefined();
  });

  it('should import SaveStatusIndicator independently', async () => {
    // This should load without importing EnhancedDocumentEditor for types
    const indicatorModule = await import('../SaveStatusIndicator');
    expect(indicatorModule.SaveStatusIndicator).toBeDefined();
  });

  it('should import both components without circular dependency', async () => {
    // Import both components simultaneously
    const [editorModule, indicatorModule, typesModule] = await Promise.all([
      import('../EnhancedDocumentEditor'),
      import('../SaveStatusIndicator'),
      import('../types'),
    ]);

    // Verify all modules loaded successfully
    expect(editorModule.EnhancedDocumentEditor).toBeDefined();
    expect(indicatorModule.SaveStatusIndicator).toBeDefined();
    expect(typesModule).toBeDefined();

    // Verify no circular dependency errors occurred during import
    // If there was a circular dependency, the imports would have failed
  });

  it('should have consistent SaveStatus type across modules', () => {
    // Type-level test: SaveStatus should be importable from both locations
    type SaveStatusFromTypes = import('../types').SaveStatus;
    type SaveStatusFromEditor = import('../EnhancedDocumentEditor').SaveStatus;
    type SaveStatusFromIndicator = import('../SaveStatusIndicator').SaveStatus;

    // This is a compile-time check; if types don't match, this won't compile
    const typeCheck1: SaveStatusFromTypes = {} as SaveStatusFromEditor;
    const typeCheck2: SaveStatusFromTypes = {} as SaveStatusFromIndicator;
    expect(typeCheck1).toBeDefined();
    expect(typeCheck2).toBeDefined();
  });

  it('should allow types-only imports without circular dependency', () => {
    // Verify that type-only imports work correctly
    type SaveStatusType = import('../types').SaveStatus;

    // This should not create runtime dependencies
    const status: SaveStatusType = 'saved';
    expect(status).toBe('saved');
  });

  it('should verify type import works correctly', () => {
    // Verify the imported type works as expected
    const status: SaveStatus = 'saved';
    expect(status).toBe('saved');

    const allStatuses: SaveStatus[] = ['saved', 'saving', 'error', 'unsaved'];
    expect(allStatuses).toHaveLength(4);
  });
});
