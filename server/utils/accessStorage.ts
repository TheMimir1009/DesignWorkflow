/**
 * Project Access Storage Utilities
 * File system operations for project access control persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type { ProjectAccess, ProjectRole } from '../types/auth';

// Storage paths
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

/**
 * Get access file path for a project
 */
function getAccessFilePath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, 'access.json');
}

/**
 * Read access entries from storage
 */
async function readAccessFromStorage(projectId: string): Promise<ProjectAccess[]> {
  const filePath = getAccessFilePath(projectId);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ProjectAccess[];
  } catch {
    return [];
  }
}

/**
 * Write access entries to storage
 */
async function writeAccessToStorage(projectId: string, accessList: ProjectAccess[]): Promise<void> {
  const filePath = getAccessFilePath(projectId);
  const projectDir = path.dirname(filePath);

  // Ensure project directory exists
  try {
    await fs.mkdir(projectDir, { recursive: true });
  } catch {
    // Directory may already exist
  }

  await fs.writeFile(filePath, JSON.stringify(accessList, null, 2), 'utf-8');
}

/**
 * Get all access entries for a project
 * @param projectId - Project UUID
 * @returns Array of access entries
 */
export async function getProjectAccess(projectId: string): Promise<ProjectAccess[]> {
  return readAccessFromStorage(projectId);
}

/**
 * Get a specific user's access to a project
 * @param projectId - Project UUID
 * @param userId - User UUID
 * @returns Access entry if found, null otherwise
 */
export async function getUserProjectAccess(
  projectId: string,
  userId: string
): Promise<ProjectAccess | null> {
  const accessList = await readAccessFromStorage(projectId);
  return accessList.find(a => a.userId === userId) || null;
}

/**
 * Set project access for a user
 * Creates new entry or updates existing
 * @param projectId - Project UUID
 * @param userId - User UUID
 * @param role - Access role (owner, editor, viewer)
 * @param grantedBy - ID of user granting access
 * @returns Created/updated access entry
 */
export async function setProjectAccess(
  projectId: string,
  userId: string,
  role: ProjectRole,
  grantedBy: string
): Promise<ProjectAccess> {
  const accessList = await readAccessFromStorage(projectId);
  const existingIndex = accessList.findIndex(a => a.userId === userId);

  const accessEntry: ProjectAccess = {
    userId,
    projectId,
    role,
    grantedBy,
    grantedAt: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    // Update existing entry
    accessList[existingIndex] = accessEntry;
  } else {
    // Add new entry
    accessList.push(accessEntry);
  }

  await writeAccessToStorage(projectId, accessList);
  return accessEntry;
}

/**
 * Remove project access for a user
 * @param projectId - Project UUID
 * @param userId - User UUID
 * @returns true if removed, false if not found
 */
export async function removeProjectAccess(
  projectId: string,
  userId: string
): Promise<boolean> {
  const accessList = await readAccessFromStorage(projectId);
  const initialLength = accessList.length;
  const filteredList = accessList.filter(a => a.userId !== userId);

  if (filteredList.length === initialLength) {
    return false;
  }

  await writeAccessToStorage(projectId, filteredList);
  return true;
}
