/**
 * LMStudio Provider Implementation
 * Uses OpenAI-compatible API format for local LLM server
 */

import type { LLMModelConfig, LLMResult, ConnectionTestResult } from '../../../src/types/llm';
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
 */
export class LMStudioProvider extends BaseHTTPProvider {
  readonly provider = 'lmstudio' as const;

  constructor(config: ProviderConfig) {
    super(config, config.endpoint || LMSTUDIO_DEFAULT_ENDPOINT);
    // LMStudio doesn't require API key
    this.apiKey = config.apiKey || 'lm-studio';
  }

  async generate(prompt: string, config: LLMModelConfig): Promise<LLMResult> {
    try {
      const response = await this.makeLocalRequest<LMStudioChatCompletionResponse>(
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
        config // Pass config for logging
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

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json() as LMStudioModelsResponse;
      const models = data.data?.map(m => m.id) || [];

      return {
        success: true,
        latency: Date.now() - startTime,
        models,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      // Provide helpful message for common connection errors
      if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
        return {
          success: false,
          error: 'LMStudio server not running. Please start the server in LMStudio app.',
        };
      }

      return {
        success: false,
        error: message,
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const result = await this.testConnection();
      return result.models || [];
    } catch {
      return [];
    }
  }

  /**
   * Make request to local LMStudio server (no auth required)
   * Includes logging integration
   */
  private async makeLocalRequest<T>(
    url: string,
    body: unknown,
    config: LLMModelConfig,
    timeoutMs: number = 120000
  ): Promise<T> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    // Log request before API call
    this.logger.logRequest({
      id: requestId,
      provider: this.provider,
      model: config.modelId || 'local-model',
      request: {
        prompt: this.truncatePrompt(body),
        parameters: {
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          topP: config.topP,
        },
      },
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`HTTP ${response.status}: ${errorText}`);

        // Log error
        this.logger.logError({
          id: requestId,
          error: {
            message: error.message,
            code: response.status.toString(),
          },
        });

        throw error;
      }

      const data = await response.json() as T;
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      // Extract token usage and log response
      const tokenUsage = extractTokenUsage(this.provider, data);
      if (tokenUsage) {
        // LMStudio is local, so no cost
        this.logger.logResponse({
          id: requestId,
          response: {
            usage: tokenUsage,
          },
          metrics: {
            duration_ms: durationMs,
          },
        });
      } else {
        // Log response without token usage
        this.logger.logResponse({
          id: requestId,
          metrics: {
            duration_ms: endTime - startTime,
          },
        });
      }

      return data;
    } catch (error) {
      // Log error if not already logged
      if (error instanceof Error) {
        this.logger.logError({
          id: requestId,
          error: {
            message: error.message,
          },
        });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
