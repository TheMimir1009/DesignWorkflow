/**
 * Claude Code Provider Implementation
 * Wraps existing claudeCodeRunner for unified interface
 */

import type { LLMModelConfig, LLMResult, ConnectionTestResult } from '../../../src/types/llm';
import type { LLMProviderInterface, ProviderConfig } from './base';
import { callClaudeCode, ClaudeCodeError, ClaudeCodeTimeoutError } from '../claudeCodeRunner';
import { LLMLogger } from '../llmLogger';

/**
 * Claude Code Provider
 * Uses Claude Code CLI for generation
 * Always available as fallback (no API key required)
 */
export class ClaudeCodeProvider implements LLMProviderInterface {
  readonly provider = 'claude-code' as const;
  private logger: LLMLogger;
  // 메모리 누수 수정: setTimeout ID를 저장하여 타이머 정리 가능
  private testTimeoutId: NodeJS.Timeout | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_config?: ProviderConfig) {
    // Claude Code doesn't need configuration - uses CLI
    this.logger = new LLMLogger();
  }

  async generate(prompt: string, config: LLMModelConfig, workingDir?: string): Promise<LLMResult> {
    const effectiveWorkingDir = workingDir || process.cwd();
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    // Log request
    this.logger.logRequest({
      id: requestId,
      provider: this.provider,
      model: config.modelId || 'claude-3.5-sonnet',
      request: {
        prompt: this.truncatePrompt(prompt),
        parameters: {
          timeout: 180000,
          allowedTools: ['Read', 'Grep'],
        },
      },
    });

    try {
      const result = await callClaudeCode(prompt, effectiveWorkingDir, {
        timeout: 180000, // 3 minutes for document generation
        allowedTools: ['Read', 'Grep'], // Read-only for generation
      });

      const endTime = Date.now();
      const durationMs = endTime - startTime;

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

      // Log response (ClaudeCode doesn't provide token usage)
      this.logger.logResponse({
        id: requestId,
        response: {
          content: content.substring(0, 200), // Truncate for logging
        },
        metrics: {
          duration_ms: durationMs,
        },
      });

      return {
        success: true,
        content,
        rawOutput: result.rawOutput,
        provider: this.provider,
        model: config.modelId || 'claude-3.5-sonnet',
      };
    } catch (error) {
      // Log error
      if (error instanceof Error) {
        this.logger.logError({
          id: requestId,
          error: {
            message: error.message,
            code: error instanceof ClaudeCodeTimeoutError ? 'TIMEOUT' : error instanceof ClaudeCodeError ? 'CLAUDE_CODE_ERROR' : undefined,
          },
        });
      }

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
          // 메모리 누수 수정: 타이머 정리
          this.clearTestTimeout();

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
          // 메모리 누수 수정: 타이머 정리
          this.clearTestTimeout();

          resolve({
            success: false,
            error: 'Claude Code CLI not installed. Install with: npm install -g @anthropic-ai/claude-code',
          });
        });

        // 메모리 누수 수정: setTimeout ID를 저장하여 나중에 정리 가능
        this.testTimeoutId = setTimeout(() => {
          process.kill();
          resolve({
            success: false,
            error: 'Connection test timed out',
          });
        }, 5000);
      });
    } catch (error) {
      // 메모리 누수 수정: 에러 발생 시에도 타이머 정리
      this.clearTestTimeout();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 메모리 누수 수정: 테스트 타이머를 정리하여 메모리 누수 방지
   */
  private clearTestTimeout(): void {
    if (this.testTimeoutId !== null) {
      clearTimeout(this.testTimeoutId);
      this.testTimeoutId = null;
    }
  }

  /**
   * 메모리 누수 수정: provider 인스턴스가 더 이상 필요하지 않을 때 정리
   */
  cleanup(): void {
    this.clearTestTimeout();
  }

  async getAvailableModels(): Promise<string[]> {
    return ['claude-3.5-sonnet'];
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req-${this.provider}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Truncate prompt for logging to avoid excessive log size
   */
  private truncatePrompt(prompt: string, maxLength: number = 200): string {
    return prompt.length > maxLength ? prompt.substring(0, maxLength) + '...' : prompt;
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
