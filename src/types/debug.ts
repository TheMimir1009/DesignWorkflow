/**
 * Type Definitions for LLM Debug Console (SPEC-DEBUG-001, SPEC-DEBUG-002)
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

  // SPEC-DEBUG-002: Console visibility state (REQ-S-001)
  isOpen: boolean;

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

  // SPEC-DEBUG-002: Console toggle action
  toggle: () => void;
  setIsOpen: (open: boolean) => void;

  // SPEC-DEBUG-003: Server log sync
  fetchLogsFromServer: () => Promise<void>;
  syncLogsFromServer: (lastTimestamp?: string) => Promise<void>;
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

/**
 * SPEC-DEBUG-002: Keyboard shortcut configuration
 */
export interface DebugShortcutConfig {
  key: string;
  modifiers: {
    ctrl?: boolean;
    meta?: boolean; // Cmd on macOS
    alt?: boolean;
    shift?: boolean;
  };
  enabled: boolean;
}

/**
 * SPEC-DEBUG-002: Hook return value
 */
export interface UseDebugShortcutReturn {
  isSupported: boolean;
  isListening: boolean;
  register: () => void;
  unregister: () => void;
}

/**
 * SPEC-DEBUG-002: Platform-specific shortcut display
 */
export interface ShortcutDisplay {
  key: string;
  modifierKey: string; // 'Ctrl' or 'Cmd'
  fullShortcut: string; // 'Ctrl+Alt+D' or 'Cmd+Alt+D'
}
