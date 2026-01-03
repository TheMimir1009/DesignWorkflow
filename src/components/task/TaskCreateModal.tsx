/**
 * TaskCreateModal Component
 * Modal for creating new tasks with title and feature list input
 */
import { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { MarkdownEditor } from '../common/MarkdownEditor';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

/**
 * Modal component for creating new tasks
 */
export function TaskCreateModal({ isOpen, onClose, projectId }: TaskCreateModalProps) {
  const [title, setTitle] = useState('');
  const [featureList, setFeatureList] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createTask = useTaskStore((state) => state.createTask);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      await createTask({
        title: title.trim(),
        projectId,
        featureList,
      });
      setTitle('');
      setFeatureList('');
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setFeatureList('');
    onClose();
  };

  const isValid = title.trim().length > 0;

  return (
    <div
      data-testid="task-create-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        role="dialog"
        aria-labelledby="create-task-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 id="create-task-title" className="text-lg font-semibold text-gray-900">
            Create New Task
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="task-featurelist" className="block text-sm font-medium text-gray-700 mb-1">
                Feature List
              </label>
              <MarkdownEditor
                value={featureList}
                onChange={setFeatureList}
                placeholder="Describe the features in markdown format..."
                ariaLabel="Feature List"
                rows={8}
              />
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
              disabled={!isValid || isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
