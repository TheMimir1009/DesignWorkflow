/**
 * System Storage Utilities
 * File system operations for system document persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { SystemDocument } from '../../src/types/index.ts';
import { WORKSPACE_PATH } from './projectStorage.ts';

/**
 * Type for system document metadata (stored in systems.json without content)
 */
type SystemDocumentMetadata = Omit<SystemDocument, 'content'>;

/**
 * Get the systems directory path for a project
 * @param projectId - Project UUID
 */
function getSystemsPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'systems');
}

/**
 * Get the metadata file path for a project
 * @param projectId - Project UUID
 */
function getMetadataPath(projectId: string): string {
  return path.join(getSystemsPath(projectId), 'systems.json');
}

/**
 * Get the content file path for a system document
 * @param projectId - Project UUID
 * @param documentId - System document UUID
 */
function getContentPath(projectId: string, documentId: string): string {
  return path.join(getSystemsPath(projectId), `${documentId}.md`);
}

/**
 * Ensure systems directory exists for a project
 * @param projectId - Project UUID
 */
export async function ensureSystemsDirectoryExists(projectId: string): Promise<void> {
  const systemsPath = getSystemsPath(projectId);
  await fs.mkdir(systemsPath, { recursive: true });

  // Create systems.json if it doesn't exist
  const metadataPath = getMetadataPath(projectId);
  try {
    await fs.access(metadataPath);
  } catch {
    await fs.writeFile(metadataPath, '[]', 'utf-8');
  }
}

/**
 * Read system document metadata from systems.json
 * @param projectId - Project UUID
 * @returns Array of system document metadata
 */
async function readMetadata(projectId: string): Promise<SystemDocumentMetadata[]> {
  try {
    const metadataPath = getMetadataPath(projectId);
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content) as SystemDocumentMetadata[];
  } catch {
    return [];
  }
}

/**
 * Write system document metadata to systems.json
 * @param projectId - Project UUID
 * @param metadata - Array of system document metadata
 */
async function writeMetadata(projectId: string, metadata: SystemDocumentMetadata[]): Promise<void> {
  const metadataPath = getMetadataPath(projectId);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

/**
 * Read content from a .md file
 * @param projectId - Project UUID
 * @param documentId - System document UUID
 * @returns Content string, empty string if file doesn't exist
 */
async function readContent(projectId: string, documentId: string): Promise<string> {
  try {
    const contentPath = getContentPath(projectId, documentId);
    return await fs.readFile(contentPath, 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Write content to a .md file
 * @param projectId - Project UUID
 * @param documentId - System document UUID
 * @param content - Content to write
 */
async function writeContent(projectId: string, documentId: string, content: string): Promise<void> {
  const contentPath = getContentPath(projectId, documentId);
  await fs.writeFile(contentPath, content, 'utf-8');
}

/**
 * Delete content .md file
 * @param projectId - Project UUID
 * @param documentId - System document UUID
 */
async function deleteContent(projectId: string, documentId: string): Promise<void> {
  try {
    const contentPath = getContentPath(projectId, documentId);
    await fs.unlink(contentPath);
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Get all system documents for a project
 * @param projectId - Project UUID
 * @returns Array of system documents with content
 */
export async function getAllSystemDocuments(projectId: string): Promise<SystemDocument[]> {
  const metadata = await readMetadata(projectId);

  const documents: SystemDocument[] = await Promise.all(
    metadata.map(async (doc): Promise<SystemDocument> => {
      const content = await readContent(projectId, doc.id);
      return { ...doc, content };
    })
  );

  return documents;
}

/**
 * Get a single system document by ID
 * @param projectId - Project UUID
 * @param documentId - System document UUID
 * @returns System document with content, or null if not found
 */
export async function getSystemDocumentById(
  projectId: string,
  documentId: string
): Promise<SystemDocument | null> {
  const metadata = await readMetadata(projectId);
  const doc = metadata.find(d => d.id === documentId);

  if (!doc) {
    return null;
  }

  const content = await readContent(projectId, documentId);
  return { ...doc, content };
}

/**
 * Save a system document (create or update)
 * @param projectId - Project UUID
 * @param document - System document to save
 */
export async function saveSystemDocument(
  projectId: string,
  document: SystemDocument
): Promise<void> {
  await ensureSystemsDirectoryExists(projectId);

  const metadata = await readMetadata(projectId);

  // Separate content from metadata
  const { content, ...docMetadata } = document;

  // Check if document exists (update) or is new (create)
  const existingIndex = metadata.findIndex(d => d.id === document.id);

  if (existingIndex >= 0) {
    // Update existing document
    metadata[existingIndex] = docMetadata;
  } else {
    // Add new document
    metadata.push(docMetadata);
  }

  // Write metadata and content
  await writeMetadata(projectId, metadata);
  await writeContent(projectId, document.id, content);
}

/**
 * Delete a system document
 * @param projectId - Project UUID
 * @param documentId - System document UUID
 */
export async function deleteSystemDocument(
  projectId: string,
  documentId: string
): Promise<void> {
  const metadata = await readMetadata(projectId);
  const filteredMetadata = metadata.filter(d => d.id !== documentId);

  await writeMetadata(projectId, filteredMetadata);
  await deleteContent(projectId, documentId);
}

/**
 * Get all unique categories for a project
 * @param projectId - Project UUID
 * @returns Sorted array of unique category names
 */
export async function getCategories(projectId: string): Promise<string[]> {
  const metadata = await readMetadata(projectId);
  const categories = new Set(metadata.map(d => d.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags for a project
 * @param projectId - Project UUID
 * @returns Sorted array of unique tag names
 */
export async function getTags(projectId: string): Promise<string[]> {
  const metadata = await readMetadata(projectId);
  const tags = new Set(metadata.flatMap(d => d.tags));
  return Array.from(tags).sort();
}

/**
 * Check if a system document name already exists in the project
 * @param projectId - Project UUID
 * @param name - Document name to check
 * @param excludeId - Optional ID to exclude from check (for updates)
 * @returns true if duplicate exists
 */
export async function isSystemNameDuplicate(
  projectId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const metadata = await readMetadata(projectId);
  return metadata.some(d => d.name === name && d.id !== excludeId);
}

/**
 * Search system documents by query
 * Searches in name, category, and tags (case insensitive)
 * @param projectId - Project UUID
 * @param query - Search query
 * @returns Array of matching system documents with content
 */
export async function searchSystemDocuments(
  projectId: string,
  query: string
): Promise<SystemDocument[]> {
  const documents = await getAllSystemDocuments(projectId);

  if (!query.trim()) {
    return documents;
  }

  const lowerQuery = query.toLowerCase();

  return documents.filter(doc => {
    const matchesName = doc.name.toLowerCase().includes(lowerQuery);
    const matchesCategory = doc.category.toLowerCase().includes(lowerQuery);
    const matchesTags = doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

    return matchesName || matchesCategory || matchesTags;
  });
}

/**
 * Get documents that depend on a specific document
 * @param projectId - Project UUID
 * @param documentId - Document ID to check dependencies for
 * @returns Array of documents that depend on the specified document
 */
export async function getDependentDocuments(
  projectId: string,
  documentId: string
): Promise<SystemDocument[]> {
  const documents = await getAllSystemDocuments(projectId);
  return documents.filter(doc => doc.dependencies.includes(documentId));
}
