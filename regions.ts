// ─────────────────────────────────────────────────────────────────
// 일본 권역 데이터 — 프로젝트 전역 single source of truth
// 권역 칩 / 검색 모달 / 지도 페이지 / 골프장 목록의 권역 매칭 모두
// 여기서 파생된다.
// ─────────────────────────────────────────────────────────────────

/** 1차 권역 구조 */
export interface JapanRegion {
  /** 권역 id (정렬·UI에 사용하는 한글명을 그대로 id로 사용) */
  id: string;
  /** 화면 표기용 라벨 (현재는 id와 동일하지만 향후 다국어 대응 시 분리 여지) */
  label: string;
  /**
   * 권역에 속하는 2차 권역(현·도시) 이름 목록.
   * 매칭 시 코스의 `region` 또는 `address` 에 이 문자열이 포함되어 있으면 해당 권역으로 간주.
   * 동일 현의 표기 변형(예: `구마모토`/`쿠마모토`, `카나가와`/`가나가와`)은 모두 포함한다.
   */
  subRegions: string[];
  /**
   * 화면 표기용 대표 2차 권역(현) 목록 — 표기 변형 제외, 사용자에게 노출.
   * 미지정 시 subRegions 를 그대로 사용 (해외 권역은 변형이 없어 별도 불필요).
   */
  displaySubRegions?: string[];
}

/** 1차 권역 정의 — UI 노출 순서대로 */
export const JAPAN_REGIONS_DATA: readonly JapanRegion[] = [
  { id: '규슈',     label: '규슈',     subRegions: ['후쿠오카', '오이타', '구마모토', '쿠마모토', '나가사키', '가고시마', '미야자키', '사가'], displaySubRegions: ['후쿠오카', '오이타', '구마모토', '나가사키', '가고시마', '미야자키', '사가'] },
  { id: '간토',     label: '간토',     subRegions: ['도쿄', '치바', '사이타마', '가나가와', '카나가와', '이바라키', '도치기', '토치기', '군마'], displaySubRegions: ['도쿄', '치바', '사이타마', '가나가와', '이바라키', '도치기', '군마'] },
  { id: '간사이',   label: '간사이',   subRegions: ['오사카', '교토', '효고', '나라', '시가', '와카야마', '미에'], displaySubRegions: ['오사카', '교토', '효고', '나라', '시가', '와카야마', '미에'] },
  { id: '주부',     label: '주부',     subRegions: ['아이치', '시즈오카', '기후', '나가노', '야마나시', '니가타', '도야마', '이시카와', '후쿠이'], displaySubRegions: ['아이치', '시즈오카', '기후', '나가노', '야마나시', '니가타', '도야마', '이시카와', '후쿠이'] },
  { id: '홋카이도', label: '홋카이도', subRegions: ['홋카이도', '삿포로', '하코다테', '아사히카와', '쿠시로', '니세코'], displaySubRegions: ['삿포로', '하코다테', '아사히카와', '쿠시로', '니세코'] },
  { id: '오키나와', label: '오키나와', subRegions: ['오키나와', '미야코', '이시가키'], displaySubRegions: ['오키나와 본섬', '미야코', '이시가키'] },
  { id: '도호쿠',   label: '도호쿠',   subRegions: ['도호쿠', '미야기', '센다이', '후쿠시마', '야마가타', '이와테', '아키타', '아오모리'], displaySubRegions: ['미야기', '센다이', '후쿠시마', '야마가타', '이와테', '아키타', '아오모리'] },
  { id: '시코쿠',   label: '시코쿠',   subRegions: ['시코쿠', '카가와', '에히메', '도쿠시마', '고치', '마쓰야마'], displaySubRegions: ['카가와', '에히메', '도쿠시마', '고치'] },
  { id: '주고쿠',   label: '주고쿠',   subRegions: ['주고쿠', '히로시마', '오카야마', '시마네', '돗토리', '야마구치'], displaySubRegions: ['히로시마', '오카야마', '시마네', '돗토리', '야마구치'] },
] as const;

/** 1차 권역 id 배열 — UI 칩/필터에서 자주 쓰임 */
export const REGION_IDS: readonly string[] = JAPAN_REGIONS_DATA.map(r => r.id);

/** 1차 권역 → 2차 권역 매핑 (lookup용 derived map) */
export const JAPAN_SUB_REGIONS: Record<string, readonly string[]> = Object.fromEntries(
  JAPAN_REGIONS_DATA.map(r => [r.id, r.subRegions]),
);

/** 2차 권역(현·도시) → 1차 권역 역 조회. 매칭 실패 시 null */
export function getParentRegion(prefecture: string): string | null {
  for (const r of JAPAN_REGIONS_DATA) {
    if (r.subRegions.includes(prefecture)) return r.id;
  }
  return null;
}

/**
 * 코스의 prefecture(현 단위)가 selectedRegions(1차 권역) 중 하나에 속하는지.
 * GolfCourseList의 권역 필터링에서 사용.
 */
export function isPrefectureInRegions(prefecture: string, selectedRegions: string[]): boolean {
  if (!selectedRegions || selectedRegions.length === 0) return true;
  return selectedRegions.some(region => {
    const subs = JAPAN_SUB_REGIONS[region];
    return subs ? subs.includes(prefecture) : false;
  });
}
