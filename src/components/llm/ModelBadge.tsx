/**
 * ModelBadge Component
 * Visual badge displaying LLM provider and model information
 *
 * TAG-002 TASK-005: Implement ModelBadge visual component
 * TAG-003 TASK-010: Implement tooltip for full model name
 */
import { getProviderDisplayName, type LLMProvider } from '../../types/llm';
import { ProviderIcon, getProviderColorClass } from './providerIcons';
import type { LLMModelConfig } from '../../types/llm';

export interface ModelBadgeProps {
  /** Model configuration to display */
  modelConfig: LLMModelConfig;
  /** Optional click handler */
  onClick?: () => void;
  /** CSS class name for additional styling */
  className?: string;
}

/**
 * Generate a human-readable display name for the model
 */
function getModelDisplayName(modelId: string): string {
  // Shorten common model names for display
  const shortNames: Record<string, string> = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': '4o-mini',
    'gpt-4-turbo': '4-Turbo',
    'claude-3.5-sonnet': '3.5 Sonnet',
    'gemini-1.5-pro': '1.5 Pro',
    'gemini-1.5-flash': '1.5 Flash',
    'gemini-2.0-flash-exp': '2.0 Flash',
  };

  return shortNames[modelId] || modelId;
}

/**
 * Generate full model name for tooltip
 */
function getFullModelName(provider: string, modelId: string): string {
  // Special handling for certain model prefixes that should be uppercase
  const upperCasePrefixes = ['gpt', 'claude'];
  const parts = modelId.split('-');
  const capitalizedModelId = parts
    .map(part => {
      if (upperCasePrefixes.includes(part.toLowerCase())) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('-');
  return `${getProviderDisplayName(provider as LLMProvider)} ${capitalizedModelId}`;
}

/**
 * ModelBadge component displays provider icon and model name
 *
 * Shows provider-specific coloring and includes full model name in tooltip.
 */
export function ModelBadge({ modelConfig, onClick, className = '' }: ModelBadgeProps) {
  const { provider, modelId } = modelConfig;
  const colorClass = getProviderColorClass(provider);
  const displayName = getModelDisplayName(modelId);
  const fullName = getFullModelName(provider, modelId);
  const testId = `model-badge-${provider}-${modelId}`;

  return (
    <button
      data-testid={testId}
      type="button"
      onClick={onClick}
      title={fullName}
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
        border text-xs font-medium
        hover:opacity-80 transition-opacity
        ${colorClass}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `.trim()}
      role="button"
      aria-label={`Model configuration: ${fullName}`}
    >
      <ProviderIcon provider={provider} />
      <span className="truncate max-w-[80px]">{displayName}</span>
    </button>
  );
}
