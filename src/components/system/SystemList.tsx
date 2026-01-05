/**
 * SystemList Component
 * List of system documents with category grouping
 */
import { useSystemStore } from '../../store/systemStore';
import { SystemCard } from './SystemCard';

/**
 * SystemList - Displays system documents grouped by category
 */
export function SystemList() {
  const systems = useSystemStore((state) => state.systems);
  const selectedSystemIds = useSystemStore((state) => state.selectedSystemIds);
  const toggleSelect = useSystemStore((state) => state.toggleSelect);
  const openEditModal = useSystemStore((state) => state.openEditModal);
  const openDeleteConfirm = useSystemStore((state) => state.openDeleteConfirm);
  const getFilteredSystems = useSystemStore((state) => state.getFilteredSystems);
  const getSystemsByCategory = useSystemStore((state) => state.getSystemsByCategory);

  const filteredSystems = getFilteredSystems();
  const groupedSystems = getSystemsByCategory();

  // Empty state when no systems exist at all
  if (systems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500 text-sm">
        No system documents found
      </div>
    );
  }

  // Empty state when filter returns no results
  if (filteredSystems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500 text-sm">
        No matching systems found
      </div>
    );
  }

  // Get categories that have filtered systems
  const visibleCategories = Object.keys(groupedSystems).filter(
    (category) => groupedSystems[category].some((system) =>
      filteredSystems.some((f) => f.id === system.id)
    )
  );

  return (
    <div className="space-y-4">
      {visibleCategories.map((category) => {
        const categorySystemsFiltered = groupedSystems[category].filter((system) =>
          filteredSystems.some((f) => f.id === system.id)
        );

        if (categorySystemsFiltered.length === 0) return null;

        return (
          <div key={category}>
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-700 capitalize">{category}</h3>
              <span className="text-xs text-gray-500">({categorySystemsFiltered.length})</span>
            </div>

            {/* Category Systems */}
            <div className="space-y-2">
              {categorySystemsFiltered.map((system) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  isSelected={selectedSystemIds.includes(system.id)}
                  onToggleSelect={toggleSelect}
                  onEdit={openEditModal}
                  onDelete={openDeleteConfirm}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
