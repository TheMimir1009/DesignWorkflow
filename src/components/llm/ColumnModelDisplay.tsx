/**
 * ColumnModelDisplay Component
 * Displays LLM model configuration for a kanban column header
 *
 * TAG-001 TASK-002: Create ColumnModelDisplay component structure
 * TAG-001 TASK-003: Implement ColumnId-to-Stage mapping
 * TAG-002 TASK-004: Implement model configuration hook
 * TAG-002 TASK-005: Implement ModelBadge visual component
 * TAG-002 TASK-006: Add click handler for modal open
 * TAG-002 TASK-008: Create provider icons and colors
 * TAG-003 TASK-007: Integrate ColumnModelDisplay into KanbanColumn
 * TAG-003 TASK-010: Implement tooltip for full model name
 * TAG-004 TASK-011: Verify Drag & Drop compatibility
 */
import { useState } from 'react';
import { useColumnModelConfig } from './useColumnModelConfig';
import { ModelBadge } from './ModelBadge';
import { ColumnLLMSettingsModal } from './ColumnLLMSettingsModal';

export interface ColumnModelDisplayProps {
  /** Column identifier (e.g., 'design', 'prd', 'prototype') */
  columnId: string;
  /** Project identifier */
  projectId: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ColumnModelDisplay component
 *
 * Shows a compact badge displaying the current LLM model configured
 * for this column. Clicking the badge opens the settings modal.
 *
 * Does not interfere with drag & drop operations - does not use
 * draggable attributes or event handlers that would conflict.
 */
export function ColumnModelDisplay({
  columnId,
  projectId,
  className = '',
}: ColumnModelDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { modelConfig, isLoading, error } = useColumnModelConfig(columnId, projectId);

  // Don't render anything for columns without LLM support (e.g., featurelist)
  // or when no config is set and not loading
  if (!modelConfig && !isLoading && !error) {
    return (
      <span
        data-testid={`column-model-display-${columnId}`}
        className={className}
      />
    );
  }

  const handleBadgeClick = () => {
    setIsModalOpen(true);
  };

  const getModalTitle = () => {
    const titles: Record<string, string> = {
      design: 'Design Doc',
      designdoc: 'Design Doc',
      prd: 'PRD',
      prototype: 'Prototype',
    };
    return titles[columnId.toLowerCase()] || columnId;
  };

  return (
    <>
      <span
        data-testid={`column-model-display-${columnId}`}
        className={`inline-flex ${className}`.trim()}
      >
        {modelConfig && (
          <ModelBadge
            modelConfig={modelConfig}
            onClick={handleBadgeClick}
          />
        )}
      </span>

      <ColumnLLMSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        columnId={columnId}
        columnTitle={getModalTitle()}
        projectId={projectId}
      />
    </>
  );
}
