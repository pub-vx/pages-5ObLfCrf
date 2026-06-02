import { useNavigate } from 'react-router';
import { CURATIONS } from '../lib/curations';
import { useAppState } from '../data/store';
import { DEFAULT_PRICE_RANGE } from './FilterSheet';
import { SectionHeader } from './SectionHeader';

/**
 * "이런 골프장은 어때요?" 큐레이션 카드 — v2 HomePage 디자인 그대로.
 * 파스텔 그라데이션 배경 + 이모지 + 타이틀 + 부제 카드 가로 스크롤.
 * 카드 탭 시 큐레이션 필터 적용 후 /search 이동.
 */
export function CurationGradientCards() {
  const navigate = useNavigate();
  const { quickCuration, setQuickCuration, setFilterState, setSortBy } = useAppState();

  const handleClick = (id: string) => {
    const cur = CURATIONS.find(c => c.id === id);
    if (!cur) return;
    setFilterState({
      timeSlots: [],
      playStyles: cur.playStyles ?? [],
      inclusions: cur.inclusions ?? [],
      priceRange: DEFAULT_PRICE_RANGE,
    });
    const prevCur = quickCuration ? CURATIONS.find(c => c.id === quickCuration) : null;
    if (cur.sortBy) setSortBy(cur.sortBy);
    else if (prevCur?.sortBy) setSortBy('recommended');
    setQuickCuration(id);
    navigate('/search', { state: { fromCuration: true } });
  };

  return (
    <div className="py-5 bg-white">
      <SectionHeader title="이런 골프장은 어때요?" />
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-hide">
          {CURATIONS.map(cur => (
            <button
              key={cur.id}
              onClick={() => handleClick(cur.id)}
              className={`flex-shrink-0 w-[168px] rounded-[10px] bg-gradient-to-br ${cur.gradient} p-3 text-left transition-all hover:scale-[1.02]`}
            >
              <span className="block mb-1.5" style={{ fontSize: 24 }}>{cur.icon}</span>
              <p className={`${cur.textColor} text-[14px] font-bold tracking-[-0.2px] leading-tight mb-0.5 whitespace-nowrap`}>
                {cur.title}
              </p>
              <p className="text-[12px] font-medium text-[#535D67] tracking-[-0.3px] whitespace-nowrap">
                {cur.sub}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
