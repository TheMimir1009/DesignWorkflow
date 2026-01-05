/**
 * SystemFilter Component
 * Filter controls for system documents (category dropdown and tag chips)
 */
import { useSystemStore } from '../../store/systemStore';

/**
 * SystemFilter - Filter controls for system documents
 */
export function SystemFilter() {
  const systems = useSystemStore((state) => state.systems);
  const categoryFilter = useSystemStore((state) => state.categoryFilter);
  const tagFilter = useSystemStore((state) => state.tagFilter);
  const setCategoryFilter = useSystemStore((state) => state.setCategoryFilter);
  const setTagFilter = useSystemStore((state) => state.setTagFilter);

  // Get unique categories from systems
  const categories = Array.from(new Set(systems.map((s) => s.category))).sort();

  // Get unique tags from systems
  const allTags = Array.from(new Set(systems.flatMap((s) => s.tags))).sort();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategoryFilter(value === '' ? null : value);
  };

  const handleTagClick = (tag: string) => {
    if (tagFilter.includes(tag)) {
      // Remove tag from filter
      setTagFilter(tagFilter.filter((t) => t !== tag));
    } else {
      // Add tag to filter
      setTagFilter([...tagFilter, tag]);
    }
  };

  const handleClearFilters = () => {
    setCategoryFilter(null);
    setTagFilter([]);
  };

  const hasActiveFilters = categoryFilter !== null || tagFilter.length > 0;

  return (
    <div data-testid="system-filter" className="space-y-3">
      {/* Category Dropdown */}
      <div>
        <label htmlFor="category-filter" className="block text-xs font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category-filter"
          value={categoryFilter ?? ''}
          onChange={handleCategoryChange}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Tag Chips */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
        <div data-testid="tag-chips" className="flex flex-wrap gap-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              data-testid={`tag-chip-${tag}`}
              onClick={() => handleTagClick(tag)}
              className={`
                px-2 py-0.5 text-xs rounded-full border transition-colors
                ${
                  tagFilter.includes(tag)
                    ? 'selected bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        disabled={!hasActiveFilters}
        className="w-full px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Clear Filters
      </button>
    </div>
  );
}
