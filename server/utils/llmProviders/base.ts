/**
 * LLM Provider Base Interface and Classes
 * Common interface for all LLM providers
 */

import type { LLMProvider, LLMModelConfig, LLMResult, ConnectionTestResult } from '../../../src/types/llm';

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
}

/**
 * Base class with common functionality for HTTP-based providers
 */
export abstract class BaseHTTPProvider implements LLMProviderInterface {
  abstract readonly provider: LLMProvider;
  protected apiKey: string;
  protected endpoint: string;

  constructor(config: ProviderConfig, defaultEndpoint: string) {
    this.apiKey = config.apiKey || '';
    this.endpoint = config.endpoint || defaultEndpoint;
  }

  abstract generate(prompt: string, config: LLMModelConfig, workingDir?: string): Promise<LLMResult>;
  abstract testConnection(): Promise<ConnectionTestResult>;
  abstract getAvailableModels(): Promise<string[]>;

  /**
   * Make HTTP request with timeout and error handling
   */
  protected async makeRequest<T>(
    url: string,
    body: unknown,
    timeoutMs: number = 120000
  ): Promise<T> {
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
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json() as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
