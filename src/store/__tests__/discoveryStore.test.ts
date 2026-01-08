/**
 * Discovery Store Tests
 * Tests for Zustand discovery store state management
 * SPEC-DISCOVERY: Auto-discovery state management for related systems
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useDiscoveryStore,
  selectRecommendationCount,
  selectHighRelevanceRecommendations,
} from '../discoveryStore';
import { useReferenceStore } from '../referenceStore';
import type { RecommendedSystem, DiscoveryResult } from '../../services/discoveryService';

// Mock discoveryService
vi.mock('../../services/discoveryService', () => ({
  discoverRelatedSystems: vi.fn(),
  clearCache: vi.fn(),
}));

import * as discoveryService from '../../services/discoveryService';

describe('Discovery Store', () => {
  const mockRecommendations: RecommendedSystem[] = [
    { id: 'sys-1', name: 'Authentication System', relevanceScore: 95, matchReason: 'User login feature' },
    { id: 'sys-2', name: 'Database Schema', relevanceScore: 85, matchReason: 'Data storage' },
    { id: 'sys-3', name: 'API Gateway', relevanceScore: 75, matchReason: 'API integration' },
  ];

  const mockDiscoveryResult: DiscoveryResult = {
    recommendations: mockRecommendations,
    isAIGenerated: true,
    analyzedKeywords: ['authentication', 'login', 'user'],
  };

  const mockFallbackResult: DiscoveryResult = {
    recommendations: [],
    isAIGenerated: false,
    analyzedKeywords: [],
    fallbackReason: 'AI analysis failed, using keyword-based recommendations',
  };

  beforeEach(() => {
    // Reset discovery store state before each test
    useDiscoveryStore.setState({
      recommendations: [],
      isLoading: false,
      error: null,
      lastAnalyzedText: '',
      isAIGenerated: false,
      analyzedKeywords: [],
    });
    // Reset reference store state
    useReferenceStore.setState({
      selectedReferences: [],
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useDiscoveryStore.getState();

      expect(state.recommendations).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastAnalyzedText).toBe('');
      expect(state.isAIGenerated).toBe(false);
      expect(state.analyzedKeywords).toEqual([]);
    });
  });

  describe('fetchRecommendations', () => {
    it('should set isLoading to true when fetch starts', async () => {
      let resolvePromise: (value: DiscoveryResult) => void;
      const promise = new Promise<DiscoveryResult>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(discoveryService.discoverRelatedSystems).mockReturnValueOnce(promise);

      const fetchPromise = useDiscoveryStore.getState().fetchRecommendations('project-1', 'Feature text that is long enough to meet the minimum character requirement for analysis.');

      // Check loading state is true during fetch
      expect(useDiscoveryStore.getState().isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!(mockDiscoveryResult);
        await fetchPromise;
      });

      expect(useDiscoveryStore.getState().isLoading).toBe(false);
    });

    it('should update recommendations on successful fetch', async () => {
      vi.mocked(discoveryService.discoverRelatedSystems).mockResolvedValueOnce(mockDiscoveryResult);

      await act(async () => {
        await useDiscoveryStore.getState().fetchRecommendations('project-1', 'Feature text that is long enough to meet the minimum character requirement for analysis.');
      });

      const state = useDiscoveryStore.getState();
      expect(state.recommendations).toEqual(mockRecommendations);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isAIGenerated).toBe(true);
      expect(state.analyzedKeywords).toEqual(['authentication', 'login', 'user']);
      expect(discoveryService.discoverRelatedSystems).toHaveBeenCalledWith({
        projectId: 'project-1',
        featureText: 'Feature text that is long enough to meet the minimum character requirement for analysis.',
      });
    });

    it('should set error on fetch failure', async () => {
      const errorResult: DiscoveryResult = {
        recommendations: [],
        isAIGenerated: false,
        analyzedKeywords: [],
        error: 'Feature text must be at least 100 characters for accurate analysis',
      };
      vi.mocked(discoveryService.discoverRelatedSystems).mockResolvedValueOnce(errorResult);

      await act(async () => {
        await useDiscoveryStore.getState().fetchRecommendations('project-1', 'Short text');
      });

      const state = useDiscoveryStore.getState();
      expect(state.recommendations).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Feature text must be at least 100 characters for accurate analysis');
    });

    it('should set isLoading to false after fetch completes', async () => {
      vi.mocked(discoveryService.discoverRelatedSystems).mockResolvedValueOnce(mockDiscoveryResult);

      await act(async () => {
        await useDiscoveryStore.getState().fetchRecommendations('project-1', 'Feature text that is long enough to meet the minimum character requirement for analysis.');
      });

      expect(useDiscoveryStore.getState().isLoading).toBe(false);
    });

    it('should store lastAnalyzedText after successful fetch', async () => {
      vi.mocked(discoveryService.discoverRelatedSystems).mockResolvedValueOnce(mockDiscoveryResult);
      const featureText = 'Feature text that is long enough to meet the minimum character requirement for analysis.';

      await act(async () => {
        await useDiscoveryStore.getState().fetchRecommendations('project-1', featureText);
      });

      expect(useDiscoveryStore.getState().lastAnalyzedText).toBe(featureText);
    });

    it('should handle fallback result correctly', async () => {
      vi.mocked(discoveryService.discoverRelatedSystems).mockResolvedValueOnce(mockFallbackResult);

      await act(async () => {
        await useDiscoveryStore.getState().fetchRecommendations('project-1', 'Feature text that is long enough to meet the minimum character requirement for analysis.');
      });

      const state = useDiscoveryStore.getState();
      expect(state.recommendations).toEqual([]);
      expect(state.isAIGenerated).toBe(false);
      expect(state.error).toBeNull(); // fallbackReason is not an error
    });
  });

  describe('clearRecommendations', () => {
    it('should reset state to initial values', () => {
      // Set some state first
      useDiscoveryStore.setState({
        recommendations: mockRecommendations,
        isLoading: false,
        error: 'Some error',
        lastAnalyzedText: 'Previous text',
        isAIGenerated: true,
        analyzedKeywords: ['keyword'],
      });

      act(() => {
        useDiscoveryStore.getState().clearRecommendations();
      });

      const state = useDiscoveryStore.getState();
      expect(state.recommendations).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.lastAnalyzedText).toBe('');
      expect(state.isAIGenerated).toBe(false);
      expect(state.analyzedKeywords).toEqual([]);
    });
  });

  describe('addToReferences', () => {
    it('should add system to reference store', () => {
      // Set recommendations first
      useDiscoveryStore.setState({
        recommendations: mockRecommendations,
      });

      act(() => {
        useDiscoveryStore.getState().addToReferences('sys-1');
      });

      const referenceState = useReferenceStore.getState();
      expect(referenceState.selectedReferences).toContain('sys-1');
    });

    it('should not add duplicate reference', () => {
      // Set reference store with existing reference
      useReferenceStore.setState({
        selectedReferences: ['sys-1'],
      });
      useDiscoveryStore.setState({
        recommendations: mockRecommendations,
      });

      act(() => {
        useDiscoveryStore.getState().addToReferences('sys-1');
      });

      const referenceState = useReferenceStore.getState();
      expect(referenceState.selectedReferences).toEqual(['sys-1']);
      expect(referenceState.selectedReferences.length).toBe(1);
    });
  });

  describe('addAllToReferences', () => {
    it('should add all recommended systems to reference store', () => {
      useDiscoveryStore.setState({
        recommendations: mockRecommendations,
      });

      act(() => {
        useDiscoveryStore.getState().addAllToReferences();
      });

      const referenceState = useReferenceStore.getState();
      expect(referenceState.selectedReferences).toContain('sys-1');
      expect(referenceState.selectedReferences).toContain('sys-2');
      expect(referenceState.selectedReferences).toContain('sys-3');
    });

    it('should not add duplicate references when some already exist', () => {
      useReferenceStore.setState({
        selectedReferences: ['sys-1', 'existing-ref'],
      });
      useDiscoveryStore.setState({
        recommendations: mockRecommendations,
      });

      act(() => {
        useDiscoveryStore.getState().addAllToReferences();
      });

      const referenceState = useReferenceStore.getState();
      expect(referenceState.selectedReferences).toContain('sys-1');
      expect(referenceState.selectedReferences).toContain('sys-2');
      expect(referenceState.selectedReferences).toContain('sys-3');
      expect(referenceState.selectedReferences).toContain('existing-ref');
      // Count should be 4 (3 new + 1 existing, with sys-1 not duplicated)
      expect(referenceState.selectedReferences.length).toBe(4);
    });
  });

  describe('refresh', () => {
    it('should clear cache and re-fetch recommendations', async () => {
      vi.mocked(discoveryService.discoverRelatedSystems).mockResolvedValueOnce(mockDiscoveryResult);
      const featureText = 'Feature text that is long enough to meet the minimum character requirement for analysis.';

      await act(async () => {
        await useDiscoveryStore.getState().refresh('project-1', featureText);
      });

      expect(discoveryService.clearCache).toHaveBeenCalled();
      expect(discoveryService.discoverRelatedSystems).toHaveBeenCalledWith({
        projectId: 'project-1',
        featureText,
      });
      expect(useDiscoveryStore.getState().recommendations).toEqual(mockRecommendations);
    });

    it('should set loading state during refresh', async () => {
      let resolvePromise: (value: DiscoveryResult) => void;
      const promise = new Promise<DiscoveryResult>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(discoveryService.discoverRelatedSystems).mockReturnValueOnce(promise);

      const refreshPromise = useDiscoveryStore.getState().refresh('project-1', 'Feature text that is long enough to meet the minimum character requirement for analysis.');

      expect(useDiscoveryStore.getState().isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockDiscoveryResult);
        await refreshPromise;
      });

      expect(useDiscoveryStore.getState().isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      // Set an error first
      useDiscoveryStore.setState({ error: 'Some error' });

      expect(useDiscoveryStore.getState().error).toBe('Some error');

      act(() => {
        useDiscoveryStore.getState().clearError();
      });

      expect(useDiscoveryStore.getState().error).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('selectRecommendationCount should return the number of recommendations', () => {
      const state = { ...useDiscoveryStore.getState(), recommendations: mockRecommendations };
      expect(selectRecommendationCount(state)).toBe(3);
    });

    it('selectRecommendationCount should return 0 for empty recommendations', () => {
      const state = { ...useDiscoveryStore.getState(), recommendations: [] };
      expect(selectRecommendationCount(state)).toBe(0);
    });

    it('selectHighRelevanceRecommendations should filter by score >= 80', () => {
      const state = { ...useDiscoveryStore.getState(), recommendations: mockRecommendations };
      const highRelevance = selectHighRelevanceRecommendations(state);

      expect(highRelevance.length).toBe(2);
      expect(highRelevance).toContainEqual(mockRecommendations[0]); // 95
      expect(highRelevance).toContainEqual(mockRecommendations[1]); // 85
      expect(highRelevance).not.toContainEqual(mockRecommendations[2]); // 75
    });

    it('selectHighRelevanceRecommendations should return empty for no high scores', () => {
      const lowScoreRecommendations: RecommendedSystem[] = [
        { id: 'sys-1', name: 'Low Score System', relevanceScore: 50 },
      ];
      const state = { ...useDiscoveryStore.getState(), recommendations: lowScoreRecommendations };
      const highRelevance = selectHighRelevanceRecommendations(state);

      expect(highRelevance.length).toBe(0);
    });
  });
});
