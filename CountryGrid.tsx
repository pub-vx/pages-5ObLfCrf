import { useNavigate } from 'react-router';
import { COUNTRIES } from '../lib/countries';
import { useAppState } from '../data/store';
import { SectionHeader } from './SectionHeader';

/**
 * 나라 선택 그리드 — 5개국 원형 진입점 (대표 이미지 + 이름).
 * 탭 시 해당 나라를 selectedCountries에 단일 설정하고 /search 페이지로 진입.
 *
 * 디자인:
 *  - 섹션 타이틀 text-[18px] font-bold tracking-[-0.4px] (이전 14px에서 확대)
 *  - 원형 w-24 h-24 (96px) — 나라 대표 이미지 (이전 80px에서 확대)
 *  - 라벨 text-[14px] font-semibold tracking-[-0.2px]
 *  - 국기 이모지 뱃지는 제거 — 대표 이미지로 식별
 */

/** 나라별 대표 더미 이미지 (Unsplash) — 풍경/랜드마크 중심으로 한눈에 식별 가능한 컷 */
const COUNTRY_IMAGES: Record<string, string> = {
  jp: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400&q=80', // 일본 - 후지산
  vn: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', // 베트남 - 다낭 해안
  hi: 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=400&q=80', // 하와이 - 와이키키
  tw: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&q=80', // 대만 - 타이베이 야경
  my: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80', // 말레이시아 - 페트로나스 타워
};

export function CountryGrid() {
  const navigate = useNavigate();
  const { setSelectedCountries, setSelectedRegions, setSelectedSubRegions } = useAppState();

  const handleCountryClick = (code: string) => {
    setSelectedCountries([code]);
    setSelectedRegions([]);
    setSelectedSubRegions([]);
    navigate('/search', { state: { fromCountry: true } });
  };

  return (
    <div className="py-5 bg-white">
      <SectionHeader title="나라 선택" />
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCountryClick(c.code)}
              className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[80px]"
            >
              <img
                src={COUNTRY_IMAGES[c.code]}
                alt={c.name}
                className="w-20 h-20 rounded-full object-cover"
                draggable={false}
              />
              <p className="text-[14px] font-semibold text-[#272833] tracking-[-0.2px]">{c.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
