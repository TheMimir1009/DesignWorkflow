/**
 * LLM Provider Base Interface and Classes
 * Common interface for all LLM providers
 */

import type { LLMProvider, LLMModelConfig, LLMResult, ConnectionTestResult } from '../../../src/types/llm';
import { LLMLogger } from '../llmLogger';
import { extractTokenUsage } from '../tokenExtractor';
import { calculateCost } from '../modelPricing';

/**
 * Common interface that all LLM providers must implement
 */
export interface LLMProviderInterface {
  /** Provider identifier */
  readonly provider: LLMProvider;

  /**
   * Generate content using the LLM
   * @param prompt - The prompt to send to the model
   * @param config - Model configuration including temperature, maxTokens, etc.
   * @param workingDir - Working directory for file operations (Claude Code)
   * @returns Promise with the generation result
   */
  generate(prompt: string, config: LLMModelConfig, workingDir?: string): Promise<LLMResult>;

  /**
   * Test the connection to the provider
   * @returns Promise with connection test result
   */
  testConnection(): Promise<ConnectionTestResult>;

  /**
   * Get list of available models for this provider
   * @returns Array of model identifiers
   */
  getAvailableModels(): Promise<string[]>;
}

/**
 * Configuration for creating a provider instance
 */
export interface ProviderConfig {
  apiKey?: string;
  endpoint?: string;
  logger?: LLMLogger; // Optional shared logger instance
}

/**
 * Base class with common functionality for HTTP-based providers
 */
export abstract class BaseHTTPProvider implements LLMProviderInterface {
  abstract readonly provider: LLMProvider;
  protected apiKey: string;
  protected endpoint: string;
  protected logger: LLMLogger;

  constructor(config: ProviderConfig, defaultEndpoint: string) {
    this.apiKey = config.apiKey || '';
    this.endpoint = config.endpoint || defaultEndpoint;
    this.logger = config.logger || new LLMLogger();
  }

  abstract generate(prompt: string, config: LLMModelConfig, workingDir?: string): Promise<LLMResult>;
  abstract testConnection(): Promise<ConnectionTestResult>;
  abstract getAvailableModels(): Promise<string[]>;

  /**
   * Make HTTP request with timeout and error handling
   * Includes logging integration
   */
  protected async makeRequest<T>(
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
          'Authorization': `Bearer ${this.apiKey}`,
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
   * Generate a unique request ID
   */
  protected generateRequestId(): string {
    return `req-${this.provider}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Truncate prompt for logging to avoid excessive log size
   */
  protected truncatePrompt(body: unknown, maxLength: number = 200): string {
    if (typeof body === 'string') {
      return body.length > maxLength ? body.substring(0, maxLength) + '...' : body;
    }

    if (typeof body === 'object' && body !== null) {
      const obj = body as Record<string, unknown>;
      const content = obj.messages || obj.contents || obj.prompt;

      if (Array.isArray(content) && content.length > 0) {
        const firstContent = content[0];
        if (typeof firstContent === 'object' && firstContent !== null) {
          const text = (firstContent as Record<string, unknown>).content ||
                       (firstContent as Record<string, unknown>).text ||
                       (firstContent as Record<string, unknown>).parts?.[0]?.text;
          if (typeof text === 'string') {
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
          }
        }
      }
    }

    return '[Content]';
  }

  /**
   * Get the logger instance for this provider
   */
  getLogger(): LLMLogger {
    return this.logger;
  }

  /**
   * Set a custom logger for this provider
   */
  setLogger(logger: LLMLogger): void {
    this.logger = logger;
  }
}
