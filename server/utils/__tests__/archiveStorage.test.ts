/**
 * Archive Storage Tests
 * TDD: Integration tests for archive storage utilities
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import type { Task, Archive, Project } from '../../../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';
import {
  getArchivesByProject,
  getArchiveById,
  createArchive,
  deleteArchive,
  restoreArchive,
} from '../archiveStorage.ts';

// Test workspace path - must match server's WORKSPACE_PATH
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('archiveStorage', () => {
  let testProjectId: string;

  // Helper to create a test project with archives directory
  async function createTestProject(): Promise<string> {
    const projectId = uuidv4();
    const projectDir = path.join(WORKSPACE_PATH, projectId);
    const tasksDir = path.join(projectDir, 'tasks');
    const archivesDir = path.join(projectDir, 'archives');

    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(tasksDir, { recursive: true });
    await fs.mkdir(archivesDir, { recursive: true });

    const project: Project = {
      id: projectId,
      name: 'Test Project',
      description: 'Test project for archives',
      techStack: [],
      categories: [],
      defaultReferences: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(projectDir, 'project.json'),
      JSON.stringify(project, null, 2),
      'utf-8'
    );

    // Create empty tasks.json
    await fs.writeFile(
      path.join(tasksDir, 'tasks.json'),
      JSON.stringify([], null, 2),
      'utf-8'
    );

    return projectId;
  }

  // Helper to create a test task
  function createMockTask(projectId: string, overrides: Partial<Task> = {}): Task {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    return {
      id: uuidv4(),
      projectId,
      title: 'Test Task',
      status: 'prototype',
      featureList: 'Feature list content',
      designDocument: 'Design document content',
      prd: 'PRD content',
      prototype: 'Prototype content',
      references: ['ref-1', 'ref-2'],
      qaAnswers: [],
      revisions: [],
      isArchived: false,
      createdAt: pastDate,
      updatedAt: pastDate,
      ...overrides,
    };
  }

  // Helper to create archives.json file
  async function createArchivesFile(projectId: string, archives: Archive[]): Promise<void> {
    const archivesPath = path.join(WORKSPACE_PATH, projectId, 'archives', 'archives.json');
    await fs.writeFile(archivesPath, JSON.stringify(archives, null, 2), 'utf-8');
  }

  // Helper to read archives.json file
  async function readArchivesFile(projectId: string): Promise<Archive[]> {
    const archivesPath = path.join(WORKSPACE_PATH, projectId, 'archives', 'archives.json');
    try {
      const content = await fs.readFile(archivesPath, 'utf-8');
      return JSON.parse(content) as Archive[];
    } catch {
      return [];
    }
  }

  beforeEach(async () => {
    // Clean up before each test
    await fs.mkdir(WORKSPACE_PATH, { recursive: true });
    const entries = await fs.readdir(WORKSPACE_PATH);
    for (const entry of entries) {
      if (entry !== '.gitkeep') {
        await fs.rm(path.join(WORKSPACE_PATH, entry), { recursive: true, force: true });
      }
    }
    // Create fresh test project
    testProjectId = await createTestProject();
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      const entries = await fs.readdir(WORKSPACE_PATH);
      for (const entry of entries) {
        if (entry !== '.gitkeep') {
          await fs.rm(path.join(WORKSPACE_PATH, entry), { recursive: true, force: true });
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getArchivesByProject', () => {
    it('should return empty array when archives.json does not exist', async () => {
      const result = await getArchivesByProject(testProjectId);

      expect(result).toEqual([]);
    });

    it('should return archives for a project', async () => {
      const mockTask = createMockTask(testProjectId);
      const mockArchive: Archive = {
        id: uuidv4(),
        taskId: mockTask.id,
        projectId: testProjectId,
        task: mockTask,
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [mockArchive]);

      const result = await getArchivesByProject(testProjectId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockArchive.id);
      expect(result[0].taskId).toBe(mockTask.id);
    });

    it('should return multiple archives', async () => {
      const task1 = createMockTask(testProjectId, { title: 'Task 1' });
      const task2 = createMockTask(testProjectId, { title: 'Task 2' });

      const archives: Archive[] = [
        {
          id: uuidv4(),
          taskId: task1.id,
          projectId: testProjectId,
          task: task1,
          archivedAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          taskId: task2.id,
          projectId: testProjectId,
          task: task2,
          archivedAt: new Date().toISOString(),
        },
      ];

      await createArchivesFile(testProjectId, archives);

      const result = await getArchivesByProject(testProjectId);

      expect(result).toHaveLength(2);
    });
  });

  describe('getArchiveById', () => {
    it('should return null when archive not found', async () => {
      await createArchivesFile(testProjectId, []);

      const result = await getArchiveById(testProjectId, 'non-existent-id');

      expect(result).toBeNull();
    });

    it('should return archive when found', async () => {
      const mockTask = createMockTask(testProjectId);
      const archiveId = uuidv4();
      const mockArchive: Archive = {
        id: archiveId,
        taskId: mockTask.id,
        projectId: testProjectId,
        task: mockTask,
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [mockArchive]);

      const result = await getArchiveById(testProjectId, archiveId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(archiveId);
    });

    it('should return null when archives.json does not exist', async () => {
      // Remove archives directory
      await fs.rm(path.join(WORKSPACE_PATH, testProjectId, 'archives'), {
        recursive: true,
        force: true,
      });

      const result = await getArchiveById(testProjectId, 'any-id');

      expect(result).toBeNull();
    });
  });

  describe('createArchive', () => {
    it('should create a new archive from task', async () => {
      const mockTask = createMockTask(testProjectId);

      const result = await createArchive(testProjectId, mockTask.id, mockTask);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.taskId).toBe(mockTask.id);
      expect(result.projectId).toBe(testProjectId);
      expect(result.task.isArchived).toBe(true);
      expect(result.archivedAt).toBeDefined();
    });

    it('should add archive to existing archives list', async () => {
      const existingTask = createMockTask(testProjectId, { title: 'Existing' });
      const existingArchive: Archive = {
        id: uuidv4(),
        taskId: existingTask.id,
        projectId: testProjectId,
        task: { ...existingTask, isArchived: true },
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [existingArchive]);

      const newTask = createMockTask(testProjectId, { title: 'New Task' });
      await createArchive(testProjectId, newTask.id, newTask);

      const archives = await readArchivesFile(testProjectId);
      expect(archives).toHaveLength(2);
    });

    it('should reject archiving non-prototype tasks', async () => {
      const nonPrototypeTask = createMockTask(testProjectId, { status: 'design' });

      await expect(
        createArchive(testProjectId, nonPrototypeTask.id, nonPrototypeTask)
      ).rejects.toThrow('Only prototype tasks can be archived');
    });

    it('should reject archiving featurelist tasks', async () => {
      const featurelistTask = createMockTask(testProjectId, { status: 'featurelist' });

      await expect(
        createArchive(testProjectId, featurelistTask.id, featurelistTask)
      ).rejects.toThrow('Only prototype tasks can be archived');
    });

    it('should reject archiving prd tasks', async () => {
      const prdTask = createMockTask(testProjectId, { status: 'prd' });

      await expect(createArchive(testProjectId, prdTask.id, prdTask)).rejects.toThrow(
        'Only prototype tasks can be archived'
      );
    });

    it('should preserve all document data in archived task', async () => {
      const mockTask = createMockTask(testProjectId);

      const result = await createArchive(testProjectId, mockTask.id, mockTask);

      expect(result.task.featureList).toBe(mockTask.featureList);
      expect(result.task.designDocument).toBe(mockTask.designDocument);
      expect(result.task.prd).toBe(mockTask.prd);
      expect(result.task.prototype).toBe(mockTask.prototype);
      expect(result.task.references).toEqual(mockTask.references);
    });

    it('should persist archive to file', async () => {
      const mockTask = createMockTask(testProjectId);

      const result = await createArchive(testProjectId, mockTask.id, mockTask);

      const archives = await readArchivesFile(testProjectId);
      expect(archives).toHaveLength(1);
      expect(archives[0].id).toBe(result.id);
    });
  });

  describe('deleteArchive', () => {
    it('should delete an archive and return true', async () => {
      const mockTask = createMockTask(testProjectId);
      const archiveId = uuidv4();
      const mockArchive: Archive = {
        id: archiveId,
        taskId: mockTask.id,
        projectId: testProjectId,
        task: { ...mockTask, isArchived: true },
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [mockArchive]);

      const result = await deleteArchive(testProjectId, archiveId);

      expect(result).toBe(true);

      const archives = await readArchivesFile(testProjectId);
      expect(archives).toHaveLength(0);
    });

    it('should return false when archive not found', async () => {
      await createArchivesFile(testProjectId, []);

      const result = await deleteArchive(testProjectId, 'non-existent-id');

      expect(result).toBe(false);
    });

    it('should return false when archives.json does not exist', async () => {
      // Remove archives directory
      await fs.rm(path.join(WORKSPACE_PATH, testProjectId, 'archives'), {
        recursive: true,
        force: true,
      });

      const result = await deleteArchive(testProjectId, 'any-id');

      expect(result).toBe(false);
    });

    it('should only delete the specified archive', async () => {
      const task1 = createMockTask(testProjectId, { title: 'Task 1' });
      const task2 = createMockTask(testProjectId, { title: 'Task 2' });

      const archive1: Archive = {
        id: uuidv4(),
        taskId: task1.id,
        projectId: testProjectId,
        task: { ...task1, isArchived: true },
        archivedAt: new Date().toISOString(),
      };
      const archive2: Archive = {
        id: uuidv4(),
        taskId: task2.id,
        projectId: testProjectId,
        task: { ...task2, isArchived: true },
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [archive1, archive2]);

      await deleteArchive(testProjectId, archive1.id);

      const archives = await readArchivesFile(testProjectId);
      expect(archives).toHaveLength(1);
      expect(archives[0].id).toBe(archive2.id);
    });
  });

  describe('restoreArchive', () => {
    it('should restore archive and return task', async () => {
      const mockTask = createMockTask(testProjectId);
      const archiveId = uuidv4();
      const mockArchive: Archive = {
        id: archiveId,
        taskId: mockTask.id,
        projectId: testProjectId,
        task: { ...mockTask, isArchived: true },
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [mockArchive]);

      const result = await restoreArchive(testProjectId, archiveId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockTask.id);
      expect(result?.isArchived).toBe(false);
      expect(result?.status).toBe('prototype');
    });

    it('should preserve all document data when restoring', async () => {
      const mockTask = createMockTask(testProjectId);
      const archiveId = uuidv4();
      const mockArchive: Archive = {
        id: archiveId,
        taskId: mockTask.id,
        projectId: testProjectId,
        task: { ...mockTask, isArchived: true },
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [mockArchive]);

      const result = await restoreArchive(testProjectId, archiveId);

      expect(result?.featureList).toBe(mockTask.featureList);
      expect(result?.designDocument).toBe(mockTask.designDocument);
      expect(result?.prd).toBe(mockTask.prd);
      expect(result?.prototype).toBe(mockTask.prototype);
      expect(result?.references).toEqual(mockTask.references);
    });

    it('should remove archive from list after restore', async () => {
      const mockTask = createMockTask(testProjectId);
      const archiveId = uuidv4();
      const mockArchive: Archive = {
        id: archiveId,
        taskId: mockTask.id,
        projectId: testProjectId,
        task: { ...mockTask, isArchived: true },
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [mockArchive]);

      await restoreArchive(testProjectId, archiveId);

      const archives = await readArchivesFile(testProjectId);
      expect(archives).toHaveLength(0);
    });

    it('should return null when archive not found', async () => {
      await createArchivesFile(testProjectId, []);

      const result = await restoreArchive(testProjectId, 'non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null when archives.json does not exist', async () => {
      // Remove archives directory
      await fs.rm(path.join(WORKSPACE_PATH, testProjectId, 'archives'), {
        recursive: true,
        force: true,
      });

      const result = await restoreArchive(testProjectId, 'any-id');

      expect(result).toBeNull();
    });

    it('should update the updatedAt timestamp when restoring', async () => {
      const mockTask = createMockTask(testProjectId);
      const archiveId = uuidv4();
      const mockArchive: Archive = {
        id: archiveId,
        taskId: mockTask.id,
        projectId: testProjectId,
        task: { ...mockTask, isArchived: true },
        archivedAt: new Date().toISOString(),
      };

      await createArchivesFile(testProjectId, [mockArchive]);

      const result = await restoreArchive(testProjectId, archiveId);

      expect(result?.updatedAt).not.toBe(mockTask.updatedAt);
    });
  });
});
