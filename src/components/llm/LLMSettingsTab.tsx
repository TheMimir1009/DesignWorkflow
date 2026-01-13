/**
 * LLMSettingsTab Component
 * Tab content for LLM provider configuration in project settings
 */
import { useEffect } from 'react';
import { useLLMSettingsStore } from '../../store/llmSettingsStore';
import { ProviderConfigCard } from './ProviderConfigCard';
import { TaskStageModelSelector } from './TaskStageModelSelector';
import type { LLMProvider, LLMProviderSettings } from '../../types/llm';

export interface LLMSettingsTabProps {
  projectId: string;
}

export function LLMSettingsTab({ projectId }: LLMSettingsTabProps) {
  const {
    settings,
    isLoading,
    error,
    testingProvider,
    connectionTestResults,
    fetchSettings,
    updateProvider,
    testConnection,
    updateTaskStageConfig,
    clearError,
  } = useLLMSettingsStore();

  useEffect(() => {
    if (projectId) {
      fetchSettings(projectId);
    }
  }, [projectId, fetchSettings]);

  const handleProviderUpdate = async (
    provider: LLMProvider,
    updates: Partial<Omit<LLMProviderSettings, 'provider'>>
  ) => {
    await updateProvider(projectId, provider, updates);
  };

  const handleTestConnection = async (provider: LLMProvider) => {
    await testConnection(projectId, provider);
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="text-red-300">{error}</p>
          <button
            type="button"
            onClick={clearError}
            className="text-red-400 hover:text-red-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="tabpanel-llm" role="tabpanel" className="space-y-6">
      {/* Provider Configuration Section */}
      <section>
        <h3 className="text-lg font-medium text-white mb-4">LLM 프로바이더 설정</h3>
        <p className="text-sm text-gray-400 mb-4">
          AI 문서 생성에 사용할 LLM 프로바이더를 설정합니다. 최소 하나의 프로바이더가 활성화되어야 합니다.
        </p>
        <div className="space-y-4">
          {settings?.providers.map((provider) => (
            <ProviderConfigCard
              key={provider.provider}
              provider={provider}
              isTestingConnection={testingProvider === provider.provider}
              testResult={connectionTestResults.get(provider.provider)}
              onUpdate={(updates) => handleProviderUpdate(provider.provider, updates)}
              onTestConnection={() => handleTestConnection(provider.provider)}
            />
          ))}
        </div>
      </section>

      {/* Task Stage Configuration Section */}
      <section>
        <h3 className="text-lg font-medium text-white mb-4">태스크 단계별 모델 설정</h3>
        <p className="text-sm text-gray-400 mb-4">
          각 문서 생성 단계에서 사용할 기본 모델을 설정합니다. 칸반 컬럼에서 개별 설정이 가능합니다.
        </p>
        <TaskStageModelSelector
          taskStageConfig={settings?.taskStageConfig || {}}
          enabledProviders={settings?.providers.filter(p => p.isEnabled) || []}
          onUpdate={(config) => updateTaskStageConfig(projectId, config)}
          projectId={projectId}
        />
      </section>

      {/* Info Section */}
      <section className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">참고 사항</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Claude Code는 기본 폴백 프로바이더로 항상 활성화됩니다.</li>
          <li>• API 키는 암호화되어 안전하게 저장됩니다.</li>
          <li>• 연결 테스트를 통해 API 키가 유효한지 확인할 수 있습니다.</li>
          <li>• 칸반 컬럼별로 개별 LLM 설정이 가능합니다.</li>
        </ul>
      </section>
    </div>
  );
}
