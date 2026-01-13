/**
 * LLM Type Definitions Tests
 * Test coverage for enhanced LLM connection types
 */

import { describe, it, expect } from 'vitest';
import type {
  LLMProvider,
  ConnectionStatus,
  ConnectionErrorCode,
  ConnectionError,
  ConnectionTestResult,
} from './llm';
import { isValidConnectionStatus } from './llm';

describe('ConnectionStatus Type', () => {
  it('should include "testing" status', () => {
    const testingStatus: ConnectionStatus = 'testing';
    expect(testingStatus).toBe('testing');
  });

  it('should include all required statuses', () => {
    const statuses: ConnectionStatus[] = [
      'connected',
      'disconnected',
      'error',
      'untested',
      'testing',
    ];

    expect(statuses).toHaveLength(5);
    expect(statuses).toContain('testing');
  });
});

describe('ConnectionErrorCode Type', () => {
  it('should define all error code types', () => {
    const errorCodes: ConnectionErrorCode[] = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'AUTHENTICATION_FAILED',
      'API_ERROR',
      'INVALID_RESPONSE',
      'UNKNOWN_ERROR',
    ];

    expect(errorCodes).toHaveLength(6);
  });

  it('should include timeout error code', () => {
    const timeoutCode: ConnectionErrorCode = 'TIMEOUT';
    expect(timeoutCode).toBe('TIMEOUT');
  });
});

describe('ConnectionError Interface', () => {
  it('should create connection error with all required fields', () => {
    const error: ConnectionError = {
      code: 'TIMEOUT',
      message: 'Request timed out',
      retryable: true,
    };

    expect(error.code).toBe('TIMEOUT');
    expect(typeof error.message).toBe('string');
    expect(error.retryable).toBe(true);
  });

  it('should include optional details field', () => {
    const error: ConnectionError = {
      code: 'API_ERROR',
      message: 'API returned error',
      retryable: true,
      details: { statusCode: 500, statusText: 'Internal Server Error' },
    };

    expect(error.details).toBeDefined();
    expect(error.details?.statusCode).toBe(500);
  });
});

describe('ConnectionTestResult Interface', () => {
  it('should include enhanced fields with ConnectionError', () => {
    const result: ConnectionTestResult = {
      success: false,
      status: 'error',
      error: {
        code: 'TIMEOUT',
        message: 'Request timed out after 30s',
        retryable: true,
      },
      timestamp: '2025-01-12T10:00:00Z',
    };

    expect(result.success).toBe(false);
    expect(result.status).toBe('error');
    expect(result.error?.code).toBe('TIMEOUT');
    expect(result.timestamp).toBeDefined();
  });

  it('should support successful test result', () => {
    const result: ConnectionTestResult = {
      success: true,
      status: 'connected',
      latency: 150,
      models: ['gpt-4o', 'gpt-4o-mini'],
      timestamp: '2025-01-12T10:00:00Z',
    };

    expect(result.success).toBe(true);
    expect(result.status).toBe('connected');
    expect(result.latency).toBe(150);
    expect(result.models).toEqual(['gpt-4o', 'gpt-4o-mini']);
    expect(result.timestamp).toBeDefined();
  });

  it('should maintain backward compatibility with legacy format', () => {
    // Legacy format without new fields
    const legacyResult: ConnectionTestResult = {
      success: true,
      latency: 100,
      models: ['gpt-4o'],
    };

    expect(legacyResult.success).toBe(true);
    // New fields should be optional
    expect(legacyResult.status).toBeUndefined();
    expect(legacyResult.timestamp).toBeUndefined();
  });
});

describe('Type Guards', () => {
  it('should validate "testing" as valid connection status', () => {
    expect(isValidConnectionStatus('testing')).toBe(true);
    expect(isValidConnectionStatus('connected')).toBe(true);
    expect(isValidConnectionStatus('invalid')).toBe(false);
  });
});
