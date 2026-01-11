/**
 * Debug Store (SPEC-DEBUG-001 TAG-001 TASK-001)
 * Zustand store for managing LLM debug logs
 */

import { create } from 'zustand';
import type { DebugState, LLMCallLog, DebugFilters } from '../types/debug';
import { calculateCost } from '../config/modelPricing';

const MAX_LOGS = 1000;

interface LogWithStatusChange {
  previousStatus?: string;
  newStatus: string;
}

const createDebugStore = () => {
  return create<DebugState>((set, get) => ({
    // Initial state
    logs: [],
    filters: {
      status: 'all',
      model: 'all',
      search: '',
    },
    isDetailModalOpen: false,
    selectedLog: null,
    stats: {
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      totalTokens: 0,
      totalCost: 0,
    },

    // Actions
    addLog: (log: LLMCallLog) => {
      set((state) => {
        // Calculate cost if tokens are provided
        const logWithCost =
          log.inputTokens && log.outputTokens
            ? { ...log, cost: calculateCost(log.model, log.inputTokens, log.outputTokens) }
            : log;

        const newLogs = [...state.logs, logWithCost];

        // Maintain max 1000 logs (REQ-U-003)
        if (newLogs.length > MAX_LOGS) {
          newLogs.shift();
        }

        return {
          logs: newLogs,
          stats: {
            ...state.stats,
            totalRequests: state.stats.totalRequests + 1,
            totalTokens:
              state.stats.totalTokens + (logWithCost.totalTokens || 0),
            totalCost:
              state.stats.totalCost + (logWithCost.cost || 0),
          },
        };
      });
    },

    updateLog: (id: string, updates: Partial<LLMCallLog>) => {
      set((state) => {
        const logIndex = state.logs.findIndex((log) => log.id === id);

        if (logIndex === -1) {
          return state;
        }

        const log = state.logs[logIndex];
        const previousStatus = log.status;
        const newStatus = updates.status || log.status;

        const updatedLogs = [...state.logs];
        updatedLogs[logIndex] = { ...log, ...updates };

        // Recalculate cost if tokens updated
        if (updates.inputTokens || updates.outputTokens) {
          const inputTokens = updates.inputTokens || log.inputTokens || 0;
          const outputTokens = updates.outputTokens || log.outputTokens || 0;
          updatedLogs[logIndex].cost = calculateCost(log.model, inputTokens, outputTokens);
        }

        // Update stats based on status change
        let stats = { ...state.stats };

        if (previousStatus !== newStatus) {
          if (newStatus === 'success') {
            stats.successCount += 1;
          } else if (newStatus === 'error') {
            stats.errorCount += 1;
          }

          // Update totals if provided
          if (updates.totalTokens) {
            stats.totalTokens += updates.totalTokens;
          }
          if (updates.cost) {
            stats.totalCost += updates.cost;
          }
        }

        return {
          logs: updatedLogs,
          stats,
        };
      });
    },

    setFilters: (filters: Partial<DebugFilters>) => {
      set((state) => ({
        filters: { ...state.filters, ...filters },
      }));
    },

    setSelectedLog: (log: LLMCallLog | null) => {
      set({ selectedLog: log });
    },

    setIsDetailModalOpen: (open: boolean) => {
      set({ isDetailModalOpen: open });
    },

    clearLogs: () => {
      set({
        logs: [],
        stats: {
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          totalTokens: 0,
          totalCost: 0,
        },
      });
    },

    exportLogs: (format: 'json' | 'csv') => {
      const { logs } = get();
      const filteredLogs = getFilteredLogs(logs, get().filters);

      if (format === 'json') {
        const data = JSON.stringify(filteredLogs, null, 2);
        downloadFile(data, 'debug-logs.json', 'application/json');
      } else if (format === 'csv') {
        const csv = convertToCSV(filteredLogs);
        downloadFile(csv, 'debug-logs.csv', 'text/csv');
      }
    },

    retryRequest: async (id: string) => {
      // Implementation in TASK-015
      console.log('Retry request:', id);
    },

    reset: () => {
      set({
        logs: [],
        filters: {
          status: 'all',
          model: 'all',
          search: '',
        },
        isDetailModalOpen: false,
        selectedLog: null,
        stats: {
          totalRequests: 0,
          successCount: 0,
          errorCount: 0,
          totalTokens: 0,
          totalCost: 0,
        },
      });
    },
  }));
};

/**
 * Filter logs based on current filters
 */
function getFilteredLogs(logs: LLMCallLog[], filters: DebugFilters): LLMCallLog[] {
  return logs.filter((log) => {
    // Status filter
    if (filters.status !== 'all' && log.status !== filters.status) {
      return false;
    }

    // Model filter
    if (filters.model !== 'all' && log.model !== filters.model) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        log.model,
        log.endpoint,
        log.error || '',
      ].join(' ').toLowerCase();

      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs: LLMCallLog[]): string {
  if (logs.length === 0) {
    return '';
  }

  const headers = [
    'id',
    'timestamp',
    'model',
    'provider',
    'status',
    'statusCode',
    'duration',
    'inputTokens',
    'outputTokens',
    'totalTokens',
    'cost',
    'error',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp,
    log.model,
    log.provider,
    log.status,
    log.statusCode?.toString() || '',
    log.duration?.toString() || '',
    log.inputTokens?.toString() || '',
    log.outputTokens?.toString() || '',
    log.totalTokens?.toString() || '',
    log.cost?.toFixed(4) || '',
    log.error || '',
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

/**
 * Trigger file download in browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Create store instance
export const useDebugStore = createDebugStore();
