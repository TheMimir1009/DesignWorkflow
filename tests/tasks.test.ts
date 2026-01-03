/**
 * Tasks API Tests
 * TDD test suite for task-related endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type { Task, Project, ApiResponse, CreateTaskDto, UpdateTaskDto } from '../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';

// Test workspace path - must match server's WORKSPACE_PATH
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Tasks API', () => {
  let app: ReturnType<typeof createApp>;
  let testProjectId: string;

  // Helper to create a test project
  async function createTestProject(): Promise<string> {
    const projectId = uuidv4();
    const projectDir = path.join(WORKSPACE_PATH, projectId);
    const tasksDir = path.join(projectDir, 'tasks');

    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(tasksDir, { recursive: true });

    const project: Project = {
      id: projectId,
      name: 'Test Project',
      description: 'Test project for tasks',
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

    // Create tasks.json
    await fs.writeFile(
      path.join(tasksDir, 'tasks.json'),
      JSON.stringify([], null, 2),
      'utf-8'
    );

    return projectId;
  }

  // Helper to create a test task
  async function createTestTask(projectId: string, overrides: Partial<Task> = {}): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      projectId,
      title: 'Test Task',
      status: 'featurelist',
      featureList: 'Test feature list content',
      designDocument: null,
      prd: null,
      prototype: null,
      references: [],
      qaAnswers: [],
      revisions: [],
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };

    const tasksPath = path.join(WORKSPACE_PATH, projectId, 'tasks', 'tasks.json');
    const existingTasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];
    existingTasks.push(task);
    await fs.writeFile(tasksPath, JSON.stringify(existingTasks, null, 2), 'utf-8');

    return task;
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

  describe('GET /api/projects/:projectId/tasks - List Tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/tasks`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Task[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return all tasks for a project', async () => {
      await createTestTask(testProjectId, { title: 'Task 1' });
      await createTestTask(testProjectId, { title: 'Task 2' });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/tasks`)
        .expect(200);

      const body = response.body as ApiResponse<Task[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data!.map((t) => t.title)).toContain('Task 1');
      expect(body.data!.map((t) => t.title)).toContain('Task 2');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id/tasks')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  describe('PUT /api/tasks/:id/status - Update Task Status', () => {
    it('should update task status successfully', async () => {
      const task = await createTestTask(testProjectId);

      const response = await request(app)
        .put(`/api/tasks/${task.id}/status`)
        .send({ status: 'design' })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.status).toBe('design');
      expect(body.data!.updatedAt).not.toBe(task.updatedAt);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id/status')
        .send({ status: 'design' })
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Task not found');
    });

    it('should return 400 for invalid status', async () => {
      const task = await createTestTask(testProjectId);

      const response = await request(app)
        .put(`/api/tasks/${task.id}/status`)
        .send({ status: 'invalid-status' })
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid status');
    });

    it('should return 400 when status is missing', async () => {
      const task = await createTestTask(testProjectId);

      const response = await request(app)
        .put(`/api/tasks/${task.id}/status`)
        .send({})
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Status is required');
    });
  });

  describe('POST /api/tasks/:id/trigger-ai - Trigger AI Generation', () => {
    it('should trigger AI generation and return updated task', async () => {
      const task = await createTestTask(testProjectId);

      const response = await request(app)
        .post(`/api/tasks/${task.id}/trigger-ai`)
        .send({ targetStatus: 'design' })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.status).toBe('design');
      // For mock AI, design document should be populated
      expect(body.data!.designDocument).not.toBeNull();
    });

    it('should generate PRD when moving to prd status', async () => {
      const task = await createTestTask(testProjectId, {
        status: 'design',
        designDocument: 'Some design document',
      });

      const response = await request(app)
        .post(`/api/tasks/${task.id}/trigger-ai`)
        .send({ targetStatus: 'prd' })
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.status).toBe('prd');
      expect(body.data!.prd).not.toBeNull();
    });

    it('should generate prototype when moving to prototype status', async () => {
      const task = await createTestTask(testProjectId, {
        status: 'prd',
        prd: 'Some PRD content',
      });

      const response = await request(app)
        .post(`/api/tasks/${task.id}/trigger-ai`)
        .send({ targetStatus: 'prototype' })
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.status).toBe('prototype');
      expect(body.data!.prototype).not.toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .post('/api/tasks/non-existent-id/trigger-ai')
        .send({ targetStatus: 'design' })
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Task not found');
    });

    it('should return 400 for invalid targetStatus', async () => {
      const task = await createTestTask(testProjectId);

      const response = await request(app)
        .post(`/api/tasks/${task.id}/trigger-ai`)
        .send({ targetStatus: 'invalid' })
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid target status');
    });

    it('should return 400 when targetStatus is missing', async () => {
      const task = await createTestTask(testProjectId);

      const response = await request(app)
        .post(`/api/tasks/${task.id}/trigger-ai`)
        .send({})
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Target status is required');
    });
  });

  describe('POST /api/projects/:projectId/tasks - Create Task', () => {
    it('should create a new task successfully', async () => {
      const createData: CreateTaskDto = {
        title: 'New Feature Task',
        projectId: testProjectId,
        featureList: 'Feature description in markdown',
        references: ['ref-1', 'ref-2'],
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .send(createData)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.title).toBe('New Feature Task');
      expect(body.data!.projectId).toBe(testProjectId);
      expect(body.data!.featureList).toBe('Feature description in markdown');
      expect(body.data!.references).toEqual(['ref-1', 'ref-2']);
      expect(body.data!.status).toBe('featurelist');
      expect(body.data!.id).toBeDefined();
    });

    it('should create task with minimal data (title only)', async () => {
      const createData: CreateTaskDto = {
        title: 'Minimal Task',
        projectId: testProjectId,
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .send(createData)
        .expect(201);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.title).toBe('Minimal Task');
      expect(body.data!.featureList).toBe('');
      expect(body.data!.references).toEqual([]);
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .send({ projectId: testProjectId })
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Title is required');
    });

    it('should return 404 for non-existent project', async () => {
      const createData: CreateTaskDto = {
        title: 'New Task',
        projectId: 'non-existent-project',
      };

      const response = await request(app)
        .post('/api/projects/non-existent-project/tasks')
        .send(createData)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });

    it('should persist task to storage', async () => {
      const createData: CreateTaskDto = {
        title: 'Persistent Task',
        projectId: testProjectId,
      };

      await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .send(createData)
        .expect(201);

      // Verify task is persisted
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Persistent Task');
    });
  });

  describe('PUT /api/tasks/:id - Update Task', () => {
    it('should update task title successfully', async () => {
      const task = await createTestTask(testProjectId, { title: 'Original Title' });

      const updateData: UpdateTaskDto = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.title).toBe('Updated Title');
      expect(body.data!.updatedAt).not.toBe(task.updatedAt);
    });

    it('should update task featureList successfully', async () => {
      const task = await createTestTask(testProjectId);

      const updateData: UpdateTaskDto = {
        featureList: 'Updated feature list with **markdown**',
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updateData)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.featureList).toBe('Updated feature list with **markdown**');
    });

    it('should update task references successfully', async () => {
      const task = await createTestTask(testProjectId, { references: ['old-ref'] });

      const updateData: UpdateTaskDto = {
        references: ['new-ref-1', 'new-ref-2', 'new-ref-3'],
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updateData)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.references).toEqual(['new-ref-1', 'new-ref-2', 'new-ref-3']);
    });

    it('should update multiple fields at once', async () => {
      const task = await createTestTask(testProjectId);

      const updateData: UpdateTaskDto = {
        title: 'Multi Update',
        featureList: 'New feature list',
        references: ['ref-1'],
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updateData)
        .expect(200);

      const body = response.body as ApiResponse<Task>;

      expect(body.success).toBe(true);
      expect(body.data!.title).toBe('Multi Update');
      expect(body.data!.featureList).toBe('New feature list');
      expect(body.data!.references).toEqual(['ref-1']);
    });

    it('should return 404 for non-existent task', async () => {
      const updateData: UpdateTaskDto = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send(updateData)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Task not found');
    });

    it('should persist updates to storage', async () => {
      const task = await createTestTask(testProjectId, { title: 'Original' });

      await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Persisted Update' })
        .expect(200);

      // Verify update is persisted
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];

      expect(tasks[0].title).toBe('Persisted Update');
    });
  });

  describe('DELETE /api/tasks/:id - Delete Task', () => {
    it('should delete task successfully', async () => {
      const task = await createTestTask(testProjectId);

      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/non-existent-id')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Task not found');
    });

    it('should remove task from storage', async () => {
      const task1 = await createTestTask(testProjectId, { title: 'Task 1' });
      const task2 = await createTestTask(testProjectId, { title: 'Task 2' });

      await request(app)
        .delete(`/api/tasks/${task1.id}`)
        .expect(200);

      // Verify task is removed from storage
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(task2.id);
    });

    it('should delete all tasks when deleting the last one', async () => {
      const task = await createTestTask(testProjectId);

      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect(200);

      // Verify tasks array is empty
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Task[];

      expect(tasks).toHaveLength(0);
    });
  });
});
