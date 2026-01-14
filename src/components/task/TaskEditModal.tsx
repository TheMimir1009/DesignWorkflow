/**
 * TaskEditModal Component
 * Modal for editing existing tasks with title and feature list input
 */
import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { MarkdownEditor } from '../common/MarkdownEditor';
import { ModelHistoryList } from './ModelHistoryList';
import type { Task, TaskStatus } from '../../types';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

/**
 * Get display name for task status
 */
function getStatusDisplayName(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    featurelist: 'Feature List',
    design: 'Design',
    prd: 'PRD',
    prototype: 'Prototype',
  };
  return statusMap[status] || status;
}

/**
 * Get status badge color classes
 */
function getStatusBadgeClasses(status: TaskStatus): string {
  const colorMap: Record<TaskStatus, string> = {
    featurelist: 'bg-blue-100 text-blue-800',
    design: 'bg-purple-100 text-purple-800',
    prd: 'bg-orange-100 text-orange-800',
    prototype: 'bg-green-100 text-green-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Modal component for editing existing tasks
 */
export function TaskEditModal({ isOpen, onClose, task }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [featureList, setFeatureList] = useState(task.featureList);
  const [isSaving, setIsSaving] = useState(false);

  const updateTaskContent = useTaskStore((state) => state.updateTaskContent);

  // Update local state when task prop changes
  useEffect(() => {
    setTitle(task.title);
    setFeatureList(task.featureList);
  }, [task]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      await updateTaskContent(task.id, {
        title: title.trim(),
        featureList,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setFeatureList(task.featureList);
    onClose();
  };

  const isValid = title.trim().length > 0;

  return (
    <div
      data-testid="task-edit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        role="dialog"
        aria-labelledby="edit-task-dialog-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="edit-task-dialog-title" className="text-lg font-semibold text-gray-900">
            Edit Task
          </h2>
          <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClasses(task.status)}`}
          >
            {getStatusDisplayName(task.status)}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="edit-task-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="edit-task-featurelist" className="block text-sm font-medium text-gray-700 mb-1">
                Feature List
              </label>
              <MarkdownEditor
                value={featureList}
                onChange={setFeatureList}
                placeholder="Describe the features in markdown format..."
                ariaLabel="Feature List"
                rows={12}
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Created: {formatDate(task.createdAt)}</p>
              <p>Last Updated: {formatDate(task.updatedAt)}</p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
