/**
 * ProviderConfigCard Component
 * Displays and allows editing of a single LLM provider's configuration
 */
import { useState } from 'react';
import type { LLMProvider, LLMProviderSettings, ConnectionTestResult } from '../../types/llm';
import { getProviderDisplayName } from '../../types/llm';

export interface ProviderConfigCardProps {
  provider: LLMProviderSettings;
  isTestingConnection: boolean;
  testResult?: ConnectionTestResult;
  onUpdate: (settings: Partial<Omit<LLMProviderSettings, 'provider'>>) => void;
  onTestConnection: () => void;
}

/**
 * Get status badge color and text
 */
function getStatusBadge(status: LLMProviderSettings['connectionStatus']) {
  switch (status) {
    case 'connected':
      return { color: 'bg-green-500', text: '연결됨' };
    case 'error':
      return { color: 'bg-red-500', text: '오류' };
    case 'pending':
      return { color: 'bg-yellow-500', text: '대기중' };
    case 'untested':
    default:
      return { color: 'bg-gray-500', text: '미확인' };
  }
}

/**
 * Get provider icon
 */
function getProviderIcon(provider: LLMProvider) {
  switch (provider) {
    case 'openai':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.28 8.26c.26.96.29 1.96.08 2.93-.21.97-.63 1.88-1.24 2.66.08.41.12.83.13 1.25 0 2.26-1.12 4.38-2.99 5.66-1.87 1.29-4.24 1.68-6.36 1.05-.6.57-1.32 1.02-2.09 1.33-.78.31-1.61.47-2.45.47-1.75 0-3.43-.69-4.67-1.93s-1.94-2.91-1.94-4.66c0-.42.04-.84.13-1.25-.61-.78-1.03-1.69-1.24-2.66-.21-.97-.18-1.97.08-2.93-.61-.78-1.03-1.69-1.24-2.66-.21-.97-.18-1.97.08-2.93.26-.96.73-1.86 1.38-2.61.65-.76 1.47-1.36 2.38-1.76.92-.4 1.91-.6 2.91-.57.42-.57 1.14-1.02 1.91-1.33.78-.31 1.61-.47 2.45-.47 1.75 0 3.43.69 4.67 1.93s1.94 2.91 1.94 4.66c0 .42-.04.84-.13 1.25.61.78 1.03 1.69 1.24 2.66z" />
        </svg>
      );
    case 'gemini':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
    case 'claude-code':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
    case 'lmstudio':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 13H9.5v-2h-2v2H6V7h1.5v2.5h2V7H11v10zm7-7h-1.5v7H15V10h-1.5V8.5H18V10z" />
        </svg>
      );
  }
}

export function ProviderConfigCard({
  provider,
  isTestingConnection,
  testResult,
  onUpdate,
  onTestConnection,
}: ProviderConfigCardProps) {
  const [apiKey, setApiKey] = useState(provider.apiKey || '');
  const [endpoint, setEndpoint] = useState(provider.endpoint || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const statusBadge = getStatusBadge(provider.connectionStatus);
  const isClaudeCode = provider.provider === 'claude-code';
  const isLMStudio = provider.provider === 'lmstudio';

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    // Only update if the value is different and not masked
    if (value !== provider.apiKey && !value.includes('...')) {
      onUpdate({ apiKey: value });
    }
  };

  const handleEndpointChange = (value: string) => {
    setEndpoint(value);
    if (value !== provider.endpoint) {
      onUpdate({ endpoint: value });
    }
  };

  const handleToggleEnabled = () => {
    onUpdate({ isEnabled: !provider.isEnabled });
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        provider.isEnabled ? 'border-blue-500 bg-gray-800' : 'border-gray-700 bg-gray-900'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={provider.isEnabled ? 'text-blue-400' : 'text-gray-500'}>
            {getProviderIcon(provider.provider)}
          </span>
          <div>
            <h3 className="text-white font-medium">
              {getProviderDisplayName(provider.provider)}
            </h3>
            {isClaudeCode && (
              <p className="text-xs text-gray-400">기본 폴백 프로바이더</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 text-xs rounded-full text-white ${statusBadge.color}`}
          >
            {statusBadge.text}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={provider.isEnabled}
              onChange={handleToggleEnabled}
              disabled={isClaudeCode}
              className="sr-only peer"
            />
            <div
              className={`w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                isClaudeCode ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            ></div>
          </label>
        </div>
      </div>

      {provider.isEnabled && (
        <div className="space-y-3">
          {!isClaudeCode && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">API 키</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder={isLMStudio ? '(로컬 서버 - API 키 불필요)' : 'sk-...'}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showApiKey ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {isLMStudio && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">엔드포인트</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => handleEndpointChange(e.target.value)}
                placeholder="http://localhost:1234/v1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onTestConnection}
              disabled={isTestingConnection}
              className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isTestingConnection ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  연결 테스트 중...
                </>
              ) : (
                '연결 테스트'
              )}
            </button>

            {testResult && (
              <span
                className={`text-sm ${
                  testResult.success ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {testResult.success
                  ? `연결 성공${testResult.latency ? ` (${testResult.latency}ms)` : ''}`
                  : testResult.error || '연결 실패'}
              </span>
            )}
          </div>

          {provider.errorMessage && (
            <p className="text-sm text-red-400 mt-2">{provider.errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
