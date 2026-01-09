/**
 * LLM Provider Factory
 * Creates LLM provider instances based on configuration
 */

import type { LLMProvider, LLMProviderSettings } from '../../src/types/llm';
import {
  type LLMProviderInterface,
  OpenAIProvider,
  GeminiProvider,
  LMStudioProvider,
  ClaudeCodeProvider,
} from './llmProviders';
import { decryptApiKey, isEncrypted } from './encryption';

/**
 * Create an LLM provider instance based on settings
 * @param settings - Provider settings including API key and endpoint
 * @returns LLM provider instance
 */
export function createLLMProvider(settings: LLMProviderSettings): LLMProviderInterface {
  // Decrypt API key if encrypted
  const apiKey = settings.apiKey && isEncrypted(settings.apiKey)
    ? decryptApiKey(settings.apiKey)
    : settings.apiKey;

  const config = {
    apiKey,
    endpoint: settings.endpoint,
  };

  switch (settings.provider) {
    case 'openai':
      return new OpenAIProvider(config);

    case 'gemini':
      return new GeminiProvider(config);

    case 'lmstudio':
      return new LMStudioProvider(config);

    case 'claude-code':
      return new ClaudeCodeProvider(config);

    default:
      throw new Error(`Unknown provider: ${settings.provider}`);
  }
}

/**
 * Create a provider by ID with minimal configuration
 * Useful for quick provider instantiation
 */
export function createProviderById(
  providerId: LLMProvider,
  apiKey?: string,
  endpoint?: string
): LLMProviderInterface {
  return createLLMProvider({
    provider: providerId,
    apiKey: apiKey || '',
    endpoint,
    isEnabled: true,
    connectionStatus: 'untested',
  });
}

/**
 * Get the default provider (Claude Code)
 * Always available as fallback
 */
export function getDefaultProvider(): LLMProviderInterface {
  return new ClaudeCodeProvider();
}

/**
 * Check if a provider type requires an API key
 */
export function requiresApiKey(provider: LLMProvider): boolean {
  switch (provider) {
    case 'openai':
    case 'gemini':
      return true;
    case 'lmstudio':
    case 'claude-code':
      return false;
    default:
      return true;
  }
}

/**
 * Get default endpoint for a provider
 */
export function getDefaultEndpoint(provider: LLMProvider): string | undefined {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta';
    case 'lmstudio':
      return 'http://localhost:1234/v1';
    case 'claude-code':
      return undefined;
    default:
      return undefined;
  }
}

// Re-export types and providers
export type { LLMProviderInterface } from './llmProviders';
export { OpenAIProvider, GeminiProvider, LMStudioProvider, ClaudeCodeProvider } from './llmProviders';
