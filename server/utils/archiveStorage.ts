/**
 * Archive Storage Utilities
 * File system operations for archive persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { Task, Archive } from '../../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { WORKSPACE_PATH } from './projectStorage.ts';

/**
 * Get archives file path for a project
 */
function getArchivesFilePath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'archives', 'archives.json');
}

/**
 * Get archives directory path for a project
 */
function getArchivesDirectoryPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'archives');
}

/**
 * Get all archives for a project
 * @param projectId - Project ID
 * @returns Array of archives for the project
 */
export async function getArchivesByProject(projectId: string): Promise<Archive[]> {
  const archivesPath = getArchivesFilePath(projectId);

  try {
    const content = await fs.readFile(archivesPath, 'utf-8');
    return JSON.parse(content) as Archive[];
  } catch {
    return [];
  }
}

/**
 * Get a single archive by ID
 * @param projectId - Project ID
 * @param archiveId - Archive ID
 * @returns Archive if found, null otherwise
 */
export async function getArchiveById(
  projectId: string,
  archiveId: string
): Promise<Archive | null> {
  const archives = await getArchivesByProject(projectId);
  return archives.find((a) => a.id === archiveId) || null;
}

/**
 * Save archives for a project
 * @param projectId - Project ID
 * @param archives - Archives array to save
 */
async function saveProjectArchives(projectId: string, archives: Archive[]): Promise<void> {
  const archivesPath = getArchivesFilePath(projectId);
  const archivesDir = getArchivesDirectoryPath(projectId);

  // Ensure archives directory exists
  await fs.mkdir(archivesDir, { recursive: true });

  await fs.writeFile(archivesPath, JSON.stringify(archives, null, 2), 'utf-8');
}

/**
 * Create a new archive from a task
 * @param projectId - Project ID
 * @param taskId - Task ID to archive
 * @param task - Task data to archive
 * @returns Created archive
 * @throws Error if task is not in prototype status
 */
export async function createArchive(
  projectId: string,
  taskId: string,
  task: Task
): Promise<Archive> {
  // Only prototype tasks can be archived
  if (task.status !== 'prototype') {
    throw new Error('Only prototype tasks can be archived');
  }

  const now = new Date().toISOString();

  // Create archived task with isArchived flag
  const archivedTask: Task = {
    ...task,
    isArchived: true,
    updatedAt: now,
  };

  const newArchive: Archive = {
    id: uuidv4(),
    taskId,
    projectId,
    task: archivedTask,
    archivedAt: now,
  };

  const archives = await getArchivesByProject(projectId);
  archives.push(newArchive);
  await saveProjectArchives(projectId, archives);

  return newArchive;
}

/**
 * Delete an archive
 * @param projectId - Project ID
 * @param archiveId - Archive ID to delete
 * @returns true if deleted, false if not found
 */
export async function deleteArchive(projectId: string, archiveId: string): Promise<boolean> {
  const archives = await getArchivesByProject(projectId);

  if (archives.length === 0) {
    return false;
  }

  const filteredArchives = archives.filter((a) => a.id !== archiveId);

  if (filteredArchives.length === archives.length) {
    return false; // Archive was not in the list
  }

  await saveProjectArchives(projectId, filteredArchives);
  return true;
}

/**
 * Restore an archive back to a task
 * @param projectId - Project ID
 * @param archiveId - Archive ID to restore
 * @returns Restored task if found, null otherwise
 */
export async function restoreArchive(
  projectId: string,
  archiveId: string
): Promise<Task | null> {
  const archives = await getArchivesByProject(projectId);
  const archive = archives.find((a) => a.id === archiveId);

  if (!archive) {
    return null;
  }

  // Restore task with isArchived set to false
  const restoredTask: Task = {
    ...archive.task,
    isArchived: false,
    updatedAt: new Date().toISOString(),
  };

  // Remove archive from list
  const filteredArchives = archives.filter((a) => a.id !== archiveId);
  await saveProjectArchives(projectId, filteredArchives);

  return restoredTask;
}
