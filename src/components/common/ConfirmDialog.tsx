/**
 * ConfirmDialog Component
 * A reusable confirmation dialog with optional input requirement
 */
import { useEffect, useRef, useState, useId } from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requireInput?: string;
}

function ConfirmDialogContent({
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireInput,
}: Omit<ConfirmDialogProps, 'isOpen'>) {
  const [inputValue, setInputValue] = useState('');
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const isConfirmEnabled = requireInput ? inputValue === requireInput : true;

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
    // Focus the appropriate element
    requestAnimationFrame(() => {
      if (requireInput && inputRef.current) {
        inputRef.current.focus();
      } else if (cancelButtonRef.current) {
        cancelButtonRef.current.focus();
      }
    });
  }, [requireInput]);

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
        <h2
          id={titleId}
          className="text-xl font-semibold text-white mb-4"
        >
          {title}
        </h2>
        <p className="text-gray-300 mb-6">
          {message}
        </p>

        {requireInput && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">
              Type &quot;{requireInput}&quot; to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmEnabled}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ isOpen, ...props }: ConfirmDialogProps) {
  // By conditionally rendering the content component, we reset its state each time it opens
  if (!isOpen) {
    return null;
  }

  return <ConfirmDialogContent {...props} />;
}
