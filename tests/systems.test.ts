/**
 * Systems API Tests
 * TDD test suite for system document management endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type { SystemDocument, Project, ApiResponse } from '../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';

// Test workspace path - must match server's WORKSPACE_PATH
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Systems API', () => {
  let app: ReturnType<typeof createApp>;
  let testProjectId: string;

  // Helper to create a test project
  async function createTestProject(): Promise<string> {
    const projectId = uuidv4();
    const projectDir = path.join(WORKSPACE_PATH, projectId);
    const systemsDir = path.join(projectDir, 'systems');

    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(systemsDir, { recursive: true });

    const project: Project = {
      id: projectId,
      name: 'Test Project',
      description: 'Test project for systems',
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

    // Create systems.json
    await fs.writeFile(
      path.join(systemsDir, 'systems.json'),
      JSON.stringify([], null, 2),
      'utf-8'
    );

    return projectId;
  }

  // Helper to create a test system document
  async function createTestSystem(projectId: string, overrides: Partial<SystemDocument> = {}): Promise<SystemDocument> {
    const systemDoc: SystemDocument = {
      id: uuidv4(),
      projectId,
      name: 'Test System',
      category: 'game-mechanic',
      tags: ['test', 'sample'],
      content: '# Test System\n\nThis is a test system document.',
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };

    const systemsPath = path.join(WORKSPACE_PATH, projectId, 'systems', 'systems.json');
    const existingSystems = JSON.parse(await fs.readFile(systemsPath, 'utf-8')) as SystemDocument[];
    existingSystems.push(systemDoc);
    await fs.writeFile(systemsPath, JSON.stringify(existingSystems, null, 2), 'utf-8');

    // Create .md file for content
    const systemMdPath = path.join(WORKSPACE_PATH, projectId, 'systems', `${systemDoc.id}.md`);
    await fs.writeFile(systemMdPath, systemDoc.content, 'utf-8');

    return systemDoc;
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

  describe('GET /api/projects/:projectId/systems - List Systems', () => {
    it('should return empty array when no systems exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return all systems for a project', async () => {
      await createTestSystem(testProjectId, { name: 'System 1' });
      await createTestSystem(testProjectId, { name: 'System 2' });

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems`)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data!.map((s) => s.name)).toContain('System 1');
      expect(body.data!.map((s) => s.name)).toContain('System 2');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id/systems')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });
  });

  describe('POST /api/projects/:projectId/systems - Create System', () => {
    it('should create a new system document successfully', async () => {
      const createData = {
        name: 'New System',
        category: 'economy',
        tags: ['tag1', 'tag2'],
        content: '# New System\n\nContent here.',
        dependencies: [],
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send(createData)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('New System');
      expect(body.data!.projectId).toBe(testProjectId);
      expect(body.data!.category).toBe('economy');
      expect(body.data!.tags).toEqual(['tag1', 'tag2']);
      expect(body.data!.content).toBe('# New System\n\nContent here.');
      expect(body.data!.id).toBeDefined();
    });

    it('should create system with minimal data (name and category only)', async () => {
      const createData = {
        name: 'Minimal System',
        category: 'core',
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send(createData)
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Minimal System');
      expect(body.data!.category).toBe('core');
      expect(body.data!.tags).toEqual([]);
      expect(body.data!.content).toBe('');
      expect(body.data!.dependencies).toEqual([]);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ category: 'economy' })
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Name is required');
    });

    it('should return 400 when category is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Test System' })
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Category is required');
    });

    it('should return 404 for non-existent project', async () => {
      const createData = {
        name: 'New System',
        category: 'core',
      };

      const response = await request(app)
        .post('/api/projects/non-existent-id/systems')
        .send(createData)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('Project not found');
    });

    it('should persist system to storage', async () => {
      const createData = {
        name: 'Persistent System',
        category: 'economy',
        content: '# Persistent System\n\nTest content.',
      };

      const createResponse = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send(createData)
        .expect(201);

      const createdSystem = (createResponse.body as ApiResponse<SystemDocument>).data!;

      // Verify system is persisted in systems.json
      const systemsPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', 'systems.json');
      const systems = JSON.parse(await fs.readFile(systemsPath, 'utf-8')) as SystemDocument[];

      expect(systems).toHaveLength(1);
      expect(systems[0].name).toBe('Persistent System');

      // Verify .md file was created
      const mdPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', `${createdSystem.id}.md`);
      const mdContent = await fs.readFile(mdPath, 'utf-8');
      expect(mdContent).toBe('# Persistent System\n\nTest content.');
    });
  });

  describe('GET /api/systems/:id - Get Single System', () => {
    it('should return a system document by id', async () => {
      const system = await createTestSystem(testProjectId, { name: 'Get By ID System' });

      const response = await request(app)
        .get(`/api/systems/${system.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.id).toBe(system.id);
      expect(body.data!.name).toBe('Get By ID System');
    });

    it('should return 404 for non-existent system', async () => {
      const response = await request(app)
        .get('/api/systems/non-existent-id')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('System not found');
    });
  });

  describe('PUT /api/systems/:id - Update System', () => {
    it('should update system name successfully', async () => {
      const system = await createTestSystem(testProjectId, { name: 'Original Name' });

      const response = await request(app)
        .put(`/api/systems/${system.id}`)
        .send({ name: 'Updated Name' })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Updated Name');
      expect(body.data!.updatedAt).not.toBe(system.updatedAt);
    });

    it('should update system content and sync to .md file', async () => {
      const system = await createTestSystem(testProjectId);

      const response = await request(app)
        .put(`/api/systems/${system.id}`)
        .send({ content: '# Updated Content\n\nNew content here.' })
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.content).toBe('# Updated Content\n\nNew content here.');

      // Verify .md file was updated
      const mdPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', `${system.id}.md`);
      const mdContent = await fs.readFile(mdPath, 'utf-8');
      expect(mdContent).toBe('# Updated Content\n\nNew content here.');
    });

    it('should update multiple fields at once', async () => {
      const system = await createTestSystem(testProjectId);

      const response = await request(app)
        .put(`/api/systems/${system.id}`)
        .send({
          name: 'Multi Update',
          category: 'narrative',
          tags: ['new-tag'],
        })
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Multi Update');
      expect(body.data!.category).toBe('narrative');
      expect(body.data!.tags).toEqual(['new-tag']);
    });

    it('should return 404 for non-existent system', async () => {
      const response = await request(app)
        .put('/api/systems/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('System not found');
    });
  });

  describe('DELETE /api/systems/:id - Delete System', () => {
    it('should delete system successfully', async () => {
      const system = await createTestSystem(testProjectId);

      const response = await request(app)
        .delete(`/api/systems/${system.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);
    });

    it('should return 404 for non-existent system', async () => {
      const response = await request(app)
        .delete('/api/systems/non-existent-id')
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toBe('System not found');
    });

    it('should remove system from storage and delete .md file', async () => {
      const system1 = await createTestSystem(testProjectId, { name: 'System 1' });
      const system2 = await createTestSystem(testProjectId, { name: 'System 2' });

      await request(app)
        .delete(`/api/systems/${system1.id}`)
        .expect(200);

      // Verify system is removed from storage
      const systemsPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', 'systems.json');
      const systems = JSON.parse(await fs.readFile(systemsPath, 'utf-8')) as SystemDocument[];

      expect(systems).toHaveLength(1);
      expect(systems[0].id).toBe(system2.id);

      // Verify .md file was deleted
      const mdPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', `${system1.id}.md`);
      const mdExists = await fs.access(mdPath).then(() => true).catch(() => false);
      expect(mdExists).toBe(false);
    });
  });
});
