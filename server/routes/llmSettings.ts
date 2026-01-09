/**
 * LLM Settings API Routes
 * Handles LLM provider configuration endpoints
 */
import { Router, type Request, type Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.ts';
import {
  getLLMSettings,
  saveLLMSettings,
  updateProviderSettings,
  updateTaskStageConfig,
  getLLMSettingsOrDefault,
} from '../utils/llmSettingsStorage.ts';
import { createLLMProvider } from '../utils/llmProvider.ts';
import { maskApiKey } from '../utils/encryption.ts';
import {
  isValidProvider,
  createDefaultProjectLLMSettings,
  type LLMProvider,
  type LLMProviderSettings,
  type TaskStageConfig,
  type ProjectLLMSettings,
} from '../../src/types/llm.ts';

export const llmSettingsRouter = Router();

/**
 * GET /api/projects/:projectId/llm-settings
 * Get LLM settings for a project (API keys are masked)
 */
llmSettingsRouter.get(
  '/:projectId/llm-settings',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        sendError(res, 400, 'Project ID is required');
        return;
      }

      let settings = await getLLMSettings(projectId);

      // Return default settings if not configured
      if (!settings) {
        settings = createDefaultProjectLLMSettings(projectId);
      }

      // Mask API keys for response
      const maskedSettings: ProjectLLMSettings = {
        ...settings,
        providers: settings.providers.map(provider => ({
          ...provider,
          apiKey: maskApiKey(provider.apiKey),
        })),
      };

      sendSuccess(res, maskedSettings);
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * PUT /api/projects/:projectId/llm-settings
 * Update all LLM settings for a project
 */
llmSettingsRouter.put(
  '/:projectId/llm-settings',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const body = req.body as Partial<ProjectLLMSettings>;

      if (!projectId) {
        sendError(res, 400, 'Project ID is required');
        return;
      }

      // Get existing settings or default
      const existingSettings = await getLLMSettingsOrDefault(projectId);

      // Merge with updates
      const updatedSettings: ProjectLLMSettings = {
        ...existingSettings,
        ...body,
        projectId, // Ensure projectId is correct
        updatedAt: new Date().toISOString(),
      };

      await saveLLMSettings(projectId, updatedSettings);

      // Return masked settings
      const maskedSettings: ProjectLLMSettings = {
        ...updatedSettings,
        providers: updatedSettings.providers.map(provider => ({
          ...provider,
          apiKey: maskApiKey(provider.apiKey),
        })),
      };

      sendSuccess(res, maskedSettings);
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * PUT /api/projects/:projectId/llm-settings/provider/:provider
 * Update specific provider settings
 */
llmSettingsRouter.put(
  '/:projectId/llm-settings/provider/:provider',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, provider } = req.params;
      const updates = req.body as Partial<Omit<LLMProviderSettings, 'provider'>>;

      if (!projectId) {
        sendError(res, 400, 'Project ID is required');
        return;
      }

      if (!provider || !isValidProvider(provider)) {
        sendError(res, 400, 'Invalid provider');
        return;
      }

      await updateProviderSettings(projectId, provider as LLMProvider, updates);

      const settings = await getLLMSettingsOrDefault(projectId);
      const updatedProvider = settings.providers.find(p => p.provider === provider);

      sendSuccess(res, {
        ...updatedProvider,
        apiKey: maskApiKey(updatedProvider?.apiKey || ''),
      });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * PUT /api/projects/:projectId/llm-settings/task-stage
 * Update task stage configuration
 */
llmSettingsRouter.put(
  '/:projectId/llm-settings/task-stage',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const updates = req.body as Partial<TaskStageConfig>;

      if (!projectId) {
        sendError(res, 400, 'Project ID is required');
        return;
      }

      await updateTaskStageConfig(projectId, updates);

      const settings = await getLLMSettingsOrDefault(projectId);
      sendSuccess(res, settings.taskStageConfig);
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * POST /api/projects/:projectId/llm-settings/test-connection/:provider
 * Test connection to a provider
 */
llmSettingsRouter.post(
  '/:projectId/llm-settings/test-connection/:provider',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, provider } = req.params;

      if (!projectId) {
        sendError(res, 400, 'Project ID is required');
        return;
      }

      if (!provider || !isValidProvider(provider)) {
        sendError(res, 400, 'Invalid provider');
        return;
      }

      // Get settings to get API key
      const settings = await getLLMSettingsOrDefault(projectId);
      const providerSettings = settings.providers.find(p => p.provider === provider);

      if (!providerSettings) {
        sendError(res, 404, 'Provider not found in settings');
        return;
      }

      // Create provider instance and test connection
      const llmProvider = createLLMProvider(providerSettings);
      const result = await llmProvider.testConnection();

      // Update connection status based on result
      await updateProviderSettings(projectId, provider as LLMProvider, {
        connectionStatus: result.success ? 'connected' : 'error',
        lastTestedAt: new Date().toISOString(),
        errorMessage: result.error,
      });

      sendSuccess(res, result);
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

/**
 * GET /api/projects/:projectId/llm-settings/provider/:provider/models
 * Get available models for a provider
 */
llmSettingsRouter.get(
  '/:projectId/llm-settings/provider/:provider/models',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, provider } = req.params;

      if (!projectId) {
        sendError(res, 400, 'Project ID is required');
        return;
      }

      if (!provider || !isValidProvider(provider)) {
        sendError(res, 400, 'Invalid provider');
        return;
      }

      // Get settings to get API key
      const settings = await getLLMSettingsOrDefault(projectId);
      const providerSettings = settings.providers.find(p => p.provider === provider);

      if (!providerSettings) {
        sendError(res, 404, 'Provider not found in settings');
        return;
      }

      // Create provider instance and get models
      const llmProvider = createLLMProvider(providerSettings);
      const models = await llmProvider.getAvailableModels();

      sendSuccess(res, { provider, models });
    } catch (error) {
      sendError(res, 500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
);
