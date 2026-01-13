/**
 * AutoDiscoveryRecommendation Component
 * Main component for displaying auto-discovered related systems
 * SPEC-DISCOVERY: AC-004, AC-005, AC-006, AC-010
 */
import { useEffect } from 'react';
import { useDiscoveryStore } from '../../store/discoveryStore';
import { useReferenceStore } from '../../store/referenceStore';
import { DiscoverySkeleton } from './DiscoverySkeleton';
import { RecommendationCard } from './RecommendationCard';

export interface AutoDiscoveryRecommendationProps {
  /** Project ID for fetching recommendations */
  projectId: string;
  /** Feature text to analyze for recommendations */
  featureText: string;
  /** IDs of systems already in the reference list */
  existingReferenceIds: string[];
  /** Callback when a system is added */
  onSystemAdded?: (systemId: string) => void;
  /** Callback when all systems are added */
  onAllSystemsAdded?: () => void;
}

/**
 * Refresh Icon SVG
 */
function RefreshIcon() {
  return (
    <svg
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
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

/**
 * Search Icon SVG
 */
function SearchIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

/**
 * Alert Icon SVG
 */
function AlertIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <SearchIcon />
      <p className="mt-2">No related systems found</p>
      <p className="text-sm">Try adding more detail to your feature description</p>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="text-red-500">
          <AlertIcon />
        </div>
        <div className="flex-1">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
            aria-label="Try again"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AutoDiscoveryRecommendation Component
 * Displays recommendations with loading, error, and empty states
 */
export function AutoDiscoveryRecommendation({
  projectId,
  featureText,
  existingReferenceIds,
  onSystemAdded,
  onAllSystemsAdded,
}: AutoDiscoveryRecommendationProps) {
  const {
    recommendations,
    isLoading,
    error,
    lastAnalyzedText,
    fetchRecommendations,
    refresh,
    addToReferences,
    addAllToReferences,
  } = useDiscoveryStore();

  const { isReferenceSelected } = useReferenceStore();

  // Fetch recommendations on mount or when featureText changes
  useEffect(() => {
    if (featureText && featureText.length > 0) {
      fetchRecommendations(projectId, featureText);
    }
  }, [projectId, featureText, fetchRecommendations]);

  const handleAdd = (systemId: string) => {
    addToReferences(systemId);
    onSystemAdded?.(systemId);
  };

  const handleAddAll = () => {
    addAllToReferences();
    onAllSystemsAdded?.();
  };

  const handleRefresh = () => {
    refresh(projectId, featureText);
  };

  const handleRetry = () => {
    refresh(projectId, featureText);
  };

  // Check if a system is already added
  const isSystemAdded = (systemId: string): boolean => {
    return existingReferenceIds.includes(systemId) || isReferenceSelected(systemId);
  };

  // Count of systems not yet added
  const availableToAddCount = recommendations.filter(
    (rec) => !isSystemAdded(rec.id)
  ).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SearchIcon />
          <h3 className="font-semibold text-gray-900">Related Systems</h3>
        </div>
        {recommendations.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              aria-label="Refresh recommendations"
            >
              <RefreshIcon />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleAddAll}
              disabled={isLoading || availableToAddCount === 0}
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add all recommendations"
            >
              Add All
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && <DiscoverySkeleton />}

      {!isLoading && error && (
        <ErrorState error={error} onRetry={handleRetry} />
      )}

      {!isLoading && !error && recommendations.length === 0 && lastAnalyzedText && (
        <EmptyState />
      )}

      {!isLoading && !error && recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((system) => (
            <RecommendationCard
              key={system.id}
              system={system}
              isAlreadyAdded={isSystemAdded(system.id)}
              onAdd={handleAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
