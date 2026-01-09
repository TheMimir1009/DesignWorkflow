/**
 * OpenAI Provider Implementation
 * Uses OpenAI Chat Completions API
 */

import type { LLMModelConfig, LLMResult, ConnectionTestResult } from '../../../src/types/llm';
import { BaseHTTPProvider, type ProviderConfig } from './base';

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1';

// OpenAI API Response Types
interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIModelsResponse {
  data: Array<{
    id: string;
    object: string;
    owned_by: string;
  }>;
}

/**
 * OpenAI Provider
 * Supports: gpt-4o, gpt-4o-mini, gpt-4-turbo
 */
export class OpenAIProvider extends BaseHTTPProvider {
  readonly provider = 'openai' as const;

  constructor(config: ProviderConfig) {
    super(config, OPENAI_API_ENDPOINT);
  }

  async generate(prompt: string, config: LLMModelConfig): Promise<LLMResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
        provider: this.provider,
        model: config.modelId,
      };
    }

    try {
      const response = await this.makeRequest<OpenAIChatCompletionResponse>(
        `${this.endpoint}/chat/completions`,
        {
          model: config.modelId,
          messages: [
            { role: 'user', content: prompt },
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_p: config.topP,
        }
      );

      const content = response.choices[0]?.message?.content || '';

      return {
        success: true,
        content,
        rawOutput: JSON.stringify(response),
        provider: this.provider,
        model: config.modelId,
        tokens: {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
        },
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
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key not configured',
      };
    }

    const startTime = Date.now();

    try {
      // Use models endpoint to test connection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
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

      const data = await response.json() as OpenAIModelsResponse;
      const models = this.filterChatModels(data.data.map(m => m.id));

      return {
        success: true,
        latency: Date.now() - startTime,
        models,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // Return static list for now; could be dynamic via API
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
  }

  /**
   * Filter models to only include chat-capable models
   */
  private filterChatModels(modelIds: string[]): string[] {
    const chatModelPrefixes = ['gpt-4', 'gpt-3.5'];
    return modelIds.filter(id =>
      chatModelPrefixes.some(prefix => id.startsWith(prefix))
    );
  }
}
