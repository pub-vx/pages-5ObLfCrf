import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { EXCHANGE_RATE, EXCHANGE_RATE_DATE } from '../data/mockData';

/**
 * 원화 환산 금액 + (?) 도움말 아이콘.
 * hover/탭 시 환율 적용 안내 툴팁 노출.
 * - 예상 원화 금액임을 명시
 * - 적용 환율 + 기준일
 * - 실제 결제 시 환율에 따라 달라질 수 있음
 */
export function KrwHint({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className ?? ''}`}>
      <span>예상 {text}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label="환율 안내" className="inline-flex items-center text-[#9EABBA]">
            <HelpCircle className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-left leading-relaxed bg-[#272833] text-white" sideOffset={4}>
          <p className="font-bold mb-0.5">예상 원화 금액이에요</p>
          <p className="opacity-90">
            1¥ ≈ {EXCHANGE_RATE}원 ({EXCHANGE_RATE_DATE} 기준).
            실제 환율에 따라 결제 금액은 달라질 수 있어요.
          </p>
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
