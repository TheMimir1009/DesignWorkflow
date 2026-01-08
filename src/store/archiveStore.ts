/**
 * Archive Store - Zustand State Management
 * Centralized state management for archives
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Archive, Task, ArchiveState } from '../types';
import * as archiveService from '../services/archiveService';

/**
 * Archive store actions interface
 */
export interface ArchiveStoreActions {
  fetchArchives: (projectId: string) => Promise<void>;
  archiveTask: (projectId: string, taskId: string) => Promise<void>;
  restoreArchive: (projectId: string, archiveId: string) => Promise<Task | null>;
  deleteArchive: (projectId: string, archiveId: string) => Promise<void>;
  selectArchive: (archiveId: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  getFilteredArchives: () => Archive[];
}

/**
 * Combined archive store type
 */
export type ArchiveStore = ArchiveState & ArchiveStoreActions;

/**
 * Archive store with Zustand
 */
export const useArchiveStore = create<ArchiveStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      archives: [],
      selectedArchiveId: null,
      isLoading: false,
      error: null,
      searchQuery: '',

      // Actions
      fetchArchives: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchArchives/start');
        try {
          const archives = await archiveService.getArchives(projectId);
          set(
            {
              archives,
              isLoading: false,
              error: null,
            },
            false,
            'fetchArchives/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'fetchArchives/error'
          );
        }
      },

      archiveTask: async (projectId: string, taskId: string) => {
        try {
          const archive = await archiveService.archiveTask(projectId, taskId);
          const { archives } = get();
          set(
            {
              archives: [...archives, archive],
              error: null,
            },
            false,
            'archiveTask/success'
          );
        } catch (error) {
          set(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'archiveTask/error'
          );
        }
      },

      restoreArchive: async (projectId: string, archiveId: string) => {
        const { archives } = get();
        const archiveToRestore = archives.find((a) => a.id === archiveId);

        if (!archiveToRestore) {
          set({ error: 'Archive not found' }, false, 'restoreArchive/notFound');
          return null;
        }

        try {
          const restoredTask = await archiveService.restoreArchive(projectId, archiveId);

          // Remove archive from list
          const updatedArchives = archives.filter((a) => a.id !== archiveId);
          set(
            {
              archives: updatedArchives,
              selectedArchiveId:
                get().selectedArchiveId === archiveId ? null : get().selectedArchiveId,
              error: null,
            },
            false,
            'restoreArchive/success'
          );

          return restoredTask;
        } catch (error) {
          set(
            {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'restoreArchive/error'
          );
          return null;
        }
      },

      deleteArchive: async (projectId: string, archiveId: string) => {
        const { archives } = get();
        const archiveIndex = archives.findIndex((a) => a.id === archiveId);

        if (archiveIndex === -1) {
          set({ error: 'Archive not found' }, false, 'deleteArchive/notFound');
          return;
        }

        const originalArchive = archives[archiveIndex];

        // Optimistic delete
        const filteredArchives = archives.filter((a) => a.id !== archiveId);
        set({ archives: filteredArchives }, false, 'deleteArchive/optimistic');

        try {
          await archiveService.deleteArchive(projectId, archiveId);
          set(
            {
              selectedArchiveId:
                get().selectedArchiveId === archiveId ? null : get().selectedArchiveId,
              error: null,
            },
            false,
            'deleteArchive/success'
          );
        } catch (error) {
          // Rollback on failure
          const currentArchives = get().archives;
          set(
            {
              archives: [
                ...currentArchives.slice(0, archiveIndex),
                originalArchive,
                ...currentArchives.slice(archiveIndex),
              ],
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'deleteArchive/rollback'
          );
        }
      },

      selectArchive: (archiveId: string | null) => {
        set({ selectedArchiveId: archiveId }, false, 'selectArchive');
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'setSearchQuery');
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      getFilteredArchives: () => {
        const { archives, searchQuery } = get();

        if (!searchQuery.trim()) {
          return archives;
        }

        const lowerQuery = searchQuery.toLowerCase();
        return archives.filter((archive) =>
          archive.task.title.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    { name: 'ArchiveStore' }
  )
);
