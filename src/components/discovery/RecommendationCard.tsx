/**
 * RecommendationCard Component
 * Individual recommendation card for discovered systems
 * SPEC-DISCOVERY: AC-004 UI rendering, AC-005 Individual add, AC-010 Duplicate prevention
 */
import type { RecommendedSystem } from '../../services/discoveryService';

export interface RecommendationCardProps {
  /** Recommended system data */
  system: RecommendedSystem;
  /** Whether this system is already in the reference list */
  isAlreadyAdded: boolean;
  /** Callback when add button is clicked */
  onAdd: (systemId: string) => void;
}

/**
 * Get progress bar color based on relevance score
 */
function getProgressColor(score: number): string {
  if (score >= 80) {
    return 'bg-green-500';
  }
  if (score >= 50) {
    return 'bg-yellow-500';
  }
  return 'bg-red-500';
}

/**
 * Document Icon SVG
 */
function DocumentIcon() {
  return (
    <svg
      data-testid="document-icon"
      className="w-5 h-5 text-gray-400"
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
  );
}

/**
 * RecommendationCard Component
 * Displays a single recommendation with relevance score and add action
 */
export function RecommendationCard({
  system,
  isAlreadyAdded,
  onAdd,
}: RecommendationCardProps) {
  const handleAdd = () => {
    if (!isAlreadyAdded) {
      onAdd(system.id);
    }
  };

  const progressColor = getProgressColor(system.relevanceScore);

  return (
    <article
      role="article"
      aria-label={`Recommendation: ${system.name}`}
      className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors"
    >
      {/* Header with name, score, and button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <DocumentIcon />
          <span className="font-medium text-gray-900">{system.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            {system.relevanceScore}%
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isAlreadyAdded}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isAlreadyAdded
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
            aria-label={isAlreadyAdded ? 'Already added' : `Add ${system.name}`}
          >
            {isAlreadyAdded ? 'Already Added' : 'Add'}
          </button>
        </div>
      </div>

      {/* Match reason */}
      {system.matchReason && (
        <p
          data-testid="match-reason"
          className="text-sm text-gray-500 mb-3"
        >
          {system.matchReason}
        </p>
      )}

      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          data-testid="relevance-progress"
          className={`h-full rounded-full transition-all ${progressColor}`}
          style={{ width: `${system.relevanceScore}%` }}
        />
      </div>
    </article>
  );
}
