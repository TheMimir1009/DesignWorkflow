/**
 * Test Suite: useAIGeneration Document Generation Extensions
 * TDD implementation for document generation hook methods
 *
 * Requirements covered:
 * - REQ-U-006: Hook methods for document generation
 * - REQ-N-003: Loading state management for document operations
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIGeneration } from '../useAIGeneration.ts';
import * as claudeCodeService from '../../services/claudeCodeService.ts';

// Mock claudeCodeService
vi.mock('../../services/claudeCodeService.ts', () => ({
  generateCode: vi.fn(),
  generateComponent: vi.fn(),
  reviewCode: vi.fn(),
  optimizeCode: vi.fn(),
  analyzeCode: vi.fn(),
  generateDesignDocument: vi.fn(),
  generatePRD: vi.fn(),
  generatePrototype: vi.fn(),
  analyzeFeatures: vi.fn(),
  modifyDocument: vi.fn(),
  getGenerationStatus: vi.fn(),
  getGenerationHistory: vi.fn(),
}));

describe('useAIGeneration - Document Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateDesignDocument', () => {
    it('should set loading state during document generation', async () => {
      const mockResponse = { success: true, data: { document: '# Design Doc' } };
      vi.mocked(claudeCodeService.generateDesignDocument).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const { result } = renderHook(() => useAIGeneration());

      let loadingDuringExecution = false;

      act(() => {
        result.current.generateDesignDocument({
          qaResponses: [{ question: 'Q', answer: 'A' }],
        });
      });

      loadingDuringExecution = result.current.isLoading;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(loadingDuringExecution).toBe(true);
    });

    it('should return design document on success', async () => {
      const mockResponse = {
        success: true,
        data: { document: '# Design Document\n## Overview' },
      };
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateDesignDocument({
          qaResponses: [
            { question: 'Project name?', answer: 'TaskFlow' },
          ],
        });
      });

      expect(result.current.result).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it('should set error on failure', async () => {
      const mockError = new Error('Generation failed');
      vi.mocked(claudeCodeService.generateDesignDocument).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateDesignDocument({
          qaResponses: [{ question: 'Q', answer: 'A' }],
        });
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.result).toBeNull();
    });

    it('should call service with reference systems', async () => {
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        qaResponses: [{ question: 'Q', answer: 'A' }],
        referenceSystemIds: [
          { id: 'sys-001', name: 'Auth', description: 'JWT auth' },
        ],
      };

      await act(async () => {
        await result.current.generateDesignDocument(request);
      });

      expect(claudeCodeService.generateDesignDocument).toHaveBeenCalledWith(request);
    });
  });

  describe('generatePRD', () => {
    it('should generate PRD successfully', async () => {
      const mockResponse = {
        success: true,
        data: { document: '# PRD\n## Requirements' },
      };
      vi.mocked(claudeCodeService.generatePRD).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generatePRD({
          designDocContent: '# Design Doc\nContent here',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should handle PRD generation error', async () => {
      const mockError = new Error('PRD generation failed');
      vi.mocked(claudeCodeService.generatePRD).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generatePRD({
          designDocContent: 'Design doc',
        });
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should pass project context to service', async () => {
      vi.mocked(claudeCodeService.generatePRD).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        designDocContent: 'Design doc',
        projectContext: 'Enterprise project',
      };

      await act(async () => {
        await result.current.generatePRD(request);
      });

      expect(claudeCodeService.generatePRD).toHaveBeenCalledWith(request);
    });
  });

  describe('generatePrototype', () => {
    it('should generate prototype successfully', async () => {
      const mockResponse = {
        success: true,
        data: { html: '<!DOCTYPE html><html>...</html>' },
      };
      vi.mocked(claudeCodeService.generatePrototype).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generatePrototype({
          prdContent: '# PRD\n## Features',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should handle prototype generation error', async () => {
      const mockError = new Error('Prototype generation failed');
      vi.mocked(claudeCodeService.generatePrototype).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generatePrototype({
          prdContent: 'PRD content',
        });
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should pass style framework to service', async () => {
      vi.mocked(claudeCodeService.generatePrototype).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        prdContent: 'PRD',
        styleFramework: 'tailwind',
      };

      await act(async () => {
        await result.current.generatePrototype(request);
      });

      expect(claudeCodeService.generatePrototype).toHaveBeenCalledWith(request);
    });
  });

  describe('analyzeFeatures', () => {
    it('should analyze features successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          keywords: ['auth', 'dashboard'],
          categories: { core: ['auth'] },
        },
      };
      vi.mocked(claudeCodeService.analyzeFeatures).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.analyzeFeatures({
          featureList: ['Authentication', 'Dashboard'],
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should handle feature analysis error', async () => {
      const mockError = new Error('Analysis failed');
      vi.mocked(claudeCodeService.analyzeFeatures).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.analyzeFeatures({
          featureList: ['Feature 1'],
        });
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('modifyDocument', () => {
    it('should modify document successfully', async () => {
      const mockResponse = {
        success: true,
        data: { document: '# Modified Document' },
      };
      vi.mocked(claudeCodeService.modifyDocument).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.modifyDocument({
          originalContent: '# Original',
          modificationInstructions: 'Add security section',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should handle modification error', async () => {
      const mockError = new Error('Modification failed');
      vi.mocked(claudeCodeService.modifyDocument).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.modifyDocument({
          originalContent: 'Doc',
          modificationInstructions: 'Update',
        });
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should pass document type to service', async () => {
      vi.mocked(claudeCodeService.modifyDocument).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        originalContent: 'Doc',
        modificationInstructions: 'Update',
        documentType: 'prd' as const,
      };

      await act(async () => {
        await result.current.modifyDocument(request);
      });

      expect(claudeCodeService.modifyDocument).toHaveBeenCalledWith(request);
    });
  });

  describe('getGenerationStatus', () => {
    it('should get status without affecting loading state', async () => {
      vi.mocked(claudeCodeService.getGenerationStatus).mockResolvedValue({
        status: 'healthy',
        healthy: true,
      });

      const { result } = renderHook(() => useAIGeneration());

      let statusResult: unknown;
      await act(async () => {
        statusResult = await result.current.getGenerationStatus();
      });

      expect(statusResult).toEqual({ status: 'healthy', healthy: true });
      // Status check should not affect main loading state
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('getGenerationHistory', () => {
    it('should get history for project', async () => {
      const mockHistory = {
        history: [
          { id: 'gen-1', type: 'design-document', createdAt: '2024-01-01' },
        ],
      };
      vi.mocked(claudeCodeService.getGenerationHistory).mockResolvedValue(mockHistory);

      const { result } = renderHook(() => useAIGeneration());

      let historyResult: unknown;
      await act(async () => {
        historyResult = await result.current.getGenerationHistory('project-123');
      });

      expect(historyResult).toEqual(mockHistory);
    });

    it('should pass pagination parameters', async () => {
      vi.mocked(claudeCodeService.getGenerationHistory).mockResolvedValue({
        history: [],
      });

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.getGenerationHistory('project-123', { page: 2, limit: 20 });
      });

      expect(claudeCodeService.getGenerationHistory).toHaveBeenCalledWith(
        'project-123',
        { page: 2, limit: 20 }
      );
    });
  });

  describe('concurrent document operations', () => {
    it('should handle sequential document generations correctly', async () => {
      vi.mocked(claudeCodeService.generateDesignDocument)
        .mockResolvedValueOnce({ success: true, data: { document: 'First' } })
        .mockResolvedValueOnce({ success: true, data: { document: 'Second' } });

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateDesignDocument({
          qaResponses: [{ question: 'Q1', answer: 'A1' }],
        });
      });

      expect(result.current.result?.data).toEqual({ document: 'First' });

      await act(async () => {
        await result.current.generateDesignDocument({
          qaResponses: [{ question: 'Q2', answer: 'A2' }],
        });
      });

      expect(result.current.result?.data).toEqual({ document: 'Second' });
    });
  });

  describe('reset clears document results', () => {
    it('should clear document generation results on reset', async () => {
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue({
        success: true,
        data: { document: 'Generated doc' },
      });

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateDesignDocument({
          qaResponses: [{ question: 'Q', answer: 'A' }],
        });
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
