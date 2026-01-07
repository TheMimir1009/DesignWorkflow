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
} from '../utils/promptBuilder.ts';

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
