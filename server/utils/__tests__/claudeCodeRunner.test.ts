/**
 * Test Suite: claudeCodeRunner
 * TDD implementation for Claude Code process spawn and output collection
 *
 * Requirements covered:
 * - REQ-U-001: Claude Code process spawn
 * - REQ-U-002: Output collection
 * - REQ-U-003: Error handling
 * - REQ-N-001: 120 second timeout
 * - REQ-N-002: JSON output format
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { EventEmitter } from 'events';
import {
  createClaudeCodeRunner,
  ClaudeCodeError,
  ClaudeCodeTimeoutError,
  type SpawnFunction,
} from '../claudeCodeRunner.ts';

// Type for mock process
interface MockProcess extends EventEmitter {
  stdout: EventEmitter;
  stderr: EventEmitter;
  pid: number;
  kill: Mock;
}

// Helper to create mock process
function createMockProcess(): MockProcess {
  const mockProcess = new EventEmitter() as MockProcess;
  mockProcess.stdout = new EventEmitter();
  mockProcess.stderr = new EventEmitter();
  mockProcess.pid = 12345;
  mockProcess.kill = vi.fn();
  return mockProcess;
}

describe('claudeCodeRunner', () => {
  let mockSpawn: Mock;
  let mockProcess: MockProcess;

  beforeEach(() => {
    vi.useFakeTimers();
    mockProcess = createMockProcess();
    mockSpawn = vi.fn().mockReturnValue(mockProcess);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('callClaudeCode', () => {
    it('should spawn claude process with correct arguments', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const prompt = 'Generate a component';
      const workingDir = '/path/to/project';

      const resultPromise = callClaudeCode(prompt, workingDir);

      // Simulate successful completion
      mockProcess.stdout.emit('data', Buffer.from('{"result": "success"}'));
      mockProcess.emit('close', 0);

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        ['-p', prompt, '--output-format', 'json', '--allowedTools', 'Read,Write,Grep'],
        { cwd: workingDir, stdio: ['ignore', 'pipe', 'pipe'] }
      );
    });

    it('should collect stdout output and return as JSON', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      // Simulate chunked output
      mockProcess.stdout.emit('data', Buffer.from('{"status":'));
      mockProcess.stdout.emit('data', Buffer.from('"complete","data":"test"}'));
      mockProcess.emit('close', 0);

      const result = await resultPromise;

      expect(result).toEqual({
        success: true,
        output: { status: 'complete', data: 'test' },
        rawOutput: '{"status":"complete","data":"test"}',
      });
    });

    it('should handle non-JSON output gracefully', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      mockProcess.stdout.emit('data', Buffer.from('Plain text output'));
      mockProcess.emit('close', 0);

      const result = await resultPromise;

      expect(result).toEqual({
        success: true,
        output: null,
        rawOutput: 'Plain text output',
      });
    });

    it('should reject with ClaudeCodeError on non-zero exit code', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      mockProcess.stderr.emit('data', Buffer.from('Command failed'));
      mockProcess.emit('close', 1);

      await expect(resultPromise).rejects.toThrow(ClaudeCodeError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining('Claude Code process exited with code 1'),
        exitCode: 1,
        stderr: 'Command failed',
      });
    });

    it('should reject with ClaudeCodeError on process error', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      mockProcess.emit('error', new Error('spawn ENOENT'));

      await expect(resultPromise).rejects.toThrow(ClaudeCodeError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining('Failed to spawn Claude Code process'),
      });
    });

    it('should timeout after 120 seconds by default', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      // Fast-forward 120 seconds
      vi.advanceTimersByTime(120000);

      await expect(resultPromise).rejects.toThrow(ClaudeCodeTimeoutError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining('timed out after 120000ms'),
        timeout: 120000,
      });
      expect(mockProcess.kill).toHaveBeenCalled();
    });

    it('should respect custom timeout option', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const options = { timeout: 30000 };
      const resultPromise = callClaudeCode('test prompt', '/test/dir', options);

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      await expect(resultPromise).rejects.toThrow(ClaudeCodeTimeoutError);
      await expect(resultPromise).rejects.toMatchObject({
        timeout: 30000,
      });
    });

    it('should support custom allowed tools', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const options = {
        allowedTools: ['Read', 'Grep'],
      };

      const resultPromise = callClaudeCode('test prompt', '/test/dir', options);

      mockProcess.stdout.emit('data', Buffer.from('{}'));
      mockProcess.emit('close', 0);

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        'claude',
        expect.arrayContaining(['--allowedTools', 'Read,Grep']),
        expect.any(Object)
      );
    });

    it('should handle empty output', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      mockProcess.emit('close', 0);

      const result = await resultPromise;

      expect(result).toEqual({
        success: true,
        output: null,
        rawOutput: '',
      });
    });

    it('should collect stderr separately from stdout', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      mockProcess.stdout.emit('data', Buffer.from('{"result": "ok"}'));
      mockProcess.stderr.emit('data', Buffer.from('Warning: something'));
      mockProcess.emit('close', 0);

      const result = await resultPromise;

      // Successful completion should not include stderr in error
      expect(result.success).toBe(true);
    });

    it('should clear timeout on successful completion', async () => {
      const callClaudeCode = createClaudeCodeRunner(mockSpawn as unknown as SpawnFunction);

      const resultPromise = callClaudeCode('test prompt', '/test/dir');

      // Complete before timeout
      mockProcess.stdout.emit('data', Buffer.from('{}'));
      mockProcess.emit('close', 0);

      await resultPromise;

      // Advance past timeout - should not throw
      vi.advanceTimersByTime(150000);
      expect(mockProcess.kill).not.toHaveBeenCalled();
    });
  });

  describe('ClaudeCodeError', () => {
    it('should contain exit code and stderr', () => {
      const error = new ClaudeCodeError('Test error', 1, 'stderr content');

      expect(error.message).toBe('Test error');
      expect(error.exitCode).toBe(1);
      expect(error.stderr).toBe('stderr content');
      expect(error.name).toBe('ClaudeCodeError');
    });

    it('should be instance of Error', () => {
      const error = new ClaudeCodeError('Test error');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ClaudeCodeTimeoutError', () => {
    it('should contain timeout value', () => {
      const error = new ClaudeCodeTimeoutError('Timeout error', 120000);

      expect(error.message).toBe('Timeout error');
      expect(error.timeout).toBe(120000);
      expect(error.name).toBe('ClaudeCodeTimeoutError');
    });

    it('should be instance of Error', () => {
      const error = new ClaudeCodeTimeoutError('Timeout error', 120000);
      expect(error).toBeInstanceOf(Error);
    });
  });
});
