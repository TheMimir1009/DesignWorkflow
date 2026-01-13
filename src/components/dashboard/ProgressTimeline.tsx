/**
 * ProgressTimeline Component
 * Displays a line chart showing progress over time
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TimelineDataPoint, PeriodFilter } from '../../types';

/**
 * Props for ProgressTimeline component
 */
export interface ProgressTimelineProps {
  data: TimelineDataPoint[];
  period: PeriodFilter;
}

/**
 * Line colors
 */
const LINE_COLORS = {
  tasksCreated: '#3B82F6', // blue
  tasksCompleted: '#10B981', // green
  documentsGenerated: '#F59E0B', // amber
};

/**
 * Period display names
 */
const PERIOD_NAMES: Record<PeriodFilter, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

/**
 * Custom tooltip content
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * ProgressTimeline - Line chart showing progress over time
 */
export function ProgressTimeline({ data, period }: ProgressTimelineProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Progress Timeline</h3>
        <span className="text-gray-400 text-sm">{PERIOD_NAMES[period]}</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-gray-300 text-sm">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="tasksCreated"
            name="Tasks Created"
            stroke={LINE_COLORS.tasksCreated}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="tasksCompleted"
            name="Tasks Completed"
            stroke={LINE_COLORS.tasksCompleted}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
