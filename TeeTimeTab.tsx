import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Info } from 'lucide-react';
import type { GolfCourse } from '../../data/mockData';
import { formatJpy, formatKrw, jpyToKrw } from '../../data/mockData';
import { DetailDateStrip } from './DetailDateStrip';
import { KrwHint } from '../KrwHint';
import { PlanNoticeSheet } from './PlanNoticeSheet';

interface TeeTimeTabProps {
  course: GolfCourse;
  selectedDate: Date;
  onDateChange: (d: Date) => void;
}

export function TeeTimeTab({ course, selectedDate, onDateChange }: TeeTimeTabProps) {
  const navigate = useNavigate();

  // 유의사항 바텀시트
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticePlanName, setNoticePlanName] = useState<string | undefined>(undefined);
  const openNotice = (planName: string) => {
    setNoticePlanName(planName);
    setNoticeOpen(true);
  };

  const handleTimeClick = (planId: string, time: string) => {
    navigate(`/checkout/${course.id}/${planId}?time=${time}`);
  };

  return (
    <div>
      {/* 날짜 스트립 */}
      <DetailDateStrip selectedDate={selectedDate} onDateChange={onDateChange} />

      {/* 플랜 카드들 — 회색 컨테이너(법적고지와 동일 톤 #F0F2F5) 위에 흰 카드 부유.
          pb 는 LegalFooter 와의 간격이 너무 벌어지지 않도록 pb-4 로 축소. */}
      <div className="bg-[#F0F2F5] px-4 pt-4 pb-4 space-y-3">
        {course.plans.length > 0 ? (
          course.plans.map(plan => {
            // 의미 있는 포함사항만 표기 — 가격 구성 요소(세금/시설이용료/소비세)는 제외
            const meaningful = plan.includes.filter(
              i => !['세금', '시설이용료', '소비세'].includes(i)
            );
            // 중립 뱃지(홀/인원) + 혜택 뱃지(포함사항)
            const baseBadges = [
              plan.roundCode === '18H' ? '18홀' : plan.roundCode,
              plan.minPlayer > 1 ? `${plan.minPlayer}인 필수` : `${plan.maxPlayer}인까지`,
            ];
            return (
              <div key={plan.id} className="border border-[#E6EBF0] rounded-[8px] overflow-hidden bg-white">
                {/* 카드 상단 — 플랜명·뱃지·가격·유의사항 */}
                <div className="px-4 pt-4 pb-3 relative">
                  {/* 가격 덩어리 — 우하단 absolute (좌측 흐름과 독립) */}
                  <div className="absolute bottom-4 right-4 text-right">
                    <p className="text-[#272833]" style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px' }}>
                      {formatJpy(plan.basePrice)}
                    </p>
                    <p className="text-[#9EABBA] mt-0.5" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.2px' }}>
                      <KrwHint text={formatKrw(jpyToKrw(plan.basePrice))} />
                    </p>
                  </div>

                  {/* 플랜명 (가격 영역 회피용 우측 패딩) */}
                  <h4
                    className="text-[#272833] leading-snug pr-24"
                    style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}
                  >
                    {plan.name}
                  </h4>

                  {/* 옵션 뱃지 — 홀/인원(중립·회색) + 포함혜택(연한 민트). 흰 카드 위 톤 */}
                  <div className="flex flex-wrap items-center gap-1 mt-2 pr-24">
                    {baseBadges.map(b => (
                      <span key={b} className="px-2 py-0.5 rounded-[4px] bg-[#F0F2F5] text-[#535D67] text-[11px] font-bold tracking-[-0.2px]">
                        {b}
                      </span>
                    ))}
                    {meaningful.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-[4px] bg-[#F2FDF7] text-[#149867] text-[11px] font-bold tracking-[-0.2px]">
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* 유의사항 보기(링크) — 좌측 일반 흐름 */}
                  <button
                    type="button"
                    onClick={() => openNotice(plan.name)}
                    className="inline-flex items-center gap-1 mt-2 -mx-1 -mb-1 p-1 text-[12px] font-medium text-[#535D67] tracking-[-0.2px] hover:text-[#1AB277] transition-colors"
                  >
                    <span className="underline underline-offset-2 decoration-[#9EABBA]">유의사항 보기</span>
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 카드 하단: 티타임 칩 */}
                <div className="px-4 py-3 border-t border-[#F0F2F5]">
                  <p className="text-[12px] font-bold text-[#272833] tracking-[-0.2px] mb-2">티타임 선택</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.times.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeClick(plan.id, time)}
                        className="px-3.5 py-2 rounded-[8px] text-[14px] font-medium border border-[#D9E0E8] text-[#272833] bg-white hover:border-[#1AB277] hover:bg-[#F2FDF7] hover:text-[#1AB277] active:bg-[#E6F9F0] transition-all"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <p className="text-[14px] text-[#9EABBA]">예약 가능한 티타임이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 유의사항 바텀시트 (번역/원문 토글) — 코스별 유의사항 분기 */}
      <PlanNoticeSheet open={noticeOpen} onOpenChange={setNoticeOpen} planName={noticePlanName} notice={course.notice} />
    </div>
  );
}
