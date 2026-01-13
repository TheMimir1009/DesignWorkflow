/**
 * Diff Generator Utilities
 *
 * Provides document version comparison and change visualization:
 * - Generate diffs between two document versions
 * - Format diffs as markdown for display
 * - Track additions, deletions, and modifications
 *
 * Uses the 'diff' package (jsdiff) for accurate text comparison.
 *
 * ## Features
 *
 * - Line-by-line diff comparison
 * - Change type classification (addition, deletion, modification)
 * - Summary statistics
 * - Markdown-formatted output
 * - Support for multi-line content
 *
 * @module diffGenerator
 */

import * as diff from 'diff';
import type { DocumentVersion } from './versionStorage';

/**
 * Change type for individual diff changes
 */
export type ChangeType = 'addition' | 'deletion' | 'modification';

/**
 * Individual change in the document
 *
 * Represents a single detected change between two versions,
 * including the change type and affected content.
 */
export interface DiffChange {
  /** Type of change */
  type: ChangeType;
  /** The changed content (one or more lines) */
  value: string;
  /** Line number where change occurred (optional) */
  line?: number;
  /** Additional context around the change (optional) */
  context?: string;
}

/**
 * Summary of changes between two versions
 *
 * Provides statistical overview of detected changes.
 */
export interface DiffSummary {
  /** Number of line additions */
  additions: number;
  /** Number of line deletions */
  deletions: number;
  /** Estimated number of modifications (add+delete pairs) */
  modifications: number;
}

/**
 * Complete diff result between two document versions
 *
 * Contains full comparison result including both versions,
 * all detected changes, and summary statistics.
 */
export interface DiffResult {
  /** First (older) version */
  version1: DocumentVersion;
  /** Second (newer) version */
  version2: DocumentVersion;
  /** Array of individual changes in order */
  changes: DiffChange[];
  /** Summary statistics */
  summary: DiffSummary;
}

/**
 * Generate a document diff between two versions
 *
 * Compares the content of two document versions line-by-line and returns
 * a detailed breakdown of changes with summary statistics.
 *
 * The function uses the jsdiff library to perform line-based diffing,
 * which accurately detects additions, deletions, and unchanged sections.
 *
 * @param version1 - First (older) version
 * @param version2 - Second (newer) version
 * @returns Diff result with changes array and summary
 *
 * @example
 * ```typescript
 * const v1 = { content: 'Hello World', ... };
 * const v2 = { content: 'Hello Beautiful World', ... };
 * const diff = generateDocumentDiff(v1, v2);
 * console.log(`Found ${diff.summary.additions} additions`);
 * // Output: Found 1 additions
 * ```
 */
export function generateDocumentDiff(
  version1: DocumentVersion,
  version2: DocumentVersion
): DiffResult {
  const changes: DiffChange[] = [];
  let additions = 0;
  let deletions = 0;

  // Use diff package to compare content line-by-line
  const diffResult = diff.diffLines(version1.content, version2.content);

  for (const part of diffResult) {
    if (part.added) {
      additions++;
      changes.push({
        type: 'addition',
        value: part.value,
      });
    } else if (part.removed) {
      deletions++;
      changes.push({
        type: 'deletion',
        value: part.value,
      });
    }
    // Unchanged parts are not included in the changes array
    // to keep the output focused on actual changes
  }

  // Calculate modifications as pairs of addition + deletion
  // This is a simplified heuristic - true modification detection
  // would require more sophisticated diffing algorithms
  const modifications = Math.min(additions, deletions);

  const summary: DiffSummary = {
    additions,
    deletions,
    modifications,
  };

  return {
    version1,
    version2,
    changes,
    summary,
  };
}

/**
 * Format diff result as markdown
 *
 * Creates a human-readable markdown representation of the diff,
 * including version metadata, summary statistics, and formatted
 * changes using diff syntax highlighting.
 *
 * The output is structured with sections:
 * 1. Version comparison (IDs, descriptions, author, timestamp)
 * 2. Summary statistics (additions, deletions, modifications)
 * 3. Detailed changes in diff format
 *
 * @param diffResult - Diff result to format
 * @returns Markdown string representation of the diff
 *
 * @example
 * ```typescript
 * const diff = generateDocumentDiff(v1, v2);
 * const markdown = formatDiffAsMarkdown(diff);
 * console.log(markdown);
 * // Output:
 * // # Document Diff
 * //
 * // ## Version Comparison
 * // - **Version 1**: abc123 (Initial version)
 * // - **Version 2**: def456 (Added new section)
 * // - **Author**: user@example.com
 * // - **Timestamp**: 2024-01-10T10:00:00Z
 * //
 * // ## Summary
 * // - **Additions**: 5
 * // - **Deletions**: 2
 * // - **Modifications**: 2
 * //
 * // ## Changes
 * // ```diff
 * // + Added line 1
 * // + Added line 2
 * // - Removed line
 * // ```
 * ```
 */
export function formatDiffAsMarkdown(diffResult: DiffResult): string {
  const { version1, version2, changes, summary } = diffResult;

  let markdown = '# Document Diff\n\n';

  // Version information section
  markdown += '## Version Comparison\n\n';
  markdown += `- **Version ${version1.versionNumber}**: ${version1.id} (${version1.changeDescription || 'No description'})\n`;
  markdown += `- **Version ${version2.versionNumber}**: ${version2.id} (${version2.changeDescription || 'No description'})\n`;
  markdown += `- **Author**: ${version2.author}\n`;
  markdown += `- **Timestamp**: ${version2.timestamp}\n\n`;

  // Summary section
  markdown += '## Summary\n\n';
  markdown += `- **Additions**: ${summary.additions}\n`;
  markdown += `- **Deletions**: ${summary.deletions}\n`;
  markdown += `- **Modifications**: ${summary.modifications}\n\n`;

  // Changes section
  markdown += '## Changes\n\n';

  if (changes.length === 0) {
    markdown += 'No changes detected between versions.\n';
  } else {
    markdown += '```diff\n';

    for (const change of changes) {
      // Determine prefix based on change type
      const prefix = change.type === 'addition' ? '+' : change.type === 'deletion' ? '-' : '~';

      // Split value into lines and filter empty lines
      const lines = change.value.split('\n').filter((line) => line.trim() !== '');

      // Format each line with the appropriate prefix
      for (const line of lines) {
        markdown += `${prefix} ${line}\n`;
      }
    }

    markdown += '```\n';
  }

  return markdown;
}
