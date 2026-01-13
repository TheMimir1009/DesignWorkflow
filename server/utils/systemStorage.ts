/**
<<<<<<< HEAD
 * System Document Storage Utilities
=======
 * System Storage Utilities
>>>>>>> main
 * File system operations for system document persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { SystemDocument } from '../../src/types/index.ts';
<<<<<<< HEAD
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
=======
import { v4 as uuidv4 } from 'uuid';
import { WORKSPACE_PATH } from './projectStorage.ts';

/**
 * Get systems file path for a project
 */
function getSystemsFilePath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'systems', 'systems.json');
}

/**
 * Get system .md file path
 */
function getSystemMdPath(projectId: string, systemId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'systems', `${systemId}.md`);
}

/**
 * Get all systems for a project
 * @param projectId - Project ID
 * @returns Array of system documents for the project
 */
export async function getSystemsByProject(projectId: string): Promise<SystemDocument[]> {
  const systemsPath = getSystemsFilePath(projectId);

  try {
    const content = await fs.readFile(systemsPath, 'utf-8');
    return JSON.parse(content) as SystemDocument[];
>>>>>>> main
  } catch {
    return [];
  }
}

/**
<<<<<<< HEAD
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
=======
 * Get a system by ID across all projects
 * @param systemId - System ID to find
 * @returns System and its project ID if found, null otherwise
 */
export async function getSystemById(systemId: string): Promise<{ system: SystemDocument; projectId: string } | null> {
  try {
    const entries = await fs.readdir(WORKSPACE_PATH, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== '.gitkeep') {
        const systems = await getSystemsByProject(entry.name);
        const system = systems.find((s) => s.id === systemId);
        if (system) {
          return { system, projectId: entry.name };
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * Save systems for a project
 * @param projectId - Project ID
 * @param systems - Systems array to save
 */
export async function saveProjectSystems(projectId: string, systems: SystemDocument[]): Promise<void> {
  const systemsPath = getSystemsFilePath(projectId);
  await fs.writeFile(systemsPath, JSON.stringify(systems, null, 2), 'utf-8');
}

/**
 * Create a new system document
 * @param data - System document creation data
 * @returns Created system document
 */
export interface CreateSystemDto {
  projectId: string;
  name: string;
  category: string;
  tags?: string[];
  content?: string;
  dependencies?: string[];
}

export async function createSystem(data: CreateSystemDto): Promise<SystemDocument> {
  const now = new Date().toISOString();

  const newSystem: SystemDocument = {
    id: uuidv4(),
    projectId: data.projectId,
    name: data.name,
    category: data.category,
    tags: data.tags || [],
    content: data.content || '',
    dependencies: data.dependencies || [],
    createdAt: now,
    updatedAt: now,
  };

  const systems = await getSystemsByProject(data.projectId);
  systems.push(newSystem);
  await saveProjectSystems(data.projectId, systems);

  // Create .md file for content
  const mdPath = getSystemMdPath(data.projectId, newSystem.id);
  await fs.writeFile(mdPath, newSystem.content, 'utf-8');

  return newSystem;
}

/**
 * Update a system document
 * @param systemId - System ID to update
 * @param updates - Partial system updates
 * @returns Updated system if found, null otherwise
 */
export async function updateSystem(systemId: string, updates: Partial<SystemDocument>): Promise<SystemDocument | null> {
  const result = await getSystemById(systemId);
  if (!result) {
    return null;
  }

  const { system, projectId } = result;
  const systems = await getSystemsByProject(projectId);
  const systemIndex = systems.findIndex((s) => s.id === systemId);

  if (systemIndex === -1) {
    return null;
  }

  const updatedSystem: SystemDocument = {
    ...system,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  systems[systemIndex] = updatedSystem;
  await saveProjectSystems(projectId, systems);

  // Update .md file if content was changed
  if (updates.content !== undefined) {
    const mdPath = getSystemMdPath(projectId, systemId);
    await fs.writeFile(mdPath, updatedSystem.content, 'utf-8');
  }

  return updatedSystem;
}

/**
 * Delete a system document
 * @param systemId - System ID to delete
 * @returns true if deleted, false if not found
 */
export async function deleteSystem(systemId: string): Promise<boolean> {
  const result = await getSystemById(systemId);
  if (!result) {
    return false;
  }

  const { projectId } = result;
  const systems = await getSystemsByProject(projectId);
  const filteredSystems = systems.filter((s) => s.id !== systemId);

  if (filteredSystems.length === systems.length) {
    return false; // System was not in the list
  }

  await saveProjectSystems(projectId, filteredSystems);

  // Delete .md file
  const mdPath = getSystemMdPath(projectId, systemId);
  try {
    await fs.unlink(mdPath);
  } catch {
    // Ignore if file doesn't exist
  }

  return true;
}

/**
 * Check if a system name already exists in a project
 * @param projectId - Project ID to check within
 * @param name - Name to check for duplicates
 * @param excludeId - Optional system ID to exclude from check (for updates)
 * @returns true if a duplicate name exists, false otherwise
 */
export async function isSystemNameDuplicate(
  projectId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const systems = await getSystemsByProject(projectId);

  return systems.some(
    (system) =>
      system.name.toLowerCase() === name.toLowerCase() &&
      system.id !== excludeId
  );
}

// ============================================================================
// Extended System Storage Functions
// Used by systemStorage.test.ts for enhanced system document management
// ============================================================================

/**
 * Ensure systems directory exists for a project
 * @param projectId - Project ID
 */
export async function ensureSystemsDirectoryExists(projectId: string): Promise<void> {
  const systemsDir = path.join(WORKSPACE_PATH, projectId, 'systems');
  await fs.mkdir(systemsDir, { recursive: true });

  // Create systems.json if it doesn't exist
  const systemsPath = getSystemsFilePath(projectId);
  try {
    await fs.access(systemsPath);
  } catch {
    await fs.writeFile(systemsPath, '[]', 'utf-8');
>>>>>>> main
  }
}

/**
<<<<<<< HEAD
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
=======
 * Get all system documents with content from .md files
 * @param projectId - Project ID
 * @returns Array of system documents with content loaded
 */
export async function getAllSystemDocuments(projectId: string): Promise<SystemDocument[]> {
  const systems = await getSystemsByProject(projectId);

  // Load content from .md files for each system
  const documentsWithContent: SystemDocument[] = [];
  for (const system of systems) {
    const mdPath = getSystemMdPath(projectId, system.id);
    let content = '';
    try {
      content = await fs.readFile(mdPath, 'utf-8');
    } catch {
      // .md file doesn't exist, use empty content
    }
    documentsWithContent.push({ ...system, content });
  }

  return documentsWithContent;
}

/**
 * Get a system document by ID with content
 * @param projectId - Project ID
 * @param documentId - Document ID
 * @returns System document with content, or null if not found
 */
export async function getSystemDocumentById(
  projectId: string,
  documentId: string
): Promise<SystemDocument | null> {
  const systems = await getSystemsByProject(projectId);
  const system = systems.find((s) => s.id === documentId);

  if (!system) {
    return null;
  }

  // Load content from .md file
  const mdPath = getSystemMdPath(projectId, documentId);
  let content = '';
  try {
    content = await fs.readFile(mdPath, 'utf-8');
  } catch {
    // .md file doesn't exist
  }

  return { ...system, content };
}

/**
 * Save a system document (creates or updates)
 * Stores metadata in systems.json (without content) and content in separate .md file
 * @param projectId - Project ID
 * @param document - System document to save
 */
export async function saveSystemDocument(
  projectId: string,
  document: SystemDocument
): Promise<void> {
  const systems = await getSystemsByProject(projectId);

  // Extract content to save separately
  const { content, ...metadataOnly } = document;

  // Check if document already exists
  const existingIndex = systems.findIndex((s) => s.id === document.id);

  if (existingIndex >= 0) {
    // Update existing
    systems[existingIndex] = metadataOnly as SystemDocument;
  } else {
    // Add new
    systems.push(metadataOnly as SystemDocument);
  }

  // Save systems.json (without content)
  await saveProjectSystems(projectId, systems);

  // Save content to .md file
  const mdPath = getSystemMdPath(projectId, document.id);
  await fs.writeFile(mdPath, content || '', 'utf-8');
}

/**
 * Delete a system document
 * @param projectId - Project ID
 * @param documentId - Document ID to delete
 */
export async function deleteSystemDocument(
  projectId: string,
  documentId: string
): Promise<void> {
  const systems = await getSystemsByProject(projectId);
  const filteredSystems = systems.filter((s) => s.id !== documentId);

  await saveProjectSystems(projectId, filteredSystems);

  // Delete .md file
  const mdPath = getSystemMdPath(projectId, documentId);
  try {
    await fs.unlink(mdPath);
>>>>>>> main
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
<<<<<<< HEAD
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

/**
 * Ensure systems directory exists
 * @param projectId - Project UUID
 */
export async function ensureSystemsDirectoryExists(projectId: string): Promise<void> {
  const systemsDir = getSystemsPath(projectId);
  await fs.mkdir(systemsDir, { recursive: true });
}

/**
 * Save a system document (create or update)
 * Used for backward compatibility with tests
 * @param projectId - Project UUID
 * @param doc - Full system document to save
 */
export async function saveSystemDocument(projectId: string, doc: SystemDocument): Promise<void> {
  const systems = await readSystemsJson(projectId);
  const existingIndex = systems.findIndex(s => s.id === doc.id);

  const { content, ...metadata } = doc;

  if (existingIndex >= 0) {
    // Update existing
    systems[existingIndex] = metadata;
  } else {
    // Add new
    systems.push(metadata);
  }

  await writeSystemsJson(projectId, systems);
  await writeSystemContent(projectId, doc.id, content);
}

// Alias exports for backward compatibility
export { getUniqueCategories as getCategories };
export { getUniqueTags as getTags };
=======
 * Get unique categories from all system documents in a project
 * @param projectId - Project ID
 * @returns Sorted array of unique category names
 */
export async function getCategories(projectId: string): Promise<string[]> {
  const systems = await getSystemsByProject(projectId);

  const categoriesSet = new Set<string>();
  for (const system of systems) {
    if (system.category) {
      categoriesSet.add(system.category);
    }
  }

  return Array.from(categoriesSet).sort();
}

/**
 * Get unique tags from all system documents in a project
 * @param projectId - Project ID
 * @returns Sorted array of unique tags
 */
export async function getTags(projectId: string): Promise<string[]> {
  const systems = await getSystemsByProject(projectId);

  const tagsSet = new Set<string>();
  for (const system of systems) {
    if (system.tags) {
      for (const tag of system.tags) {
        tagsSet.add(tag);
      }
    }
  }

  return Array.from(tagsSet).sort();
}
>>>>>>> main
