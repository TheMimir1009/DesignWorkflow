/**
 * LLM Provider Base Interface and Classes
 * Common interface for all LLM providers
 */

import type { LLMProvider, LLMModelConfig, LLMResult, ConnectionTestResult, ConnectionError, ConnectionErrorCode } from '../../../src/types/llm';
import { LLMLogger } from '../llmLogger';
import { extractTokenUsage } from '../tokenExtractor';
import { calculateCost } from '../modelPricing';

/**
 * Default retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryableErrors: ConnectionErrorCode[];
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'API_ERROR'],
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Classify error into ConnectionErrorCode
 */
function classifyError(error: unknown): ConnectionError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network/timeout errors
    if (message.includes('timeout') || message.includes('timed out') || error.name === 'AbortError') {
      return {
        code: 'TIMEOUT',
        message: error.message,
        retryable: true,
      };
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('econnrefused')) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        retryable: true,
      };
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication') || message.includes('401') || message.includes('403')) {
      return {
        code: 'AUTHENTICATION_FAILED',
        message: error.message,
        retryable: false,
        details: { originalError: error.message },
      };
    }

    // API errors (5xx = retryable, 4xx except auth = not retryable)
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return {
        code: 'API_ERROR',
        message: error.message,
        retryable: true,
        details: { originalError: error.message },
      };
    }

    if (message.includes('400') || message.includes('404') || message.includes('422')) {
      return {
        code: 'API_ERROR',
        message: error.message,
        retryable: false,
        details: { originalError: error.message },
      };
    }

    // Response parsing errors
    if (message.includes('json') || message.includes('parse') || message.includes('invalid response')) {
      return {
        code: 'INVALID_RESPONSE',
        message: error.message,
        retryable: false,
        details: { originalError: error.message },
      };
    }
  }

  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    retryable: true, // Default to retryable for unknown errors
  };
}

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
  retryConfig?: Partial<RetryConfig>; // Optional retry configuration
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  onRetry?: (attempt: number, error: ConnectionError) => void
): Promise<T> {
  let lastError: ConnectionError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const classifiedError = classifyError(error);
      lastError = classifiedError;

      // Don't retry if error is not retryable
      if (!classifiedError.retryable) {
        throw error;
      }

      // Don't retry after last attempt
      if (attempt >= config.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
      );

      onRetry?.(attempt + 1, classifiedError);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Base class with common functionality for HTTP-based providers
 */
export abstract class BaseHTTPProvider implements LLMProviderInterface {
  abstract readonly provider: LLMProvider;
  protected apiKey: string;
  protected endpoint: string;
  protected logger: LLMLogger;
  protected retryConfig: RetryConfig;

  constructor(config: ProviderConfig, defaultEndpoint: string) {
    this.apiKey = config.apiKey || '';
    this.endpoint = config.endpoint || defaultEndpoint;
    this.logger = config.logger || new LLMLogger();
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig };
  }

  abstract generate(prompt: string, config: LLMModelConfig, workingDir?: string): Promise<LLMResult>;
  abstract getAvailableModels(): Promise<string[]>;

  /**
   * Test the connection to the provider with error classification
   * Default implementation using retry logic
   * @param projectId - Optional project ID for connection test logging (SPEC-LLM-002)
   */
  async testConnection(projectId?: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const testId = `test-${this.provider}-${Date.now()}`;

    try {
      // Log connection test start if projectId is provided (SPEC-LLM-002)
      if (projectId) {
        this.logger.logConnectionTestStart({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          startedAt: new Date().toISOString(),
        });
      }

      // Use retry logic for connection test
      const models = await retryWithBackoff(
        () => this.getAvailableModels(),
        this.retryConfig,
        (attempt, error) => {
          this.logger.logError({
            id: `test-${this.provider}-${attempt}`,
            error: {
              message: `Retry attempt ${attempt}: ${error.message}`,
              code: error.code,
            },
          });
        }
      );

      const latency = Date.now() - startTime;

      // Log connection test success if projectId is provided (SPEC-LLM-002)
      if (projectId) {
        this.logger.logConnectionTestSuccess({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          completedAt: new Date().toISOString(),
          latency,
          models,
        });
      }

      return {
        success: true,
        status: 'connected',
        latency,
        models,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const classifiedError = classifyError(error);
      const latency = Date.now() - startTime;

      // Log connection test failure if projectId is provided (SPEC-LLM-002)
      if (projectId) {
        this.logger.logConnectionTestFailure({
          id: testId,
          timestamp: new Date().toISOString(),
          projectId,
          provider: this.provider,
          error: {
            code: classifiedError.code,
            message: classifiedError.message,
            suggestion: this.getErrorSuggestion(classifiedError.code),
          },
        });
      }

      this.logger.logError({
        id: `test-${this.provider}-failed`,
        error: {
          message: classifiedError.message,
          code: classifiedError.code,
        },
      });

      return {
        success: false,
        status: 'error',
        error: classifiedError,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get error suggestion based on error code (SPEC-LLM-002)
   */
  private getErrorSuggestion(errorCode: ConnectionErrorCode): string | undefined {
    const suggestions: Record<ConnectionErrorCode, string> = {
      AUTHENTICATION_FAILED: 'Check your API key in provider settings',
      NETWORK_ERROR: 'Check your network connection and provider endpoint',
      TIMEOUT: 'Check your network connection and try again',
      API_ERROR: 'Provider API is temporarily unavailable, try again later',
      INVALID_RESPONSE: 'Provider returned invalid response, check provider configuration',
      UNKNOWN_ERROR: 'An unknown error occurred, check provider settings and network',
    };

    return suggestions[errorCode];
  }

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
