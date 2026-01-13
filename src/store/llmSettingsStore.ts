/**
 * LLM Settings Store - Zustand State Management
 * Centralized state management for LLM settings with devtools support
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ProjectLLMSettings,
  LLMProvider,
  LLMProviderSettings,
  TaskStageConfig,
  LLMModelConfig,
  ConnectionTestResult,
} from '../types/llm';
import * as llmSettingsService from '../services/llmSettingsService';

/**
 * LLM Settings Store State
 */
export interface LLMSettingsState {
  // State
  settings: ProjectLLMSettings | null;
  isLoading: boolean;
  error: string | null;
  testingProvider: LLMProvider | null;
  connectionTestResults: Map<LLMProvider, ConnectionTestResult>;
  pendingTests: Set<LLMProvider>; // Track pending tests to prevent duplicates

  // Computed/Helper
  getProviderSettings: (provider: LLMProvider) => LLMProviderSettings | undefined;
  getEnabledProviders: () => LLMProviderSettings[];
  getStageConfig: (stage: keyof TaskStageConfig) => LLMModelConfig | null;
}

/**
 * LLM Settings Store Actions
 */
export interface LLMSettingsActions {
  // Data fetching
  fetchSettings: (projectId: string) => Promise<void>;

  // Provider management
  updateProvider: (
    projectId: string,
    provider: LLMProvider,
    settings: Partial<Omit<LLMProviderSettings, 'provider'>>
  ) => Promise<void>;
  testConnection: (projectId: string, provider: LLMProvider) => Promise<ConnectionTestResult>;

  // Task stage management
  updateTaskStageConfig: (projectId: string, config: Partial<TaskStageConfig>) => Promise<void>;

  // State management
  clearSettings: () => void;
  clearError: () => void;
  isPendingTest: (provider: LLMProvider) => boolean; // Check if test is pending
}

/**
 * Combined store type
 */
export type LLMSettingsStore = LLMSettingsState & LLMSettingsActions;

/**
 * LLM Settings store with Zustand
 */
export const useLLMSettingsStore = create<LLMSettingsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      settings: null,
      isLoading: false,
      error: null,
      testingProvider: null,
      connectionTestResults: new Map(),
      pendingTests: new Set(),

      // Helper methods
      getProviderSettings: (provider: LLMProvider) => {
        const { settings } = get();
        return settings?.providers.find(p => p.provider === provider);
      },

      getEnabledProviders: () => {
        const { settings } = get();
        return settings?.providers.filter(p => p.isEnabled) || [];
      },

      getStageConfig: (stage: keyof TaskStageConfig) => {
        const { settings } = get();
        return settings?.taskStageConfig[stage] || null;
      },

      // Actions
      fetchSettings: async (projectId: string) => {
        set({ isLoading: true, error: null }, false, 'fetchSettings/start');
        try {
          const settings = await llmSettingsService.getLLMSettings(projectId);
          set(
            { settings, isLoading: false, error: null },
            false,
            'fetchSettings/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'fetchSettings/error'
          );
        }
      },

      updateProvider: async (
        projectId: string,
        provider: LLMProvider,
        providerSettings: Partial<Omit<LLMProviderSettings, 'provider'>>
      ) => {
        set({ isLoading: true, error: null }, false, 'updateProvider/start');
        try {
          await llmSettingsService.updateProviderSettings(projectId, provider, providerSettings);
          // Re-fetch settings to get updated state
          const settings = await llmSettingsService.getLLMSettings(projectId);
          set(
            { settings, isLoading: false, error: null },
            false,
            'updateProvider/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'updateProvider/error'
          );
        }
      },

      testConnection: async (projectId: string, provider: LLMProvider) => {
        // Prevent duplicate requests
        const { pendingTests } = get();
        if (pendingTests.has(provider)) {
          // Return existing pending test result or throw
          return get().connectionTestResults.get(provider) || {
            success: false,
            status: 'error',
            error: {
              code: 'UNKNOWN_ERROR',
              message: 'Test already in progress',
              retryable: false,
            },
            timestamp: new Date().toISOString(),
          };
        }

        // Mark test as pending
        set(
          state => {
            const newPending = new Set(state.pendingTests);
            newPending.add(provider);
            return {
              testingProvider: provider,
              error: null,
              pendingTests: newPending,
            };
          },
          false,
          'testConnection/start'
        );

        try {
          const result = await llmSettingsService.testProviderConnection(projectId, provider);

          // Update connection test results
          set(
            state => {
              const newResults = new Map(state.connectionTestResults);
              newResults.set(provider, result);
              const newPending = new Set(state.pendingTests);
              newPending.delete(provider);
              return {
                testingProvider: null,
                connectionTestResults: newResults,
                pendingTests: newPending,
              };
            },
            false,
            'testConnection/success'
          );

          // Re-fetch settings to get updated connection status
          const settings = await llmSettingsService.getLLMSettings(projectId);
          set({ settings }, false, 'testConnection/refreshSettings');

          return result;
        } catch (error) {
          const errorResult: ConnectionTestResult = {
            success: false,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          };

          set(
            state => {
              const newResults = new Map(state.connectionTestResults);
              newResults.set(provider, errorResult);
              const newPending = new Set(state.pendingTests);
              newPending.delete(provider);
              return {
                testingProvider: null,
                error: typeof errorResult.error === 'string' ? errorResult.error : errorResult.error?.message || 'Unknown error',
                connectionTestResults: newResults,
                pendingTests: newPending,
              };
            },
            false,
            'testConnection/error'
          );

          return errorResult;
        }
      },

      updateTaskStageConfig: async (projectId: string, config: Partial<TaskStageConfig>) => {
        set({ isLoading: true, error: null }, false, 'updateTaskStageConfig/start');
        try {
          await llmSettingsService.updateTaskStageConfig(projectId, config);
          // Re-fetch settings to get updated state
          const settings = await llmSettingsService.getLLMSettings(projectId);
          set(
            { settings, isLoading: false, error: null },
            false,
            'updateTaskStageConfig/success'
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            false,
            'updateTaskStageConfig/error'
          );
        }
      },

      clearSettings: () => {
        set(
          {
            settings: null,
            isLoading: false,
            error: null,
            testingProvider: null,
            connectionTestResults: new Map(),
            pendingTests: new Set(),
          },
          false,
          'clearSettings'
        );
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      isPendingTest: (provider: LLMProvider) => {
        return get().pendingTests.has(provider);
      },
    }),
    { name: 'LLMSettingsStore' }
  )
);

/**
 * Selector hooks for common use cases
 */
export const useLLMSettings = () => useLLMSettingsStore(state => state.settings);
export const useLLMSettingsLoading = () => useLLMSettingsStore(state => state.isLoading);
export const useLLMSettingsError = () => useLLMSettingsStore(state => state.error);
export const useTestingProvider = () => useLLMSettingsStore(state => state.testingProvider);
