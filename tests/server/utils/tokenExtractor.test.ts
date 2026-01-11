/**
 * Tests for TokenExtractor - Extract token usage from various provider responses
 * Following TDD RED-GREEN-REFACTOR cycle
 */

import { describe, it, expect } from 'vitest';
import { extractTokenUsage } from '../../../server/utils/tokenExtractor';

describe('TokenExtractor', () => {
  describe('OpenAI format', () => {
    it('should extract tokens from OpenAI response', () => {
      const response = {
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      const usage = extractTokenUsage('openai', response);
      expect(usage).toEqual({
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      });
    });

    it('should return undefined if usage is missing', () => {
      const response = {};
      const usage = extractTokenUsage('openai', response);
      expect(usage).toBeUndefined();
    });

    it('should return undefined for partial usage data', () => {
      const response = {
        usage: {
          prompt_tokens: 100,
        },
      };

      const usage = extractTokenUsage('openai', response);
      expect(usage).toBeUndefined(); // Requires all token fields
    });
  });

  describe('Gemini format', () => {
    it('should extract tokens from Gemini response', () => {
      const response = {
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150,
        },
      };

      const usage = extractTokenUsage('gemini', response);
      expect(usage).toEqual({
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      });
    });

    it('should return undefined if usageMetadata is missing', () => {
      const response = {};
      const usage = extractTokenUsage('gemini', response);
      expect(usage).toBeUndefined();
    });

    it('should return undefined for partial usageMetadata', () => {
      const response = {
        usageMetadata: {
          promptTokenCount: 100,
        },
      };

      const usage = extractTokenUsage('gemini', response);
      expect(usage).toBeUndefined(); // Requires all token fields
    });
  });

  describe('LMStudio format', () => {
    it('should extract tokens from LMStudio response (OpenAI compatible)', () => {
      const response = {
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      const usage = extractTokenUsage('lmstudio', response);
      expect(usage).toEqual({
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      });
    });

    it('should handle missing usage in LMStudio response', () => {
      const response = {};
      const usage = extractTokenUsage('lmstudio', response);
      expect(usage).toBeUndefined();
    });
  });

  describe('ClaudeCode format', () => {
    it('should return undefined for ClaudeCode (no token info)', () => {
      const response = {
        output: 'Generated content',
      };

      const usage = extractTokenUsage('claude-code', response);
      expect(usage).toBeUndefined();
    });

    it('should always return undefined for ClaudeCode provider', () => {
      const usage = extractTokenUsage('claude-code', {});
      expect(usage).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should return undefined for unknown provider', () => {
      const usage = extractTokenUsage('unknown' as any, {});
      expect(usage).toBeUndefined();
    });

    it('should handle null response', () => {
      const usage = extractTokenUsage('openai', null as any);
      expect(usage).toBeUndefined();
    });

    it('should handle malformed usage data', () => {
      const response = {
        usage: 'invalid',
      };

      const usage = extractTokenUsage('openai', response);
      expect(usage).toBeUndefined();
    });

    it('should handle zero token values', () => {
      const response = {
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };

      const usage = extractTokenUsage('openai', response);
      expect(usage).toEqual({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      });
    });
  });
});
