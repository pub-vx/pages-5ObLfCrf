import { useMemo } from 'react';
import { GolfCourseCard } from './GolfCourseCard';
import { getCoursesForDate, type GolfCourse } from '../data/mockData';
import { useAppState } from '../data/store';
import { findNearestAirport } from '../lib/geo';
import { getCountry, isCourseInCountryRegions } from '../lib/countries';

function airportDistanceOf(c: GolfCourse): number {
  return findNearestAirport(c).km;
}

export function GolfCourseList() {
  const {
    sortBy, selectedDate, availableOnly,
    selectedCountries, selectedRegions, selectedSubRegions, playerCount,
  } = useAppState();

  const { topAds, mainList } = useMemo(() => {
    // 1) 선택된 나라(없으면 jp 디폴트) 로 우선 필터
    const targetCountry = selectedCountries[0] ?? 'jp';
    const country = getCountry(targetCountry);
    let dated = getCoursesForDate(selectedDate).filter(c => (c.country ?? 'jp') === targetCountry);

    // 2) 권역/하위지역 필터 — 모든 나라 공통 (country.regions 매핑 기반)
    if ((selectedRegions && selectedRegions.length > 0) || (selectedSubRegions && selectedSubRegions.length > 0)) {
      dated = dated.filter(c =>
        isCourseInCountryRegions(country, c.region ?? '', c.address ?? '', selectedRegions, selectedSubRegions, c.subRegion)
      );
    }
    if (availableOnly) {
      dated = dated.filter(c => c.remainingTeams > 0 && c.plans && c.plans.length > 0);
    }
    // 인원수 필터 — 'group'(단체)은 5인 이상 수용 가능한 plan 매칭
    const targetN = playerCount === 'group' ? 5 : playerCount;
    dated = dated.filter(c =>
      !c.plans || c.plans.length === 0 ||
      c.plans.some(p => p.minPlayer <= targetN && targetN <= p.maxPlayer)
    );
    const internalAds = dated.filter(c => c.isAd && !c.isExternalAd && c.remainingTeams > 0);
    const externalAd = dated.find(c => c.isExternalAd && c.remainingTeams > 0);
    const normals = dated.filter(c => !c.isAd);

    const sortFn = (a: GolfCourse, b: GolfCourse) => {
      switch (sortBy) {
        case 'price':
          return a.lowestPrice - b.lowestPrice;
        case 'teams':
          return b.remainingTeams - a.remainingTeams;
        case 'airport':
          return airportDistanceOf(a) - airportDistanceOf(b);
        default:
          return 0;
      }
    };

    const isRecommended = sortBy === 'recommended';

    // mainList 는 항상 normals(=비광고) 만 — internalAds 는 isRecommended 일 때 topAds 로 별도 노출
    // (이전엔 mainList 에 internalAds 까지 합쳐 넣어 topAds 와 중복 렌더링되던 버그 수정)
    const merged: GolfCourse[] = [...normals].sort(sortFn);

    if (isRecommended && externalAd) {
      const insertAt = Math.min(4, merged.length);
      merged.splice(insertAt, 0, externalAd);
    }

    return {
      topAds: isRecommended ? internalAds : [],
      mainList: merged,
    };
  }, [sortBy, selectedDate, availableOnly, selectedCountries, selectedRegions, selectedSubRegions, playerCount]);

  const isRecommended = sortBy === 'recommended';
  const isEmpty = mainList.length === 0 && topAds.length === 0;

  return (
    // pb-1: LegalFooter 와의 간격을 줄여 리스트의 마지막 카드가 고지문에 붙는 느낌
    <div className="pb-1">
      {isEmpty && (
        <div className="px-6 py-16 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[24px]">⛳</div>
          <p className="text-[15px] font-bold text-[#272833] tracking-[-0.3px] mb-1">
            {availableOnly ? '예약 가능한 골프장이 없어요' : '조건에 맞는 골프장이 없어요'}
          </p>
          <p className="text-[13px] text-[#6A7683] tracking-[-0.2px] leading-relaxed">
            다른 날짜나 권역으로 다시 시도해 주세요
          </p>
        </div>
      )}
      {topAds.length > 0 && (
        <>
          {topAds.map(course => (
            <GolfCourseCard key={`ad-${course.id}`} course={course} />
          ))}
          <div className="h-[6px] bg-[#F0F2F5]" />
        </>
      )}
      {mainList.map(course => (
        <GolfCourseCard
          key={course.id}
          course={course}
          hideAdBadge={isRecommended}
        />
      ))}
    </div>
  );
}
