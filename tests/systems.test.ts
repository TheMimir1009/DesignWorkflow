/**
 * Systems API Tests
 * TDD test suite for CRUD operations on /api/projects/:projectId/systems endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type { SystemDocument, ApiResponse } from '../src/types/index.ts';

// Test workspace path
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');
const TEST_PROJECT_ID = 'test-project-for-systems-api';

async function setupTestProject() {
  const projectDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID);
  const systemsDir = path.join(projectDir, 'systems');

  // Ensure directories exist
  await fs.mkdir(systemsDir, { recursive: true });

  // Write empty systems.json
  await fs.writeFile(path.join(systemsDir, 'systems.json'), '[]', 'utf-8');

  // Write project.json
  await fs.writeFile(
    path.join(projectDir, 'project.json'),
    JSON.stringify({ id: TEST_PROJECT_ID, name: 'Test Project' }),
    'utf-8'
  );

  // Remove all .md files in systems directory
  try {
    const entries = await fs.readdir(systemsDir);
    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        await fs.unlink(path.join(systemsDir, entry));
      }
    }
  } catch {
    // Ignore errors
  }
}

describe('Systems API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    app = createApp();
    await setupTestProject();
  });

  afterAll(async () => {
    // Clean up test project directory
    const projectDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID);
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    // Reset test project to clean state before each test
    await setupTestProject();
  });

  describe('POST /api/projects/:projectId/systems - Create System Document', () => {
    it('should create a new system document with required fields', async () => {
      const newDoc = {
        name: 'Character System',
        category: 'System',
        tags: ['core', 'player'],
        content: '# Character System\n\nThis is the character system.',
        dependencies: [],
      };

      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send(newDoc)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.name).toBe(newDoc.name);
      expect(body.data!.category).toBe(newDoc.category);
      expect(body.data!.tags).toEqual(newDoc.tags);
      expect(body.data!.content).toBe(newDoc.content);
      expect(body.data!.projectId).toBe(TEST_PROJECT_ID);
      expect(body.data!.id).toBeDefined();
      expect(body.data!.createdAt).toBeDefined();
      expect(body.data!.updatedAt).toBeDefined();

      // Verify .md file was created
      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      const mdPath = path.join(systemsDir, `${body.data!.id}.md`);
      const mdExists = await fs.access(mdPath).then(() => true).catch(() => false);
      expect(mdExists).toBe(true);

      // Verify systems.json was updated
      const metadataContent = await fs.readFile(path.join(systemsDir, 'systems.json'), 'utf-8');
      const metadata = JSON.parse(metadataContent);
      expect(metadata).toHaveLength(1);
      expect(metadata[0].name).toBe(newDoc.name);
    });

    it('should create document with only required fields (name and category)', async () => {
      const newDoc = {
        name: 'Minimal Doc',
        category: 'System',
      };

      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send(newDoc)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe(newDoc.name);
      expect(body.data!.category).toBe(newDoc.category);
      expect(body.data!.tags).toEqual([]);
      expect(body.data!.content).toBe('');
      expect(body.data!.dependencies).toEqual([]);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ category: 'System' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.error).toContain('name');
    });

    it('should return 400 when category is missing', async () => {
      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Test Doc' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('category');
    });

    it('should return 400 when name is empty', async () => {
      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: '', category: 'System' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when name exceeds 100 characters', async () => {
      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'a'.repeat(101), category: 'System' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when document with same name exists', async () => {
      // Create first document
      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Duplicate Name', category: 'System' })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Duplicate Name', category: 'Economy' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('exist');
    });
  });

  describe('GET /api/projects/:projectId/systems - List System Documents', () => {
    it('should return empty array when no documents exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return all system documents with content', async () => {
      // Create multiple documents
      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 1', category: 'System', content: '# Doc 1 Content' })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 2', category: 'Economy', content: '# Doc 2 Content' })
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data!.map(d => d.name).sort()).toEqual(['Doc 1', 'Doc 2']);
      expect(body.data![0].content).toBeDefined();
    });
  });

  describe('GET /api/projects/:projectId/systems/:id - Get Single Document', () => {
    it('should return document by id with content', async () => {
      // Create a document first
      const createResponse = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({
          name: 'Get By ID Doc',
          category: 'System',
          content: '# Test Content',
          tags: ['test'],
        })
        .expect(201);

      const createdDoc = (createResponse.body as ApiResponse<SystemDocument>).data!;

      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/${createdDoc.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.id).toBe(createdDoc.id);
      expect(body.data!.name).toBe('Get By ID Doc');
      expect(body.data!.content).toBe('# Test Content');
    });

    it('should return 404 when document does not exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/non-existent-id`)
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });
  });

  describe('PUT /api/projects/:projectId/systems/:id - Update Document', () => {
    it('should update document name and content', async () => {
      // Create a document first
      const createResponse = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({
          name: 'Original Name',
          category: 'System',
          content: '# Original',
        })
        .expect(201);

      const createdDoc = (createResponse.body as ApiResponse<SystemDocument>).data!;
      const originalUpdatedAt = createdDoc.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/systems/${createdDoc.id}`)
        .send({
          name: 'Updated Name',
          content: '# Updated Content',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Updated Name');
      expect(body.data!.content).toBe('# Updated Content');
      expect(body.data!.category).toBe('System'); // Unchanged
      expect(body.data!.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update only provided fields', async () => {
      const createResponse = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({
          name: 'Original',
          category: 'System',
          tags: ['original'],
          content: '# Original Content',
        })
        .expect(201);

      const createdDoc = (createResponse.body as ApiResponse<SystemDocument>).data!;

      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/systems/${createdDoc.id}`)
        .send({ tags: ['updated', 'new'] })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument>;

      expect(body.data!.name).toBe('Original');
      expect(body.data!.tags).toEqual(['updated', 'new']);
      expect(body.data!.content).toBe('# Original Content');
    });

    it('should return 404 when updating non-existent document', async () => {
      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/systems/non-existent-id`)
        .send({ name: 'Updated' })
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });

    it('should return 400 when updating to duplicate name', async () => {
      // Create two documents
      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Existing Doc', category: 'System' })
        .expect(201);

      const secondResponse = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Second Doc', category: 'System' })
        .expect(201);

      const secondDoc = (secondResponse.body as ApiResponse<SystemDocument>).data!;

      // Try to update second doc with first doc's name
      const response = await request(app)
        .put(`/api/projects/${TEST_PROJECT_ID}/systems/${secondDoc.id}`)
        .send({ name: 'Existing Doc' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('exist');
    });
  });

  describe('DELETE /api/projects/:projectId/systems/:id - Delete Document', () => {
    it('should delete document and its .md file', async () => {
      // Create a document first
      const createResponse = await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'To Delete', category: 'System', content: '# Delete me' })
        .expect(201);

      const createdDoc = (createResponse.body as ApiResponse<SystemDocument>).data!;

      // Verify .md file exists
      const systemsDir = path.join(WORKSPACE_PATH, TEST_PROJECT_ID, 'systems');
      const mdPath = path.join(systemsDir, `${createdDoc.id}.md`);
      expect(await fs.access(mdPath).then(() => true).catch(() => false)).toBe(true);

      // Delete
      const response = await request(app)
        .delete(`/api/projects/${TEST_PROJECT_ID}/systems/${createdDoc.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);

      // Verify .md file is deleted
      expect(await fs.access(mdPath).then(() => true).catch(() => false)).toBe(false);

      // Verify document is no longer in list
      const listResponse = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .expect(200);

      const listBody = listResponse.body as ApiResponse<SystemDocument[]>;
      expect(listBody.data!.find(d => d.id === createdDoc.id)).toBeUndefined();
    });

    it('should return 404 when deleting non-existent document', async () => {
      const response = await request(app)
        .delete(`/api/projects/${TEST_PROJECT_ID}/systems/non-existent-id`)
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });
  });

  describe('GET /api/projects/:projectId/systems/categories - List Categories', () => {
    it('should return empty array when no documents exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/categories`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('should return unique categories sorted alphabetically', async () => {
      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 1', category: 'System' })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 2', category: 'Economy' })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 3', category: 'System' })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 4', category: 'UI' })
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/categories`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual(['Economy', 'System', 'UI']);
    });
  });

  describe('GET /api/projects/:projectId/systems/tags - List Tags', () => {
    it('should return empty array when no documents exist', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/tags`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('should return unique tags sorted alphabetically', async () => {
      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 1', category: 'System', tags: ['core', 'player'] })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 2', category: 'Economy', tags: ['economy', 'core'] })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({ name: 'Doc 3', category: 'UI', tags: ['ui', 'menu'] })
        .expect(201);

      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/tags`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toEqual(['core', 'economy', 'menu', 'player', 'ui']);
    });
  });

  describe('GET /api/projects/:projectId/systems/search - Search Documents', () => {
    beforeEach(async () => {
      // Create test documents
      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({
          name: 'Character System',
          category: 'System',
          tags: ['core', 'player'],
          content: '# Character\n\nPlayer character.',
        })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({
          name: 'Combat System',
          category: 'System',
          tags: ['core', 'battle'],
          content: '# Combat\n\nBattle mechanics.',
        })
        .expect(201);

      await request(app)
        .post(`/api/projects/${TEST_PROJECT_ID}/systems`)
        .send({
          name: 'Economy Rules',
          category: 'Economy',
          tags: ['economy', 'balance'],
          content: '# Economy\n\nIn-game currency.',
        })
        .expect(201);
    });

    it('should return all documents when query is empty', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/search?q=`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
    });

    it('should search by document name (case insensitive)', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/search?q=character`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].name).toBe('Character System');
    });

    it('should search by tags', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/search?q=core`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data!.map(d => d.name).sort()).toEqual(['Character System', 'Combat System']);
    });

    it('should search by category', async () => {
      const response = await request(app)
        .get(`/api/projects/${TEST_PROJECT_ID}/systems/search?q=economy`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<SystemDocument[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].name).toBe('Economy Rules');
    });
  });
});
