/**
 * Test Suite: claudeCodeService Document Generation Functions
 * TDD implementation for Frontend API client document generation
 *
 * Requirements covered:
 * - REQ-U-005: Frontend API client for document generation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateDesignDocument,
  generatePRD,
  generatePrototype,
  analyzeFeatures,
  modifyDocument,
  getGenerationStatus,
  getGenerationHistory,
  type GenerateDesignDocumentRequest,
  type GeneratePRDRequest,
  type GeneratePrototypeRequest,
  type AnalyzeFeaturesRequest,
  type ModifyDocumentRequest,
  type DocumentGenerationResponse,
} from '../claudeCodeService.ts';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('claudeCodeService - Document Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateDesignDocument', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: { document: '# Design Document' },
          }),
      });

      const request: GenerateDesignDocumentRequest = {
        qaResponses: [
          { question: 'Project name?', answer: 'TaskFlow' },
        ],
      };

      await generateDesignDocument(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/design-document',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );
    });

    it('should return generated design document on success', async () => {
      const mockResponse: DocumentGenerationResponse = {
        success: true,
        data: { document: '# Design Document\n## Overview' },
        rawOutput: '{"document": "..."}',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generateDesignDocument({
        qaResponses: [{ question: 'Q', answer: 'A' }],
      });

      expect(result).toEqual(mockResponse);
    });

    it('should include reference systems when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: GenerateDesignDocumentRequest = {
        qaResponses: [{ question: 'Q', answer: 'A' }],
        referenceSystemIds: [
          { id: 'sys-001', name: 'Auth', description: 'JWT auth' },
        ],
      };

      await generateDesignDocument(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/design-document',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal error' }),
      });

      await expect(
        generateDesignDocument({
          qaResponses: [{ question: 'Q', answer: 'A' }],
        })
      ).rejects.toThrow();
    });
  });

  describe('generatePRD', () => {
    it('should call API with design document content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: GeneratePRDRequest = {
        designDocContent: '# Design Document\nContent here',
      };

      await generatePRD(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/prd',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should return generated PRD on success', async () => {
      const mockResponse: DocumentGenerationResponse = {
        success: true,
        data: { document: '# PRD\n## Requirements' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generatePRD({
        designDocContent: 'Design doc',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should include project context when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: GeneratePRDRequest = {
        designDocContent: 'Design doc',
        projectContext: 'Enterprise application',
      };

      await generatePRD(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/prd',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('generatePrototype', () => {
    it('should call API with PRD content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: GeneratePrototypeRequest = {
        prdContent: '# PRD\n## Features',
      };

      await generatePrototype(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/prototype',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should return generated prototype HTML on success', async () => {
      const mockResponse: DocumentGenerationResponse = {
        success: true,
        data: { html: '<!DOCTYPE html><html>...</html>' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generatePrototype({
        prdContent: 'PRD content',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should include style framework when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: GeneratePrototypeRequest = {
        prdContent: 'PRD',
        styleFramework: 'tailwind',
      };

      await generatePrototype(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/prototype',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('analyzeFeatures', () => {
    it('should call API with feature list', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: AnalyzeFeaturesRequest = {
        featureList: ['Authentication', 'Dashboard'],
      };

      await analyzeFeatures(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/analyze-features',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should return keywords and categories on success', async () => {
      const mockResponse: DocumentGenerationResponse = {
        success: true,
        data: {
          keywords: ['auth', 'dashboard'],
          categories: { core: ['auth'] },
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await analyzeFeatures({
        featureList: ['Authentication', 'Dashboard'],
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('modifyDocument', () => {
    it('should call API with original content and instructions', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: ModifyDocumentRequest = {
        originalContent: '# Document',
        modificationInstructions: 'Add security section',
      };

      await modifyDocument(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/modify',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('should return modified document on success', async () => {
      const mockResponse: DocumentGenerationResponse = {
        success: true,
        data: { document: '# Modified Document\n## Security' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await modifyDocument({
        originalContent: 'Doc',
        modificationInstructions: 'Add security',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should include document type when provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const request: ModifyDocumentRequest = {
        originalContent: 'Doc',
        modificationInstructions: 'Update',
        documentType: 'prd',
      };

      await modifyDocument(request);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/modify',
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });
  });

  describe('getGenerationStatus', () => {
    it('should call status endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'healthy',
            healthy: true,
          }),
      });

      await getGenerationStatus();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/status',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return status information', async () => {
      const mockResponse = {
        status: 'healthy',
        healthy: true,
        version: '1.0.0',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getGenerationStatus();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getGenerationHistory', () => {
    it('should call history endpoint with project ID', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            history: [],
          }),
      });

      await getGenerationHistory('project-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/history/project-123',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return history array', async () => {
      const mockResponse = {
        history: [
          { id: 'gen-1', type: 'design-document', createdAt: '2024-01-01' },
          { id: 'gen-2', type: 'prd', createdAt: '2024-01-02' },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getGenerationHistory('project-123');

      expect(result.history).toHaveLength(2);
    });

    it('should support pagination parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ history: [] }),
      });

      await getGenerationHistory('project-123', { page: 2, limit: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/history/project-123?page=2&limit=20',
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        generateDesignDocument({
          qaResponses: [{ question: 'Q', answer: 'A' }],
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 504,
        json: () => Promise.resolve({ error: 'Gateway timeout' }),
      });

      await expect(
        generatePRD({ designDocContent: 'Doc' })
      ).rejects.toThrow();
    });
  });
});
