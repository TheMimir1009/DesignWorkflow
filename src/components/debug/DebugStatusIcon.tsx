/**
 * Debug Status Icon Component (SPEC-DEBUG-001 TAG-004 TASK-014)
 *
 * Visual status indicators for LLM call logs
 * REQ-S-002/003/004: Status indicators with colors
 */

import type { LLMCallLog } from '../../types/debug';

interface DebugStatusIconProps {
  status: LLMCallLog['status'];
  className?: string;
}

export function DebugStatusIcon({ status, className = '' }: DebugStatusIconProps) {
  const getIcon = () => {
    switch (status) {
      case 'success':
        return (
          <svg className={`w-4 h-4 text-green-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`w-4 h-4 text-red-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className={`w-4 h-4 text-blue-500 animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return getIcon();
}
