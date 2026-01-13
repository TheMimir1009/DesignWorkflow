/**
 * CategorySelector Component
 * Tab-based category selection for Q&A system
 */
import type { QACategory } from '../../types/qa';

/**
 * Category definition for display
 */
interface CategoryOption {
  id: QACategory;
  name: string;
}

/**
 * Available categories
 */
const CATEGORIES: CategoryOption[] = [
  { id: 'game_mechanic', name: 'Game Mechanics' },
  { id: 'economy', name: 'Economy' },
  { id: 'growth', name: 'Growth' },
];

/**
 * Props for CategorySelector
 */
export interface CategorySelectorProps {
  /** Currently selected category */
  selected: QACategory;
  /** Callback when category changes */
  onChange: (category: QACategory) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * CategorySelector - Tab-based category selection
 */
export function CategorySelector({
  selected,
  onChange,
  disabled = false,
}: CategorySelectorProps) {
  return (
    <div className="mb-6" role="tablist" aria-label="Question categories">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        {CATEGORIES.map((category) => {
          const isSelected = selected === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => !disabled && onChange(category.id)}
              disabled={disabled}
              className={`
                flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  isSelected
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
