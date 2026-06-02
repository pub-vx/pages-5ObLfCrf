import { useParams, useNavigate } from 'react-router';
import { CheckCircle, Download, ChevronRight, QrCode } from 'lucide-react';
import { useAppState } from '../data/store';
import { getCourseById, getPlanById } from '../data/mockData';
import { LegalFooter } from './LegalFooter';

/**
 * 결제/예약 완료 직후에만 노출되는 축하 + 바우처 페이지.
 * CheckoutPage에서 예약 접수 후 navigate(`/booked/:id`) 로 진입.
 * 예약내역에서 들어가는 상세보기는 /complete/:id (CompletePage).
 */
export function BookedPage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { reservations } = useAppState();

  const reservation = reservations.find(r => r.id === reservationId);

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

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-8">
      {/* 완료 배너 */}
      <div className="bg-gradient-to-b from-[#F2FDF7] to-white px-4 pt-12 pb-6 text-center">
        <CheckCircle className="w-16 h-16 text-[#1AB277] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#272833] mb-1">예약이 완료되었습니다</h1>
        <p className="text-sm text-[#9EABBA]">
          예약번호: <span className="font-mono font-semibold text-[#535D67]">{reservation.reservationCode}</span>
        </p>
      </div>

      {/* 바우처 */}
      <div className="mx-4 mb-4">
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
                <span className="text-[#9EABBA]">인원</span>
                <span className="font-medium">{reservation.totalPlayer}名</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9EABBA]">예약자</span>
                <span className="font-medium">{reservation.nameEn}</span>
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
      <div className="bg-white mx-4 rounded-[8px] border border-[#E6EBF0] p-4 mb-4">
        <h3 className="text-sm font-semibold text-[#272833] mb-2">체크인 안내</h3>
        <p className="text-xs text-[#6A7683] leading-relaxed">
          골프장 프론트에서 바우처(PDF 또는 화면)를 제시해주세요.
          영문 이름과 예약번호로 확인됩니다.
          알림톡과 나의 예약에서 언제든지 확인할 수 있어요.
        </p>
      </div>

      {/* 일본 골프 처음이라면 — 에티켓 가이드 페이지로 랜딩 */}
      <button
        onClick={() => navigate('/beginner-guide')}
        className="mx-4 mb-4 w-[calc(100%-2rem)] flex items-center justify-between px-4 py-3 bg-[#FFF8E1] border border-[#FFC93D] rounded-[8px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="text-sm font-medium text-[#E08D10]">
            일본 골프장 에티켓, 출발 전에 확인하세요
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#F5A623]" />
      </button>

      {/* 나의 예약 이동 */}
      <div className="px-4">
        <button
          onClick={() => navigate('/my-reservations')}
          className="w-full py-3 border-2 border-[#D9E0E8] rounded-[8px] text-sm font-semibold text-[#535D67] hover:bg-[#F9FAFB] transition-colors"
        >
          나의 예약에서 확인
        </button>
      </div>
      <LegalFooter />
    </div>
  );
}
