/**
 * Systems API Tests
 * TDD test suite for CRUD operations on /api/projects/:projectId/systems endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type { SystemDocument, ApiResponse, Project } from '../src/types/index.ts';

// Test workspace path
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

describe('Systems API', () => {
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
        dependencies: [],
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send(newSystemDoc)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
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
      };

      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send(newSystemDoc)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe(newSystemDoc.name);
      expect(body.data!.category).toBe(newSystemDoc.category);
      expect(body.data!.tags).toEqual([]);
      expect(body.data!.content).toBe('');
      expect(body.data!.dependencies).toEqual([]);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ category: 'Core Mechanics' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.error).toContain('name');
    });

    it('should return 400 when category is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProjectId}/systems`)
        .send({ name: 'System Without Category' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
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
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
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
        .expect(201);

      const createdSystem = (createResponse.body as ApiResponse<SystemDocument>).data!;

      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/${createdSystem.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data!.id).toBe(createdSystem.id);
      expect(body.data!.name).toBe('Get By ID System');
      expect(body.data!.content).toBe('# Test Content');
    });

    it('should return 404 when system document does not exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}/systems/non-existent-system-id`)
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
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
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Updated Name');
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
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
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
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
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
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);

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
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
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
    });
  });
});
