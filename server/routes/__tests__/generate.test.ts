/**
 * Test Suite: generate.ts API routes
 * TDD implementation for AI generation endpoints
 *
 * Requirements covered:
 * - REQ-E-001: Generate code endpoint
 * - REQ-E-002: Generate component endpoint
 * - REQ-E-003: Review code endpoint
 * - REQ-E-004: Optimize code endpoint
 * - REQ-E-005: Analyze code endpoint
 * - REQ-S-001: API authentication/authorization
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

describe('generate API routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
    setClaudeCodeRunner(mockClaudeCodeRunner);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/generate/code', () => {
    it('should generate code successfully', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { code: 'function hello() {}' },
        rawOutput: '{"code": "function hello() {}"}',
      });

      const response = await request(app)
        .post('/api/generate/code')
        .send({
          description: 'Create a hello function',
          language: 'typescript',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app)
        .post('/api/generate/code')
        .send({
          language: 'typescript',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('description');
    });

    it('should return 400 for missing language', async () => {
      const response = await request(app)
        .post('/api/generate/code')
        .send({
          description: 'Create a function',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('language');
    });

    it('should handle Claude Code execution errors', async () => {
      mockClaudeCodeRunner.mockRejectedValue(new Error('Claude Code failed'));

      const response = await request(app)
        .post('/api/generate/code')
        .send({
          description: 'Create a function',
          language: 'typescript',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/generate/component', () => {
    it('should generate component successfully', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { code: 'export function Button() {}' },
        rawOutput: '{"code": "export function Button() {}"}',
      });

      const response = await request(app)
        .post('/api/generate/component')
        .send({
          description: 'Create a button component',
          language: 'tsx',
          framework: 'react',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing framework', async () => {
      const response = await request(app)
        .post('/api/generate/component')
        .send({
          description: 'Create a button',
          language: 'tsx',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('framework');
    });
  });

  describe('POST /api/generate/review', () => {
    it('should review code successfully', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { issues: [], suggestions: [] },
        rawOutput: '{"issues": [], "suggestions": []}',
      });

      const response = await request(app)
        .post('/api/generate/review')
        .send({
          code: 'function add(a, b) { return a + b; }',
          language: 'javascript',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/generate/review')
        .send({
          language: 'javascript',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('code');
    });

    it('should accept optional focus areas', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { issues: [] },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/review')
        .send({
          code: 'const x = 1;',
          language: 'typescript',
          focusAreas: ['security', 'performance'],
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/generate/optimize', () => {
    it('should optimize code successfully', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { optimizedCode: 'const sum = arr.reduce((a, b) => a + b, 0);' },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/optimize')
        .send({
          code: 'let sum = 0; for(let i=0; i<arr.length; i++) sum += arr[i];',
          language: 'javascript',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/generate/optimize')
        .send({
          language: 'javascript',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('code');
    });

    it('should accept optimization targets', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: {},
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/optimize')
        .send({
          code: 'const x = 1;',
          language: 'typescript',
          targets: ['performance', 'memory'],
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/generate/analyze', () => {
    it('should analyze code successfully', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: { complexity: 'low', patterns: [] },
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/analyze')
        .send({
          code: 'class UserService {}',
          language: 'typescript',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/generate/analyze')
        .send({
          language: 'typescript',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('code');
    });

    it('should accept analysis aspects', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: {},
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/analyze')
        .send({
          code: 'const app = express();',
          language: 'javascript',
          aspects: ['architecture', 'security'],
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('should handle timeout errors gracefully', async () => {
      const timeoutError = new Error('Claude Code process timed out');
      timeoutError.name = 'ClaudeCodeTimeoutError';
      mockClaudeCodeRunner.mockRejectedValue(timeoutError);

      const response = await request(app)
        .post('/api/generate/code')
        .send({
          description: 'Create a function',
          language: 'typescript',
        });

      expect(response.status).toBe(504);
      expect(response.body.error).toContain('timeout');
    });

    it('should handle process errors gracefully', async () => {
      const processError = new Error('Failed to spawn Claude Code process');
      processError.name = 'ClaudeCodeError';
      mockClaudeCodeRunner.mockRejectedValue(processError);

      const response = await request(app)
        .post('/api/generate/code')
        .send({
          description: 'Create a function',
          language: 'typescript',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('Request validation', () => {
    it('should reject invalid JSON', async () => {
      const response = await request(app)
        .post('/api/generate/code')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should accept working directory parameter', async () => {
      mockClaudeCodeRunner.mockResolvedValue({
        success: true,
        output: {},
        rawOutput: '{}',
      });

      const response = await request(app)
        .post('/api/generate/code')
        .send({
          description: 'Create a function',
          language: 'typescript',
          workingDir: '/path/to/project',
        });

      expect(response.status).toBe(200);
      expect(mockClaudeCodeRunner).toHaveBeenCalledWith(
        expect.any(String),
        '/path/to/project',
        expect.any(Object)
      );
    });
  });
});
