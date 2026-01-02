/**
 * System Store - Zustand State Management
 * Centralized state management for system documents with devtools support
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SystemDocument, SystemDocumentState } from '../types';
import * as systemDocService from '../services/systemDocService';
import type { CreateSystemDocumentDto, UpdateSystemDocumentDto } from '../services/systemDocService';

/**
 * Extended system store with computed properties and actions
 */
export interface SystemStore extends SystemDocumentState {
  // Additional UI state
  searchQuery: string;
  selectedTags: string[];
  selectedCategory: string | null;
  expandedCategories: string[];
  previewDocumentId: string | null;

  // CRUD Actions
  fetchDocuments: (projectId: string) => Promise<void>;
  createDocument: (projectId: string, data: CreateSystemDocumentDto) => Promise<SystemDocument>;
  updateDocument: (projectId: string, id: string, data: UpdateSystemDocumentDto) => Promise<SystemDocument>;
  deleteDocument: (projectId: string, id: string) => Promise<void>;

  // Filter Actions
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  setSelectedCategory: (category: string | null) => void;
  clearFilters: () => void;

  // UI Actions
  toggleCategory: (category: string) => void;
  setPreviewDocument: (id: string | null) => void;
  clearDocuments: () => void;

  // Computed Getters
  getFilteredDocuments: () => SystemDocument[];
  getCategories: () => string[];
  getAllTags: () => string[];
  getDocumentsByCategory: () => Record<string, SystemDocument[]>;
}

/**
 * Filter documents based on search query, selected tags, and selected category
 */
function filterDocuments(
  documents: SystemDocument[],
  searchQuery: string,
  selectedTags: string[],
  selectedCategory: string | null
): SystemDocument[] {
  return documents.filter((doc) => {
    // Search query filter (name or tags)
    const matchesSearch =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // Tag filter (AND logic - must have all selected tags)
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => doc.tags.includes(tag));

    // Category filter
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;

    return matchesSearch && matchesTags && matchesCategory;
  });
}

/**
 * System store with Zustand
 */
export const useSystemStore = create<SystemStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      documents: [],
      selectedDocumentIds: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedTags: [],
      selectedCategory: null,
      expandedCategories: [],
      previewDocumentId: null,

      // CRUD Actions
      fetchDocuments: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchDocuments/start');
        try {
          const documents = await systemDocService.getSystemDocuments(projectId);
          set(
            {
              documents,
              isLoading: false,
              error: null,
            },
            false,
            'fetchDocuments/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'fetchDocuments/error'
          );
        }
      },

      createDocument: async (projectId: string, data: CreateSystemDocumentDto) => {
        set({ isLoading: true, error: null }, false, 'createDocument/start');
        try {
          const newDocument = await systemDocService.createSystemDocument(projectId, data);

          set(
            (state) => ({
              documents: [...state.documents, newDocument],
              expandedCategories: state.expandedCategories.includes(newDocument.category)
                ? state.expandedCategories
                : [...state.expandedCategories, newDocument.category],
              isLoading: false,
              error: null,
            }),
            false,
            'createDocument/success'
          );

          return newDocument;
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'createDocument/error'
          );
          throw error;
        }
      },

      updateDocument: async (
        projectId: string,
        id: string,
        data: UpdateSystemDocumentDto
      ) => {
        set({ isLoading: true, error: null }, false, 'updateDocument/start');
        try {
          const updatedDocument = await systemDocService.updateSystemDocument(
            projectId,
            id,
            data
          );

          set(
            (state) => ({
              documents: state.documents.map((doc) =>
                doc.id === id ? updatedDocument : doc
              ),
              isLoading: false,
              error: null,
            }),
            false,
            'updateDocument/success'
          );

          return updatedDocument;
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'updateDocument/error'
          );
          throw error;
        }
      },

      deleteDocument: async (projectId: string, id: string) => {
        set({ isLoading: true, error: null }, false, 'deleteDocument/start');
        try {
          await systemDocService.deleteSystemDocument(projectId, id);

          set(
            (state) => ({
              documents: state.documents.filter((doc) => doc.id !== id),
              selectedDocumentIds: state.selectedDocumentIds.filter((docId) => docId !== id),
              previewDocumentId: state.previewDocumentId === id ? null : state.previewDocumentId,
              isLoading: false,
              error: null,
            }),
            false,
            'deleteDocument/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'deleteDocument/error'
          );
          throw error;
        }
      },

      // Filter Actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      toggleTag: (tag: string) => {
        set(
          (state) => ({
            selectedTags: state.selectedTags.includes(tag)
              ? state.selectedTags.filter((t) => t !== tag)
              : [...state.selectedTags, tag],
          }),
          false,
          'toggleTag'
        );
      },

      setSelectedCategory: (category: string | null) => {
        set({ selectedCategory: category }, false, 'setSelectedCategory');
      },

      clearFilters: () => {
        set(
          {
            searchQuery: '',
            selectedTags: [],
            selectedCategory: null,
          },
          false,
          'clearFilters'
        );
      },

      // UI Actions
      toggleCategory: (category: string) => {
        set(
          (state) => ({
            expandedCategories: state.expandedCategories.includes(category)
              ? state.expandedCategories.filter((c) => c !== category)
              : [...state.expandedCategories, category],
          }),
          false,
          'toggleCategory'
        );
      },

      setPreviewDocument: (id: string | null) => {
        set({ previewDocumentId: id }, false, 'setPreviewDocument');
      },

      clearDocuments: () => {
        set(
          {
            documents: [],
            selectedDocumentIds: [],
            searchQuery: '',
            selectedTags: [],
            selectedCategory: null,
            expandedCategories: [],
            previewDocumentId: null,
            error: null,
          },
          false,
          'clearDocuments'
        );
      },

      // Computed Getters
      getFilteredDocuments: () => {
        const state = get();
        return filterDocuments(
          state.documents,
          state.searchQuery,
          state.selectedTags,
          state.selectedCategory
        );
      },

      getCategories: () => {
        const state = get();
        const categories = new Set(state.documents.map((doc) => doc.category));
        return Array.from(categories).sort();
      },

      getAllTags: () => {
        const state = get();
        const tags = new Set(state.documents.flatMap((doc) => doc.tags));
        return Array.from(tags).sort();
      },

      getDocumentsByCategory: () => {
        const state = get();
        const grouped: Record<string, SystemDocument[]> = {};

        for (const doc of state.documents) {
          if (!grouped[doc.category]) {
            grouped[doc.category] = [];
          }
          grouped[doc.category].push(doc);
        }

        // Sort documents within each category by name
        for (const category of Object.keys(grouped)) {
          grouped[category].sort((a, b) => a.name.localeCompare(b.name));
        }

        return grouped;
      },
    }),
    { name: 'SystemStore' }
  )
);
