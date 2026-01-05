/**
 * System Storage Utilities
 * File system operations for system document persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { SystemDocument } from '../../src/types/index.ts';
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
  } catch {
    return [];
  }
}

/**
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
