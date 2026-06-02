import { useNavigate } from 'react-router';
import { ChevronRight, Camera, MessageSquare, Wallet, Calendar, Plane } from 'lucide-react';
import { AppHeader } from './AppHeader';

const STEPS = [
  {
    n: 1,
    emoji: '✈️',
    title: '해외 골프장 예약하고 다녀오기',
    desc: '카카오골프예약 해외투어에서 라운드 예약 → 일본·태국·대만·하와이 어디든 OK',
    color: 'bg-[#E1F5FE]',
  },
  {
    n: 2,
    emoji: '📸',
    title: '라운드 후 후기 + 사진 인증',
    desc: '내 예약 내역에서 후기 작성 (사진 1장 이상 첨부 필수)',
    color: 'bg-[#FFF8E1]',
  },
  {
    n: 3,
    emoji: '💰',
    title: '최대 5만원 캐시백 지급',
    desc: '심사 후 영업일 기준 7일 내 카카오캐시로 적립',
    color: 'bg-[#F2FDF7]',
  },
];

const REWARDS = [
  { tier: 'Tier 1', condition: '단순 후기 + 사진 1장', amount: '1만원' },
  { tier: 'Tier 2', condition: '후기 200자 이상 + 사진 3장', amount: '3만원' },
  { tier: 'Tier 3', condition: '후기 + 사진 + 클럽하우스 영수증', amount: '5만원' },
];

const FAQ = [
  { q: '여러 번 다녀와도 매번 받을 수 있나요?', a: '이벤트 기간 내 1인당 최대 3회까지 캐시백을 받을 수 있어요.' },
  { q: '동반자도 모두 받을 수 있나요?', a: '예약자 본인 명의의 후기에 한해 적립되며, 동반자는 별도 예약 시 가능합니다.' },
  { q: '카카오캐시는 언제 들어오나요?', a: '후기 등록 후 영업일 기준 7일 이내 심사하고 즉시 적립해드려요.' },
  { q: '캐시 사용처는 어떻게 되나요?', a: '카카오톡, 카카오페이, 카카오골프예약 모든 서비스에서 사용 가능합니다.' },
];

export function CashbackEventPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <AppHeader title="캐시백 이벤트" showHome />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FFE9EC] via-[#FFF4E0] to-[#FFF8E1] px-5 py-8 text-center">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/60 rounded-full mb-3">
          <span className="text-[11px] font-bold text-[#D6385A]">🔥 한정 이벤트</span>
        </div>
        <h2 className="text-[24px] font-bold text-[#272833] leading-tight mb-2">
          실시간 해외투어<br />
          <span className="text-[#D6385A]">리뉴얼 기념 캐시백</span>
        </h2>
        <p className="text-[14px] text-[#6A7683] leading-relaxed mb-3">
          해외 골프 라운드 다녀오고<br />
          후기 인증하면 <span className="font-bold text-[#272833]">최대 5만원</span> 돌려드려요
        </p>
        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full">
          <Calendar className="w-3.5 h-3.5 text-[#1AB277]" />
          <span className="text-[12px] font-bold text-[#272833]">2026.05.08 ~ 2026.06.30</span>
        </div>
      </div>

      {/* 참여 방법 */}
      <div className="px-5 py-6">
        <h3 className="text-[16px] font-bold text-[#272833] mb-4">참여 방법</h3>
        <div className="space-y-3">
          {STEPS.map(s => (
            <div key={s.n} className="flex gap-3">
              <div className={`w-12 h-12 ${s.color} rounded-[8px] flex items-center justify-center flex-shrink-0 relative`}>
                <span className="text-[24px]">{s.emoji}</span>
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-[#272833] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {s.n}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[14px] font-bold text-[#272833]">{s.title}</p>
                <p className="text-[12px] text-[#6A7683] mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-2 bg-[#F0F2F5]" />

      {/* 캐시백 등급 */}
      <div className="px-5 py-6">
        <h3 className="text-[16px] font-bold text-[#272833] mb-1">캐시백 등급</h3>
        <p className="text-[12px] text-[#6A7683] mb-4">후기 정성도에 따라 캐시백 금액이 차등 지급돼요</p>
        <div className="space-y-2">
          {REWARDS.map((r, i) => (
            <div
              key={r.tier}
              className={`flex items-center justify-between p-4 rounded-[8px] border ${
                i === 2 ? 'bg-gradient-to-r from-[#FFF8E1] to-[#FFE9EC] border-[#FFC93D]' : 'bg-[#F9FAFB] border-[#E6EBF0]'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold text-[#9EABBA]">{r.tier}</span>
                  {i === 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#272833] text-white rounded-full font-bold">
                      MAX
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#272833]">{r.condition}</p>
              </div>
              <p className="text-[18px] font-bold text-[#D6385A]">{r.amount}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-2 bg-[#F0F2F5]" />

      {/* 인증 가이드 */}
      <div className="px-5 py-6">
        <h3 className="text-[16px] font-bold text-[#272833] mb-4">후기 인증 가이드</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#F9FAFB] rounded-[8px] p-3 text-center">
            <Camera className="w-6 h-6 text-[#1AB277] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-[#272833]">필수 사진</p>
            <p className="text-[10px] text-[#9EABBA] mt-0.5">최소 1장</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-[8px] p-3 text-center">
            <MessageSquare className="w-6 h-6 text-[#7C3AED] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-[#272833]">텍스트 후기</p>
            <p className="text-[10px] text-[#9EABBA] mt-0.5">자유 작성</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-[8px] p-3 text-center">
            <Wallet className="w-6 h-6 text-[#0277BD] mx-auto mb-1" />
            <p className="text-[11px] font-bold text-[#272833]">영수증</p>
            <p className="text-[10px] text-[#9EABBA] mt-0.5">선택</p>
          </div>
        </div>
      </div>

      <div className="h-2 bg-[#F0F2F5]" />

      {/* FAQ */}
      <div className="px-5 py-6">
        <h3 className="text-[16px] font-bold text-[#272833] mb-4">자주 묻는 질문</h3>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <div key={i} className="bg-[#F9FAFB] rounded-[8px] p-4">
              <p className="text-[13px] font-bold text-[#272833] mb-1">Q. {f.q}</p>
              <p className="text-[12px] text-[#6A7683] leading-relaxed">A. {f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-2 bg-[#F0F2F5]" />

      {/* 안내사항 */}
      <div className="px-5 py-6">
        <h3 className="text-[14px] font-bold text-[#272833] mb-2">유의사항</h3>
        <ul className="text-[12px] text-[#6A7683] space-y-1.5 leading-relaxed">
          <li>· 카카오골프예약 해외투어를 통해 예약·라운드한 건에 한해 적립됩니다.</li>
          <li>· 부적절한 후기(욕설, 광고성 글, 사진 미첨부 등)는 심사 거절될 수 있습니다.</li>
          <li>· 라운드 일자로부터 30일 이내 후기 등록한 건만 인정됩니다.</li>
          <li>· 1인당 이벤트 기간 내 최대 3회 캐시백 가능 (Tier 합산 최대 15만원).</li>
          <li>· 후기 작성 시 작성하신 텍스트·사진 등 콘텐츠는 카카오골프예약 서비스 내 마케팅 및 큐레이션 영역에 활용될 수 있으며, 후기 등록은 콘텐츠 이용에 동의한 것으로 간주됩니다.</li>
          <li>· 본 이벤트는 사정에 따라 조기 종료될 수 있습니다.</li>
        </ul>
      </div>

      {/* CTA */}
      <div className="sticky bottom-0 bg-white border-t border-[#F0F2F5] px-5 py-4">
        <button
          onClick={() => navigate('/search')}
          className="w-full py-3.5 bg-[#1AB277] text-white rounded-[8px] text-[15px] font-bold flex items-center justify-center gap-1 hover:bg-[#149867]"
        >
          <Plane className="w-4 h-4" />
          <span>지금 골프장 둘러보기</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
