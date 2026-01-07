/**
 * System Store - Zustand State Management
 * Centralized state management for system documents with filtering and selection
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SystemDocument } from '../types';
import * as systemDocService from '../services/systemDocService';
import type { CreateSystemDto, UpdateSystemDto } from '../services/systemDocService';

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
  // Selection actions
  toggleSelect: (systemId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  // Filter actions
  setCategoryFilter: (category: string | null) => void;
  setTagFilter: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  // Computed
  getFilteredSystems: () => SystemDocument[];
  getSystemsByCategory: () => Record<string, SystemDocument[]>;
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
    (set, get) => ({
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
    }),
    { name: 'SystemStore' }
  )
);
