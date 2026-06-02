import { Plane } from 'lucide-react';
import { airports } from '../../data/mockData';
import {
  KOREAN_DEPARTURES,
  getDirectKoreanDepartures,
  formatFlightDuration,
} from '../../data/flightDurations';

interface Props {
  airportId: string;
  onClose: () => void;
}

/**
 * 지도 하단 공항 정보 패널 — selectedAirportId 활성 시 노출.
 * 한국 출발지별 직항 ✓/✗ + 비행시간 매트릭스를 통째로 보여준다.
 * 홈 카드는 가벼운 라벨만 가지고, 정밀 비교는 여기서 책임진다.
 */
export function AirportInfoPanel({ airportId, onClose }: Props) {
  const airport = airports.find(a => a.id === airportId);
  if (!airport) return null;

  const directs = getDirectKoreanDepartures(airportId);
  const directById = new Map(directs.map(d => [d.koreanAirport.id, d.minutes]));

  return (
    <div className="absolute bottom-20 left-3 right-3 z-[450] bg-white rounded-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] border border-[#D9E0E8] overflow-hidden">
      {/* 헤더 — 패딩/폰트 축소, 공항명과 권역+직항수를 한 영역에 묶음 */}
      <div className="px-3 py-2.5 border-b border-[#F0F2F5] pr-9">
        <h3 className="text-[14px] font-bold text-[#272833] tracking-[-0.3px]">
          {airport.name}
          <span className="ml-1 text-[12px] font-medium text-[#9EABBA]">({airport.code})</span>
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-[#6A7683] tracking-[-0.2px]">
          {airport.region} 권역
          {directs.length > 0 ? (
            <span className="ml-1.5 text-[#149867] font-bold">
              한국 {directs.length}개 직항
            </span>
          ) : (
            <span className="ml-1.5 text-[#D9651E] font-bold">
              한국 직항 없음
            </span>
          )}
        </p>
      </div>

      {/* 한국 출발지별 직항 — 2열 그리드로 컴팩트화. 환승 줄 제거 (홈 방향성과 동일: 직항만 노출). */}
      {directs.length > 0 && (
        <div className="px-3 py-2.5">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {KOREAN_DEPARTURES.filter(k => directById.has(k.id)).map(k => {
              const minutes = directById.get(k.id)!;
              return (
                <div key={k.id} className="flex items-center justify-between text-[12px] tracking-[-0.2px] min-w-0">
                  <span className="text-[#272833] font-medium truncate">{k.short}</span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#272833] flex-shrink-0 ml-1">
                    <Plane className="w-2.5 h-2.5 text-[#1AB277]" strokeWidth={2.4} />
                    {formatFlightDuration(minutes, 'short')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 닫기 */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center text-[#9EABBA] hover:text-[#6A7683]"
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
}
