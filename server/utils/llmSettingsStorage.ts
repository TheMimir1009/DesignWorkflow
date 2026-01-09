/**
 * LLM Settings Storage
 * File system operations for LLM settings persistence
 */
import fs from 'fs/promises';
import path from 'path';
import type {
  ProjectLLMSettings,
  LLMProvider,
  LLMProviderSettings,
  TaskStageConfig,
} from '../../src/types/llm';
import { createDefaultProjectLLMSettings } from '../../src/types/llm';
import { encryptApiKey, decryptApiKey, isEncrypted } from './encryption';

// Settings file name
const SETTINGS_FILE_NAME = 'llm-settings.json';

// Workspace path for project storage
const WORKSPACE_PATH = path.join(process.cwd(), 'workspace/projects');

/**
 * Get the settings file path for a project
 */
function getSettingsPath(projectId: string): string {
  return path.join(WORKSPACE_PATH, projectId, SETTINGS_FILE_NAME);
}

/**
 * Encrypt API keys in settings before saving
 */
function encryptSettings(settings: ProjectLLMSettings): ProjectLLMSettings {
  return {
    ...settings,
    providers: settings.providers.map(provider => ({
      ...provider,
      apiKey: provider.apiKey && !isEncrypted(provider.apiKey)
        ? encryptApiKey(provider.apiKey)
        : provider.apiKey,
    })),
  };
}

/**
 * Decrypt API keys in settings after loading
 */
function decryptSettings(settings: ProjectLLMSettings): ProjectLLMSettings {
  return {
    ...settings,
    providers: settings.providers.map(provider => ({
      ...provider,
      apiKey: provider.apiKey && isEncrypted(provider.apiKey)
        ? decryptApiKey(provider.apiKey)
        : provider.apiKey,
    })),
  };
}

/**
 * Get LLM settings for a project
 * @param projectId - Project ID
 * @returns Settings if found, null otherwise
 */
export async function getLLMSettings(projectId: string): Promise<ProjectLLMSettings | null> {
  const settingsPath = getSettingsPath(projectId);

  try {
    const content = await fs.readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(content) as ProjectLLMSettings;
    return decryptSettings(settings);
  } catch {
    return null;
  }
}

/**
 * Save LLM settings for a project
 * @param projectId - Project ID
 * @param settings - Settings to save
 */
export async function saveLLMSettings(
  projectId: string,
  settings: ProjectLLMSettings
): Promise<void> {
  const settingsPath = getSettingsPath(projectId);
  const projectDir = path.dirname(settingsPath);

  // Ensure project directory exists
  await fs.mkdir(projectDir, { recursive: true });

  // Encrypt API keys before saving
  const encryptedSettings = encryptSettings({
    ...settings,
    projectId,
    updatedAt: new Date().toISOString(),
  });

  await fs.writeFile(settingsPath, JSON.stringify(encryptedSettings, null, 2), 'utf-8');
}

/**
 * Update specific provider settings
 * @param projectId - Project ID
 * @param provider - Provider to update
 * @param updates - Partial settings to update
 */
export async function updateProviderSettings(
  projectId: string,
  provider: LLMProvider,
  updates: Partial<Omit<LLMProviderSettings, 'provider'>>
): Promise<void> {
  // Get existing settings or create default
  let settings = await getLLMSettings(projectId);
  if (!settings) {
    settings = createDefaultProjectLLMSettings(projectId);
  }

  // Find and update the provider
  const providerIndex = settings.providers.findIndex(p => p.provider === provider);
  if (providerIndex >= 0) {
    settings.providers[providerIndex] = {
      ...settings.providers[providerIndex],
      ...updates,
    };
  }

  await saveLLMSettings(projectId, settings);
}

/**
 * Update task stage configuration
 * @param projectId - Project ID
 * @param updates - Partial task stage config to update
 */
export async function updateTaskStageConfig(
  projectId: string,
  updates: Partial<TaskStageConfig>
): Promise<void> {
  // Get existing settings or create default
  let settings = await getLLMSettings(projectId);
  if (!settings) {
    settings = createDefaultProjectLLMSettings(projectId);
  }

  // Merge task stage config
  settings.taskStageConfig = {
    ...settings.taskStageConfig,
    ...updates,
  };

  await saveLLMSettings(projectId, settings);
}

/**
 * Delete LLM settings for a project
 * @param projectId - Project ID
 */
export async function deleteLLMSettings(projectId: string): Promise<void> {
  const settingsPath = getSettingsPath(projectId);

  try {
    await fs.unlink(settingsPath);
  } catch {
    // Ignore if file doesn't exist
  }
}

/**
 * Get LLM settings or default if not exists
 * @param projectId - Project ID
 * @returns Settings (existing or default)
 */
export async function getLLMSettingsOrDefault(projectId: string): Promise<ProjectLLMSettings> {
  const settings = await getLLMSettings(projectId);
  return settings || createDefaultProjectLLMSettings(projectId);
}
