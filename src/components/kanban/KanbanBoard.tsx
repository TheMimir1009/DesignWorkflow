/**
 * KanbanBoard Component
 * Main Kanban board with drag-and-drop functionality
 */
import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useTaskStore } from '../../store/taskStore';
import { KANBAN_COLUMNS, isForwardMovement } from '../../types/kanban';
import type { Task, TaskStatus } from '../../types';

/**
 * Props for KanbanBoard component
 */
export interface KanbanBoardProps {
  /** Project ID to display tasks for */
  projectId: string;
}

/**
 * Loading skeleton for columns
 */
function LoadingSkeleton() {
  return (
    <div data-testid="kanban-loading" className="flex gap-4 p-4">
      {KANBAN_COLUMNS.map((column) => (
        <div
          key={column.id}
          className="flex flex-col w-72 min-h-[500px] bg-gray-100 rounded-lg animate-pulse"
        >
          <div className="p-3 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="p-2 space-y-2">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Error display component
 */
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {message}
      </div>
    </div>
  );
}

/**
 * KanbanBoard - Main Kanban board component
 */
export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Store selectors
  const tasks = useTaskStore((state) => state.tasks);
  const generatingTasks = useTaskStore((state) => state.generatingTasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const error = useTaskStore((state) => state.error);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const triggerAIGeneration = useTaskStore((state) => state.triggerAIGeneration);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch tasks on mount and when projectId changes
  useEffect(() => {
    fetchTasks(projectId);
  }, [projectId, fetchTasks]);

  // Get tasks by status
  const getTasksByStatus = useCallback(
    (status: TaskStatus): Task[] => {
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id === active.id);
      if (task) {
        setActiveTask(task);
      }
    },
    [tasks]
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const taskId = active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine target status from drop zone
      const targetStatus = over.id as TaskStatus;

      // Skip if same status
      if (task.status === targetStatus) return;

      // Check if it's a forward movement (triggers AI)
      const isForward = isForwardMovement(task.status, targetStatus);

      if (isForward) {
        // Trigger AI generation for forward movement
        await triggerAIGeneration(taskId, targetStatus);
      } else {
        // Just update status for backward movement
        await updateTaskStatus(taskId, targetStatus);
      }
    },
    [tasks, updateTaskStatus, triggerAIGeneration]
  );

  // Show loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Show error state
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div data-testid="kanban-board" className="p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              generatingTasks={generatingTasks}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard task={activeTask} isDragging={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
