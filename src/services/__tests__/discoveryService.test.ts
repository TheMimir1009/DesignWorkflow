/**
 * Test Suite: discoveryService
 * TDD implementation for System Discovery Service
 *
 * Requirements covered:
 * - AC-002: Claude Code integration for related system discovery
 * - AC-003: Fallback recommendations when Claude Code fails
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  discoveryService,
  discoverRelatedSystems,
  type RecommendedSystem,
  type DiscoveryResult,
  type DiscoverRelatedSystemsRequest,
  DiscoveryServiceError,
} from '../discoveryService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('discoveryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache before each test
    discoveryService.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('discoverRelatedSystems', () => {
    // Test 1: Normal API call returns recommendations
    it('should return recommendations on successful API call', async () => {
      const mockResponse: DiscoveryResult = {
        recommendations: [
          { id: 'sys-1', name: 'User System', relevanceScore: 95, matchReason: 'Keyword match: login' },
          { id: 'sys-2', name: 'Auth System', relevanceScore: 85, matchReason: 'Keyword match: authentication' },
        ],
        isAIGenerated: true,
        analyzedKeywords: ['login', 'authentication', 'user'],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockResponse }),
      });

      // Feature text must be at least 100 characters
      const featureText = 'Implement user login with authentication system for secure access. ' +
        'The system should support multiple authentication methods including OAuth and password-based login.';

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText,
      });

      expect(result.recommendations).toHaveLength(2);
      expect(result.isAIGenerated).toBe(true);
      expect(result.analyzedKeywords).toContain('login');
    });

    // Test 2: Empty featureText returns empty result
    it('should return empty result when featureText is empty', async () => {
      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: '',
      });

      expect(result.recommendations).toHaveLength(0);
      expect(result.isAIGenerated).toBe(false);
      expect(result.analyzedKeywords).toHaveLength(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    // Test 3: Text less than 100 characters returns error message
    it('should return error message when featureText is less than 100 characters', async () => {
      const shortText = 'Short feature text';
      expect(shortText.length).toBeLessThan(100);

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: shortText,
      });

      expect(result.recommendations).toHaveLength(0);
      expect(result.isAIGenerated).toBe(false);
      expect(result.error).toBe('Feature text must be at least 100 characters for accurate analysis');
    });

    // Test 4: API timeout returns fallback result
    it('should return fallback result on API timeout', async () => {
      mockFetch.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'A'.repeat(150), // Long enough text
      });

      expect(result.isAIGenerated).toBe(false);
      expect(result.fallbackReason).toBe('AI analysis failed, using keyword-based recommendations');
    });

    // Test 5: Network error returns fallback result
    it('should return fallback result on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'B'.repeat(150),
      });

      expect(result.isAIGenerated).toBe(false);
      expect(result.fallbackReason).toBeDefined();
    });

    // Test 6: Server 500 error returns fallback result
    it('should return fallback result on server 500 error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'C'.repeat(150),
      });

      expect(result.isAIGenerated).toBe(false);
      expect(result.fallbackReason).toBeDefined();
    });

    // Test 7: Maximum 5 recommendations limit
    it('should limit recommendations to maximum 5 items', async () => {
      const mockResponse: DiscoveryResult = {
        recommendations: [
          { id: 'sys-1', name: 'System 1', relevanceScore: 100 },
          { id: 'sys-2', name: 'System 2', relevanceScore: 95 },
          { id: 'sys-3', name: 'System 3', relevanceScore: 90 },
          { id: 'sys-4', name: 'System 4', relevanceScore: 85 },
          { id: 'sys-5', name: 'System 5', relevanceScore: 80 },
          { id: 'sys-6', name: 'System 6', relevanceScore: 75 },
          { id: 'sys-7', name: 'System 7', relevanceScore: 70 },
        ],
        isAIGenerated: true,
        analyzedKeywords: ['test'],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockResponse }),
      });

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'D'.repeat(150),
      });

      expect(result.recommendations.length).toBeLessThanOrEqual(5);
    });

    // Test 8: Relevance score within 0-100 range
    it('should ensure relevance scores are within 0-100 range', async () => {
      const mockResponse: DiscoveryResult = {
        recommendations: [
          { id: 'sys-1', name: 'System 1', relevanceScore: 150 }, // Invalid: > 100
          { id: 'sys-2', name: 'System 2', relevanceScore: -10 }, // Invalid: < 0
          { id: 'sys-3', name: 'System 3', relevanceScore: 85 },  // Valid
        ],
        isAIGenerated: true,
        analyzedKeywords: ['test'],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockResponse }),
      });

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'E'.repeat(150),
      });

      result.recommendations.forEach((rec) => {
        expect(rec.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(rec.relevanceScore).toBeLessThanOrEqual(100);
      });
    });

    // Test 9: Cache hit returns fast response
    it('should return cached result on cache hit', async () => {
      const mockResponse: DiscoveryResult = {
        recommendations: [
          { id: 'sys-1', name: 'Cached System', relevanceScore: 90 },
        ],
        isAIGenerated: true,
        analyzedKeywords: ['cached'],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockResponse }),
      });

      const featureText = 'F'.repeat(150);

      // First call - should hit API
      await discoverRelatedSystems({
        projectId: 'project-1',
        featureText,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call with same text - should use cache
      const cachedResult = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(cachedResult.recommendations[0].name).toBe('Cached System');
    });

    // Test 10: Cache miss triggers API call
    it('should call API on cache miss', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            recommendations: [],
            isAIGenerated: true,
            analyzedKeywords: [],
          },
        }),
      });

      // First call
      await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'G'.repeat(150),
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Different text - cache miss
      await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'H'.repeat(150),
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Test 11: isAIGenerated flag accuracy
    it('should correctly set isAIGenerated flag', async () => {
      // AI success case
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            recommendations: [{ id: 'sys-1', name: 'AI System', relevanceScore: 90 }],
            isAIGenerated: true,
            analyzedKeywords: ['ai'],
          },
        }),
      });

      const aiResult = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'I'.repeat(150),
      });
      expect(aiResult.isAIGenerated).toBe(true);

      // Clear cache for next test
      discoveryService.clearCache();

      // Fallback case
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      const fallbackResult = await discoverRelatedSystems({
        projectId: 'project-2',
        featureText: 'J'.repeat(150),
      });
      expect(fallbackResult.isAIGenerated).toBe(false);
    });

    // Test 12: matchReason included in recommendations
    it('should include matchReason in recommendations when provided', async () => {
      const mockResponse: DiscoveryResult = {
        recommendations: [
          { id: 'sys-1', name: 'System 1', relevanceScore: 90, matchReason: 'High keyword overlap' },
          { id: 'sys-2', name: 'System 2', relevanceScore: 80 }, // No matchReason
        ],
        isAIGenerated: true,
        analyzedKeywords: ['keyword'],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockResponse }),
      });

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'K'.repeat(150),
      });

      expect(result.recommendations[0].matchReason).toBe('High keyword overlap');
      expect(result.recommendations[1].matchReason).toBeUndefined();
    });

    // Test 13: Project isolation - different projects have different systems
    it('should isolate recommendations by project', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              recommendations: [{ id: 'proj1-sys', name: 'Project 1 System', relevanceScore: 90 }],
              isAIGenerated: true,
              analyzedKeywords: ['project1'],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              recommendations: [{ id: 'proj2-sys', name: 'Project 2 System', relevanceScore: 85 }],
              isAIGenerated: true,
              analyzedKeywords: ['project2'],
            },
          }),
        });

      const featureText = 'L'.repeat(150);

      const result1 = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText,
      });

      const result2 = await discoverRelatedSystems({
        projectId: 'project-2',
        featureText,
      });

      expect(result1.recommendations[0].id).toBe('proj1-sys');
      expect(result2.recommendations[0].id).toBe('proj2-sys');
    });

    // Test 14: API call with correct endpoint and parameters
    it('should call API with correct endpoint and parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            recommendations: [],
            isAIGenerated: true,
            analyzedKeywords: [],
          },
        }),
      });

      const projectId = 'test-project-id';
      const featureText = 'M'.repeat(150);

      await discoverRelatedSystems({ projectId, featureText });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/projects/${projectId}/discover`),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureText }),
        })
      );
    });

    // Test 15: AbortController-based timeout handling
    it('should return fallback when request is aborted', async () => {
      // Simulate AbortError which is thrown when request times out
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockFetch.mockRejectedValue(abortError);

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'N'.repeat(150),
      });

      expect(result.isAIGenerated).toBe(false);
      expect(result.fallbackReason).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON response gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'O'.repeat(150),
      });

      expect(result.isAIGenerated).toBe(false);
      expect(result.fallbackReason).toBeDefined();
    });

    // Test: API returns success=false
    it('should return fallback when API returns success=false', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Internal error' }),
      });

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'P'.repeat(150),
      });

      expect(result.isAIGenerated).toBe(false);
      expect(result.fallbackReason).toBeDefined();
    });

    // Test: API returns success=true but no data
    it('should return fallback when API returns no data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: null }),
      });

      const result = await discoverRelatedSystems({
        projectId: 'project-1',
        featureText: 'Q'.repeat(150),
      });

      expect(result.isAIGenerated).toBe(false);
      expect(result.fallbackReason).toBeDefined();
    });
  });

  describe('cache expiration', () => {
    it('should remove expired cache entry and call API again', async () => {
      // Mock Date.now to control cache expiration
      const originalDateNow = Date.now;
      let currentTime = 1000000;
      Date.now = vi.fn(() => currentTime);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            recommendations: [{ id: 'sys-1', name: 'System 1', relevanceScore: 90 }],
            isAIGenerated: true,
            analyzedKeywords: ['test'],
          },
        }),
      });

      const featureText = 'R'.repeat(150);

      // First call - should cache the result
      await discoverRelatedSystems({
        projectId: 'project-1',
        featureText,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time past cache expiration (5 minutes + 1 second)
      currentTime += 5 * 60 * 1000 + 1000;

      // Second call - cache expired, should call API again
      await discoverRelatedSystems({
        projectId: 'project-1',
        featureText,
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('discoveryService object', () => {
    it('should expose all API methods', () => {
      expect(discoveryService.discoverRelatedSystems).toBeDefined();
      expect(discoveryService.clearCache).toBeDefined();
    });
  });

  describe('DiscoveryServiceError', () => {
    it('should create error with correct properties', () => {
      const error = new DiscoveryServiceError('Test error', 500, { detail: 'test' });

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('DiscoveryServiceError');
    });
  });
});
