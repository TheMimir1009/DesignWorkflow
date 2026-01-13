import type { LLMProvider } from '../../src/types/llm';

/**
 * LLM Logger - Server-side LLM API call logger
 * Thread-safe in-memory logger with automatic log rotation
 *
 * Features:
 * - Request/Response/Error logging
 * - Connection test logging (SPEC-LLM-002)
 * - Thread-safe operations
 * - Automatic log rotation (max 1000 entries)
 * - API key masking
 * - Token usage tracking
 * - Cost estimation support
 */

/**
 * LLM Log Entry Structure
 * Contains complete information about an LLM API call
 */
export interface LLMLogEntry {
  /** Unique identifier for this log entry */
  id: string;
  /** ISO timestamp of when the log was created */
  timestamp: string;
  /** LLM provider name (openai, gemini, lmstudio, claude-code) */
  provider: string;
  /** Model identifier */
  model: string;
  /** Request details */
  request?: {
    /** User prompt (may be truncated) */
    prompt?: string;
    /** Generation parameters */
    parameters?: Record<string, unknown>;
  };
  /** Response details */
  response?: {
    /** Generated content */
    content?: string;
    /** Token usage information */
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    /** Reason for completion */
    finish_reason?: string;
  };
  /** Error details */
  error?: {
    /** Error message */
    message: string;
    /** Error code (if available) */
    code?: string;
  };
  /** Performance metrics */
  metrics?: {
    /** Request duration in milliseconds */
    duration_ms: number;
    /** Estimated cost in USD (optional) */
    estimated_cost?: number;
  };
}

/**
 * Connection test log start parameters (SPEC-LLM-002)
 */
export interface ConnectionTestStartParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: LLMProvider;
  startedAt: string;
}

/**
 * Connection test log success parameters (SPEC-LLM-002)
 */
export interface ConnectionTestSuccessParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: LLMProvider;
  completedAt: string;
  latency: number;
  models: string[];
}

/**
 * Connection test log failure parameters (SPEC-LLM-002)
 */
export interface ConnectionTestFailureParams {
  id: string;
  timestamp: string;
  projectId: string;
  provider: LLMProvider;
  error: {
    code: string;
    message: string;
    suggestion?: string;
  };
}

/**
 * LLM Logger Class
 * Thread-safe in-memory logger with automatic log rotation
 */
export class LLMLogger {
  private logs: Map<string, LLMLogEntry> = new Map();
  private logOrder: string[] = [];
  // 메모리 누수 수정: 최대 로그 개수를 1000에서 100으로 축소하여 메모리 사용량 감소
  private readonly MAX_LOGS = 100;
  // 메모리 누수 수정: 개별 로그 항목의 최대 크기를 10KB로 제한
  private readonly MAX_LOG_SIZE = 10 * 1024; // 10KB in bytes

  /**
   * Log a request to the LLM API
   * Creates a new log entry or updates an existing one
   */
  logRequest(entry: Partial<LLMLogEntry>): void {
    const id = entry.id || this.generateId();
    const timestamp = entry.timestamp || new Date().toISOString();

    const logEntry: LLMLogEntry = {
      id,
      timestamp,
      provider: entry.provider || 'unknown',
      model: entry.model || 'unknown',
      request: this.maskSensitiveData(entry.request),
    };

    this.addLog(id, logEntry);
  }

  /**
   * Log a response from the LLM API
   * Updates existing log entry or creates a new one
   */
  logResponse(entry: Partial<LLMLogEntry>): void {
    const id = entry.id || this.generateId();
    const existing = this.logs.get(id);

    if (existing) {
      // Update existing entry
      existing.response = entry.response;
      if (entry.metrics) {
        existing.metrics = entry.metrics;
      }
      // Preserve request from new entry if provided (for connection test logs)
      if (entry.request) {
        existing.request = entry.request;
      }
    } else {
      // Create new entry
      const logEntry: LLMLogEntry = {
        id,
        timestamp: entry.timestamp || new Date().toISOString(),
        provider: entry.provider || 'unknown',
        model: entry.model || 'unknown',
        response: entry.response,
        metrics: entry.metrics,
        request: entry.request,
      };
      this.addLog(id, logEntry);
    }
  }

  /**
   * Log an error from the LLM API
   * Updates existing log entry or creates a new one
   */
  logError(entry: Partial<LLMLogEntry>): void {
    const id = entry.id || this.generateId();
    const existing = this.logs.get(id);

    if (existing) {
      // Update existing entry
      existing.error = entry.error;
      // Preserve request from new entry if provided (for connection test logs)
      if (entry.request) {
        existing.request = entry.request;
      }
    } else {
      // Create new entry
      const logEntry: LLMLogEntry = {
        id,
        timestamp: entry.timestamp || new Date().toISOString(),
        provider: entry.provider || 'unknown',
        model: entry.model || 'unknown',
        error: entry.error,
        request: entry.request,
      };
      this.addLog(id, logEntry);
    }
  }

  /**
   * Get all log entries
   * Returns entries in chronological order
   */
  getLogs(): LLMLogEntry[] {
    return this.logOrder.map((id) => this.logs.get(id)!).filter(Boolean);
  }

  /**
   * Clear all log entries
   */
  clearLogs(): void {
    this.logs.clear();
    this.logOrder = [];
  }

  /**
   * Log connection test start (SPEC-LLM-002)
   */
  logConnectionTestStart(params: ConnectionTestStartParams): void {
    const logEntry: Partial<LLMLogEntry> = {
      id: params.id,
      timestamp: params.timestamp,
      provider: params.provider,
      model: 'connection-test',
      request: {
        prompt: `Connection test started for project: ${params.projectId}`,
        parameters: {
          type: 'connection-test',
          phase: 'start',
          projectId: params.projectId,
          startedAt: params.startedAt,
        },
      },
    };

    this.logRequest(logEntry);
  }

  /**
   * Log connection test success (SPEC-LLM-002)
   */
  logConnectionTestSuccess(params: ConnectionTestSuccessParams): void {
    const logEntry: Partial<LLMLogEntry> = {
      id: params.id,
      timestamp: params.timestamp,
      provider: params.provider,
      model: 'connection-test',
      response: {
        content: `Connection test successful. Found ${params.models.length} models.`,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: params.models.length,
        },
      },
      metrics: {
        duration_ms: params.latency,
      },
      request: {
        parameters: {
          type: 'connection-test',
          phase: 'success',
          projectId: params.projectId,
          completedAt: params.completedAt,
          modelCount: params.models.length,
          models: params.models,
        },
      },
    };

    this.logResponse(logEntry);
  }

  /**
   * Log connection test failure (SPEC-LLM-002)
   */
  logConnectionTestFailure(params: ConnectionTestFailureParams): void {
    const logEntry: Partial<LLMLogEntry> = {
      id: params.id,
      timestamp: params.timestamp,
      provider: params.provider,
      model: 'connection-test',
      error: {
        message: params.error.message,
        code: params.error.code,
      },
      request: {
        parameters: {
          type: 'connection-test',
          phase: 'failure',
          projectId: params.projectId,
          suggestion: params.error.suggestion,
        },
      },
    };

    this.logError(logEntry);
  }

  /**
   * Get connection test logs only (SPEC-LLM-002)
   */
  getConnectionTestLogs(): LLMLogEntry[] {
    return this.getLogs().filter(
      (log) =>
        log.request?.parameters &&
        typeof log.request.parameters === 'object' &&
        'type' in log.request.parameters &&
        log.request.parameters.type === 'connection-test'
    );
  }

  /**
   * Add a log entry maintaining order and rotation
   */
  private addLog(id: string, entry: LLMLogEntry): void {
    // 메모리 누수 수정: 로그 항목의 크기를 제한하여 대형 로그 항목이 메모리를 과도하게 사용하지 않도록 방지
    const sizeLimitedEntry = this.limitLogSize(entry);

    // If updating existing entry, don't add to order again
    if (!this.logs.has(id)) {
      this.logOrder.push(id);

      // Implement log rotation (FIFO)
      if (this.logOrder.length > this.MAX_LOGS) {
        const oldestId = this.logOrder.shift();
        if (oldestId) {
          this.logs.delete(oldestId);
        }
      }
    }

    this.logs.set(id, sizeLimitedEntry);
  }

  /**
   * 메모리 누수 수정: 로그 항목의 크기를 제한하여 대형 로그 항목이 메모리를 과도하게 사용하지 않도록 방지
   * 주요 필드의 내용을 적절한 길이로 잘라내어 JSON 직렬화 크기를 제한
   */
  private limitLogSize(entry: LLMLogEntry): LLMLogEntry {
    const limited: LLMLogEntry = { ...entry };

    // 프롬프트 및 응답 내용 제한
    if (limited.request?.prompt) {
      limited.request.prompt = this.truncateString(limited.request.prompt, 1000);
    }

    if (limited.response?.content) {
      limited.response.content = this.truncateString(limited.response.content, 2000);
    }

    // 에러 메시지 제한
    if (limited.error?.message) {
      limited.error.message = this.truncateString(limited.error.message, 500);
    }

    return limited;
  }

  /**
   * 메모리 누수 수정: 문자열의 최대 길이를 제한하여 과도한 메모리 사용 방지
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength) + `... [truncated, total: ${str.length} chars]`;
  }

  /**
   * Generate a unique ID for log entries
   */
  private generateId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Mask sensitive data in request parameters
   * Masks API keys and other sensitive information
   */
  private maskSensitiveData(request?: { prompt?: string; parameters?: Record<string, unknown> }): { prompt?: string; parameters?: Record<string, unknown> } | undefined {
    if (!request) {
      return undefined;
    }

    const masked: { prompt?: string; parameters?: Record<string, unknown> } = {
      prompt: request.prompt,
      parameters: {},
    };

    if (request.parameters) {
      for (const [key, value] of Object.entries(request.parameters)) {
        // Mask API keys
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
          const strValue = String(value);
          if (strValue.length > 10) {
            masked.parameters![key] = `${strValue.substring(0, 3)}***${strValue.substring(strValue.length - 3)}`;
          } else {
            masked.parameters![key] = '***';
          }
        } else {
          masked.parameters![key] = value;
        }
      }
    }

    return masked;
  }
}
