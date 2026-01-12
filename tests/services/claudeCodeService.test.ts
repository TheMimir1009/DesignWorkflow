/**
 * Claude Code Service Tests
 * TDD test suite for LLM Provider Configuration Integration (SPEC-DEBUG-004)
 *
 * Test Coverage:
 * - REQ-LLM-001: System must send projectId with all generation requests
 * - REQ-LLM-002: System must send taskId with all generation requests
 * - REQ-LLM-003: System must maintain backward compatibility
 * - REQ-LLM-011: System must not break existing API contracts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateDesignDocument,
  generatePRD,
  generatePrototype,
  makeRequest,
  ClaudeCodeServiceError,
  type GenerateDesignDocumentRequest,
  type GeneratePRDRequest,
  type GeneratePrototypeRequest,
  type DocumentGenerationResponse,
} from '../../src/services/claudeCodeService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test data factories
const createMockResponse = (success = true, data?: unknown, error?: string): DocumentGenerationResponse => ({
  success,
  data,
  rawOutput: typeof data === 'string' ? data : undefined,
  error,
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

describe('claudeCodeService - LLM Provider Configuration (SPEC-DEBUG-004)', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Interface Type Definitions', () => {
    describe('GenerateDesignDocumentRequest', () => {
      it('should accept projectId as optional field', () => {
        const requestWithProjectId: GenerateDesignDocumentRequest = {
          ...createDesignDocumentRequest(),
          projectId: 'project-123',
        };

        expect(requestWithProjectId.projectId).toBe('project-123');
      });

      it('should accept taskId as optional field', () => {
        const requestWithTaskId: GenerateDesignDocumentRequest = {
          ...createDesignDocumentRequest(),
          taskId: 'task-456',
        };

        expect(requestWithTaskId.taskId).toBe('task-456');
      });

      it('should accept both projectId and taskId', () => {
        const requestWithBoth: GenerateDesignDocumentRequest = {
          ...createDesignDocumentRequest(),
          projectId: 'project-123',
          taskId: 'task-456',
        };

        expect(requestWithBoth.projectId).toBe('project-123');
        expect(requestWithBoth.taskId).toBe('task-456');
      });

      it('should work without projectId and taskId (backward compatibility)', () => {
        const requestWithout: GenerateDesignDocumentRequest = createDesignDocumentRequest();

        expect(requestWithout.projectId).toBeUndefined();
        expect(requestWithout.taskId).toBeUndefined();
      });
    });

    describe('GeneratePRDRequest', () => {
      it('should accept projectId as optional field', () => {
        const requestWithProjectId: GeneratePRDRequest = {
          ...createPRDRequest(),
          projectId: 'project-123',
        };

        expect(requestWithProjectId.projectId).toBe('project-123');
      });

      it('should accept taskId as optional field', () => {
        const requestWithTaskId: GeneratePRDRequest = {
          ...createPRDRequest(),
          taskId: 'task-456',
        };

        expect(requestWithTaskId.taskId).toBe('task-456');
      });

      it('should accept both projectId and taskId', () => {
        const requestWithBoth: GeneratePRDRequest = {
          ...createPRDRequest(),
          projectId: 'project-123',
          taskId: 'task-456',
        };

        expect(requestWithBoth.projectId).toBe('project-123');
        expect(requestWithBoth.taskId).toBe('task-456');
      });

      it('should work without projectId and taskId (backward compatibility)', () => {
        const requestWithout: GeneratePRDRequest = createPRDRequest();

        expect(requestWithout.projectId).toBeUndefined();
        expect(requestWithout.taskId).toBeUndefined();
      });
    });

    describe('GeneratePrototypeRequest', () => {
      it('should accept projectId as optional field', () => {
        const requestWithProjectId: GeneratePrototypeRequest = {
          ...createPrototypeRequest(),
          projectId: 'project-123',
        };

        expect(requestWithProjectId.projectId).toBe('project-123');
      });

      it('should accept taskId as optional field', () => {
        const requestWithTaskId: GeneratePrototypeRequest = {
          ...createPrototypeRequest(),
          taskId: 'task-456',
        };

        expect(requestWithTaskId.taskId).toBe('task-456');
      });

      it('should accept both projectId and taskId', () => {
        const requestWithBoth: GeneratePrototypeRequest = {
          ...createPrototypeRequest(),
          projectId: 'project-123',
          taskId: 'task-456',
        };

        expect(requestWithBoth.projectId).toBe('project-123');
        expect(requestWithBoth.taskId).toBe('task-456');
      });

      it('should work without projectId and taskId (backward compatibility)', () => {
        const requestWithout: GeneratePrototypeRequest = createPrototypeRequest();

        expect(requestWithout.projectId).toBeUndefined();
        expect(requestWithout.taskId).toBeUndefined();
      });
    });
  });

  describe('makeRequest', () => {
    it('should include projectId in request body when provided', async () => {
      const mockResponse = createMockResponse(true, { result: 'success' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const requestBody = {
        field1: 'value1',
        projectId: 'project-123',
        taskId: 'task-456',
      };

      await makeRequest('/test-endpoint', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      // Verify the body was stringified with all fields
      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);
      expect(parsedBody).toEqual(requestBody);
      expect(parsedBody.projectId).toBe('project-123');
      expect(parsedBody.taskId).toBe('task-456');
    });

    it('should work without projectId and taskId (backward compatibility)', async () => {
      const mockResponse = createMockResponse(true, { result: 'success' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const requestBody = {
        field1: 'value1',
        field2: 'value2',
      };

      await makeRequest('/test-endpoint', requestBody);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);
      expect(parsedBody).toEqual(requestBody);
      expect(parsedBody.projectId).toBeUndefined();
      expect(parsedBody.taskId).toBeUndefined();
    });
  });

  describe('generateDesignDocument', () => {
    it('should send request with projectId and taskId to API', async () => {
      const mockResponse = createMockResponse(true, { document: 'Generated design doc' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request: GenerateDesignDocumentRequest = {
        ...createDesignDocumentRequest(),
        projectId: 'project-123',
        taskId: 'task-456',
      };

      const result = await generateDesignDocument(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);

      expect(parsedBody.projectId).toBe('project-123');
      expect(parsedBody.taskId).toBe('task-456');
      expect(result.success).toBe(true);
    });

    it('should work without projectId and taskId (backward compatibility)', async () => {
      const mockResponse = createMockResponse(true, { document: 'Generated design doc' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request = createDesignDocumentRequest();

      const result = await generateDesignDocument(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);

      expect(parsedBody.projectId).toBeUndefined();
      expect(parsedBody.taskId).toBeUndefined();
      expect(result.success).toBe(true);
    });

    it('should return response with success: false on API failure', async () => {
      const mockResponse = createMockResponse(false, undefined, 'Generation failed');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const request = createDesignDocumentRequest();

      const result = await generateDesignDocument(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Generation failed');
    });
  });

  describe('generatePRD', () => {
    it('should send request with projectId and taskId to API', async () => {
      const mockResponse = createMockResponse(true, { document: 'Generated PRD' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request: GeneratePRDRequest = {
        ...createPRDRequest(),
        projectId: 'project-123',
        taskId: 'task-456',
      };

      const result = await generatePRD(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);

      expect(parsedBody.projectId).toBe('project-123');
      expect(parsedBody.taskId).toBe('task-456');
      expect(result.success).toBe(true);
    });

    it('should work without projectId and taskId (backward compatibility)', async () => {
      const mockResponse = createMockResponse(true, { document: 'Generated PRD' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request = createPRDRequest();

      const result = await generatePRD(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);

      expect(parsedBody.projectId).toBeUndefined();
      expect(parsedBody.taskId).toBeUndefined();
      expect(result.success).toBe(true);
    });

    it('should return response with success: false on API failure', async () => {
      const mockResponse = createMockResponse(false, undefined, 'Generation failed');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const request = createPRDRequest();

      const result = await generatePRD(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Generation failed');
    });
  });

  describe('generatePrototype', () => {
    it('should send request with projectId and taskId to API', async () => {
      const mockResponse = createMockResponse(true, { document: '<html>Prototype</html>' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request: GeneratePrototypeRequest = {
        ...createPrototypeRequest(),
        projectId: 'project-123',
        taskId: 'task-456',
      };

      const result = await generatePrototype(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);

      expect(parsedBody.projectId).toBe('project-123');
      expect(parsedBody.taskId).toBe('task-456');
      expect(result.success).toBe(true);
    });

    it('should work without projectId and taskId (backward compatibility)', async () => {
      const mockResponse = createMockResponse(true, { document: '<html>Prototype</html>' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request = createPrototypeRequest();

      const result = await generatePrototype(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyArg = fetchCall[1]?.body as string;
      const parsedBody = JSON.parse(bodyArg);

      expect(parsedBody.projectId).toBeUndefined();
      expect(parsedBody.taskId).toBeUndefined();
      expect(result.success).toBe(true);
    });

    it('should return response with success: false on API failure', async () => {
      const mockResponse = createMockResponse(false, undefined, 'Generation failed');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const request = createPrototypeRequest();

      const result = await generatePrototype(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Generation failed');
    });
  });
});
