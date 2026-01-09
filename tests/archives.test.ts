/**
 * Archives API Tests
 * TDD test suite for archive-related endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type { Task, Archive, Project, ApiResponse } from '../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';

// Test workspace path - must match server's WORKSPACE_PATH
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Archives API', () => {
  let app: ReturnType<typeof createApp>;
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

    // Create empty tasks.json and archives.json
    await fs.writeFile(
      path.join(tasksDir, 'tasks.json'),
      JSON.stringify([], null, 2),
      'utf-8'
    );
    await fs.writeFile(
      path.join(archivesDir, 'archives.json'),
      JSON.stringify([], null, 2),
      'utf-8'
    );

    return projectId;
  }

  // Helper to create a test task
  async function createTestTask(
    projectId: string,
    overrides: Partial<Task> = {}
  ): Promise<Task> {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    const task: Task = {
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

    const tasksPath = path.join(WORKSPACE_PATH, projectId, 'tasks', 'tasks.json');
    const existingTasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];
    existingTasks.push(task);
    await fs.writeFile(tasksPath, JSON.stringify(existingTasks, null, 2), 'utf-8');

    return task;
  }

  // Helper to create a test archive
  async function createTestArchive(
    projectId: string,
    task: Task
  ): Promise<Archive> {
    const archive: Archive = {
      id: uuidv4(),
      taskId: task.id,
      projectId,
      task: { ...task, isArchived: true },
      archivedAt: new Date().toISOString(),
    };

    const archivesPath = path.join(WORKSPACE_PATH, projectId, 'archives', 'archives.json');
    const existingArchives = JSON.parse(await fs.readFile(archivesPath, 'utf-8')) as Archive[];
    existingArchives.push(archive);
    await fs.writeFile(archivesPath, JSON.stringify(existingArchives, null, 2), 'utf-8');

    return archive;
  }

  beforeAll(async () => {
    app = createApp();
    await fs.mkdir(WORKSPACE_PATH, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test projects
    const entries = await fs.readdir(WORKSPACE_PATH);
    for (const entry of entries) {
      if (entry !== '.gitkeep') {
        await fs.rm(path.join(WORKSPACE_PATH, entry), { recursive: true, force: true });
      }
    }
  });

  beforeEach(async () => {
    // Clean up before each test
    const entries = await fs.readdir(WORKSPACE_PATH);
    for (const entry of entries) {
      if (entry !== '.gitkeep') {
        await fs.rm(path.join(WORKSPACE_PATH, entry), { recursive: true, force: true });
      }
    }
    // Create fresh test project
    testProjectId = await createTestProject();
  });

  describe('GET /api/projects/:projectId/archives - List Archives', () => {
    it('should return empty array when no archives exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/archives`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Archive[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return all archives for a project', async () => {
      const task1 = await createTestTask(testProjectId, { title: 'Task 1' });
      const task2 = await createTestTask(testProjectId, { title: 'Task 2' });

      await createTestArchive(testProjectId, task1);
      await createTestArchive(testProjectId, task2);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/archives`)
        .expect(200);

      const body = response.body as ApiResponse<Archive[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id/archives')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  describe('GET /api/projects/:projectId/archives/:archiveId - Get Single Archive', () => {
    it('should return a single archive', async () => {
      const task = await createTestTask(testProjectId);
      const archive = await createTestArchive(testProjectId, task);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/archives/${archive.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Archive>;

      expect(body.success).toBe(true);
      expect(body.data!.id).toBe(archive.id);
      expect(body.data!.taskId).toBe(task.id);
    });

    it('should return 404 for non-existent archive', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/archives/non-existent-id`)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Archive not found');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id/archives/some-archive-id')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  describe('POST /api/projects/:projectId/tasks/:taskId/archive - Archive a Task', () => {
    it('should archive a prototype task successfully', async () => {
      const task = await createTestTask(testProjectId, { status: 'prototype' });

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/tasks/${task.id}/archive`)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<Archive>;

      expect(body.success).toBe(true);
      expect(body.data!.taskId).toBe(task.id);
      expect(body.data!.projectId).toBe(testProjectId);
      expect(body.data!.task.isArchived).toBe(true);
      expect(body.data!.archivedAt).toBeDefined();
    });

    it('should remove task from tasks.json after archiving', async () => {
      const task = await createTestTask(testProjectId, { status: 'prototype' });

      await request(app)
        .post(`/api/projects/${testProjectId}/tasks/${task.id}/archive`)
        .expect(201);

      // Verify task is removed from tasks.json
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];
      expect(tasks.find(t => t.id === task.id)).toBeUndefined();
    });

    it('should preserve all document data in archived task', async () => {
      const task = await createTestTask(testProjectId, {
        status: 'prototype',
        featureList: 'My feature list',
        designDocument: 'My design doc',
        prd: 'My PRD',
        prototype: 'My prototype',
        references: ['ref-a', 'ref-b'],
      });

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/tasks/${task.id}/archive`)
        .expect(201);

      const body = response.body as ApiResponse<Archive>;

      expect(body.data!.task.featureList).toBe('My feature list');
      expect(body.data!.task.designDocument).toBe('My design doc');
      expect(body.data!.task.prd).toBe('My PRD');
      expect(body.data!.task.prototype).toBe('My prototype');
      expect(body.data!.task.references).toEqual(['ref-a', 'ref-b']);
    });

    it('should return 400 when task is not in prototype status', async () => {
      const task = await createTestTask(testProjectId, { status: 'design' });

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/tasks/${task.id}/archive`)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Only prototype tasks can be archived');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/tasks/non-existent-id/archive`)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Task not found');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .post('/api/projects/non-existent-id/tasks/some-task-id/archive')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  describe('POST /api/projects/:projectId/archives/:archiveId/restore - Restore Archive', () => {
    it('should restore an archived task successfully', async () => {
      const task = await createTestTask(testProjectId, { status: 'prototype' });
      const archive = await createTestArchive(testProjectId, task);

      // Remove original task from tasks.json to simulate archived state
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      await fs.writeFile(tasksPath, JSON.stringify([], null, 2), 'utf-8');

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/archives/${archive.id}/restore`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.id).toBe(task.id);
      expect(body.data!.isArchived).toBe(false);
      expect(body.data!.status).toBe('prototype');
    });

    it('should add restored task back to tasks.json', async () => {
      const task = await createTestTask(testProjectId, { status: 'prototype' });
      const archive = await createTestArchive(testProjectId, task);

      // Remove original task from tasks.json
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      await fs.writeFile(tasksPath, JSON.stringify([], null, 2), 'utf-8');

      await request(app)
        .post(`/api/projects/${testProjectId}/archives/${archive.id}/restore`)
        .expect(200);

      // Verify task is added back to tasks.json
      const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];
      expect(tasks.find(t => t.id === task.id)).toBeDefined();
    });

    it('should remove archive from archives.json after restore', async () => {
      const task = await createTestTask(testProjectId, { status: 'prototype' });
      const archive = await createTestArchive(testProjectId, task);

      await request(app)
        .post(`/api/projects/${testProjectId}/archives/${archive.id}/restore`)
        .expect(200);

      // Verify archive is removed
      const archivesPath = path.join(WORKSPACE_PATH, testProjectId, 'archives', 'archives.json');
      const archives = JSON.parse(await fs.readFile(archivesPath, 'utf-8')) as Archive[];
      expect(archives.find(a => a.id === archive.id)).toBeUndefined();
    });

    it('should preserve all document data when restoring', async () => {
      const task = await createTestTask(testProjectId, {
        status: 'prototype',
        featureList: 'My feature list',
        designDocument: 'My design doc',
        prd: 'My PRD',
        prototype: 'My prototype',
      });
      const archive = await createTestArchive(testProjectId, task);

      // Remove original task from tasks.json
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      await fs.writeFile(tasksPath, JSON.stringify([], null, 2), 'utf-8');

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/archives/${archive.id}/restore`)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.data!.featureList).toBe('My feature list');
      expect(body.data!.designDocument).toBe('My design doc');
      expect(body.data!.prd).toBe('My PRD');
      expect(body.data!.prototype).toBe('My prototype');
    });

    it('should return 404 for non-existent archive', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/archives/non-existent-id/restore`)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Archive not found');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .post('/api/projects/non-existent-id/archives/some-archive-id/restore')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  describe('DELETE /api/projects/:projectId/archives/:archiveId - Delete Archive', () => {
    it('should delete an archive permanently', async () => {
      const task = await createTestTask(testProjectId, { status: 'prototype' });
      const archive = await createTestArchive(testProjectId, task);

      const response = await request(app)
        .delete(`/api/projects/${testProjectId}/archives/${archive.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);
    });

    it('should remove archive from storage', async () => {
      const task = await createTestTask(testProjectId, { status: 'prototype' });
      const archive = await createTestArchive(testProjectId, task);

      await request(app)
        .delete(`/api/projects/${testProjectId}/archives/${archive.id}`)
        .expect(200);

      // Verify archive is removed
      const archivesPath = path.join(WORKSPACE_PATH, testProjectId, 'archives', 'archives.json');
      const archives = JSON.parse(await fs.readFile(archivesPath, 'utf-8')) as Archive[];
      expect(archives.find(a => a.id === archive.id)).toBeUndefined();
    });

    it('should return 404 for non-existent archive', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProjectId}/archives/non-existent-id`)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Archive not found');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/non-existent-id/archives/some-archive-id')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });
});
