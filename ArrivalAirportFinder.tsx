import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { airports } from '../data/mockData';
import { SectionHeader } from './SectionHeader';
import {
  getDirectKoreanDepartures,
  formatDirectLabel,
} from '../data/flightDurations';
import { COUNTRIES } from '../lib/countries';
import { useAppState } from '../data/store';
import { CountryUnderlineTabs } from './CountryUnderlineTabs';
import { SubtleCard } from './SubtleCard';

/**
 * 도착 공항 기준으로 골프장 찾기. 도착지(일본) 관점이 1차축.
 *
 * UX:
 *  - 1차: 나라 탭 (jp/vn/hi/tw/my) — 현재는 jp 만 활성
 *  - 본문: 한국 직항이 있는 일본 공항 카드만 노출, 직항 노선 수 많은 순 → ICN 비행시간 짧은 순
 *  - 카드 라벨: "ICN 직항" / "ICN 외 N 직항"
 *  - 카드 탭 → /map?airport={id} 공항 포커스 진입 (지도 하단에서 한국 출발지별 직항 매트릭스 확인 가능)
 *
 * 환승 노선은 노출하지 않음 — 공공데이터 노선 정보로 직항 매트릭스만 정확히 보장 가능하기 때문.
 * 직항이 없는 공항/지역은 /map 에서 인근 직항 공항을 통해 탐색하는 것을 가정.
 */
export function ArrivalAirportFinder() {
  const navigate = useNavigate();
  const { setSelectedCountries, setSelectedRegions, setSelectedSubRegions } = useAppState();

  const [countryCode, setCountryCode] = useState<string>('jp');
  const isJapan = countryCode === 'jp';

  /**
   * 한국에서 직항이 있는 일본 공항 목록.
   * 정렬: 1차 — 직항 노선 수 desc / 2차 — ICN 비행시간 asc (가까운 공항 우선)
   */
  const directAirports = useMemo(() => {
    return airports
      .map(a => ({ airport: a, directs: getDirectKoreanDepartures(a.id) }))
      .filter(x => x.directs.length > 0)
      .sort((a, b) => {
        if (b.directs.length !== a.directs.length) return b.directs.length - a.directs.length;
        return a.directs[0].minutes - b.directs[0].minutes;
      });
  }, []);

  const handleCardClick = (airportId: string) => {
    setSelectedCountries(['jp']);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    navigate(`/map?airport=${airportId}`);
  };

  /** "모두보기" — 일본 전 권역 지도로 진입 (공항 포커스 없음) */
  const handleViewAll = () => {
    setSelectedCountries(['jp']);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    navigate('/map');
  };

  return (
    <div className="bg-white py-5">
      {/* 타이틀 (모두보기는 아래 나라 탭 행 우측에 배치) */}
      <SectionHeader title="공항 기준으로 티타임 탐색" />

      {/* 나라 탭(언더라인) — 좌측 탭들, 우측 모두보기. 텍스트 baseline 으로 정렬 */}
      <div className="flex items-baseline justify-between gap-3 px-5 mb-4">
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <CountryUnderlineTabs
            countries={COUNTRIES.map(c => ({ code: c.code, name: c.name }))}
            activeCode={countryCode}
            onSelect={setCountryCode}
          />
        </div>
        <button
          type="button"
          onClick={handleViewAll}
          className="flex-shrink-0 pb-1 text-[14px] font-medium text-ink-faint tracking-[-0.2px]"
        >
          모두보기
        </button>
      </div>

      {/* 두 상태(직항 공항 strip / 준비중 placeholder) 공통 컨테이너 셸 —
          min-h-[100px] 로 카드 높이(~88px) + 패딩을 흡수해 나라 전환 시 영역 들썩임 방지. */}
      <div className="px-5 min-h-[100px] overflow-x-auto scrollbar-hide">
        {!isJapan ? (
          <div className="min-h-[100px] flex items-center justify-center">
            <p className="text-[13px] font-medium text-ink-light tracking-[-0.2px]">
              {COUNTRIES.find(c => c.code === countryCode)?.name ?? ''} 공항 정보는 준비 중이에요.
            </p>
          </div>
        ) : directAirports.length === 0 ? (
          <div className="min-h-[100px] flex items-center justify-center">
            <p className="text-[13px] text-ink-light tracking-[-0.2px]">
              직항 공항 정보가 아직 준비 중이에요.
            </p>
          </div>
        ) : (
          <div className="flex gap-2 w-max">
            {directAirports.map(({ airport }) => {
              const regionLine =
                airport.prefecture && airport.prefecture !== airport.region
                  ? `${airport.region} ${airport.prefecture}`
                  : airport.region;
              return (
                <SubtleCard
                  key={airport.id}
                  as="button"
                  onClick={() => handleCardClick(airport.id)}
                  className="flex-shrink-0 w-[160px] p-3 text-left hover:border-ink transition-colors"
                >
                  {/* 공항명 + 코드 (한 줄) — 1순위 */}
                  <p className="text-[14px] font-bold text-ink tracking-[-0.2px] leading-snug">
                    {airport.name}
                    <span className="ml-1 text-[12px] font-medium text-ink-light">({airport.code})</span>
                  </p>
                  {/* 1차 권역 · 2차 권역 — 2순위 */}
                  <p className="mt-1 text-[12px] font-medium text-ink-mid tracking-[-0.2px]">
                    {regionLine}
                  </p>
                  {/* 직항 라벨 — 모두 직항만 노출되므로 항상 다크 + bold */}
                  <p className="mt-1.5 text-[12px] font-bold text-ink tracking-[-0.2px]">
                    {formatDirectLabel(airport.id)}
                  </p>
                </SubtleCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
