/**
 * Reference Document Service Tests
 * TDD test suite for completed document reference API operations
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCompletedDocuments,
  getCompletedDocumentDetail,
  API_BASE_URL,
} from '../referenceDocService';
import type {
  CompletedDocumentSummary,
  CompletedDocumentDetail,
  CompletedDocumentsQueryOptions,
} from '../../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('referenceDocService', () => {
  const projectId = 'project-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCompletedDocuments', () => {
    const mockSummaries: CompletedDocumentSummary[] = [
      {
        taskId: 'task-1',
        title: 'Task 1',
        status: 'prototype',
        references: ['ref-1'],
        hasDesignDoc: true,
        hasPrd: true,
        hasPrototype: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
      {
        taskId: 'task-2',
        title: 'Archived Task',
        status: 'archived',
        references: ['ref-2'],
        hasDesignDoc: true,
        hasPrd: false,
        hasPrototype: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
        archivedAt: '2024-01-03T00:00:00.000Z',
      },
    ];

    it('should fetch completed documents without options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSummaries, error: null }),
      });

      const result = await getCompletedDocuments(projectId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${projectId}/completed-documents`
      );
      expect(result).toEqual(mockSummaries);
    });

    it('should include search query parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], error: null }),
      });

      const options: CompletedDocumentsQueryOptions = { search: 'testkeyword' };
      await getCompletedDocuments(projectId, options);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=testkeyword')
      );
    });

    it('should include documentType filter as comma-separated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], error: null }),
      });

      const options: CompletedDocumentsQueryOptions = { documentType: ['design', 'prd'] };
      await getCompletedDocuments(projectId, options);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('documentType=design%2Cprd')
      );
    });

    it('should include reference filter as comma-separated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], error: null }),
      });

      const options: CompletedDocumentsQueryOptions = { reference: ['ref-1', 'ref-2'] };
      await getCompletedDocuments(projectId, options);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('reference=ref-1%2Cref-2')
      );
    });

    it('should include limit and offset parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [], error: null }),
      });

      const options: CompletedDocumentsQueryOptions = { limit: 20, offset: 10 };
      await getCompletedDocuments(projectId, options);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=10')
      );
    });

    it('should throw error on HTTP failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getCompletedDocuments(projectId)).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });

    it('should throw error on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, data: null, error: 'Project not found' }),
      });

      await expect(getCompletedDocuments(projectId)).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('getCompletedDocumentDetail', () => {
    const taskId = 'task-123';
    const mockDetail: CompletedDocumentDetail = {
      taskId: 'task-123',
      title: 'Test Task',
      status: 'prototype',
      references: ['ref-1', 'ref-2'],
      featureList: '# Feature List\n\n- Feature 1',
      designDocument: '# Design Document',
      prd: '# PRD',
      prototype: null,
      qaAnswers: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    it('should fetch completed document detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockDetail, error: null }),
      });

      const result = await getCompletedDocumentDetail(projectId, taskId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/projects/${projectId}/completed-documents/${taskId}`
      );
      expect(result).toEqual(mockDetail);
    });

    it('should throw error on HTTP failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getCompletedDocumentDetail(projectId, taskId)).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });

    it('should throw error on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: null,
          error: 'Completed document not found',
        }),
      });

      await expect(getCompletedDocumentDetail(projectId, taskId)).rejects.toThrow(
        'Completed document not found'
      );
    });
  });
});
