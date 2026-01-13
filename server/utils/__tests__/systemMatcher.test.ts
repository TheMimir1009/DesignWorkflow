/**
 * Test Suite: systemMatcher.ts utility
 * TDD implementation for system matching functionality
 *
 * Requirements covered:
 * - TASK-001: Keyword-tag matching logic
 * - TASK-001: Relevance score calculation
 * - TASK-001: Result sorting and limiting
 */
import { describe, it, expect } from 'vitest';
import { matchSystemsByKeywords } from '../systemMatcher.ts';
import type { ExtractedKeyword } from '../keywordExtractor.ts';
import type { SystemDocument } from '../../../src/types/index.ts';

/**
 * Helper function to create mock SystemDocument
 */
function createMockSystem(overrides: Partial<SystemDocument> = {}): SystemDocument {
  return {
    id: 'system-1',
    projectId: 'project-1',
    name: 'Test System',
    category: 'core',
    tags: ['tag1', 'tag2'],
    content: 'Test content',
    dependencies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Helper function to create mock ExtractedKeyword
 */
function createMockKeyword(keyword: string, weight: number = 50): ExtractedKeyword {
  return { keyword, weight };
}

describe('systemMatcher', () => {
  describe('matchSystemsByKeywords', () => {
    // Test 1: Keywords matching tags
    it('should match keywords with system tags', () => {
      const keywords: ExtractedKeyword[] = [
        createMockKeyword('character', 100),
        createMockKeyword('growth', 80),
      ];

      const systems: SystemDocument[] = [
        createMockSystem({
          id: 'system-1',
          name: 'Character System',
          tags: ['character', 'player', 'avatar'],
        }),
        createMockSystem({
          id: 'system-2',
          name: 'Growth System',
          tags: ['growth', 'leveling', 'progression'],
        }),
      ];

      const results = matchSystemsByKeywords(keywords, systems);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.systemId === 'system-1')).toBe(true);
      expect(results.some((r) => r.systemId === 'system-2')).toBe(true);
    });

    // Test 2: Relevance score accuracy (matched tags ratio)
    it('should calculate relevance score based on matched tags ratio', () => {
      const keywords: ExtractedKeyword[] = [
        createMockKeyword('character', 100),
        createMockKeyword('player', 80),
        createMockKeyword('avatar', 60),
      ];

      const systems: SystemDocument[] = [
        createMockSystem({
          id: 'system-1',
          name: 'Character System',
          tags: ['character', 'player', 'avatar'], // All 3 match
        }),
        createMockSystem({
          id: 'system-2',
          name: 'Player System',
          tags: ['player', 'stats'], // Only 1 matches
        }),
      ];

      const results = matchSystemsByKeywords(keywords, systems);

      const system1Result = results.find((r) => r.systemId === 'system-1');
      const system2Result = results.find((r) => r.systemId === 'system-2');

      expect(system1Result).toBeDefined();
      expect(system2Result).toBeDefined();
      expect(system1Result!.relevanceScore).toBeGreaterThan(system2Result!.relevanceScore);
    });

    // Test 3: Results sorted by score (highest first)
    it('should sort results by relevance score in descending order', () => {
      const keywords: ExtractedKeyword[] = [
        createMockKeyword('combat', 100),
        createMockKeyword('damage', 80),
        createMockKeyword('attack', 60),
      ];

      const systems: SystemDocument[] = [
        createMockSystem({
          id: 'system-low',
          name: 'Low Match System',
          tags: ['combat'], // 1 match
        }),
        createMockSystem({
          id: 'system-high',
          name: 'High Match System',
          tags: ['combat', 'damage', 'attack'], // 3 matches
        }),
        createMockSystem({
          id: 'system-medium',
          name: 'Medium Match System',
          tags: ['combat', 'damage'], // 2 matches
        }),
      ];

      const results = matchSystemsByKeywords(keywords, systems);

      expect(results[0].systemId).toBe('system-high');
      expect(results[1].systemId).toBe('system-medium');
      expect(results[2].systemId).toBe('system-low');
    });

    // Test 4: Maximum 5 results limit
    it('should limit results to maximum 5 by default', () => {
      const keywords: ExtractedKeyword[] = [createMockKeyword('common', 100)];

      const systems: SystemDocument[] = Array.from({ length: 10 }, (_, i) =>
        createMockSystem({
          id: `system-${i}`,
          name: `System ${i}`,
          tags: ['common'],
        })
      );

      const results = matchSystemsByKeywords(keywords, systems);

      expect(results.length).toBe(5);
    });

    // Test 5: Empty keywords returns empty result
    it('should return empty array when keywords are empty', () => {
      const keywords: ExtractedKeyword[] = [];

      const systems: SystemDocument[] = [
        createMockSystem({
          id: 'system-1',
          tags: ['tag1', 'tag2'],
        }),
      ];

      const results = matchSystemsByKeywords(keywords, systems);

      expect(results).toEqual([]);
    });

    // Test 6: No matching systems returns empty result
    it('should return empty array when no systems match', () => {
      const keywords: ExtractedKeyword[] = [
        createMockKeyword('nonexistent', 100),
        createMockKeyword('missing', 80),
      ];

      const systems: SystemDocument[] = [
        createMockSystem({
          id: 'system-1',
          tags: ['tag1', 'tag2'],
        }),
        createMockSystem({
          id: 'system-2',
          tags: ['tag3', 'tag4'],
        }),
      ];

      const results = matchSystemsByKeywords(keywords, systems);

      expect(results).toEqual([]);
    });

    // Test 7: Custom maxResults parameter
    it('should respect custom maxResults parameter', () => {
      const keywords: ExtractedKeyword[] = [createMockKeyword('common', 100)];

      const systems: SystemDocument[] = Array.from({ length: 10 }, (_, i) =>
        createMockSystem({
          id: `system-${i}`,
          name: `System ${i}`,
          tags: ['common'],
        })
      );

      const results = matchSystemsByKeywords(keywords, systems, 3);

      expect(results.length).toBe(3);
    });

    // Test 8: Return correct SystemMatchResult structure
    it('should return correct SystemMatchResult structure with matchedTags', () => {
      const keywords: ExtractedKeyword[] = [
        createMockKeyword('combat', 100),
        createMockKeyword('damage', 80),
      ];

      const systems: SystemDocument[] = [
        createMockSystem({
          id: 'system-1',
          name: 'Combat System',
          tags: ['combat', 'damage', 'battle'],
        }),
      ];

      const results = matchSystemsByKeywords(keywords, systems);

      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject({
        systemId: 'system-1',
        systemName: 'Combat System',
        matchedTags: expect.arrayContaining(['combat', 'damage']),
      });
      expect(results[0].relevanceScore).toBeGreaterThan(0);
      expect(results[0].relevanceScore).toBeLessThanOrEqual(100);
    });

    // Test 9: Case-insensitive matching
    it('should match keywords case-insensitively', () => {
      const keywords: ExtractedKeyword[] = [
        createMockKeyword('CHARACTER', 100),
        createMockKeyword('Growth', 80),
      ];

      const systems: SystemDocument[] = [
        createMockSystem({
          id: 'system-1',
          name: 'Character System',
          tags: ['character', 'Player'],
        }),
      ];

      const results = matchSystemsByKeywords(keywords, systems);

      expect(results.length).toBe(1);
      expect(results[0].matchedTags).toContain('character');
    });

    // Test 10: Empty systems array returns empty result
    it('should return empty array when systems are empty', () => {
      const keywords: ExtractedKeyword[] = [createMockKeyword('keyword', 100)];

      const results = matchSystemsByKeywords(keywords, []);

      expect(results).toEqual([]);
    });
  });
});
