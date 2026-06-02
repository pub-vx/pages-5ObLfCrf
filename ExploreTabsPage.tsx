import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ClipboardList, Search } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { LegalFooter } from './LegalFooter';
import { AppHeader, HeaderAction } from './AppHeader';
import { TabStrip } from './TabStrip';

interface Props {
  children: ReactNode;
}

/**
 * v3 진입 화면. v2의 큐레이션 홈을 대체한다.
 *
 * 상단 구조:
 *   1) 슬림 헤더: 뒤로 / 타이틀(해외 골프 투어) / 예약내역 아이콘
 *   2) 탭바: [실시간 예약 | 패키지] — 활성 탭 underline
 *
 * 본문은 라우트별 페이지(RealtimeSearchPage 또는 PackagesSearchPage)가 children으로 들어온다.
 */
export function ExploreTabsPage({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  type HomeTabKey = 'realtime' | 'packages';
  const activeKey: HomeTabKey = location.pathname.startsWith('/packages') ? 'packages' : 'realtime';

  return (
    <div className="min-h-screen bg-white">
      {/* 슬림 헤더 — 홈은 뒤로/타이틀/검색·예약내역 (홈 버튼 없음) */}
      <AppHeader
        title="해외 골프 투어"
        border={false}
        right={
          <>
            <HeaderAction onClick={() => setSearchModalOpen(true)} label="검색">
              <Search className="w-5 h-5 text-[#272833]" />
            </HeaderAction>
            <HeaderAction onClick={() => navigate('/my-reservations')} label="예약내역">
              <ClipboardList className="w-5 h-5 text-[#272833]" />
            </HeaderAction>
          </>
        }
      >
        {/* 상단 탭 — 공용 TabStrip 사용. h-12 명시로 타이틀 행 h-12 + 탭 행 h-12 = 96px (top-24).
            패키지 탭의 CountryTabStrip (sticky top-24) 와 픽셀 단위로 맞아 갭 제거. */}
        <TabStrip
          tabs={[
            { key: 'realtime', label: '실시간 예약' },
            { key: 'packages', label: '패키지' },
          ]}
          activeKey={activeKey}
          onChange={(key) => navigate(`/${key}`)}
        />
      </AppHeader>

      {/* 본문 */}
      {children}

      <LegalFooter />
      {/* LegalFooter 아래 여백 — LegalFooter 와 동일 톤(surface-soft)으로 시각 연결.
          외곽이 흰색이라 별도 bg 지정 필요. pb-12 외곽 패딩을 이 spacer 로 대체. */}
      <div className="h-12 bg-surface-soft" />
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}
