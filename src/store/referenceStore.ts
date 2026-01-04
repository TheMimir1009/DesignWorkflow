/**
 * Reference Store - Zustand State Management
 * Centralized state management for reference document selection
 * SPEC-REFERENCE-001: Reference System Selection
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Reference store state (data only)
 */
interface ReferenceStoreState {
  selectedReferences: string[];
}

/**
 * Reference store actions
 */
interface ReferenceStoreActions {
  setSelectedReferences: (ids: string[]) => void;
  addReference: (id: string) => void;
  removeReference: (id: string) => void;
  toggleReference: (id: string) => void;
  clearReferences: () => void;
  applyDefaultReferences: (ids: string[]) => void;
  isReferenceSelected: (id: string) => boolean;
}

/**
 * Combined reference store interface
 */
export interface ReferenceStore extends ReferenceStoreState, ReferenceStoreActions {}

/**
 * Selector for selected count
 */
export function selectSelectedCount(state: ReferenceStoreState): number {
  return state.selectedReferences.length;
}

/**
 * Reference store with Zustand
 * Manages the selection state for system documents used as references
 */
export const useReferenceStore = create<ReferenceStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedReferences: [],

      // Actions
      setSelectedReferences: (ids: string[]) => {
        set({ selectedReferences: ids }, false, 'setSelectedReferences');
      },

      addReference: (id: string) => {
        set(
          (state) => {
            // Prevent duplicates
            if (state.selectedReferences.includes(id)) {
              return state;
            }
            return {
              selectedReferences: [...state.selectedReferences, id],
            };
          },
          false,
          'addReference'
        );
      },

      removeReference: (id: string) => {
        set(
          (state) => ({
            selectedReferences: state.selectedReferences.filter((refId) => refId !== id),
          }),
          false,
          'removeReference'
        );
      },

      toggleReference: (id: string) => {
        set(
          (state) => {
            const isSelected = state.selectedReferences.includes(id);
            if (isSelected) {
              return {
                selectedReferences: state.selectedReferences.filter((refId) => refId !== id),
              };
            }
            return {
              selectedReferences: [...state.selectedReferences, id],
            };
          },
          false,
          'toggleReference'
        );
      },

      clearReferences: () => {
        set({ selectedReferences: [] }, false, 'clearReferences');
      },

      applyDefaultReferences: (ids: string[]) => {
        set({ selectedReferences: ids }, false, 'applyDefaultReferences');
      },

      // Helper method
      isReferenceSelected: (id: string) => {
        return get().selectedReferences.includes(id);
      },
    }),
    { name: 'ReferenceStore' }
  )
);
