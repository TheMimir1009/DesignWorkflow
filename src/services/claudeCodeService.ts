/**
 * Claude Code Service
 * Frontend API client for Claude Code integration
 *
 * Requirements:
 * - REQ-U-004: Frontend API client for Claude Code integration
 */

/**
 * Base API URL
 */
const API_BASE_URL = '/api/generate';

/**
 * Response from AI generation endpoints
 */
export interface AIGenerationResponse {
  success: boolean;
  data?: unknown;
  rawOutput?: string;
  error?: string;
}

/**
 * Request for code generation
 */
export interface GenerateCodeRequest {
  description: string;
  language: string;
  additionalContext?: string;
  workingDir?: string;
}

/**
 * Request for component generation
 */
export interface GenerateComponentRequest {
  description: string;
  language: string;
  framework: string;
  additionalContext?: string;
  workingDir?: string;
}

/**
 * Request for code review
 */
export interface ReviewCodeRequest {
  code: string;
  language: string;
  focusAreas?: string[];
  workingDir?: string;
}

/**
 * Request for code optimization
 */
export interface OptimizeCodeRequest {
  code: string;
  language: string;
  targets?: string[];
  workingDir?: string;
}

/**
 * Request for code analysis
 */
export interface AnalyzeCodeRequest {
  code: string;
  language: string;
  aspects?: string[];
  workingDir?: string;
}

/**
 * Custom error for API failures
 */
export class ClaudeCodeServiceError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ClaudeCodeServiceError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Make API request to generation endpoint
 */
async function makeRequest(
  endpoint: string,
  body: unknown
): Promise<AIGenerationResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ClaudeCodeServiceError(
      data.error || 'API request failed',
      response.status,
      data
    );
  }

  return data as AIGenerationResponse;
}

/**
 * Generate code based on description
 */
export async function generateCode(
  request: GenerateCodeRequest
): Promise<AIGenerationResponse> {
  return makeRequest('/code', request);
}

/**
 * Generate UI component
 */
export async function generateComponent(
  request: GenerateComponentRequest
): Promise<AIGenerationResponse> {
  return makeRequest('/component', request);
}

/**
 * Review code and get feedback
 */
export async function reviewCode(
  request: ReviewCodeRequest
): Promise<AIGenerationResponse> {
  return makeRequest('/review', request);
}

/**
 * Optimize code
 */
export async function optimizeCode(
  request: OptimizeCodeRequest
): Promise<AIGenerationResponse> {
  return makeRequest('/optimize', request);
}

/**
 * Analyze code structure
 */
export async function analyzeCode(
  request: AnalyzeCodeRequest
): Promise<AIGenerationResponse> {
  return makeRequest('/analyze', request);
}

/**
 * Claude Code Service object with all methods
 */
export const claudeCodeService = {
  generateCode,
  generateComponent,
  reviewCode,
  optimizeCode,
  analyzeCode,
};

export default claudeCodeService;
