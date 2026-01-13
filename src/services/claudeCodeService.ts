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
 * Q&A Response for document generation
 */
export interface QAResponseItem {
  question: string;
  answer: string;
}

/**
 * Reference system for context injection
 */
export interface ReferenceSystemItem {
  id: string;
  name: string;
  description: string;
}

/**
 * Request for design document generation
 */
export interface GenerateDesignDocumentRequest {
  qaResponses: QAResponseItem[];
  referenceSystemIds?: ReferenceSystemItem[];
  workingDir?: string;
  projectId?: string;
  taskId?: string;
}

/**
 * Request for PRD generation
 */
export interface GeneratePRDRequest {
  designDocContent: string;
  projectContext?: string;
  workingDir?: string;
  projectId?: string;
  taskId?: string;
}

/**
 * Request for prototype generation
 */
export interface GeneratePrototypeRequest {
  prdContent: string;
  styleFramework?: string;
  workingDir?: string;
  projectId?: string;
  taskId?: string;
}

/**
 * Request for feature analysis
 */
export interface AnalyzeFeaturesRequest {
  featureList: string[];
  workingDir?: string;
}

/**
 * Request for document modification
 */
export interface ModifyDocumentRequest {
  originalContent: string;
  modificationInstructions: string;
  documentType?: 'design-document' | 'prd' | 'prototype';
  workingDir?: string;
}

/**
 * Response from document generation endpoints
 */
export interface DocumentGenerationResponse {
  success: boolean;
  data?: unknown;
  rawOutput?: string;
  error?: string;
}

/**
 * Generation status response
 */
export interface GenerationStatusResponse {
  status: string;
  healthy: boolean;
  version?: string;
  timestamp?: string;
}

/**
 * Generation history item
 */
export interface GenerationHistoryItem {
  id: string;
  type: string;
  createdAt: string;
  status?: string;
}

/**
 * Generation history response
 */
export interface GenerationHistoryResponse {
  projectId?: string;
  history: GenerationHistoryItem[];
}

/**
 * Pagination options for history
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
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
 * @internal Exported for testing purposes only
 */
export async function makeRequest(
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
 * Make GET request to generation endpoint
 */
async function makeGetRequest(endpoint: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ClaudeCodeServiceError(
      data.error || 'API request failed',
      response.status,
      data
    );
  }

  return data;
}

/**
 * Generate design document from Q&A responses
 */
export async function generateDesignDocument(
  request: GenerateDesignDocumentRequest
): Promise<DocumentGenerationResponse> {
  return makeRequest('/design-document', request);
}

/**
 * Generate PRD from design document
 */
export async function generatePRD(
  request: GeneratePRDRequest
): Promise<DocumentGenerationResponse> {
  return makeRequest('/prd', request);
}

/**
 * Generate HTML prototype from PRD
 */
export async function generatePrototype(
  request: GeneratePrototypeRequest
): Promise<DocumentGenerationResponse> {
  return makeRequest('/prototype', request);
}

/**
 * Analyze features and extract keywords
 */
export async function analyzeFeatures(
  request: AnalyzeFeaturesRequest
): Promise<DocumentGenerationResponse> {
  return makeRequest('/analyze-features', request);
}

/**
 * Modify existing document
 */
export async function modifyDocument(
  request: ModifyDocumentRequest
): Promise<DocumentGenerationResponse> {
  return makeRequest('/modify', request);
}

/**
 * Get generation service status
 */
export async function getGenerationStatus(): Promise<GenerationStatusResponse> {
  return makeGetRequest('/status') as Promise<GenerationStatusResponse>;
}

/**
 * Get generation history for a project
 */
export async function getGenerationHistory(
  projectId: string,
  options?: PaginationOptions
): Promise<GenerationHistoryResponse> {
  let endpoint = `/history/${projectId}`;
  if (options) {
    const params = new URLSearchParams();
    if (options.page !== undefined) params.append('page', String(options.page));
    if (options.limit !== undefined) params.append('limit', String(options.limit));
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
  }
  return makeGetRequest(endpoint) as Promise<GenerationHistoryResponse>;
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
  generateDesignDocument,
  generatePRD,
  generatePrototype,
  analyzeFeatures,
  modifyDocument,
  getGenerationStatus,
  getGenerationHistory,
};

export default claudeCodeService;
