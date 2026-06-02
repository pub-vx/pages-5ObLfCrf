import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { ExploreTabsPage } from './ExploreTabsPage';
// SearchInputCard: 패키지 탭에서는 임시 비노출 — 추후 실시간 탭과 통합 검색 도입 시 재활성
// import { SearchInputCard } from './SearchInputCard';
import { PACKAGE_SLOTS, type AdSlot } from '../data/packages';
import { COUNTRIES } from '../lib/countries';
import { CountryUnderlineTabs } from './CountryUnderlineTabs';

/**
 * v3 패키지 탭 화면.
 *
 * 구성 (위→아래):
 *  1) SearchInputCard + 검색 CTA (실시간 탭과 동일 형태)
 *  2) 광고 영역 안내
 *  3) 나라별 섹션 — 헤더(국기·나라명·대표 상품 N개) + 패키지 카드 가로/세로 리스트
 *  4) 카드 클릭 시 외부 제휴사 페이지로 outlink (새 창)
 */

function openExternalPartner(slot: AdSlot) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(slot.advertiser + ' ' + slot.title)}`;
  toast.info(`${slot.advertiser} 외부 페이지로 이동해요`, {
    description: '제휴사 사이트에서 상세 일정과 예약을 진행할 수 있어요',
    duration: 2500,
    position: 'top-center',
  });
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * 패키지 카드 — 제휴사 / 상품명 / 해시태그 / 상품 속성 / 가격 4단 구조.
 * 이미지는 우상단 사각 썸네일로 컴팩트. 카드 자체가 외부 제휴사 이동 트리거.
 */
function PackageCard({ slot }: { slot: AdSlot }) {
  return (
    <button
      type="button"
      onClick={() => openExternalPartner(slot)}
      className="w-full text-left bg-white rounded-[10px] border border-[#E6EBF0] overflow-hidden shadow-sm hover:border-[#1AB277] transition-colors"
    >
      <div className="flex gap-3 p-3">
        {/* 좌측 썸네일 */}
        <div
          className="relative flex-shrink-0 w-24 h-24 rounded-[8px] bg-cover bg-center"
          style={{ backgroundImage: `url(${slot.image})` }}
        >
          {slot.badge && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#D6385A] text-white rounded-[4px] text-[9px] font-bold tracking-[-0.1px]">
              {slot.badge}
            </div>
          )}
        </div>

        {/* 우측 정보 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 1) 제휴사명 + AD 뱃지 */}
          <div className="inline-flex items-center gap-1 mb-1">
            <span className="text-[11px] leading-none">{slot.partnerLogo}</span>
            <span className="text-[11px] font-bold text-[#535D67] tracking-[-0.2px]">{slot.advertiser}</span>
            <span className="ml-0.5 px-1 bg-[#F0F2F5] text-[#535D67] rounded-[2px] text-[9px] font-bold tracking-[-0.1px]">AD</span>
            {slot.tagline && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#FFF4E5] text-[#D6385A] rounded-[3px] text-[9px] font-bold tracking-[-0.1px]">
                🔥 {slot.tagline}
              </span>
            )}
          </div>

          {/* 2) 상품명 — 해시태그가 인라인으로 포함됨 */}
          <p className="text-[14px] font-bold text-[#272833] tracking-[-0.3px] leading-snug inline-flex items-start gap-1 break-keep">
            <span className="flex-1">{slot.title}</span>
            <ExternalLink className="w-3 h-3 mt-0.5 text-[#9EABBA] flex-shrink-0" />
          </p>
        </div>
      </div>

      {/* 3) 상품 속성 (전체 폭) */}
      {slot.attributes && slot.attributes.length > 0 && (
        <p className="px-3 pb-2 text-[11px] font-medium text-[#6A7683] tracking-[-0.2px]">
          {slot.attributes.join(' · ')}
        </p>
      )}

      {/* 4) 금액 */}
      <div className="px-3 pb-3 pt-1 border-t border-[#F0F2F5] flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] text-[#9EABBA] line-through tracking-[-0.2px]">{slot.originalPrice}</span>
          <span className="text-[13px] font-bold text-[#D6385A] tracking-[-0.2px]">{slot.discount}</span>
        </div>
        <span className="text-[18px] font-bold text-[#272833] tracking-[-0.4px]">{slot.price}</span>
      </div>
    </button>
  );
}

/** 패키지 탭 상단 롤링 프로모션 배너 데이터 */
interface PromoBanner {
  id: string;
  emoji: string;
  title: string;
  sub: string;
  /** 배경 그라데이션 (tailwind 클래스 또는 inline) */
  bg: string;
  fg: string;
}
/**
 * 배너 컬러 — 라이트 파스텔 배경 + 다크 브랜드 텍스트.
 * 강한 그라데이션은 시각 압박이 커서, 같은 카테고리 컬러를 유지하되 명도를 뒤집어 톤다운.
 */
const PROMO_BANNERS: PromoBanner[] = [
  { id: 'pb1', emoji: '🎌', title: '일본 골프 첫 예약 5만원 할인', sub: '신규 회원 한정 · 6월 한정 프로모션', bg: 'linear-gradient(135deg, #F2FDF7 0%, #E6F8EE 100%)', fg: '#149867' },
  { id: 'pb2', emoji: '💰', title: '패키지 캐시백 최대 10%', sub: '제휴 여행사 패키지 결제 시 적립', bg: 'linear-gradient(135deg, #EEF4FE 0%, #DBE7FC 100%)', fg: '#1B4F9E' },
  { id: 'pb3', emoji: '✈️', title: '항공+골프 묶음 특가', sub: '규슈·간사이 인기 코스 한정 특가', bg: 'linear-gradient(135deg, #FFF8E6 0%, #FFEDC2 100%)', fg: '#9F5A00' },
];

/**
 * 패키지 탭 상단 롤링 배너.
 * - 가로 scroll-snap 캐러셀 + 자동 롤링(4초) + 수동 스와이프
 * - 자동 롤링은 사용자가 스와이프하면 일시 정지(접근성/조작 우선)
 * - 하단 인디케이터 도트로 현재 위치 표시
 *
 * 멈칫 방지 — 자동 롤링이 trigger 한 smooth scroll 도중 onScroll 이벤트가 폭발적으로 발생.
 * 그 안에서 Math.round(scrollLeft / clientWidth) 가 중간값을 잡아 idx 를 되돌려놓으면
 * 진행 중인 애니메이션이 역방향으로 끊겨 "멈칫" 보임.
 * 해결: programmaticRef 로 프로그램 스크롤 구간을 마킹하고, 그 동안 onScroll 의 idx 갱신을 스킵.
 * 추가로 사용자 스크롤 idx 갱신도 debounce 해서 settled position 에서 1회만 처리.
 */
function PackageRollingBanner() {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  // 프로그래밍 scrollTo 진행 중 플래그 — 그동안 onScroll 의 idx 동기화를 스킵
  const programmaticRef = useRef(false);
  const programmaticTimerRef = useRef<number | null>(null);

  // 자동 롤링
  useEffect(() => {
    const t = setInterval(() => {
      if (pausedRef.current) return;
      setIdx(i => (i + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // idx 변경 → 트랙 스크롤. smooth 애니메이션 추정 지속시간(~600ms) 동안 programmatic 플래그 유지.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    programmaticRef.current = true;
    if (programmaticTimerRef.current) window.clearTimeout(programmaticTimerRef.current);
    track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
    // smooth scroll 완료 추정 시간 — 브라우저별 편차 흡수 위해 넉넉히 700ms
    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticRef.current = false;
    }, 700);
  }, [idx]);

  // 수동 스크롤 시 현재 idx 동기화 + 자동 롤링 잠시 정지.
  // - 프로그램 스크롤 중에는 idx 동기화 스킵 (멈칫 원인 차단)
  // - idx 계산은 debounce: 스크롤이 잦아진 뒤에만 1회 (intermediate scrollLeft 무시)
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    // 자동 롤링은 일시 정지 — 프로그램/수동 무관 (사용자가 손대면 잠깐 멈춤)
    if (!programmaticRef.current) {
      pausedRef.current = true;
      window.clearTimeout((onScroll as any)._pt);
      (onScroll as any)._pt = window.setTimeout(() => { pausedRef.current = false; }, 2500);
    }
    // idx 동기화는 settled position 에서만 — programmatic 중에는 아예 스킵
    if (programmaticRef.current) return;
    window.clearTimeout((onScroll as any)._dt);
    (onScroll as any)._dt = window.setTimeout(() => {
      const t = trackRef.current;
      if (!t) return;
      const next = Math.round(t.scrollLeft / t.clientWidth);
      if (next !== idx) setIdx(next);
    }, 120);
  };

  return (
    <div className="relative bg-white">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {PROMO_BANNERS.map(b => (
          <div key={b.id} className="snap-start shrink-0 w-full">
            <div
              className="relative flex flex-col justify-center h-[140px] px-5"
              style={{ background: b.bg, color: b.fg }}
            >
              <span className="absolute top-3 right-4 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/[0.06] backdrop-blur-sm">AD</span>
              <span className="text-[26px] leading-none mb-1.5">{b.emoji}</span>
              <p className="text-[17px] font-bold tracking-[-0.3px] leading-snug break-keep">{b.title}</p>
              <p className="text-[12px] opacity-90 tracking-[-0.2px] mt-1 break-keep">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
      {/* 인디케이터 — 배너 하단 오버레이 */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
        {PROMO_BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`배너 ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-[#272833]/70' : 'w-1.5 bg-[#272833]/25'}`}
          />
        ))}
      </div>
    </div>
  );
}

/** id 규칙 — 국가 탭 클릭 시 scrollIntoView 타겟 */
const pkgSectionId = (code: string) => `pkg-section-${code}`;

/** 나라별 패키지 묶음 헤더 + 카드 리스트 */
function CountrySection({ countryCode }: { countryCode: string }) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return null;
  const slots = PACKAGE_SLOTS.filter(s => s.country === countryCode);
  if (slots.length === 0) return null;
  return (
    // scroll-mt 로 sticky 헤더(90px) + 국가 탭바(44px) 만큼 오프셋 — anchor 점프 시 상단 가림 방지
    <section id={pkgSectionId(countryCode)} className="px-4 pt-5 pb-2 bg-white scroll-mt-[134px]">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] flex items-center gap-1.5">
          <span>{country.flag}</span>
          <span>{country.name}</span>
          <span className="text-[12px] font-medium text-[#9EABBA] tracking-[-0.2px] ml-0.5">패키지 {slots.length}</span>
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        {slots.map(s => <PackageCard key={s.id} slot={s} />)}
      </div>
    </section>
  );
}

/**
 * 국가 탭 스트립 — sticky 로 상단 [실시간/패키지] 탭 바로 아래에 고정.
 * 탭 탭 시 해당 국가 섹션으로 scrollIntoView (smooth).
 * 패키지가 0건인 국가는 탭에서 숨김.
 *
 * 활성 chip 추적: IntersectionObserver 로 현재 viewport 의 상단 띠(sticky 헤더 아래) 에
 * 가장 가까운 섹션을 활성으로 표시. 클릭 시 즉시 activeCountry 갱신 + smooth scroll.
 */
function CountryTabStrip() {
  const visibleCountries = COUNTRIES.filter(c => PACKAGE_SLOTS.some(s => s.country === c.code));
  const [activeCountry, setActiveCountry] = useState<string>(visibleCountries[0]?.code ?? 'jp');
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // 클릭으로 막 점프했을 때 IntersectionObserver 발화가 흔들리는 걸 잠깐 무시
  const lockUntilRef = useRef<number>(0);

  useEffect(() => {
    const sections = visibleCountries
      .map(c => document.getElementById(pkgSectionId(c.code)))
      .filter((el): el is HTMLElement => !!el);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        if (Date.now() < lockUntilRef.current) return;
        // viewport (sticky 헤더 134px 아래 ~ 하단 50%) 안에 있는 섹션 중 가장 큰 비중을 차지하는 것 활성
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const code = visible[0].target.id.replace('pkg-section-', '');
          setActiveCountry(code);
        }
      },
      { rootMargin: '-134px 0px -50% 0px', threshold: [0, 0.1, 0.25, 0.5, 1] },
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [visibleCountries.length]);

  // 활성 chip 이 strip 밖으로 나가지 않도록 자동 정렬
  useEffect(() => {
    const btn = chipRefs.current[activeCountry];
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCountry]);

  const handleClick = (code: string) => {
    setActiveCountry(code); // 클릭 즉시 활성 chip 갱신 (관찰자 지연 회피)
    lockUntilRef.current = Date.now() + 600; // smooth scroll 도착 전 IO 발화 무시
    const el = document.getElementById(pkgSectionId(code));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // 홈 (MDPicks / ArrivalAirportFinder) 의 underline 탭과 동일 규격 — variant='sticky' 로
    // 인디케이터가 strip 보더와 동일 베이스라인에 정렬되도록 함.
    <div className="sticky top-[90px] z-40 bg-white border-b border-[#F0F2F5]">
      {/* pb-px: overflow-x-auto 는 CSS 스펙상 overflow-y 도 auto(클리핑)로 강제되어
          CountryUnderlineTabs 의 bottom-[-1px] 인디케이터가 1px 잘려 옅게 보이는 문제 방지.
          padding-box 가 1px 확장되어 인디케이터 전체(2px)가 가시 영역 안에 들어옴. */}
      <div className="overflow-x-auto scrollbar-hide px-5 pb-px">
        <CountryUnderlineTabs
          countries={visibleCountries.map(c => ({ code: c.code, name: c.name }))}
          activeCode={activeCountry}
          onSelect={handleClick}
          variant="sticky"
          chipRefs={chipRefs}
        />
      </div>
    </div>
  );
}

export function PackagesSearchPage() {
  return (
    <ExploreTabsPage>
      {/* 어디로 / 언제 / 인원수 / 검색 — 패키지 탭에서는 임시 비노출 */}
      {/* <SearchInputCard showSearchButton /> */}

      {/* 상단 롤링 프로모션 배너 — 탭 바로 아래 */}
      <PackageRollingBanner />

      {/* 국가 탭 스트립 — 클릭 시 해당 국가 섹션으로 스크롤 이동 */}
      <CountryTabStrip />

      {/* 광고 영역 안내 */}
      <div className="bg-white px-4 py-3 mt-1">
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#F2FDF7] rounded-[4px] mb-1.5">
          <Megaphone className="w-3 h-3 text-[#149867]" />
          <span className="text-[10px] font-bold text-[#149867] tracking-[-0.1px]">제휴 광고 영역</span>
        </div>
        <p className="text-[13px] text-[#393F48] tracking-[-0.2px] leading-snug">
          여행사·항공사·골프장이 일정 기간 등록한 <span className="font-bold">기간 한정 패키지</span>예요.
          카드 탭 시 제휴사 사이트로 이동합니다.
        </p>
      </div>

      {/* 나라별 섹션 */}
      {COUNTRIES.map(c => <CountrySection key={c.code} countryCode={c.code} />)}

      <div className="h-6 bg-white" />
    </ExploreTabsPage>
  );
}
