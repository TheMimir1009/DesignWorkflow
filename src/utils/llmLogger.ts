/**
 * LLM Logger Utility (SPEC-DEBUG-001 TAG-002)
 *
 * Automatically logs LLM API calls for debugging purposes
 * Features:
 * - Request/Response logging
 * - Token usage tracking
 * - Error handling
 * - API key sanitization (REQ-W-003)
 */

import type {
  LLMCallLog,
  LLMRequestConfig,
  LLMResponse,
  TokenUsage,
} from '../types/debug';
import { useDebugStore } from '../store/debugStore';

/**
 * Generate unique ID for log entries
 */
function generateId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mask API key for security (REQ-W-003)
 */
function maskApiKey(key: string): string {
  if (!key || key.length < 10) {
    return '****';
  }

  // Show first 8 and last 4 characters with **** masking
  return `${key.substring(0, 8)}****...${key.substring(key.length - 4)}`;
}

/**
 * Sanitize headers by removing sensitive information
 */
function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized = { ...headers };

  // List of sensitive header names (case-insensitive)
  const sensitiveHeaders = ['x-api-key', 'authorization', 'openai-organization'];

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveHeaders.some((h) => h.toLowerCase() === lowerKey)) {
      sanitized[key] = maskApiKey(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Extract token usage from response body
 */
function extractUsage(response: LLMResponse): TokenUsage {
  const body = response.body as any;

  if (!body) {
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }

  // Claude format
  if (body.usage?.input_tokens !== undefined) {
    return {
      inputTokens: body.usage.input_tokens,
      outputTokens: body.usage.output_tokens,
      totalTokens: body.usage.input_tokens + body.usage.output_tokens,
    };
  }

  // OpenAI format
  if (body.usage?.prompt_tokens !== undefined) {
    return {
      inputTokens: body.usage.prompt_tokens,
      outputTokens: body.usage.completion_tokens,
      totalTokens: body.usage.total_tokens,
    };
  }

  return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
}

/**
 * LLM Logger class for automatic API call logging
 */
export class LLMLogger {
  /**
   * Log an API request
   * @param config - Request configuration
   * @returns Log ID for later updating
   */
  public logRequest(config: LLMRequestConfig): string {
    const logId = generateId();

    const log: LLMCallLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      model: config.model,
      provider: config.provider,
      endpoint: config.endpoint,
      method: config.method || 'POST',
      status: 'pending',
      requestHeaders: sanitizeHeaders(config.headers),
      requestBody: config.body,
    };

    // Get fresh store state to ensure we have latest
    const store = useDebugStore.getState();
    store.addLog(log);

    return logId;
  }

  /**
   * Log an API response
   * @param logId - Log ID from logRequest
   * @param response - Response data
   */
  public logResponse(logId: string, response: LLMResponse): void {
    const usage = extractUsage(response);

    // Get fresh store state to ensure we have latest
    const store = useDebugStore.getState();
    store.updateLog(logId, {
      status: 'success',
      statusCode: response.status,
      duration: response.duration,
      responseHeaders: response.headers,
      responseBody: response.body,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
    });
  }

  /**
   * Log an API error
   * @param logId - Log ID from logRequest
   * @param error - Error object
   */
  public logError(logId: string, error: Error): void {
    const errorMessage = error.message || String(error);

    // Get fresh store state to ensure we have latest
    const store = useDebugStore.getState();
    store.updateLog(logId, {
      status: 'error',
      error: errorMessage,
    });
  }

  /**
   * Sanitize headers (exposed for testing)
   * @internal
   */
  public static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    return sanitizeHeaders(headers);
  }

  /**
   * Extract usage from response (exposed for testing)
   * @internal
   */
  public static extractUsage(response: LLMResponse): TokenUsage {
    return extractUsage(response);
  }
}

// Export singleton instance
export const llmLogger = new LLMLogger();
