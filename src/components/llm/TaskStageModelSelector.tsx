/**
 * TaskStageModelSelector Component
 * Allows selecting LLM model configuration for each task stage
 */
import { useState, useEffect, useRef } from 'react';
import type {
  TaskStageConfig,
  LLMModelConfig,
  LLMProviderSettings,
  LLMProvider,
} from '../../types/llm';
import {
  getProviderDisplayName,
  AVAILABLE_MODELS,
  DEFAULT_MODEL_PARAMS,
} from '../../types/llm';
import { getProviderModels } from '../../services/llmSettingsService';

export interface TaskStageModelSelectorProps {
  taskStageConfig: Partial<TaskStageConfig>;
  enabledProviders: LLMProviderSettings[];
  onUpdate: (config: Partial<TaskStageConfig>) => void;
  projectId: string;
}

type TaskStage = keyof TaskStageConfig;

const TASK_STAGES: { id: TaskStage; label: string; description: string }[] = [
  {
    id: 'designDoc',
    label: 'Design Document',
    description: '기획 문서 생성',
  },
  {
    id: 'prd',
    label: 'PRD',
    description: '제품 요구사항 문서 생성',
  },
  {
    id: 'prototype',
    label: 'Prototype',
    description: '프로토타입 코드 생성',
  },
];

interface StageConfigEditorProps {
  label: string;
  description: string;
  config: LLMModelConfig | null;
  enabledProviders: LLMProviderSettings[];
  onUpdate: (config: LLMModelConfig | null) => void;
  projectId: string;
}

function StageConfigEditor({
  label,
  description,
  config,
  enabledProviders,
  onUpdate,
  projectId,
}: StageConfigEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState<LLMModelConfig | null>(config);

  // TASK-001: Add dynamic model state variables
  const [dynamicModels, setDynamicModels] = useState<Record<LLMProvider, string[]>>({
    lmstudio: [],
  });
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);

  // SPEC-LLM-004: Track previous provider to detect provider changes
  const prevProviderRef = useRef<LLMProvider | null>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // TASK-002: Add useEffect to fetch models for LM Studio
  // SPEC-LLM-004: Add auto-select logic after models are loaded
  useEffect(() => {
    const fetchModelsForProvider = async (provider: LLMProvider, pid: string) => {
      if (provider !== 'lmstudio') return;
      setIsLoadingModels(true);
      setModelLoadError(null);
      try {
        const models = await getProviderModels(pid, provider);
        setDynamicModels(prev => ({ ...prev, [provider]: models }));

        // SPEC-LLM-004: Auto-select first model if no modelId exists
        // Use the latest localConfig from state to check for modelId
        setLocalConfig(currentConfig => {
          if (models.length > 0 && !currentConfig?.modelId) {
            const newConfig = {
              ...currentConfig!,
              modelId: models[0],
            };
            onUpdate(newConfig);
            return newConfig;
          }
          return currentConfig;
        });
      } catch (error) {
        setModelLoadError(error instanceof Error ? error.message : '모델 목록을 가져오지 못했습니다');
        setDynamicModels(prev => ({ ...prev, [provider]: [] }));
      } finally {
        setIsLoadingModels(false);
      }
    };

    const currentProvider = localConfig?.provider || null;

    // SPEC-LLM-004 FIX: Only fetch if:
    // 1. Provider is lmstudio, AND
    // 2. projectId exists, AND
    // 3. Either this is initial mount (ref is null) OR provider has changed
    if (currentProvider === 'lmstudio' && projectId) {
      const providerChanged = prevProviderRef.current !== currentProvider;
      if (providerChanged) {
        prevProviderRef.current = currentProvider;
        fetchModelsForProvider(currentProvider, projectId);
      }
    }
    // SPEC-LLM-004 FIX: Reset ref when provider is NOT lmstudio
    // This allows re-fetch when switching back to LM Studio from another provider
    else if (currentProvider && currentProvider !== 'lmstudio') {
      prevProviderRef.current = currentProvider;
    }
  }, [localConfig?.provider, projectId]);

  // SPEC-LLM-004: Preserve existing modelId when switching to lmstudio provider
  const handleProviderChange = (provider: LLMProvider) => {
    const models = AVAILABLE_MODELS[provider] || [];
    const newConfig: LLMModelConfig = {
      provider,
      // SPEC-LLM-004: For LM Studio, preserve existing modelId to avoid race condition
      // The useEffect will fetch models and auto-select if needed
      modelId: (provider === 'lmstudio')
        ? (localConfig?.modelId || '')
        : (models[0] || ''),
      ...DEFAULT_MODEL_PARAMS,
    };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  const handleModelChange = (modelId: string) => {
    if (!localConfig) return;
    const newConfig = { ...localConfig, modelId };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  const handleParamChange = (
    param: 'temperature' | 'maxTokens' | 'topP',
    value: number
  ) => {
    if (!localConfig) return;
    const newConfig = { ...localConfig, [param]: value };
    setLocalConfig(newConfig);
    onUpdate(newConfig);
  };

  const handleClear = () => {
    setLocalConfig(null);
    onUpdate(null as unknown as LLMModelConfig);
  };

  // TASK-003: Modify availableModels calculation logic
  const availableModels = localConfig
    ? (localConfig.provider === 'lmstudio'
        ? dynamicModels.lmstudio
        : AVAILABLE_MODELS[localConfig.provider]) || []
    : [];

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">{label}</span>
          <span className="text-sm text-gray-400">{description}</span>
        </div>
        <div className="flex items-center gap-3">
          {localConfig ? (
            <span className="text-sm text-blue-400">
              {getProviderDisplayName(localConfig.provider)} / {localConfig.modelId}
            </span>
          ) : (
            <span className="text-sm text-gray-500">미설정 (기본값 사용)</span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-gray-900 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">프로바이더</label>
              <select
                value={localConfig?.provider || ''}
                onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택 안함</option>
                {enabledProviders.map((p) => (
                  <option key={p.provider} value={p.provider}>
                    {getProviderDisplayName(p.provider)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">모델</label>
              {/* TASK-004: Loading UI */}
              {isLoadingModels ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm text-gray-400">모델 목록을 가져오는 중...</span>
                </div>
              ) : modelLoadError ? (
                /* TASK-005: Error UI */
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-yellow-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-sm">{modelLoadError}</span>
                </div>
              ) : availableModels.length === 0 && localConfig?.provider === 'lmstudio' ? (
                /* TASK-006: Empty list message */
                <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-500">
                  <span className="text-sm">사용 가능한 모델이 없습니다...</span>
                </div>
              ) : (
                <select
                  value={localConfig?.modelId || ''}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!localConfig || isLoadingModels}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {localConfig && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Temperature: {localConfig.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localConfig.temperature}
                  onChange={(e) => handleParamChange('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Max Tokens: {localConfig.maxTokens}
                </label>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={localConfig.maxTokens}
                  onChange={(e) => handleParamChange('maxTokens', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Top P: {localConfig.topP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localConfig.topP}
                  onChange={(e) => handleParamChange('topP', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            {localConfig && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-gray-400 hover:text-white"
              >
                설정 초기화
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskStageModelSelector({
  taskStageConfig,
  enabledProviders,
  onUpdate,
  projectId,
}: TaskStageModelSelectorProps) {
  const handleStageUpdate = (stage: TaskStage, config: LLMModelConfig | null) => {
    onUpdate({
      [stage]: config || undefined,
    });
  };

  return (
    <div className="space-y-3">
      {TASK_STAGES.map((stage) => (
        <StageConfigEditor
          key={stage.id}
          label={stage.label}
          description={stage.description}
          config={taskStageConfig[stage.id] || null}
          enabledProviders={enabledProviders}
          onUpdate={(config) => handleStageUpdate(stage.id, config)}
          projectId={projectId}
        />
      ))}
    </div>
  );
}
