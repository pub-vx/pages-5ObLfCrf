import type { ReactNode } from 'react';

export interface TabStripItem<T extends string = string> {
  key: T;
  /** 탭에 표시될 콘텐츠 — 라벨, 카운트 뱃지 등 자유 구성 */
  label: ReactNode;
}

interface TabStripProps<T extends string = string> {
  tabs: TabStripItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  /** sticky 등 외부 조정용 추가 클래스 */
  className?: string;
}

/**
 * 풀너비 underline 탭 strip (공용 컴포넌트).
 *
 * 디자인 룰:
 *  - 탭 행 높이: h-[42px] — AppHeader(h-12=48px) 와 함께 sticky 누적 90px
 *  - 활성: text-[#272833] font-extrabold + 하단 2px 다크 인디케이터
 *  - 비활성: text-[#9EABBA] font-semibold
 *  - strip 하단 1px 옅은 보더 (`#F0F2F5`)
 *  - 활성 인디케이터는 `bottom-[-1px]` 로 보더 라인을 z-index 자연 순서로 덮어
 *    같은 베이스라인에서 보더와 인디케이터가 자연스럽게 연결됨
 *
 * 적용처:
 *  - ExploreTabsPage: 실시간 예약 / 패키지
 *  - MyReservationsPage: 예약내역 / 취소내역
 *  - course-detail/CourseTabBar: 티타임 / 골프장 정보
 *
 * 사용:
 *   <TabStrip
 *     tabs={[{ key: 'a', label: '탭 A' }, { key: 'b', label: <>탭 B<span> 3</span></> }]}
 *     activeKey={current}
 *     onChange={setCurrent}
 *   />
 */
export function TabStrip<T extends string = string>({
  tabs,
  activeKey,
  onChange,
  className = '',
}: TabStripProps<T>) {
  return (
    <div className={`flex bg-white border-b border-border-subtle ${className}`}>
      {tabs.map(tab => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex-1 h-[42px] inline-flex items-center justify-center text-[15px] font-semibold relative tracking-[-0.2px] transition-colors ${
              active ? 'text-ink font-extrabold' : 'text-ink-light'
            }`}
            aria-current={active ? 'true' : undefined}
          >
            {tab.label}
            {active && (
              // bottom-[-1px] — strip border 1px 와 같은 베이스라인에 시작점을 맞추어
              // 다크 인디케이터(2px) 가 옅은 보더 위에 자연스럽게 얹힘
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-ink" />
            )}
          </button>
        );
      })}
    </div>
  );
}
