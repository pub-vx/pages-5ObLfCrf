import { useState } from 'react';
import { FilterBar } from './FilterBar';
import { FilterSheet } from './FilterSheet';
import { useAppState } from '../data/store';

/**
 * /search 페이지의 필터/정렬 컨트롤.
 * FilterBar(필터·정렬 트리거) + FilterSheet(상세 필터 바텀시트) 캡슐화.
 * 이전엔 TopSearchBar 내부에 있었으나, QuickCurationFilters 와 위치 자유롭게 두기 위해 별도 컴포넌트로 분리.
 */
export function SearchFilterControls() {
  const {
    availableOnly,
    setAvailableOnly,
    filterState,
    setFilterState,
    selectedRegions,
    sortBy,
    setSortBy,
  } = useAppState();
  const [showDetailFilter, setShowDetailFilter] = useState(false);

  return (
    <>
      <FilterBar
        availableOnly={availableOnly}
        setAvailableOnly={setAvailableOnly}
        filterState={filterState}
        selectedRegions={selectedRegions}
        onFilterClick={() => setShowDetailFilter(true)}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <FilterSheet
        open={showDetailFilter}
        onOpenChange={setShowDetailFilter}
        initial={filterState}
        onApply={setFilterState}
      />
    </>
  );
}
