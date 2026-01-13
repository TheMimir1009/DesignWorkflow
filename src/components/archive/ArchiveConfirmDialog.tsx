/**
 * ArchiveConfirmDialog Component
 * Confirmation dialog for archiving a task
 */
import { useEffect, useRef, useId } from 'react';

export interface ArchiveConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
}

function ArchiveConfirmDialogContent({
  onClose,
  onConfirm,
  taskTitle,
}: Omit<ArchiveConfirmDialogProps, 'isOpen'>) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus management
  useEffect(() => {
    requestAnimationFrame(() => {
      if (cancelButtonRef.current) {
        cancelButtonRef.current.focus();
      }
    });
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-testid="dialog-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-xl font-semibold text-white mb-4">
          Archive Task
        </h2>
        <p className="text-gray-300 mb-4">
          Are you sure you want to archive this task &quot;{taskTitle}&quot;?
        </p>
        <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-400 mb-2">
            Note: Only prototype tasks can be archived.
          </p>
          <p className="text-sm text-gray-400">
            Archived tasks are preserved with all their documents. You can restore them later
            from the Archives section.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArchiveConfirmDialog({ isOpen, ...props }: ArchiveConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return <ArchiveConfirmDialogContent {...props} />;
}
