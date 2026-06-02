import { useState } from 'react';
import { Languages } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { DEFAULT_COURSE_NOTICE, type CourseNotice } from '../../data/mockData';

/**
 * 플랜 유의사항 바텀시트.
 * - [번역 보기] / [원문 보기] 토글로 자동 번역(한국어) ↔ 원문(현지어) 전환
 * - 본문은 코스별 데이터(`course.notice`)로 분기. 미지정 코스는 DEFAULT_COURSE_NOTICE 사용
 */

export type NoticeMode = 'translated' | 'original';

/**
 * 번역 / 원문 토글 — 단독으로도 배치 가능(예: 섹션 타이틀 우측).
 * mode/onChange 를 부모가 제어하면 본문(PlanNoticeContent)과 상태를 공유할 수 있다.
 */
export function NoticeModeToggle({ mode, onChange }: { mode: NoticeMode; onChange: (m: NoticeMode) => void }) {
  return (
    <div className="inline-flex rounded-[8px] bg-[#F0F2F5] p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => onChange('translated')}
        className={`inline-flex items-center gap-1 px-3 h-8 rounded-[6px] text-[13px] font-bold tracking-[-0.2px] transition-colors ${
          mode === 'translated' ? 'bg-white text-[#272833] shadow-sm' : 'text-[#6A7683]'
        }`}
      >
        <Languages className="w-3.5 h-3.5" />
        번역 보기
      </button>
      <button
        type="button"
        onClick={() => onChange('original')}
        className={`inline-flex items-center px-3 h-8 rounded-[6px] text-[13px] font-bold tracking-[-0.2px] transition-colors ${
          mode === 'original' ? 'bg-white text-[#272833] shadow-sm' : 'text-[#6A7683]'
        }`}
      >
        원문 보기
      </button>
    </div>
  );
}

/**
 * 유의사항 콘텐츠 (번역/원문 토글 + 본문) — 바텀시트/인라인 공용.
 * - 바텀시트: PlanNoticeSheet 가 감쌈
 * - 인라인(예약하기 등): 이 컴포넌트를 섹션 안에 직접 배치
 * - notice 미지정 시 공통 기본 유의사항으로 폴백
 * - showToggle=false + mode/onModeChange 로 토글을 외부(섹션 타이틀 등)에 둘 수 있음
 */
export function PlanNoticeContent({
  notice = DEFAULT_COURSE_NOTICE,
  showToggle = true,
  mode: controlledMode,
  onModeChange,
}: {
  notice?: CourseNotice;
  showToggle?: boolean;
  mode?: NoticeMode;
  onModeChange?: (m: NoticeMode) => void;
}) {
  const [internalMode, setInternalMode] = useState<NoticeMode>('translated');
  const mode = controlledMode ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;
  return (
    <div>
      {/* 번역 / 원문 토글 (외부 배치 시 숨김) */}
      {showToggle && <NoticeModeToggle mode={mode} onChange={setMode} />}

      {/* 본문 */}
      <div className={showToggle ? 'mt-3' : ''}>
        {mode === 'translated' && (
          <p className="mb-3 inline-flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[#F2FDF7] text-[#149867] text-[11px] font-bold tracking-[-0.1px]">
            <Languages className="w-3 h-3" />
            자동 번역된 내용으로, 원문과 다를 수 있어요
          </p>
        )}
        <p className="text-[13px] text-[#393F48] leading-relaxed tracking-[-0.2px] whitespace-pre-line">
          {mode === 'translated' ? notice.translated : notice.original}
        </p>
      </div>
    </div>
  );
}

interface PlanNoticeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  /** 코스별 유의사항 — 미지정 시 공통 기본값 */
  notice?: CourseNotice;
}

export function PlanNoticeSheet({ open, onOpenChange, planName, notice }: PlanNoticeSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#E6EBF0]">
          <SheetTitle className="text-[16px] font-bold text-[#272833] tracking-[-0.3px] text-left">유의사항</SheetTitle>
          {planName && (
            <SheetDescription className="text-[12px] font-medium text-[#6A7683] tracking-[-0.2px] text-left">
              {planName}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <PlanNoticeContent notice={notice} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
