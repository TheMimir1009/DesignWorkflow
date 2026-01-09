/**
 * ColumnLLMSettingsModal Component
 * Modal for configuring LLM settings for a specific kanban column
 */
import { useState, useEffect, useId } from 'react';
import { useLLMSettingsStore } from '../../store/llmSettingsStore';
import type {
  LLMModelConfig,
  LLMProvider,
  TaskStageConfig,
} from '../../types/llm';
import {
  getProviderDisplayName,
  AVAILABLE_MODELS,
  DEFAULT_MODEL_PARAMS,
} from '../../types/llm';

export interface ColumnLLMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  columnTitle: string;
  projectId: string;
}

/**
 * Map column ID to task stage
 */
function getTaskStageFromColumnId(columnId: string): keyof TaskStageConfig | null {
  const mapping: Record<string, keyof TaskStageConfig> = {
    designdoc: 'designDoc',
    prd: 'prd',
    prototype: 'prototype',
  };
  return mapping[columnId.toLowerCase()] || null;
}

export function ColumnLLMSettingsModal({
  isOpen,
  onClose,
  columnId,
  columnTitle,
  projectId,
}: ColumnLLMSettingsModalProps) {
  const titleId = useId();
  const taskStage = getTaskStageFromColumnId(columnId);

  const { settings, fetchSettings, updateTaskStageConfig, isLoading } =
    useLLMSettingsStore();

  const [localConfig, setLocalConfig] = useState<LLMModelConfig | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchSettings(projectId);
    }
  }, [isOpen, projectId, fetchSettings]);

  // Sync localConfig when settings load - using ref to track if we need to sync
  const settingsKey = settings ? `${settings.projectId}-${taskStage}-${JSON.stringify(settings.taskStageConfig[taskStage ?? ''])}` : '';
  useEffect(() => {
    if (settings && taskStage && isOpen) {
      const newConfig = settings.taskStageConfig[taskStage] || null;
      // Sync on open or settings change
      setLocalConfig(newConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsKey, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const enabledProviders = settings?.providers.filter((p) => p.isEnabled) || [];

  const handleProviderChange = (provider: LLMProvider | '') => {
    if (!provider) {
      setLocalConfig(null);
      return;
    }

    const models = AVAILABLE_MODELS[provider as LLMProvider] || [];
    const newConfig: LLMModelConfig = {
      provider: provider as LLMProvider,
      modelId: models[0] || '',
      ...DEFAULT_MODEL_PARAMS,
    };
    setLocalConfig(newConfig);
  };

  const handleModelChange = (modelId: string) => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, modelId });
  };

  const handleParamChange = (
    param: 'temperature' | 'maxTokens' | 'topP',
    value: number
  ) => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, [param]: value });
  };

  const handleSave = async () => {
    if (!taskStage) return;

    await updateTaskStageConfig(projectId, {
      [taskStage]: localConfig || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    if (settings && taskStage) {
      setLocalConfig(settings.taskStageConfig[taskStage] || null);
    }
  };

  if (!isOpen) {
    return null;
  }

  const availableModels = localConfig
    ? AVAILABLE_MODELS[localConfig.provider] || []
    : [];

  const hasChanges = taskStage
    ? JSON.stringify(localConfig) !==
      JSON.stringify(settings?.taskStageConfig[taskStage] || null)
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="bg-gray-800 rounded-lg shadow-lg w-full max-w-lg mx-4"
      >
        <div className="p-4 border-b border-gray-700">
          <h2 id={titleId} className="text-lg font-semibold text-white">
            {columnTitle} LLM 설정
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            이 컬럼에서 문서 생성 시 사용할 LLM을 설정합니다.
          </p>
        </div>

        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    프로바이더
                  </label>
                  <select
                    value={localConfig?.provider || ''}
                    onChange={(e) =>
                      handleProviderChange(e.target.value as LLMProvider | '')
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">프로젝트 기본값 사용</option>
                    {enabledProviders.map((p) => (
                      <option key={p.provider} value={p.provider}>
                        {getProviderDisplayName(p.provider)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">모델</label>
                  <select
                    value={localConfig?.modelId || ''}
                    onChange={(e) => handleModelChange(e.target.value)}
                    disabled={!localConfig}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {localConfig && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>Temperature</span>
                      <span className="text-white">{localConfig.temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={localConfig.temperature}
                      onChange={(e) =>
                        handleParamChange('temperature', parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>정확한</span>
                      <span>창의적</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>Max Tokens</span>
                      <span className="text-white">{localConfig.maxTokens}</span>
                    </label>
                    <input
                      type="range"
                      min="256"
                      max="8192"
                      step="256"
                      value={localConfig.maxTokens}
                      onChange={(e) =>
                        handleParamChange('maxTokens', parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>짧게</span>
                      <span>길게</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-sm text-gray-400 mb-1">
                      <span>Top P</span>
                      <span className="text-white">{localConfig.topP}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={localConfig.topP}
                      onChange={(e) =>
                        handleParamChange('topP', parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>집중된</span>
                      <span>다양한</span>
                    </div>
                  </div>
                </div>
              )}

              {!localConfig && (
                <p className="text-sm text-gray-500 text-center py-4">
                  프로젝트 기본 설정이 사용됩니다.
                  프로바이더를 선택하여 이 컬럼에 대해 개별 설정할 수 있습니다.
                </p>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            되돌리기
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
