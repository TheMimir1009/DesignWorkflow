/**
 * Project Storage Utilities
 * File system operations for project persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { Project } from '../../src/types/index.ts';

// Workspace path for project storage
export const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

/**
 * Ensure workspace directory exists
 */
export async function ensureWorkspaceExists(): Promise<void> {
  await fs.mkdir(WORKSPACE_PATH, { recursive: true });
}

/**
 * Get all projects from workspace
 * @returns Array of projects sorted by createdAt descending (newest first)
 */
export async function getAllProjects(): Promise<Project[]> {
  const projects: Project[] = [];

  try {
    await ensureWorkspaceExists();
    const entries = await fs.readdir(WORKSPACE_PATH, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== '.gitkeep') {
        const projectJsonPath = path.join(WORKSPACE_PATH, entry.name, 'project.json');
        try {
          const content = await fs.readFile(projectJsonPath, 'utf-8');
          projects.push(JSON.parse(content) as Project);
        } catch {
          // Skip if project.json doesn't exist or is invalid
        }
      }
    }
  } catch {
    // Return empty array if workspace doesn't exist
  }

  // Sort by createdAt descending (newest first)
  return projects.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get a single project by ID
 * @param id - Project UUID
 * @returns Project if found, null otherwise
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const projectJsonPath = path.join(WORKSPACE_PATH, id, 'project.json');

  try {
    const content = await fs.readFile(projectJsonPath, 'utf-8');
    return JSON.parse(content) as Project;
  } catch {
    return null;
  }
}

/**
 * Save project to disk
 * @param project - Project to save
 */
export async function saveProject(project: Project): Promise<void> {
  const projectDir = path.join(WORKSPACE_PATH, project.id);
  const projectJsonPath = path.join(projectDir, 'project.json');
  await fs.writeFile(projectJsonPath, JSON.stringify(project, null, 2), 'utf-8');
}

/**
 * Check if project name already exists
 * @param name - Project name to check
 * @param excludeId - Optional ID to exclude from check (for updates)
 * @returns true if duplicate exists
 */
export async function isProjectNameDuplicate(name: string, excludeId?: string): Promise<boolean> {
  const projects = await getAllProjects();
  return projects.some(p => p.name === name && p.id !== excludeId);
}

/**
 * Create project directory structure
 * @param projectId - UUID of the project
 */
export async function createProjectDirectoryStructure(projectId: string): Promise<void> {
  const projectDir = path.join(WORKSPACE_PATH, projectId);
  const systemsDir = path.join(projectDir, 'systems');
  const tasksDir = path.join(projectDir, 'tasks');
  const archivesDir = path.join(projectDir, 'archives');

  await fs.mkdir(projectDir, { recursive: true });
  await fs.mkdir(systemsDir, { recursive: true });
  await fs.mkdir(tasksDir, { recursive: true });
  await fs.mkdir(archivesDir, { recursive: true });

  // Create initial files
  await fs.writeFile(path.join(projectDir, 'RootRule.md'), '', 'utf-8');
  await fs.writeFile(path.join(systemsDir, 'systems.json'), JSON.stringify([], null, 2), 'utf-8');
}

/**
 * Delete project directory
 * @param projectId - UUID of the project to delete
 */
export async function deleteProjectDirectory(projectId: string): Promise<void> {
  const projectDir = path.join(WORKSPACE_PATH, projectId);
  await fs.rm(projectDir, { recursive: true, force: true });
}
