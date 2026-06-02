import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { DateSheet } from '../DateSheet';
import { generateDays } from '../../lib/dateRange';

interface DetailDateStripProps {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
}

export function DetailDateStrip({ selectedDate, onDateChange }: DetailDateStripProps) {
  const [showDateSheet, setShowDateSheet] = useState(false);
  const allDays = useMemo(() => generateDays(35), []);

  // 선택된 날짜로 자동 가운데 스크롤 (디폴트 +21일이 화면 밖이라 활성 표시가 안 보이는 문제 방지)
  const stripRef = useRef<HTMLDivElement>(null);
  const selectedBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const btn = selectedBtnRef.current;
    const container = stripRef.current;
    if (!btn || !container) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const offset = btnRect.left - containerRect.left - (containerRect.width / 2) + (btnRect.width / 2);
    container.scrollTo({ left: container.scrollLeft + offset, behavior: 'auto' });
  }, [selectedDate]);

  return (
    <>
      {/* sticky top-[90px] — AppHeader(h-12=48) + CourseTabBar(h-[42px]) = 90px 누적 위치에 고정.
          스크롤 중에도 날짜 컨텍스트를 항상 노출하기 위함. bg-white 로 본문과 시각 분리. */}
      <div className="sticky top-[90px] z-30 bg-white relative flex items-center gap-2 px-4 py-2 border-b border-[#F0F2F5]">
        <button
          onClick={() => setShowDateSheet(true)}
          className="flex items-center gap-[3px] text-[14px] font-medium text-[#272833] flex-shrink-0"
        >
          <span>{selectedDate.getMonth() + 1}월</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="w-px h-[38px] bg-[#E5E7EB] flex-shrink-0" />

        <div ref={stripRef} className="flex-1 overflow-x-auto scrollbar-hide">
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
                    ref={isSelected ? selectedBtnRef : undefined}
                    onClick={() => onDateChange(date)}
                    className={`flex flex-col items-center justify-center py-[5px] px-[14px] rounded-[20px] transition-colors ${
                      isSelected ? 'bg-[#272833] text-white' : ''
                    }`}
                  >
                    <span className={`text-[12px] font-medium tracking-[-0.43px] ${
                      isSelected ? 'text-white'
                      : isSunday ? 'text-[#EF3434]'
                      : isSaturday ? 'text-[#2697FF]'
                      : 'text-[#272833]'
                    }`}>
                      {dayName}
                    </span>
                    <span className={`text-[14px] tracking-[-1.4px] ${
                      isSelected ? 'text-white'
                      : isSunday ? 'text-[#EF3434]'
                      : isSaturday ? 'text-[#2697FF]'
                      : 'text-[#272833]'
                    }`}>
                      {day}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute right-0 top-px bottom-px w-10 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none" />
      </div>

      <DateSheet
        open={showDateSheet}
        onOpenChange={setShowDateSheet}
        selectedDate={selectedDate}
        onSelect={onDateChange}
      />
    </>
  );
}
