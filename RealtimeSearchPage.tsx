import { ExploreTabsPage } from './ExploreTabsPage';
import { SearchInputCard } from './SearchInputCard';
import { CountryGrid } from './CountryGrid';
import { ArrivalAirportFinder } from './ArrivalAirportFinder';
import { MDPicks } from './MDPicks';
import { CurationGradientCards } from './CurationGradientCards';

/**
 * v3 실시간 탭 홈 — 탐색(discovery) 페이지.
 *
 * 영역 구성 (분리선 없이 연속):
 *  1) 검색 입력 카드 + 검색 CTA
 *  2) 나라 선택 그리드
 *  3) MD 추천 상품
 *  4) 공항 기준으로 일본 티타임 탐색 (출발 공항 선택 → 도착 공항 카드 → /map?airport=)
 *  5) 이런 골프장은 어때요? (큐레이션 카드)
 */
export function RealtimeSearchPage() {
  return (
    <ExploreTabsPage>
      <SearchInputCard showSearchButton />
      <CountryGrid />
      <MDPicks />
      <ArrivalAirportFinder />
      <CurationGradientCards />
      <div className="h-6 bg-white" />
    </ExploreTabsPage>
  );
}
