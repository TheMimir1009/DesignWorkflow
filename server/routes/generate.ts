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
import { getLLMSettingsOrDefault } from '../utils/llmSettingsStorage.ts';
import { createLLMProvider, type LLMProviderInterface } from '../utils/llmProvider.ts';
import {
  getModelConfigForStage,
  isProviderConfigured,
  type LLMModelConfig,
  type TaskStage,
} from '../../src/types/llm.ts';

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
 * Result of LLM provider selection
 */
interface LLMProviderSelection {
  provider: LLMProviderInterface;
  config: LLMModelConfig;
  isDefault: boolean;
}

/**
 * Select LLM provider based on project settings and task stage
 * Returns the appropriate provider or throws an error if not available
 * NO AUTO-FALLBACK: If configured provider fails validation, error is returned
 */
async function selectLLMProvider(
  projectId: string | undefined,
  stage: TaskStage
): Promise<LLMProviderSelection> {
  // If no projectId, use default Claude Code
  if (!projectId) {
    const settings = await getLLMSettingsOrDefault('default');
    const config = settings.taskStageConfig.defaultModel;
    return {
      provider: createLLMProvider({
        provider: 'claude-code',
        apiKey: '',
        isEnabled: true,
        connectionStatus: 'connected',
      }),
      config,
      isDefault: true,
    };
  }

  // Get project settings
  const settings = await getLLMSettingsOrDefault(projectId);
  const modelConfig = getModelConfigForStage(settings.taskStageConfig, stage);

  // Check if using default (Claude Code)
  if (modelConfig.provider === 'claude-code') {
    return {
      provider: createLLMProvider({
        provider: 'claude-code',
        apiKey: '',
        isEnabled: true,
        connectionStatus: 'connected',
      }),
      config: modelConfig,
      isDefault: true,
    };
  }

  // Find the provider settings
  const providerSettings = settings.providers.find(
    (p) => p.provider === modelConfig.provider
  );

  if (!providerSettings) {
    throw new LLMProviderError(
      `Provider ${modelConfig.provider} not found in settings`,
      modelConfig.provider,
      modelConfig.modelId
    );
  }

  // Check if provider is enabled
  if (!providerSettings.isEnabled) {
    throw new LLMProviderError(
      `Provider ${modelConfig.provider} is not enabled. Please enable it in project settings.`,
      modelConfig.provider,
      modelConfig.modelId
    );
  }

  // Check if provider is configured (has API key or valid endpoint)
  if (!isProviderConfigured(providerSettings)) {
    throw new LLMProviderError(
      `Provider ${modelConfig.provider} is not configured. Please add API key or configure endpoint.`,
      modelConfig.provider,
      modelConfig.modelId
    );
  }

  // Create and return the provider
  return {
    provider: createLLMProvider(providerSettings),
    config: modelConfig,
    isDefault: false,
  };
}

/**
 * Custom error class for LLM provider errors
 */
class LLMProviderError extends Error {
  public provider: string;
  public model: string;

  constructor(message: string, provider: string, model: string) {
    super(message);
    this.name = 'LLMProviderError';
    this.provider = provider;
    this.model = model;
  }
}

/**
 * Handle LLM provider errors
 */
function handleLLMProviderError(
  error: unknown,
  res: Response,
  provider?: string,
  model?: string
): void {
  if (error instanceof LLMProviderError) {
    res.status(400).json({
      error: error.message,
      provider: error.provider,
      model: error.model,
    });
    return;
  }

  // Handle Claude Code specific errors (for backward compatibility)
  if (error instanceof Error) {
    if (error.name === 'ClaudeCodeTimeoutError') {
      res.status(504).json({
        error: 'Claude Code process timeout',
        message: error.message,
        provider: provider || 'claude-code',
        model: model || 'claude-3.5-sonnet',
      });
      return;
    }

    if (error.name === 'ClaudeCodeError') {
      res.status(500).json({
        error: 'Claude Code execution failed',
        message: error.message,
        provider: provider || 'claude-code',
        model: model || 'claude-3.5-sonnet',
      });
      return;
    }
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({
    error: `LLM generation failed: ${message}`,
    provider: provider || 'unknown',
    model: model || 'unknown',
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
 * Supports LLM provider selection via projectId
 */
generateRouter.post(
  '/design-document',
  validateRequired(['qaResponses']),
  async (req: Request, res: Response) => {
    let selectedProvider: string | undefined;
    let selectedModel: string | undefined;

    try {
      const { qaResponses, referenceSystemIds, workingDir, projectId } = req.body;

      const prompt = buildDesignDocumentPrompt(qaResponses, referenceSystemIds);

      // Select LLM provider based on project settings
      const { provider, config, isDefault } = await selectLLMProvider(projectId, 'design');
      selectedProvider = config.provider;
      selectedModel = config.modelId;

      // If using default Claude Code, use the claudeCodeRunner
      if (isDefault) {
        const result = await claudeCodeRunner(
          prompt,
          workingDir || DEFAULT_WORKING_DIR,
          { timeout: 180000, allowedTools: ['Read', 'Grep'] }
        );

        res.json({
          success: true,
          data: result.output,
          rawOutput: result.rawOutput,
          provider: config.provider,
          model: config.modelId,
        });
        return;
      }

      // Use selected LLM provider
      const result = await provider.generate(prompt, config, workingDir || DEFAULT_WORKING_DIR);

      if (!result.success) {
        // NO AUTO-FALLBACK: Return error if LLM fails
        res.status(500).json({
          error: `LLM generation failed: ${result.error}`,
          provider: result.provider,
          model: result.model,
        });
        return;
      }

      res.json({
        success: true,
        data: result.content,
        rawOutput: result.rawOutput,
        provider: result.provider,
        model: result.model,
      });
    } catch (error) {
      handleLLMProviderError(error, res, selectedProvider, selectedModel);
    }
  }
);

/**
 * POST /api/generate/prd
 * Generate PRD from design document
 * Supports LLM provider selection via projectId
 */
generateRouter.post(
  '/prd',
  validateRequired(['designDocContent']),
  async (req: Request, res: Response) => {
    let selectedProvider: string | undefined;
    let selectedModel: string | undefined;

    try {
      const { designDocContent, projectContext, workingDir, projectId } = req.body;

      let prompt = buildPRDPrompt(designDocContent);
      if (projectContext) {
        prompt = `## Project Context\n${projectContext}\n\n${prompt}`;
      }

      // Select LLM provider based on project settings
      const { provider, config, isDefault } = await selectLLMProvider(projectId, 'prd');
      selectedProvider = config.provider;
      selectedModel = config.modelId;

      // If using default Claude Code, use the claudeCodeRunner
      if (isDefault) {
        const result = await claudeCodeRunner(
          prompt,
          workingDir || DEFAULT_WORKING_DIR,
          { timeout: 180000, allowedTools: ['Read', 'Grep'] }
        );

        res.json({
          success: true,
          data: result.output,
          rawOutput: result.rawOutput,
          provider: config.provider,
          model: config.modelId,
        });
        return;
      }

      // Use selected LLM provider
      const result = await provider.generate(prompt, config, workingDir || DEFAULT_WORKING_DIR);

      if (!result.success) {
        // NO AUTO-FALLBACK: Return error if LLM fails
        res.status(500).json({
          error: `LLM generation failed: ${result.error}`,
          provider: result.provider,
          model: result.model,
        });
        return;
      }

      res.json({
        success: true,
        data: result.content,
        rawOutput: result.rawOutput,
        provider: result.provider,
        model: result.model,
      });
    } catch (error) {
      handleLLMProviderError(error, res, selectedProvider, selectedModel);
    }
  }
);

/**
 * POST /api/generate/prototype
 * Generate HTML prototype from PRD
 * Supports LLM provider selection via projectId
 */
generateRouter.post(
  '/prototype',
  validateRequired(['prdContent']),
  async (req: Request, res: Response) => {
    let selectedProvider: string | undefined;
    let selectedModel: string | undefined;

    try {
      const { prdContent, styleFramework, workingDir, projectId } = req.body;

      let prompt = buildPrototypePrompt(prdContent);
      if (styleFramework) {
        prompt += `\n\n## Styling Framework\nUse ${styleFramework} for styling.`;
      }

      // Select LLM provider based on project settings
      const { provider, config, isDefault } = await selectLLMProvider(projectId, 'prototype');
      selectedProvider = config.provider;
      selectedModel = config.modelId;

      // If using default Claude Code, use the claudeCodeRunner
      if (isDefault) {
        const result = await claudeCodeRunner(
          prompt,
          workingDir || DEFAULT_WORKING_DIR,
          { timeout: 180000, allowedTools: ['Read', 'Grep'] }
        );

        res.json({
          success: true,
          data: result.output,
          rawOutput: result.rawOutput,
          provider: config.provider,
          model: config.modelId,
        });
        return;
      }

      // Use selected LLM provider
      const result = await provider.generate(prompt, config, workingDir || DEFAULT_WORKING_DIR);

      if (!result.success) {
        // NO AUTO-FALLBACK: Return error if LLM fails
        res.status(500).json({
          error: `LLM generation failed: ${result.error}`,
          provider: result.provider,
          model: result.model,
        });
        return;
      }

      res.json({
        success: true,
        data: result.content,
        rawOutput: result.rawOutput,
        provider: result.provider,
        model: result.model,
      });
    } catch (error) {
      handleLLMProviderError(error, res, selectedProvider, selectedModel);
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
