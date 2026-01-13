/**
 * versionStorage.test.ts
 * Unit tests for versionStorage.ts
 *
 * Test Coverage:
 * - saveVersion: Save a new document version
 * - getVersions: Get all versions for a task
 * - getVersion: Get a specific version by ID
 * - restoreVersion: Restore a task to a specific version
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  saveVersion,
  getVersions,
  getVersion,
  restoreVersion,
  getVersionFilePath
} from '../../../server/utils/versionStorage';

describe('versionStorage', () => {
  const testWorkspacePath = path.join(process.cwd(), 'workspace-test');

  // Helper function to create unique test IDs
  const createTestIds = () => ({
    testProjectId: `test-project-${uuidv4()}`,
    testTaskId: `test-task-${uuidv4()}`
  });

  beforeEach(async () => {
    // Create test workspace directory
    await fs.mkdir(testWorkspacePath, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test workspace
    try {
      await fs.rm(testWorkspacePath, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('saveVersion', () => {
    it('should save a new version successfully', async () => {
      const { testProjectId, testTaskId } = createTestIds();
      const versionData = {
        taskId: testTaskId,
        content: 'Test content',
        author: 'test-user',
        changeDescription: 'Initial version'
      };

      const version = await saveVersion(testProjectId, versionData);

      expect(version).toBeDefined();
      expect(version.id).toBeDefined();
      expect(version.taskId).toBe(testTaskId);
      expect(version.content).toBe('Test content');
      expect(version.author).toBe('test-user');
      expect(version.changeDescription).toBe('Initial version');
      expect(version.versionNumber).toBe(1);
      expect(version.timestamp).toBeDefined();
    });

    it('should increment version number for subsequent versions', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      // Save first version
      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'First version',
        author: 'user1'
      });

      // Save second version
      const secondVersion = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Second version',
        author: 'user1'
      });

      expect(secondVersion.versionNumber).toBe(2);

      // Save third version
      const thirdVersion = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Third version',
        author: 'user1'
      });

      expect(thirdVersion.versionNumber).toBe(3);
    });

    it('should link parent version correctly', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const firstVersion = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'First version',
        author: 'user1'
      });

      const secondVersion = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Second version',
        author: 'user1',
        parentVersionId: firstVersion.id
      });

      expect(secondVersion.parentVersionId).toBe(firstVersion.id);
    });

    it('should save version file to correct location', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const version = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Test content',
        author: 'user1'
      });

      const versionFilePath = getVersionFilePath(testProjectId, testTaskId, version.id);
      const fileExists = await fs.access(versionFilePath).then(() => true).catch(() => false);

      expect(fileExists).toBe(true);
    });

    it('should update versions index file', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 1',
        author: 'user1'
      });

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 2',
        author: 'user1'
      });

      const versions = await getVersions(testProjectId, testTaskId);
      expect(versions).toHaveLength(2);
    });
  });

  describe('getVersions', () => {
    it('should return empty array for task with no versions', async () => {
      const { testProjectId, testTaskId } = createTestIds();
      const versions = await getVersions(testProjectId, testTaskId);
      expect(versions).toEqual([]);
    });

    it('should return all versions for a task', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 1',
        author: 'user1'
      });

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 2',
        author: 'user1'
      });

      const versions = await getVersions(testProjectId, testTaskId);
      expect(versions).toHaveLength(2);
      expect(versions[0].content).toBe('Version 1');
      expect(versions[1].content).toBe('Version 2');
    });

    it('should return versions sorted by version number', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 1',
        author: 'user1'
      });

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 2',
        author: 'user1'
      });

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 3',
        author: 'user1'
      });

      const versions = await getVersions(testProjectId, testTaskId);
      expect(versions[0].versionNumber).toBe(1);
      expect(versions[1].versionNumber).toBe(2);
      expect(versions[2].versionNumber).toBe(3);
    });
  });

  describe('getVersion', () => {
    it('should return null for non-existent version', async () => {
      const { testProjectId, testTaskId } = createTestIds();
      const version = await getVersion(testProjectId, testTaskId, 'non-existent-id');
      expect(version).toBeNull();
    });

    it('should return specific version by ID', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const savedVersion = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Test content',
        author: 'user1',
        changeDescription: 'Test version'
      });

      const retrievedVersion = await getVersion(testProjectId, testTaskId, savedVersion.id);
      expect(retrievedVersion).toBeDefined();
      expect(retrievedVersion?.id).toBe(savedVersion.id);
      expect(retrievedVersion?.content).toBe('Test content');
      expect(retrievedVersion?.changeDescription).toBe('Test version');
    });

    it('should return null when version ID exists but belongs to different task', async () => {
      const { testProjectId } = createTestIds();
      const taskId1 = `task-${uuidv4()}`;
      const taskId2 = `task-${uuidv4()}`;

      const version = await saveVersion(testProjectId, {
        taskId: taskId1,
        content: 'Content for task 1',
        author: 'user1'
      });

      const retrievedVersion = await getVersion(testProjectId, taskId2, version.id);
      expect(retrievedVersion).toBeNull();
    });
  });

  describe('restoreVersion', () => {
    it('should return null when trying to restore non-existent version', async () => {
      const { testProjectId, testTaskId } = createTestIds();
      const result = await restoreVersion(testProjectId, testTaskId, 'non-existent-id');
      expect(result).toBeNull();
    });

    it('should restore task to specific version', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      // Create initial version
      const v1 = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 1',
        author: 'user1'
      });

      // Create second version
      const v2 = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Version 2',
        author: 'user1',
        parentVersionId: v1.id
      });

      // Restore to first version
      const restoredVersion = await restoreVersion(testProjectId, testTaskId, v1.id);

      expect(restoredVersion).toBeDefined();
      expect(restoredVersion?.content).toBe('Version 1');
      expect(restoredVersion?.versionNumber).toBeGreaterThan(v2.versionNumber);
    });

    it('should create new version when restoring', async () => {
      const { testProjectId, testTaskId } = createTestIds();

      const v1 = await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Original',
        author: 'user1'
      });

      await saveVersion(testProjectId, {
        taskId: testTaskId,
        content: 'Modified',
        author: 'user1',
        parentVersionId: v1.id
      });

      const restored = await restoreVersion(testProjectId, testTaskId, v1.id);

      const allVersions = await getVersions(testProjectId, testTaskId);
      expect(allVersions).toHaveLength(3); // v1, v2, restored
      expect(restored?.changeDescription).toContain('Restored from version');
    });
  });
});
