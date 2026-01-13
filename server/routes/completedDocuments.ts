/**
 * Completed Documents API Routes
 * Handles all completed document-related endpoints (SPEC-DOCREF-001)
 *
 * Completed documents include:
 * - Tasks in 'prototype' status (active but complete)
 * - Archived tasks (stored in archives)
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getProjectById } from '../utils/projectStorage.ts';
import {
  getCompletedDocuments,
  getCompletedDocumentById,
} from '../utils/completedDocStorage.ts';
import type { CompletedDocumentsQueryOptions } from '../../src/types/index.ts';

export const completedDocumentsRouter = Router();

/**
 * Parse query parameters for completed documents list
 */
function parseQueryOptions(query: Request['query']): CompletedDocumentsQueryOptions {
  const options: CompletedDocumentsQueryOptions = {};

  // Parse search keyword
  if (typeof query.search === 'string' && query.search.trim()) {
    options.search = query.search.trim();
  }

  // Parse document type filter (comma-separated)
  if (typeof query.documentType === 'string' && query.documentType.trim()) {
    options.documentType = query.documentType.split(',').map((t) => t.trim());
  }

  // Parse reference filter (comma-separated)
  if (typeof query.reference === 'string' && query.reference.trim()) {
    options.reference = query.reference.split(',').map((r) => r.trim());
  }

  // Parse includeArchived flag
  if (typeof query.includeArchived === 'string') {
    options.includeArchived = query.includeArchived === 'true';
  }

  // Parse limit
  if (typeof query.limit === 'string') {
    const limit = parseInt(query.limit, 10);
    if (!isNaN(limit) && limit > 0) {
      options.limit = Math.min(limit, 100); // Cap at 100
    }
  }

  // Parse offset
  if (typeof query.offset === 'string') {
    const offset = parseInt(query.offset, 10);
    if (!isNaN(offset) && offset >= 0) {
      options.offset = offset;
    }
  }

  return options;
}

/**
 * GET /api/projects/:projectId/completed-documents - Get all completed documents
 *
 * Query Parameters:
 * - search: Keyword to search in title, featureList, designDocument
 * - documentType: Filter by document type (design, prd, prototype) - comma-separated
 * - reference: Filter by reference IDs - comma-separated
 * - limit: Maximum number of results (default: 50, max: 100)
 * - offset: Number of results to skip
 *
 * Response: ApiResponse<CompletedDocumentSummary[]>
 * - 200: List of completed documents
 * - 404: Project not found
 * - 500: Server error
 */
export async function getProjectCompletedDocuments(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { projectId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Parse query options
    const options = parseQueryOptions(req.query);

    // Get completed documents
    const documents = await getCompletedDocuments(projectId, options);
    sendSuccess(res, documents);
  } catch (error) {
    console.error('Error getting completed documents:', error);
    sendError(res, 500, 'Failed to get completed documents');
  }
}

/**
 * GET /api/projects/:projectId/completed-documents/:taskId - Get a single completed document
 *
 * Path Parameters:
 * - projectId: Project UUID
 * - taskId: Task UUID
 *
 * Response: ApiResponse<CompletedDocumentDetail>
 * - 200: Completed document found
 * - 404: Project or Completed document not found
 * - 500: Server error
 */
export async function getProjectCompletedDocument(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { projectId, taskId } = req.params;

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Get completed document
    const document = await getCompletedDocumentById(projectId, taskId);
    if (!document) {
      sendError(res, 404, 'Completed document not found');
      return;
    }

    sendSuccess(res, document);
  } catch (error) {
    console.error('Error getting completed document:', error);
    sendError(res, 500, 'Failed to get completed document');
  }
}
