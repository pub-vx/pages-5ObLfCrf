import type { ReactNode } from 'react';

interface SectionHeaderProps {
  /** 섹션 타이틀 */
  title: string;
  /** 타이틀 우측 인라인 뱃지 (예: '추천') */
  badge?: ReactNode;
  /** 우측 '모두보기' 동작 — 미지정 시 더보기 버튼 숨김 */
  onMore?: () => void;
  /** 더보기 라벨 (기본 '모두보기') */
  moreLabel?: string;
  /** 외부 간격 조정용 추가 클래스 */
  className?: string;
}

/**
 * 홈/리스트 공용 섹션 헤더 — 포털 `.section_title_area` 패턴.
 * - 타이틀 18px / 700 / 좌측
 * - (선택) 모두보기 14px / #B7C2CC / 우측 — 우선순위 낮은 보조 액션이라 옅은 톤으로 노출
 * - 좌우 거터 20px(px-5), 타이틀↔콘텐츠 20px(mb-5)
 */
export function SectionHeader({ title, badge, onMore, moreLabel = '모두보기', className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-3 px-5 mb-3 ${className}`}>
      <h2 className="inline-flex items-center gap-1.5 min-w-0 text-[16px] font-bold text-ink tracking-[-0.3px]">
        <span className="truncate">{title}</span>
        {badge}
      </h2>
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          className="flex-shrink-0 text-[14px] font-medium text-ink-faint tracking-[-0.2px]"
        >
          {moreLabel}
        </button>
      )}
    </div>
  );
}
