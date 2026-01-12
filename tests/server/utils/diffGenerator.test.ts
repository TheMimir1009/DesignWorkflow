/**
 * diffGenerator.test.ts
 * Unit tests for diffGenerator.ts
 *
 * Test Coverage:
 * - generateDocumentDiff: Generate diff between two document versions
 * - formatDiffAsMarkdown: Format diff result as markdown
 * - DiffChange type: Individual change detection
 * - DiffResult type: Complete diff result with summary
 */

import { describe, it, expect } from 'vitest';
import {
  generateDocumentDiff,
  formatDiffAsMarkdown
} from '../../../server/utils/diffGenerator';
import type { DocumentVersion } from '../../../server/utils/versionStorage';

describe('diffGenerator', () => {
  const createMockVersion = (
    id: string,
    content: string,
    versionNumber: number
  ): DocumentVersion => ({
    id,
    taskId: 'test-task',
    content,
    timestamp: new Date().toISOString(),
    author: 'test-user',
    versionNumber,
    changeDescription: `Version ${versionNumber}`
  });

  describe('generateDocumentDiff', () => {
    it('should detect text additions', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Beautiful World', 2);

      const diff = generateDocumentDiff(version1, version2);

      expect(diff).toBeDefined();
      expect(diff.version1).toBe(version1);
      expect(diff.version2).toBe(version2);
      expect(diff.changes.length).toBeGreaterThan(0);
      expect(diff.summary.additions).toBeGreaterThan(0);
    });

    it('should detect text deletions', () => {
      const version1 = createMockVersion('v1', 'Hello Beautiful World', 1);
      const version2 = createMockVersion('v2', 'Hello World', 2);

      const diff = generateDocumentDiff(version1, version2);

      expect(diff).toBeDefined();
      expect(diff.changes.length).toBeGreaterThan(0);
      expect(diff.summary.deletions).toBeGreaterThan(0);
    });

    it('should detect text modifications', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Earth', 2);

      const diff = generateDocumentDiff(version1, version2);

      expect(diff).toBeDefined();
      expect(diff.changes.length).toBeGreaterThan(0);
      expect(diff.summary.modifications).toBeGreaterThan(0);
    });

    it('should return empty changes for identical content', () => {
      const content = 'Hello World';
      const version1 = createMockVersion('v1', content, 1);
      const version2 = createMockVersion('v2', content, 2);

      const diff = generateDocumentDiff(version1, version2);

      expect(diff.changes).toEqual([]);
      expect(diff.summary.additions).toBe(0);
      expect(diff.summary.deletions).toBe(0);
      expect(diff.summary.modifications).toBe(0);
    });

    it('should handle multi-line content', () => {
      const version1 = createMockVersion('v1', 'Line 1\nLine 2\nLine 3', 1);
      const version2 = createMockVersion('v2', 'Line 1\nLine 2 Modified\nLine 3\nLine 4', 2);

      const diff = generateDocumentDiff(version1, version2);

      expect(diff).toBeDefined();
      expect(diff.changes.length).toBeGreaterThan(0);
    });

    it('should handle empty content', () => {
      const version1 = createMockVersion('v1', '', 1);
      const version2 = createMockVersion('v2', 'New content', 2);

      const diff = generateDocumentDiff(version1, version2);

      expect(diff).toBeDefined();
      expect(diff.summary.additions).toBeGreaterThan(0);
    });

    it('should provide accurate change summary', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Beautiful World', 2);

      const diff = generateDocumentDiff(version1, version2);

      expect(diff.summary).toBeDefined();
      expect(diff.summary.additions).toBeDefined();
      expect(diff.summary.deletions).toBeDefined();
      expect(diff.summary.modifications).toBeDefined();
      expect(typeof diff.summary.additions).toBe('number');
      expect(typeof diff.summary.deletions).toBe('number');
      expect(typeof diff.summary.modifications).toBe('number');
    });
  });

  describe('formatDiffAsMarkdown', () => {
    it('should format diff as markdown', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Beautiful World', 2);

      const diff = generateDocumentDiff(version1, version2);
      const markdown = formatDiffAsMarkdown(diff);

      expect(markdown).toBeDefined();
      expect(typeof markdown).toBe('string');
      expect(markdown.length).toBeGreaterThan(0);
    });

    it('should include version information in markdown', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Beautiful World', 2);

      const diff = generateDocumentDiff(version1, version2);
      const markdown = formatDiffAsMarkdown(diff);

      expect(markdown).toContain('Version 1');
      expect(markdown).toContain('Version 2');
    });

    it('should include summary in markdown', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Beautiful World', 2);

      const diff = generateDocumentDiff(version1, version2);
      const markdown = formatDiffAsMarkdown(diff);

      expect(markdown).toContain('Summary');
    });

    it('should include changes in markdown', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Beautiful World', 2);

      const diff = generateDocumentDiff(version1, version2);
      const markdown = formatDiffAsMarkdown(diff);

      expect(markdown).toContain('Changes');
    });

    it('should format empty diff correctly', () => {
      const content = 'Same content';
      const version1 = createMockVersion('v1', content, 1);
      const version2 = createMockVersion('v2', content, 2);

      const diff = generateDocumentDiff(version1, version2);
      const markdown = formatDiffAsMarkdown(diff);

      expect(markdown).toBeDefined();
      expect(markdown).toContain('No changes');
    });

    it('should use markdown formatting for changes', () => {
      const version1 = createMockVersion('v1', 'Hello World', 1);
      const version2 = createMockVersion('v2', 'Hello Earth', 2);

      const diff = generateDocumentDiff(version1, version2);
      const markdown = formatDiffAsMarkdown(diff);

      // Check for markdown code blocks or formatting
      expect(markdown).toMatch(/```|[-+*]/);
    });
  });
});
