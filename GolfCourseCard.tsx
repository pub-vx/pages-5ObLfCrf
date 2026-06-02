import { useState, type MouseEvent } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { formatJpy, formatKrw, jpyToKrw, type GolfCourse } from '../data/mockData';
import { PriceDual } from '../lib/price';
import { formatCourseDistance } from '../lib/geo';

interface GolfCourseCardProps {
  course: GolfCourse;
  hideAdBadge?: boolean;
}

/** 플랜 전체 티타임을 분석해 "새벽/오전/오후 가능" 등 요약 문자열 생성 */
function timeSlotSummary(plans: GolfCourse['plans']): string {
  let hasDawn = false;  // ~06:59
  let hasAm = false;    // 07:00~11:59
  let hasPm = false;    // 12:00~
  for (const p of plans) {
    for (const t of p.times) {
      const hour = parseInt(t.split(':')[0], 10);
      if (hour < 7) hasDawn = true;
      else if (hour < 12) hasAm = true;
      else hasPm = true;
    }
  }
  const parts: string[] = [];
  if (hasDawn) parts.push('새벽');
  if (hasAm) parts.push('오전');
  if (hasPm) parts.push('오후');
  return parts.length > 0 ? `${parts.join('/')} 가능` : '';
}

export function GolfCourseCard({ course, hideAdBadge = false }: GolfCourseCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleCardClick = () => {
    if (course.isExternalAd) {
      toast.info('네이티브 광고주 광고 링크로 이동합니다.');
      return;
    }
    navigate(`/course/${course.id}`);
  };

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  const handleExternalClick = (e: MouseEvent) => {
    e.stopPropagation();
    toast.info('네이티브 광고주 광고 링크로 이동합니다.');
  };

  return (
    <div className="bg-white border-b border-[#E6EBF0]">
      <button onClick={handleCardClick} className="w-full flex gap-3 px-4 py-4 text-left hover:bg-[#F9FAFB] transition-colors">
        {/* 이미지 */}
        <div className="flex-shrink-0 relative">
          <img
            src={course.image}
            alt={course.name}
            className="w-32 h-24 rounded-md object-cover"
          />
          {/* 브랜드 뱃지 (PGM / Grand PGM / Accordia 등) — 운영 브랜드가 있는 코스만 */}
          {course.brand && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-[4px] bg-black/65 text-white text-[10px] font-bold tracking-[-0.2px] backdrop-blur-sm">
              {course.brand}
            </span>
          )}
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className={`font-bold text-base text-[#272833] leading-snug ${course.isExternalAd ? 'line-clamp-2' : 'truncate'}`}>
            {course.name}
          </h3>
          <p className="text-[13px] font-medium text-[#6A7683] tracking-[-0.75px] mt-0.5 truncate">
            {course.region} · {formatCourseDistance(course)}
            {course.isAd && (!hideAdBadge || course.isExternalAd) && (
              <span className="ml-1 text-[#9EABBA] font-medium">· AD</span>
            )}
          </p>

          <div className="mt-auto pt-2 flex items-end justify-between gap-2">
            {/* 좌측: 금액 — 플랜 0개일 땐 대체 문구 */}
            {course.plans.length > 0 ? (
              <PriceDual
                jpy={course.lowestPrice}
                remainingTeams={course.remainingTeams}
                secondaryPrefix="약 "
              />
            ) : (
              <p className="text-[12px] font-medium text-[#9EABBA]" style={{ letterSpacing: '-0.2px' }}>
                해당 일자에 예약 가능한 라운드가 없어요
              </p>
            )}

            {/* 우측: 잔여팀 칩 OR 자세히보기 */}
            {course.isExternalAd ? (
              <span
                onClick={handleExternalClick}
                className="flex items-center gap-0.5 text-xs font-medium text-[#9EABBA] hover:text-[#535D67] px-1 py-1"
              >
                자세히보기
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            ) : course.plans.length > 0 ? (
              <span
                onClick={handleToggle}
                className="flex items-center gap-0.5 text-[13px] font-medium text-[#1AB277] tracking-[-0.75px] whitespace-nowrap"
              >
                플랜 {course.plans.length}개
                <ChevronDown className={`w-[18px] h-[18px] transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
              </span>
            ) : null}
          </div>
        </div>
      </button>

      {/* 펼쳐진 플랜 가로 스크롤 */}
      <AnimatePresence>
        {expanded && !course.isExternalAd && course.plans.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-[#F9FAFB]"
          >
            <div className="overflow-x-auto scrollbar-hide px-4 py-3">
              <div className="flex gap-2">
                {course.plans.map(plan => {
                  const MAX_TIMES = 4;
                  const visibleTimes = plan.times.slice(0, MAX_TIMES);
                  const remaining = plan.times.length - visibleTimes.length;
                  return (
                    <button
                      key={plan.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/checkout/${course.id}/${plan.id}`);
                      }}
                      className="flex-shrink-0 w-48 min-h-[112px] bg-white border border-[#E6EBF0] rounded-[8px] p-3 text-left hover:border-[#1AB277] transition-colors flex flex-col gap-1.5"
                    >
                      <h4 className="text-xs font-semibold text-[#272833] leading-snug line-clamp-2 break-keep">
                        {plan.name}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {visibleTimes.map(time => (
                          <span key={time} className="px-1.5 py-0.5 bg-[#F0F2F5] rounded text-[10px] text-[#6A7683] font-medium">
                            {time}
                          </span>
                        ))}
                        {remaining > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#F2FDF7] rounded text-[10px] text-[#149867] font-bold">
                            +{remaining}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto">
                        <p className="text-sm font-bold text-[#272833]">{formatJpy(plan.basePrice)}</p>
                        <p className="text-[10px] text-[#9EABBA]">약 {formatKrw(jpyToKrw(plan.basePrice))}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
