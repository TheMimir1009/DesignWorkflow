/**
 * Type Definitions for LLM Debug Console (SPEC-DEBUG-001)
 * TAG-001: Data Model & Store
 */

/**
 * LLM API call log entry
 */
export interface LLMCallLog {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  duration?: number;
  error?: string;

  // Request
  requestHeaders: Record<string, string>;
  requestBody: unknown;

  // Response
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;

  // Usage
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
}

/**
 * Filter state for debug logs
 */
export interface DebugFilters {
  status: 'all' | 'success' | 'error' | 'pending';
  model: string;
  search: string;
}

/**
 * Debug statistics
 */
export interface DebugStats {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  totalTokens: number;
  totalCost: number;
}

/**
 * Model pricing configuration
 */
export interface ModelPricing {
  model: string;
  inputPricePer1K: number;
  outputPricePer1K: number;
}

/**
 * Debug store state and actions
 */
export interface DebugState {
  logs: LLMCallLog[];
  filters: DebugFilters;
  isDetailModalOpen: boolean;
  selectedLog: LLMCallLog | null;
  stats: DebugStats;

  // Actions
  addLog: (log: LLMCallLog) => void;
  updateLog: (id: string, updates: Partial<LLMCallLog>) => void;
  setFilters: (filters: Partial<DebugFilters>) => void;
  setSelectedLog: (log: LLMCallLog | null) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  clearLogs: () => void;
  exportLogs: (format: 'json' | 'csv') => void;
  retryRequest: (id: string) => Promise<void>;
  reset: () => void;
}

/**
 * LLM request configuration for logging
 */
export interface LLMRequestConfig {
  model: string;
  provider: string;
  endpoint: string;
  method?: string;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * LLM response for logging
 */
export interface LLMResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  duration: number;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}
