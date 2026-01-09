/**
 * System Store - Zustand State Management
 * Centralized state management for system documents with filtering and selection
 */
import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SystemDocument } from '../types';
import * as systemDocService from '../services/systemDocService';
import type { CreateSystemDto, UpdateSystemDto } from '../services/systemDocService';

/**
 * Middleware to synchronize alias properties with primary state (bidirectional)
 * Ensures documents mirrors systems, selectedTags mirrors tagFilter, etc.
 */
const syncAliasMiddleware = <T extends SystemStoreState & SystemStoreActions>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, api) => config(
  (partial, replace, ...args) => {
    const state = typeof partial === 'function' ? partial(get()) : partial;
    const syncedState = { ...state } as Partial<T>;

    // Bidirectional sync: systems <-> documents
    if ('systems' in syncedState && !('documents' in syncedState)) {
      syncedState.documents = syncedState.systems as SystemDocument[];
    } else if ('documents' in syncedState && !('systems' in syncedState)) {
      syncedState.systems = syncedState.documents as SystemDocument[];
    }

    // Bidirectional sync: tagFilter <-> selectedTags
    if ('tagFilter' in syncedState && !('selectedTags' in syncedState)) {
      syncedState.selectedTags = syncedState.tagFilter as string[];
    } else if ('selectedTags' in syncedState && !('tagFilter' in syncedState)) {
      syncedState.tagFilter = syncedState.selectedTags as string[];
    }

    // Bidirectional sync: categoryFilter <-> selectedCategory
    if ('categoryFilter' in syncedState && !('selectedCategory' in syncedState)) {
      syncedState.selectedCategory = syncedState.categoryFilter as string | null;
    } else if ('selectedCategory' in syncedState && !('categoryFilter' in syncedState)) {
      syncedState.categoryFilter = syncedState.selectedCategory as string | null;
    }

    set(syncedState as T | Partial<T> | ((state: T) => T | Partial<T>), replace, ...args);
  },
  get,
  api
);

/**
 * System store state interface
 */
export interface SystemStoreState {
  systems: SystemDocument[];
  selectedSystemIds: string[];
  categoryFilter: string | null;
  tagFilter: string[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  selectedSystem: SystemDocument | null;
  // Preview state
  previewDocumentId: string | null;
  // Category expansion state
  expandedCategories: string[];
  // Alias properties for integration test compatibility
  // These mirror the primary state properties
  documents: SystemDocument[];
  selectedTags: string[];
  selectedCategory: string | null;
}

/**
 * Alias types for document-centric API compatibility
 */
export interface CreateDocumentDto {
  name: string;
  category: string;
  tags: string[];
  content: string;
  dependencies: string[];
}

/**
 * System store actions interface
 */
export interface SystemStoreActions {
  // CRUD actions
  fetchSystems: (projectId: string) => Promise<void>;
  createSystem: (projectId: string, data: CreateSystemDto) => Promise<void>;
  updateSystem: (systemId: string, data: UpdateSystemDto) => Promise<void>;
  deleteSystem: (systemId: string) => Promise<void>;
  // Document-centric CRUD actions (aliases for integration tests)
  fetchDocuments: (projectId: string) => Promise<void>;
  createDocument: (projectId: string, data: CreateDocumentDto) => Promise<void>;
  updateDocument: (projectId: string, documentId: string, data: Partial<CreateDocumentDto>) => Promise<void>;
  deleteDocument: (projectId: string, documentId: string) => Promise<void>;
  // Selection actions
  toggleSelect: (systemId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  // Filter actions
  setCategoryFilter: (category: string | null) => void;
  setTagFilter: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  // Document-centric filter actions (aliases for integration tests)
  toggleTag: (tag: string) => void;
  setSelectedCategory: (category: string | null) => void;
  // Computed
  getFilteredSystems: () => SystemDocument[];
  getSystemsByCategory: () => Record<string, SystemDocument[]>;
  // Document-centric computed (aliases for integration tests)
  getCategories: () => string[];
  getDocumentsByCategory: () => Record<string, SystemDocument[]>;
  // Category expansion
  toggleCategory: (category: string) => void;
  // Preview state
  setPreviewDocument: (documentId: string | null) => void;
  // Error handling
  clearError: () => void;
  // Test utility methods
  clearDocuments: () => void;
  clearFilters: () => void;
  // Modal actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (system: SystemDocument) => void;
  closeEditModal: () => void;
  openDeleteConfirm: (system: SystemDocument) => void;
  closeDeleteConfirm: () => void;
}

/**
 * Combined system store type
 */
export type SystemStore = SystemStoreState & SystemStoreActions;

/**
 * System store with Zustand
 */
export const useSystemStore = create<SystemStore>()(
  devtools(
    syncAliasMiddleware((set, get) => ({
      // Initial state
      systems: [],
      selectedSystemIds: [],
      categoryFilter: null,
      tagFilter: [],
      searchQuery: '',
      isLoading: false,
      error: null,
      // Modal state
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteConfirmOpen: false,
      selectedSystem: null,
      // Preview state
      previewDocumentId: null,
      // Category expansion state
      expandedCategories: [],
      // Alias properties (mirrored from primary state)
      documents: [],
      selectedTags: [],
      selectedCategory: null,

      // CRUD actions
      fetchSystems: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchSystems/start');
        try {
          const systems = await systemDocService.getSystems(projectId);
          set({
            systems,
            isLoading: false,
            error: null,
          }, false, 'fetchSystems/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'fetchSystems/error');
        }
      },

      createSystem: async (projectId: string, data: CreateSystemDto) => {
        try {
          const newSystem = await systemDocService.createSystem(projectId, data);
          const { systems } = get();
          set({ systems: [...systems, newSystem], error: null }, false, 'createSystem/success');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'createSystem/error');
        }
      },

      updateSystem: async (systemId: string, data: UpdateSystemDto) => {
        try {
          const updatedSystem = await systemDocService.updateSystem(systemId, data);
          const currentSystems = get().systems;
          const newSystems = currentSystems.map((s) =>
            s.id === systemId ? updatedSystem : s
          );
          set({ systems: newSystems, error: null }, false, 'updateSystem/success');
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updateSystem/error');
        }
      },

      deleteSystem: async (systemId: string) => {
        const { systems, selectedSystemIds } = get();
        const systemIndex = systems.findIndex((s) => s.id === systemId);

        if (systemIndex === -1) {
          return; // System not found, do nothing
        }

        const originalSystem = systems[systemIndex];

        // Optimistic delete
        const filteredSystems = systems.filter((s) => s.id !== systemId);
        const filteredSelectedIds = selectedSystemIds.filter((id) => id !== systemId);
        set({ systems: filteredSystems, selectedSystemIds: filteredSelectedIds }, false, 'deleteSystem/optimistic');

        try {
          await systemDocService.deleteSystem(systemId);
          set({ error: null }, false, 'deleteSystem/success');
        } catch (error) {
          // Rollback on failure
          const currentSystems = get().systems;
          set({
            systems: [...currentSystems.slice(0, systemIndex), originalSystem, ...currentSystems.slice(systemIndex)],
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'deleteSystem/rollback');
        }
      },

      // Selection actions
      toggleSelect: (systemId: string) => {
        const { selectedSystemIds } = get();
        const isSelected = selectedSystemIds.includes(systemId);

        if (isSelected) {
          set({
            selectedSystemIds: selectedSystemIds.filter((id) => id !== systemId),
          }, false, 'toggleSelect/deselect');
        } else {
          set({
            selectedSystemIds: [...selectedSystemIds, systemId],
          }, false, 'toggleSelect/select');
        }
      },

      selectAll: () => {
        const { systems } = get();
        set({
          selectedSystemIds: systems.map((s) => s.id),
        }, false, 'selectAll');
      },

      clearSelection: () => {
        set({ selectedSystemIds: [] }, false, 'clearSelection');
      },

      // Filter actions
      setCategoryFilter: (category: string | null) => {
        set({ categoryFilter: category }, false, 'setCategoryFilter');
      },

      setTagFilter: (tags: string[]) => {
        set({ tagFilter: tags }, false, 'setTagFilter');
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      // Computed
      getFilteredSystems: () => {
        const { systems, categoryFilter, tagFilter, searchQuery } = get();

        return systems.filter((system) => {
          // Category filter
          if (categoryFilter && system.category !== categoryFilter) {
            return false;
          }

          // Tag filter
          if (tagFilter.length > 0) {
            const hasMatchingTag = tagFilter.some((tag) => system.tags.includes(tag));
            if (!hasMatchingTag) {
              return false;
            }
          }

          // Search query
          if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const nameMatch = system.name.toLowerCase().includes(searchLower);
            const contentMatch = system.content.toLowerCase().includes(searchLower);
            if (!nameMatch && !contentMatch) {
              return false;
            }
          }

          return true;
        });
      },

      getSystemsByCategory: () => {
        const { systems } = get();
        const grouped: Record<string, SystemDocument[]> = {};

        systems.forEach((system) => {
          if (!grouped[system.category]) {
            grouped[system.category] = [];
          }
          grouped[system.category].push(system);
        });

        return grouped;
      },

      // Error handling
      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      // Test utility methods
      clearDocuments: () => {
        set({ systems: [] }, false, 'clearDocuments');
      },

      clearFilters: () => {
        set({ searchQuery: '', tagFilter: [], categoryFilter: null }, false, 'clearFilters');
      },

      // Document-centric CRUD actions (aliases for integration tests)
      fetchDocuments: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchDocuments/start');
        try {
          const documents = await systemDocService.getSystemDocuments(projectId);
          set({
            systems: documents,
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

      createDocument: async (projectId: string, data: CreateDocumentDto) => {
        set({ isLoading: true, error: null }, false, 'createDocument/start');
        try {
          const newDocument = await systemDocService.createSystemDocument(projectId, data);
          const { systems } = get();
          set({
            systems: [...systems, newDocument],
            isLoading: false,
            error: null,
          }, false, 'createDocument/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'createDocument/error');
        }
      },

      updateDocument: async (_projectId: string, documentId: string, data: Partial<CreateDocumentDto>) => {
        set({ isLoading: true, error: null }, false, 'updateDocument/start');
        try {
          const updatedDocument = await systemDocService.updateSystemDocument(_projectId, documentId, data);
          const currentSystems = get().systems;
          const newSystems = currentSystems.map((s) =>
            s.id === documentId ? updatedDocument : s
          );
          set({
            systems: newSystems,
            isLoading: false,
            error: null,
          }, false, 'updateDocument/success');
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'updateDocument/error');
        }
      },

      deleteDocument: async (_projectId: string, documentId: string) => {
        const { systems } = get();
        const documentIndex = systems.findIndex((s) => s.id === documentId);

        if (documentIndex === -1) {
          return;
        }

        const originalDocument = systems[documentIndex];

        // Optimistic delete
        const filteredSystems = systems.filter((s) => s.id !== documentId);
        set({ systems: filteredSystems, isLoading: true }, false, 'deleteDocument/optimistic');

        try {
          await systemDocService.deleteSystemDocument(_projectId, documentId);
          set({ isLoading: false, error: null }, false, 'deleteDocument/success');
        } catch (error) {
          // Rollback on failure
          const currentSystems = get().systems;
          set({
            systems: [...currentSystems.slice(0, documentIndex), originalDocument, ...currentSystems.slice(documentIndex)],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, false, 'deleteDocument/rollback');
        }
      },

      // Document-centric filter actions (aliases for integration tests)
      toggleTag: (tag: string) => {
        const { tagFilter } = get();
        const isSelected = tagFilter.includes(tag);

        if (isSelected) {
          set({
            tagFilter: tagFilter.filter((t) => t !== tag),
          }, false, 'toggleTag/remove');
        } else {
          set({
            tagFilter: [...tagFilter, tag],
          }, false, 'toggleTag/add');
        }
      },

      setSelectedCategory: (category: string | null) => {
        set({ categoryFilter: category }, false, 'setSelectedCategory');
      },

      // Document-centric computed (aliases for integration tests)
      getCategories: () => {
        const { systems } = get();
        const categories = [...new Set(systems.map((s) => s.category))];
        return categories.sort();
      },

      getDocumentsByCategory: () => {
        return get().getSystemsByCategory();
      },

      // Category expansion
      toggleCategory: (category: string) => {
        const { expandedCategories } = get();
        const isExpanded = expandedCategories.includes(category);

        if (isExpanded) {
          set({
            expandedCategories: expandedCategories.filter((c) => c !== category),
          }, false, 'toggleCategory/collapse');
        } else {
          set({
            expandedCategories: [...expandedCategories, category],
          }, false, 'toggleCategory/expand');
        }
      },

      // Preview state
      setPreviewDocument: (documentId: string | null) => {
        set({ previewDocumentId: documentId }, false, 'setPreviewDocument');
      },

      // Modal actions
      openCreateModal: () => {
        set({ isCreateModalOpen: true }, false, 'openCreateModal');
      },

      closeCreateModal: () => {
        set({ isCreateModalOpen: false }, false, 'closeCreateModal');
      },

      openEditModal: (system: SystemDocument) => {
        set({ isEditModalOpen: true, selectedSystem: system }, false, 'openEditModal');
      },

      closeEditModal: () => {
        set({ isEditModalOpen: false, selectedSystem: null }, false, 'closeEditModal');
      },

      openDeleteConfirm: (system: SystemDocument) => {
        set({ isDeleteConfirmOpen: true, selectedSystem: system }, false, 'openDeleteConfirm');
      },

      closeDeleteConfirm: () => {
        set({ isDeleteConfirmOpen: false, selectedSystem: null }, false, 'closeDeleteConfirm');
      },
    })),
    { name: 'SystemStore' }
  )
);

/**
 * Selector function for filtered documents (integration test compatibility)
 * Filters documents by search query, tags (intersection), and category
 */
export function selectFilteredDocuments(state: SystemStoreState): SystemDocument[] {
  const { systems, searchQuery, tagFilter, categoryFilter } = state;

  return systems.filter((document) => {
    // Category filter
    if (categoryFilter && document.category !== categoryFilter) {
      return false;
    }

    // Tag filter (intersection - document must have ALL selected tags)
    if (tagFilter.length > 0) {
      const hasAllTags = tagFilter.every((tag) => document.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = document.name.toLowerCase().includes(searchLower);
      const contentMatch = document.content.toLowerCase().includes(searchLower);
      if (!nameMatch && !contentMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Alias for state properties (integration test compatibility)
 * Maps systems to documents, tagFilter to selectedTags, categoryFilter to selectedCategory
 */
export function selectDocumentsState(state: SystemStoreState) {
  return {
    documents: state.systems,
    selectedTags: state.tagFilter,
    selectedCategory: state.categoryFilter,
    searchQuery: state.searchQuery,
    isLoading: state.isLoading,
    error: state.error,
    previewDocumentId: state.previewDocumentId,
    expandedCategories: state.expandedCategories,
  };
}

/**
 * Subscribe to state changes and sync alias properties
 * This handles external setState calls that bypass the middleware
 */
useSystemStore.subscribe((state, prevState) => {
  const updates: Partial<SystemStoreState> = {};
  let needsUpdate = false;

  // Sync documents -> systems (when documents changed but systems didn't)
  if (state.documents !== prevState.documents && state.systems === prevState.systems) {
    updates.systems = state.documents;
    needsUpdate = true;
  }
  // Sync systems -> documents (when systems changed but documents didn't)
  if (state.systems !== prevState.systems && state.documents === prevState.documents) {
    updates.documents = state.systems;
    needsUpdate = true;
  }

  // Sync selectedTags -> tagFilter
  if (state.selectedTags !== prevState.selectedTags && state.tagFilter === prevState.tagFilter) {
    updates.tagFilter = state.selectedTags;
    needsUpdate = true;
  }
  // Sync tagFilter -> selectedTags
  if (state.tagFilter !== prevState.tagFilter && state.selectedTags === prevState.selectedTags) {
    updates.selectedTags = state.tagFilter;
    needsUpdate = true;
  }

  // Sync selectedCategory -> categoryFilter
  if (state.selectedCategory !== prevState.selectedCategory && state.categoryFilter === prevState.categoryFilter) {
    updates.categoryFilter = state.selectedCategory;
    needsUpdate = true;
  }
  // Sync categoryFilter -> selectedCategory
  if (state.categoryFilter !== prevState.categoryFilter && state.selectedCategory === prevState.selectedCategory) {
    updates.selectedCategory = state.categoryFilter;
    needsUpdate = true;
  }

  if (needsUpdate) {
    useSystemStore.setState(updates);
  }
});
