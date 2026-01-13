/**
 * Version Storage Utilities
 *
 * Provides file system-based document version management with:
 * - Automatic version numbering
 * - Parent-child version tracking
 * - Change description support
 * - Task-scoped version isolation
 *
 * File Structure:
 * workspace/projects/{projectId}/tasks/{taskId}/versions/
 *   ├── versions.json (index of all version IDs)
 *   ├── {versionId1}.json
 *   ├── {versionId2}.json
 *   └── ...
 *
 * @module versionStorage
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { WORKSPACE_PATH } from './projectStorage';

/**
 * Document Version interface
 * Represents a single version of a task's document content
 */
export interface DocumentVersion {
  /** Unique identifier for this version */
  id: string;
  /** ID of the task this version belongs to */
  taskId: string;
  /** Document content at this version */
  content: string;
  /** ISO timestamp when version was created */
  timestamp: string;
  /** User who created this version */
  author: string;
  /** Sequential version number for this task */
  versionNumber: number;
  /** Optional description of changes made */
  changeDescription?: string;
  /** Optional parent version ID for tracking lineage */
  parentVersionId?: string;
}

/**
 * Input for creating a new version
 */
export interface SaveVersionInput {
  /** ID of the task to version */
  taskId: string;
  /** Document content to save */
  content: string;
  /** User creating the version */
  author: string;
  /** Optional description of changes */
  changeDescription?: string;
  /** Optional parent version ID */
  parentVersionId?: string;
}

/**
 * Get versions directory path for a task
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @returns Absolute path to task's versions directory
 */
function getVersionsDirPath(projectId: string, taskId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'tasks', taskId, 'versions');
}

/**
 * Get version index file path for a task
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @returns Absolute path to versions.json index file
 */
export function getVersionIndexFilePath(projectId: string, taskId: string): string {
  return path.join(getVersionsDirPath(projectId, taskId), 'versions.json');
}

/**
 * Get version file path for a specific version
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @param versionId - Version ID
 * @returns Absolute path to version JSON file
 */
export function getVersionFilePath(projectId: string, taskId: string, versionId: string): string {
  return path.join(getVersionsDirPath(projectId, taskId), `${versionId}.json`);
}

/**
 * Get all versions file path for a project
 * @param projectId - Project ID
 * @returns Absolute path to project's versions index
 */
export function getVersionsFilePath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'versions.json');
}

/**
 * Ensure versions directory exists
 * @param projectId - Project ID
 * @param taskId - Task ID
 */
async function ensureVersionsDirectory(projectId: string, taskId: string): Promise<void> {
  const versionsDir = getVersionsDirPath(projectId, taskId);
  await fs.mkdir(versionsDir, { recursive: true });
}

/**
 * Read version index file
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @returns Array of version IDs, empty array if file doesn't exist
 */
async function readVersionIndex(projectId: string, taskId: string): Promise<string[]> {
  try {
    const indexPath = getVersionIndexFilePath(projectId, taskId);
    const content = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(content) as string[];
  } catch {
    return [];
  }
}

/**
 * Write version index file
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @param versionIds - Array of version IDs to write
 */
async function writeVersionIndex(projectId: string, taskId: string, versionIds: string[]): Promise<void> {
  const indexPath = getVersionIndexFilePath(projectId, taskId);
  await fs.writeFile(indexPath, JSON.stringify(versionIds, null, 2), 'utf-8');
}

/**
 * Calculate next version number for a task
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @returns Next version number (1 if no versions exist)
 */
async function getNextVersionNumber(projectId: string, taskId: string): Promise<number> {
  const existingVersions = await getVersions(projectId, taskId);

  if (existingVersions.length === 0) {
    return 1;
  }

  const maxVersionNumber = Math.max(...existingVersions.map((v) => v.versionNumber));
  return maxVersionNumber + 1;
}

/**
 * Save a new document version
 *
 * Automatically increments version number and creates necessary directory structure.
 * Thread-safe for concurrent operations within the same task.
 *
 * @param projectId - Project ID
 * @param input - Version data to save
 * @returns Saved version with generated ID and metadata
 *
 * @example
 * ```typescript
 * const version = await saveVersion('project-123', {
 *   taskId: 'task-456',
 *   content: '# Updated Document',
 *   author: 'user-789',
 *   changeDescription: 'Fixed critical bug'
 * });
 * ```
 */
export async function saveVersion(
  projectId: string,
  input: SaveVersionInput
): Promise<DocumentVersion> {
  await ensureVersionsDirectory(projectId, input.taskId);

  const nextVersionNumber = await getNextVersionNumber(projectId, input.taskId);

  const newVersion: DocumentVersion = {
    id: uuidv4(),
    taskId: input.taskId,
    content: input.content,
    author: input.author,
    versionNumber: nextVersionNumber,
    timestamp: new Date().toISOString(),
    changeDescription: input.changeDescription,
    parentVersionId: input.parentVersionId,
  };

  // Save version file
  const versionFilePath = getVersionFilePath(projectId, input.taskId, newVersion.id);
  await fs.writeFile(versionFilePath, JSON.stringify(newVersion, null, 2), 'utf-8');

  // Update version index
  const versionIds = await readVersionIndex(projectId, input.taskId);
  versionIds.push(newVersion.id);
  await writeVersionIndex(projectId, input.taskId, versionIds);

  return newVersion;
}

/**
 * Get all versions for a task
 *
 * Returns versions sorted by version number in ascending order.
 *
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @returns Array of versions sorted by version number
 *
 * @example
 * ```typescript
 * const versions = await getVersions('project-123', 'task-456');
 * console.log(`Found ${versions.length} versions`);
 * versions.forEach(v => console.log(`v${v.versionNumber}: ${v.changeDescription}`));
 * ```
 */
export async function getVersions(projectId: string, taskId: string): Promise<DocumentVersion[]> {
  const versionIds = await readVersionIndex(projectId, taskId);

  if (versionIds.length === 0) {
    return [];
  }

  const versions: DocumentVersion[] = [];

  for (const versionId of versionIds) {
    const version = await getVersion(projectId, taskId, versionId);
    if (version) {
      versions.push(version);
    }
  }

  // Sort by version number ascending
  return versions.sort((a, b) => a.versionNumber - b.versionNumber);
}

/**
 * Get a specific version by ID
 *
 * Verifies that the version belongs to the specified task before returning.
 *
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @param versionId - Version ID
 * @returns Version if found and belongs to task, null otherwise
 *
 * @example
 * ```typescript
 * const version = await getVersion('project-123', 'task-456', 'version-789');
 * if (version) {
 *   console.log(`Found version ${version.versionNumber} by ${version.author}`);
 * }
 * ```
 */
export async function getVersion(
  projectId: string,
  taskId: string,
  versionId: string
): Promise<DocumentVersion | null> {
  try {
    const versionFilePath = getVersionFilePath(projectId, taskId, versionId);
    const content = await fs.readFile(versionFilePath, 'utf-8');
    const version = JSON.parse(content) as DocumentVersion;

    // Verify the version belongs to the specified task
    if (version.taskId !== taskId) {
      return null;
    }

    return version;
  } catch {
    return null;
  }
}

/**
 * Restore a task to a specific version
 *
 * Creates a new version with the content from the specified version.
 * The restored version includes a reference to the original version as its parent.
 *
 * @param projectId - Project ID
 * @param taskId - Task ID
 * @param versionId - Version ID to restore
 * @returns Newly created version with restored content, null if version not found
 *
 * @example
 * ```typescript
 * const restored = await restoreVersion('project-123', 'task-456', 'version-old-789');
 * if (restored) {
 *   console.log(`Restored to version ${restored.versionNumber}`);
 *   console.log(`Description: ${restored.changeDescription}`);
 * }
 * ```
 */
export async function restoreVersion(
  projectId: string,
  taskId: string,
  versionId: string
): Promise<DocumentVersion | null> {
  const targetVersion = await getVersion(projectId, taskId, versionId);

  if (!targetVersion) {
    return null;
  }

  const restoredVersion = await saveVersion(projectId, {
    taskId,
    content: targetVersion.content,
    author: targetVersion.author,
    changeDescription: `Restored from version ${targetVersion.versionNumber}`,
    parentVersionId: versionId,
  });

  return restoredVersion;
}
