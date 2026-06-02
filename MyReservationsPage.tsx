import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Plane, List } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { TabStrip } from './TabStrip';
import { useAppState } from '../data/store';
import { getCourseById, getPlanById } from '../data/mockData';

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: '예약 처리 중', bg: 'bg-[#FFF8E1]', text: 'text-[#F5A623]' },
  ACTIVE: { label: '예약완료', bg: 'bg-[#E0F7ED]', text: 'text-[#149867]' },
  CANCELLED: { label: '취소됨', bg: 'bg-[#F0F2F5]', text: 'text-[#9EABBA]' },
  FAILED: { label: '예약 실패', bg: 'bg-[#FDEAEA]', text: 'text-[#EA5656]' },
};

function formatCancelDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatPlayDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

function getDday(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export function MyReservationsPage() {
  const navigate = useNavigate();
  const { reservations } = useAppState();
  const [activeTab, setActiveTab] = useState<'reserved' | 'cancelled'>('reserved');

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // 분류: 예약내역(취소 외 모두) / 취소내역
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // 정렬: 예약완료(다가오는) > 라운드 완료(지난), 각 그룹 내 playDate 오름차순
  const reserved = reservations
    .filter(r => r.status !== 'CANCELLED')
    .sort((a, b) => {
      const aUpcoming = new Date(a.playDate) >= now;
      const bUpcoming = new Date(b.playDate) >= now;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1; // 다가오는 게 먼저
      return new Date(a.playDate).getTime() - new Date(b.playDate).getTime(); // 일자 오름차순
    });
  const cancelled = reservations
    .filter(r => r.status === 'CANCELLED')
    // 라운드일자 기준 최신순 (가까운 일자가 위)
    .sort((a, b) => new Date(b.playDate).getTime() - new Date(a.playDate).getTime());

  const currentList = activeTab === 'reserved' ? reserved : cancelled;

  // 예약완료(다가오는) ↔ 라운드 완료(지난) 경계 인덱스 — reserved 탭에서만 사용
  const firstCompletedIdx = activeTab === 'reserved'
    ? currentList.findIndex(r => r.status === 'ACTIVE' && new Date(r.playDate) < now)
    : -1;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 헤더 */}
      <AppHeader title="해외 골프 예약 내역" showHome onBack={handleBack} border={false}>
        {/* 탭 — 공용 TabStrip. 카운트 뱃지는 활성 여부에 따라 컬러 분기 */}
        <TabStrip
          tabs={[
            {
              key: 'reserved',
              label: (
                <>
                  예약내역
                  {reserved.length > 0 && (
                    <span className={`ml-1 text-[12px] ${activeTab === 'reserved' ? 'text-[#1AB277]' : 'text-[#C5CDD5]'}`}>
                      {reserved.length}
                    </span>
                  )}
                </>
              ),
            },
            {
              key: 'cancelled',
              label: (
                <>
                  취소내역
                  {cancelled.length > 0 && (
                    <span className={`ml-1 text-[12px] ${activeTab === 'cancelled' ? 'text-[#1AB277]' : 'text-[#C5CDD5]'}`}>
                      {cancelled.length}
                    </span>
                  )}
                </>
              ),
            },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </AppHeader>

      {/* 예약 목록 */}
      {currentList.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F9FAFB] flex items-center justify-center">
            <Plane className="w-7 h-7 text-[#C5CDD5]" />
          </div>
          <p className="text-[15px] font-bold text-[#272833] mb-1">
            {activeTab === 'reserved' ? '예약 내역이 없어요' : '취소 내역이 없어요'}
          </p>
          <p className="text-[13px] text-[#9EABBA] mb-6">
            {activeTab === 'reserved' ? '해외 골프를 예약해 보세요!' : ''}
          </p>
          {activeTab === 'reserved' && (
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#1AB277] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#149867] transition-colors"
            >
              골프장 둘러보기
            </button>
          )}
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {currentList.map((reservation, idx) => {
            const course = getCourseById(reservation.courseId);
            const plan = getPlanById(reservation.courseId, reservation.planId);
            const isActive = reservation.status === 'ACTIVE';
            const isCancelled = reservation.status === 'CANCELLED';
            // 라운드 일자가 오늘 이후인 경우에만 취소 가능 (지난 예약은 상세 보기만)
            const isUpcoming = new Date(reservation.playDate) >= now;
            const canCancel = isActive && isUpcoming;
            // 취소가능기한 = 라운드 5일 전. 이후엔 즉시 취소가 아닌 "취소 신청" 으로 분기
            const cancelDeadline = new Date(reservation.playDate);
            cancelDeadline.setDate(cancelDeadline.getDate() - 5);
            const isCancelRequestOnly = canCancel && now > cancelDeadline;
            // ACTIVE + 지난 일자 = 라운드 완료
            const isCompleted = isActive && !isUpcoming;
            const status = isCompleted
              ? { label: '라운드 완료', bg: 'bg-[#E1EDFF]', text: 'text-[#0057D9]' }
              : STATUS_MAP[reservation.status] || STATUS_MAP.PENDING;
            const dday = getDday(reservation.playDate);

            // 표시용 — "26.07.01 (수) 08:30" 형식
            const playD = new Date(reservation.playDate);
            const dayKor = ['일','월','화','수','목','금','토'][playD.getDay()];
            const yy = String(playD.getFullYear()).slice(2);
            const mm = String(playD.getMonth() + 1).padStart(2, '0');
            const dd = String(playD.getDate()).padStart(2, '0');
            const playDateLine = `${yy}.${mm}.${dd} (${dayKor}) ${reservation.teeTime}`;
            // 취소가능기한 = 라운드 5일 전 19:10
            const cd = new Date(reservation.playDate);
            cd.setDate(cd.getDate() - 5);
            const cancelDeadlineLine = `${cd.getFullYear()}.${String(cd.getMonth()+1).padStart(2,'0')}.${String(cd.getDate()).padStart(2,'0')} 19:10`;

            const showListEntry = idx === firstCompletedIdx && firstCompletedIdx > 0;

            return (
              <Fragment key={reservation.id}>
                {showListEntry && (
                  <button
                    onClick={() => navigate('/search')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#E6EBF0] rounded-[8px] text-left hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#F0F2F5] flex items-center justify-center">
                        <List className="w-4 h-4 text-[#535D67]" />
                      </div>
                      <div>
                        <p className="text-[#272833]" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>
                          새 라운드 예약하러 가기
                        </p>
                        <p className="text-[#9EABBA] mt-0.5" style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}>
                          해외 골프장 목록에서 더 많은 코스를 둘러보세요
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9EABBA]" />
                  </button>
                )}
              <div
                className={`bg-white rounded-[8px] border border-[#E6EBF0] overflow-hidden ${isCancelled ? 'opacity-60' : ''}`}
              >
                {/* 1) 헤더 — 상태 + D-day · 날짜시간 · 예약상세 */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`${
                          isCompleted ? 'text-[#0057D9]'
                          : isCancelled ? 'text-[#9EABBA]'
                          : 'text-[#1AB277]'
                        }`}
                        style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}
                      >
                        {status.label}
                      </span>
                      {isActive && (
                        <span
                          className="text-[#9EABBA]"
                          style={{ fontSize: 12, fontWeight: 500 }}
                        >
                          {dday}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[#272833]"
                      style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}
                    >
                      {playDateLine}
                    </p>
                  </div>
                  {!isCancelled && (
                    <button
                      onClick={() => navigate(`/complete/${reservation.id}`)}
                      className={`inline-flex items-center flex-shrink-0 mt-0.5 ${
                        isCompleted ? 'text-[#535D67]' : 'text-[#1AB277]'
                      }`}
                      style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}
                    >
                      예약상세
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 디바이더 */}
                <div className="mx-4 border-t border-[#F0F2F5]" />

                {/* 2) 본문 — 골프장명 + 플랜 + 썸네일 (취소건은 골프장 상세로 이동) */}
                <button
                  onClick={() => navigate(isCancelled ? `/course/${reservation.courseId}` : `/complete/${reservation.id}`)}
                  className={`w-full px-4 pt-3 ${canCancel || isCancelled ? 'pb-2' : 'pb-4'} flex items-start gap-3 text-left`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-0.5 mb-1">
                      <h3
                        className="text-[#272833] truncate"
                        style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}
                      >
                        {course?.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-[#272833] flex-shrink-0" />
                    </div>
                    <p
                      className="text-[#9EABBA] truncate"
                      style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}
                    >
                      {plan?.name} · {reservation.totalPlayer}인
                    </p>
                  </div>
                  <img
                    src={course?.image || ''}
                    alt={course?.name || ''}
                    className="w-[52px] h-[52px] rounded-full object-cover flex-shrink-0"
                  />
                </button>

                {/* 3) 취소 가능기한 — 다가오는 ACTIVE 예약일 때만 (좌측 정렬) */}
                {canCancel && (
                  <div className="px-4 pb-4 flex items-center gap-1.5">
                    <span
                      className="text-[#535D67]"
                      style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}
                    >
                      취소 가능기한
                    </span>
                    <span
                      className="text-[#EA5656]"
                      style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}
                    >
                      {cancelDeadlineLine}
                    </span>
                  </div>
                )}

                {/* 3-1) 예약 취소일시 — 취소건일 때 */}
                {isCancelled && reservation.cancelledAt && (
                  <div className="px-4 pb-4 flex items-center gap-1.5">
                    <span
                      className="text-[#535D67]"
                      style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}
                    >
                      예약 취소일시
                    </span>
                    <span
                      className="text-[#9EABBA]"
                      style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}
                    >
                      {formatCancelDateTime(reservation.cancelledAt)}
                    </span>
                  </div>
                )}
              </div>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
