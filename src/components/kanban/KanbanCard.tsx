/**
 * KanbanCard Component
 * Draggable card representing a task in the Kanban board
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';

/**
 * Props for KanbanCard component
 */
export interface KanbanCardProps {
  /** Task data to display */
  task: Task;
  /** Whether the card is currently being dragged */
  isDragging?: boolean;
  /** Whether AI is currently generating content for this task */
  isGenerating?: boolean;
  /** Callback when archive button is clicked (only for prototype tasks) */
  onArchive?: (taskId: string) => void;
  /** Callback when card is clicked to view documents */
  onViewDocuments?: (task: Task) => void;
}

/**
 * Maximum number of reference tags to display
 */
const MAX_VISIBLE_REFERENCES = 3;

/**
 * Document status icon component
 */
function DocumentIcon({
  type,
  exists,
}: {
  type: 'featurelist' | 'design' | 'prd' | 'prototype';
  exists: boolean;
}) {
  if (!exists) return null;

  const iconMap = {
    featurelist: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
    design: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
    prd: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
          clipRule="evenodd"
        />
        <path d="M7 15h2v2H7v-2z" />
      </svg>
    ),
    prototype: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <span
      data-testid={`icon-${type}`}
      className="text-gray-500"
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      {iconMap[type]}
    </span>
  );
}

/**
 * Loading indicator for AI generation
 */
function GeneratingIndicator() {
  return (
    <div
      data-testid="generating-indicator"
      className="absolute top-2 right-2 flex items-center gap-1"
    >
      <svg
        className="animate-spin h-4 w-4 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-xs text-blue-500">Generating...</span>
    </div>
  );
}

/**
 * KanbanCard - Draggable task card for Kanban board
 */
export function KanbanCard({ task, isDragging = false, isGenerating = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || sortableIsDragging;

  // Calculate visible references
  const visibleReferences = task.references.slice(0, MAX_VISIBLE_REFERENCES);
  const remainingCount = task.references.length - MAX_VISIBLE_REFERENCES;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`kanban-card-${task.id}`}
      className={`
        relative p-3 bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing
        ${isCurrentlyDragging ? 'opacity-50 shadow-lg' : ''}
        ${isGenerating ? 'animate-pulse' : ''}
      `}
    >
      {/* Generating Indicator */}
      {isGenerating && <GeneratingIndicator />}

      {/* Task Title */}
      <h4 className="font-medium text-gray-900 text-sm mb-2 pr-8">{task.title}</h4>

      {/* Reference Tags */}
      {task.references.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {visibleReferences.map((ref, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {ref}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
              +{remainingCount}
            </span>
          )}
        </div>
      )}

      {/* Document Status Icons */}
      <div className="flex gap-2 mt-2">
        <DocumentIcon type="featurelist" exists={Boolean(task.featureList)} />
        <DocumentIcon type="design" exists={Boolean(task.designDocument)} />
        <DocumentIcon type="prd" exists={Boolean(task.prd)} />
        <DocumentIcon type="prototype" exists={Boolean(task.prototype)} />
      </div>
    </div>
  );
}
