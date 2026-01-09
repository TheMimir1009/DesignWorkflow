/**
 * Test Suite: keywordExtractor
 * TDD implementation for keyword extraction from Feature List text
 *
 * Requirements covered:
 * - AC-001: Extract meaningful keywords from Feature List text
 * - Extract 3-15 meaningful keywords with weights (0-100)
 * - Filter out stopwords (particles, conjunctions)
 * - Tag normalization (lowercase, special char removal, deduplication)
 */
import { describe, it, expect } from 'vitest';
import { extractKeywords } from '../keywordExtractor.ts';

describe('keywordExtractor', () => {
  describe('extractKeywords - Basic Input Handling', () => {
    it('should return empty array for empty string input', () => {
      const result = extractKeywords('');

      expect(result).toEqual([]);
    });

    it('should return empty array for input less than 100 characters', () => {
      const shortText = 'This is a short text that is less than one hundred characters.';
      expect(shortText.length).toBeLessThan(100);

      const result = extractKeywords(shortText);

      expect(result).toEqual([]);
    });

    it('should process text with exactly 100 characters', () => {
      // Create a text with exactly 100 characters that contains meaningful keywords
      const text = 'Character growth system development. Experience points gaining for level up. Ability stat distribution.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('extractKeywords - Korean Text Processing', () => {
    it('should extract keywords from Korean text', () => {
      const koreanText = '캐릭터 성장 시스템 개발을 진행합니다. 경험치 획득 시 레벨이 상승하고 능력치를 분배할 수 있습니다. 스킬 시스템과 장비 시스템도 함께 구현합니다. 전투 시스템과 퀘스트 시스템도 포함됩니다. 인벤토리 관리와 아이템 강화 기능도 추가됩니다.';
      expect(koreanText.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(koreanText);

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(15);

      // Should contain meaningful Korean keywords
      const keywords = result.map((k) => k.keyword);
      expect(keywords).toContain('캐릭터');
      expect(keywords).toContain('시스템');
    });

    it('should filter out Korean stopwords (particles and conjunctions)', () => {
      const koreanText = '캐릭터의 성장을 위한 시스템을 개발합니다. 경험치는 전투에서 획득하고 레벨이 오르면 능력치가 증가합니다. 스킬과 장비는 별도로 관리됩니다. 아이템과 무기는 강화할 수 있으며 방어구와 악세서리도 업그레이드가 가능합니다.';
      expect(koreanText.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(koreanText);
      const keywords = result.map((k) => k.keyword);

      // Korean particles should be filtered out
      expect(keywords).not.toContain('의');
      expect(keywords).not.toContain('을');
      expect(keywords).not.toContain('를');
      expect(keywords).not.toContain('은');
      expect(keywords).not.toContain('는');
      expect(keywords).not.toContain('이');
      expect(keywords).not.toContain('가');
      expect(keywords).not.toContain('에서');
      expect(keywords).not.toContain('으로');
      expect(keywords).not.toContain('와');
      expect(keywords).not.toContain('과');
    });
  });

  describe('extractKeywords - English Text Processing', () => {
    it('should extract keywords from English text', () => {
      const englishText = 'Develop character growth system with experience points and level progression. Implement ability stat distribution and skill tree management. Add equipment and inventory systems.';
      expect(englishText.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(englishText);

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(15);

      const keywords = result.map((k) => k.keyword);
      expect(keywords).toContain('character');
      expect(keywords).toContain('system');
    });

    it('should filter out English stopwords', () => {
      const englishText = 'The character growth system is being developed for the game. A level system will be implemented with experience points. Users are able to distribute their ability stats accordingly.';
      expect(englishText.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(englishText);
      const keywords = result.map((k) => k.keyword);

      // English stopwords should be filtered out
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('an');
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('are');
      expect(keywords).not.toContain('be');
      expect(keywords).not.toContain('being');
      expect(keywords).not.toContain('for');
      expect(keywords).not.toContain('with');
      expect(keywords).not.toContain('their');
    });
  });

  describe('extractKeywords - Mixed Text Processing', () => {
    it('should extract keywords from mixed Korean and English text', () => {
      const mixedText = '캐릭터 Character 성장 Growth 시스템 System 개발을 진행합니다. Level 시스템과 Experience 포인트를 구현하고 Skill Tree를 추가합니다. Equipment 장비와 Inventory 인벤토리 기능도 함께 구현합니다.';
      expect(mixedText.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(mixedText);

      expect(result.length).toBeGreaterThan(0);

      const keywords = result.map((k) => k.keyword);
      // Should contain both Korean and English keywords (normalized to lowercase for English)
      expect(keywords.some((k) => /[가-힣]/.test(k))).toBe(true);
      expect(keywords.some((k) => /[a-z]/.test(k))).toBe(true);
    });
  });

  describe('extractKeywords - Weight Calculation', () => {
    it('should assign weights between 0 and 100 to each keyword', () => {
      const text = 'Develop character growth system with experience points and level progression. Character level increases through experience. System manages character stats and abilities.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      result.forEach((keyword) => {
        expect(keyword.weight).toBeGreaterThanOrEqual(0);
        expect(keyword.weight).toBeLessThanOrEqual(100);
      });
    });

    it('should assign higher weight to more frequently occurring keywords', () => {
      const text = 'System system system development. Character character growth. Level progression and experience points. Equipment management for characters.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      const systemKeyword = result.find((k) => k.keyword === 'system');
      const characterKeyword = result.find((k) => k.keyword === 'character');
      const levelKeyword = result.find((k) => k.keyword === 'level');

      // 'system' appears 3 times, 'character' appears 3 times (including 'characters'), 'level' appears 1 time
      expect(systemKeyword).toBeDefined();
      expect(characterKeyword).toBeDefined();
      expect(levelKeyword).toBeDefined();

      if (systemKeyword && levelKeyword) {
        expect(systemKeyword.weight).toBeGreaterThan(levelKeyword.weight);
      }
    });

    it('should return keywords sorted by weight in descending order', () => {
      const text = 'System system system development. Character character growth progression. Level experience points equipment management inventory.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].weight).toBeGreaterThanOrEqual(result[i + 1].weight);
      }
    });
  });

  describe('extractKeywords - Tag Normalization', () => {
    it('should normalize keywords to lowercase', () => {
      const text = 'SYSTEM System system Development DEVELOPMENT development. Character CHARACTER character growth GROWTH. Level LEVEL experience EXPERIENCE.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);
      const keywords = result.map((k) => k.keyword);

      keywords.forEach((keyword) => {
        // All English letters should be lowercase
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });

    it('should remove special characters from keywords', () => {
      const text = 'System! @Development# $Character% ^Growth& *Level( )Experience+ =Equipment- /Inventory\\ |Management;';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);
      const keywords = result.map((k) => k.keyword);

      keywords.forEach((keyword) => {
        // Should not contain special characters
        expect(keyword).toMatch(/^[a-z가-힣0-9]+$/);
      });
    });

    it('should remove duplicate keywords', () => {
      const text = 'System system SYSTEM development Development DEVELOPMENT. Character character CHARACTER growth growth GROWTH level level.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);
      const keywords = result.map((k) => k.keyword);

      // Check for duplicates
      const uniqueKeywords = new Set(keywords);
      expect(keywords.length).toBe(uniqueKeywords.size);
    });
  });

  describe('extractKeywords - Keyword Count Limits', () => {
    it('should return maximum 15 keywords', () => {
      // Create text with many different keywords
      const text = 'System development character growth level experience equipment inventory skill tree ability stat progression combat battle magic spell weapon armor shield potion quest mission.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      expect(result.length).toBeLessThanOrEqual(15);
    });

    it('should return at least 3 keywords when text has sufficient content', () => {
      const text = 'System development project management. Building software applications with modern technology stack. Creating user interfaces and backend services.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('extractKeywords - Edge Cases', () => {
    it('should handle text with only stopwords gracefully', () => {
      // Text with many stopwords but still some content words
      const text = 'The is are was were be been being a an the for with to from by on at in of and or but if then else when while this that these those it its they them their.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      // Should return empty or very few keywords since most are stopwords
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should handle text with numbers', () => {
      const text = 'System version 2.0 released with 100 new features. Character level can reach 999. Experience points range from 0 to 1000000. Update scheduled for 2024.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      expect(result.length).toBeGreaterThan(0);
      // Numbers might be included as part of version or standalone
      const keywords = result.map((k) => k.keyword);
      expect(keywords).toContain('system');
    });

    it('should handle mixed alphanumeric tokens by separating letters from numbers', () => {
      const text = 'System level999 reached. Character stat100 increased. Experience point500 gained. Equipment item200 acquired. Inventory slot50 unlocked today.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      expect(result.length).toBeGreaterThan(0);
      const keywords = result.map((k) => k.keyword);
      // 'level999' should be split into 'level' and '999', only 'level' should be kept
      expect(keywords).toContain('system');
      // Pure numbers should be filtered out
      expect(keywords).not.toContain('999');
      expect(keywords).not.toContain('100');
    });

    it('should handle text with multiple spaces and newlines', () => {
      const text = `System    development   project.

      Character   growth    system    implementation.

      Level     experience     points      management.`;
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      expect(result.length).toBeGreaterThan(0);
      const keywords = result.map((k) => k.keyword);
      expect(keywords).toContain('system');
    });

    it('should handle punctuation properly', () => {
      const text = 'System, development; project: management. Character-growth (system) implementation! Level/experience "points" management? Equipment & inventory.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      expect(result.length).toBeGreaterThan(0);
      const keywords = result.map((k) => k.keyword);
      // Should extract clean keywords without punctuation
      expect(keywords).toContain('system');
      expect(keywords).toContain('development');
    });
  });

  describe('ExtractedKeyword interface compliance', () => {
    it('should return objects matching ExtractedKeyword interface', () => {
      const text = 'Develop character growth system with experience points and level progression. Implement ability stat distribution and skill tree management.';
      expect(text.length).toBeGreaterThanOrEqual(100);

      const result = extractKeywords(text);

      result.forEach((item) => {
        expect(item).toHaveProperty('keyword');
        expect(item).toHaveProperty('weight');
        expect(typeof item.keyword).toBe('string');
        expect(typeof item.weight).toBe('number');
      });
    });
  });
});
