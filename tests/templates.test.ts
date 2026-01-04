/**
 * Templates API Tests
 * TDD test suite for CRUD operations on /api/templates endpoints
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { createApp } from '../server/index.ts';
import type { Template, ApiResponse, Project } from '../src/types/index.ts';

// Test workspace path
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');
const TEMPLATES_PATH = path.join(process.cwd(), 'workspace/templates');

describe('Templates API', () => {
  let app: ReturnType<typeof createApp>;
  let testProjectId: string;

  beforeAll(async () => {
    app = createApp();
    // Ensure workspace directories exist
    await fs.mkdir(WORKSPACE_PATH, { recursive: true });
    await fs.mkdir(TEMPLATES_PATH, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test projects
    const entries = await fs.readdir(WORKSPACE_PATH);
    for (const entry of entries) {
      if (entry !== '.gitkeep') {
        await fs.rm(path.join(WORKSPACE_PATH, entry), { recursive: true, force: true });
      }
    }
    // Clean up test templates (except default ones)
    try {
      const templateEntries = await fs.readdir(TEMPLATES_PATH);
      for (const entry of templateEntries) {
        if (entry !== 'questions' && entry !== 'templates.json' && entry !== '.gitkeep') {
          await fs.rm(path.join(TEMPLATES_PATH, entry), { recursive: true, force: true });
        }
      }
    } catch {
      // Ignore if directory doesn't exist
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

    // Create a test project for template operations
    const projectResponse = await request(app)
      .post('/api/projects')
      .send({ name: 'Test Project for Templates', description: 'Test project' })
      .expect(201);

    testProjectId = (projectResponse.body as ApiResponse<Project>).data!.id;

    // Reset templates.json
    await fs.writeFile(path.join(TEMPLATES_PATH, 'templates.json'), '[]', 'utf-8');
  });

  describe('POST /api/templates - Create Template', () => {
    it('should create a new template with all fields', async () => {
      const newTemplate = {
        name: 'Game Design Document',
        category: 'document-structure',
        description: 'Standard game design document template',
        content: '# {{project_name}}\n\n## Overview\n\n{{description}}',
        variables: [
          {
            name: 'project_name',
            description: 'Name of the project',
            defaultValue: null,
            required: true,
            type: 'text',
            options: null,
          },
          {
            name: 'description',
            description: 'Project description',
            defaultValue: null,
            required: false,
            type: 'textarea',
            options: null,
          },
        ],
        projectId: testProjectId,
      };

      const response = await request(app)
        .post('/api/templates')
        .send(newTemplate)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<Template>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).not.toBeNull();
      expect(body.data!.name).toBe(newTemplate.name);
      expect(body.data!.category).toBe(newTemplate.category);
      expect(body.data!.description).toBe(newTemplate.description);
      expect(body.data!.content).toBe(newTemplate.content);
      expect(body.data!.variables).toHaveLength(2);
      expect(body.data!.projectId).toBe(testProjectId);
      expect(body.data!.isDefault).toBe(false);
      expect(body.data!.id).toBeDefined();
      expect(body.data!.createdAt).toBeDefined();
      expect(body.data!.updatedAt).toBeDefined();
    });

    it('should create template with minimal required fields', async () => {
      const minimalTemplate = {
        name: 'Minimal Template',
        category: 'prompts',
      };

      const response = await request(app)
        .post('/api/templates')
        .send(minimalTemplate)
        .expect('Content-Type', /json/)
        .expect(201);

      const body = response.body as ApiResponse<Template>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe(minimalTemplate.name);
      expect(body.data!.category).toBe(minimalTemplate.category);
      expect(body.data!.description).toBe('');
      expect(body.data!.content).toBe('');
      expect(body.data!.variables).toEqual([]);
      expect(body.data!.isDefault).toBe(false);
      expect(body.data!.projectId).toBeNull();
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ category: 'prompts' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });

    it('should return 400 when category is missing', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ name: 'Template Without Category' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('category');
    });

    it('should return 400 when category is invalid', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ name: 'Template', category: 'invalid-category' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('category');
    });

    it('should return 400 when template with same name exists in same category', async () => {
      // Create first template
      await request(app)
        .post('/api/templates')
        .send({ name: 'Duplicate Template', category: 'prompts' })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/templates')
        .send({ name: 'Duplicate Template', category: 'prompts' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('duplicate');
    });
  });

  describe('GET /api/templates - List All Templates', () => {
    it('should return empty array when no templates exist', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Template[]>;

      expect(body.success).toBe(true);
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('should return all templates sorted by createdAt descending', async () => {
      // Create multiple templates
      await request(app)
        .post('/api/templates')
        .send({ name: 'First Template', category: 'prompts' })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 50));

      await request(app)
        .post('/api/templates')
        .send({ name: 'Second Template', category: 'qa-questions' })
        .expect(201);

      const response = await request(app)
        .get('/api/templates')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Template[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.data![0].name).toBe('Second Template');
      expect(body.data![1].name).toBe('First Template');
    });

    it('should filter templates by category', async () => {
      // Create templates in different categories
      await request(app)
        .post('/api/templates')
        .send({ name: 'Prompts Template', category: 'prompts' })
        .expect(201);

      await request(app)
        .post('/api/templates')
        .send({ name: 'QA Template', category: 'qa-questions' })
        .expect(201);

      const response = await request(app)
        .get('/api/templates?category=prompts')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Template[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].name).toBe('Prompts Template');
    });

    it('should filter templates by projectId', async () => {
      // Create templates with and without projectId
      await request(app)
        .post('/api/templates')
        .send({ name: 'Global Template', category: 'prompts' })
        .expect(201);

      await request(app)
        .post('/api/templates')
        .send({ name: 'Project Template', category: 'prompts', projectId: testProjectId })
        .expect(201);

      const response = await request(app)
        .get(`/api/templates?projectId=${testProjectId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Template[]>;

      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data![0].name).toBe('Project Template');
    });
  });

  describe('GET /api/templates/:templateId - Get Single Template', () => {
    it('should return a template by id', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Get By ID Template',
          category: 'document-structure',
          content: '# Test Content',
        })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      const response = await request(app)
        .get(`/api/templates/${createdTemplate.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Template>;

      expect(body.success).toBe(true);
      expect(body.data!.id).toBe(createdTemplate.id);
      expect(body.data!.name).toBe('Get By ID Template');
      expect(body.data!.content).toBe('# Test Content');
    });

    it('should return 404 when template does not exist', async () => {
      const response = await request(app)
        .get('/api/templates/non-existent-template-id')
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });
  });

  describe('PUT /api/templates/:templateId - Update Template', () => {
    it('should update template fields', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Original Name',
          category: 'prompts',
          content: 'Original content',
        })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await request(app)
        .put(`/api/templates/${createdTemplate.id}`)
        .send({ name: 'Updated Name', content: 'Updated content' })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<Template>;

      expect(body.success).toBe(true);
      expect(body.data!.name).toBe('Updated Name');
      expect(body.data!.content).toBe('Updated content');
      expect(body.data!.category).toBe('prompts');
      expect(body.data!.updatedAt).not.toBe(createdTemplate.updatedAt);
    });

    it('should return 404 when updating non-existent template', async () => {
      const response = await request(app)
        .put('/api/templates/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });

    it('should return 400 when updated name is empty', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({ name: 'Original Name', category: 'prompts' })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      const response = await request(app)
        .put(`/api/templates/${createdTemplate.id}`)
        .send({ name: '' })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('name');
    });
  });

  describe('DELETE /api/templates/:templateId - Delete Template', () => {
    it('should delete template', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({ name: 'Template To Delete', category: 'prompts' })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      const response = await request(app)
        .delete(`/api/templates/${createdTemplate.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ deleted: boolean }>;

      expect(body.success).toBe(true);
      expect(body.data!.deleted).toBe(true);

      // Verify template no longer exists
      await request(app)
        .get(`/api/templates/${createdTemplate.id}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent template', async () => {
      const response = await request(app)
        .delete('/api/templates/non-existent-id')
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });

    it('should not allow deleting default templates', async () => {
      // Create a default template manually in storage
      const templatesJsonPath = path.join(TEMPLATES_PATH, 'templates.json');
      const defaultTemplate = {
        id: 'default-template-001',
        name: 'Default Template',
        category: 'qa-questions',
        description: 'A default template',
        content: 'Default content',
        variables: [],
        isDefault: true,
        projectId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await fs.writeFile(templatesJsonPath, JSON.stringify([defaultTemplate]), 'utf-8');

      const response = await request(app)
        .delete('/api/templates/default-template-001')
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('default');
    });
  });

  describe('GET /api/templates/categories - Get Template Categories', () => {
    it('should return all available categories', async () => {
      const response = await request(app)
        .get('/api/templates/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<string[]>;

      expect(body.success).toBe(true);
      expect(body.data).toContain('qa-questions');
      expect(body.data).toContain('document-structure');
      expect(body.data).toContain('prompts');
    });
  });

  describe('POST /api/templates/:templateId/apply - Apply Template', () => {
    it('should apply template with variable values', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Apply Template',
          category: 'document-structure',
          content: '# {{project_name}}\n\nDescription: {{description}}',
          variables: [
            {
              name: 'project_name',
              description: 'Project name',
              defaultValue: null,
              required: true,
              type: 'text',
              options: null,
            },
            {
              name: 'description',
              description: 'Description',
              defaultValue: 'No description',
              required: false,
              type: 'textarea',
              options: null,
            },
          ],
        })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      const response = await request(app)
        .post(`/api/templates/${createdTemplate.id}/apply`)
        .send({
          variableValues: {
            project_name: 'My Awesome Project',
            description: 'This is a great project',
          },
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ content: string; appliedAt: string }>;

      expect(body.success).toBe(true);
      expect(body.data!.content).toBe('# My Awesome Project\n\nDescription: This is a great project');
      expect(body.data!.appliedAt).toBeDefined();
    });

    it('should use default values for missing optional variables', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Default Values Template',
          category: 'prompts',
          content: '{{greeting}}, {{name}}!',
          variables: [
            {
              name: 'greeting',
              description: 'Greeting',
              defaultValue: 'Hello',
              required: false,
              type: 'text',
              options: null,
            },
            {
              name: 'name',
              description: 'Name',
              defaultValue: null,
              required: true,
              type: 'text',
              options: null,
            },
          ],
        })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      const response = await request(app)
        .post(`/api/templates/${createdTemplate.id}/apply`)
        .send({
          variableValues: {
            name: 'World',
          },
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ content: string; appliedAt: string }>;

      expect(body.success).toBe(true);
      expect(body.data!.content).toBe('Hello, World!');
    });

    it('should return 400 when required variable is missing', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Required Var Template',
          category: 'prompts',
          content: '{{required_var}}',
          variables: [
            {
              name: 'required_var',
              description: 'Required variable',
              defaultValue: null,
              required: true,
              type: 'text',
              options: null,
            },
          ],
        })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      const response = await request(app)
        .post(`/api/templates/${createdTemplate.id}/apply`)
        .send({
          variableValues: {},
        })
        .expect('Content-Type', /json/)
        .expect(400);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('required');
    });

    it('should return 404 when template does not exist', async () => {
      const response = await request(app)
        .post('/api/templates/non-existent-id/apply')
        .send({ variableValues: {} })
        .expect('Content-Type', /json/)
        .expect(404);

      const body = response.body as ApiResponse<null>;

      expect(body.success).toBe(false);
      expect(body.error).toContain('not found');
    });
  });

  describe('GET /api/templates/:templateId/preview - Preview Template', () => {
    it('should preview template with sample values', async () => {
      const createResponse = await request(app)
        .post('/api/templates')
        .send({
          name: 'Preview Template',
          category: 'document-structure',
          content: '# {{title}}\n\n{{content}}',
          variables: [
            {
              name: 'title',
              description: 'Title',
              defaultValue: 'Sample Title',
              required: true,
              type: 'text',
              options: null,
            },
            {
              name: 'content',
              description: 'Content',
              defaultValue: 'Sample content here...',
              required: false,
              type: 'textarea',
              options: null,
            },
          ],
        })
        .expect(201);

      const createdTemplate = (createResponse.body as ApiResponse<Template>).data!;

      const response = await request(app)
        .get(`/api/templates/${createdTemplate.id}/preview`)
        .expect('Content-Type', /json/)
        .expect(200);

      const body = response.body as ApiResponse<{ content: string }>;

      expect(body.success).toBe(true);
      expect(body.data!.content).toBe('# Sample Title\n\nSample content here...');
    });
  });
});
