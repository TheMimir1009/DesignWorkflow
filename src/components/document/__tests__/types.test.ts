/**
 * Types Test
 * SPEC-DOCEDIT-002: Verify SaveStatus type structure and compatibility
 *
 * This test ensures that the SaveStatus type is properly defined
 * and maintains compatibility with existing code.
 */

import { describe, it, expect } from 'vitest';
import type { SaveStatus } from '../types';

describe('SaveStatus Type', () => {
  describe('Type Structure', () => {
    it('should accept valid status values', () => {
      const validStatuses: SaveStatus[] = [
        'saved',
        'saving',
        'error',
        'unsaved',
      ];

      validStatuses.forEach((status) => {
        expect(status).toBeDefined();
        expect(typeof status).toBe('string');
      });
    });

    it('should have all required status values', () => {
      // Verify all expected status values exist
      const statusValues: SaveStatus[] = ['saved', 'saving', 'error', 'unsaved'];

      expect(statusValues).toHaveLength(4);
      expect(statusValues).toContain('saved');
      expect(statusValues).toContain('saving');
      expect(statusValues).toContain('error');
      expect(statusValues).toContain('unsaved');
    });
  });

  describe('Type Compatibility', () => {
    it('should be assignable to string', () => {
      const status: SaveStatus = 'saved';
      const stringValue: string = status;

      expect(stringValue).toBe('saved');
    });

    it('should accept literal type assignments', () => {
      const status1: SaveStatus = 'saved';
      const status2: SaveStatus = 'saving';
      const status3: SaveStatus = 'error';
      const status4: SaveStatus = 'unsaved';

      expect(status1).toBe('saved');
      expect(status2).toBe('saving');
      expect(status3).toBe('error');
      expect(status4).toBe('unsaved');
    });

    it('should work with union types', () => {
      const status: SaveStatus | 'pending' = 'saved';
      expect(status).toBe('saved');
    });

    it('should be usable in const assertions', () => {
      const statuses = {
        saved: 'saved' as const,
        saving: 'saving' as const,
        error: 'error' as const,
        unsaved: 'unsaved' as const,
      } as const;

      type StatusValues = typeof statuses[keyof typeof statuses];
      const status: StatusValues = 'saved';

      expect(status).toBe('saved');
    });
  });

  describe('Type Guards and Assertions', () => {
    it('should support type guards', () => {
      const isValidSaveStatus = (value: string): value is SaveStatus => {
        return ['saved', 'saving', 'error', 'unsaved'].includes(value);
      };

      expect(isValidSaveStatus('saved')).toBe(true);
      expect(isValidSaveStatus('invalid')).toBe(false);
    });

    it('should work with switch statements', () => {
      const getStatusText = (status: SaveStatus): string => {
        switch (status) {
          case 'saved':
            return 'Saved';
          case 'saving':
            return 'Saving...';
          case 'error':
            return 'Error';
          case 'unsaved':
            return 'Unsaved changes';
          default:
            // TypeScript should ensure this is unreachable
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
        }
      };

      expect(getStatusText('saved')).toBe('Saved');
      expect(getStatusText('saving')).toBe('Saving...');
      expect(getStatusText('error')).toBe('Error');
      expect(getStatusText('unsaved')).toBe('Unsaved changes');
    });
  });

  describe('Type Inference', () => {
    it('should infer type from array', () => {
      const statuses = ['saved', 'saving', 'error', 'unsaved'] as const;
      type InferredStatus = (typeof statuses)[number];

      const status: SaveStatus = statuses[0];
      expect(status).toBe('saved');
    });

    it('should work with generic functions', () => {
      const getStatus = <T extends SaveStatus>(status: T): T => {
        return status;
      };

      const savedStatus = getStatus('saved' as const);
      expect(savedStatus).toBe('saved');
    });
  });

  describe('Backward Compatibility', () => {
    it('should match the original SaveStatus from EnhancedDocumentEditor', () => {
      // This test ensures the new type is compatible with the old one
      const oldStyleStatus: 'saved' | 'saving' | 'error' | 'unsaved' = 'saved';
      const newStyleStatus: SaveStatus = oldStyleStatus;

      expect(newStyleStatus).toBe('saved');
    });

    it('should be usable in existing component patterns', () => {
      // Simulate existing component usage patterns
      const useSaveStatus = () => {
        return ['saved' as SaveStatus, (s: SaveStatus) => {}] as const;
      };

      const [status, setStatus] = useSaveStatus();
      expect(status).toBe('saved');
      expect(typeof setStatus).toBe('function');
    });
  });

  describe('Type Export', () => {
    it('should be exportable from types module', async () => {
      // Note: type-only exports don't appear at runtime
      // We verify the module loads and type checking works at compile time
      const typesModule = await import('../types');
      expect(typesModule).toBeDefined();

      // Type check at compile time
      type SaveStatus = typeof import('../types').SaveStatus;
      const status: SaveStatus = 'saved';
      expect(status).toBe('saved');
    });

    it('should have consistent type across multiple imports', async () => {
      const [typesModule, editorModule] = await Promise.all([
        import('../types'),
        import('../EnhancedDocumentEditor'),
      ]);

      const typesSaveStatus: typeof typesModule.SaveStatus = 'saved';
      const editorSaveStatus: typeof editorModule.SaveStatus = typesSaveStatus;

      expect(editorSaveStatus).toBe('saved');
    });
  });
});
