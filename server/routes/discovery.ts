/**
 * Discovery API Routes
 * Handles system discovery endpoints for auto-exploration feature
 *
 * Requirements:
 * - TASK-002: POST /api/projects/:projectId/discover endpoint
 * - TASK-002: Input validation (projectId, featureText min 100 chars)
 * - TASK-002: keywordExtractor + systemMatcher integration
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import { getProjectById } from '../utils/projectStorage.ts';
import { getSystemsByProject } from '../utils/systemStorage.ts';
import { extractKeywords } from '../utils/keywordExtractor.ts';
import { matchSystemsByKeywords, type SystemMatchResult } from '../utils/systemMatcher.ts';

export const discoveryRouter = Router();

/**
 * Minimum feature text length required for discovery
 */
const MIN_FEATURE_TEXT_LENGTH = 100;

/**
 * Maximum number of recommendations to return
 */
const MAX_RECOMMENDATIONS = 5;

/**
 * Response data structure for discovery endpoint
 */
interface DiscoveryResponseData {
  /** Recommended systems with relevance scores */
  recommendations: SystemMatchResult[];
  /** Whether recommendations are AI-generated (false for keyword-based) */
  isAIGenerated: boolean;
  /** Keywords that were analyzed */
  analyzedKeywords: string[];
}

/**
 * POST /api/projects/:projectId/discover - Discover related systems
 *
 * Path Parameters:
 * - projectId: Project UUID
 *
 * Request Body:
 * - featureText: string (required, min 100 characters)
 *
 * Response: ApiResponse<DiscoveryResponseData>
 * - 200: Discovery results with recommendations
 * - 400: Missing or invalid featureText
 * - 404: Project not found
 * - 500: Server error
 */
export async function discoverProjectSystems(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const { featureText } = req.body;

    // Validate featureText is provided
    if (!featureText || typeof featureText !== 'string') {
      sendError(res, 400, 'featureText is required');
      return;
    }

    // Validate featureText minimum length
    if (featureText.length < MIN_FEATURE_TEXT_LENGTH) {
      sendError(res, 400, `featureText must be at least ${MIN_FEATURE_TEXT_LENGTH} characters`);
      return;
    }

    // Check if project exists
    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 404, 'Project not found');
      return;
    }

    // Get systems for this project
    const systems = await getSystemsByProject(projectId);

    // Extract keywords from feature text
    const keywords = extractKeywords(featureText);

    // Match systems by keywords
    const recommendations = matchSystemsByKeywords(keywords, systems, MAX_RECOMMENDATIONS);

    // Build response
    const responseData: DiscoveryResponseData = {
      recommendations,
      isAIGenerated: false, // Keyword-based matching is not AI-generated
      analyzedKeywords: keywords.map((k) => k.keyword),
    };

    sendSuccess(res, responseData);
  } catch (error) {
    console.error('Error discovering systems:', error);
    sendError(res, 500, 'Failed to discover systems');
  }
}

// Mount the handler on the router
discoveryRouter.post('/:projectId/discover', discoverProjectSystems);
