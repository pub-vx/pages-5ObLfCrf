import type { MutableRefObject } from 'react';

export interface CountryTabItem {
  /** 탭 식별자 (보통 country code: 'jp', 'vn' 등) */
  code: string;
  /** 표시 라벨 */
  name: string;
}

interface CountryUnderlineTabsProps {
  countries: CountryTabItem[];
  activeCode: string;
  onSelect: (code: string) => void;
  /**
   * - `inline` (기본): pb-1 만, 인디케이터 bottom-0. 모두보기 버튼 등과 같은 행에 인라인 배치되는 경우.
   * - `sticky`: h-11 명시, 인디케이터 bottom-[-1px] (strip border 와 겹쳐 동일 베이스라인).
   *   sticky strip 안에서 fixed-height 가 필요한 경우(PackagesSearchPage CountryTabStrip).
   */
  variant?: 'inline' | 'sticky';
  /** 각 버튼의 ref 등록용 — sticky 변형에서 활성 탭 scroll-into-view 동기화에 쓰임 */
  chipRefs?: MutableRefObject<Record<string, HTMLButtonElement | null>>;
  /** 외곽 flex container 의 gap/추가 조정 */
  className?: string;
}

/**
 * 나라 underline 탭 — 홈/패키지 공용.
 *
 * 디자인 규격 (홈화면 표준):
 *  - 폰트: text-[15px] tracking-[-0.2px]
 *  - 활성: text-[#272833] font-bold + 2px 다크 인디케이터
 *  - 비활성: text-[#9EABBA] font-medium
 *  - 가로 스크롤(flex-shrink-0, w-max) — 외곽 컨테이너에서 overflow-x-auto 처리
 *
 * 적용처:
 *  - MDPicks (variant: inline)
 *  - ArrivalAirportFinder (variant: inline)
 *  - PackagesSearchPage CountryTabStrip (variant: sticky, chipRefs)
 *
 * 사용:
 *   <CountryUnderlineTabs
 *     countries={COUNTRIES}
 *     activeCode={nation}
 *     onSelect={setNation}
 *   />
 */
export function CountryUnderlineTabs({
  countries,
  activeCode,
  onSelect,
  variant = 'inline',
  chipRefs,
  className = '',
}: CountryUnderlineTabsProps) {
  const isSticky = variant === 'sticky';
  // sticky 변형은 h-11(고정 높이) + 인디케이터가 strip 보더와 겹쳐 같은 베이스라인 형성
  const buttonLayout = isSticky ? 'h-11 inline-flex items-center' : 'pb-1';
  const indicatorBottom = isSticky ? 'bottom-[-1px]' : 'bottom-0';
  const gap = isSticky ? 'gap-4' : 'gap-3';

  return (
    <div className={`flex ${gap} w-max ${className}`}>
      {countries.map(c => {
        const active = c.code === activeCode;
        return (
          <button
            key={c.code}
            ref={chipRefs ? (el => { chipRefs.current[c.code] = el; }) : undefined}
            type="button"
            onClick={() => onSelect(c.code)}
            className={`flex-shrink-0 relative ${buttonLayout} text-[15px] tracking-[-0.2px] transition-colors ${
              active ? 'text-ink font-bold' : 'text-ink-light font-medium'
            }`}
            aria-current={active ? 'true' : undefined}
          >
            {c.name}
            {active && (
              <span className={`absolute ${indicatorBottom} left-0 right-0 h-[2px] bg-ink`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
