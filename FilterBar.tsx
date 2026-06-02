import { useState } from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import { SORT_LABELS, type SortOption } from '../data/store';
import { getActiveFilterCount, type FilterState } from './FilterSheet';
import { AvailableToggle } from './AvailableToggle';

interface Props {
  availableOnly: boolean;
  setAvailableOnly: (v: boolean) => void;
  filterState: FilterState;
  selectedRegions: string[];
  onFilterClick: () => void;
  /** 정렬 표시 여부 (지도보기에서는 false) */
  showSort?: boolean;
  sortBy?: SortOption;
  setSortBy?: (s: SortOption) => void;
}

export function FilterBar({
  availableOnly,
  setAvailableOnly,
  filterState,
  selectedRegions,
  onFilterClick,
  showSort = true,
  sortBy = 'recommended',
  setSortBy,
}: Props) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const activeFilterCount = getActiveFilterCount(filterState);
  const regionFilterActive = selectedRegions.length < 9;
  const totalBadge = activeFilterCount + (regionFilterActive ? 1 : 0);

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <button
        onClick={onFilterClick}
        className={`relative flex items-center gap-1 border rounded-[4px] px-[10px] py-[6px] text-[14px] font-medium tracking-[-0.5px] ${
          totalBadge > 0
            ? 'bg-[#F2FDF7] border-[#1AB277] text-[#1AB277]'
            : 'bg-[#F9FAFB] border-[#D9E0E8] text-[#272833]'
        }`}
      >
        <SlidersHorizontal className="w-5 h-5 rotate-90" />
        필터
      </button>

      <div className="flex items-center gap-[6px]">
        <AvailableToggle availableOnly={availableOnly} setAvailableOnly={setAvailableOnly} />
        {showSort && setSortBy && (
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(s => !s)}
              className="flex items-center gap-0.5 text-[14px] text-[#272833] font-medium tracking-[-0.5px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
              </svg>
              {SORT_LABELS[sortBy]}
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-40 bg-white border border-[#E6EBF0] rounded-[8px] shadow-lg overflow-hidden min-w-[180px]">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => {
                    const isActive = sortBy === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left transition-colors ${
                          isActive ? 'bg-[#F2FDF7] text-[#149867] font-semibold' : 'text-[#535D67] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <span className="flex-1">{SORT_LABELS[opt]}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#1AB277]" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
