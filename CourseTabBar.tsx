import { TabStrip } from '../TabStrip';

export type CourseTab = 'teetime' | 'info';

interface CourseTabBarProps {
  activeTab: CourseTab;
  onTabChange: (tab: CourseTab) => void;
}

const TABS = [
  { key: 'teetime' as const, label: '티타임' },
  { key: 'info' as const, label: '골프장 정보' },
];

/**
 * 골프장 상세 페이지 탭바 — 티타임 / 골프장 정보.
 * - 공용 TabStrip 사용
 * - sticky top-12 (AppHeader 아래) + z-40 으로 페이지 스크롤 시에도 노출 유지
 */
export function CourseTabBar({ activeTab, onTabChange }: CourseTabBarProps) {
  return (
    <div className="sticky top-12 z-40 bg-white">
      <TabStrip tabs={TABS} activeKey={activeTab} onChange={onTabChange} />
    </div>
  );
}
