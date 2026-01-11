/**
 * Test Suite for debugStore (SPEC-DEBUG-001 TAG-001)
 *
 * Tests the Zustand store for managing LLM debug logs
 * Following RED-GREEN-REFACTOR TDD cycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebugStore } from '../debugStore';

describe('debugStore - TAG-001', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { reset } = useDebugStore.getState();
    if (reset) reset();
  });

  describe('Initial State', () => {
    it('should initialize with empty logs array', () => {
      const { result } = renderHook(() => useDebugStore());
      expect(result.current.logs).toEqual([]);
    });

    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useDebugStore());
      expect(result.current.filters).toEqual({
        status: 'all',
        model: 'all',
        search: '',
      });
    });

    it('should initialize with closed modal and no selected log', () => {
      const { result } = renderHook(() => useDebugStore());
      expect(result.current.isDetailModalOpen).toBe(false);
      expect(result.current.selectedLog).toBeNull();
    });

    it('should initialize with zero stats', () => {
      const { result } = renderHook(() => useDebugStore());
      expect(result.current.stats).toEqual({
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        totalTokens: 0,
        totalCost: 0,
      });
    });
  });

  describe('addLog - TASK-001', () => {
    it('should add a new log to the store', () => {
      const { result } = renderHook(() => useDebugStore());

      const mockLog = {
        id: 'log-1',
        timestamp: '2026-01-11T14:32:15.000Z',
        model: 'claude-opus-4-5',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        status: 'pending' as const,
        requestHeaders: { 'x-api-key': 'sk-ant-****' },
        requestBody: { model: 'claude-opus-4-5', messages: [] },
      };

      act(() => {
        result.current.addLog(mockLog);
      });

      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0]).toEqual(mockLog);
    });

    it('should increment totalRequests when adding log', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.addLog({
          id: 'log-1',
          timestamp: '2026-01-11T14:32:15.000Z',
          model: 'claude-opus-4-5',
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          status: 'pending',
          requestHeaders: {},
          requestBody: {},
        });
      });

      expect(result.current.stats.totalRequests).toBe(1);
    });

    it('should maintain max 1000 logs (REQ-U-003)', () => {
      const { result } = renderHook(() => useDebugStore());

      // Add 1001 logs
      act(() => {
        for (let i = 0; i < 1001; i++) {
          result.current.addLog({
            id: `log-${i}`,
            timestamp: new Date().toISOString(),
            model: 'claude-opus-4-5',
            provider: 'anthropic',
            endpoint: 'https://api.anthropic.com/v1/messages',
            method: 'POST',
            status: 'pending',
            requestHeaders: {},
            requestBody: {},
          });
        }
      });

      expect(result.current.logs).toHaveLength(1000);
      expect(result.current.logs[0].id).toBe('log-1'); // Oldest log removed
    });
  });

  describe('updateLog - TASK-001', () => {
    it('should update existing log by id', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.addLog({
          id: 'log-1',
          timestamp: '2026-01-11T14:32:15.000Z',
          model: 'claude-opus-4-5',
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          status: 'pending',
          requestHeaders: {},
          requestBody: {},
        });
      });

      act(() => {
        result.current.updateLog('log-1', {
          status: 'success',
          statusCode: 200,
          duration: 1240,
          inputTokens: 845,
          outputTokens: 400,
          totalTokens: 1245,
          cost: 0.0186,
        });
      });

      expect(result.current.logs[0].status).toBe('success');
      expect(result.current.logs[0].statusCode).toBe(200);
      expect(result.current.logs[0].duration).toBe(1240);
    });

    it('should update stats when log becomes success', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.addLog({
          id: 'log-1',
          timestamp: '2026-01-11T14:32:15.000Z',
          model: 'claude-opus-4-5',
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          status: 'pending',
          requestHeaders: {},
          requestBody: {},
        });
      });

      act(() => {
        result.current.updateLog('log-1', {
          status: 'success',
          totalTokens: 1245,
          cost: 0.0186,
        });
      });

      expect(result.current.stats.successCount).toBe(1);
      expect(result.current.stats.totalTokens).toBe(1245);
      expect(result.current.stats.totalCost).toBe(0.0186);
    });

    it('should update stats when log becomes error', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.addLog({
          id: 'log-1',
          timestamp: '2026-01-11T14:32:15.000Z',
          model: 'claude-opus-4-5',
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          status: 'pending',
          requestHeaders: {},
          requestBody: {},
        });
      });

      act(() => {
        result.current.updateLog('log-1', {
          status: 'error',
          error: 'Rate limit exceeded',
        });
      });

      expect(result.current.stats.errorCount).toBe(1);
    });
  });

  describe('setFilters - TASK-001', () => {
    it('should update filter status', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.setFilters({ status: 'success' });
      });

      expect(result.current.filters.status).toBe('success');
    });

    it('should update filter model', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.setFilters({ model: 'claude-opus-4-5' });
      });

      expect(result.current.filters.model).toBe('claude-opus-4-5');
    });

    it('should update search query', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.setFilters({ search: 'error' });
      });

      expect(result.current.filters.search).toBe('error');
    });
  });

  describe('setSelectedLog - TASK-001', () => {
    it('should set selected log', () => {
      const { result } = renderHook(() => useDebugStore());

      const mockLog = {
        id: 'log-1',
        timestamp: '2026-01-11T14:32:15.000Z',
        model: 'claude-opus-4-5',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        status: 'success' as const,
        requestHeaders: {},
        requestBody: {},
      };

      act(() => {
        result.current.setSelectedLog(mockLog);
      });

      expect(result.current.selectedLog).toEqual(mockLog);
    });

    it('should clear selected log when null is passed', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.setSelectedLog(null);
      });

      expect(result.current.selectedLog).toBeNull();
    });
  });

  describe('clearLogs - TASK-001', () => {
    it('should clear all logs', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.addLog({
          id: 'log-1',
          timestamp: '2026-01-11T14:32:15.000Z',
          model: 'claude-opus-4-5',
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          status: 'pending',
          requestHeaders: {},
          requestBody: {},
        });
      });

      act(() => {
        result.current.clearLogs();
      });

      expect(result.current.logs).toEqual([]);
      expect(result.current.stats.totalRequests).toBe(0);
    });
  });

  describe('Cost Calculation - TASK-002', () => {
    it('should calculate cost for claude-opus-4-5', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.addLog({
          id: 'log-1',
          timestamp: '2026-01-11T14:32:15.000Z',
          model: 'claude-opus-4-5',
          provider: 'anthropic',
          endpoint: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          status: 'success',
          requestHeaders: {},
          requestBody: {},
          inputTokens: 1000,
          outputTokens: 1000,
        });
      });

      // claude-opus-4-5: $3.00/1M input, $15.00/1M output
      // Cost = (1000/1000 * 3.00) + (1000/1000 * 15.00) = 3 + 15 = 18
      expect(result.current.logs[0].cost).toBe(0.018);
    });

    it('should calculate cost for gpt-4o', () => {
      const { result } = renderHook(() => useDebugStore());

      act(() => {
        result.current.addLog({
          id: 'log-1',
          timestamp: '2026-01-11T14:32:15.000Z',
          model: 'gpt-4o',
          provider: 'openai',
          endpoint: 'https://api.openai.com/v1/chat/completions',
          method: 'POST',
          status: 'success',
          requestHeaders: {},
          requestBody: {},
          inputTokens: 1000,
          outputTokens: 1000,
        });
      });

      // gpt-4o: $2.50/1M input, $10.00/1M output
      // Cost = (1000/1000 * 2.50) + (1000/1000 * 10.00) = 2.5 + 10 = 12.5
      expect(result.current.logs[0].cost).toBe(0.0125);
    });
  });
});
