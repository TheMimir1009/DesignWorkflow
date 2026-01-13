/**
 * Completed Documents API Tests
 * TDD test suite for SPEC-DOCREF-001
 *
 * REQ-001: GET /api/projects/:projectId/completed-documents
 * REQ-002: Keyword search via ?search=keyword
 * REQ-003: Document type filtering via ?documentType=design,prd,prototype
 * REQ-004: Reference filtering via ?reference=systemId
 * REQ-005: GET /api/projects/:projectId/completed-documents/:taskId
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type {
  Task,
  Archive,
  Project,
  ApiResponse,
  CompletedDocumentSummary,
  CompletedDocumentDetail,
} from '../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';

// Test workspace path - must match server's WORKSPACE_PATH
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Completed Documents API (SPEC-DOCREF-001)', () => {
  let app: ReturnType<typeof createApp>;
  let testProjectId: string;

  // Helper to create a test project with all necessary directories
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
      description: 'Test project for completed documents',
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

  // Helper to create a prototype task (in tasks.json)
  async function createPrototypeTask(
    projectId: string,
    overrides: Partial<Task> = {}
  ): Promise<Task> {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    const task: Task = {
      id: uuidv4(),
      projectId,
      title: 'Prototype Task',
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

  // Helper to create an archived task
  async function createArchivedTask(
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

  // ==========================================================================
  // REQ-001: GET /api/projects/:projectId/completed-documents
  // Return prototype status tasks and archived tasks with metadata
  // ==========================================================================
  describe('REQ-001: GET /api/projects/:projectId/completed-documents', () => {
    it('should return empty array when no completed documents exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return prototype status tasks as completed documents', async () => {
      const task = await createPrototypeTask(testProjectId, {
        title: 'My Prototype Task',
        references: ['system-1', 'system-2'],
        designDocument: 'Design doc',
        prd: 'PRD content',
        prototype: 'Prototype content',
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0]).toMatchObject({
        taskId: task.id,
        title: 'My Prototype Task',
        status: 'prototype',
        references: ['system-1', 'system-2'],
        hasDesignDoc: true,
        hasPrd: true,
        hasPrototype: true,
      });
      expect(body.data![0].createdAt).toBeDefined();
      expect(body.data![0].updatedAt).toBeDefined();
    });

    it('should return archived tasks as completed documents', async () => {
      const task: Task = {
        id: uuidv4(),
        projectId: testProjectId,
        title: 'Archived Task',
        status: 'prototype',
        featureList: 'Feature list',
        designDocument: 'Design doc',
        prd: null,
        prototype: 'Prototype',
        references: ['ref-archived'],
        qaAnswers: [],
        revisions: [],
        isArchived: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createArchivedTask(testProjectId, task);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0]).toMatchObject({
        taskId: task.id,
        title: 'Archived Task',
        status: 'archived',
        references: ['ref-archived'],
        hasDesignDoc: true,
        hasPrd: false,
        hasPrototype: true,
      });
      expect(body.data![0].archivedAt).toBeDefined();
    });

    it('should return both prototype and archived tasks', async () => {
      // Create prototype task
      await createPrototypeTask(testProjectId, { title: 'Prototype Task 1' });

      // Create archived task
      const archivedTaskData: Task = {
        id: uuidv4(),
        projectId: testProjectId,
        title: 'Archived Task 1',
        status: 'prototype',
        featureList: 'Feature list',
        designDocument: 'Design doc',
        prd: 'PRD',
        prototype: 'Prototype',
        references: [],
        qaAnswers: [],
        revisions: [],
        isArchived: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createArchivedTask(testProjectId, archivedTaskData);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);

      const titles = body.data!.map((d) => d.title);
      expect(titles).toContain('Prototype Task 1');
      expect(titles).toContain('Archived Task 1');
    });

    it('should not return non-prototype tasks', async () => {
      // Create tasks in various statuses
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      const tasks: Task[] = [
        {
          id: uuidv4(),
          projectId: testProjectId,
          title: 'Feature List Task',
          status: 'featurelist',
          featureList: 'Some features',
          designDocument: null,
          prd: null,
          prototype: null,
          references: [],
          qaAnswers: [],
          revisions: [],
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          projectId: testProjectId,
          title: 'Design Task',
          status: 'design',
          featureList: 'Some features',
          designDocument: 'Design doc',
          prd: null,
          prototype: null,
          references: [],
          qaAnswers: [],
          revisions: [],
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          projectId: testProjectId,
          title: 'PRD Task',
          status: 'prd',
          featureList: 'Some features',
          designDocument: 'Design doc',
          prd: 'PRD content',
          prototype: null,
          references: [],
          qaAnswers: [],
          revisions: [],
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2), 'utf-8');

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id/completed-documents')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  // ==========================================================================
  // REQ-002: Keyword search via ?search=keyword
  // Case-insensitive search in title, featureList, designDocument
  // ==========================================================================
  describe('REQ-002: Keyword search via ?search=keyword', () => {
    it('should search in task title (case-insensitive)', async () => {
      await createPrototypeTask(testProjectId, { title: 'Login System Feature' });
      await createPrototypeTask(testProjectId, { title: 'Payment Gateway' });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=LOGIN`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Login System Feature');
    });

    it('should search in featureList (case-insensitive)', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Task 1',
        featureList: 'User authentication with OAuth',
      });
      await createPrototypeTask(testProjectId, {
        title: 'Task 2',
        featureList: 'Shopping cart management',
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=oauth`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Task 1');
    });

    it('should search in designDocument (case-insensitive)', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Task 1',
        designDocument: 'This document describes the API Gateway architecture',
      });
      await createPrototypeTask(testProjectId, {
        title: 'Task 2',
        designDocument: 'Database schema design',
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=gateway`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Task 1');
    });

    it('should return empty array when no matches found', async () => {
      await createPrototypeTask(testProjectId, { title: 'Login Feature' });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=nonexistent`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
    });

    it('should search in archived tasks', async () => {
      const archivedTask: Task = {
        id: uuidv4(),
        projectId: testProjectId,
        title: 'Archived Feature with SPECIAL keyword',
        status: 'prototype',
        featureList: 'Some features',
        designDocument: 'Design doc',
        prd: 'PRD',
        prototype: 'Prototype',
        references: [],
        qaAnswers: [],
        revisions: [],
        isArchived: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createArchivedTask(testProjectId, archivedTask);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=special`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toContain('SPECIAL');
    });
  });

  // ==========================================================================
  // REQ-003: Document type filtering via ?documentType=design,prd,prototype
  // Filter by hasDesignDoc, hasPrd, hasPrototype
  // ==========================================================================
  describe('REQ-003: Document type filtering via ?documentType', () => {
    it('should filter by hasDesignDoc=true', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'With Design',
        designDocument: 'Design content',
        prd: null,
        prototype: null,
      });
      await createPrototypeTask(testProjectId, {
        title: 'Without Design',
        designDocument: null,
        prd: 'PRD content',
        prototype: 'Prototype content',
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?documentType=design`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('With Design');
      expect(body.data![0].hasDesignDoc).toBe(true);
    });

    it('should filter by hasPrd=true', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'With PRD',
        designDocument: null,
        prd: 'PRD content',
        prototype: null,
      });
      await createPrototypeTask(testProjectId, {
        title: 'Without PRD',
        designDocument: 'Design',
        prd: null,
        prototype: 'Prototype',
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?documentType=prd`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('With PRD');
      expect(body.data![0].hasPrd).toBe(true);
    });

    it('should filter by hasPrototype=true', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'With Prototype',
        designDocument: null,
        prd: null,
        prototype: 'Prototype content',
      });
      await createPrototypeTask(testProjectId, {
        title: 'Without Prototype',
        designDocument: 'Design',
        prd: 'PRD',
        prototype: null,
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?documentType=prototype`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('With Prototype');
      expect(body.data![0].hasPrototype).toBe(true);
    });

    it('should filter by multiple document types (OR logic)', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Only Design',
        designDocument: 'Design content',
        prd: null,
        prototype: null,
      });
      await createPrototypeTask(testProjectId, {
        title: 'Only PRD',
        designDocument: null,
        prd: 'PRD content',
        prototype: null,
      });
      await createPrototypeTask(testProjectId, {
        title: 'Only Prototype',
        designDocument: null,
        prd: null,
        prototype: 'Prototype content',
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?documentType=design,prd`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      const titles = body.data!.map((d) => d.title);
      expect(titles).toContain('Only Design');
      expect(titles).toContain('Only PRD');
    });

    it('should return all when no documentType filter specified', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Task 1',
        designDocument: 'Design',
        prd: null,
        prototype: null,
      });
      await createPrototypeTask(testProjectId, {
        title: 'Task 2',
        designDocument: null,
        prd: 'PRD',
        prototype: null,
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
    });
  });

  // ==========================================================================
  // REQ-004: Reference filtering via ?reference=systemId
  // Filter by references array
  // ==========================================================================
  describe('REQ-004: Reference filtering via ?reference=systemId', () => {
    it('should filter by single reference', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Task with System A',
        references: ['system-a', 'system-b'],
      });
      await createPrototypeTask(testProjectId, {
        title: 'Task with System C',
        references: ['system-c'],
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?reference=system-a`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Task with System A');
    });

    it('should filter by multiple references (OR logic)', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Task with System A',
        references: ['system-a'],
      });
      await createPrototypeTask(testProjectId, {
        title: 'Task with System B',
        references: ['system-b'],
      });
      await createPrototypeTask(testProjectId, {
        title: 'Task with System C',
        references: ['system-c'],
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?reference=system-a,system-b`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      const titles = body.data!.map((d) => d.title);
      expect(titles).toContain('Task with System A');
      expect(titles).toContain('Task with System B');
    });

    it('should return empty when no references match', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Task 1',
        references: ['system-x'],
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?reference=system-nonexistent`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
    });

    it('should work with archived tasks', async () => {
      const archivedTask: Task = {
        id: uuidv4(),
        projectId: testProjectId,
        title: 'Archived with Reference',
        status: 'prototype',
        featureList: 'Features',
        designDocument: 'Design',
        prd: 'PRD',
        prototype: 'Prototype',
        references: ['special-ref'],
        qaAnswers: [],
        revisions: [],
        isArchived: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createArchivedTask(testProjectId, archivedTask);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?reference=special-ref`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Archived with Reference');
    });
  });

  // ==========================================================================
  // Combined Filters
  // ==========================================================================
  describe('Combined Filters', () => {
    it('should combine search and documentType filters', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Login Feature',
        designDocument: 'Design doc',
        prd: null,
        prototype: null,
      });
      await createPrototypeTask(testProjectId, {
        title: 'Login System',
        designDocument: null,
        prd: 'PRD content',
        prototype: null,
      });
      await createPrototypeTask(testProjectId, {
        title: 'Payment Gateway',
        designDocument: 'Design doc',
        prd: null,
        prototype: null,
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=login&documentType=design`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Login Feature');
    });

    it('should combine search and reference filters', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Login with Auth System',
        references: ['auth-system'],
      });
      await createPrototypeTask(testProjectId, {
        title: 'Login with Payment',
        references: ['payment-system'],
      });
      await createPrototypeTask(testProjectId, {
        title: 'Dashboard',
        references: ['auth-system'],
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=login&reference=auth-system`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Login with Auth System');
    });

    it('should combine all filters', async () => {
      await createPrototypeTask(testProjectId, {
        title: 'Login Feature',
        designDocument: 'Design doc',
        prd: null,
        prototype: null,
        references: ['auth-system'],
      });
      await createPrototypeTask(testProjectId, {
        title: 'Login System',
        designDocument: 'Design doc',
        prd: null,
        prototype: null,
        references: ['payment-system'],
      });
      await createPrototypeTask(testProjectId, {
        title: 'Payment Gateway',
        designDocument: null,
        prd: 'PRD',
        prototype: null,
        references: ['auth-system'],
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?search=login&documentType=design&reference=auth-system`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].title).toBe('Login Feature');
    });
  });

  // ==========================================================================
  // REQ-005: GET /api/projects/:projectId/completed-documents/:taskId
  // Return full document details
  // ==========================================================================
  describe('REQ-005: GET /api/projects/:projectId/completed-documents/:taskId', () => {
    it('should return full details for a prototype task', async () => {
      const qaAnswers = [
        {
          questionId: 'q1',
          category: 'game-mechanic' as const,
          question: 'What is the core mechanic?',
          answer: 'Turn-based combat',
          answeredAt: new Date().toISOString(),
        },
      ];

      const task = await createPrototypeTask(testProjectId, {
        title: 'Full Detail Task',
        featureList: 'Complete feature list',
        designDocument: 'Complete design document',
        prd: 'Complete PRD',
        prototype: 'Complete prototype',
        references: ['ref-1', 'ref-2'],
        qaAnswers,
      });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents/${task.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentDetail>;

      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        taskId: task.id,
        title: 'Full Detail Task',
        status: 'prototype',
        references: ['ref-1', 'ref-2'],
        featureList: 'Complete feature list',
        designDocument: 'Complete design document',
        prd: 'Complete PRD',
        prototype: 'Complete prototype',
      });
      expect(body.data!.qaAnswers).toHaveLength(1);
      expect(body.data!.qaAnswers[0].answer).toBe('Turn-based combat');
    });

    it('should return full details for an archived task', async () => {
      const archivedTask: Task = {
        id: uuidv4(),
        projectId: testProjectId,
        title: 'Archived Detail Task',
        status: 'prototype',
        featureList: 'Archived feature list',
        designDocument: 'Archived design',
        prd: 'Archived PRD',
        prototype: 'Archived prototype',
        references: ['archived-ref'],
        qaAnswers: [],
        revisions: [],
        isArchived: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createArchivedTask(testProjectId, archivedTask);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents/${archivedTask.id}`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentDetail>;

      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({
        taskId: archivedTask.id,
        title: 'Archived Detail Task',
        status: 'archived',
        featureList: 'Archived feature list',
        designDocument: 'Archived design',
        prd: 'Archived PRD',
        prototype: 'Archived prototype',
        references: ['archived-ref'],
      });
      expect(body.data!.archivedAt).toBeDefined();
    });

    it('should return 404 for non-prototype task', async () => {
      const tasksPath = path.join(WORKSPACE_PATH, testProjectId, 'tasks', 'tasks.json');
      const task: Task = {
        id: uuidv4(),
        projectId: testProjectId,
        title: 'Design Task',
        status: 'design',
        featureList: 'Features',
        designDocument: 'Design',
        prd: null,
        prototype: null,
        references: [],
        qaAnswers: [],
        revisions: [],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await fs.writeFile(tasksPath, JSON.stringify([task], null, 2), 'utf-8');

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents/${task.id}`)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Completed document not found');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents/non-existent-id`)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Completed document not found');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id/completed-documents/some-task-id')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  // ==========================================================================
  // Pagination Support
  // ==========================================================================
  describe('Pagination Support', () => {
    it('should support limit parameter', async () => {
      // Create 5 prototype tasks
      for (let i = 1; i <= 5; i++) {
        await createPrototypeTask(testProjectId, { title: `Task ${i}` });
      }

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?limit=3`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
    });

    it('should support offset parameter', async () => {
      // Create 5 prototype tasks with predictable order
      for (let i = 1; i <= 5; i++) {
        await createPrototypeTask(testProjectId, { title: `Task ${i}` });
      }

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents?limit=2&offset=2`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
    });

    it('should use default limit when not specified', async () => {
      // Create more than default limit tasks
      for (let i = 1; i <= 25; i++) {
        await createPrototypeTask(testProjectId, { title: `Task ${i}` });
      }

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/completed-documents`)
        .expect(200);

      const body = response.body as ApiResponse<CompletedDocumentSummary[]>;

      expect(body.success).toBe(true);
      // Default limit should be reasonable (e.g., 20 or all)
      expect(body.data!.length).toBeLessThanOrEqual(25);
    });
  });
});
