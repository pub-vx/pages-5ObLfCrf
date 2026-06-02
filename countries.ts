// ─────────────────────────────────────────────────────────────────
// 나라/권역/하위지역 다국가 데이터 — 프로토타입 v3
// 일본만 실 골프장 mock 데이터를 가지며 나머지는 UI 구조 확인용 placeholder.
// 권역 ID는 country 간 충돌이 없도록 한국어 이름 그대로 유지하고,
// 결과 필터링은 selectedCountries + selectedRegions 조합으로 처리한다.
// ─────────────────────────────────────────────────────────────────

import { JAPAN_REGIONS_DATA, type JapanRegion } from './regions';

export type CountryRegion = JapanRegion;

export interface Country {
  /** ISO 2-letter 또는 임의 코드 */
  code: string;
  /** 화면 표기용 한글 라벨 */
  name: string;
  /** 국기/심볼 이모지 */
  flag: string;
  /** 실시간 예약 가능 여부 — false 면 UI에서 "준비중" 배지 노출, 결과는 0건 */
  available: boolean;
  /** 1차 권역 목록 */
  regions: readonly CountryRegion[];
}

/** 일본 외 나라들 — 프로토타입 UI 구조 검증용 데이터 (실 골프장 데이터는 없음) */
const VIETNAM_REGIONS: CountryRegion[] = [
  { id: '북부', label: '북부', subRegions: ['하노이', '하롱'] },
  { id: '중부', label: '중부', subRegions: ['다낭', '호이안', '나트랑'] },
  { id: '남부', label: '남부', subRegions: ['호치민', '푸꾸옥', '달랏'] },
];

const HAWAII_REGIONS: CountryRegion[] = [
  { id: '오아후', label: '오아후', subRegions: ['호놀룰루', '카일루아'] },
  { id: '마우이', label: '마우이', subRegions: ['카팔루아', '와일레아'] },
  { id: '빅아일랜드', label: '빅아일랜드', subRegions: ['코나', '힐로'] },
];

const TAIWAN_REGIONS: CountryRegion[] = [
  { id: '북부', label: '북부', subRegions: ['타이베이', '신주'] },
  { id: '중부', label: '중부', subRegions: ['타이중'] },
  { id: '남부', label: '남부', subRegions: ['가오슝', '타이난'] },
];

const MALAYSIA_REGIONS: CountryRegion[] = [
  { id: '쿠알라룸푸르권', label: '쿠알라룸푸르권', subRegions: ['쿠알라룸푸르', '셀랑고르'] },
  { id: '페낭권', label: '페낭권', subRegions: ['페낭', '랑카위'] },
  { id: '동부', label: '동부', subRegions: ['코타키나발루'] },
];

export const COUNTRIES: readonly Country[] = [
  { code: 'jp', name: '일본',    flag: '🇯🇵', available: true,  regions: JAPAN_REGIONS_DATA },
  { code: 'vn', name: '베트남',  flag: '🇻🇳', available: false, regions: VIETNAM_REGIONS },
  { code: 'hi', name: '하와이',  flag: '🌺', available: false, regions: HAWAII_REGIONS },
  { code: 'tw', name: '대만',    flag: '🇹🇼', available: false, regions: TAIWAN_REGIONS },
  { code: 'my', name: '말레이시아', flag: '🇲🇾', available: false, regions: MALAYSIA_REGIONS },
] as const;

/** code 배열을 받아 정의 순서대로 Country 객체 반환 */
export function getCountriesIn(codes: string[]): Country[] {
  return COUNTRIES.filter(c => codes.includes(c.code));
}

/** code 로 단일 Country 조회 (없으면 undefined) */
export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/**
 * 코스가 (해당 나라 기준) 선택된 1차/2차 권역 필터에 매칭되는지.
 * - selectedRegions·selectedSubRegions 둘 다 비어 있으면 true (필터 없음)
 * - 1차 권역은 그 권역의 모든 subRegions 로 확장한 뒤
 *   courseRegion / courseSubRegion / courseAddress 어느 한 곳에 포함되면 매칭
 * - 해외 코스는 region 에 1차 권역(예: '북부') 만 들고, 2차 권역은 별도 subRegion 에 저장
 *   → 1차 권역 매칭 시 courseRegion 직접 일치 또는 courseSubRegion 일치로 잡힘
 */
export function isCourseInCountryRegions(
  country: Country | undefined,
  courseRegion: string,
  courseAddress: string,
  selectedRegions: string[],
  selectedSubRegions: string[],
  courseSubRegion?: string,
): boolean {
  if (!country) return true;
  if (selectedRegions.length === 0 && selectedSubRegions.length === 0) return true;

  // 1차 권역 직접 매칭 — 해외 코스는 region 이 1차 권역 ID 자체
  if (selectedRegions.includes(courseRegion)) return true;

  // 2차 권역 풀 확장 매칭
  const targets = new Set<string>();
  for (const r of selectedRegions) {
    const region = country.regions.find(cr => cr.id === r);
    if (region) for (const sr of region.subRegions) targets.add(sr);
  }
  for (const sr of selectedSubRegions) targets.add(sr);
  if (targets.size === 0) return false;

  for (const t of targets) {
    if (courseRegion.includes(t)) return true;
    if (courseSubRegion && courseSubRegion.includes(t)) return true;
    if (courseAddress.includes(t)) return true;
  }
  return false;
}
