/**
 * Claude Code Runner Utility
 * Spawns Claude Code CLI process and collects output
 *
 * Requirements:
 * - REQ-U-001: Spawn claude process with -p flag
 * - REQ-U-002: Collect stdout output
 * - REQ-U-003: Handle errors and non-zero exit codes
 * - REQ-N-001: 120 second timeout (configurable)
 * - REQ-N-002: JSON output format
 */
import { spawn, type ChildProcess, type SpawnOptions } from 'child_process';

/**
 * Default timeout for Claude Code process (120 seconds)
 */
const DEFAULT_TIMEOUT_MS = 120000;

/**
 * Default allowed tools for Claude Code
 */
const DEFAULT_ALLOWED_TOOLS = ['Read', 'Write', 'Grep'];

/**
 * Result of a Claude Code execution
 */
export interface ClaudeCodeResult {
  /** Whether the execution completed successfully */
  success: boolean;
  /** Parsed JSON output, or null if output is not valid JSON */
  output: unknown;
  /** Raw string output from stdout */
  rawOutput: string;
}

/**
 * Options for Claude Code execution
 */
export interface ClaudeCodeOptions {
  /** Timeout in milliseconds (default: 120000) */
  timeout?: number;
  /** List of allowed tools (default: ['Read', 'Write', 'Grep']) */
  allowedTools?: string[];
}

/**
 * Type for spawn function (for dependency injection in tests)
 */
export type SpawnFunction = (
  command: string,
  args: string[],
  options: SpawnOptions
) => ChildProcess;

/**
 * Error thrown when Claude Code process fails
 */
export class ClaudeCodeError extends Error {
  public readonly exitCode: number | null;
  public readonly stderr: string;

  constructor(message: string, exitCode: number | null = null, stderr: string = '') {
    super(message);
    this.name = 'ClaudeCodeError';
    this.exitCode = exitCode;
    this.stderr = stderr;
    Object.setPrototypeOf(this, ClaudeCodeError.prototype);
  }
}

/**
 * Error thrown when Claude Code process times out
 */
export class ClaudeCodeTimeoutError extends Error {
  public readonly timeout: number;

  constructor(message: string, timeout: number) {
    super(message);
    this.name = 'ClaudeCodeTimeoutError';
    this.timeout = timeout;
    Object.setPrototypeOf(this, ClaudeCodeTimeoutError.prototype);
  }
}

/**
 * Internal implementation with injectable spawn function
 */
export function createClaudeCodeRunner(spawnFn: SpawnFunction = spawn) {
  return async function callClaudeCode(
    prompt: string,
    workingDir: string,
    options: ClaudeCodeOptions = {}
  ): Promise<ClaudeCodeResult> {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    const allowedTools = options.allowedTools ?? DEFAULT_ALLOWED_TOOLS;

    return new Promise((resolve, reject) => {
      const args = [
        '-p',
        prompt,
        '--output-format',
        'json',
        '--allowedTools',
        allowedTools.join(','),
      ];

      const process = spawnFn('claude', args, {
        cwd: workingDir,
        stdio: ['ignore', 'pipe', 'pipe']  // stdin: ignore, stdout: pipe, stderr: pipe
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let isCompleted = false;

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          process.kill();
          reject(
            new ClaudeCodeTimeoutError(
              `Claude Code process timed out after ${timeout}ms`,
              timeout
            )
          );
        }
      }, timeout);

      // Collect stdout
      process.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      // Collect stderr
      process.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      // Handle process error (e.g., spawn failure)
      process.on('error', (error: Error) => {
        if (!isCompleted) {
          isCompleted = true;
          if (timeoutId) clearTimeout(timeoutId);
          reject(
            new ClaudeCodeError(
              `Failed to spawn Claude Code process: ${error.message}`,
              null,
              stderr
            )
          );
        }
      });

      // Handle process completion
      process.on('close', (code: number | null) => {
        if (!isCompleted) {
          isCompleted = true;
          if (timeoutId) clearTimeout(timeoutId);

          if (code !== 0) {
            reject(
              new ClaudeCodeError(
                `Claude Code process exited with code ${code}`,
                code,
                stderr
              )
            );
            return;
          }

          // Try to parse output as JSON
          let parsedOutput: unknown = null;
          try {
            if (stdout.trim()) {
              parsedOutput = JSON.parse(stdout);
            }
          } catch {
            // Output is not valid JSON, leave parsedOutput as null
          }

          resolve({
            success: true,
            output: parsedOutput,
            rawOutput: stdout,
          });
        }
      });
    });
  };
}

/**
 * Execute Claude Code CLI with the given prompt
 *
 * @param prompt - The prompt to send to Claude Code
 * @param workingDir - The working directory for the process
 * @param options - Optional configuration
 * @returns Promise resolving to the execution result
 * @throws ClaudeCodeError on process failure
 * @throws ClaudeCodeTimeoutError on timeout
 */
export const callClaudeCode = createClaudeCodeRunner();
