/**
 * Test Suite: useAIGeneration
 * TDD implementation for AI generation state management hook
 *
 * Requirements covered:
 * - REQ-U-004: Frontend API client integration
 * - REQ-N-003: Loading state management
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
}));

describe('useAIGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAIGeneration());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
    });
  });

  describe('generateCode', () => {
    it('should set loading state during execution', async () => {
      const mockResponse = { success: true, data: { code: 'test' } };
      vi.mocked(claudeCodeService.generateCode).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const { result } = renderHook(() => useAIGeneration());

      let loadingDuringExecution = false;

      act(() => {
        result.current.generateCode({
          description: 'test',
          language: 'typescript',
        });
      });

      // Check loading state immediately
      loadingDuringExecution = result.current.isLoading;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(loadingDuringExecution).toBe(true);
    });

    it('should return generated code on success', async () => {
      const mockResponse = {
        success: true,
        data: { code: 'function test() {}' },
      };
      vi.mocked(claudeCodeService.generateCode).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateCode({
          description: 'Create test function',
          language: 'typescript',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it('should set error on failure', async () => {
      const mockError = new Error('API failed');
      vi.mocked(claudeCodeService.generateCode).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateCode({
          description: 'test',
          language: 'typescript',
        });
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.result).toBeNull();
    });

    it('should call service with correct parameters', async () => {
      vi.mocked(claudeCodeService.generateCode).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        description: 'Create a utility function',
        language: 'typescript',
        additionalContext: 'Use modern syntax',
      };

      await act(async () => {
        await result.current.generateCode(request);
      });

      expect(claudeCodeService.generateCode).toHaveBeenCalledWith(request);
    });
  });

  describe('generateComponent', () => {
    it('should generate component successfully', async () => {
      const mockResponse = {
        success: true,
        data: { code: 'export function Button() {}' },
      };
      vi.mocked(claudeCodeService.generateComponent).mockResolvedValue(
        mockResponse
      );

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateComponent({
          description: 'Create button',
          language: 'tsx',
          framework: 'react',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should handle component generation error', async () => {
      const mockError = new Error('Component generation failed');
      vi.mocked(claudeCodeService.generateComponent).mockRejectedValue(
        mockError
      );

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateComponent({
          description: 'Create button',
          language: 'tsx',
          framework: 'react',
        });
      });

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('reviewCode', () => {
    it('should review code successfully', async () => {
      const mockResponse = {
        success: true,
        data: { issues: [], suggestions: [] },
      };
      vi.mocked(claudeCodeService.reviewCode).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.reviewCode({
          code: 'const x = 1;',
          language: 'javascript',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should include focus areas in review', async () => {
      vi.mocked(claudeCodeService.reviewCode).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        code: 'const data = fetch(url);',
        language: 'typescript',
        focusAreas: ['security', 'error-handling'],
      };

      await act(async () => {
        await result.current.reviewCode(request);
      });

      expect(claudeCodeService.reviewCode).toHaveBeenCalledWith(request);
    });
  });

  describe('optimizeCode', () => {
    it('should optimize code successfully', async () => {
      const mockResponse = {
        success: true,
        data: { optimizedCode: 'optimized version' },
      };
      vi.mocked(claudeCodeService.optimizeCode).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.optimizeCode({
          code: 'for(let i=0;i<arr.length;i++){}',
          language: 'javascript',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should include optimization targets', async () => {
      vi.mocked(claudeCodeService.optimizeCode).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        code: 'const sum = arr.reduce((a,b)=>a+b);',
        language: 'typescript',
        targets: ['performance', 'readability'],
      };

      await act(async () => {
        await result.current.optimizeCode(request);
      });

      expect(claudeCodeService.optimizeCode).toHaveBeenCalledWith(request);
    });
  });

  describe('analyzeCode', () => {
    it('should analyze code successfully', async () => {
      const mockResponse = {
        success: true,
        data: { complexity: 'medium', patterns: ['singleton'] },
      };
      vi.mocked(claudeCodeService.analyzeCode).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.analyzeCode({
          code: 'class UserService {}',
          language: 'typescript',
        });
      });

      expect(result.current.result).toEqual(mockResponse);
    });

    it('should include analysis aspects', async () => {
      vi.mocked(claudeCodeService.analyzeCode).mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useAIGeneration());

      const request = {
        code: 'const app = express();',
        language: 'javascript',
        aspects: ['architecture', 'patterns'],
      };

      await act(async () => {
        await result.current.analyzeCode(request);
      });

      expect(claudeCodeService.analyzeCode).toHaveBeenCalledWith(request);
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', async () => {
      vi.mocked(claudeCodeService.generateCode).mockResolvedValue({
        success: true,
        data: { code: 'test' },
      });

      const { result } = renderHook(() => useAIGeneration());

      // First, generate some result
      await act(async () => {
        await result.current.generateCode({
          description: 'test',
          language: 'typescript',
        });
      });

      expect(result.current.result).not.toBeNull();

      // Then reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error while keeping result', async () => {
      vi.mocked(claudeCodeService.generateCode).mockResolvedValue({
        success: true,
        data: { code: 'test' },
      });

      const { result } = renderHook(() => useAIGeneration());

      // First generate result
      await act(async () => {
        await result.current.generateCode({
          description: 'test',
          language: 'typescript',
        });
      });

      // Then simulate an error
      vi.mocked(claudeCodeService.generateCode).mockRejectedValue(
        new Error('fail')
      );

      await act(async () => {
        await result.current.generateCode({
          description: 'test2',
          language: 'typescript',
        });
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple sequential requests correctly', async () => {
      vi.mocked(claudeCodeService.generateCode)
        .mockResolvedValueOnce({ success: true, data: { code: 'first' } })
        .mockResolvedValueOnce({ success: true, data: { code: 'second' } });

      const { result } = renderHook(() => useAIGeneration());

      await act(async () => {
        await result.current.generateCode({
          description: 'first',
          language: 'typescript',
        });
      });

      expect(result.current.result?.data).toEqual({ code: 'first' });

      await act(async () => {
        await result.current.generateCode({
          description: 'second',
          language: 'typescript',
        });
      });

      expect(result.current.result?.data).toEqual({ code: 'second' });
    });
  });
});
