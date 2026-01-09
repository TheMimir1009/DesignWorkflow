/**
 * Claude Code Provider Implementation
 * Wraps existing claudeCodeRunner for unified interface
 */

import type { LLMModelConfig, LLMResult, ConnectionTestResult } from '../../../src/types/llm';
import type { LLMProviderInterface, ProviderConfig } from './base';
import { callClaudeCode, ClaudeCodeError, ClaudeCodeTimeoutError } from '../claudeCodeRunner';

/**
 * Claude Code Provider
 * Uses Claude Code CLI for generation
 * Always available as fallback (no API key required)
 */
export class ClaudeCodeProvider implements LLMProviderInterface {
  readonly provider = 'claude-code' as const;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config?: ProviderConfig) {
    // Claude Code doesn't need configuration - uses CLI
  }

  async generate(prompt: string, config: LLMModelConfig, workingDir?: string): Promise<LLMResult> {
    const effectiveWorkingDir = workingDir || process.cwd();

    try {
      const result = await callClaudeCode(prompt, effectiveWorkingDir, {
        timeout: 180000, // 3 minutes for document generation
        allowedTools: ['Read', 'Grep'], // Read-only for generation
      });

      // Extract content from result
      let content: string;
      if (typeof result.output === 'string') {
        content = result.output;
      } else if (result.output && typeof result.output === 'object') {
        // Try to extract content from JSON output
        const output = result.output as Record<string, unknown>;
        content = (output.content as string) || (output.result as string) || result.rawOutput;
      } else {
        content = result.rawOutput;
      }

      return {
        success: true,
        content,
        rawOutput: result.rawOutput,
        provider: this.provider,
        model: config.modelId || 'claude-3.5-sonnet',
      };
    } catch (error) {
      if (error instanceof ClaudeCodeTimeoutError) {
        return {
          success: false,
          error: `Generation timed out after ${error.timeout / 1000} seconds`,
          provider: this.provider,
          model: config.modelId,
        };
      }

      if (error instanceof ClaudeCodeError) {
        return {
          success: false,
          error: error.message,
          provider: this.provider,
          model: config.modelId,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.provider,
        model: config.modelId,
      };
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    // Claude Code is always available if CLI is installed
    try {
      const { spawn } = await import('child_process');

      return new Promise((resolve) => {
        const process = spawn('claude', ['--version']);

        process.stdout?.on('data', () => {
          // Version output is not needed
        });

        process.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              latency: 0,
              models: ['claude-3.5-sonnet'],
            });
          } else {
            resolve({
              success: false,
              error: 'Claude Code CLI not found or not configured',
            });
          }
        });

        process.on('error', () => {
          resolve({
            success: false,
            error: 'Claude Code CLI not installed. Install with: npm install -g @anthropic-ai/claude-code',
          });
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          process.kill();
          resolve({
            success: false,
            error: 'Connection test timed out',
          });
        }, 5000);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return ['claude-3.5-sonnet'];
  }
}
