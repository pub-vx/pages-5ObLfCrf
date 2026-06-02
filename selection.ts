// 다중 선택 공용 헬퍼 — RegionPicker / FilterSheet 등에서 공유.
// 1차/2차 권역 + 나라 선택 토글 시 관련 하위 선택이 자동 정리되도록 한다.

import { COUNTRIES } from './countries';

/** 배열에서 값 토글 — 있으면 제거, 없으면 추가 */
export function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

/** 특정 나라 코드의 1차 권역 ID 목록 (toggle 헬퍼 내부용) */
function regionIdsOf(countryCode: string): string[] {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.regions.map(r => r.id) : [];
}

/** 특정 나라 코드의 2차 권역(하위 지역) 목록 (toggle 헬퍼 내부용) */
function subRegionsOf(countryCode: string): string[] {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.regions.flatMap(r => r.subRegions) : [];
}

/** 1차 권역 ID 로 그 권역의 2차 권역 목록 조회 (toggle 헬퍼 내부용) */
function subRegionsOfRegion(regionId: string): string[] {
  for (const country of COUNTRIES) {
    const r = country.regions.find(rr => rr.id === regionId);
    if (r) return [...r.subRegions];
  }
  return [];
}

/**
 * 나라 토글 시 그 나라의 1차/2차 권역 선택도 함께 정리.
 * 새 상태 = { countries, regions, subs } 반환.
 */
export function toggleCountrySelection(
  state: { countries: string[]; regions: string[]; subs: string[] },
  code: string,
): { countries: string[]; regions: string[]; subs: string[] } {
  if (state.countries.includes(code)) {
    const removeRegions = new Set(regionIdsOf(code));
    const removeSubs = new Set(subRegionsOf(code));
    return {
      countries: state.countries.filter(c => c !== code),
      regions: state.regions.filter(r => !removeRegions.has(r)),
      subs: state.subs.filter(s => !removeSubs.has(s)),
    };
  }
  return { ...state, countries: [...state.countries, code] };
}

/**
 * 1차 권역 토글 시 그 권역의 2차 권역 선택도 함께 정리.
 */
export function toggleRegionSelection(
  state: { regions: string[]; subs: string[] },
  regionId: string,
): { regions: string[]; subs: string[] } {
  if (state.regions.includes(regionId)) {
    const removeSubs = new Set(subRegionsOfRegion(regionId));
    return {
      regions: state.regions.filter(r => r !== regionId),
      subs: state.subs.filter(s => !removeSubs.has(s)),
    };
  }
  return { ...state, regions: [...state.regions, regionId] };
}
