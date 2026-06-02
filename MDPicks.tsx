import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Star } from 'lucide-react';
import { mockCourses, formatJpy, formatKrw, jpyToKrw } from '../data/mockData';
import { buildOverseasCourses } from '../data/overseasCourses';
import { COUNTRIES } from '../lib/countries';
import { getParentRegion } from '../lib/regions';
import { SectionHeader } from './SectionHeader';
import { CountryUnderlineTabs } from './CountryUnderlineTabs';

/** MD 추천 사유 — 시드 데이터의 모든 '추천' 태그 코스에 매핑. 누락 시 fallback 사유 사용 */
const MD_REASONS: Record<string, string> = {
  koga: '가성비 최강! 나리타 40분',
  century: '명문 코스 · 접근성 최고',
  kasumigaseki: '올림픽 개최지 · 프리미엄',
  abiko: '도심 접근성 · 초보자 추천',
  taiheiyo: '바다뷰 명문 · 프로 대회 코스',
  narita: '공항 10분 · 도착 당일 라운드',
  sakura: '벚꽃 코스 · 봄 시즌 인기',
  seve: '세베 바예스테로스 설계',
  fuji: '후지산 뷰 · 사계절 인기',
  sunrise: '규슈 대표 · 온천 료칸 연계',
  'osaka-tower': '오사카 시내 직결 · 야경 명문',
  'tokyo-bay': '도쿄 베이뷰 · 하네다 30분',
  'yokohama-royal': '요코하마 명문 · 챔피언십 코스',
  'kobe-bay': '고베 베이뷰 · 시내 직결',
  'niseko-royal': '리조트 명문 · 자작나무 코스',
};

/**
 * MD_REASONS 에 개별 사유가 없는 코스(주로 해외 코스)용 추천 사유 배리에이션 풀.
 * 유지보수: 문구를 추가/수정하기만 하면 되고, 코스 id 해시로 안정 매핑되어
 *           같은 코스는 항상 같은 사유가 노출된다(렌더마다 바뀌지 않음).
 */
const REASON_POOL: string[] = [
  '현지에서 손꼽히는 명문 코스',
  '한국인 골퍼 선호 1순위',
  '리조트 연계 · 휴양 골프',
  '시내 접근성 좋은 코스',
  '가성비 좋은 라운드',
  '바다뷰 · 시그니처 홀 보유',
  '초보자도 편안한 코스',
  '챔피언십 개최 코스',
  '공항 근처 · 당일 라운드',
  '온천·미식 연계 추천',
];

/** 코스 id → 추천 사유 (개별 사유 우선, 없으면 풀에서 결정론적 선택) */
function reasonFor(id: string): string {
  if (MD_REASONS[id]) return MD_REASONS[id];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return REASON_POOL[hash % REASON_POOL.length];
}

/**
 * 해외 골프 MD 추천 골프장 — 광고(추천) 노출 영역.
 * 타이틀 아래 나라 칩(일본/베트남/하와이/대만/말레이시아)으로 나라를 전환하면
 * 해당 나라의 추천 코스 가로 스크롤 리스트가 노출된다.
 */
export function MDPicks() {
  const navigate = useNavigate();
  const [nation, setNation] = useState('jp');

  const recommended = useMemo(() => {
    if (nation === 'jp') {
      return mockCourses.filter(c => c.tags?.includes('추천')).slice(0, 10);
    }
    return buildOverseasCourses().filter(c => (c.country ?? '') === nation).slice(0, 10);
  }, [nation]);

  return (
    <div className="py-5 bg-white">
      {/* 타이틀 (모두보기는 아래 나라 탭 행 우측에 배치) */}
      <SectionHeader
        title="해외 골프 MD 추천 골프장"
        badge={
          <span className="text-[10px] font-medium text-ink-ghost tracking-[-0.1px] self-center">
            AD
          </span>
        }
      />

      {/* 나라 탭(언더라인) — 좌측 탭들, 우측 모두보기. 텍스트 baseline 으로 정렬 */}
      <div className="flex items-baseline justify-between gap-3 px-5 mb-4">
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <CountryUnderlineTabs
            countries={COUNTRIES.map(c => ({ code: c.code, name: c.name }))}
            activeCode={nation}
            onSelect={setNation}
          />
        </div>
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="flex-shrink-0 pb-1 text-[14px] font-medium text-ink-faint tracking-[-0.2px]"
        >
          모두보기
        </button>
      </div>

      {/* 카드 리스트 */}
      {recommended.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide">
          {recommended.map(course => {
            // 1차 · 2차 권역 도출
            //  - 일본 코스: course.region = 2차(현). getParentRegion 으로 1차(권역) 조회.
            //  - 해외 코스: course.region = 1차(권역), course.subRegion = 2차(도시).
            const cc = course.country ?? 'jp';
            const first = cc === 'jp' ? (getParentRegion(course.region) ?? course.region) : course.region;
            const second = cc === 'jp' ? course.region : (course.subRegion ?? '');
            const regionLine = second && second !== first ? `${first} ${second}` : first;
            return (
            <button
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="flex-shrink-0 w-[200px] text-left"
            >
              <div className="rounded-[8px] overflow-hidden mb-2">
                <img src={course.image} alt={course.name} className="w-full h-[120px] object-cover" />
              </div>
              {/* 그룹1: 골프장명 + 권역·평점 (tight — mt-0.5 내부 간격) */}
              <h4 className="text-[15px] font-extrabold text-ink tracking-[-0.3px] truncate">{course.name}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[13px] font-medium text-ink-mid tracking-[-0.2px] truncate">{regionLine}</span>
                <span className="text-ink-ghost text-[13px] flex-shrink-0">|</span>
                <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400 flex-shrink-0" />
                <span className="text-[13px] font-medium text-ink-mid tracking-[-0.2px]">{course.rating}</span>
              </div>
              {/* 그룹2: 추천 사유 — 그룹1 과 살짝 간격(mt-1) */}
              <p className="text-[13px] font-medium text-brand tracking-[-0.2px] mt-1 truncate">
                {reasonFor(course.id)}
              </p>
              {/* 그룹3: 가격(엔화+한화) — 그룹2 와 살짝 간격(mt-1), 내부는 tight */}
              <p className="text-[15px] font-bold text-ink tracking-[-0.2px] mt-1">
                {formatJpy(course.lowestPrice)}~
              </p>
              <p className="text-[12px] font-medium text-ink-light tracking-[-0.2px]">
                약 {formatKrw(jpyToKrw(course.lowestPrice))}
              </p>
            </button>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-[13px] font-medium text-[#9EABBA] tracking-[-0.2px]">
          준비 중인 골프장이에요
        </p>
      )}
    </div>
  );
}
