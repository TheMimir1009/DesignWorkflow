/**
 * ColumnSettingsButton Component
 * Settings button for kanban column headers to configure LLM settings
 */
import { useState } from 'react';
import { ColumnLLMSettingsModal } from './ColumnLLMSettingsModal';

export interface ColumnSettingsButtonProps {
  columnId: string;
  columnTitle: string;
  projectId: string;
}

export function ColumnSettingsButton({
  columnId,
  columnTitle,
  projectId,
}: ColumnSettingsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        title={`${columnTitle} LLM 설정`}
        aria-label={`${columnTitle} LLM 설정 열기`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <ColumnLLMSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        columnId={columnId}
        columnTitle={columnTitle}
        projectId={projectId}
      />
    </>
  );
}
