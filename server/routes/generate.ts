/**
 * Generate API Routes
 * Endpoints for Claude Code AI-powered code generation
 *
 * Requirements:
 * - REQ-E-001: Generate code endpoint
 * - REQ-E-002: Generate component endpoint
 * - REQ-E-003: Review code endpoint
 * - REQ-E-004: Optimize code endpoint
 * - REQ-E-005: Analyze code endpoint
 * - REQ-S-001: API validation
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { callClaudeCode, type ClaudeCodeResult } from '../utils/claudeCodeRunner.ts';
import {
  buildGeneratePrompt,
  buildReviewPrompt,
  buildOptimizePrompt,
  buildAnalyzePrompt,
  buildDesignDocumentPrompt,
  buildPRDPrompt,
  buildPrototypePrompt,
  buildFeatureAnalysisPrompt,
  buildDocumentModifyPrompt,
} from '../utils/promptBuilder.ts';

/**
 * In-memory storage for generation history (for demo purposes)
 * In production, this would be stored in a database
 */
const generationHistory: Map<string, Array<{
  id: string;
  type: string;
  createdAt: string;
  status: string;
}>> = new Map();

export const generateRouter = Router();

/**
 * Type for Claude Code runner function (for dependency injection)
 */
type ClaudeCodeRunnerFn = (
  prompt: string,
  workingDir: string,
  options?: { timeout?: number; allowedTools?: string[] }
) => Promise<ClaudeCodeResult>;

/**
 * Injectable Claude Code runner for testing
 */
let claudeCodeRunner: ClaudeCodeRunnerFn = callClaudeCode;

/**
 * Set the Claude Code runner (for testing)
 */
export function setClaudeCodeRunner(runner: ClaudeCodeRunnerFn): void {
  claudeCodeRunner = runner;
}

/**
 * Default working directory for Claude Code
 */
const DEFAULT_WORKING_DIR = process.cwd();

/**
 * Validation middleware for required fields
 */
function validateRequired(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = fields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
      return;
    }
    next();
  };
}

/**
 * Error handler for Claude Code errors
 */
function handleClaudeCodeError(error: Error, res: Response): void {
  if (error.name === 'ClaudeCodeTimeoutError') {
    res.status(504).json({
      error: 'Claude Code process timeout',
      message: error.message,
    });
    return;
  }

  if (error.name === 'ClaudeCodeError') {
    res.status(500).json({
      error: 'Claude Code execution failed',
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
}

/**
 * POST /api/generate/code
 * Generate code based on description
 */
generateRouter.post(
  '/code',
  validateRequired(['description', 'language']),
  async (req: Request, res: Response) => {
    try {
      const { description, language, additionalContext, workingDir } = req.body;

      const prompt = buildGeneratePrompt({
        type: 'code',
        description,
        language,
        additionalContext,
      });

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 120000, allowedTools: ['Read', 'Write', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/component
 * Generate UI component
 */
generateRouter.post(
  '/component',
  validateRequired(['description', 'language', 'framework']),
  async (req: Request, res: Response) => {
    try {
      const { description, language, framework, additionalContext, workingDir } = req.body;

      const prompt = buildGeneratePrompt({
        type: 'component',
        description,
        language,
        framework,
        additionalContext,
      });

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 120000, allowedTools: ['Read', 'Write', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/review
 * Review code and provide feedback
 */
generateRouter.post(
  '/review',
  validateRequired(['code', 'language']),
  async (req: Request, res: Response) => {
    try {
      const { code, language, focusAreas, workingDir } = req.body;

      const prompt = buildReviewPrompt(code, {
        language,
        focusAreas,
      });

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 120000, allowedTools: ['Read', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/optimize
 * Optimize code for performance/readability
 */
generateRouter.post(
  '/optimize',
  validateRequired(['code', 'language']),
  async (req: Request, res: Response) => {
    try {
      const { code, language, targets, workingDir } = req.body;

      const prompt = buildOptimizePrompt(code, {
        language,
        targets,
      });

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 120000, allowedTools: ['Read', 'Write', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/analyze
 * Analyze code structure and patterns
 */
generateRouter.post(
  '/analyze',
  validateRequired(['code', 'language']),
  async (req: Request, res: Response) => {
    try {
      const { code, language, aspects, workingDir } = req.body;

      const prompt = buildAnalyzePrompt(code, {
        language,
        aspects,
      });

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 120000, allowedTools: ['Read', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/design-document
 * Generate design document from Q&A responses
 */
generateRouter.post(
  '/design-document',
  validateRequired(['qaResponses']),
  async (req: Request, res: Response) => {
    try {
      const { qaResponses, referenceSystemIds, workingDir } = req.body;

      const prompt = buildDesignDocumentPrompt(qaResponses, referenceSystemIds);

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 180000, allowedTools: ['Read', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/prd
 * Generate PRD from design document
 */
generateRouter.post(
  '/prd',
  validateRequired(['designDocContent']),
  async (req: Request, res: Response) => {
    try {
      const { designDocContent, projectContext, workingDir } = req.body;

      let prompt = buildPRDPrompt(designDocContent);
      if (projectContext) {
        prompt = `## Project Context\n${projectContext}\n\n${prompt}`;
      }

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 180000, allowedTools: ['Read', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/prototype
 * Generate HTML prototype from PRD
 */
generateRouter.post(
  '/prototype',
  validateRequired(['prdContent']),
  async (req: Request, res: Response) => {
    try {
      const { prdContent, styleFramework, workingDir } = req.body;

      let prompt = buildPrototypePrompt(prdContent);
      if (styleFramework) {
        prompt += `\n\n## Styling Framework\nUse ${styleFramework} for styling.`;
      }

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 180000, allowedTools: ['Read', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/analyze-features
 * Analyze feature list and extract keywords
 */
generateRouter.post(
  '/analyze-features',
  validateRequired(['featureList']),
  async (req: Request, res: Response) => {
    try {
      const { featureList, workingDir } = req.body;

      const prompt = buildFeatureAnalysisPrompt(featureList);

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 120000, allowedTools: ['Read', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * POST /api/generate/modify
 * Modify existing document based on instructions
 */
generateRouter.post(
  '/modify',
  validateRequired(['originalContent', 'modificationInstructions']),
  async (req: Request, res: Response) => {
    try {
      const { originalContent, modificationInstructions, documentType, workingDir } = req.body;

      let prompt = buildDocumentModifyPrompt(originalContent, modificationInstructions);
      if (documentType) {
        prompt = `## Document Type: ${documentType}\n\n${prompt}`;
      }

      const result = await claudeCodeRunner(
        prompt,
        workingDir || DEFAULT_WORKING_DIR,
        { timeout: 180000, allowedTools: ['Read', 'Grep'] }
      );

      res.json({
        success: true,
        data: result.output,
        rawOutput: result.rawOutput,
      });
    } catch (error) {
      handleClaudeCodeError(error as Error, res);
    }
  }
);

/**
 * GET /api/generate/status
 * Get generation service status
 */
generateRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    healthy: true,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/generate/history/:projectId
 * Get generation history for a project
 */
generateRouter.get('/history/:projectId', (req: Request, res: Response) => {
  const { projectId } = req.params;
  const history = generationHistory.get(projectId) || [];

  res.json({
    projectId,
    history,
  });
});
