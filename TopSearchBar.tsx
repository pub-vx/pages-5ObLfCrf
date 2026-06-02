import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, ChevronUp, Info, Search } from 'lucide-react';
import { DateStrip } from './DateStrip';
import { SearchModal } from './SearchModal';
import { RegionPickerA } from './region-picker/RegionPickerA';
import { AppHeader, HeaderAction } from './AppHeader';
import { useAppState } from '../data/store';
import { getCountriesIn } from '../lib/countries';

export function TopSearchBar() {
  const navigate = useNavigate();
  const {
    selectedCountries,
    selectedRegions,
    arrivalContext,
  } = useAppState();
  const currentCountry = getCountriesIn(selectedCountries)[0];
  const countryLabel = currentCountry?.name ?? '일본';

  // 권역 상태 라벨 — "전체" / "규슈"(단일) / "규슈 외 2"(다중)
  const allRegionIds = currentCountry?.regions.map(r => r.id) ?? [];
  const selInCountry = selectedRegions.filter(r => allRegionIds.includes(r));
  let regionLabel: string;
  if (selInCountry.length === 0 || selInCountry.length === allRegionIds.length) {
    regionLabel = '전체';
  } else if (selInCountry.length === 1) {
    regionLabel = selInCountry[0];
  } else {
    regionLabel = `${selInCountry[0]} 외 ${selInCountry.length - 1}`;
  }
  // 최종 타이틀 라벨 — 예: "일본 전체", "일본 규슈"
  const titleLabel = `${countryLabel} ${regionLabel}`;

  const [showCalcInfo, setShowCalcInfo] = useState(false);
  const [regionSheetOpen, setRegionSheetOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // 항공편 컨텍스트 여부 (도착 시각 계산 안내 노출 조건)
  const isFlight = !!arrivalContext?.flightCode;

  return (
    <>
      {/* 타이틀 바 — 좌 뒤로 / 중앙 나라·권역(어디로 바텀시트 트리거) / 우 검색·홈 */}
      <AppHeader
        onBack={handleBack}
        border={false}
        showHome
        title={
          <button
            onClick={() => setRegionSheetOpen(true)}
            className="inline-flex items-baseline p-1 text-base font-bold text-[#272833]"
          >
            <span className="underline underline-offset-4 decoration-[1.5px]">{titleLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 self-center ml-0.5 text-[#535D67] transition-transform ${regionSheetOpen ? 'rotate-180' : ''}`} />
            <span className="ml-1.5">골프장 목록</span>
          </button>
        }
        right={
          <HeaderAction onClick={() => setSearchModalOpen(true)} label="검색">
            <Search className="w-5 h-5 text-[#272833]" />
          </HeaderAction>
        }
      >
        {/* 항공편 모드일 때 도착 시각 계산 안내 */}
        {isFlight && (
          <div className="px-4 py-1.5 bg-[#F9FAFB] border-b border-[#F0F2F5]">
            <button
              onClick={() => setShowCalcInfo(s => !s)}
              className="w-full flex items-center gap-1 text-left"
            >
              <Info className="w-3 h-3 text-[#9EABBA] flex-shrink-0" />
              <span className="text-[11px] text-[#6A7683] flex-1">
                골프장 도착 시각은 <span className="font-medium">입국 60분 + 평균 60km/h</span> 기준 추정값
              </span>
              {showCalcInfo ? <ChevronUp className="w-3 h-3 text-[#9EABBA]" /> : <ChevronDown className="w-3 h-3 text-[#9EABBA]" />}
            </button>
            {showCalcInfo && (
              <div className="mt-2 p-2.5 bg-white rounded-[8px] border border-[#E6EBF0] text-[11px] text-[#6A7683] leading-relaxed">
                <p className="font-bold text-[#272833] mb-1">계산 공식</p>
                <p>골프장 도착 = <span className="text-[#272833] font-medium">항공편 도착시각 + 60분(입국수속) + 이동시간</span></p>
                <p className="mt-1">이동시간 = 직선거리(km) ÷ 60km/h</p>
                <p className="mt-2 text-[#9EABBA]">
                  ※ 실제 도로 굴곡, 입국 혼잡도, 시내 정체 등에 따라 달라질 수 있어요. 여유 있게 일정을 잡아주세요.
                </p>
              </div>
            )}
          </div>
        )}

        <DateStrip />
      </AppHeader>

      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* 타이틀(나라·권역) 클릭 → 어디로 바텀시트 (나라 + 1·2차 권역 + 지도) */}
      <RegionPickerA open={regionSheetOpen} onOpenChange={setRegionSheetOpen} />
    </>
  );
}
