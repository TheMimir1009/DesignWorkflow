/**
 * Test Suite: generate.ts Document Generation API routes
 * TDD implementation for document generation endpoints
 *
 * Requirements covered:
 * - REQ-E-006: Generate design document endpoint
 * - REQ-E-007: Generate PRD endpoint
 * - REQ-E-008: Generate prototype endpoint
 * - REQ-E-009: Analyze features endpoint
 * - REQ-E-010: Modify document endpoint
 * - REQ-E-011: Generation status endpoint
 * - REQ-E-012: Generation history endpoint
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { generateRouter, setClaudeCodeRunner } from '../generate.ts';

// Mock ClaudeCodeRunner
const mockClaudeCodeRunner = vi.fn();

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/generate', generateRouter);
  return app;
}

describe('generate API routes - Document Generation', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
    setClaudeCodeRunner(mockClaudeCodeRunner);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/generate/design-document', () => {
    it('should generate design document from Q&A responses', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { document: '# Design Document\n## Overview\nTask management app' },
        rawOutput: '{"document": "..."}',
      });

      const response = await request(app)
        .post('/api/generate/design-document')
        .send({
          qaResponses: [
            { question: 'Project name?', answer: 'TaskFlow' },
            { question: 'Main feature?', answer: 'Task management' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 400 for missing qaResponses', async () => {
      const response = await request(app)
        .post('/api/generate/design-document')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('qaResponses');
    });

    it('should accept optional referenceSystemIds', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { document: 'Generated document' },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/design-document')
        .send({
          qaResponses: [{ question: 'Q', answer: 'A' }],
          referenceSystemIds: [
            { id: 'sys-001', name: 'Auth System', description: 'JWT auth' },
          ],
        });

      expect(response.status).toBe(200);
    });

    it('should handle Claude Code execution errors', async () => {
      mockClaudeCodeRunner.mockRejectedValue(new Error('Generation failed'));

      const response = await request(app)
        .post('/api/generate/design-document')
        .send({
          qaResponses: [{ question: 'Q', answer: 'A' }],
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/generate/prd', () => {
    it('should generate PRD from design document', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { document: '# PRD\n## Requirements\n...' },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/prd')
        .send({
          designDocContent: '# Design Document\nTask management app overview',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing designDocContent', async () => {
      const response = await request(app)
        .post('/api/generate/prd')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('designDocContent');
    });

    it('should accept optional project context', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: {},
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/prd')
        .send({
          designDocContent: 'Design doc content',
          projectContext: 'Enterprise project',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/generate/prototype', () => {
    it('should generate prototype HTML from PRD', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { html: '<!DOCTYPE html><html>...</html>' },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/prototype')
        .send({
          prdContent: '# PRD\n## Features\n- Login page',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing prdContent', async () => {
      const response = await request(app)
        .post('/api/generate/prototype')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('prdContent');
    });

    it('should accept styling options', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: {},
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/prototype')
        .send({
          prdContent: 'PRD content',
          styleFramework: 'tailwind',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/generate/analyze-features', () => {
    it('should analyze feature list and extract keywords', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: {
          keywords: ['authentication', 'dashboard', 'api'],
          categories: { core: ['auth'], enhancement: ['dashboard'] },
        },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/analyze-features')
        .send({
          featureList: ['User authentication', 'Admin dashboard', 'API integration'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing featureList', async () => {
      const response = await request(app)
        .post('/api/generate/analyze-features')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('featureList');
    });

    it('should handle empty feature list', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { keywords: [], categories: {} },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/analyze-features')
        .send({
          featureList: [],
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/generate/modify', () => {
    it('should modify document based on instructions', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { document: '# Modified Document\n...' },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/modify')
        .send({
          originalContent: '# Original Document\nContent here',
          modificationInstructions: 'Add a security section',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing originalContent', async () => {
      const response = await request(app)
        .post('/api/generate/modify')
        .send({
          modificationInstructions: 'Add section',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('originalContent');
    });

    it('should return 400 for missing modificationInstructions', async () => {
      const response = await request(app)
        .post('/api/generate/modify')
        .send({
          originalContent: 'Document content',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('modificationInstructions');
    });

    it('should accept document type parameter', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: {},
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/modify')
        .send({
          originalContent: 'Doc',
          modificationInstructions: 'Update',
          documentType: 'design-document',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/generate/status', () => {
    it('should return generation status', async () => {
      const response = await request(app)
        .get('/api/generate/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });

    it('should include service health information', async () => {
      const response = await request(app)
        .get('/api/generate/status');

      expect(response.body).toHaveProperty('healthy');
    });
  });

  describe('GET /api/generate/history/:projectId', () => {
    it('should return generation history for project', async () => {
      const response = await request(app)
        .get('/api/generate/history/project-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });

    it('should return empty array for project with no history', async () => {
      const response = await request(app)
        .get('/api/generate/history/new-project');

      expect(response.status).toBe(200);
      expect(response.body.history).toEqual([]);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/generate/history/project-123?page=1&limit=10');

      expect(response.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('should handle timeout errors for design document generation', async () => {
      const timeoutError = new Error('Process timed out');
      timeoutError.name = 'ClaudeCodeTimeoutError';
      mockClaudeCodeRunner.mockRejectedValue(timeoutError);

      const response = await request(app)
        .post('/api/generate/design-document')
        .send({
          qaResponses: [{ question: 'Q', answer: 'A' }],
        });

      expect(response.status).toBe(504);
    });

    it('should handle process errors for PRD generation', async () => {
      const processError = new Error('Process failed');
      processError.name = 'ClaudeCodeError';
      mockClaudeCodeRunner.mockRejectedValue(processError);

      const response = await request(app)
        .post('/api/generate/prd')
        .send({
          designDocContent: 'Content',
        });

      expect(response.status).toBe(500);
    });
  });
});
