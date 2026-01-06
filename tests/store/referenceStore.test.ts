/**
 * Reference Store Tests
 * TDD test suite for Zustand reference selection state management
 * SPEC-REFERENCE-001: Reference System Selection
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useReferenceStore, selectSelectedCount } from '../../src/store/referenceStore.ts';

describe('referenceStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useReferenceStore.setState({
      selectedReferences: [],
    });
  });

  describe('initial state', () => {
    it('should have empty selectedReferences array', () => {
      const { result } = renderHook(() => useReferenceStore());

      expect(result.current.selectedReferences).toEqual([]);
    });
  });

  describe('setSelectedReferences', () => {
    it('should set the entire selectedReferences array', () => {
      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.setSelectedReferences(['ref-1', 'ref-2', 'ref-3']);
      });

      expect(result.current.selectedReferences).toEqual(['ref-1', 'ref-2', 'ref-3']);
    });

    it('should replace existing references with new array', () => {
      useReferenceStore.setState({ selectedReferences: ['old-ref-1', 'old-ref-2'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.setSelectedReferences(['new-ref-1']);
      });

      expect(result.current.selectedReferences).toEqual(['new-ref-1']);
    });

    it('should handle empty array', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.setSelectedReferences([]);
      });

      expect(result.current.selectedReferences).toEqual([]);
    });
  });

  describe('addReference', () => {
    it('should add a new reference to the list', () => {
      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.addReference('ref-1');
      });

      expect(result.current.selectedReferences).toContain('ref-1');
    });

    it('should not add duplicate references', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.addReference('ref-1');
      });

      expect(result.current.selectedReferences).toEqual(['ref-1']);
      expect(result.current.selectedReferences).toHaveLength(1);
    });

    it('should add multiple unique references', () => {
      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.addReference('ref-1');
        result.current.addReference('ref-2');
        result.current.addReference('ref-3');
      });

      expect(result.current.selectedReferences).toEqual(['ref-1', 'ref-2', 'ref-3']);
    });
  });

  describe('removeReference', () => {
    it('should remove an existing reference', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1', 'ref-2', 'ref-3'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.removeReference('ref-2');
      });

      expect(result.current.selectedReferences).toEqual(['ref-1', 'ref-3']);
    });

    it('should do nothing when removing non-existent reference', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1', 'ref-2'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.removeReference('non-existent');
      });

      expect(result.current.selectedReferences).toEqual(['ref-1', 'ref-2']);
    });

    it('should handle removing from empty array', () => {
      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.removeReference('ref-1');
      });

      expect(result.current.selectedReferences).toEqual([]);
    });
  });

  describe('toggleReference', () => {
    it('should add reference if not selected', () => {
      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.toggleReference('ref-1');
      });

      expect(result.current.selectedReferences).toContain('ref-1');
    });

    it('should remove reference if already selected', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1', 'ref-2'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.toggleReference('ref-1');
      });

      expect(result.current.selectedReferences).not.toContain('ref-1');
      expect(result.current.selectedReferences).toContain('ref-2');
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useReferenceStore());

      // Add
      act(() => {
        result.current.toggleReference('ref-1');
      });
      expect(result.current.selectedReferences).toContain('ref-1');

      // Remove
      act(() => {
        result.current.toggleReference('ref-1');
      });
      expect(result.current.selectedReferences).not.toContain('ref-1');

      // Add again
      act(() => {
        result.current.toggleReference('ref-1');
      });
      expect(result.current.selectedReferences).toContain('ref-1');
    });
  });

  describe('clearReferences', () => {
    it('should clear all selected references', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1', 'ref-2', 'ref-3'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.clearReferences();
      });

      expect(result.current.selectedReferences).toEqual([]);
    });

    it('should handle clearing already empty array', () => {
      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.clearReferences();
      });

      expect(result.current.selectedReferences).toEqual([]);
    });
  });

  describe('applyDefaultReferences', () => {
    it('should apply default references (replacing current selection)', () => {
      useReferenceStore.setState({ selectedReferences: ['old-ref'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.applyDefaultReferences(['default-1', 'default-2']);
      });

      expect(result.current.selectedReferences).toEqual(['default-1', 'default-2']);
    });

    it('should handle empty default references', () => {
      useReferenceStore.setState({ selectedReferences: ['old-ref'] });

      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.applyDefaultReferences([]);
      });

      expect(result.current.selectedReferences).toEqual([]);
    });
  });

  describe('isReferenceSelected (computed/helper)', () => {
    it('should return true for selected reference', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1', 'ref-2'] });

      const { result } = renderHook(() => useReferenceStore());

      expect(result.current.isReferenceSelected('ref-1')).toBe(true);
    });

    it('should return false for non-selected reference', () => {
      useReferenceStore.setState({ selectedReferences: ['ref-1', 'ref-2'] });

      const { result } = renderHook(() => useReferenceStore());

      expect(result.current.isReferenceSelected('ref-3')).toBe(false);
    });

    it('should return false when no references are selected', () => {
      const { result } = renderHook(() => useReferenceStore());

      expect(result.current.isReferenceSelected('ref-1')).toBe(false);
    });
  });

  describe('selectedCount (computed via selector)', () => {
    it('should return the count of selected references', () => {
      const { result } = renderHook(() => useReferenceStore());

      act(() => {
        result.current.setSelectedReferences(['ref-1', 'ref-2', 'ref-3']);
      });

      // Use selector for computed value
      const state = useReferenceStore.getState();
      expect(selectSelectedCount(state)).toBe(3);
    });

    it('should return 0 when no references are selected', () => {
      const state = useReferenceStore.getState();
      expect(selectSelectedCount(state)).toBe(0);
    });
  });
});
