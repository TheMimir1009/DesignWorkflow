/**
 * CategorySelector Component
 * Tab-style category selection with completion status
 */
import type { QACategory } from '../../types/qa';

interface CategorySelectorProps {
  categories: QACategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  completedCategories?: string[];
}

/**
 * Category selector component for Q&A forms
 */
export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  completedCategories = [],
}: CategorySelectorProps) {
  // Sort categories by order
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const handleClick = (categoryId: string) => {
    // Toggle selection if clicking the same category
    if (selectedCategoryId === categoryId) {
      onSelectCategory(null);
    } else {
      onSelectCategory(categoryId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(categoryId);
    }
  };

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>No categories available</p>
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Question categories"
      className="flex flex-wrap gap-2 border-b border-gray-200 pb-4"
    >
      {sortedCategories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const isCompleted = completedCategories.includes(category.id);

        return (
          <button
            key={category.id}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`tabpanel-${category.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => handleClick(category.id)}
            onKeyDown={(e) => handleKeyDown(e, category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
                isSelected
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }
            `}
          >
            {isCompleted && (
              <svg
                data-testid={`completed-icon-${category.id}`}
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>{category.name}</span>
            <span
              className={`
                inline-flex items-center justify-center w-5 h-5 text-xs rounded-full
                ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}
              `}
            >
              {category.questionCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
