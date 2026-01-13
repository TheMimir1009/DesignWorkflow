/**
 * useColumnModelConfig Hook
 * Custom hook to retrieve LLM model configuration for a specific kanban column
 *
 * Maps column IDs to their corresponding task stage configurations.
 */
import { useMemo } from 'react';
import { useLLMSettingsStore } from '../../store/llmSettingsStore';
import type { LLMModelConfig, TaskStageConfig } from '../../types/llm';

export interface ColumnModelConfigResult {
  /** Model configuration for the column, or null if not configured */
  modelConfig: LLMModelConfig | null;
  /** Whether settings are currently loading */
  isLoading: boolean;
  /** Any error that occurred during loading */
  error: string | null;
}

/**
 * Map column ID to task stage config key
 * - design -> designDoc
 * - prd -> prd
 * - prototype -> prototype
 * - featurelist -> null (no LLM settings needed)
 * - unknown -> null
 */
function getStageKeyForColumnId(columnId: string): keyof TaskStageConfig | null {
  const mapping: Record<string, keyof TaskStageConfig> = {
    designdoc: 'designDoc',
    design: 'designDoc',
    prd: 'prd',
    prototype: 'prototype',
  };
  return mapping[columnId.toLowerCase()] || null;
}

/**
 * Hook to get model configuration for a specific column
 *
 * @param columnId - The column identifier (e.g., 'design', 'prd', 'prototype')
 * @param projectId - The project identifier
 * @returns Model configuration result
 */
export function useColumnModelConfig(
  columnId: string,
  projectId: string
): ColumnModelConfigResult {
  const { settings, isLoading, error } = useLLMSettingsStore();

  const modelConfig = useMemo(() => {
    // If no settings yet, return null
    if (!settings || !projectId) {
      return null;
    }

    // Get the stage key for this column
    const stageKey = getStageKeyForColumnId(columnId);

    // If no valid stage key (e.g., featurelist column), return null
    if (!stageKey) {
      return null;
    }

    // Get the config for this stage
    const stageConfig = settings.taskStageConfig[stageKey];

    // If stage has a specific config, use it
    if (stageConfig && typeof stageConfig === 'object' && 'provider' in stageConfig) {
      return stageConfig as LLMModelConfig;
    }

    // Fall back to default model
    return settings.taskStageConfig.defaultModel || null;
  }, [settings, projectId, columnId]);

  return {
    modelConfig,
    isLoading,
    error,
  };
}
