/**
 * System Store - Zustand State Management
 * Centralized state management for system documents with devtools support
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SystemDocument, SystemDocumentState } from '../types';
import type { CreateSystemDocumentDto, UpdateSystemDocumentDto } from '../services/systemDocService';
import * as systemDocService from '../services/systemDocService';

/**
 * Extended system store with computed properties and actions
 */
export interface SystemDocumentStore extends SystemDocumentState {
  // Additional state
  categories: string[];
  allTags: string[];
  selectedCategory: string | null;
  selectedTags: string[];
  searchQuery: string;
  expandedCategories: string[];
  previewDocumentId: string | null;

  // Computed property getter
  readonly filteredDocuments: SystemDocument[];

  // Actions
  fetchDocuments: (projectId: string) => Promise<void>;
  createDocument: (projectId: string, data: CreateSystemDocumentDto) => Promise<void>;
  updateDocument: (projectId: string, systemId: string, data: UpdateSystemDocumentDto) => Promise<void>;
  deleteDocument: (projectId: string, systemId: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  toggleTag: (tag: string) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  clearDocuments: () => void;
  getCategories: () => string[];
  getDocumentsByCategory: () => Record<string, SystemDocument[]>;
  toggleCategory: (category: string) => void;
  setPreviewDocument: (id: string | null) => void;
}

/**
 * Selector for filtered documents - use this for accessing filteredDocuments
 */
export function selectFilteredDocuments(state: SystemDocumentStore): SystemDocument[] {
  return filterDocuments(
    state.documents,
    state.selectedCategory,
    state.selectedTags,
    state.searchQuery
  );
}

/**
 * Sort documents by createdAt in descending order (newest first)
 */
function sortDocumentsByDate(documents: SystemDocument[]): SystemDocument[] {
  return [...documents].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Filter documents based on category, tags, and search query
 */
function filterDocuments(
  documents: SystemDocument[],
  selectedCategory: string | null,
  selectedTags: string[],
  searchQuery: string
): SystemDocument[] {
  return documents.filter(doc => {
    // Filter by category
    if (selectedCategory && doc.category !== selectedCategory) {
      return false;
    }

    // Filter by tags (AND logic - document must have all selected tags)
    if (selectedTags.length > 0) {
      const hasAllTags = selectedTags.every(tag => doc.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    // Filter by search query (case-insensitive search in name and content)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = doc.name.toLowerCase().includes(query);
      const contentMatch = doc.content.toLowerCase().includes(query);
      if (!nameMatch && !contentMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * System document store with Zustand
 */
export const useSystemStore = create<SystemDocumentStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      documents: [],
      selectedDocumentIds: [],
      isLoading: false,
      error: null,
      categories: [],
      allTags: [],
      selectedCategory: null,
      selectedTags: [],
      searchQuery: '',
      expandedCategories: [],
      previewDocumentId: null,

      // Computed property using getter
      get filteredDocuments() {
        const state = get();
        return filterDocuments(
          state.documents,
          state.selectedCategory,
          state.selectedTags,
          state.searchQuery
        );
      },

      // Actions
      fetchDocuments: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchDocuments/start');
        try {
          const [documents, categories, allTags] = await Promise.all([
            systemDocService.getSystemDocuments(projectId),
            systemDocService.getCategories(projectId),
            systemDocService.getTags(projectId),
          ]);
          const sortedDocuments = sortDocumentsByDate(documents);

          set({
            documents: sortedDocuments,
            categories,
            allTags,
            isLoading: false,
            error: null,
          }, false, 'fetchDocuments/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'fetchDocuments/error');
        }
      },

      createDocument: async (projectId: string, data: CreateSystemDocumentDto) => {
        set({ isLoading: true, error: null }, false, 'createDocument/start');
        try {
          const newDocument = await systemDocService.createSystemDocument(projectId, data);

          set(state => {
            const newDocuments = sortDocumentsByDate([newDocument, ...state.documents]);
            // Update categories and tags if new ones are added
            const newCategories = state.categories.includes(newDocument.category)
              ? state.categories
              : [...state.categories, newDocument.category].sort();
            const newTags = [...new Set([...state.allTags, ...newDocument.tags])].sort();

            return {
              documents: newDocuments,
              categories: newCategories,
              allTags: newTags,
              isLoading: false,
              error: null,
            };
          }, false, 'createDocument/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'createDocument/error');
        }
      },

      updateDocument: async (projectId: string, systemId: string, data: UpdateSystemDocumentDto) => {
        set({ isLoading: true, error: null }, false, 'updateDocument/start');
        try {
          const updatedDocument = await systemDocService.updateSystemDocument(projectId, systemId, data);

          set(state => {
            const newDocuments = state.documents.map(doc =>
              doc.id === systemId ? updatedDocument : doc
            );
            return {
              documents: newDocuments,
              isLoading: false,
              error: null,
            };
          }, false, 'updateDocument/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updateDocument/error');
        }
      },

      deleteDocument: async (projectId: string, systemId: string) => {
        set({ isLoading: true, error: null }, false, 'deleteDocument/start');
        try {
          await systemDocService.deleteSystemDocument(projectId, systemId);

          set(state => {
            const remainingDocuments = state.documents.filter(doc => doc.id !== systemId);
            // Remove from selected if it was selected
            const remainingSelectedIds = state.selectedDocumentIds.filter(id => id !== systemId);

            return {
              documents: remainingDocuments,
              selectedDocumentIds: remainingSelectedIds,
              isLoading: false,
              error: null,
            };
          }, false, 'deleteDocument/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'deleteDocument/error');
        }
      },

      setSelectedCategory: (category: string | null) => {
        set({ selectedCategory: category }, false, 'setSelectedCategory');
      },

      toggleTag: (tag: string) => {
        set(state => {
          const isSelected = state.selectedTags.includes(tag);
          const newTags = isSelected
            ? state.selectedTags.filter(t => t !== tag)
            : [...state.selectedTags, tag];
          return { selectedTags: newTags };
        }, false, 'toggleTag');
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      clearFilters: () => {
        set({
          selectedCategory: null,
          selectedTags: [],
          searchQuery: '',
        }, false, 'clearFilters');
      },

      clearDocuments: () => {
        set({
          documents: [],
          categories: [],
          allTags: [],
          selectedDocumentIds: [],
          isLoading: false,
          error: null,
        }, false, 'clearDocuments');
      },

      getCategories: () => {
        const state = get();
        const uniqueCategories = [...new Set(state.documents.map(doc => doc.category))];
        return uniqueCategories.sort();
      },

      getDocumentsByCategory: () => {
        const state = get();
        const result: Record<string, SystemDocument[]> = {};
        state.documents.forEach(doc => {
          if (!result[doc.category]) {
            result[doc.category] = [];
          }
          result[doc.category].push(doc);
        });
        return result;
      },

      toggleCategory: (category: string) => {
        set(state => {
          const isExpanded = state.expandedCategories.includes(category);
          const newExpanded = isExpanded
            ? state.expandedCategories.filter(c => c !== category)
            : [...state.expandedCategories, category];
          return { expandedCategories: newExpanded };
        }, false, 'toggleCategory');
      },

      setPreviewDocument: (id: string | null) => {
        set({ previewDocumentId: id }, false, 'setPreviewDocument');
      },
    }),
    { name: 'SystemStore' }
  )
);
