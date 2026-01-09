/**
 * LLM Provider Type Definitions
 * Types and utilities for multi-LLM provider integration
 */

// ============================================================================
// Provider and Status Types
// ============================================================================

/** Supported LLM provider identifiers */
export type LLMProvider = 'openai' | 'gemini' | 'claude-code' | 'lmstudio';

/** Connection status for a provider */
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'untested';

/** Task stages that use LLM generation */
export type TaskStage = 'design' | 'prd' | 'prototype';

// ============================================================================
// Constants
// ============================================================================

/** List of all supported providers */
export const LLM_PROVIDERS: readonly LLMProvider[] = [
  'openai',
  'gemini',
  'claude-code',
  'lmstudio',
] as const;

/** Available models per provider */
export const AVAILABLE_MODELS: Record<LLMProvider, readonly string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
  'claude-code': ['claude-3.5-sonnet'],
  lmstudio: [], // Dynamic - fetched from local server
} as const;

/** Default model parameters */
export const DEFAULT_MODEL_PARAMS = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
} as const;

/** Provider display names */
const PROVIDER_DISPLAY_NAMES: Record<LLMProvider, string> = {
  openai: 'OpenAI',
  gemini: 'Google Gemini',
  'claude-code': 'Claude Code',
  lmstudio: 'LMStudio',
};

/** Provider icons (emoji for now, can be replaced with actual icons) */
const PROVIDER_ICONS: Record<LLMProvider, string> = {
  openai: '🧠',
  gemini: '✨',
  'claude-code': '🤖',
  lmstudio: '🏠',
};

// ============================================================================
// Interfaces
// ============================================================================

/** Model configuration with generation parameters */
export interface LLMModelConfig {
  provider: LLMProvider;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

/** Provider-specific settings including API credentials */
export interface LLMProviderSettings {
  provider: LLMProvider;
  apiKey: string;
  endpoint?: string;
  isEnabled: boolean;
  connectionStatus: ConnectionStatus;
  lastTestedAt?: string;
  errorMessage?: string;
}

/** Task stage specific model configuration */
export interface TaskStageConfig {
  designDoc: LLMModelConfig | null;
  prd: LLMModelConfig | null;
  prototype: LLMModelConfig | null;
  defaultModel: LLMModelConfig;
}

/** Complete LLM settings for a project */
export interface ProjectLLMSettings {
  projectId: string;
  providers: LLMProviderSettings[];
  taskStageConfig: TaskStageConfig;
  updatedAt: string;
}

/** Result of LLM generation */
export interface LLMResult {
  success: boolean;
  content?: string;
  rawOutput?: string;
  error?: string;
  provider: LLMProvider;
  model: string;
  tokens?: {
    input: number;
    output: number;
  };
}

/** Result of connection test */
export interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  models?: string[];
  error?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a string is a valid LLM provider
 */
export function isValidProvider(value: string): value is LLMProvider {
  return LLM_PROVIDERS.includes(value as LLMProvider);
}

/**
 * Check if a string is a valid connection status
 */
export function isValidConnectionStatus(value: string): value is ConnectionStatus {
  return ['connected', 'disconnected', 'error', 'untested'].includes(value);
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a default model configuration
 */
export function createDefaultModelConfig(
  provider: LLMProvider,
  modelId: string,
  params?: Partial<Pick<LLMModelConfig, 'temperature' | 'maxTokens' | 'topP'>>
): LLMModelConfig {
  return {
    provider,
    modelId,
    temperature: params?.temperature ?? DEFAULT_MODEL_PARAMS.temperature,
    maxTokens: params?.maxTokens ?? DEFAULT_MODEL_PARAMS.maxTokens,
    topP: params?.topP ?? DEFAULT_MODEL_PARAMS.topP,
  };
}

/**
 * Create default provider settings
 */
export function createDefaultProviderSettings(provider: LLMProvider): LLMProviderSettings {
  const isClaudeCode = provider === 'claude-code';
  const isLMStudio = provider === 'lmstudio';

  return {
    provider,
    apiKey: '',
    endpoint: isLMStudio ? 'http://localhost:1234/v1' : undefined,
    isEnabled: isClaudeCode,
    connectionStatus: isClaudeCode ? 'connected' : 'untested',
  };
}

/**
 * Create default task stage configuration
 */
export function createDefaultTaskStageConfig(): TaskStageConfig {
  return {
    designDoc: null,
    prd: null,
    prototype: null,
    defaultModel: createDefaultModelConfig('claude-code', 'claude-3.5-sonnet'),
  };
}

/**
 * Create default project LLM settings
 */
export function createDefaultProjectLLMSettings(projectId: string): ProjectLLMSettings {
  return {
    projectId,
    providers: LLM_PROVIDERS.map(createDefaultProviderSettings),
    taskStageConfig: createDefaultTaskStageConfig(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get display name for a provider
 */
export function getProviderDisplayName(provider: LLMProvider): string {
  return PROVIDER_DISPLAY_NAMES[provider];
}

/**
 * Get icon for a provider
 */
export function getProviderIcon(provider: LLMProvider): string {
  return PROVIDER_ICONS[provider];
}

/**
 * Get model config for a specific task stage
 */
export function getModelConfigForStage(
  taskStageConfig: TaskStageConfig,
  stage: TaskStage
): LLMModelConfig {
  const stageKey = stage === 'design' ? 'designDoc' : stage;
  const stageConfig = taskStageConfig[stageKey as keyof TaskStageConfig];

  if (stageConfig && typeof stageConfig === 'object' && 'provider' in stageConfig) {
    return stageConfig;
  }

  return taskStageConfig.defaultModel;
}

/**
 * Check if a provider is properly configured (has API key or is Claude Code)
 */
export function isProviderConfigured(settings: LLMProviderSettings): boolean {
  if (settings.provider === 'claude-code') {
    return true;
  }

  if (settings.provider === 'lmstudio') {
    return settings.endpoint !== undefined && settings.endpoint.length > 0;
  }

  return settings.apiKey.length > 0;
}
