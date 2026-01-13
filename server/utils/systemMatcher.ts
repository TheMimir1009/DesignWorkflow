/**
 * System Matcher Utility
 *
 * Matches systems based on extracted keywords from feature text.
 * Used by the discovery endpoint to recommend related systems.
 *
 * Requirements:
 * - TASK-001: Keyword-tag matching logic
 * - TASK-001: Relevance score calculation (based on matched tags ratio)
 * - TASK-001: Result sorting and limiting (max 5 by default)
 */

import type { ExtractedKeyword } from './keywordExtractor.ts';
import type { SystemDocument } from '../../src/types/index.ts';

/**
 * Result of a system match operation
 */
export interface SystemMatchResult {
  /** ID of the matched system */
  systemId: string;
  /** Name of the matched system */
  systemName: string;
  /** Relevance score (0-100) based on matched tags ratio */
  relevanceScore: number;
  /** List of tags that matched the keywords */
  matchedTags: string[];
}

/**
 * Default maximum number of results to return
 */
const DEFAULT_MAX_RESULTS = 5;

/**
 * Match systems by keywords extracted from feature text
 *
 * Process:
 * 1. Extract keyword strings (case-insensitive)
 * 2. For each system, find matching tags
 * 3. Calculate relevance score based on matched tags ratio
 * 4. Sort by relevance score (descending)
 * 5. Limit to maxResults
 *
 * @param keywords - Extracted keywords from feature text
 * @param systems - Available system documents to match against
 * @param maxResults - Maximum number of results to return (default: 5)
 * @returns Array of SystemMatchResult sorted by relevance score
 *
 * @example
 * const keywords = [{ keyword: 'character', weight: 100 }];
 * const systems = [{ id: '1', name: 'Character System', tags: ['character', 'player'], ... }];
 * const results = matchSystemsByKeywords(keywords, systems);
 * // Returns: [{ systemId: '1', systemName: 'Character System', relevanceScore: 100, matchedTags: ['character'] }]
 */
export function matchSystemsByKeywords(
  keywords: ExtractedKeyword[],
  systems: SystemDocument[],
  maxResults: number = DEFAULT_MAX_RESULTS
): SystemMatchResult[] {
  // Handle edge cases
  if (keywords.length === 0 || systems.length === 0) {
    return [];
  }

  // Normalize keywords to lowercase for case-insensitive matching
  const keywordSet = new Set(keywords.map((k) => k.keyword.toLowerCase()));

  // Match systems and calculate scores
  const results: SystemMatchResult[] = [];

  for (const system of systems) {
    // Find matching tags (case-insensitive)
    const matchedTags: string[] = [];

    for (const tag of system.tags) {
      if (keywordSet.has(tag.toLowerCase())) {
        matchedTags.push(tag.toLowerCase());
      }
    }

    // Skip systems with no matches
    if (matchedTags.length === 0) {
      continue;
    }

    // Calculate relevance score based on matched tags ratio
    // Score = (matched tags / total keywords) * 100
    const relevanceScore = Math.round((matchedTags.length / keywordSet.size) * 100);

    results.push({
      systemId: system.id,
      systemName: system.name,
      relevanceScore,
      matchedTags,
    });
  }

  // Sort by relevance score (descending) and limit results
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, maxResults);
}
