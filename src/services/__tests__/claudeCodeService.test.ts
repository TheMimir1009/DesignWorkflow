/**
 * Test Suite: claudeCodeService
 * TDD implementation for Frontend API client
 *
 * Requirements covered:
 * - REQ-U-004: Frontend API client for Claude Code integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  claudeCodeService,
  generateCode,
  generateComponent,
  reviewCode,
  optimizeCode,
  analyzeCode,
  type GenerateCodeRequest,
  type GenerateComponentRequest,
  type ReviewCodeRequest,
  type OptimizeCodeRequest,
  type AnalyzeCodeRequest,
  type AIGenerationResponse,
} from '../claudeCodeService.ts';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('claudeCodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCode', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { code: 'function test() {}' },
          }),
      });

      const request: GenerateCodeRequest = {
        description: 'Create a test function',
        language: 'typescript',
      };

      await generateCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/code',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );
    });

    it('should return generated code on success', async () => {
      const mockResponse: AIGenerationResponse = {
        success: true,
        data: { code: 'const hello = () => "world";' },
        rawOutput: '{"code": "const hello = () => \\"world\\";"}',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generateCode({
        description: 'Create hello function',
        language: 'typescript',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      await expect(
        generateCode({ description: 'test', language: 'typescript' })
      ).rejects.toThrow();
    });

    it('should include optional parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: GenerateCodeRequest = {
        description: 'Create function',
        language: 'typescript',
        additionalContext: 'Use async/await',
        workingDir: '/project',
      };

      await generateCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/code',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('generateComponent', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: GenerateComponentRequest = {
        description: 'Create a button',
        language: 'tsx',
        framework: 'react',
      };

      await generateComponent(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/component',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should return component code on success', async () => {
      const mockResponse: AIGenerationResponse = {
        success: true,
        data: { code: 'export function Button() {}' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generateComponent({
        description: 'Create button',
        language: 'tsx',
        framework: 'react',
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('reviewCode', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: ReviewCodeRequest = {
        code: 'const x = 1;',
        language: 'javascript',
      };

      await reviewCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/review',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should include focus areas when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: ReviewCodeRequest = {
        code: 'const data = fetch(url);',
        language: 'typescript',
        focusAreas: ['security', 'error-handling'],
      };

      await reviewCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/review',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('optimizeCode', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: OptimizeCodeRequest = {
        code: 'for(let i=0; i<arr.length; i++) {}',
        language: 'javascript',
      };

      await optimizeCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/optimize',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should include optimization targets when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: OptimizeCodeRequest = {
        code: 'const sum = arr.reduce((a,b) => a+b);',
        language: 'typescript',
        targets: ['performance', 'memory'],
      };

      await optimizeCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/optimize',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('analyzeCode', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: AnalyzeCodeRequest = {
        code: 'class UserService {}',
        language: 'typescript',
      };

      await analyzeCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/analyze',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should include analysis aspects when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: AnalyzeCodeRequest = {
        code: 'const app = express();',
        language: 'javascript',
        aspects: ['architecture', 'security', 'patterns'],
      };

      await analyzeCode(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/analyze',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        generateCode({ description: 'test', language: 'typescript' })
      ).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 504,
        json: () => Promise.resolve({ error: 'timeout' }),
      });

      await expect(
        generateCode({ description: 'test', language: 'typescript' })
      ).rejects.toThrow();
    });

    it('should include error details in thrown error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Missing required field' }),
      });

      try {
        await generateCode({ description: 'test', language: '' as string });
      } catch (error) {
        expect((error as Error).message).toContain('Missing required field');
      }
    });
  });

  describe('claudeCodeService object', () => {
    it('should expose all API methods', () => {
      expect(claudeCodeService.generateCode).toBeDefined();
      expect(claudeCodeService.generateComponent).toBeDefined();
      expect(claudeCodeService.reviewCode).toBeDefined();
      expect(claudeCodeService.optimizeCode).toBeDefined();
      expect(claudeCodeService.analyzeCode).toBeDefined();
    });
  });
});
