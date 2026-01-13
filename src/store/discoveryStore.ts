/**
 * Discovery Store - Zustand State Management
 * Centralized state management for auto-discovery of related systems
 * SPEC-DISCOVERY: Auto-discovery state management (AC-004, AC-009)
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RecommendedSystem, DiscoveryResult } from '../services/discoveryService';
import { discoverRelatedSystems, clearCache } from '../services/discoveryService';
import { useReferenceStore } from './referenceStore';

/**
 * Discovery store state interface
 */
export interface DiscoveryStoreState {
  recommendations: RecommendedSystem[];
  isLoading: boolean;
  error: string | null;
  lastAnalyzedText: string;
  isAIGenerated: boolean;
  analyzedKeywords: string[];
}

/**
 * Discovery store actions interface
 */
export interface DiscoveryStoreActions {
  fetchRecommendations: (projectId: string, featureText: string) => Promise<void>;
  addToReferences: (systemId: string) => void;
  addAllToReferences: () => void;
  clearRecommendations: () => void;
  refresh: (projectId: string, featureText: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Combined discovery store type
 */
export type DiscoveryStore = DiscoveryStoreState & DiscoveryStoreActions;

/**
 * Initial state for discovery store
 */
const initialState: DiscoveryStoreState = {
  recommendations: [],
  isLoading: false,
  error: null,
  lastAnalyzedText: '',
  isAIGenerated: false,
  analyzedKeywords: [],
};

/**
 * Discovery store with Zustand
 * Manages the state for auto-discovered related systems
 */
export const useDiscoveryStore = create<DiscoveryStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      fetchRecommendations: async (projectId: string, featureText: string) => {
        set({ isLoading: true, error: null }, false, 'fetchRecommendations/start');

        try {
          const result: DiscoveryResult = await discoverRelatedSystems({
            projectId,
            featureText,
          });

          // Check if result contains an error
          if (result.error) {
            set(
              {
                recommendations: [],
                isLoading: false,
                error: result.error,
                lastAnalyzedText: featureText,
                isAIGenerated: false,
                analyzedKeywords: [],
              },
              false,
              'fetchRecommendations/error'
            );
            return;
          }

          // Update state with successful result
          set(
            {
              recommendations: result.recommendations,
              isLoading: false,
              error: null,
              lastAnalyzedText: featureText,
              isAIGenerated: result.isAIGenerated,
              analyzedKeywords: result.analyzedKeywords,
            },
            false,
            'fetchRecommendations/success'
          );
        } catch (error) {
          set(
            {
              recommendations: [],
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              lastAnalyzedText: featureText,
              isAIGenerated: false,
              analyzedKeywords: [],
            },
            false,
            'fetchRecommendations/catch'
          );
        }
      },

      addToReferences: (systemId: string) => {
        const referenceStore = useReferenceStore.getState();
        referenceStore.addReference(systemId);
      },

      addAllToReferences: () => {
        const { recommendations } = get();
        const referenceStore = useReferenceStore.getState();

        recommendations.forEach((rec) => {
          referenceStore.addReference(rec.id);
        });
      },

      clearRecommendations: () => {
        set(
          {
            recommendations: [],
            error: null,
            lastAnalyzedText: '',
            isAIGenerated: false,
            analyzedKeywords: [],
          },
          false,
          'clearRecommendations'
        );
      },

      refresh: async (projectId: string, featureText: string) => {
        // Clear cache first
        clearCache();

        // Re-fetch recommendations
        await get().fetchRecommendations(projectId, featureText);
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },
    }),
    { name: 'DiscoveryStore' }
  )
);

/**
 * Selector for recommendation count
 */
export function selectRecommendationCount(state: DiscoveryStoreState): number {
  return state.recommendations.length;
}

/**
 * Selector for high relevance recommendations (score >= 80)
 */
export function selectHighRelevanceRecommendations(
  state: DiscoveryStoreState
): RecommendedSystem[] {
  return state.recommendations.filter((rec) => rec.relevanceScore >= 80);
}
