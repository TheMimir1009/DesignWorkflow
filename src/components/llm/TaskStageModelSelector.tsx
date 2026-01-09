/**
 * TaskStageModelSelector Component
 * Allows selecting LLM model configuration for each task stage
 */
import { useState, useEffect } from 'react';
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

export interface TaskStageModelSelectorProps {
  taskStageConfig: Partial<TaskStageConfig>;
  enabledProviders: LLMProviderSettings[];
  onUpdate: (config: Partial<TaskStageConfig>) => void;
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
}

function StageConfigEditor({
  label,
  description,
  config,
  enabledProviders,
  onUpdate,
}: StageConfigEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localConfig, setLocalConfig] = useState<LLMModelConfig | null>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleProviderChange = (provider: LLMProvider) => {
    const models = AVAILABLE_MODELS[provider] || [];
    const newConfig: LLMModelConfig = {
      provider,
      modelId: models[0] || '',
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

  const availableModels = localConfig
    ? AVAILABLE_MODELS[localConfig.provider] || []
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
          stage={stage.id}
          label={stage.label}
          description={stage.description}
          config={taskStageConfig[stage.id] || null}
          enabledProviders={enabledProviders}
          onUpdate={(config) => handleStageUpdate(stage.id, config)}
        />
      ))}
    </div>
  );
}
