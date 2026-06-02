import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AppHeader } from './AppHeader';

interface GuideStep {
  num: number;
  title: string;
  body: React.ReactNode;
}

const STEPS: GuideStep[] = [
  {
    num: 1,
    title: '"플랜"이 뭐에요?',
    body: (
      <>
        <p>한국은 그린피+카트비를 따로 내지만,</p>
        <p>일본은 식사·카트·캐디를 묶어 하나의 <b>"플랜"</b>으로 판매해요.</p>
        <p className="mt-2 text-[#9EABBA]">→ 포함사항만 확인하면 추가 비용 걱정 끝!</p>
      </>
    ),
  },
  {
    num: 2,
    title: '초보자도 괜찮은 골프장이 있어요!',
    body: (
      <>
        <p>검색할 때 "🔰 초보자 친화" 필터를 켜면,</p>
        <p>쉬운 코스·여성 티·식사 포함 골프장만 볼 수 있어요.</p>
      </>
    ),
  },
  {
    num: 3,
    title: '드레스코드 꼭 확인!!',
    body: (
      <>
        <p>일본 골프장은 옷차림 규정이 엄격해요.</p>
        <ul className="mt-1 space-y-0.5 list-disc list-inside">
          <li>클럽하우스: 카라 있는 상의 + 긴바지</li>
          <li>코스: 카라 있는 상의 + 반바지 OK</li>
          <li>청바지, 샌들 절대 ✕</li>
        </ul>
      </>
    ),
  },
  {
    num: 4,
    title: '취소도 간편해요',
    body: (
      <>
        <p>예약 전에 취소 정책을 미리 확인할 수 있어요.</p>
        <p>보통 <b>7일 전까지 무료 취소</b>가 가능합니다.</p>
      </>
    ),
  },
  {
    num: 5,
    title: '💰 총 비용, 미리 계산해보세요!',
    body: (
      <>
        <p>그린피 외에도 교통비·식비·캐디비 등이 있어요.</p>
        <p><b>총 비용 시뮬레이터</b>로 1인당 예상 비용을 미리 확인할 수 있습니다.</p>
      </>
    ),
  },
];

export function BeginnerGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col pb-28">
      {/* 헤더 */}
      <AppHeader title="일본 골프 처음이라면" showHome border={false} zIndex={30} />

      {/* 인트로 */}
      <div className="flex flex-col items-center pt-10 pb-8 px-6">
        <div className="text-5xl mb-4" aria-hidden>📗</div>
        <h2 className="text-xl font-bold text-[#272833]">3분이면 준비 끝!</h2>
        <p className="mt-1 text-sm text-[#6A7683]">일본 골프 예약, 어렵지 않아요</p>
      </div>

      {/* 5단계 가이드 */}
      <div className="px-5 space-y-5">
        {STEPS.map(step => (
          <div key={step.num} className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1AB277] text-white text-sm font-bold flex items-center justify-center">
              {step.num}
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-sm font-bold text-[#272833] mb-1">{step.title}</h3>
              <div className="text-[13px] text-[#6A7683] leading-relaxed">{step.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA 플로팅 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-[430px] px-4 pb-4 pointer-events-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 h-12 bg-[#1AB277] hover:bg-[#149867] text-white text-sm font-bold rounded-[8px] shadow-lg"
          >
            골프장 검색하러 가기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
