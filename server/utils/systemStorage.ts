/**
 * System Document Storage Utilities
 * File system operations for system document persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { SystemDocument } from '../../src/types/index.ts';
import type { CreateSystemDocumentDto, UpdateSystemDocumentDto } from '../types.ts';
import { WORKSPACE_PATH } from './projectStorage.ts';

/**
 * Get systems directory path for a project
 * @param projectId - Project UUID
 * @returns Path to the systems directory
 */
export function getSystemsPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'systems');
}

/**
 * Get systems.json path for a project
 * @param projectId - Project UUID
 * @returns Path to systems.json
 */
export function getSystemsJsonPath(projectId: string): string {
  return path.join(getSystemsPath(projectId), 'systems.json');
}

/**
 * Get content file path for a system document
 * @param projectId - Project UUID
 * @param systemId - System document UUID
 * @returns Path to the content markdown file
 */
export function getSystemContentPath(projectId: string, systemId: string): string {
  return path.join(getSystemsPath(projectId), `${systemId}.md`);
}

/**
 * Read systems metadata from systems.json
 * @param projectId - Project UUID
 * @returns Array of system document metadata (without content)
 */
async function readSystemsJson(projectId: string): Promise<Omit<SystemDocument, 'content'>[]> {
  try {
    const content = await fs.readFile(getSystemsJsonPath(projectId), 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * Write systems metadata to systems.json
 * @param projectId - Project UUID
 * @param systems - Array of system document metadata
 */
async function writeSystemsJson(projectId: string, systems: Omit<SystemDocument, 'content'>[]): Promise<void> {
  await fs.writeFile(getSystemsJsonPath(projectId), JSON.stringify(systems, null, 2), 'utf-8');
}

/**
 * Read content from a system document's markdown file
 * @param projectId - Project UUID
 * @param systemId - System document UUID
 * @returns Content string or empty string if file doesn't exist
 */
async function readSystemContent(projectId: string, systemId: string): Promise<string> {
  try {
    return await fs.readFile(getSystemContentPath(projectId, systemId), 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Write content to a system document's markdown file
 * @param projectId - Project UUID
 * @param systemId - System document UUID
 * @param content - Markdown content to write
 */
async function writeSystemContent(projectId: string, systemId: string, content: string): Promise<void> {
  await fs.writeFile(getSystemContentPath(projectId, systemId), content, 'utf-8');
}

/**
 * Delete a system document's markdown file
 * @param projectId - Project UUID
 * @param systemId - System document UUID
 */
async function deleteSystemContent(projectId: string, systemId: string): Promise<void> {
  try {
    await fs.unlink(getSystemContentPath(projectId, systemId));
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Get all system documents from a project
 * @param projectId - Project UUID
 * @returns Array of system documents sorted by createdAt descending (newest first)
 */
export async function getAllSystemDocuments(projectId: string): Promise<SystemDocument[]> {
  const systemsMetadata = await readSystemsJson(projectId);

  // Load content for each system document
  const systems: SystemDocument[] = await Promise.all(
    systemsMetadata.map(async (metadata) => ({
      ...metadata,
      content: await readSystemContent(projectId, metadata.id),
    }))
  );

  // Sort by createdAt descending (newest first)
  return systems.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get a single system document by ID
 * @param projectId - Project UUID
 * @param systemId - System document UUID
 * @returns System document if found, null otherwise
 */
export async function getSystemDocumentById(projectId: string, systemId: string): Promise<SystemDocument | null> {
  const systemsMetadata = await readSystemsJson(projectId);
  const metadata = systemsMetadata.find(s => s.id === systemId);

  if (!metadata) {
    return null;
  }

  return {
    ...metadata,
    content: await readSystemContent(projectId, systemId),
  };
}

/**
 * Create a new system document
 * @param projectId - Project UUID
 * @param systemId - Generated UUID for the new system document
 * @param data - System document creation data
 * @returns Created system document
 */
export async function createSystemDocument(
  projectId: string,
  systemId: string,
  data: CreateSystemDocumentDto
): Promise<SystemDocument> {
  const now = new Date().toISOString();

  const systemDocument: SystemDocument = {
    id: systemId,
    projectId,
    name: data.name.trim(),
    category: data.category.trim(),
    tags: data.tags ?? [],
    content: data.content ?? '',
    dependencies: data.dependencies ?? [],
    createdAt: now,
    updatedAt: now,
  };

  // Read existing systems and add new one
  const systems = await readSystemsJson(projectId);
  const metadataToStore = {
    id: systemDocument.id,
    projectId: systemDocument.projectId,
    name: systemDocument.name,
    category: systemDocument.category,
    tags: systemDocument.tags,
    dependencies: systemDocument.dependencies,
    createdAt: systemDocument.createdAt,
    updatedAt: systemDocument.updatedAt,
  };
  systems.push(metadataToStore);

  // Write metadata and content
  await writeSystemsJson(projectId, systems);
  await writeSystemContent(projectId, systemId, systemDocument.content);

  return systemDocument;
}

/**
 * Update an existing system document
 * @param projectId - Project UUID
 * @param systemId - System document UUID
 * @param data - System document update data
 * @returns Updated system document
 */
export async function updateSystemDocument(
  projectId: string,
  systemId: string,
  data: UpdateSystemDocumentDto
): Promise<SystemDocument> {
  const existing = await getSystemDocumentById(projectId, systemId);

  if (!existing) {
    throw new Error('System document not found');
  }

  const updated: SystemDocument = {
    ...existing,
    name: data.name !== undefined ? data.name.trim() : existing.name,
    category: data.category !== undefined ? data.category.trim() : existing.category,
    tags: data.tags ?? existing.tags,
    content: data.content ?? existing.content,
    dependencies: data.dependencies ?? existing.dependencies,
    updatedAt: new Date().toISOString(),
  };

  // Update metadata in systems.json
  const systems = await readSystemsJson(projectId);
  const index = systems.findIndex(s => s.id === systemId);

  if (index !== -1) {
    systems[index] = {
      id: updated.id,
      projectId: updated.projectId,
      name: updated.name,
      category: updated.category,
      tags: updated.tags,
      dependencies: updated.dependencies,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
    await writeSystemsJson(projectId, systems);
  }

  // Update content file
  await writeSystemContent(projectId, systemId, updated.content);

  return updated;
}

/**
 * Delete a system document
 * @param projectId - Project UUID
 * @param systemId - System document UUID
 */
export async function deleteSystemDocument(projectId: string, systemId: string): Promise<void> {
  // Remove from systems.json
  const systems = await readSystemsJson(projectId);
  const filteredSystems = systems.filter(s => s.id !== systemId);
  await writeSystemsJson(projectId, filteredSystems);

  // Delete content file
  await deleteSystemContent(projectId, systemId);
}

/**
 * Check if system document name already exists in a project
 * @param projectId - Project UUID
 * @param name - System document name to check
 * @param excludeId - Optional ID to exclude from check (for updates)
 * @returns true if duplicate exists
 */
export async function isSystemNameDuplicate(projectId: string, name: string, excludeId?: string): Promise<boolean> {
  const systems = await readSystemsJson(projectId);
  return systems.some(s => s.name === name && s.id !== excludeId);
}

/**
 * Get all unique categories from system documents in a project
 * @param projectId - Project UUID
 * @returns Array of unique categories sorted alphabetically
 */
export async function getUniqueCategories(projectId: string): Promise<string[]> {
  const systems = await readSystemsJson(projectId);
  const categories = [...new Set(systems.map(s => s.category))];
  return categories.sort();
}

/**
 * Get all unique tags from system documents in a project
 * @param projectId - Project UUID
 * @returns Array of unique tags sorted alphabetically
 */
export async function getUniqueTags(projectId: string): Promise<string[]> {
  const systems = await readSystemsJson(projectId);
  const allTags = systems.flatMap(s => s.tags);
  const uniqueTags = [...new Set(allTags)];
  return uniqueTags.sort();
}
