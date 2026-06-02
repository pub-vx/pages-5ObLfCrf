import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Plane, Clock, Hotel, Sparkles } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { useAppState } from '../data/store';
import { KOREAN_DEPARTURES } from '../data/flightDurations';
import { formatKrw, formatJpy, jpyToKrw } from '../data/mockData';

type TripMode = 'daytrip' | 'onenight' | 'weekend';

interface Segment {
  type: 'flight' | 'transit' | 'round' | 'meal' | 'hotel';
  time?: string;     // HH:mm
  endTime?: string;  // 라운드 종료 등
  title: string;
  sub?: string;
  icon?: 'plane-out' | 'plane-in' | 'transit' | 'golf' | 'meal' | 'hotel';
}

export interface Itinerary {
  id: string;
  mode: TripMode;
  /** 한국 출발 공항 IATA */
  departure: string;
  /** 일본 도착 공항명 (표시용) */
  arrivalAirportLabel: string;
  /** 골프장 이름 */
  courseLabel: string;
  /** 권역 */
  region: string;
  /** 항공권 가격 KRW */
  flightPriceKrw: number;
  /** 골프 가격 JPY (단일 코스 / 또는 courses 합계와 동일) */
  golfPriceJpy: number;
  /** 다중 코스 일정일 때 개별 코스 라인 (없으면 단일 코스 = courseLabel/golfPriceJpy 기준) */
  courses?: { name: string; priceJpy: number }[];
  /** 호텔 가격 KRW (1박+) */
  hotelPriceKrw?: number;
  /** 총 소요 (시간) */
  durationHours: number;
  /** 일자 라벨 (예: "5/9 (금)") */
  dateLabel: string;
  /** 시간 라인 세그먼트 */
  segments: Segment[];
  /** 추천 태그 */
  tags?: string[];
}

const MODES: { id: TripMode; emoji: string; label: string; sub: string }[] = [
  { id: 'daytrip', emoji: '🌅', label: '당일치기', sub: '12시간 내 라운드' },
  { id: 'onenight', emoji: '🌙', label: '1박 2일', sub: '느긋한 골프' },
  { id: 'weekend', emoji: '🎒', label: '주말 여행', sub: '2박 + 2라운드' },
];

/* Mock itineraries — 출발지(인천 default) 기준 */
export const ITINERARIES: Itinerary[] = [
  // ── 당일치기 ──
  {
    id: 'd1',
    mode: 'daytrip',
    departure: 'ICN',
    arrivalAirportLabel: '후쿠오카(FUK)',
    courseLabel: '코가 골프클럽',
    region: '규슈',
    flightPriceKrw: 312000,
    golfPriceJpy: 8900,
    durationHours: 12,
    dateLabel: '5/9 (금)',
    tags: ['최저가', '여유'],
    segments: [
      { type: 'flight', time: '04:30', title: 'KE701 인천 출발', icon: 'plane-out' },
      { type: 'flight', time: '06:00', title: '후쿠오카 도착', sub: '비행 약 1h 25m', icon: 'plane-in' },
      { type: 'transit', title: '입국 + 이동', sub: '약 1시간 30분', icon: 'transit' },
      { type: 'round', time: '07:30', endTime: '12:30', title: '코가 골프클럽 18홀', sub: '조식 + 카트 포함', icon: 'golf' },
      { type: 'meal', title: '클럽하우스 점심 + 공항 이동', sub: '약 1시간 30분', icon: 'meal' },
      { type: 'flight', time: '14:30', title: 'KE702 후쿠오카 출발', icon: 'plane-out' },
      { type: 'flight', time: '16:00', title: '인천 도착', icon: 'plane-in' },
    ],
  },
  {
    id: 'd2',
    mode: 'daytrip',
    departure: 'PUS',
    arrivalAirportLabel: '간사이(KIX)',
    courseLabel: '센추리 미카게 골프클럽',
    region: '효고',
    flightPriceKrw: 248000,
    golfPriceJpy: 12500,
    durationHours: 13,
    dateLabel: '5/9 (금)',
    tags: ['부산 출발'],
    segments: [
      { type: 'flight', time: '06:30', title: 'BX112 김해 출발', icon: 'plane-out' },
      { type: 'flight', time: '07:50', title: '간사이 도착', sub: '비행 약 1h 20m', icon: 'plane-in' },
      { type: 'transit', title: '입국 + 이동', sub: '약 2시간', icon: 'transit' },
      { type: 'round', time: '10:00', endTime: '15:00', title: '센추리 미카게 18홀', sub: '점심 + 카트 포함', icon: 'golf' },
      { type: 'transit', title: '공항 이동', sub: '약 2시간', icon: 'transit' },
      { type: 'flight', time: '18:50', title: 'OZ102R 간사이 출발', icon: 'plane-out' },
      { type: 'flight', time: '20:10', title: '김해 도착', icon: 'plane-in' },
    ],
  },
  {
    id: 'd3',
    mode: 'daytrip',
    departure: 'ICN',
    arrivalAirportLabel: '나리타(NRT)',
    courseLabel: '나리타 골프클럽',
    region: '치바',
    flightPriceKrw: 388000,
    golfPriceJpy: 9500,
    durationHours: 14,
    dateLabel: '5/9 (금)',
    tags: ['공항 10분'],
    segments: [
      { type: 'flight', time: '06:30', title: 'KE703 인천 출발', icon: 'plane-out' },
      { type: 'flight', time: '08:55', title: '나리타 도착', sub: '비행 약 2h 25m', icon: 'plane-in' },
      { type: 'transit', title: '입국 + 이동', sub: '약 1시간', icon: 'transit' },
      { type: 'round', time: '10:30', endTime: '15:30', title: '나리타 골프클럽 18홀', sub: '점심 포함', icon: 'golf' },
      { type: 'transit', title: '공항 이동', sub: '약 30분', icon: 'transit' },
      { type: 'flight', time: '17:30', title: 'KE712 나리타 출발', icon: 'plane-out' },
      { type: 'flight', time: '20:00', title: '인천 도착', icon: 'plane-in' },
    ],
  },
  // ── 1박 2일 ──
  {
    id: 'n1',
    mode: 'onenight',
    departure: 'ICN',
    arrivalAirportLabel: '후쿠오카(FUK)',
    courseLabel: '코가 골프클럽 + 후쿠오카 시내 호텔',
    region: '규슈',
    flightPriceKrw: 350000,
    golfPriceJpy: 8900,
    hotelPriceKrw: 120000,
    durationHours: 30,
    dateLabel: '5/9 (금) ~ 5/10 (토)',
    tags: ['추천', '시내 관광'],
    segments: [
      { type: 'flight', time: '11:30', title: 'KE789 인천 출발', icon: 'plane-out' },
      { type: 'flight', time: '13:00', title: '후쿠오카 도착', icon: 'plane-in' },
      { type: 'transit', title: '입국 + 호텔 체크인', sub: '시내 이동', icon: 'transit' },
      { type: 'meal', title: '하카타 야타이 저녁', sub: '시내 자유 시간', icon: 'meal' },
      { type: 'hotel', title: '후쿠오카 시내 호텔 1박', icon: 'hotel' },
      { type: 'round', time: '08:00', endTime: '13:00', title: '코가 골프클럽 18홀', sub: '5/10 라운드', icon: 'golf' },
      { type: 'transit', title: '공항 이동', sub: '약 30분', icon: 'transit' },
      { type: 'flight', time: '15:30', title: 'KE790 후쿠오카 출발', icon: 'plane-out' },
      { type: 'flight', time: '17:00', title: '인천 도착', icon: 'plane-in' },
    ],
  },
  {
    id: 'n2',
    mode: 'onenight',
    departure: 'ICN',
    arrivalAirportLabel: '나리타(NRT)',
    courseLabel: '카스미가세키 + 신주쿠 호텔',
    region: '사이타마',
    flightPriceKrw: 440000,
    golfPriceJpy: 28500,
    hotelPriceKrw: 180000,
    durationHours: 32,
    dateLabel: '5/9 (금) ~ 5/10 (토)',
    tags: ['프리미엄', '도쿄 관광'],
    segments: [
      { type: 'flight', time: '09:00', title: 'OZ112 인천 출발', icon: 'plane-out' },
      { type: 'flight', time: '11:30', title: '나리타 도착', icon: 'plane-in' },
      { type: 'transit', title: '입국 + 신주쿠 이동', sub: '약 1h 30m', icon: 'transit' },
      { type: 'meal', title: '신주쿠 자유 시간', sub: '저녁 식사 + 도쿄 야경', icon: 'meal' },
      { type: 'hotel', title: '신주쿠 비즈니스 호텔 1박', icon: 'hotel' },
      { type: 'round', time: '07:30', endTime: '13:00', title: '카스미가세키 컨트리클럽 18홀', sub: '5/10 캐디 포함', icon: 'golf' },
      { type: 'transit', title: '공항 이동', sub: '약 1h 20m', icon: 'transit' },
      { type: 'flight', time: '17:00', title: 'OZ113 나리타 출발', icon: 'plane-out' },
      { type: 'flight', time: '19:30', title: '인천 도착', icon: 'plane-in' },
    ],
  },
  // ── 주말 여행 ──
  {
    id: 'w1',
    mode: 'weekend',
    departure: 'ICN',
    arrivalAirportLabel: '후쿠오카(FUK)',
    courseLabel: '코가 + 사가 컨트리클럽 (2R)',
    region: '규슈',
    flightPriceKrw: 380000,
    golfPriceJpy: 18800,
    courses: [
      { name: '코가 골프클럽', priceJpy: 9400 },
      { name: '사가 컨트리클럽', priceJpy: 9400 },
    ],
    hotelPriceKrw: 280000,
    durationHours: 56,
    dateLabel: '5/9 (금) ~ 5/11 (일)',
    tags: ['2라운드', '온천 료칸'],
    segments: [
      { type: 'flight', time: '13:00', title: 'KE789 인천 출발 · 후쿠오카 14:30', icon: 'plane-out' },
      { type: 'transit', title: '료칸 체크인 + 자유 시간', icon: 'transit' },
      { type: 'hotel', title: '벳푸 온천 료칸 1박', icon: 'hotel' },
      { type: 'round', time: '08:00', endTime: '13:00', title: '코가 골프클럽 18홀 · 5/10', icon: 'golf' },
      { type: 'hotel', title: '후쿠오카 시내 호텔 1박', icon: 'hotel' },
      { type: 'round', time: '07:30', endTime: '12:30', title: '사가 컨트리클럽 18홀 · 5/11', icon: 'golf' },
      { type: 'transit', title: '공항 이동', icon: 'transit' },
      { type: 'flight', time: '17:00', title: 'KE790 후쿠오카 출발 · 인천 18:30', icon: 'plane-in' },
    ],
  },
  {
    id: 'w2',
    mode: 'weekend',
    departure: 'ICN',
    arrivalAirportLabel: '간사이(KIX)',
    courseLabel: '센추리 미카게 + 다이코쿠 골프 (2R)',
    region: '간사이',
    flightPriceKrw: 320000,
    golfPriceJpy: 24500,
    courses: [
      { name: '센추리 미카게 골프클럽', priceJpy: 12500 },
      { name: '다이코쿠 컨트리클럽', priceJpy: 12000 },
    ],
    hotelPriceKrw: 240000,
    durationHours: 54,
    dateLabel: '5/9 (금) ~ 5/11 (일)',
    tags: ['오사카 시내', '미슐랭 맛집'],
    segments: [
      { type: 'flight', time: '12:00', title: 'OZ112 인천 출발 · 간사이 13:30', icon: 'plane-out' },
      { type: 'transit', title: '난바 시내 호텔 체크인', sub: '약 1시간', icon: 'transit' },
      { type: 'meal', title: '도톤보리 자유 시간 + 저녁', icon: 'meal' },
      { type: 'hotel', title: '오사카 난바 호텔 1박', icon: 'hotel' },
      { type: 'round', time: '08:00', endTime: '13:00', title: '센추리 미카게 18홀 · 5/10', icon: 'golf' },
      { type: 'hotel', title: '오사카 시내 호텔 1박', icon: 'hotel' },
      { type: 'round', time: '07:30', endTime: '12:30', title: '다이코쿠 컨트리클럽 18홀 · 5/11', icon: 'golf' },
      { type: 'transit', title: '공항 이동', icon: 'transit' },
      { type: 'flight', time: '16:30', title: 'OZ113 간사이 출발 · 인천 18:30', icon: 'plane-in' },
    ],
  },
  {
    id: 'w3',
    mode: 'weekend',
    departure: 'ICN',
    arrivalAirportLabel: '나리타(NRT)',
    courseLabel: '카스미가세키 + 아비코 (2R)',
    region: '간토',
    flightPriceKrw: 450000,
    golfPriceJpy: 40500,
    courses: [
      { name: '카스미가세키 컨트리클럽', priceJpy: 28500 },
      { name: '아비코 골프클럽', priceJpy: 12000 },
    ],
    hotelPriceKrw: 360000,
    durationHours: 56,
    dateLabel: '5/9 (금) ~ 5/11 (일)',
    tags: ['프리미엄', '도쿄 야경'],
    segments: [
      { type: 'flight', time: '09:00', title: 'KE701 인천 출발 · 나리타 11:30', icon: 'plane-out' },
      { type: 'transit', title: '신주쿠 호텔 체크인', sub: '약 1시간 30분', icon: 'transit' },
      { type: 'meal', title: '신주쿠 자유 시간 + 도쿄 야경', icon: 'meal' },
      { type: 'hotel', title: '신주쿠 비즈니스 호텔 1박', icon: 'hotel' },
      { type: 'round', time: '07:30', endTime: '13:00', title: '카스미가세키 컨트리클럽 18홀 · 5/10', icon: 'golf' },
      { type: 'hotel', title: '도쿄 시내 호텔 1박', icon: 'hotel' },
      { type: 'round', time: '07:00', endTime: '12:30', title: '아비코 골프클럽 18홀 · 5/11', icon: 'golf' },
      { type: 'transit', title: '공항 이동', icon: 'transit' },
      { type: 'flight', time: '17:30', title: 'KE702 나리타 출발 · 인천 20:00', icon: 'plane-in' },
    ],
  },
];

function ModeSegment({ icon }: { icon?: Segment['icon'] }) {
  const map: Record<NonNullable<Segment['icon']>, JSX.Element> = {
    'plane-out': <Plane className="w-3.5 h-3.5 text-[#272833]" />,
    'plane-in': <Plane className="w-3.5 h-3.5 text-[#1AB277] rotate-90" />,
    'transit': <Clock className="w-3.5 h-3.5 text-[#9EABBA]" />,
    'golf': <span className="text-[14px]">⛳</span>,
    'meal': <span className="text-[14px]">🍱</span>,
    'hotel': <Hotel className="w-3.5 h-3.5 text-[#7C3AED]" />,
  };
  return icon ? map[icon] : <span className="w-3.5 h-3.5 inline-block" />;
}

// ─────────────────────────────────────────────────────────────
// 게임 카드 스타일 캐러셀 — 좌우 무한 스크롤 + 탭 시 상세 펼침
// ─────────────────────────────────────────────────────────────

// 권역/모드 기반 카드 히어로 이미지 — 여행 포스터 톤
const CARD_IMAGES: Record<string, string> = {
  '규슈': 'https://images.unsplash.com/photo-1583149574445-d52a52e1a8a3?w=800&q=80', // 후쿠오카 시내
  '간토': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80', // 도쿄 야경
  '간사이': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80', // 오사카
  '사이타마': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80', // 도쿄 권역
  '치바': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80', // 일본 풍경
  '효고': 'https://images.unsplash.com/photo-1559717865-a99cac1c95d8?w=800&q=80', // 고베
};
const DEFAULT_CARD_IMAGE = 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80';
// 카드 액센트 색 (그라데이션 오버레이 톤) — 모드별 순환
const CARD_ACCENT: Record<TripMode, string> = {
  daytrip: 'from-[#1AB277]/0 via-[#1AB277]/30 to-[#0E8F7D]/85',
  onenight: 'from-[#7C3AED]/0 via-[#7C3AED]/30 to-[#4F46E5]/85',
  weekend: 'from-[#F59E0B]/0 via-[#F59E0B]/30 to-[#D9651E]/85',
};

interface InfiniteCardDeckProps {
  itineraries: Itinerary[];
  onPick: (id: string) => void;
}

function InfiniteCardDeck({ itineraries, onPick }: InfiniteCardDeckProps) {
  // 좌우 무한 느낌을 위해 3세트로 복제 (시작은 중앙 세트)
  const tripled = useMemo(
    () => [...itineraries, ...itineraries, ...itineraries],
    [itineraries],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const isAdjusting = useRef(false);

  // 마운트 시 중앙 세트로 점프
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || itineraries.length === 0) return;
    const card = el.querySelector<HTMLDivElement>('[data-card]');
    if (!card) return;
    const step = card.getBoundingClientRect().width + 12; // gap-3
    el.scrollLeft = step * itineraries.length;
  }, [itineraries.length]);

  // 좌우 끝 근처에 닿으면 보이지 않게 중앙 세트로 점프 → 무한 스크롤 환영
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || isAdjusting.current || itineraries.length === 0) return;
    const card = el.querySelector<HTMLDivElement>('[data-card]');
    if (!card) return;
    const step = card.getBoundingClientRect().width + 12;
    const setWidth = step * itineraries.length;
    if (el.scrollLeft < setWidth * 0.5) {
      isAdjusting.current = true;
      el.scrollLeft += setWidth;
      requestAnimationFrame(() => { isAdjusting.current = false; });
    } else if (el.scrollLeft > setWidth * 2.5) {
      isAdjusting.current = true;
      el.scrollLeft -= setWidth;
      requestAnimationFrame(() => { isAdjusting.current = false; });
    }
  };

  return (
    <div className="py-5">
      <div className="px-5 mb-3 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-[#F59E0B]" />
        <p className="text-[13px] font-bold text-[#272833]">
          오늘의 추천 일정 카드
        </p>
        <span className="text-[12px] text-[#9EABBA] ml-1">탭하여 자세히 · 좌우로 넘기기</span>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        <div className="flex gap-3 px-5 pb-3" style={{ width: 'max-content' }}>
          {tripled.map((it, idx) => (
            <CurationCard
              key={`${it.id}-${idx}`}
              it={it}
              expanded={expanded === `${it.id}-${idx}`}
              onToggle={() => setExpanded(prev => (prev === `${it.id}-${idx}` ? null : `${it.id}-${idx}`))}
              onPick={() => onPick(it.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CurationCardProps {
  it: Itinerary;
  expanded: boolean;
  onToggle: () => void;
  onPick: () => void;
}

function CurationCard({ it, expanded, onToggle, onPick }: CurationCardProps) {
  const totalKrw = it.flightPriceKrw + jpyToKrw(it.golfPriceJpy) + (it.hotelPriceKrw ?? 0);
  const modeInfo = MODES.find(m => m.id === it.mode);
  const heroImage = CARD_IMAGES[it.region] ?? DEFAULT_CARD_IMAGE;
  const accent = CARD_ACCENT[it.mode];
  return (
    <motion.div
      data-card
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className="snap-center flex-shrink-0 cursor-pointer relative"
      style={{ width: 280 }}
    >
      {/* 카드 본체 — 풀-블리드 히어로 이미지 + 모드별 액센트 오버레이 */}
      <div className="rounded-[16px] overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.12)] bg-white relative">
        {/* 히어로 이미지 영역 */}
        <div className="relative h-[200px] overflow-hidden">
          <img
            src={heroImage}
            alt={it.courseLabel}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          {/* 가독성용 그라데이션 + 모드 액센트 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />
          <div className={`absolute inset-0 bg-gradient-to-b ${accent}`} />

          {/* 상단 좌측 — 모드 + tags */}
          <div className="absolute top-3 left-3 right-3 flex gap-1.5 flex-wrap">
            {modeInfo && (
              <span className="px-2 py-0.5 rounded-full bg-white text-[#272833] text-[10px] font-extrabold tracking-tight inline-flex items-center gap-1 shadow-sm">
                <span>{modeInfo.emoji}</span>
                <span>{modeInfo.label}</span>
              </span>
            )}
            {it.tags?.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[10px] font-bold tracking-tight"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 하단 좌측 — 타이틀 + 메타 (이미지 위에 오버레이) */}
          <div className="absolute left-4 right-4 bottom-3 text-white">
            <h3
              className="font-extrabold leading-tight tracking-[-0.4px]"
              style={{ fontSize: 17, textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
            >
              {it.courseLabel}
            </h3>
            <p className="text-[11px] font-medium opacity-95 mt-1 tracking-tight">
              {it.dateLabel} · {it.region} · {it.arrivalAirportLabel}
            </p>
          </div>
        </div>

        {/* 하단 정보 영역 — 흰 배경 */}
        <div className="px-4 py-3 flex items-end justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6A7683]">
            <Clock className="w-3.5 h-3.5" />
            약 {it.durationHours}시간
          </span>
          <div className="text-right">
            <p className="text-[10px] text-[#9EABBA] leading-none">예상 합계</p>
            <p className="text-[16px] font-extrabold tracking-[-0.3px] leading-tight text-[#1AB277]">
              {formatKrw(totalKrw)}~
            </p>
          </div>
        </div>

        {/* 펼침 안내 */}
        <div className="px-4 py-2 border-t border-[#F0F2F5] flex items-center justify-center gap-1 text-[11px] font-bold text-[#535D67]">
          <span>{expanded ? '간략히' : '자세히 보기'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* 펼친 상세 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[12px] border border-[#E6EBF0] p-4">
              {/* 시간 라인 */}
              <div className="space-y-2 mb-3">
                {it.segments.map((seg, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="flex flex-col items-center pt-0.5">
                      <div className="w-6 h-6 rounded-full bg-[#F9FAFB] border border-[#E6EBF0] flex items-center justify-center flex-shrink-0">
                        <ModeSegment icon={seg.icon} />
                      </div>
                      {i < it.segments.length - 1 && (
                        <div className="w-px h-4 bg-[#E6EBF0] my-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-baseline gap-2">
                        {seg.time && (
                          <span className="text-[12px] font-bold text-[#272833] tabular-nums flex-shrink-0">
                            {seg.time}
                            {seg.endTime && <span className="text-[#9EABBA]"> ~ {seg.endTime}</span>}
                          </span>
                        )}
                        <span className="text-[12px] text-[#272833] font-medium">{seg.title}</span>
                      </div>
                      {seg.sub && (
                        <p className="text-[11px] text-[#9EABBA] mt-0.5">{seg.sub}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 비용 분해 */}
              <div className="text-[11px] text-[#6A7683] space-y-0.5 mb-3 pb-3 border-t border-[#F0F2F5] pt-3">
                <div className="flex justify-between">
                  <span>✈️ 왕복 항공권</span>
                  <span>{formatKrw(it.flightPriceKrw)}</span>
                </div>
                <div className="flex justify-between">
                  <span>⛳ 골프 라운드</span>
                  <span>{formatJpy(it.golfPriceJpy)} ({formatKrw(jpyToKrw(it.golfPriceJpy))})</span>
                </div>
                {it.hotelPriceKrw && (
                  <div className="flex justify-between">
                    <span>🏨 숙박</span>
                    <span>{formatKrw(it.hotelPriceKrw)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={onPick}
                className="w-full py-2.5 bg-[#272833] text-white rounded-[8px] text-[13px] font-bold flex items-center justify-center gap-1 hover:bg-[#1A1B23]"
              >
                이 일정으로 진행하기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DayTripPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { departureAirport, arrivalContext } = useAppState();

  const initialMode = (searchParams.get('mode') as TripMode) || 'daytrip';
  const departure = KOREAN_DEPARTURES.find(d => d.id === departureAirport) ?? KOREAN_DEPARTURES[0];

  // 사용자가 선택한 모드의 일정을 먼저, 그 다음에 다른 모드 일정을 이어붙임
  // → 좌→우로 캐러셀을 넘기다 보면 자연스럽게 다른 모드 추천도 노출
  const filtered = useMemo(() => {
    const matched = ITINERARIES.filter(it => it.mode === initialMode);
    const others = ITINERARIES.filter(it => it.mode !== initialMode);
    return [...matched, ...others];
  }, [initialMode]);

  const matchedCount = useMemo(
    () => ITINERARIES.filter(it => it.mode === initialMode).length,
    [initialMode],
  );

  const modeLabel = MODES.find(m => m.id === initialMode)?.label ?? '';

  const totalKrwOf = (it: Itinerary) => it.flightPriceKrw + jpyToKrw(it.golfPriceJpy) + (it.hotelPriceKrw ?? 0);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 헤더 */}
      <AppHeader title="즉흥 골프 큐레이션" showHome />

      {/* 컨텍스트 안내 — 항공편 정보가 있으면 우선 표시 */}
      <div className="px-4 py-3 bg-white border-b border-[#F0F2F5]">
        {arrivalContext?.flightCode ? (
          <div className="flex items-center gap-1.5 mb-1">
            <Plane className="w-3.5 h-3.5 text-[#149867] flex-shrink-0" />
            <p className="text-[12px] font-bold text-[#149867]">
              {arrivalContext.flightCode} · {arrivalContext.airportName.replace(/ ?공항$/, '')} {arrivalContext.arrivalTime} 도착 기준
            </p>
          </div>
        ) : (
          <p className="text-[12px] text-[#6A7683] mb-0.5">
            <span className="font-bold text-[#272833]">{departure.short}</span>
            <span> 출발 기준</span>
          </p>
        )}
        <p className="text-[11px] text-[#9EABBA]">
          <span className="text-[#272833] font-medium">{modeLabel}</span> 일정 {matchedCount}건 추천 · 캐러셀을 넘기면 다른 일정도 볼 수 있어요
        </p>
      </div>

      {/* 카드 목록 — 가로 캐러셀 (스냅 스크롤) */}
      {filtered.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-[14px] text-[#9EABBA]">조건에 맞는 추천이 아직 없어요</p>
        </div>
      ) : (
        <InfiniteCardDeck itineraries={filtered} onPick={(id) => navigate(`/cart/${id}`)} />
      )}

      {/* 하단 안내 */}
      <div className="px-4 py-6 text-center">
        <p className="text-[11px] text-[#9EABBA] leading-relaxed">
          항공권은 외부 예약 시스템과 연동되며,<br />
          골프 라운드는 실시간 예약이 가능합니다
        </p>
      </div>
    </div>
  );
}
