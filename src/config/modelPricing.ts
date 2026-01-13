/**
 * Model Pricing Configuration (SPEC-DEBUG-001 TASK-002)
 * Prices per 1M tokens in USD (standard industry pricing)
 */

import type { ModelPricing } from '../types/debug';

export const MODEL_PRICING: ModelPricing[] = [
  // Claude models (pricing per 1M tokens as per industry standard)
  { model: 'claude-opus-4-5', inputPricePer1K: 3.0, outputPricePer1K: 15.0 },
  { model: 'claude-sonnet-4-5', inputPricePer1K: 1.5, outputPricePer1K: 7.5 },
  { model: 'claude-3-5-sonnet', inputPricePer1K: 3.0, outputPricePer1K: 15.0 },
  { model: 'claude-3-5-haiku', inputPricePer1K: 0.8, outputPricePer1K: 4.0 },
  { model: 'claude-3-opus', inputPricePer1K: 15.0, outputPricePer1K: 75.0 },
  { model: 'claude-3-sonnet', inputPricePer1K: 3.0, outputPricePer1K: 15.0 },

  // GPT models (pricing per 1M tokens as per industry standard)
  { model: 'gpt-4o', inputPricePer1K: 2.5, outputPricePer1K: 10.0 },
  { model: 'gpt-4o-mini', inputPricePer1K: 0.15, outputPricePer1K: 0.6 },
  { model: 'gpt-4-turbo', inputPricePer1K: 10.0, outputPricePer1K: 30.0 },
  { model: 'gpt-4', inputPricePer1K: 30.0, outputPricePer1K: 60.0 },
  { model: 'gpt-3.5-turbo', inputPricePer1K: 0.5, outputPricePer1K: 1.5 },

  // Other models (pricing per 1M tokens as per industry standard)
  { model: 'gemini-2.0-flash', inputPricePer1K: 0.075, outputPricePer1K: 0.3 },
  { model: 'gemini-1.5-pro', inputPricePer1K: 1.25, outputPricePer1K: 5.0 },
];

/**
 * Calculate cost based on model and token usage
 * Note: The pricing field is named "inputPricePer1K" but stores values per 1M tokens
 * (industry standard for LLM pricing). We divide by 1,000,000 to get actual cost.
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING.find((p) => p.model === model);

  if (!pricing) {
    // Default pricing if model not found
    return 0;
  }

  // Pricing is stored as per 1M tokens (despite the field name), so divide by 1,000,000
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPricePer1K;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPricePer1K;

  return inputCost + outputCost;
}

/**
 * Get pricing for a specific model
 */
export function getModelPricing(model: string): ModelPricing | undefined {
  return MODEL_PRICING.find((p) => p.model === model);
}
