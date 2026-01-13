/**
 * ReferenceDocButton Component
 * Button to open the document reference side panel
 */
import { useReferenceDocStore } from '../../store/referenceDocStore';

/**
 * ReferenceDocButton - Opens the document reference panel
 *
 * Displays a button with icon and text that opens
 * the side panel for browsing completed documents.
 */
export function ReferenceDocButton() {
  const openPanel = useReferenceDocStore((state) => state.openPanel);
  const isPanelOpen = useReferenceDocStore((state) => state.isPanelOpen);

  return (
    <button
      type="button"
      onClick={openPanel}
      aria-expanded={isPanelOpen}
      aria-label="참조 문서 보기"
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
    >
      {/* Document icon */}
      <svg
        data-testid="reference-doc-icon"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      참조 문서 보기
    </button>
  );
}
