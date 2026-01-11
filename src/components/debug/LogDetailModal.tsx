/**
 * Log Detail Modal Component (SPEC-DEBUG-001 TAG-004 TASK-012)
 *
 * Shows detailed information about a specific log entry
 * REQ-E-002: Display request/response details in modal
 */

import { useDebugStore } from '../../store/debugStore';
import { DebugStatusIcon } from './DebugStatusIcon';

export function LogDetailModal() {
  const { isDetailModalOpen, selectedLog, setIsDetailModalOpen, setSelectedLog } = useDebugStore();

  if (!selectedLog || !isDetailModalOpen) {
    return null;
  }

  const handleClose = () => {
    setIsDetailModalOpen(false);
    setSelectedLog(null);
  };

  const formatJson = (data: unknown): string => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <DebugStatusIcon status={selectedLog.status} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Request Details
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Model:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedLog.model}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Provider:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{selectedLog.provider}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">{selectedLog.status}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {selectedLog.duration ? `${selectedLog.duration}ms` : '-'}
              </span>
            </div>
          </div>

          {/* Request */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Request</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-xs font-mono space-y-2">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Endpoint:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedLog.endpoint}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Method:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedLog.method}</span>
              </div>

              {Object.keys(selectedLog.requestHeaders).length > 0 && (
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Headers:</div>
                  <pre className="text-gray-900 dark:text-gray-100 overflow-x-auto">
                    {formatJson(selectedLog.requestHeaders)}
                  </pre>
                </div>
              )}

              {selectedLog.requestBody && (
                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Body:</div>
                  <pre className="text-gray-900 dark:text-gray-100 overflow-x-auto">
                    {formatJson(selectedLog.requestBody)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          {selectedLog.responseBody && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Response</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-xs font-mono space-y-2">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedLog.statusCode}</span>
                </div>

                {selectedLog.responseHeaders && Object.keys(selectedLog.responseHeaders).length > 0 && (
                  <div>
                    <div className="text-gray-600 dark:text-gray-400 mb-1">Headers:</div>
                    <pre className="text-gray-900 dark:text-gray-100 overflow-x-auto">
                      {formatJson(selectedLog.responseHeaders)}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="text-gray-600 dark:text-gray-400 mb-1">Body:</div>
                  <pre className="text-gray-900 dark:text-gray-100 overflow-x-auto max-h-64">
                    {formatJson(selectedLog.responseBody)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Usage */}
          {selectedLog.totalTokens > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Usage</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Input Tokens:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {selectedLog.inputTokens?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Output Tokens:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {selectedLog.outputTokens?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Tokens:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {selectedLog.totalTokens.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      ${selectedLog.cost?.toFixed(4) || '0.0000'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {selectedLog.error && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Error</h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-900 dark:text-red-300">
                {selectedLog.error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
