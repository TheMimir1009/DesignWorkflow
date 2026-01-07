/**
 * Project Access Storage Tests
 * TDD tests for project access control persistence
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  getProjectAccess,
  getUserProjectAccess,
  setProjectAccess,
  removeProjectAccess,
} from '../../../server/utils/accessStorage';
import type { ProjectAccess } from '../../../server/types/auth';

// Test workspace path
const TEST_WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('accessStorage', () => {
  const projectId = 'test-project-123';
  const userId1 = 'user-001';
  const userId2 = 'user-002';
  const grantedBy = 'admin-001';

  beforeEach(async () => {
    // Clean up test project directory
    try {
      await fs.rm(path.join(TEST_WORKSPACE_PATH, projectId), { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }
    // Create project directory
    await fs.mkdir(path.join(TEST_WORKSPACE_PATH, projectId), { recursive: true });
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await fs.rm(path.join(TEST_WORKSPACE_PATH, projectId), { recursive: true, force: true });
    } catch {
      // Directory may not exist
    }
  });

  describe('getProjectAccess', () => {
    it('should return empty array when no access entries exist', async () => {
      const access = await getProjectAccess(projectId);
      expect(access).toEqual([]);
    });

    it('should return all access entries for a project', async () => {
      await setProjectAccess(projectId, userId1, 'owner', grantedBy);
      await setProjectAccess(projectId, userId2, 'editor', grantedBy);

      const access = await getProjectAccess(projectId);
      expect(access).toHaveLength(2);
      expect(access.map(a => a.userId)).toContain(userId1);
      expect(access.map(a => a.userId)).toContain(userId2);
    });

    it('should return empty array for non-existent project', async () => {
      const access = await getProjectAccess('non-existent-project');
      expect(access).toEqual([]);
    });
  });

  describe('getUserProjectAccess', () => {
    it('should return null when user has no access', async () => {
      const access = await getUserProjectAccess(projectId, userId1);
      expect(access).toBeNull();
    });

    it('should return user access entry when exists', async () => {
      await setProjectAccess(projectId, userId1, 'owner', grantedBy);

      const access = await getUserProjectAccess(projectId, userId1);
      expect(access).not.toBeNull();
      expect(access?.userId).toBe(userId1);
      expect(access?.projectId).toBe(projectId);
      expect(access?.role).toBe('owner');
      expect(access?.grantedBy).toBe(grantedBy);
    });

    it('should return null for non-existent project', async () => {
      const access = await getUserProjectAccess('non-existent-project', userId1);
      expect(access).toBeNull();
    });
  });

  describe('setProjectAccess', () => {
    it('should create new access entry', async () => {
      const access = await setProjectAccess(projectId, userId1, 'owner', grantedBy);

      expect(access.userId).toBe(userId1);
      expect(access.projectId).toBe(projectId);
      expect(access.role).toBe('owner');
      expect(access.grantedBy).toBe(grantedBy);
      expect(access.grantedAt).toBeDefined();
    });

    it('should update existing access entry', async () => {
      await setProjectAccess(projectId, userId1, 'viewer', grantedBy);
      const updated = await setProjectAccess(projectId, userId1, 'editor', grantedBy);

      expect(updated.role).toBe('editor');

      // Verify only one entry exists
      const allAccess = await getProjectAccess(projectId);
      expect(allAccess).toHaveLength(1);
      expect(allAccess[0].role).toBe('editor');
    });

    it('should persist access to storage', async () => {
      await setProjectAccess(projectId, userId1, 'owner', grantedBy);

      // Verify by reading directly from file
      const filePath = path.join(TEST_WORKSPACE_PATH, projectId, 'access.json');
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as ProjectAccess[];

      expect(data).toHaveLength(1);
      expect(data[0].userId).toBe(userId1);
      expect(data[0].role).toBe('owner');
    });

    it('should support owner role', async () => {
      const access = await setProjectAccess(projectId, userId1, 'owner', grantedBy);
      expect(access.role).toBe('owner');
    });

    it('should support editor role', async () => {
      const access = await setProjectAccess(projectId, userId1, 'editor', grantedBy);
      expect(access.role).toBe('editor');
    });

    it('should support viewer role', async () => {
      const access = await setProjectAccess(projectId, userId1, 'viewer', grantedBy);
      expect(access.role).toBe('viewer');
    });

    it('should create access.json in project directory', async () => {
      await setProjectAccess(projectId, userId1, 'owner', grantedBy);

      const filePath = path.join(TEST_WORKSPACE_PATH, projectId, 'access.json');
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('removeProjectAccess', () => {
    it('should return false when user has no access', async () => {
      const result = await removeProjectAccess(projectId, userId1);
      expect(result).toBe(false);
    });

    it('should remove existing access entry', async () => {
      await setProjectAccess(projectId, userId1, 'owner', grantedBy);
      const result = await removeProjectAccess(projectId, userId1);

      expect(result).toBe(true);

      const access = await getUserProjectAccess(projectId, userId1);
      expect(access).toBeNull();
    });

    it('should not affect other users access', async () => {
      await setProjectAccess(projectId, userId1, 'owner', grantedBy);
      await setProjectAccess(projectId, userId2, 'editor', grantedBy);

      await removeProjectAccess(projectId, userId1);

      const allAccess = await getProjectAccess(projectId);
      expect(allAccess).toHaveLength(1);
      expect(allAccess[0].userId).toBe(userId2);
    });

    it('should return false for non-existent project', async () => {
      const result = await removeProjectAccess('non-existent-project', userId1);
      expect(result).toBe(false);
    });
  });
});
