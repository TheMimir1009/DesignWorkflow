/**
 * Discovery Service
 * Frontend API client for system discovery using Claude Code integration
 *
 * Requirements:
 * - AC-002: Claude Code integration for related system discovery
 * - AC-003: Fallback recommendations when Claude Code fails
 */

// =============================================================================
// Configuration Constants
// =============================================================================

/**
 * Service configuration
 */
const CONFIG = {
  /** Base API URL */
  API_BASE_URL: 'http://localhost:3001',
  /** API timeout in milliseconds (5 seconds per AC-002) */
  API_TIMEOUT: 5000,
  /** Minimum feature text length for analysis */
  MIN_FEATURE_TEXT_LENGTH: 100,
  /** Maximum number of recommendations to return */
  MAX_RECOMMENDATIONS: 5,
  /** Cache duration in milliseconds (5 minutes) */
  CACHE_DURATION: 5 * 60 * 1000,
} as const;

/**
 * Error messages
 */
const ERROR_MESSAGES = {
  MIN_TEXT_LENGTH: 'Feature text must be at least 100 characters for accurate analysis',
  FALLBACK_REASON: 'AI analysis failed, using keyword-based recommendations',
} as const;

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Recommended system interface
 */
export interface RecommendedSystem {
  id: string;
  name: string;
  relevanceScore: number;
  matchReason?: string;
}

/**
 * Discovery result interface
 */
export interface DiscoveryResult {
  recommendations: RecommendedSystem[];
  isAIGenerated: boolean;
  analyzedKeywords: string[];
  error?: string;
  fallbackReason?: string;
}

/**
 * Request interface for discovering related systems
 */
export interface DiscoverRelatedSystemsRequest {
  projectId: string;
  featureText: string;
}

/**
 * API response wrapper interface
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================================================
// Error Class
// =============================================================================

/**
 * Custom error for discovery service failures
 */
export class DiscoveryServiceError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'DiscoveryServiceError';
    this.status = status;
    this.details = details;
  }
}

// =============================================================================
// Cache Implementation
// =============================================================================

/**
 * Cache entry interface
 */
interface CacheEntry {
  result: DiscoveryResult;
  timestamp: number;
}

/**
 * In-memory cache for discovery results
 */
const cache = new Map<string, CacheEntry>();

/**
 * Generate cache key from request parameters
 */
function generateCacheKey(projectId: string, featureText: string): string {
  return `${projectId}:${featureText}`;
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CONFIG.CACHE_DURATION;
}

/**
 * Get cached result if available and valid
 */
function getCachedResult(projectId: string, featureText: string): DiscoveryResult | null {
  const key = generateCacheKey(projectId, featureText);
  const entry = cache.get(key);

  if (entry && isCacheValid(entry)) {
    return entry.result;
  }

  // Remove expired entry
  if (entry) {
    cache.delete(key);
  }

  return null;
}

/**
 * Store result in cache
 */
function setCachedResult(projectId: string, featureText: string, result: DiscoveryResult): void {
  const key = generateCacheKey(projectId, featureText);
  cache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cached results
 */
export function clearCache(): void {
  cache.clear();
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Normalize relevance score to 0-100 range
 */
function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

/**
 * Normalize recommendations to ensure data quality
 */
function normalizeRecommendations(recommendations: RecommendedSystem[]): RecommendedSystem[] {
  return recommendations
    .map((rec) => ({
      ...rec,
      relevanceScore: normalizeScore(rec.relevanceScore),
    }))
    .slice(0, CONFIG.MAX_RECOMMENDATIONS);
}

/**
 * Create fallback result when API fails
 */
function createFallbackResult(reason: string = ERROR_MESSAGES.FALLBACK_REASON): DiscoveryResult {
  return {
    recommendations: [],
    isAIGenerated: false,
    analyzedKeywords: [],
    fallbackReason: reason,
  };
}

/**
 * Create empty result for validation failures
 */
function createEmptyResult(error?: string): DiscoveryResult {
  return {
    recommendations: [],
    isAIGenerated: false,
    analyzedKeywords: [],
    error,
  };
}

/**
 * Fetch with timeout support using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// =============================================================================
// Main API Function
// =============================================================================

/**
 * Discover related systems based on feature text
 * Uses Claude Code for AI-powered recommendations with fallback to keyword-based matching
 */
export async function discoverRelatedSystems(
  request: DiscoverRelatedSystemsRequest
): Promise<DiscoveryResult> {
  const { projectId, featureText } = request;

  // Validate empty text
  if (!featureText || featureText.trim() === '') {
    return createEmptyResult();
  }

  // Validate minimum text length
  if (featureText.length < CONFIG.MIN_FEATURE_TEXT_LENGTH) {
    return createEmptyResult(ERROR_MESSAGES.MIN_TEXT_LENGTH);
  }

  // Check cache first
  const cachedResult = getCachedResult(projectId, featureText);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    const response = await fetchWithTimeout(
      `${CONFIG.API_BASE_URL}/api/projects/${projectId}/discover`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featureText }),
      },
      CONFIG.API_TIMEOUT
    );

    if (!response.ok) {
      // Server error - return fallback
      return createFallbackResult();
    }

    const json = await response.json() as ApiResponse<DiscoveryResult>;

    if (!json.success || !json.data) {
      return createFallbackResult();
    }

    const data = json.data;

    // Normalize the result
    const result: DiscoveryResult = {
      recommendations: normalizeRecommendations(data.recommendations),
      isAIGenerated: data.isAIGenerated,
      analyzedKeywords: data.analyzedKeywords,
    };

    // Cache the result
    setCachedResult(projectId, featureText, result);

    return result;
  } catch {
    // Network error, timeout, or JSON parse error - return fallback
    return createFallbackResult();
  }
}

// =============================================================================
// Service Export
// =============================================================================

/**
 * Discovery Service object with all methods
 */
export const discoveryService = {
  discoverRelatedSystems,
  clearCache,
};

export default discoveryService;
