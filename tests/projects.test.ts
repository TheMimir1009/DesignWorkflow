/**
 * Projects API Tests
 * TDD test suite for CRUD operations on /api/projects endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type { Project, ApiResponse } from '../src/types/index.ts';

// Test workspace path
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Projects API', () => {
  let app: ReturnType<typeof createApp>;
  let testProjectId: string;

  beforeAll(async () => {
    app = createApp();
    // Ensure workspace directory exists
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
  });

  describe('POST /api/projects - Create Project', () => {
    it('should create a new project with required fields', async () => {
      const newProject = {
        name: 'Test Game Project',
        description: 'A test game project for TDD',
        techStack: ['Unity', 'C#'],
        categories: ['RPG', 'Adventure'],
        defaultReferences: [],
      };

      const response = await request(app)
        .post('/api/projects')
        .send(newProject)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<Project>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.name).toBe(newProject.name);
      expect(body.data!.description).toBe(newProject.description);
      expect(body.data!.techStack).toEqual(newProject.techStack);
      expect(body.data!.categories).toEqual(newProject.categories);
      expect(body.data!.id).toBeDefined();
      expect(body.data!.createdAt).toBeDefined();
      expect(body.data!.updatedAt).toBeDefined();

      testProjectId = body.data!.id;

      // Verify directory structure was created
      const projectDir = path.join(WORKSPACE_PATH, testProjectId);
      const projectDirExists = await fs.access(projectDir).then(() => true).catch(() => false);
      expect(projectDirExists).toBe(true);

      // Verify project.json was created
      const projectJsonPath = path.join(projectDir, 'project.json');
      const projectJsonExists = await fs.access(projectJsonPath).then(() => true).catch(() => false);
      expect(projectJsonExists).toBe(true);

      // Verify RootRule.md was created
      const rootRulePath = path.join(projectDir, 'RootRule.md');
      const rootRuleExists = await fs.access(rootRulePath).then(() => true).catch(() => false);
      expect(rootRuleExists).toBe(true);

      // Verify subdirectories were created
      const systemsDir = path.join(projectDir, 'systems');
      const tasksDir = path.join(projectDir, 'tasks');
      const archivesDir = path.join(projectDir, 'archives');

      expect(await fs.access(systemsDir).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(tasksDir).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(archivesDir).then(() => true).catch(() => false)).toBe(true);

      // Verify systems.json was created with empty array
      const systemsJsonPath = path.join(systemsDir, 'systems.json');
      const systemsJson = await fs.readFile(systemsJsonPath, 'utf-8');
      expect(JSON.parse(systemsJson)).toEqual([]);
    });

    it('should create project with only name (minimal required field)', async () => {
      const newProject = {
        name: 'Minimal Project',
      };

      const response = await request(app)
        .post('/api/projects')
        .send(newProject)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<Project>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe(newProject.name);
      expect(body.data!.description).toBe('');
      expect(body.data!.techStack).toEqual([]);
      expect(body.data!.categories).toEqual([]);
      expect(body.data!.defaultReferences).toEqual([]);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ description: 'No name project' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.error).toContain('name');
    });

    it('should return 400 when name is empty string', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: '' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when name exceeds 100 characters', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'a'.repeat(101) })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when description exceeds 500 characters', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Valid Name', description: 'a'.repeat(501) })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('description');
    });

    it('should return 400 when project with same name already exists', async () => {
      // Create first project
      await request(app)
        .post('/api/projects')
        .send({ name: 'Duplicate Name Project' })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/projects')
        .send({ name: 'Duplicate Name Project' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('duplicate');
    });
  });

  describe('GET /api/projects - List All Projects', () => {
    it('should return empty array when no projects exist', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Project[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return all projects sorted by createdAt descending', async () => {
      // Create multiple projects
      await request(app)
        .post('/api/projects')
        .send({ name: 'First Project' })
        .expect(201);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 50));

      await request(app)
        .post('/api/projects')
        .send({ name: 'Second Project' })
        .expect(201);

      const response = await request(app)
        .get('/api/projects')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Project[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);

      // Should be sorted by createdAt descending (newest first)
      expect(body.data![0].name).toBe('Second Project');
      expect(body.data![1].name).toBe('First Project');
    });
  });

  describe('GET /api/projects/:id - Get Single Project', () => {
    it('should return a project by id', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Get By ID Project', description: 'Test description' })
        .expect(201);

      const createdProject = (createResponse.body as ApiResponse<Project>).data!;

      const response = await request(app)
        .get(`/api/projects/${createdProject.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Project>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data!.id).toBe(createdProject.id);
      expect(body.data!.name).toBe('Get By ID Project');
      expect(body.data!.description).toBe('Test description');
    });

    it('should return 404 when project does not exist', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.error).toContain('not found');
    });
  });

  describe('PUT /api/projects/:id - Update Project', () => {
    it('should update project name and description', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Original Name', description: 'Original description' })
        .expect(201);

      const createdProject = (createResponse.body as ApiResponse<Project>).data!;
      const originalUpdatedAt = createdProject.updatedAt;

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await request(app)
        .put(`/api/projects/${createdProject.id}`)
        .send({ name: 'Updated Name', description: 'Updated description' })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Project>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Updated Name');
      expect(body.data!.description).toBe('Updated description');
      expect(body.data!.id).toBe(createdProject.id);
      expect(body.data!.createdAt).toBe(createdProject.createdAt);
      expect(body.data!.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update only provided fields', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .send({
          name: 'Original Name',
          description: 'Original description',
          techStack: ['Unity'],
          categories: ['RPG'],
        })
        .expect(201);

      const createdProject = (createResponse.body as ApiResponse<Project>).data!;

      const response = await request(app)
        .put(`/api/projects/${createdProject.id}`)
        .send({ name: 'Only Name Updated' })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Project>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Only Name Updated');
      expect(body.data!.description).toBe('Original description');
      expect(body.data!.techStack).toEqual(['Unity']);
      expect(body.data!.categories).toEqual(['RPG']);
    });

    it('should return 404 when updating non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });

    it('should return 400 when updated name is empty', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Original Name' })
        .expect(201);

      const createdProject = (createResponse.body as ApiResponse<Project>).data!;

      const response = await request(app)
        .put(`/api/projects/${createdProject.id}`)
        .send({ name: '' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when updated name exceeds 100 characters', async () => {
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Original Name' })
        .expect(201);

      const createdProject = (createResponse.body as ApiResponse<Project>).data!;

      const response = await request(app)
        .put(`/api/projects/${createdProject.id}`)
        .send({ name: 'a'.repeat(101) })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when updating to duplicate name', async () => {
      // Create two projects
      await request(app)
        .post('/api/projects')
        .send({ name: 'Existing Project' })
        .expect(201);

      const secondProjectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Second Project' })
        .expect(201);

      const secondProject = (secondProjectResponse.body as ApiResponse<Project>).data!;

      // Try to update second project with first project's name
      const response = await request(app)
        .put(`/api/projects/${secondProject.id}`)
        .send({ name: 'Existing Project' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('duplicate');
    });
  });

  describe('DELETE /api/projects/:id - Delete Project', () => {
    it('should delete project and its directory', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Project To Delete' })
        .expect(201);

      const createdProject = (createResponse.body as ApiResponse<Project>).data!;
      const projectDir = path.join(WORKSPACE_PATH, createdProject.id);

      // Verify directory exists
      expect(await fs.access(projectDir).then(() => true).catch(() => false)).toBe(true);

      const response = await request(app)
        .delete(`/api/projects/${createdProject.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);

      // Verify directory was deleted
      expect(await fs.access(projectDir).then(() => true).catch(() => false)).toBe(false);

      // Verify project no longer exists in list
      const listResponse = await request(app)
        .get('/api/projects')
        .expect(200);

      const listBody = listResponse.body as ApiResponse<Project[]>;
      expect(listBody.data!.find(p => p.id === createdProject.id)).toBeUndefined();
    });

    it('should return 404 when deleting non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });
  });
});
