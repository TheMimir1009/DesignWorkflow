/**
 * Token Extractor Utility
 * Extracts token usage information from various LLM provider response formats
 *
 * Supports:
 * - OpenAI format (used by OpenAI, LMStudio, and other OpenAI-compatible APIs)
 * - Google Gemini format
 * - ClaudeCode (no token information available)
 */

import type { LLMProvider } from '../../src/types/llm';

/**
 * Standardized token usage format
 */
export interface TokenUsage {
  /** Input/prompt tokens */
  prompt_tokens: number;
  /** Output/completion tokens */
  completion_tokens: number;
  /** Total tokens */
  total_tokens: number;
}

/**
 * Extract token usage from a provider-specific response
 *
 * @param provider - LLM provider name
 * @param response - Raw response from the provider
 * @returns Standardized token usage, or undefined if not available
 */
export function extractTokenUsage(
  provider: LLMProvider,
  response: unknown
): TokenUsage | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  switch (provider) {
    case 'openai':
    case 'lmstudio':
      return extractOpenAIFormat(response);
    case 'gemini':
      return extractGeminiFormat(response);
    case 'claude-code':
      return undefined; // ClaudeCode CLI doesn't provide token usage
    default:
      return undefined;
  }
}

/**
 * Extract tokens from OpenAI-format response
 * Used by OpenAI, LMStudio, and other compatible APIs
 */
function extractOpenAIFormat(response: unknown): TokenUsage | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const obj = response as Record<string, unknown>;
  const usage = obj.usage;

  if (!usage || typeof usage !== 'object') {
    return undefined;
  }

  const usageObj = usage as Record<string, unknown>;
  const promptTokens = usageObj.prompt_tokens;
  const completionTokens = usageObj.completion_tokens;
  const totalTokens = usageObj.total_tokens;

  if (
    typeof promptTokens !== 'number' ||
    typeof completionTokens !== 'number' ||
    typeof totalTokens !== 'number'
  ) {
    return undefined;
  }

  return {
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
  };
}

/**
 * Extract tokens from Gemini-format response
 */
function extractGeminiFormat(response: unknown): TokenUsage | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const obj = response as Record<string, unknown>;
  const usageMetadata = obj.usageMetadata;

  if (!usageMetadata || typeof usageMetadata !== 'object') {
    return undefined;
  }

  const metadataObj = usageMetadata as Record<string, unknown>;
  const promptTokenCount = metadataObj.promptTokenCount;
  const candidatesTokenCount = metadataObj.candidatesTokenCount;
  const totalTokenCount = metadataObj.totalTokenCount;

  if (
    typeof promptTokenCount !== 'number' ||
    typeof candidatesTokenCount !== 'number' ||
    typeof totalTokenCount !== 'number'
  ) {
    return undefined;
  }

  return {
    prompt_tokens: promptTokenCount,
    completion_tokens: candidatesTokenCount,
    total_tokens: totalTokenCount,
  };
}
