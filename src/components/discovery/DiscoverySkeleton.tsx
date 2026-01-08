/**
 * DiscoverySkeleton Component
 * Loading skeleton UI for discovery recommendations
 * SPEC-DISCOVERY: Loading state UI (AC-004)
 */

export interface DiscoverySkeletonProps {
  /** Number of skeleton cards to display (default: 3) */
  count?: number;
}

/**
 * Skeleton card component for loading state
 */
function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      {/* Header with title and button */}
      <div className="flex items-center justify-between mb-3">
        <div
          data-testid="skeleton-title"
          className="h-5 w-40 bg-gray-200 rounded animate-pulse"
        />
        <div
          data-testid="skeleton-button"
          data-pulse="true"
          className="h-8 w-16 bg-gray-200 rounded animate-pulse"
        />
      </div>

      {/* Match reason placeholder */}
      <div
        data-testid="skeleton-pulse"
        className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3"
      />

      {/* Progress bar placeholder */}
      <div
        data-testid="skeleton-progress"
        className="h-2 w-full bg-gray-200 rounded animate-pulse"
      />
    </div>
  );
}

/**
 * DiscoverySkeleton Component
 * Displays skeleton loading UI while fetching recommendations
 */
export function DiscoverySkeleton({ count = 3 }: DiscoverySkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading recommendations"
      className="space-y-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
