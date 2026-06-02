import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { Plane, Hotel, ExternalLink, ChevronRight, Info } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { ITINERARIES } from './DayTripPage';
import { formatJpy, formatKrw, jpyToKrw, mockCourses } from '../data/mockData';
import { LegalFooter } from './LegalFooter';

/**
 * 즉흥 골프 큐레이션 → "이 일정으로 진행하기" 진입 시의 장바구니형 결제 페이지.
 * 항공·호텔은 외부 결제(외부 링크 안내), 골프장만 우리 결제(/checkout)로 라우팅.
 */
export function CartCheckoutPage() {
  const { itineraryId } = useParams();
  const navigate = useNavigate();

  const it = ITINERARIES.find(i => i.id === itineraryId);
  if (!it) {
    return (
      <div className="p-8 text-center text-[#9EABBA]">
        <p>일정 정보를 찾을 수 없습니다</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#1AB277] text-sm">돌아가기</button>
      </div>
    );
  }

  // 골프 라인 — courses[] 있으면 다중, 아니면 단일 (label/price)
  const golfLines = (it.courses && it.courses.length > 0)
    ? it.courses.map(c => ({ name: c.name, priceJpy: c.priceJpy }))
    : [{ name: it.courseLabel, priceJpy: it.golfPriceJpy }];

  // 각 라인을 실제 코스/플랜에 매칭 (mock — 이름 부분 일치, 못 찾으면 fallback)
  const matchedLines = golfLines.map(line => {
    const c = mockCourses.find(mc => line.name.includes(mc.name) || mc.name.includes(line.name.split(/[+/]/)[0].trim())) ?? mockCourses[0];
    return { ...line, course: c, plan: c?.plans[0] };
  });

  const golfTotalJpy = golfLines.reduce((sum, l) => sum + l.priceJpy, 0);
  const golfKrw = jpyToKrw(golfTotalJpy);
  const totalKrw = it.flightPriceKrw + golfKrw + (it.hotelPriceKrw ?? 0);

  const handleExternalToast = (label: string) => {
    toast.info(`${label} 외부 페이지로 이동해요`, {
      description: '제휴사 사이트에서 상세 일정과 결제를 진행할 수 있어요',
      duration: 2500,
      position: 'top-center',
    });
  };

  const handleGolfProceed = (idx?: number) => {
    const target = idx !== undefined ? matchedLines[idx] : matchedLines[0];
    if (!target?.course || !target.plan) {
      toast.error('골프장 정보를 불러올 수 없습니다');
      return;
    }
    navigate(`/checkout/${target.course.id}/${target.plan.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-8">
      {/* 헤더 */}
      <AppHeader title="묶음 일정 확인" showHome />

      {/* 일정 헤더 */}
      <div className="bg-white px-5 py-5">
        <p
          className="text-[#9EABBA] mb-1"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px' }}
        >
          즉흥 골프 큐레이션
        </p>
        <h2
          className="text-[#272833] leading-tight mb-1"
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}
        >
          {it.courseLabel}
        </h2>
        <p
          className="text-[#535D67]"
          style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}
        >
          {it.dateLabel} · {it.departure}↔{it.arrivalAirportLabel} · {it.durationHours}시간
        </p>
        {it.tags && it.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {it.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#F2FDF7] text-[#149867] rounded-[4px]"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 카트 아이템 */}
      <div className="h-2 bg-[#F0F2F5]" />
      <div className="bg-white px-5 py-5">
        <h3
          className="text-[#272833] mb-3"
          style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}
        >
          묶음 항목
        </h3>

        {/* 항공권 */}
        <CartItem
          icon={<Plane className="w-5 h-5 text-[#0277BD]" />}
          iconBg="bg-[#E1F5FE]"
          label="항공권"
          name={`${it.departure} ↔ ${it.arrivalAirportLabel}`}
          sub="왕복 · 제휴 항공사"
          priceLabel={formatKrw(it.flightPriceKrw)}
          externalLabel="제휴 항공사"
          onExternal={() => handleExternalToast('제휴 항공사')}
        />

        {/* 호텔 (있을 때만) */}
        {it.hotelPriceKrw && (
          <CartItem
            icon={<Hotel className="w-5 h-5 text-[#7C3AED]" />}
            iconBg="bg-[#F3E8FF]"
            label="숙소"
            name={`${it.arrivalAirportLabel.split('(')[0]} 시내 호텔`}
            sub="1박 · 조식 포함"
            priceLabel={formatKrw(it.hotelPriceKrw)}
            externalLabel="제휴 OTA"
            onExternal={() => handleExternalToast('제휴 호텔 OTA')}
          />
        )}

        {/* 골프장 라인 — 다중 코스 지원 (우리 결제) */}
        {matchedLines.map((line, idx) => (
          <div key={idx} className="py-3 border-t border-[#F0F2F5]">
            <button
              type="button"
              onClick={() => handleGolfProceed(idx)}
              className="w-full flex items-start gap-3 text-left hover:bg-[#F9FAFB] -mx-2 px-2 py-1 rounded-[6px] transition-colors"
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#F2FDF7] flex items-center justify-center flex-shrink-0">
                <span style={{ fontSize: 20 }}>⛳</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span
                    className="text-[#272833]"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px' }}
                  >
                    골프장 {matchedLines.length > 1 ? `${idx + 1}R` : ''}
                  </span>
                  <span
                    className="px-1.5 py-0.5 bg-[#1AB277] text-white rounded-[4px]"
                    style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0 }}
                  >
                    바로 예약
                  </span>
                </div>
                <p
                  className="text-[#272833] truncate"
                  style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
                >
                  {line.course?.name ?? line.name}
                </p>
                <p
                  className="text-[#9EABBA] truncate"
                  style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}
                >
                  {line.plan?.name ?? '플랜'} · {line.course?.region ?? '-'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className="text-[#272833]"
                  style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
                >
                  {formatJpy(line.priceJpy)}
                </p>
                <p className="text-[#1AB277] mt-0.5 inline-flex items-center gap-0.5" style={{ fontSize: 11, fontWeight: 700 }}>
                  예약 <ChevronRight className="w-3 h-3" />
                </p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* 안내 박스 */}
      <div className="px-5 py-4">
        <div className="p-3 bg-[#E0F7ED] rounded-[8px] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#0E8F5D] flex-shrink-0 mt-0.5" />
          <p
            className="text-[#0E8F5D] leading-relaxed"
            style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}
          >
            <span className="font-bold">항공·숙소는 제휴사 페이지에서 결제</span>되고, <span className="font-bold">골프장은 카카오골프예약에서 바로 예약</span>됩니다. 각 항목을 모두 진행하시면 묶음 일정이 완성돼요.
          </p>
        </div>
      </div>

      {/* 결제 정보 */}
      <div className="h-2 bg-[#F0F2F5]" />
      <div className="bg-white px-5 py-5">
        <h3
          className="text-[#272833] mb-3"
          style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}
        >
          묶음 일정 합계
        </h3>
        <div className="flex items-center justify-between py-2">
          <span className="text-[#6A7683]" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}>
            항공권
          </span>
          <span className="text-[#272833]" style={{ fontSize: 14, fontWeight: 500 }}>
            {formatKrw(it.flightPriceKrw)}
          </span>
        </div>
        {it.hotelPriceKrw && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[#6A7683]" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}>
              숙소
            </span>
            <span className="text-[#272833]" style={{ fontSize: 14, fontWeight: 500 }}>
              {formatKrw(it.hotelPriceKrw)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-2">
          <span className="text-[#6A7683]" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}>
            골프장 {matchedLines.length > 1 ? `(${matchedLines.length}R)` : ''}
          </span>
          <span className="text-[#272833]" style={{ fontSize: 14, fontWeight: 500 }}>
            {formatJpy(golfTotalJpy)} · 약 {formatKrw(golfKrw)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 mt-1">
          <span className="text-[#272833]" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>
            예상 합계
          </span>
          <span className="text-[#1AB277]" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px' }}>
            {formatKrw(totalKrw)}
          </span>
        </div>
        <p
          className="text-[#9EABBA] text-right mt-0.5"
          style={{ fontSize: 11, fontWeight: 500 }}
        >
          ※ 실제 결제 금액은 각 제휴사/현장 결제 시 확정됩니다
        </p>
      </div>

      {/* 하단 CTA */}
      <div className="sticky bottom-0 bg-white border-t border-[#E6EBF0] px-5 py-3">
        <button
          onClick={() => handleGolfProceed(0)}
          className="w-full py-3.5 bg-[#1AB277] text-white rounded-[8px] flex items-center justify-center gap-1 hover:bg-[#149867]"
          style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}
        >
          <span>
            {matchedLines.length > 1
              ? `⛳ ${matchedLines[0].course?.name ?? matchedLines[0].name}부터 예약`
              : '⛳ 골프장부터 예약하기'}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <p
          className="text-[#9EABBA] text-center mt-1.5"
          style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.3px' }}
        >
          {matchedLines.length > 1
            ? '나머지 골프장·항공·숙소는 위 항목을 각각 탭해서 진행해 주세요'
            : '항공·숙소는 위 항목에서 각각 제휴사 페이지로 이동해 진행해 주세요'}
        </p>
      </div>
      <LegalFooter />
    </div>
  );
}

/* ── 카트 아이템 (외부 결제) ── */
function CartItem({
  icon, iconBg, label, name, sub, priceLabel, externalLabel, onExternal,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  name: string;
  sub: string;
  priceLabel: string;
  externalLabel: string;
  onExternal: () => void;
}) {
  return (
    <button
      onClick={onExternal}
      className="w-full py-3 border-t border-[#F0F2F5] first:border-t-0 flex items-start gap-3 text-left hover:bg-[#F9FAFB] transition-colors"
    >
      <div className={`w-10 h-10 rounded-[8px] ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span
            className="text-[#272833]"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px' }}
          >
            {label}
          </span>
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F0F2F5] text-[#535D67] rounded-[4px]"
            style={{ fontSize: 9, fontWeight: 800 }}
          >
            <ExternalLink className="w-2.5 h-2.5" />
            {externalLabel}
          </span>
        </div>
        <p
          className="text-[#272833] truncate"
          style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
        >
          {name}
        </p>
        <p
          className="text-[#9EABBA] truncate"
          style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}
        >
          {sub}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className="text-[#272833]"
          style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
        >
          {priceLabel}
        </p>
        <p className="text-[#1AB277] mt-0.5 inline-flex items-center gap-0.5" style={{ fontSize: 11, fontWeight: 700 }}>
          이동 <ChevronRight className="w-3 h-3" />
        </p>
      </div>
    </button>
  );
}
