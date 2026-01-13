/**
 * Dashboard Component
 * Main dashboard layout with analytics charts and stats
 */
import { useEffect } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { exportCSV } from '../../services/dashboardService';
import { StatsSummary } from './StatsSummary';
import { TaskStatusChart } from './TaskStatusChart';
import { ProgressTimeline } from './ProgressTimeline';
import { DashboardHeader } from './DashboardHeader';
import type { PeriodFilter } from '../../types';

/**
 * Props for Dashboard component
 */
export interface DashboardProps {
  projectId: string;
}

/**
 * Loading skeleton for dashboard
 */
function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-skeleton" className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-24 border border-gray-700" />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg h-80 border border-gray-700" />
        <div className="bg-gray-800 rounded-lg h-80 border border-gray-700" />
      </div>
    </div>
  );
}

/**
 * Empty state for dashboard
 */
function EmptyDashboard() {
  return (
    <div
      data-testid="empty-dashboard"
      className="flex flex-col items-center justify-center py-16 text-gray-400"
    >
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="text-lg font-medium text-white mb-2">No Analytics Data</h3>
      <p className="text-sm">Start by creating tasks to see your project analytics.</p>
    </div>
  );
}

/**
 * Error display for dashboard
 */
function DashboardError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-red-400">
      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

/**
 * Dashboard - Main dashboard layout
 */
export function Dashboard({ projectId }: DashboardProps) {
  const {
    summary,
    timeline,
    periodFilter,
    isLoading,
    error,
    fetchSummary,
    fetchTimeline,
    setPeriodFilter,
  } = useDashboardStore();

  // Fetch data on mount and when projectId or period changes
  useEffect(() => {
    fetchSummary(projectId);
    fetchTimeline(projectId, periodFilter);
  }, [projectId, periodFilter, fetchSummary, fetchTimeline]);

  // Handle period filter change
  const handlePeriodChange = (period: PeriodFilter) => {
    setPeriodFilter(period);
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'png') => {
    if (format === 'csv') {
      try {
        const blob = await exportCSV(projectId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-${projectId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error('Export failed:', err);
      }
    } else if (format === 'png') {
      // PNG export would use html-to-image library
      // For now, log a message
      console.log('PNG export not yet implemented');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <DashboardError message={error} />
      </div>
    );
  }

  // Empty state
  if (!summary) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <EmptyDashboard />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Header with controls */}
      <DashboardHeader
        periodFilter={periodFilter}
        onPeriodChange={handlePeriodChange}
        onExport={handleExport}
      />

      {/* Stats Summary */}
      <div className="mb-6">
        <StatsSummary summary={summary} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart data={summary.tasksByStatus} />
        <ProgressTimeline data={timeline} period={periodFilter} />
      </div>
    </div>
  );
}
