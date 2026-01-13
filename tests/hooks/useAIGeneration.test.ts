/**
 * useAIGeneration Hook Tests
 * TDD test suite for LLM Provider Configuration Integration (SPEC-DEBUG-004)
 *
 * Test Coverage:
 * - REQ-LLM-004: System must send projectId and taskId when generating design document
 * - REQ-LLM-005: System must send projectId and taskId when generating PRD
 * - REQ-LLM-006: System must send projectId and taskId when generating prototype
 * - REQ-LLM-012: When projectId is provided and valid, system must use project's LLM provider
 * - REQ-LLM-013: When projectId is null/undefined, system must use default provider
 * - REQ-LLM-014: When taskId is provided, system must include it in request
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIGeneration } from '../../src/hooks/useAIGeneration';
import * as claudeCodeService from '../../src/services/claudeCodeService';
import type {
  GenerateDesignDocumentRequest,
  GeneratePRDRequest,
  GeneratePrototypeRequest,
} from '../../src/services/claudeCodeService';

// Mock the claudeCodeService
vi.mock('../../src/services/claudeCodeService', () => ({
  generateDesignDocument: vi.fn(),
  generatePRD: vi.fn(),
  generatePrototype: vi.fn(),
  generateCode: vi.fn(),
  generateComponent: vi.fn(),
  reviewCode: vi.fn(),
  optimizeCode: vi.fn(),
  analyzeCode: vi.fn(),
  analyzeFeatures: vi.fn(),
  modifyDocument: vi.fn(),
  getGenerationStatus: vi.fn(),
  getGenerationHistory: vi.fn(),
}));

// Mock data factories
const createMockSuccessResponse = (data: unknown) => ({
  success: true,
  data,
  rawOutput: typeof data === 'string' ? data : undefined,
  error: undefined,
});

const createDesignDocumentRequest = (
  overrides: Partial<GenerateDesignDocumentRequest> = {}
): GenerateDesignDocumentRequest => ({
  qaResponses: [
    { question: 'What is the goal?', answer: 'Build a game' },
  ],
  referenceSystemIds: [],
  workingDir: '/test',
  ...overrides,
});

const createPRDRequest = (
  overrides: Partial<GeneratePRDRequest> = {}
): GeneratePRDRequest => ({
  designDocContent: 'Design document content',
  projectContext: 'Game project',
  workingDir: '/test',
  ...overrides,
});

const createPrototypeRequest = (
  overrides: Partial<GeneratePrototypeRequest> = {}
): GeneratePrototypeRequest => ({
  prdContent: 'PRD content',
  styleFramework: 'Tailwind',
  workingDir: '/test',
  ...overrides,
});

describe('useAIGeneration - LLM Provider Configuration (SPEC-DEBUG-004)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDesignDocument', () => {
    it('should accept projectId and taskId parameters', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated design doc' });
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue(
        mockResponse as any
      );

      const { result } = renderHook(() => useAIGeneration());

      const request = createDesignDocumentRequest();
      const projectId = 'project-123';
      const taskId = 'task-456';

      await act(async () => {
        await result.current.generateDesignDocument(request, projectId, taskId);
      });

      expect(claudeCodeService.generateDesignDocument).toHaveBeenCalledWith({
        ...request,
        projectId,
        taskId,
      });
    });

    it('should work without projectId and taskId (backward compatibility)', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated design doc' });
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue(
        mockResponse as any
      );

      const { result } = renderHook(() => useAIGeneration());

      const request = createDesignDocumentRequest();

      await act(async () => {
        await result.current.generateDesignDocument(request);
      });

      expect(claudeCodeService.generateDesignDocument).toHaveBeenCalledWith(request);
    });

    it('should accept only projectId', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated design doc' });
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue(
        mockResponse as any
      );

      const { result } = renderHook(() => useAIGeneration());

      const request = createDesignDocumentRequest();
      const projectId = 'project-123';

      await act(async () => {
        await result.current.generateDesignDocument(request, projectId);
      });

      expect(claudeCodeService.generateDesignDocument).toHaveBeenCalledWith({
        ...request,
        projectId,
      });
    });

    it('should accept only taskId', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated design doc' });
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue(
        mockResponse as any
      );

      const { result } = renderHook(() => useAIGeneration());

      const request = createDesignDocumentRequest();
      const taskId = 'task-456';

      await act(async () => {
        await result.current.generateDesignDocument(request, undefined, taskId);
      });

      expect(claudeCodeService.generateDesignDocument).toHaveBeenCalledWith({
        ...request,
        taskId,
      });
    });

    it('should update state correctly on success', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated design doc' });
      vi.mocked(claudeCodeService.generateDesignDocument).mockResolvedValue(
        mockResponse as any
      );

      const { result } = renderHook(() => useAIGeneration());

      const request = createDesignDocumentRequest();
      const projectId = 'project-123';
      const taskId = 'task-456';

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.generateDesignDocument(request, projectId, taskId);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.result).toEqual(mockResponse);
      });
    });

    it('should handle errors correctly', async () => {
      const mockError = new Error('API Error');
      vi.mocked(claudeCodeService.generateDesignDocument).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIGeneration());

      const request = createDesignDocumentRequest();

      await act(async () => {
        await result.current.generateDesignDocument(request);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toEqual(mockError);
        expect(result.current.result).toBe(null);
      });
    });
  });

  describe('generatePRD', () => {
    it('should accept projectId and taskId parameters', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated PRD' });
      vi.mocked(claudeCodeService.generatePRD).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPRDRequest();
      const projectId = 'project-123';
      const taskId = 'task-456';

      await act(async () => {
        await result.current.generatePRD(request, projectId, taskId);
      });

      expect(claudeCodeService.generatePRD).toHaveBeenCalledWith({
        ...request,
        projectId,
        taskId,
      });
    });

    it('should work without projectId and taskId (backward compatibility)', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated PRD' });
      vi.mocked(claudeCodeService.generatePRD).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPRDRequest();

      await act(async () => {
        await result.current.generatePRD(request);
      });

      expect(claudeCodeService.generatePRD).toHaveBeenCalledWith(request);
    });

    it('should accept only projectId', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated PRD' });
      vi.mocked(claudeCodeService.generatePRD).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPRDRequest();
      const projectId = 'project-123';

      await act(async () => {
        await result.current.generatePRD(request, projectId);
      });

      expect(claudeCodeService.generatePRD).toHaveBeenCalledWith({
        ...request,
        projectId,
      });
    });

    it('should accept only taskId', async () => {
      const mockResponse = createMockSuccessResponse({ document: 'Generated PRD' });
      vi.mocked(claudeCodeService.generatePRD).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPRDRequest();
      const taskId = 'task-456';

      await act(async () => {
        await result.current.generatePRD(request, undefined, taskId);
      });

      expect(claudeCodeService.generatePRD).toHaveBeenCalledWith({
        ...request,
        taskId,
      });
    });
  });

  describe('generatePrototype', () => {
    it('should accept projectId and taskId parameters', async () => {
      const mockResponse = createMockSuccessResponse({ document: '<html>Prototype</html>' });
      vi.mocked(claudeCodeService.generatePrototype).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPrototypeRequest();
      const projectId = 'project-123';
      const taskId = 'task-456';

      await act(async () => {
        await result.current.generatePrototype(request, projectId, taskId);
      });

      expect(claudeCodeService.generatePrototype).toHaveBeenCalledWith({
        ...request,
        projectId,
        taskId,
      });
    });

    it('should work without projectId and taskId (backward compatibility)', async () => {
      const mockResponse = createMockSuccessResponse({ document: '<html>Prototype</html>' });
      vi.mocked(claudeCodeService.generatePrototype).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPrototypeRequest();

      await act(async () => {
        await result.current.generatePrototype(request);
      });

      expect(claudeCodeService.generatePrototype).toHaveBeenCalledWith(request);
    });

    it('should accept only projectId', async () => {
      const mockResponse = createMockSuccessResponse({ document: '<html>Prototype</html>' });
      vi.mocked(claudeCodeService.generatePrototype).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPrototypeRequest();
      const projectId = 'project-123';

      await act(async () => {
        await result.current.generatePrototype(request, projectId);
      });

      expect(claudeCodeService.generatePrototype).toHaveBeenCalledWith({
        ...request,
        projectId,
      });
    });

    it('should accept only taskId', async () => {
      const mockResponse = createMockSuccessResponse({ document: '<html>Prototype</html>' });
      vi.mocked(claudeCodeService.generatePrototype).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useAIGeneration());

      const request = createPrototypeRequest();
      const taskId = 'task-456';

      await act(async () => {
        await result.current.generatePrototype(request, undefined, taskId);
      });

      expect(claudeCodeService.generatePrototype).toHaveBeenCalledWith({
        ...request,
        taskId,
      });
    });
  });

  describe('UseAIGenerationReturn interface', () => {
    it('should provide all expected functions and state', () => {
      const { result } = renderHook(() => useAIGeneration());

      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('result');
      expect(result.current).toHaveProperty('generateCode');
      expect(result.current).toHaveProperty('generateComponent');
      expect(result.current).toHaveProperty('reviewCode');
      expect(result.current).toHaveProperty('optimizeCode');
      expect(result.current).toHaveProperty('analyzeCode');
      expect(result.current).toHaveProperty('generateDesignDocument');
      expect(result.current).toHaveProperty('generatePRD');
      expect(result.current).toHaveProperty('generatePrototype');
      expect(result.current).toHaveProperty('analyzeFeatures');
      expect(result.current).toHaveProperty('modifyDocument');
      expect(result.current).toHaveProperty('getGenerationStatus');
      expect(result.current).toHaveProperty('getGenerationHistory');
      expect(result.current).toHaveProperty('reset');
      expect(result.current).toHaveProperty('clearError');

      expect(typeof result.current.generateDesignDocument).toBe('function');
      expect(typeof result.current.generatePRD).toBe('function');
      expect(typeof result.current.generatePrototype).toBe('function');
    });
  });
});
