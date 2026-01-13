/**
 * Systems API Tests
<<<<<<< HEAD
 * TDD test suite for CRUD operations on /api/projects/:projectId/systems endpoints
=======
 * TDD test suite for system document management endpoints
>>>>>>> main
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
<<<<<<< HEAD
import type { SystemDocument, ApiResponse, Project } from '../src/types/index.ts';

// Test workspace path
=======
import type { SystemDocument, Project, ApiResponse } from '../src/types/index.ts';
import { v4 as uuidv4 } from 'uuid';

// Test workspace path - must match server's WORKSPACE_PATH
>>>>>>> main
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Systems API', () => {
  let app: ReturnType<typeof createApp>;
  let testProjectId: string;

<<<<<<< HEAD
  beforeAll(async () => {
    app = createApp();
    // Ensure workspace directory exists
=======
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
>>>>>>> main
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
<<<<<<< HEAD

    // Create a test project for system document operations
    const projectResponse = await request(app)
      .post('/api/projects')
      .send({ name: 'Test Project for Systems', description: 'Test project' })
      .expect(201);

    testProjectId = (projectResponse.body as ApiResponse<Project>).data!.id;
  });

  describe('POST /api/projects/:projectId/systems - Create System Document', () => {
    it('should create a new system document with required fields', async () => {
      const newSystemDoc = {
        name: 'Combat System',
        category: 'Core Mechanics',
        tags: ['combat', 'action'],
        content: '# Combat System\n\nDetailed combat mechanics...',
=======
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
>>>>>>> main
        dependencies: [],
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
<<<<<<< HEAD
        .send(newSystemDoc)
=======
        .send(createData)
>>>>>>> main
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
<<<<<<< HEAD
      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.name).toBe(newSystemDoc.name);
      expect(body.data!.category).toBe(newSystemDoc.category);
      expect(body.data!.tags).toEqual(newSystemDoc.tags);
      expect(body.data!.content).toBe(newSystemDoc.content);
      expect(body.data!.projectId).toBe(testProjectId);
      expect(body.data!.id).toBeDefined();
      expect(body.data!.createdAt).toBeDefined();
      expect(body.data!.updatedAt).toBeDefined();

      // Verify systems.json was updated
      const systemsJsonPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', 'systems.json');
      const systemsJson = JSON.parse(await fs.readFile(systemsJsonPath, 'utf-8'));
      expect(systemsJson).toHaveLength(1);
      expect(systemsJson[0].name).toBe(newSystemDoc.name);

      // Verify content file was created
      const contentPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', `${body.data!.id}.md`);
      const contentExists = await fs.access(contentPath).then(() => true).catch(() => false);
      expect(contentExists).toBe(true);
    });

    it('should create system document with only name and category (minimal required)', async () => {
      const newSystemDoc = {
        name: 'Minimal System',
        category: 'Misc',
=======
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
>>>>>>> main
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
<<<<<<< HEAD
        .send(newSystemDoc)
        .expect('Content-Type', /json/)
=======
        .send(createData)
>>>>>>> main
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
<<<<<<< HEAD
      expect(body.data!.name).toBe(newSystemDoc.name);
      expect(body.data!.category).toBe(newSystemDoc.category);
=======
      expect(body.data!.name).toBe('Minimal System');
      expect(body.data!.category).toBe('core');
>>>>>>> main
      expect(body.data!.tags).toEqual([]);
      expect(body.data!.content).toBe('');
      expect(body.data!.dependencies).toEqual([]);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
<<<<<<< HEAD
        .send({ category: 'Core Mechanics' })
        .expect('Content-Type', /json/)
=======
        .send({ category: 'economy' })
>>>>>>> main
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
<<<<<<< HEAD
      expect(body.data).toBeNull();
      expect(body.error).toContain('name');
=======
      expect(body.error).toContain('Name is required');
>>>>>>> main
    });

    it('should return 400 when category is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
<<<<<<< HEAD
        .send({ name: 'System Without Category' })
        .expect('Content-Type', /json/)
=======
        .send({ name: 'Test System' })
>>>>>>> main
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
<<<<<<< HEAD
      expect(body.error).toContain('category');
    });

    it('should return 400 when name is empty string', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: '', category: 'Core' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when system with same name already exists', async () => {
      // Create first system document
      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Duplicate System', category: 'Core' })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Duplicate System', category: 'Other' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('duplicate');
    });

    it('should return 404 when project does not exist', async () => {
      const response = await request(app)
        .post('/api/projects/non-existent-project-id/systems')
        .send({ name: 'Test System', category: 'Core' })
        .expect('Content-Type', /json/)
=======
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
>>>>>>> main
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
<<<<<<< HEAD
      expect(body.error).toContain('Project not found');
    });
  });

  describe('GET /api/projects/:projectId/systems - List All System Documents', () => {
    it('should return empty array when no system documents exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return all system documents sorted by createdAt descending', async () => {
      // Create multiple system documents
      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'First System', category: 'Core' })
        .expect(201);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 50));

      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Second System', category: 'UI' })
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);

      // Should be sorted by createdAt descending (newest first)
      expect(body.data![0].name).toBe('Second System');
      expect(body.data![1].name).toBe('First System');
    });

    it('should return 404 when project does not exist', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-project-id/systems')
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Project not found');
    });
  });

  describe('GET /api/projects/:projectId/systems/:systemId - Get Single System Document', () => {
    it('should return a system document by id', async () => {
      // Create a system document first
      const createResponse = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Get By ID System', category: 'Core', content: '# Test Content' })
=======
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
>>>>>>> main
        .expect(201);

      const createdSystem = (createResponse.body as ApiResponse<SystemDocument>).data!;

<<<<<<< HEAD
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/${createdSystem.id}`)
=======
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
>>>>>>> main
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
<<<<<<< HEAD
      expect(body.error).toBeNull();
      expect(body.data!.id).toBe(createdSystem.id);
      expect(body.data!.name).toBe('Get By ID System');
      expect(body.data!.content).toBe('# Test Content');
    });

    it('should return 404 when system document does not exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/non-existent-system-id`)
        .expect('Content-Type', /json/)
=======
      expect(body.data!.id).toBe(system.id);
      expect(body.data!.name).toBe('Get By ID System');
    });

    it('should return 404 for non-existent system', async () => {
      const response = await request(app)
        .get('/api/systems/non-existent-id')
>>>>>>> main
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
<<<<<<< HEAD
      expect(body.data).toBeNull();
      expect(body.error).toContain('not found');
    });

    it('should return 404 when project does not exist', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-project-id/systems/some-system-id')
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('Project not found');
    });
  });

  describe('PUT /api/projects/:projectId/systems/:systemId - Update System Document', () => {
    it('should update system document name and content', async () => {
      // Create a system document first
      const createResponse = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Original Name', category: 'Core', content: 'Original content' })
        .expect(201);

      const createdSystem = (createResponse.body as ApiResponse<SystemDocument>).data!;
      const originalUpdatedAt = createdSystem.updatedAt;

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await request(app)
        .put(`/api/projects/${testProjectId}/systems/${createdSystem.id}`)
        .send({ name: 'Updated Name', content: 'Updated content' })
=======
      expect(body.error).toBe('System not found');
    });
  });

  describe('PUT /api/systems/:id - Update System', () => {
    it('should update system name successfully', async () => {
      const system = await createTestSystem(testProjectId, { name: 'Original Name' });

      const response = await request(app)
        .put(`/api/systems/${system.id}`)
        .send({ name: 'Updated Name' })
>>>>>>> main
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Updated Name');
<<<<<<< HEAD
      expect(body.data!.content).toBe('Updated content');
      expect(body.data!.id).toBe(createdSystem.id);
      expect(body.data!.createdAt).toBe(createdSystem.createdAt);
      expect(body.data!.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update only provided fields', async () => {
      // Create a system document first
      const createResponse = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({
          name: 'Original Name',
          category: 'Core',
          tags: ['combat', 'action'],
          content: 'Original content',
        })
        .expect(201);

      const createdSystem = (createResponse.body as ApiResponse<SystemDocument>).data!;

      const response = await request(app)
        .put(`/api/projects/${testProjectId}/systems/${createdSystem.id}`)
        .send({ name: 'Only Name Updated' })
        .expect('Content-Type', /json/)
=======
      expect(body.data!.updatedAt).not.toBe(system.updatedAt);
    });

    it('should update system content and sync to .md file', async () => {
      const system = await createTestSystem(testProjectId);

      const response = await request(app)
        .put(`/api/systems/${system.id}`)
        .send({ content: '# Updated Content\n\nNew content here.' })
>>>>>>> main
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
<<<<<<< HEAD
      expect(body.data!.name).toBe('Only Name Updated');
      expect(body.data!.category).toBe('Core');
      expect(body.data!.tags).toEqual(['combat', 'action']);
      expect(body.data!.content).toBe('Original content');
    });

    it('should return 404 when updating non-existent system document', async () => {
      const response = await request(app)
        .put(`/api/projects/${testProjectId}/systems/non-existent-system-id`)
        .send({ name: 'Updated Name' })
        .expect('Content-Type', /json/)
=======
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
>>>>>>> main
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
<<<<<<< HEAD
      expect(body.error).toContain('not found');
    });

    it('should return 400 when updated name is empty', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Original Name', category: 'Core' })
        .expect(201);

      const createdSystem = (createResponse.body as ApiResponse<SystemDocument>).data!;

      const response = await request(app)
        .put(`/api/projects/${testProjectId}/systems/${createdSystem.id}`)
        .send({ name: '' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when updating to duplicate name', async () => {
      // Create two system documents
      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Existing System', category: 'Core' })
        .expect(201);

      const secondSystemResponse = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'Second System', category: 'Core' })
        .expect(201);

      const secondSystem = (secondSystemResponse.body as ApiResponse<SystemDocument>).data!;

      // Try to update second system with first system's name
      const response = await request(app)
        .put(`/api/projects/${testProjectId}/systems/${secondSystem.id}`)
        .send({ name: 'Existing System' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('duplicate');
    });
  });

  describe('DELETE /api/projects/:projectId/systems/:systemId - Delete System Document', () => {
    it('should delete system document and its content file', async () => {
      // Create a system document first
      const createResponse = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System To Delete', category: 'Core', content: 'Content to delete' })
        .expect(201);

      const createdSystem = (createResponse.body as ApiResponse<SystemDocument>).data!;
      const contentPath = path.join(WORKSPACE_PATH, testProjectId, 'systems', `${createdSystem.id}.md`);

      // Verify content file exists
      expect(await fs.access(contentPath).then(() => true).catch(() => false)).toBe(true);

      const response = await request(app)
        .delete(`/api/projects/${testProjectId}/systems/${createdSystem.id}`)
=======
      expect(body.error).toBe('System not found');
    });
  });

  describe('DELETE /api/systems/:id - Delete System', () => {
    it('should delete system successfully', async () => {
      const system = await createTestSystem(testProjectId);

      const response = await request(app)
        .delete(`/api/systems/${system.id}`)
>>>>>>> main
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);
<<<<<<< HEAD

      // Verify content file was deleted
      expect(await fs.access(contentPath).then(() => true).catch(() => false)).toBe(false);

      // Verify system no longer exists in list
      const listResponse = await request(app)
        .get(`/api/projects/${testProjectId}/systems`)
        .expect(200);

      const listBody = listResponse.body as ApiResponse<SystemDocument[]>;
      expect(listBody.data!.find(s => s.id === createdSystem.id)).toBeUndefined();
    });

    it('should return 404 when deleting non-existent system document', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProjectId}/systems/non-existent-system-id`)
        .expect('Content-Type', /json/)
=======
    });

    it('should return 404 for non-existent system', async () => {
      const response = await request(app)
        .delete('/api/systems/non-existent-id')
>>>>>>> main
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
<<<<<<< HEAD
      expect(body.error).toContain('not found');
    });
  });

  describe('GET /api/projects/:projectId/systems/categories - Get Unique Categories', () => {
    it('should return empty array when no system documents exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/categories`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('should return unique categories sorted alphabetically', async () => {
      // Create system documents with various categories
      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System 1', category: 'Combat' })
        .expect(201);

      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System 2', category: 'UI' })
        .expect(201);

      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System 3', category: 'Combat' }) // Duplicate category
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/categories`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual(['Combat', 'UI']);
    });
  });

  describe('GET /api/projects/:projectId/systems/tags - Get Unique Tags', () => {
    it('should return empty array when no system documents exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/tags`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('should return unique tags sorted alphabetically', async () => {
      // Create system documents with various tags
      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System 1', category: 'Core', tags: ['combat', 'action'] })
        .expect(201);

      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System 2', category: 'Core', tags: ['ui', 'action'] }) // 'action' is duplicate
        .expect(201);

      await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System 3', category: 'Core', tags: ['economy'] })
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/tags`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual(['action', 'combat', 'economy', 'ui']);
=======
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
>>>>>>> main
    });
  });
});
