/**
 * Google Gemini Provider Implementation
 * Uses Google AI Studio API
 */

import type { LLMModelConfig, LLMResult, ConnectionTestResult } from '../../../src/types/llm';
import { BaseHTTPProvider, type ProviderConfig } from './base';
import { extractTokenUsage } from '../tokenExtractor';
import { calculateCost } from '../modelPricing';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta';

// Gemini API Response Types
interface GeminiContent {
  parts: Array<{
    text: string;
  }>;
  role: string;
}

interface GeminiGenerateResponse {
  candidates: Array<{
    content: GeminiContent;
    finishReason: string;
    safetyRatings: unknown[];
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GeminiModelsResponse {
  models: Array<{
    name: string;
    displayName: string;
    supportedGenerationMethods: string[];
  }>;
}

/**
 * Google Gemini Provider
 * Supports: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
 */
export class GeminiProvider extends BaseHTTPProvider {
  readonly provider = 'gemini' as const;

  constructor(config: ProviderConfig) {
    super(config, GEMINI_API_ENDPOINT);
  }

  async generate(prompt: string, config: LLMModelConfig): Promise<LLMResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Google AI API key not configured',
        provider: this.provider,
        model: config.modelId,
      };
    }

    try {
      // Gemini uses different endpoint structure
      const url = `${this.endpoint}/models/${config.modelId}:generateContent?key=${this.apiKey}`;

      const response = await this.makeGeminiRequest<GeminiGenerateResponse>(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
            topP: config.topP,
          },
        },
        config // Pass config for logging
      );

      const content = response.candidates[0]?.content?.parts[0]?.text || '';

      return {
        success: true,
        content,
        rawOutput: JSON.stringify(response),
        provider: this.provider,
        model: config.modelId,
        tokens: {
          input: response.usageMetadata?.promptTokenCount || 0,
          output: response.usageMetadata?.candidatesTokenCount || 0,
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // List models to test connection
      const response = await fetch(
        `${this.endpoint}/models?key=${this.apiKey}`,
        {
          method: 'GET',
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json() as GeminiModelsResponse;
      const models = this.filterGenerativeModels(data.models);

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
    return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];
  }

  /**
   * Make Gemini-specific request (uses query param for API key)
   * Includes logging integration
   */
  private async makeGeminiRequest<T>(
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
      model: config.modelId,
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
        const estimatedCost = calculateCost(
          this.provider,
          config.modelId,
          tokenUsage.prompt_tokens,
          tokenUsage.completion_tokens
        );

        this.logger.logResponse({
          id: requestId,
          response: {
            usage: tokenUsage,
          },
          metrics: {
            duration_ms: durationMs,
            estimated_cost: estimatedCost > 0 ? estimatedCost : undefined,
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

  /**
   * Filter models to only include generative models
   */
  private filterGenerativeModels(models: GeminiModelsResponse['models']): string[] {
    return models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
  }
}
