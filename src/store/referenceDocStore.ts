/**
 * Reference Document Store - Zustand State Management
 * Centralized state management for document reference panel (SPEC-DOCREF-002)
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CompletedDocumentSummary, CompletedDocumentDetail } from '../types';
import * as referenceDocService from '../services/referenceDocService';

/**
 * Document type filter options
 */
export type DocumentTypeFilter = 'design' | 'prd' | 'prototype';

/**
 * Reference Document Store State
 */
export interface ReferenceDocState {
  /** Whether the panel is open */
  isPanelOpen: boolean;
  /** List of completed documents */
  documents: CompletedDocumentSummary[];
  /** Currently selected document detail */
  selectedDocument: CompletedDocumentDetail | null;
  /** Current search query */
  searchQuery: string;
  /** Active document type filters */
  filters: DocumentTypeFilter[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Reference Document Store Actions
 */
export interface ReferenceDocActions {
  /** Open the reference panel */
  openPanel: () => void;
  /** Close the reference panel */
  closePanel: () => void;
  /** Fetch completed documents for a project */
  fetchDocuments: (projectId: string) => Promise<void>;
  /** Fetch a single document detail */
  fetchDocumentDetail: (projectId: string, taskId: string) => Promise<void>;
  /** Select a document */
  selectDocument: (document: CompletedDocumentDetail) => void;
  /** Clear document selection */
  clearSelection: () => void;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Toggle a document type filter */
  toggleFilter: (filter: DocumentTypeFilter) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Set error message */
  setError: (error: string) => void;
  /** Clear error message */
  clearError: () => void;
  /** Reset store to initial state */
  reset: () => void;
}

/**
 * Combined store type
 */
export type ReferenceDocStore = ReferenceDocState & ReferenceDocActions;

/**
 * Initial state
 */
const initialState: ReferenceDocState = {
  isPanelOpen: false,
  documents: [],
  selectedDocument: null,
  searchQuery: '',
  filters: [],
  isLoading: false,
  error: null,
};

/**
 * Reference Document Store with Zustand
 */
export const useReferenceDocStore = create<ReferenceDocStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      openPanel: () => {
        set({ isPanelOpen: true }, false, 'openPanel');
      },

      closePanel: () => {
        set(
          { isPanelOpen: false, selectedDocument: null },
          false,
          'closePanel'
        );
      },

      fetchDocuments: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchDocuments/start');
        try {
          const { searchQuery, filters } = get();
          const options: {
            search?: string;
            documentType?: string[];
          } = {};

          if (searchQuery) {
            options.search = searchQuery;
          }

          if (filters.length > 0) {
            options.documentType = filters;
          }

          const documents = await referenceDocService.getCompletedDocuments(
            projectId,
            Object.keys(options).length > 0 ? options : undefined
          );

          set(
            { documents, isLoading: false, error: null },
            false,
            'fetchDocuments/success'
          );
        } catch (error) {
          set(
            {
              documents: [],
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'fetchDocuments/error'
          );
        }
      },

      fetchDocumentDetail: async (projectId: string, taskId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchDocumentDetail/start');
        try {
          const document = await referenceDocService.getCompletedDocumentDetail(
            projectId,
            taskId
          );

          set(
            { selectedDocument: document, isLoading: false, error: null },
            false,
            'fetchDocumentDetail/success'
          );
        } catch (error) {
          set(
            {
              selectedDocument: null,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'fetchDocumentDetail/error'
          );
        }
      },

      selectDocument: (document: CompletedDocumentDetail) => {
        set({ selectedDocument: document }, false, 'selectDocument');
      },

      clearSelection: () => {
        set({ selectedDocument: null }, false, 'clearSelection');
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      toggleFilter: (filter: DocumentTypeFilter) => {
        set(
          (state) => {
            const filters = state.filters.includes(filter)
              ? state.filters.filter((f) => f !== filter)
              : [...state.filters, filter];
            return { filters };
          },
          false,
          'toggleFilter'
        );
      },

      clearFilters: () => {
        set({ filters: [] }, false, 'clearFilters');
      },

      setError: (error: string) => {
        set({ error }, false, 'setError');
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    { name: 'ReferenceDocStore' }
  )
);
