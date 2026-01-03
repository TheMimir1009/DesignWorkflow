/**
 * TaskDeleteConfirm Component
 * Confirmation dialog for task deletion with warning
 */
import { useState } from 'react';
import type { Task } from '../../types';

interface TaskDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onConfirm: () => Promise<void> | void;
}

/**
 * Warning icon component
 */
function WarningIcon() {
  return (
    <svg
      data-testid="warning-icon"
      className="h-6 w-6 text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

/**
 * Confirmation dialog for deleting a task
 */
export function TaskDeleteConfirm({ isOpen, onClose, task, onConfirm }: TaskDeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    setIsDeleting(true);

    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      data-testid="task-delete-confirm"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        role="alertdialog"
        aria-labelledby="delete-task-title"
        aria-describedby="delete-task-description"
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
      >
        <div className="px-6 py-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <WarningIcon />
            </div>
            <div className="flex-1">
              <h3
                id="delete-task-title"
                className="text-lg font-semibold text-gray-900"
              >
                Delete Task
              </h3>
              <div id="delete-task-description" className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-gray-700">"{task.title}"</span>?
                </p>
                <p className="mt-2 text-sm text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
