/**
 * LMStudio Provider Implementation
 * Uses OpenAI-compatible API format for local LLM server
 */

import type { LLMModelConfig, LLMResult } from '../../../src/types/llm';
import { BaseHTTPProvider, type ProviderConfig } from './base';
import { extractTokenUsage } from '../tokenExtractor';
import { calculateCost } from '../modelPricing';

const LMSTUDIO_DEFAULT_ENDPOINT = 'http://localhost:1234/v1';

// LMStudio uses OpenAI-compatible API format
interface LMStudioChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LMStudioChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: LMStudioChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LMStudioModelsResponse {
  data: Array<{
    id: string;
    object: string;
  }>;
}

/**
 * LMStudio Provider
 * Supports any model loaded in LMStudio local server
 * Does not require API authentication (local server)
 */
export class LMStudioProvider extends BaseHTTPProvider {
  readonly provider = 'lmstudio' as const;
  protected requiresAuth = false; // LMStudio is a local server, no auth required

  constructor(config: ProviderConfig) {
    super(config, config.endpoint || LMSTUDIO_DEFAULT_ENDPOINT);
    // LMStudio doesn't require API key but set a default for logging
    this.apiKey = config.apiKey || 'lm-studio';
  }

  async generate(prompt: string, config: LLMModelConfig): Promise<LLMResult> {
    try {
      // Use base class makeRequest method (no need for makeLocalRequest)
      const response = await this.makeRequest<LMStudioChatCompletionResponse>(
        `${this.endpoint}/chat/completions`,
        {
          model: config.modelId || 'local-model',
          messages: [
            { role: 'user', content: prompt },
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: config.topP,
        },
        config
      );

      const content = response.choices[0]?.message?.content || '';

      return {
        success: true,
        content,
        rawOutput: JSON.stringify(response),
        provider: this.provider,
        model: config.modelId || response.model,
        tokens: response.usage ? {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
        } : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.provider,
        model: config.modelId,
      };
    }
  }

  /**
   * Get available models from LM Studio server
   * Calls /models endpoint directly with 5 second timeout
   * Returns empty array on error (server not running or other issues)
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as LMStudioModelsResponse;
      return data.data?.map(m => m.id) || [];
    } catch {
      return [];
    }
  }
}
