/**
 * Passthrough Store - Zustand State Management
 * SPEC-PASSTHROUGH-001: Centralized state management for passthrough pipelines
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  PassthroughPipeline,
  PassthroughStageName,
  PassthroughPipelineStatus,
} from '../types/passthrough';
import * as passthroughService from '../services/passthroughService';

/**
 * Passthrough store state interface
 */
export interface PassthroughStoreState {
  /** Map of task ID to pipeline state */
  pipelines: Map<string, PassthroughPipeline>;
  /** Set of task IDs currently being polled */
  pollingTaskIds: Set<string>;
  /** Loading states per task */
  loadingStates: Map<string, boolean>;
  /** Error states per task */
  errorStates: Map<string, string | null>;
  /** Overall loading state */
  isLoading: boolean;
  /** Overall error state */
  error: string | null;
}

/**
 * Passthrough store actions interface
 */
export interface PassthroughStoreActions {
  /** Start a new passthrough pipeline for a task */
  startPipeline: (taskId: string, resumeFromStage?: PassthroughStageName | null) => Promise<void>;
  /** Pause a running pipeline */
  pausePipeline: (taskId: string) => Promise<void>;
  /** Resume a paused pipeline */
  resumePipeline: (taskId: string) => Promise<void>;
  /** Cancel a pipeline */
  cancelPipeline: (taskId: string) => Promise<void>;
  /** Retry a failed stage */
  retryStage: (taskId: string, stage: PassthroughStageName) => Promise<void>;
  /** Fetch pipeline status for a task */
  fetchPipelineStatus: (taskId: string) => Promise<void>;
  /** Start polling for pipeline updates */
  startPolling: (taskId: string) => void;
  /** Stop polling for pipeline updates */
  stopPolling: (taskId: string) => void;
  /** Clear error for a specific task */
  clearTaskError: (taskId: string) => void;
  /** Clear all errors */
  clearError: () => void;
  /** Get pipeline for a specific task */
  getPipeline: (taskId: string) => PassthroughPipeline | undefined;
  /** Check if pipeline is loading for a specific task */
  isTaskLoading: (taskId: string) => boolean;
  /** Get error for a specific task */
  getTaskError: (taskId: string) => string | null;
}

/**
 * Combined passthrough store type
 */
export type PassthroughStore = PassthroughStoreState & PassthroughStoreActions;

/**
 * Polling interval in milliseconds */
const POLLING_INTERVAL = 2000;

/**
 * Passthrough store with Zustand
 */
export const usePassthroughStore = create<PassthroughStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      pipelines: new Map(),
      pollingTaskIds: new Set(),
      loadingStates: new Map(),
      errorStates: new Map(),
      isLoading: false,
      error: null,

      // Actions
      startPipeline: async (taskId: string, resumeFromStage?: PassthroughStageName | null) => {
        set(
          (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, true);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, null);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
              isLoading: true,
            };
          },
          false,
          'startPipeline/start'
        );

        try {
          const pipeline = await passthroughService.startPipeline(taskId, resumeFromStage);
          set((state) => {
            const newPipelines = new Map(state.pipelines);
            newPipelines.set(taskId, pipeline);
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            return {
              pipelines: newPipelines,
              loadingStates: newLoadingStates,
              isLoading: false,
            };
          }, false, 'startPipeline/success');

          // Start polling if pipeline is running
          if (pipeline.status === 'running' || pipeline.status === 'paused') {
            get().startPolling(taskId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to start pipeline';
          set((state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, errorMessage);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
              isLoading: false,
              error: errorMessage,
            };
          }, false, 'startPipeline/error');
        }
      },

      pausePipeline: async (taskId: string) => {
        set(
          (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, true);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, null);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
            };
          },
          false,
          'pausePipeline/start'
        );

        try {
          const pipeline = await passthroughService.pausePipeline(taskId);
          set(
            (state) => {
            const newPipelines = new Map(state.pipelines);
            newPipelines.set(taskId, pipeline);
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            return {
              pipelines: newPipelines,
              loadingStates: newLoadingStates,
            };
          },
            false,
            'pausePipeline/success'
          );

          // Stop polling when paused
          get().stopPolling(taskId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to pause pipeline';
          set(
            (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, errorMessage);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
              error: errorMessage,
            };
          },
            false,
            'pausePipeline/error'
          );
        }
      },

      resumePipeline: async (taskId: string) => {
        set(
          (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, true);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, null);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
            };
          },
          false,
          'resumePipeline/start'
        );

        try {
          const pipeline = await passthroughService.resumePipeline(taskId);
          set(
            (state) => {
            const newPipelines = new Map(state.pipelines);
            newPipelines.set(taskId, pipeline);
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            return {
              pipelines: newPipelines,
              loadingStates: newLoadingStates,
            };
          },
            false,
            'resumePipeline/success'
          );

          // Resume polling
          get().startPolling(taskId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to resume pipeline';
          set(
            (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, errorMessage);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
              error: errorMessage,
            };
          },
            false,
            'resumePipeline/error'
          );
        }
      },

      cancelPipeline: async (taskId: string) => {
        set(
          (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, true);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, null);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
            };
          },
          false,
          'cancelPipeline/start'
        );

        try {
          const pipeline = await passthroughService.cancelPipeline(taskId);
          set(
            (state) => {
            const newPipelines = new Map(state.pipelines);
            newPipelines.set(taskId, pipeline);
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            return {
              pipelines: newPipelines,
              loadingStates: newLoadingStates,
            };
          },
            false,
            'cancelPipeline/success'
          );

          // Stop polling when cancelled
          get().stopPolling(taskId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to cancel pipeline';
          set(
            (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, errorMessage);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
              error: errorMessage,
            };
          },
            false,
            'cancelPipeline/error'
          );
        }
      },

      retryStage: async (taskId: string, stage: PassthroughStageName) => {
        set(
          (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, true);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, null);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
            };
          },
          false,
          'retryStage/start'
        );

        try {
          const pipeline = await passthroughService.retryStage(taskId, stage);
          set(
            (state) => {
            const newPipelines = new Map(state.pipelines);
            newPipelines.set(taskId, pipeline);
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            return {
              pipelines: newPipelines,
              loadingStates: newLoadingStates,
            };
          },
            false,
            'retryStage/success'
          );

          // Start polling if pipeline is running
          if (pipeline.status === 'running' || pipeline.status === 'paused') {
            get().startPolling(taskId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to retry stage';
          set(
            (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, errorMessage);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
              error: errorMessage,
            };
          },
            false,
            'retryStage/error'
          );
        }
      },

      fetchPipelineStatus: async (taskId: string) => {
        set(
          (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, true);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, null);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
            };
          },
          false,
          'fetchPipelineStatus/start'
        );

        try {
          const pipeline = await passthroughService.getPipelineStatus(taskId);
          set(
            (state) => {
            const newPipelines = new Map(state.pipelines);
            newPipelines.set(taskId, pipeline);
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            return {
              pipelines: newPipelines,
              loadingStates: newLoadingStates,
            };
          },
            false,
            'fetchPipelineStatus/success'
          );

          // Auto-stop polling if pipeline completed or failed
          if (pipeline.status === 'completed' || pipeline.status === 'cancelled') {
            get().stopPolling(taskId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pipeline status';
          set(
            (state) => {
            const newLoadingStates = new Map(state.loadingStates);
            newLoadingStates.set(taskId, false);
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, errorMessage);
            return {
              loadingStates: newLoadingStates,
              errorStates: newErrorStates,
            };
          },
            false,
            'fetchPipelineStatus/error'
          );
        }
      },

      startPolling: (taskId: string) => {
        const state = get();
        if (state.pollingTaskIds.has(taskId)) {
          return; // Already polling
        }

        set(
          (state) => {
            const newPollingTaskIds = new Set(state.pollingTaskIds);
            newPollingTaskIds.add(taskId);
            return { pollingTaskIds: newPollingTaskIds };
          },
          false,
          'startPolling'
        );

        // Poll immediately
        get().fetchPipelineStatus(taskId);

        // Set up interval
        const intervalId = setInterval(() => {
          const currentState = get();
          if (currentState.pollingTaskIds.has(taskId)) {
            get().fetchPipelineStatus(taskId);
          } else {
            clearInterval(intervalId);
          }
        }, POLLING_INTERVAL);
      },

      stopPolling: (taskId: string) => {
        set(
          (state) => {
            const newPollingTaskIds = new Set(state.pollingTaskIds);
            newPollingTaskIds.delete(taskId);
            return { pollingTaskIds: newPollingTaskIds };
          },
          false,
          'stopPolling'
        );
      },

      clearTaskError: (taskId: string) => {
        set(
          (state) => {
            const newErrorStates = new Map(state.errorStates);
            newErrorStates.set(taskId, null);
            return { errorStates: newErrorStates };
          },
          false,
          'clearTaskError'
        );
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      getPipeline: (taskId: string) => {
        return get().pipelines.get(taskId);
      },

      isTaskLoading: (taskId: string) => {
        return get().loadingStates.get(taskId) ?? false;
      },

      getTaskError: (taskId: string) => {
        return get().errorStates.get(taskId) ?? null;
      },
    }),
    {
      name: 'passthrough-store',
      enabled: import.meta.env.DEV,
    }
  )
);
