/**
 * TaskStatusChart Component
 * Displays a pie chart showing task status distribution
 */
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TasksByStatus, TaskStatus } from '../../types';

/**
 * Props for TaskStatusChart component
 */
export interface TaskStatusChartProps {
  data: TasksByStatus;
  onClick?: (status: TaskStatus) => void;
}

/**
 * Color mapping for task statuses
 */
const STATUS_COLORS: Record<TaskStatus, string> = {
  featurelist: '#3B82F6', // blue
  design: '#10B981', // green
  prd: '#F59E0B', // amber
  prototype: '#8B5CF6', // purple
};

/**
 * Display names for task statuses
 */
const STATUS_NAMES: Record<TaskStatus, string> = {
  featurelist: 'Feature List',
  design: 'Design',
  prd: 'PRD',
  prototype: 'Prototype',
};

/**
 * Convert TasksByStatus to chart data format
 */
function transformData(data: TasksByStatus) {
  return Object.entries(data).map(([status, value]) => ({
    name: STATUS_NAMES[status as TaskStatus],
    value,
    status: status as TaskStatus,
  }));
}

/**
 * Custom tooltip content
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { status: TaskStatus } }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload.reduce((sum, p) => sum + p.value, 0);
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg">
        <p className="text-white font-medium">{data.name}</p>
        <p className="text-gray-400 text-sm">
          {data.value} tasks ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

/**
 * TaskStatusChart - Pie chart showing task status distribution
 */
export function TaskStatusChart({ data, onClick }: TaskStatusChartProps) {
  const chartData = transformData(data);

  const handleClick = (entry: { status: TaskStatus }) => {
    if (onClick) {
      onClick(entry.status);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-white font-medium mb-4">Task Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            onClick={handleClick}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-gray-300 text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
