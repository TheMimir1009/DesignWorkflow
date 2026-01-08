/**
 * DashboardHeader Component
 * Header with period filter and export buttons
 */
import type { PeriodFilter } from '../../types';

/**
 * Props for DashboardHeader component
 */
export interface DashboardHeaderProps {
  periodFilter: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  onExport: (format: 'csv' | 'png') => void;
}

/**
 * Period options
 */
const PERIOD_OPTIONS: Array<{ value: PeriodFilter; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

/**
 * Download icon
 */
function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

/**
 * DashboardHeader - Period filter and export controls
 */
export function DashboardHeader({
  periodFilter,
  onPeriodChange,
  onExport,
}: DashboardHeaderProps) {
  return (
    <div
      data-testid="dashboard-header"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
    >
      {/* Period Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Period:</span>
        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPeriodChange(option.value)}
              className={`
                px-3 py-1.5 text-sm rounded-md transition-colors
                ${
                  periodFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onExport('png')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          <DownloadIcon />
          Export PNG
        </button>
        <button
          type="button"
          onClick={() => onExport('csv')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <DownloadIcon />
          Export CSV
        </button>
      </div>
    </div>
  );
}
