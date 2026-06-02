import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './ui/sheet';
import { Slider } from './ui/slider';
import { formatKrw, jpyToKrw, EXCHANGE_RATE, EXCHANGE_RATE_DATE } from '../data/mockData';
import { toggleInArray } from '../lib/selection';

export interface FilterState {
  timeSlots: string[];
  playStyles: string[];
  inclusions: string[];
  priceRange: [number, number];
}

/** 1인 라운드 가격 슬라이더 범위 (JPY) — 시드 데이터 분포에 맞춘 기본 구간 */
export const PRICE_RANGE_MIN = 5000;
export const PRICE_RANGE_MAX = 25000;
export const DEFAULT_PRICE_RANGE: [number, number] = [PRICE_RANGE_MIN, PRICE_RANGE_MAX];

export const DEFAULT_FILTER: FilterState = {
  timeSlots: [],
  playStyles: [],
  inclusions: [],
  priceRange: DEFAULT_PRICE_RANGE,
};

export function getActiveFilterCount(state: FilterState): number {
  return state.timeSlots.length
    + state.playStyles.length
    + state.inclusions.length
    + (state.priceRange[0] !== PRICE_RANGE_MIN || state.priceRange[1] !== PRICE_RANGE_MAX ? 1 : 0);
}

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: FilterState;
  onApply: (state: FilterState) => void;
}

/**
 * 맞춤 골프장 검색(라운드 조건 필터) 시트.
 * 지역/권역 선택은 "어디로" 시트(RegionPickerA)에서 담당하므로 여기서는 다루지 않는다.
 */
export function FilterSheet({ open, onOpenChange, initial, onApply }: FilterSheetProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>(initial.timeSlots);
  const [playStyles, setPlayStyles] = useState<string[]>(initial.playStyles);
  const [inclusions, setInclusions] = useState<string[]>(initial.inclusions);
  const [priceRange, setPriceRange] = useState<number[]>(initial.priceRange);

  // 시트 열릴 때마다 외부 initial 값으로 동기화
  useEffect(() => {
    if (!open) return;
    setTimeSlots(initial.timeSlots);
    setPlayStyles(initial.playStyles);
    setInclusions(initial.inclusions);
    setPriceRange(initial.priceRange);
  }, [open, initial]);

  const toggle = (list: string[], setter: (v: string[]) => void, value: string) => {
    setter(toggleInArray(list, value));
  };

  const reset = () => {
    setTimeSlots([]);
    setPlayStyles([]);
    setInclusions([]);
    setPriceRange([PRICE_RANGE_MIN, PRICE_RANGE_MAX]);
  };

  const apply = () => {
    onApply({
      timeSlots,
      playStyles,
      inclusions,
      priceRange: [priceRange[0], priceRange[1]],
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-2 border-b border-[#E6EBF0]">
          <SheetTitle className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] text-left">맞춤 골프장 검색</SheetTitle>
          <SheetDescription className="text-[12px] font-medium text-[#6A7683] tracking-[-0.2px] text-left">
            원하는 라운드 조건을 선택하세요
          </SheetDescription>
        </SheetHeader>

        {/* 본문 — 라운드 조건 */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          <div className="space-y-5">
            <div>
              <h3 className="text-[14px] font-bold tracking-[-0.2px] mb-2 text-[#272833]">시간대</h3>
              <div className="flex gap-1.5">
                {[
                  { id: '새벽', label: '새벽', sub: '~06:59' },
                  { id: '오전', label: '오전', sub: '07:00~11:59' },
                  { id: '오후', label: '오후', sub: '12:00~' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => toggle(timeSlots, setTimeSlots, t.id)}
                    className={`py-[8px] px-[12px] rounded-full text-[13px] font-medium transition-all flex items-center gap-1 border tracking-[-0.2px] whitespace-nowrap ${
                      timeSlots.includes(t.id)
                        ? 'border-[#272833] text-[#272833] font-bold'
                        : 'border-[#D9E0E8] text-[#9EABBA] font-medium'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`text-[10px] ${timeSlots.includes(t.id) ? 'text-[#6A7683]' : 'text-[#a4b3c4]'}`}>{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold tracking-[-0.2px] mb-2 text-[#272833]">플레이스타일</h3>
              <div className="flex flex-wrap gap-1.5">
                {['셀프플레이','캐디포함','2인보장','쓰루플레이'].map(s => (
                  <button
                    key={s}
                    onClick={() => toggle(playStyles, setPlayStyles, s)}
                    className={`py-[8px] px-[12px] rounded-full text-[13px] font-medium transition-all border tracking-[-0.2px] ${
                      playStyles.includes(s)
                        ? 'border-[#272833] text-[#272833] font-bold'
                        : 'border-[#D9E0E8] text-[#9EABBA] font-medium'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[14px] font-bold tracking-[-0.2px] mb-2 text-[#272833]">포함사항</h3>
              <div className="flex flex-wrap gap-1.5">
                {['중식포함','조식포함','숙박포함','카트포함','셔틀버스운영'].map(inc => (
                  <button
                    key={inc}
                    onClick={() => toggle(inclusions, setInclusions, inc)}
                    className={`py-[8px] px-[12px] rounded-full text-[13px] font-medium transition-all border tracking-[-0.2px] ${
                      inclusions.includes(inc)
                        ? 'border-[#272833] text-[#272833] font-bold'
                        : 'border-[#D9E0E8] text-[#9EABBA] font-medium'
                    }`}
                  >
                    {inc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-bold tracking-[-0.2px] text-[#272833]">플레이 요금</h3>
                <span className="text-[10px] font-medium text-[#9EABBA] tracking-[-0.1px]">
                  적용 환율: 1¥ ≈ {EXCHANGE_RATE}원 ({EXCHANGE_RATE_DATE} 기준)
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-[#448FFF] font-semibold">¥{priceRange[0].toLocaleString()}</span>
                    <span className="text-[10px] text-[#9EABBA]">약 {formatKrw(jpyToKrw(priceRange[0]))}</span>
                  </div>
                  <span className="text-[#9EABBA] mt-1">~</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[#448FFF] font-semibold">¥{priceRange[1].toLocaleString()}</span>
                    <span className="text-[10px] text-[#9EABBA]">약 {formatKrw(jpyToKrw(priceRange[1]))}</span>
                  </div>
                </div>
                <Slider min={PRICE_RANGE_MIN} max={PRICE_RANGE_MAX} step={1000} value={priceRange} onValueChange={setPriceRange} className="w-full" />
                <div className="flex items-center justify-between text-xs text-[#9EABBA]">
                  <span>¥{PRICE_RANGE_MIN.toLocaleString()}</span>
                  <span>¥{PRICE_RANGE_MAX.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="px-4 py-4 bg-white border-t border-[#E6EBF0]">
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-[#D9E0E8] text-[#535D67] rounded-[8px] text-[13px] font-bold tracking-[-0.2px] hover:bg-[#F9FAFB]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              초기화
            </button>
            <button
              onClick={apply}
              className="px-4 py-3 rounded-[8px] text-[14px] font-bold tracking-[-0.2px] shadow-sm bg-[#1AB277] text-white hover:bg-[#149867] transition-colors"
            >
              적용하기
            </button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
