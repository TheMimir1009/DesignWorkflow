/**
 * System Store - Zustand State Management
 * Manages system documents with search and filter capabilities
 * TAG-003: systemStore extension
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SystemDocument } from '../types';

/**
 * System store state interface
 */
export interface SystemState {
  documents: SystemDocument[];
  isLoading: boolean;
  error: string | null;
  currentDocument: SystemDocument | null;
  fetchDocuments: (projectId: string) => Promise<void>;
  setCurrentDocument: (doc: SystemDocument | null) => void;
  getDocumentsByCategory: () => Record<string, SystemDocument[]>;
  searchDocuments: (query: string) => SystemDocument[];
  filterByTags: (tags: string[]) => SystemDocument[];
}

/**
 * System store with Zustand and devtools middleware
 */
export const useSystemStore = create<SystemState>()(
  devtools(
    (set, get) => ({
      // Initial state
      documents: [],
      isLoading: false,
      error: null,
      currentDocument: null,

      // Actions
      fetchDocuments: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchDocuments/start');

        try {
          // TODO: Replace with actual API call when backend is ready
          // API endpoint will be: /api/projects/${projectId}/systems
          console.debug(`Fetching documents for project: ${projectId}`);
          await new Promise((resolve) => setTimeout(resolve, 100));

          // For now, just set loading to false
          // In real implementation, this would fetch from API
          set({ isLoading: false }, false, 'fetchDocuments/success');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch documents';
          set({ isLoading: false, error: errorMessage }, false, 'fetchDocuments/error');
        }
      },

      setCurrentDocument: (doc: SystemDocument | null) => {
        set({ currentDocument: doc }, false, 'setCurrentDocument');
      },

      // Computed function: Group documents by category
      getDocumentsByCategory: (): Record<string, SystemDocument[]> => {
        const { documents } = get();

        if (documents.length === 0) {
          return {};
        }

        return documents.reduce(
          (acc, doc) => {
            const category = doc.category;
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(doc);
            return acc;
          },
          {} as Record<string, SystemDocument[]>
        );
      },

      // Search function with text filtering
      searchDocuments: (query: string): SystemDocument[] => {
        const { documents } = get();
        const trimmedQuery = query.trim().toLowerCase();

        if (trimmedQuery === '') {
          return documents;
        }

        return documents.filter((doc) => {
          // Search in name
          if (doc.name.toLowerCase().includes(trimmedQuery)) {
            return true;
          }

          // Search in category
          if (doc.category.toLowerCase().includes(trimmedQuery)) {
            return true;
          }

          // Search in tags
          if (doc.tags.some((tag) => tag.toLowerCase().includes(trimmedQuery))) {
            return true;
          }

          // Search in content
          if (doc.content.toLowerCase().includes(trimmedQuery)) {
            return true;
          }

          return false;
        });
      },

      // Filter by tags (OR logic)
      filterByTags: (tags: string[]): SystemDocument[] => {
        const { documents } = get();

        if (tags.length === 0) {
          return documents;
        }

        const lowerCaseTags = tags.map((tag) => tag.toLowerCase());

        return documents.filter((doc) => {
          return doc.tags.some((docTag) => lowerCaseTags.includes(docTag.toLowerCase()));
        });
      },
    }),
    { name: 'SystemStore' }
  )
);
