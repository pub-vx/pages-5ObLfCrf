import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AlertCircle, AlertTriangle, Download, QrCode, Info, ChevronRight } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useAppState } from '../data/store';
import { getCourseById, getPlanById, formatJpy, formatKrw, jpyToKrw } from '../data/mockData';
import { KrwHint } from './KrwHint';
import { LegalFooter } from './LegalFooter';
import { PlanNoticeSheet } from './course-detail/PlanNoticeSheet';

export function CompletePage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { reservations, cancelReservation } = useAppState();

  const reservation = reservations.find(r => r.id === reservationId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelDoneOpen, setCancelDoneOpen] = useState(false);
  const [cancelDoneVariant, setCancelDoneVariant] = useState<'immediate' | 'request'>('immediate');
  const [noticeOpen, setNoticeOpen] = useState(false);

  if (!reservation) {
    return (
      <div className="p-8 text-center text-[#9EABBA]">
        <p>예약 정보를 찾을 수 없습니다</p>
        <button onClick={() => navigate('/')} className="mt-4 text-[#448FFF] text-sm">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const course = getCourseById(reservation.courseId);
  const plan = getPlanById(reservation.courseId, reservation.planId);
  const isCancelled = reservation.status === 'CANCELLED';

  // 취소 분기
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const playDate = new Date(reservation.playDate);
  const isUpcoming = playDate >= now;
  const cancelDeadline = new Date(reservation.playDate);
  cancelDeadline.setDate(cancelDeadline.getDate() - 5);
  cancelDeadline.setHours(19, 10, 0, 0); // 시각 mock
  const isCancelRequestOnly = isUpcoming && now > cancelDeadline;
  const canCancel = !isCancelled && isUpcoming;

  const fmtCancelDeadline = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

  const isPrepay = plan?.paymentType === 'prepay';
  const totalKrw = jpyToKrw(reservation.paidAmount);

  const handleCancel = () => {
    // 취소 가능기한 이후엔 즉시 취소가 아닌 "취소 신청" 분기
    setCancelDoneVariant(isCancelRequestOnly ? 'request' : 'immediate');
    cancelReservation(reservation.id);
    setCancelOpen(false);
    setCancelDoneOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-8">
      {/* 헤더 */}
      <AppHeader title="예약상세" showHome />

      {/* 1. 상품 정보 헤더 — 현장결제 badge + 골프장 + 상태 */}
      <div className="bg-white px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0 flex-1">
            <span
              className="inline-block px-2 py-0.5 bg-[#F0F2F5] text-[#535D67] rounded-[4px] mb-1.5"
              style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.2px' }}
            >
              {isPrepay ? '선결제' : '현장결제'}
            </span>
            <h2
              className="text-[#272833] leading-tight"
              style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}
            >
              {course?.name}
            </h2>
            {plan?.name && (
              <p
                className="text-[#6A7683] leading-snug mt-1"
                style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}
              >
                {plan.name}
              </p>
            )}
            <p
              className="text-[#9EABBA] leading-snug mt-0.5"
              style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.2px' }}
            >
              {plan?.courseName} · {plan?.roundCode === '18H' ? '18홀' : plan?.roundCode}
            </p>
          </div>
          <span
            className={`flex-shrink-0 mt-7 ${isCancelled ? 'text-[#EA5656]' : 'text-[#1AB277]'}`}
            style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.2px' }}
          >
            {isCancelled ? '예약취소' : '예약완료'}
          </span>
        </div>
        <div className="mb-4" />

        {/* 라운드 일자 + 티타임 큰 카드 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#F9FAFB] border border-[#E6EBF0] rounded-[8px] py-3 px-3 text-center">
            <p className="text-[#448FFF] mb-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}>라운드 일자</p>
            <p className="text-[#272833]" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>
              {reservation.playDate.replaceAll('-', '.')}
            </p>
          </div>
          <div className="bg-[#F9FAFB] border border-[#E6EBF0] rounded-[8px] py-3 px-3 text-center">
            <p className="text-[#448FFF] mb-1" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.2px' }}>티타임</p>
            <p className="text-[#272833]" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>
              {reservation.teeTime}
            </p>
          </div>
        </div>

      </div>

      {/* 3. 결제 정보 */}
      <div className="h-2 bg-[#F0F2F5]" />
      <div className="bg-white px-5 py-5">
        <h3 className="text-[#272833] mb-3" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>결제 정보</h3>
        <DetailRow label="결제 방법" value={isPrepay ? '카드/카카오페이 등' : '현장결제'} bold />
        <DetailRow
          label="1인 결제금액"
          value={formatJpy(Math.round(reservation.paidAmount / Math.max(1, reservation.totalPlayer)))}
        />
        <div className="flex items-center justify-between pt-3">
          <span className="text-[#272833]" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>
            총 {isPrepay ? '결제' : '현장 결제'}금액
          </span>
          <div className="text-right">
            <p className="text-[#1AB277]" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px' }}>
              {formatJpy(reservation.paidAmount)}
            </p>
            <p className="text-[#9EABBA] mt-0.5" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.2px' }}>
              <KrwHint text={formatKrw(totalKrw)} />
            </p>
          </div>
        </div>
      </div>

      {/* 4. 취소 정보 */}
      <div className="h-2 bg-[#F0F2F5]" />
      <div className="bg-white px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[#272833]" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>취소 정보</h3>
          <button className="-m-1 p-1 text-[#535D67] underline" style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}>
            위약규정보기
          </button>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-[#6A7683]" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}>
            취소 가능기한
          </span>
          <span className="text-[#EA5656]" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}>
            {fmtCancelDeadline(cancelDeadline)}
          </span>
        </div>
        <div className="mt-3 p-3 bg-[#FCECEC] rounded-[8px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#EA5656] flex-shrink-0 mt-0.5" />
          <p className="text-[#EA5656] leading-relaxed" style={{ fontSize: 12, fontWeight: 500, letterSpacing: '-0.2px' }}>
            취소 가능 기한 이후 취소 시 골프장별 위약금 및 위약사항이 발생할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 5. 바우처 (예약확인서) — 취소 안된 건만 */}
      {!isCancelled && (
        <>
          <div className="h-2 bg-[#F0F2F5]" />
          <div className="bg-white px-5 py-5">
            <div className="border-2 border-dashed border-[#BFF0DB] rounded-[8px] overflow-hidden">
              <div className="bg-[#1AB277] px-4 py-3 text-center">
                <h3 className="text-white font-bold text-sm">카카오골프예약 해외투어 예약확인서</h3>
              </div>
              <div className="bg-white p-4">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">예약번호</span>
                    <span className="font-mono font-semibold">{reservation.reservationCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">골프장</span>
                    <span className="font-medium text-right">
                      {course?.nameLocal}
                      <br />
                      <span className="text-[#9EABBA] text-xs">({course?.name})</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">날짜</span>
                    <span className="font-medium">{reservation.playDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">티타임</span>
                    <span className="font-medium">{reservation.teeTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">플랜</span>
                    <span className="font-medium text-right">{plan?.nameLocal || plan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">내장 인원</span>
                    <span className="font-medium">{reservation.totalPlayer}名</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">예약자</span>
                    <span className="font-medium">{reservation.nameEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">이메일</span>
                    <span className="font-medium">{reservation.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9EABBA]">휴대전화번호</span>
                    <span className="font-medium">{reservation.phone}</span>
                  </div>
                  {reservation.players.length > 0 && reservation.players.map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-[#9EABBA]">동반자 {i + 1}</span>
                      <span className="font-medium">{p.nameEn}</span>
                    </div>
                  ))}
                </div>

                {/* QR 코드 mock */}
                <div className="flex items-center justify-center py-4 border-t border-[#E6EBF0]">
                  <div className="w-32 h-32 bg-[#F0F2F5] rounded-[8px] flex items-center justify-center border border-[#E6EBF0]">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-[#9EABBA] mx-auto mb-1" />
                      <span className="text-[10px] text-[#9EABBA]">QR코드</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-3 py-3 bg-[#1AB277] text-white rounded-[8px] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#149867] transition-colors">
              <Download className="w-4 h-4" />
              바우처 다운로드 (PDF)
            </button>
          </div>

          {/* 체크인 안내 */}
          <div className="bg-white px-5 pb-5">
            <div className="rounded-[8px] border border-[#E6EBF0] p-4">
              <h3 className="text-sm font-semibold text-[#272833] mb-2">체크인 안내</h3>
              <p className="text-xs text-[#6A7683] leading-relaxed">
                골프장 프론트에서 바우처(PDF 또는 화면)를 제시해주세요.
                영문 이름과 예약번호로 확인됩니다.
                알림톡과 나의 예약에서 언제든지 확인할 수 있어요.
              </p>
            </div>
          </div>
        </>
      )}

      {/* 유의사항 진입점 (바텀시트) */}
      <div className="bg-white px-5 pb-5">
        <button
          type="button"
          onClick={() => setNoticeOpen(true)}
          className="w-full flex items-center justify-between rounded-[8px] border border-[#E6EBF0] px-4 py-3.5 text-left hover:bg-[#F9FAFB] transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#272833] tracking-[-0.2px]">
            <Info className="w-4 h-4 text-[#6A7683]" />
            유의사항
          </span>
          <ChevronRight className="w-4 h-4 text-[#9EABBA]" />
        </button>
      </div>

      {/* 6. 하단 액션 — 예약취소 (다가오는 ACTIVE 예약만) */}
      {canCancel && (
        <div className="bg-white px-5 py-5 mt-2">
          <button
            onClick={() => setCancelOpen(true)}
            className="w-full py-3.5 rounded-[8px] bg-[#535D67] text-white"
            style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px' }}
          >
            {isCancelRequestOnly ? '예약 취소 신청' : '예약취소'}
          </button>
        </div>
      )}

      {/* 취소 확인 모달 */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-[360px] rounded-[8px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[16px]">
              <AlertTriangle className="w-5 h-5 text-[#EA5656]" />
              {isCancelRequestOnly ? '예약 취소 신청을 진행할까요?' : '예약을 취소하시겠습니까?'}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#6A7683]">
              {isCancelRequestOnly
                ? '취소가능기한이 지나 즉시 취소가 불가합니다. 카카오골프예약 고객센터로 예약 취소 신청이 접수돼요.'
                : '현장결제 상품이라 환불 대상 금액은 없으며, 라운드 일정만 취소돼요.'}
            </DialogDescription>
          </DialogHeader>
          {isCancelRequestOnly ? (
            <div className="bg-[#FCECEC] border border-[#F4D4D4] rounded-[8px] p-3 mb-2">
              <p className="text-[14px] font-bold text-[#EA5656]">취소 정책에 따라 패널티 또는 위약금이 발생할 수 있어요</p>
            </div>
          ) : (
            <div className="bg-[#F2FDF7] border border-[#E0F7ED] rounded-[8px] p-3 mb-2">
              <p className="text-[14px] font-bold text-[#149867]">취소가능기한 내 — 위약금 없음</p>
            </div>
          )}
          <p className="text-[12px] text-[#9EABBA] mb-4">
            {isCancelRequestOnly
              ? '신청 후 영업일 기준 1~2일 내 안내 드립니다.'
              : '현장에서 결제하는 상품이라 환불 처리는 발생하지 않습니다.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCancelOpen(false)}
              className="flex-1 py-3 border border-[#D9E0E8] rounded-[8px] text-[14px] font-medium text-[#6A7683] hover:bg-[#F9FAFB]"
            >
              {isCancelRequestOnly ? '닫기' : '취소 안 함'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-3 bg-[#EA5656] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#D04040]"
            >
              {isCancelRequestOnly ? '예약 취소 신청' : '예약 취소'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 취소 완료 알림 */}
      <Dialog
        open={cancelDoneOpen}
        onOpenChange={(o) => {
          setCancelDoneOpen(o);
          // 즉시 취소건은 확인 후 예약내역으로 이동
          if (!o && cancelDoneVariant === 'immediate') {
            navigate('/my-reservations');
          }
        }}
      >
        <DialogContent className="sm:max-w-[360px] rounded-[8px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] text-[#272833]">
              {cancelDoneVariant === 'request' ? '예약 취소 신청이 접수되었어요' : '예약이 취소되었어요'}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#6A7683] leading-relaxed">
              {cancelDoneVariant === 'request'
                ? '카카오골프예약 고객센터에서 영업일 기준 1~2일 내 안내 드릴게요. 처리 결과는 알림톡으로 전달됩니다.'
                : '취소 내역은 "해외 골프 예약 내역 > 취소내역"에서 확인하실 수 있어요.'}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => {
              setCancelDoneOpen(false);
              navigate('/my-reservations');
            }}
            className="w-full py-3 bg-[#1AB277] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#149867]"
          >
            예약 내역으로 이동
          </button>
        </DialogContent>
      </Dialog>
      {/* 유의사항 바텀시트 (번역/원문 토글) */}
      <PlanNoticeSheet open={noticeOpen} onOpenChange={setNoticeOpen} notice={course?.notice} />

      <LegalFooter />
    </div>
  );
}

/* ── 라벨/값 행 — 디자인 시스템 톤 ── */
function DetailRow({
  label, value, subValue, bold = false, mono = false,
}: { label: string; value: string; subValue?: ReactNode; bold?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[#6A7683] flex-shrink-0" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.2px' }}>
        {label}
      </span>
      <div className="text-right">
        <span
          className={`text-[#272833] ${mono ? 'font-mono' : ''}`}
          style={{ fontSize: 14, fontWeight: bold ? 700 : 500, letterSpacing: '-0.2px' }}
        >
          {value}
        </span>
        {subValue && (
          <p className="text-[#9EABBA] mt-0.5" style={{ fontSize: 11, fontWeight: 500 }}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}
