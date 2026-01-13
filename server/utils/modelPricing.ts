/**
 * Model Pricing Utility
 * Provides token pricing information and cost calculation for LLM providers
 *
 * Pricing data as of 2025:
 * - OpenAI: https://openai.com/pricing
 * - Google Gemini: https://ai.google.dev/pricing
 */

import type { LLMProvider } from '../../src/types/llm';

/**
 * Token pricing information for a specific model
 */
export interface TokenPricing {
  /** Price per 1000 input tokens in USD */
  inputPricePer1k: number;
  /** Price per 1000 output tokens in USD */
  outputPricePer1k: number;
}

/**
 * Pricing database for all supported models
 * Prices are in USD per 1000 tokens
 */
const PRICING_DATABASE: Record<string, Record<string, TokenPricing>> = {
  openai: {
    'gpt-4o': {
      inputPricePer1k: 0.0025, // $2.50/1M input
      outputPricePer1k: 0.01,  // $10.00/1M output
    },
    'gpt-4o-mini': {
      inputPricePer1k: 0.00015, // $0.15/1M input
      outputPricePer1k: 0.0006,  // $0.60/1M output
    },
    'gpt-4-turbo': {
      inputPricePer1k: 0.01,  // $10.00/1M input
      outputPricePer1k: 0.03,  // $30.00/1M output
    },
  },
  gemini: {
    'gemini-1.5-pro': {
      inputPricePer1k: 0.00125, // $1.25/1M input
      outputPricePer1k: 0.005,   // $5.00/1M output
    },
    'gemini-1.5-flash': {
      inputPricePer1k: 0.000075, // $0.075/1M input
      outputPricePer1k: 0.00015,  // $0.15/1M output
    },
    'gemini-2.0-flash-exp': {
      inputPricePer1k: 0.000075, // $0.075/1M input (experimental)
      outputPricePer1k: 0.00015,  // $0.15/1M output (experimental)
    },
  },
  // LMStudio and ClaudeCode don't have direct API costs
  lmstudio: {},
  'claude-code': {},
};

/**
 * Get token pricing for a specific provider and model
 *
 * @param provider - LLM provider name
 * @param model - Model identifier
 * @returns Token pricing information, or undefined if not available
 */
export function getTokenPricing(
  provider: LLMProvider,
  model: string
): TokenPricing | undefined {
  return PRICING_DATABASE[provider]?.[model];
}

/**
 * Calculate cost for token usage
 *
 * @param provider - LLM provider name
 * @param model - Model identifier
 * @param inputTokens - Number of input/prompt tokens
 * @param outputTokens - Number of output/completion tokens
 * @returns Estimated cost in USD, or 0 if pricing not available
 */
export function calculateCost(
  provider: LLMProvider,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = getTokenPricing(provider, model);

  if (!pricing) {
    // Local models or CLI usage have no direct cost
    return 0;
  }

  const inputCost = (inputTokens / 1000) * pricing.inputPricePer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputPricePer1k;

  return inputCost + outputCost;
}
