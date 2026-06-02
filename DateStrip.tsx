import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppState } from '../data/store';
import { DateSheet } from './DateSheet';
import { generateDays } from '../lib/dateRange';

/**
 * 가로 스크롤 날짜 스트립 + 월 라벨 → 바텀시트 캘린더 진입.
 * - 검색/지도 페이지에서 동일하게 사용
 * - 선택된 날짜는 마운트 시 가운데로 자동 스크롤
 * - 월 버튼 탭 → DateSheet (3개월 캘린더 바텀시트) 노출
 */
export function DateStrip() {
  const { selectedDate, setSelectedDate } = useAppState();
  const [showSheet, setShowSheet] = useState(false);

  const dateStripRef = useRef<HTMLDivElement>(null);
  const selectedDateBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // 라우트 전환 직후엔 컨테이너 width 가 아직 settle 되지 않을 수 있음 →
    // 다음 paint frame 까지 기다린 후 오프셋 계산해야 active 날짜가 화면 밖에 남지 않는다.
    const id = requestAnimationFrame(() => {
      const btn = selectedDateBtnRef.current;
      const container = dateStripRef.current;
      if (!btn || !container) return;
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const offset = btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);
      container.scrollTo({ left: container.scrollLeft + offset, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedDate]);

  const allDays = useMemo(() => generateDays(28), []);

  return (
    <>
      {/* 날짜 스트립 (가로 스크롤) */}
      <div className="flex items-center gap-2 px-4 py-2 relative">
        <button
          onClick={() => setShowSheet(true)}
          className="flex items-center gap-[3px] text-[14px] font-medium text-[#272833] flex-shrink-0"
        >
          <span>{selectedDate.getMonth() + 1}월</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="w-px h-[38px] bg-[#E5E7EB] flex-shrink-0" />

        <div ref={dateStripRef} className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex">
            {allDays.map(({ date, day, month, dayName, isSunday, isSaturday }, idx) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const showMonth = idx > 0 && allDays[idx - 1].month !== month;
              return (
                <div key={date.toISOString()} className="flex items-center flex-shrink-0">
                  {showMonth && (
                    <span className="text-[10px] text-[#9EABBA] font-medium px-1 mr-0.5">{month}월</span>
                  )}
                  <button
                    ref={isSelected ? selectedDateBtnRef : undefined}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center py-[5px] px-[14px] rounded-[20px] transition-colors ${
                      isSelected ? 'bg-[#272833] text-white' : ''
                    }`}
                  >
                    <span className={`text-[12px] font-medium tracking-[-0.43px] ${
                      isSelected ? 'text-white'
                      : isSunday ? 'text-[#EF3434]'
                      : isSaturday ? 'text-[#2697FF]'
                      : 'text-[#272833]'
                    }`}>{dayName}</span>
                    <span className={`text-[14px] tracking-[-1.4px] ${
                      isSelected ? 'text-white'
                      : isSunday ? 'text-[#EF3434]'
                      : isSaturday ? 'text-[#2697FF]'
                      : 'text-[#272833]'
                    }`}>{day}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute right-0 top-px bottom-px w-10 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none" />
      </div>

      {/* 월 라벨 탭 시 노출되는 바텀시트 캘린더 */}
      <DateSheet
        open={showSheet}
        onOpenChange={setShowSheet}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />
    </>
  );
}
