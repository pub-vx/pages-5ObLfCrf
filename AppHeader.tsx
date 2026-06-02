import type { ReactNode } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router';

interface AppHeaderProps {
  /** 가운데 타이틀 — 문자열 또는 커스텀 노드(클릭형 합성 타이틀 등) */
  title?: ReactNode;
  /** 뒤로가기 버튼 노출 (기본 true) */
  showBack?: boolean;
  /** 뒤로가기 동작 오버라이드 (기본: history 있으면 -1, 없으면 '/') */
  onBack?: () => void;
  /** 우측 홈 버튼 노출 (기본 false) */
  showHome?: boolean;
  /** 우측 추가 액션(검색/예약내역 등) — 홈 버튼보다 앞에 렌더 */
  right?: ReactNode;
  /** 타이틀 행 하단 보더 (기본 true) */
  border?: boolean;
  /** sticky 고정 (기본 true) */
  sticky?: boolean;
  /** z-index (기본 50) */
  zIndex?: number;
  /** 타이틀 행 아래 서브 영역(DateStrip·탭·배너 등) — 같은 헤더 컨테이너 내부 */
  children?: ReactNode;
}

/**
 * 공용 앱 헤더 — 포털 AppHeader 패턴(3분할: 좌 뒤로 · 중앙 타이틀 · 우 액션).
 * - 타이틀은 화면 정중앙에 절대 고정 → 좌/우 버튼 개수와 무관하게 항상 가운데.
 * - 우측은 right(추가 액션) + showHome(홈) 조합.
 * - children 으로 타이틀 아래 서브행(DateStrip·탭 등)을 같은 컨테이너에 둘 수 있음.
 */
export function AppHeader({
  title,
  showBack = true,
  onBack,
  showHome = false,
  right,
  border = true,
  sticky = true,
  zIndex = 50,
  children,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const handleBack =
    onBack ??
    (() => {
      if (window.history.length > 1) navigate(-1);
      else navigate('/');
    });

  return (
    <div className={`${sticky ? 'sticky top-0' : ''} bg-white`} style={{ zIndex }}>
      <div className={`relative flex items-center h-12 px-4 ${border ? 'border-b border-[#F0F2F5]' : ''}`}>
        {/* 좌: 뒤로가기 (없으면 동일 폭 spacer로 행 균형 유지) */}
        {showBack ? (
          <button onClick={handleBack} className="-ml-1 p-1" aria-label="뒤로가기">
            <ArrowLeft className="w-5 h-5 text-[#272833]" />
          </button>
        ) : (
          <span className="w-6 h-6" aria-hidden="true" />
        )}

        {/* 중앙 타이틀 — 화면 정중앙 절대 고정. 클릭은 콘텐츠에만(좌우 버튼 가림 방지) */}
        {title != null && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16">
            <div className="pointer-events-auto min-w-0">
              {typeof title === 'string' ? (
                <h1 className="truncate text-[16px] font-bold text-[#272833] tracking-[-0.3px]">{title}</h1>
              ) : (
                title
              )}
            </div>
          </div>
        )}

        {/* 우: 추가 액션 + 홈. -mr-1 을 클러스터에 두어 마지막 아이콘이 무엇이든 동일 위치(좌측 뒤로가기와 대칭)에 배치 */}
        <div className="ml-auto -mr-1 flex items-center gap-1">
          {right}
          {showHome && (
            <button onClick={() => navigate('/')} className="p-1" aria-label="홈">
              <Home className="w-5 h-5 text-[#272833]" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/** 헤더 우측 아이콘 버튼 — right 슬롯 구성용(검색/예약내역 등) */
export function HeaderAction({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button onClick={onClick} className="p-1" aria-label={label}>
      {children}
    </button>
  );
}
