/**
 * LLM Debug Response Builder
 * Extracts and formats LLM debug information for API responses
 *
 * This module provides utilities to:
 * - Extract the latest LLM log entry
 * - Format debug information for client consumption
 * - Build debug response objects
 */

import type { LLMLogEntry } from './llmLogger';
import { getSharedLogs } from './llmProvider';

/**
 * LLM Debug Information Format
 * Matches the structure expected by the client
 */
export interface LLMDebugInfo {
  /** LLM provider name */
  provider: string;
  /** Model identifier */
  model: string;
  /** Token usage information */
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  /** Estimated cost in USD */
  cost?: number;
  /** Request duration in milliseconds */
  duration_ms: number;
  /** Request ID for tracing */
  requestId: string;
  /** Timestamp of the request */
  timestamp: string;
}

/**
 * Debug response format
 */
export interface DebugResponse {
  llm?: LLMDebugInfo;
}

/**
 * Extract the most recent LLM log entry and format as debug info
 *
 * @param provider - Provider name (for filtering)
 * @param model - Model name (for filtering)
 * @returns Formatted LLM debug info, or undefined if no logs available
 */
export function extractLatestDebugInfo(
  provider?: string,
  model?: string
): LLMDebugInfo | undefined {
  const logs = getSharedLogs();

  if (logs.length === 0) {
    return undefined;
  }

  // Get the most recent log (last in array)
  const latestLog = logs[logs.length - 1];

  // Filter by provider/model if specified
  if (provider && latestLog.provider !== provider) {
    // Try to find the most recent matching log
    const matchingLog = [...logs]
      .reverse()
      .find(log => log.provider === provider && (!model || log.model === model));

    if (!matchingLog) {
      return undefined;
    }
    return formatDebugInfo(matchingLog);
  }

  return formatDebugInfo(latestLog);
}

/**
 * Format a log entry as debug info
 */
function formatDebugInfo(log: LLMLogEntry): LLMDebugInfo {
  const debugInfo: LLMDebugInfo = {
    provider: log.provider,
    model: log.model,
    duration_ms: log.metrics?.duration_ms || 0,
    requestId: log.id,
    timestamp: log.timestamp,
  };

  // Add token usage if available
  if (log.response?.usage) {
    debugInfo.tokens = {
      prompt: log.response.usage.prompt_tokens,
      completion: log.response.usage.completion_tokens,
      total: log.response.usage.total_tokens,
    };
  }

  // Add estimated cost if available
  if (log.metrics?.estimated_cost) {
    debugInfo.cost = log.metrics.estimated_cost;
  }

  return debugInfo;
}

/**
 * Build a debug response object
 *
 * @param provider - Provider name (for filtering)
 * @param model - Model name (for filtering)
 * @returns Debug response object with LLM info if available
 */
export function buildDebugResponse(
  provider?: string,
  model?: string
): DebugResponse {
  const llmInfo = extractLatestDebugInfo(provider, model);

  if (!llmInfo) {
    return {};
  }

  return {
    llm: llmInfo,
  };
}
