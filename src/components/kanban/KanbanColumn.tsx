/**
 * KanbanColumn Component
 * Drop zone column for the Kanban board
 */
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
<<<<<<< HEAD
=======
import { ColumnSettingsButton } from '../llm/ColumnSettingsButton';
>>>>>>> main
import type { Task } from '../../types';
import type { KanbanColumnDef } from '../../types/kanban';

/**
 * Props for KanbanColumn component
 */
export interface KanbanColumnProps {
  /** Column definition */
  column: KanbanColumnDef;
  /** Tasks in this column */
  tasks: Task[];
  /** Set of task IDs currently generating content */
  generatingTasks: Set<string>;
<<<<<<< HEAD
=======
  /** Project ID for LLM settings */
  projectId: string;
  /** Callback when a task card is clicked to view documents */
  onViewDocuments?: (task: Task) => void;
  /** Callback when archive button is clicked (only for prototype tasks) */
  onArchive?: (taskId: string) => void;
>>>>>>> main
}

/**
 * KanbanColumn - Drop zone column for Kanban board
 */
<<<<<<< HEAD
export function KanbanColumn({ column, tasks, generatingTasks }: KanbanColumnProps) {
=======
export function KanbanColumn({ column, tasks, generatingTasks, projectId, onViewDocuments, onArchive }: KanbanColumnProps) {
>>>>>>> main
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = tasks.map((task) => task.id);

<<<<<<< HEAD
=======
  // Show LLM settings button for columns that support generation
  const showLLMSettings = column.id !== 'featurelist';

>>>>>>> main
  return (
    <div
      ref={setNodeRef}
      data-testid={`kanban-column-${column.id}`}
      className={`
        flex flex-col w-72 min-h-[500px] bg-gray-100 rounded-lg
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
<<<<<<< HEAD
        <h3 className="font-semibold text-gray-700">{column.title}</h3>
=======
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700">{column.title}</h3>
          {showLLMSettings && (
            <ColumnSettingsButton
              columnId={column.id}
              columnTitle={column.title}
              projectId={projectId}
            />
          )}
        </div>
>>>>>>> main
        <span className="flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-600 bg-gray-200 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks List */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              No tasks
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                isGenerating={generatingTasks.has(task.id)}
<<<<<<< HEAD
=======
                onViewDocuments={onViewDocuments}
                onArchive={onArchive}
>>>>>>> main
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
