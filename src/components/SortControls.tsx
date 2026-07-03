'use client';

export type SortOption = 'createdAt' | 'price' | 'bedrooms' | 'inspectionDate';

interface SortControlsProps {
  currentSort: SortOption;
  currentOrder: 'asc' | 'desc';
  onSortChange: (sort: SortOption, order: 'asc' | 'desc') => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'price', label: 'Price' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'inspectionDate', label: 'Inspection' },
];

export default function SortControls({
  currentSort,
  currentOrder,
  onSortChange,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-gray-500 whitespace-nowrap">
        Sort by
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption, currentOrder)}
          className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <button
        onClick={() => onSortChange(currentSort, currentOrder === 'asc' ? 'desc' : 'asc')}
        className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-label={`Sort ${currentOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        {currentOrder === 'asc' ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
    </div>
  );
}
