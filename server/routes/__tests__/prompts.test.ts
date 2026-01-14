/**
 * Tests for prompts API routes
 * RED phase: Write failing tests first
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  PromptTemplate,
  PromptCategory,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
} from '../../src/types/index.ts';

// Test workspace directory
const TEST_WORKSPACE_DIR = path.join(process.cwd(), 'workspace-test-prompts-api');

// Mock the workspace path
const originalCwd = process.cwd();

async function cleanTestWorkspace() {
  try {
    await fs.rm(TEST_WORKSPACE_DIR, { recursive: true, force: true });
  } catch {
    // Ignore if directory doesn't exist
  }
}

function mockCwd() {
  process.cwd = () => TEST_WORKSPACE_DIR;
}

function restoreCwd() {
  process.cwd = () => originalCwd;
}

// Test app
let app: Express;

describe('Prompts API Routes', () => {
  beforeAll(async () => {
    await cleanTestWorkspace();
    mockCwd();

    // Import after mocking cwd
    const { promptsRouter } = await import('../prompts.ts');

    app = express();
    app.use(express.json());
    app.use('/api/prompts', promptsRouter);
  });

  beforeEach(async () => {
    await cleanTestWorkspace();
    mockCwd();
  });

  afterEach(async () => {
    await cleanTestWorkspace();
    restoreCwd();
  });

  describe('GET /api/prompts/categories', () => {
    it('should return all available categories', async () => {
      const response = await request(app)
        .get('/api/prompts/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([
        'document-generation',
        'code-operation',
        'analysis',
        'utility',
      ]);
    });
  });

  describe('GET /api/prompts', () => {
    it('should return empty array when no prompts exist', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all prompts sorted by createdAt descending', async () => {
      const { createPrompt } = await import('../../utils/promptStorage.ts');

      const dto1: CreatePromptTemplateDto = {
        name: 'First Prompt',
        category: 'document-generation',
        description: 'Test',
        content: 'Content 1',
        variables: [],
      };
      const dto2: CreatePromptTemplateDto = {
        name: 'Second Prompt',
        category: 'code-operation',
        description: 'Test',
        content: 'Content 2',
        variables: [],
      };

      await createPrompt(uuidv4(), dto1);
      await new Promise(resolve => setTimeout(resolve, 10));
      await createPrompt(uuidv4(), dto2);

      const response = await request(app)
        .get('/api/prompts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Second Prompt');
      expect(response.body.data[1].name).toBe('First Prompt');
    });

    it('should filter prompts by category query parameter', async () => {
      const { createPrompt } = await import('../../utils/promptStorage.ts');

      const dto1: CreatePromptTemplateDto = {
        name: 'Doc Prompt',
        category: 'document-generation',
        description: 'Test',
        content: 'Content',
        variables: [],
      };
      const dto2: CreatePromptTemplateDto = {
        name: 'Code Prompt',
        category: 'code-operation',
        description: 'Test',
        content: 'Content',
        variables: [],
      };

      await createPrompt(uuidv4(), dto1);
      await createPrompt(uuidv4(), dto2);

      const response = await request(app)
        .get('/api/prompts?category=document-generation')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Doc Prompt');
    });
  });

  describe('GET /api/prompts/:id', () => {
    it('should return 404 for non-existent prompt', async () => {
      const response = await request(app)
        .get('/api/prompts/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Prompt not found');
    });

    it('should return prompt by id', async () => {
      const { createPrompt } = await import('../../utils/promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'Test Prompt',
        category: 'analysis',
        description: 'Test',
        content: 'Test content',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);

      const response = await request(app)
        .get(`/api/prompts/${promptId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(promptId);
      expect(response.body.data.name).toBe('Test Prompt');
    });
  });

  describe('POST /api/prompts', () => {
    it('should create a new prompt', async () => {
      const dto: CreatePromptTemplateDto = {
        name: 'New Prompt',
        category: 'utility',
        description: 'A new prompt',
        content: 'Prompt content',
        variables: [],
      };

      const response = await request(app)
        .post('/api/prompts')
        .send(dto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Prompt');
      expect(response.body.data.content).toBe('Prompt content');
      expect(response.body.data.version).toBe(1);
      expect(response.body.data.isModified).toBe(false);
    });

    it('should return 400 when name is missing', async () => {
      const dto = {
        category: 'utility',
        description: 'Test',
        content: 'Content',
        variables: [],
      };

      const response = await request(app)
        .post('/api/prompts')
        .send(dto)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('name');
    });

    it('should return 400 when category is invalid', async () => {
      const dto = {
        name: 'Test',
        category: 'invalid-category',
        description: 'Test',
        content: 'Content',
        variables: [],
      };

      const response = await request(app)
        .post('/api/prompts')
        .send(dto)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid category');
    });

    it('should trim whitespace from name and description', async () => {
      const dto = {
        name: '  Whitespace Prompt  ',
        category: 'utility',
        description: '  Spaces  ',
        content: 'Content',
        variables: [],
      };

      const response = await request(app)
        .post('/api/prompts')
        .send(dto)
        .expect(201);

      expect(response.body.data.name).toBe('Whitespace Prompt');
      expect(response.body.data.description).toBe('Spaces');
    });
  });

  describe('PUT /api/prompts/:id', () => {
    it('should update existing prompt', async () => {
      const { createPrompt } = await import('../../utils/promptStorage.ts');

      const createDto: CreatePromptTemplateDto = {
        name: 'Original Name',
        category: 'document-generation',
        description: 'Original',
        content: 'Original content',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, createDto);

      const updateDto: UpdatePromptTemplateDto = {
        name: 'Updated Name',
        content: 'Updated content',
      };

      const response = await request(app)
        .put(`/api/prompts/${promptId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.content).toBe('Updated content');
      expect(response.body.data.version).toBe(2);
      expect(response.body.data.isModified).toBe(true);
    });

    it('should return 404 when updating non-existent prompt', async () => {
      const response = await request(app)
        .put('/api/prompts/non-existent')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Prompt not found');
    });
  });

  describe('POST /api/prompts/:id/reset', () => {
    it('should reset prompt to default content', async () => {
      const { createPrompt, updatePrompt } = await import('../../utils/promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'Test Prompt',
        category: 'utility',
        description: 'Test',
        content: 'Original content',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);
      await updatePrompt(promptId, { content: 'Modified content' });

      const response = await request(app)
        .post(`/api/prompts/${promptId}/reset`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Original content');
      expect(response.body.data.isModified).toBe(false);
    });

    it('should return 404 when resetting non-existent prompt', async () => {
      const response = await request(app)
        .post('/api/prompts/non-existent/reset')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Prompt not found');
    });
  });

  describe('GET /api/prompts/:id/versions', () => {
    it('should return version history for a prompt', async () => {
      const { createPrompt, updatePrompt } = await import('../../utils/promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'Versioned Prompt',
        category: 'utility',
        description: 'Test',
        content: 'v1',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);
      await updatePrompt(promptId, { content: 'v2' });

      const response = await request(app)
        .get(`/api/prompts/${promptId}/versions`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 for non-existent prompt versions', async () => {
      const { getPromptVersions } = await import('../../utils/promptStorage.ts');

      // Mock to return null for non-existent prompt
      const response = await request(app)
        .get('/api/prompts/non-existent/versions')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Prompt not found');
    });
  });

  describe('DELETE /api/prompts/:id', () => {
    it('should delete a prompt', async () => {
      const { createPrompt, getPromptById } = await import('../../utils/promptStorage.ts');

      const dto: CreatePromptTemplateDto = {
        name: 'To Delete',
        category: 'analysis',
        description: 'Test',
        content: 'Content',
        variables: [],
      };

      const promptId = uuidv4();
      await createPrompt(promptId, dto);

      await request(app)
        .delete(`/api/prompts/${promptId}`)
        .expect(200);

      const retrieved = await getPromptById(promptId);
      expect(retrieved).toBeNull();
    });

    it('should return 404 when deleting non-existent prompt', async () => {
      const response = await request(app)
        .delete('/api/prompts/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Prompt not found');
    });
  });
});
