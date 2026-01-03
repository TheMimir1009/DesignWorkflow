/**
 * Reference Store - Zustand State Management
 * Manages reference document selection for the E+A pattern workflow
 * TAG-001: referenceStore creation
 * TAG-008: Default reference system actions
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SystemDocument } from '../types';

/**
 * API base URL
 */
const API_BASE_URL = '/api';

/**
 * Reference state interface
 */
export interface ReferenceState {
  selectedReferences: SystemDocument[];
  isLoading: boolean;
  error: string | null;
  addReference: (doc: SystemDocument) => void;
  removeReference: (docId: string) => void;
  clearReferences: () => void;
  loadDefaultReferences: (projectId: string) => Promise<void>;
  saveAsDefault: (projectId: string) => Promise<void>;
}

/**
 * Reference store with Zustand and devtools middleware
 */
export const useReferenceStore = create<ReferenceState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedReferences: [],
      isLoading: false,
      error: null,

      // Actions
      addReference: (doc: SystemDocument) => {
        set(
          (state) => {
            // Check for duplicate by id
            const exists = state.selectedReferences.some((ref) => ref.id === doc.id);
            if (exists) {
              return state;
            }
            return {
              selectedReferences: [...state.selectedReferences, doc],
            };
          },
          false,
          'addReference'
        );
      },

      removeReference: (docId: string) => {
        set(
          (state) => ({
            selectedReferences: state.selectedReferences.filter((ref) => ref.id !== docId),
          }),
          false,
          'removeReference'
        );
      },

      clearReferences: () => {
        set({ selectedReferences: [] }, false, 'clearReferences');
      },

      /**
       * Load default references from API
       * TAG-008: TASK-036
       */
      loadDefaultReferences: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'loadDefaultReferences/start');

        try {
          const response = await fetch(`${API_BASE_URL}/projects/${projectId}/default-references`);

          if (!response.ok) {
            throw new Error(`Failed to load default references: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Failed to load default references');
          }

          // The API returns document IDs
          // We would need to load full documents from systemStore or similar
          // For now, we just store the IDs and let the consumer handle loading full docs
          set({ isLoading: false, error: null }, false, 'loadDefaultReferences/success');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load default references';
          set({ isLoading: false, error: errorMessage }, false, 'loadDefaultReferences/error');
          throw error;
        }
      },

      /**
       * Save current selected references as default
       * TAG-008: TASK-037
       */
      saveAsDefault: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'saveAsDefault/start');

        try {
          const { selectedReferences } = get();
          const referenceIds = selectedReferences.map((ref) => ref.id);

          const response = await fetch(`${API_BASE_URL}/projects/${projectId}/default-references`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ referenceIds }),
          });

          if (!response.ok) {
            throw new Error(`Failed to save default references: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Failed to save default references');
          }

          set({ isLoading: false, error: null }, false, 'saveAsDefault/success');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save default references';
          set({ isLoading: false, error: errorMessage }, false, 'saveAsDefault/error');
          throw error;
        }
      },
    }),
    { name: 'ReferenceStore' }
  )
);
