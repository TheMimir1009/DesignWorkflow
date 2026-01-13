/**
 * StatsSummary Component
 * Displays stat cards for dashboard metrics
 */
import type { DashboardSummary } from '../../types';

/**
 * Props for StatsSummary component
 */
export interface StatsSummaryProps {
  summary: DashboardSummary;
}

/**
 * ClipboardList icon (Total Tasks)
 */
function ClipboardListIcon() {
  return (
    <svg
      data-testid="icon-clipboard"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

/**
 * Activity icon (In Progress)
 */
function ActivityIcon() {
  return (
    <svg
      data-testid="icon-activity"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

/**
 * CheckCircle icon (Completion Rate)
 */
function CheckCircleIcon() {
  return (
    <svg
      data-testid="icon-check-circle"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * FileText icon (Documents Generated)
 */
function FileTextIcon() {
  return (
    <svg
      data-testid="icon-file-text"
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

/**
 * Single stat card component
 */
interface StatCardProps {
  testId: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor: string;
  showProgress?: boolean;
  progressValue?: number;
}

function StatCard({
  testId,
  icon,
  label,
  value,
  iconColor,
  showProgress = false,
  progressValue = 0,
}: StatCardProps) {
  return (
    <div
      data-testid={testId}
      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-2xl font-semibold">{value}</p>
        </div>
      </div>
      {showProgress && (
        <div className="mt-3">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              data-testid="progress-bar"
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * StatsSummary - Four stat cards showing dashboard metrics
 */
export function StatsSummary({ summary }: StatsSummaryProps) {
  const inProgress =
    summary.totalTasks - summary.tasksByStatus.prototype;
  const completionPercentage = Math.round(summary.completionRate * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        testId="stat-total-tasks"
        icon={<ClipboardListIcon />}
        label="Total Tasks"
        value={summary.totalTasks}
        iconColor="bg-blue-500/20 text-blue-400"
      />
      <StatCard
        testId="stat-in-progress"
        icon={<ActivityIcon />}
        label="In Progress"
        value={inProgress}
        iconColor="bg-amber-500/20 text-amber-400"
      />
      <StatCard
        testId="stat-completion-rate"
        icon={<CheckCircleIcon />}
        label="Completion Rate"
        value={`${completionPercentage}%`}
        iconColor="bg-green-500/20 text-green-400"
        showProgress
        progressValue={completionPercentage}
      />
      <StatCard
        testId="stat-documents"
        icon={<FileTextIcon />}
        label="Documents Generated"
        value={summary.documentsGenerated}
        iconColor="bg-purple-500/20 text-purple-400"
      />
    </div>
  );
}
