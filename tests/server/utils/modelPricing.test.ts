/**
 * Tests for ModelPricing - Token cost estimation utility
 * Following TDD RED-GREEN-REFACTOR cycle
 */

import { describe, it, expect } from 'vitest';
import { calculateCost, getTokenPricing } from '../../../server/utils/modelPricing';

describe('ModelPricing', () => {
  describe('getTokenPricing', () => {
    it('should return pricing for OpenAI GPT-4o', () => {
      const pricing = getTokenPricing('openai', 'gpt-4o');
      expect(pricing).toBeDefined();
      expect(pricing?.inputPricePer1k).toBeGreaterThan(0);
      expect(pricing?.outputPricePer1k).toBeGreaterThan(0);
    });

    it('should return pricing for OpenAI GPT-4o-mini', () => {
      const pricing = getTokenPricing('openai', 'gpt-4o-mini');
      expect(pricing).toBeDefined();
      expect(pricing?.inputPricePer1k).toBeLessThan(0.01); // Should be cheaper
    });

    it('should return pricing for OpenAI GPT-4-turbo', () => {
      const pricing = getTokenPricing('openai', 'gpt-4-turbo');
      expect(pricing).toBeDefined();
    });

    it('should return pricing for Gemini 1.5 Pro', () => {
      const pricing = getTokenPricing('gemini', 'gemini-1.5-pro');
      expect(pricing).toBeDefined();
    });

    it('should return pricing for Gemini 1.5 Flash', () => {
      const pricing = getTokenPricing('gemini', 'gemini-1.5-flash');
      expect(pricing).toBeDefined();
      expect(pricing?.inputPricePer1k).toBeLessThan(0.01); // Flash should be cheaper
    });

    it('should return pricing for Gemini 2.0 Flash Exp', () => {
      const pricing = getTokenPricing('gemini', 'gemini-2.0-flash-exp');
      expect(pricing).toBeDefined();
    });

    it('should return undefined for unknown provider', () => {
      const pricing = getTokenPricing('unknown' as any, 'model');
      expect(pricing).toBeUndefined();
    });

    it('should return undefined for unknown model', () => {
      const pricing = getTokenPricing('openai', 'unknown-model');
      expect(pricing).toBeUndefined();
    });

    it('should return undefined for LMStudio (local models)', () => {
      const pricing = getTokenPricing('lmstudio', 'local-model');
      expect(pricing).toBeUndefined(); // Local models have no cost
    });

    it('should return undefined for ClaudeCode (uses CLI)', () => {
      const pricing = getTokenPricing('claude-code', 'claude-3.5-sonnet');
      expect(pricing).toBeUndefined(); // CLI usage, not direct API
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for OpenAI GPT-4o', () => {
      const cost = calculateCost('openai', 'gpt-4o', 1000, 500);
      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should calculate cost with zero tokens', () => {
      const cost = calculateCost('openai', 'gpt-4o', 0, 0);
      expect(cost).toBe(0);
    });

    it('should return 0 for LMStudio (local models)', () => {
      const cost = calculateCost('lmstudio', 'local-model', 1000, 500);
      expect(cost).toBe(0);
    });

    it('should return 0 for ClaudeCode (CLI usage)', () => {
      const cost = calculateCost('claude-code', 'claude-3.5-sonnet', 1000, 500);
      expect(cost).toBe(0);
    });

    it('should return 0 for unknown provider', () => {
      const cost = calculateCost('unknown' as any, 'model', 1000, 500);
      expect(cost).toBe(0);
    });

    it('should return 0 for unknown model', () => {
      const cost = calculateCost('openai', 'unknown-model', 1000, 500);
      expect(cost).toBe(0);
    });

    it('should handle large token counts', () => {
      const cost = calculateCost('openai', 'gpt-4o', 100000, 50000);
      expect(cost).toBeGreaterThan(0);
      expect(Number.isFinite(cost)).toBe(true);
    });

    it('should calculate accurate cost for known pricing', () => {
      // GPT-4o: $2.50/1M input, $10/1M output
      // For 1000 input, 500 output:
      // Input: (1000 / 1000) * 0.0025 = 0.0025
      // Output: (500 / 1000) * 0.01 = 0.005
      // Total: 0.0075
      const cost = calculateCost('openai', 'gpt-4o', 1000, 500);
      expect(cost).toBeCloseTo(0.0075, 4); // Allow small floating point errors
    });

    it('should be cheaper for GPT-4o-mini than GPT-4o', () => {
      const cost4o = calculateCost('openai', 'gpt-4o', 1000, 500);
      const costMini = calculateCost('openai', 'gpt-4o-mini', 1000, 500);
      expect(costMini).toBeLessThan(cost4o);
    });

    it('should be cheaper for Gemini Flash than Pro', () => {
      const costPro = calculateCost('gemini', 'gemini-1.5-pro', 1000, 500);
      const costFlash = calculateCost('gemini', 'gemini-1.5-flash', 1000, 500);
      expect(costFlash).toBeLessThan(costPro);
    });
  });
});
