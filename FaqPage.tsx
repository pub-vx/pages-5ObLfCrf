import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { AppHeader } from './AppHeader';

interface FaqItem {
  category: string;
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  // 예약·결제
  {
    category: '예약·결제',
    q: '해외 골프장은 어떻게 예약하나요?',
    a: '해외 골프 실시간 예약 화면에서 원하는 골프장·날짜·티타임을 선택한 뒤 예약자/동반자 영문명, 약관 동의 후 예약을 접수해 주세요.',
  },
  {
    category: '예약·결제',
    q: '결제는 언제 어떻게 진행되나요?',
    a: '대부분의 해외 골프장은 현장결제 상품입니다. 표시된 엔화(¥) 금액 기준으로 현지 골프장에서 결제하시면 됩니다. 한화 금액은 현재 환율 기준 예상 금액입니다.',
  },
  {
    category: '예약·결제',
    q: '예약자 본인 외 동반자도 영문명을 입력해야 하나요?',
    a: '네, 골프장 체크인 시 여권상 영문명을 확인합니다. 예약 시점에 모르신다면 라운드 5일 전까지 예약내역에서 추가할 수 있어요.',
  },
  // 취소·변경
  {
    category: '취소·변경',
    q: '예약 취소는 어떻게 하나요?',
    a: '예약내역 > 예약상세 > 예약취소 버튼으로 진행할 수 있습니다. 취소 가능기한 내 취소 시 위약금이 없으며, 기한 이후엔 골프장별 위약금이 부과될 수 있어요.',
  },
  {
    category: '취소·변경',
    q: '취소 가능기한이 지났는데 취소할 수 있나요?',
    a: '취소 가능기한 이후엔 즉시 취소가 불가하고 카카오골프예약 고객센터로 취소 신청이 접수됩니다. 영업일 기준 1~2일 내 안내 드려요.',
  },
  {
    category: '취소·변경',
    q: '날짜·티타임 변경이 가능한가요?',
    a: '예약변경은 골프장별 정책에 따라 차이가 있어 고객센터로 문의 부탁드립니다. 가능한 경우 위약금 없이 변경되며, 불가한 경우 취소 후 재예약이 필요합니다.',
  },
  // 라운드·골프장
  {
    category: '라운드·골프장',
    q: '일본 골프장은 어떤 점이 다른가요?',
    a: '대부분 카트 GPS·캐디 옵션·점심 식사 시간(쓰루 미운영)이 포함된 구조이며, 라운드 후 클럽하우스 결제가 일반적입니다. 일본 골프 처음이라면 가이드 페이지를 참고해 주세요.',
  },
  {
    category: '라운드·골프장',
    q: '쓰루 플레이는 무엇인가요?',
    a: '점심 식사 없이 18홀을 논스톱으로 이어 라운드하는 형태입니다. 시간을 아끼고 싶거나 빠른 라운드를 원하시면 쓰루플레이 옵션을 선택해 주세요.',
  },
  {
    category: '라운드·골프장',
    q: '2인·3인 라운드도 가능한가요?',
    a: '플랜에 따라 다릅니다. 골프장 상세 페이지의 옵션에서 "2인 플레이 가능", "3인 플레이 가능" 표기를 확인해 주세요.',
  },
  // 항공·숙소
  {
    category: '항공·숙소',
    q: '항공권/호텔도 같이 예약할 수 있나요?',
    a: '항공·숙소는 제휴사 페이지를 통해 별도 결제로 진행됩니다. 즉흥 골프 큐레이션에서 묶음 일정을 확인할 수 있어요.',
  },
  {
    category: '항공·숙소',
    q: '도착 공항에서 골프장까지 이동은 어떻게 하나요?',
    a: '대부분의 골프장에서 셔틀버스를 운영합니다. 골프장 상세에서 셔틀 운영 여부를 확인하거나, 도착 공항 기준 가까운 골프장을 추천받아 보세요.',
  },
];

const CATEGORIES = ['전체', '예약·결제', '취소·변경', '라운드·골프장', '항공·숙소'];

export function FaqPage() {
  const [category, setCategory] = useState<string>('전체');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<number | null>(0);

  const filtered = FAQS.filter(f => {
    if (category !== '전체' && f.category !== category) return false;
    if (query.trim()) {
      const q = query.trim();
      return f.q.includes(q) || f.a.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 헤더 */}
      <AppHeader title="자주 묻는 질문" showHome />

      {/* 검색 */}
      <div className="bg-white px-5 py-3 border-b border-[#F0F2F5]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EABBA]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="궁금한 내용을 검색해 보세요"
            className="w-full h-11 pl-9 pr-3 bg-[#F0F2F5] rounded-[8px] text-[14px] text-[#272833] outline-none placeholder:text-[#9EABBA] tracking-[-0.2px]"
          />
        </div>
      </div>

      {/* 카테고리 */}
      <div className="sticky top-12 z-40 bg-white border-b border-[#F0F2F5]">
        <div className="flex gap-1.5 overflow-x-auto px-5 py-3 scrollbar-hide">
          {CATEGORIES.map(c => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-[20px] border transition-all ${
                  active
                    ? 'bg-white border-[#272833] text-[#272833] font-bold'
                    : 'bg-white border-[#D9E0E8] text-[#9EABBA] font-medium'
                }`}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ 리스트 */}
      <div className="px-5 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#E6EBF0] py-12 text-center">
            <p className="text-[14px] text-[#9EABBA]">검색 결과가 없어요</p>
          </div>
        ) : (
          filtered.map((f, i) => {
            const isOpen = expanded === i;
            return (
              <div
                key={i}
                className="bg-white rounded-[8px] border border-[#E6EBF0] overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full px-4 py-3.5 flex items-start gap-3 text-left"
                >
                  <span
                    className="text-[#1AB277] flex-shrink-0"
                    style={{ fontSize: 14, fontWeight: 800 }}
                  >
                    Q
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[#9EABBA] mb-0.5"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.2px' }}
                    >
                      {f.category}
                    </p>
                    <p
                      className="text-[#272833]"
                      style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
                    >
                      {f.q}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#9EABBA] flex-shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9EABBA] flex-shrink-0 mt-1" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 flex items-start gap-3 border-t border-[#F0F2F5]">
                    <span
                      className="text-[#535D67] flex-shrink-0 mt-3"
                      style={{ fontSize: 14, fontWeight: 800 }}
                    >
                      A
                    </span>
                    <p
                      className="text-[#535D67] leading-relaxed pt-3"
                      style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}
                    >
                      {f.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 추가 안내 */}
      <div className="px-5 pb-8">
        <div className="bg-white rounded-[8px] border border-[#E6EBF0] p-4 text-center">
          <p
            className="text-[#272833] mb-1"
            style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}
          >
            원하는 답을 찾지 못하셨나요?
          </p>
          <p
            className="text-[#535D67]"
            style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}
          >
            카카오톡 채널 <span className="font-bold">@카카오골프예약</span>으로 문의해 주세요
          </p>
        </div>
      </div>
    </div>
  );
}
